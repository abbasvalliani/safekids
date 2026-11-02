import {BillingService} from '../billing.service';
import {Inject, Injectable} from '@nestjs/common';
import {SubscriptionDto} from './dto/subscription.dto';
import {CreateSubscriptionDto} from './dto/createSubscriptionDto';
import {AccountService} from '../../accounts/account.service';
import {CustomerService} from '../customer/customer.service';
import {PlanService} from '../plan/plan.service';
import {SEQUELIZE, SUBSCRIPTION_REPOSITORY} from '../../constants';
import {Subscription} from './entities/subscription.entity';
import Stripe from 'stripe';
import { discountCoupon, firstDiscount, hasUnexpandedDiscounts, subscriptionPeriod } from '../stripe.utils';
import { v4 as uuidv4 } from 'uuid';
import {EmailTemplates} from '../../email/email.templates';
import {EmailService} from '../../email/email.service';
import {UserService} from '../../user/user.service';
import {LoggingService} from '../../logger/logging.service';
import {Sequelize} from 'sequelize-typescript';
import {SubscriptionFeedbackService} from '../subscription-feedback/subscription-feedback.service';
import {SubscriptionFeedbackDto} from '../subscription-feedback/dto/subscription-feedback-dto';
import {Cron} from '@nestjs/schedule';
import {DateUtils} from "../../utils/dateUtils"
import {QueryTypes} from 'sequelize';
import {EmailInterface} from '../../email/email.interfaces';
import {Plan} from '../plan/entities/plan.entity';


@Injectable()
export class SubscriptionService {
  constructor(
    private readonly billingService: BillingService,
    private readonly accountService: AccountService,
    private readonly userService: UserService,
    private readonly customerService: CustomerService,
    private readonly planService: PlanService,
    private readonly emailService: EmailService,
    private readonly logger: LoggingService,
    @Inject(SUBSCRIPTION_REPOSITORY) private readonly repository: typeof Subscription,
    @Inject(SEQUELIZE) private readonly sequelize: Sequelize,
    private readonly subscriptionFeedbackService: SubscriptionFeedbackService
  ) {
  }

  //////////////////////////STRIPE OPERATIONS///////////////////////////////////

  /** Creates subscription in stripe for given plan id
   * and triggers "customer.subscription.created" webhook
   * @param accountId
   * @param planId
   * @param promotionCodeName promotion code to apply discount (optional)
   * @param trialPeriod (optional)
   * @returns void
   */
  async createStripeSubscription(accountId: string, planId: string, promotionCodeName?: string, trialPeriod?: number): Promise<void> {
    const account = await this.accountService.findOne(accountId);
    const plan = await this.planService.findOne(planId);
    const dto = {
      accountId,
      stripeCustomerId: account.stripeCustomerId,
      trailPeriod: trialPeriod ? trialPeriod : plan.trialPeriod,
      priceId: plan.priceId,
      metaData: {
        planId: plan.id,
        accountId,
      },
    } as SubscriptionDto;

    if (promotionCodeName) {
      const promotionCode = await this.billingService.fetchPromotionCodeByName(promotionCodeName);
      dto.promotionCodeId = promotionCode.id;
      dto.metaData.promotionCode = promotionCodeName;
    }

    await this.billingService.createSubscription(dto);
  }

  /** Updates subscription in stripe for given plan id
   * and triggers "customer.subscription.updated" webhook
   * @param accountId
   * @param planId
   * @param promotionCodeName
   * @returns void
   */
  async updateStripeSubscription(accountId: string, planId: string, promotionCodeName?: string): Promise<void> {
    const subscription = await this.findOneByAccountId(accountId);

    // CUSTOMER NEVER SUBSCRIBED TO ANY PLAN
    // means create new customer and subscribe to selected plan
    if (!subscription) {
      const account = await this.accountService.findOne(accountId);
      const stripeCustomerId = await this.customerService.createCustomer(accountId, account.primaryDomain, account.name);
      await this.accountService.update(accountId, {stripeCustomerId});
      await this.createStripeSubscription(accountId, planId, promotionCodeName);
      return;
    }

    // CUSTOMER IS SWITCHING PLAN
    const plan = await this.planService.findOne(planId);
    const dto = {
      id: subscription.id,
      priceId: plan.priceId,
      cancelAtPeriodEnd: false, //if subscription was scheduled to delete at end period then update it to false
      metaData: {
        planId: plan.id,
        accountId,
      },
    } as SubscriptionDto;

    if (promotionCodeName) {
      const promotionCodes = await this.billingService.fetchPromotionCodeByName(promotionCodeName);
      dto.promotionCodeId = promotionCodes.id;
      dto.metaData.promotionCode = promotionCodeName;
    }

    await this.billingService.updateSubscription(dto);
  }

  /** Apply promotion code to existing subscription
   * @param accountId
   * @param promotionCode promotion code to be applied.
   * @returns void
   */
  async applyPromotionCode(accountId: string, promotionCode?: string): Promise<void> {
    const subscription = await this.findOneByAccountId(accountId);
    await this.billingService.applyPromotionCode(subscription.id, promotionCode).catch((e) => {
      this.logger.error(`Failed to apply promotion code[${promotionCode}] to account [${accountId}]`);
      throw e;
    });
  }

  /** Cancel subscription when period ends
   * and triggers "customer.subscription.updated" webhook
   * with cancel_at_period_end field as true
   * @param dto
   * @returns void
   */
  async cancelSubscriptionAtPeriodEnd(dto: SubscriptionFeedbackDto): Promise<void> {
    let transaction;
    try {
      transaction = await this.sequelize.transaction();
      const subscription = await this.findOneByAccountId(dto.accountId);
      await this.billingService.cancelSubscriptionAtPeriodEnd(subscription.id);
      await this.subscriptionFeedbackService.create(dto);
      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }

  async findOneByAccountId(accountId: string): Promise<Subscription> {
    return await this.repository.findOne({where: {accountId}});
  }

  async getSubscriptionPlanByAccountId(accountId: string): Promise<any> {
    const subscription = await this.repository.findOne({where: {accountId}, include: [{model: Plan}]});
    if (!subscription) {
      return null;
    }
    return subscription.plan;
  }

  async update(id: string, objToUpDate = {}): Promise<void> {
    await this.repository.update(objToUpDate, {where: {id}});
  }

  //////////////////////////DATABASE OPERATIONS///////////////////////////////////

  /** Webhook payloads carry discount ids only; re-read the subscription to get them expanded. */
  private async withDiscounts(response: Stripe.Subscription): Promise<Stripe.Subscription> {
    return hasUnexpandedDiscounts(response) ? await this.billingService.fetchSubscription(response.id) : response;
  }

  async saveSubscription(response: Stripe.Subscription): Promise<void> {
    const discount = firstDiscount(await this.withDiscounts(response));
    const promotionCode = await this.billingService.getPromotionCode(discount?.promotion_code);
    const period = subscriptionPeriod(response);

    const subscription = {
      id: response.id,
      planId: response.metadata.planId,
      status: response.status,
      trialStartTime: new Date(response.trial_start * 1000),
      trialEndTime: new Date(response.trial_end * 1000),
      subscriptionStartTime: new Date(period.start * 1000),
      subscriptionEndTime: new Date(period.end * 1000),
      trialUsed: true,
      accountId: response.metadata.accountId,
      cancelAtPeriodEnd: response.cancel_at_period_end,
      coupon: discountCoupon(discount)?.name,
      promotionCode,
    } as CreateSubscriptionDto;
    await this.repository.create(subscription);
  }

  async updateSubscription(subscriptionRequest: string | Stripe.Subscription): Promise<void> {
    let response: Stripe.Subscription;

    if (typeof subscriptionRequest === 'string') {
      response = await this.billingService.fetchSubscription(subscriptionRequest as string);
    } else {
      response = subscriptionRequest as Stripe.Subscription;
    }

    const discount = firstDiscount(await this.withDiscounts(response));
    const promotionCode = await this.billingService.getPromotionCode(discount?.promotion_code);
    const period = subscriptionPeriod(response);

    const objToUpdate = {
      id: response.id,
      planId: response.metadata.planId,
      status: response.status,
      trialStartTime: new Date(response.trial_start * 1000),
      trialEndTime: new Date(response.trial_end * 1000),
      subscriptionStartTime: new Date(period.start * 1000),
      subscriptionEndTime: new Date(period.end * 1000),
      trialUsed: true,
      default_payment_method: response.default_payment_method,
      accountId: response.metadata.accountId,
      cancelAtPeriodEnd: response.cancel_at_period_end,
      coupon: discountCoupon(discount)?.name,
      promotionCode,
    } as CreateSubscriptionDto;

    await this.update(response.id, objToUpdate);
    await this.accountService.update(response.metadata.accountId, {notifyExpiredExtension: false});
  }

  async deleteCancelledSubscription(response: Stripe.Subscription): Promise<void> {
    let transaction;
    try {
      transaction = await this.sequelize.transaction();
      const account = await this.accountService.findOne(response.metadata.accountId);
      await this.repository.destroy({where: {id: response.id, accountId: account.id}, force: true});
      await this.accountService.update(response.metadata.accountId, {notifyExpiredExtension: false});
      await this.subscriptionFeedbackService.delete(response.metadata.accountId, true);
      await this.sendSubscriptionExpiredEmail(response);
      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      this.logger.error(e);
    }
  }

  async extendSubscription(id: string) {
    const subscription = await this.billingService.fetchSubscription(id);
    const period = subscriptionPeriod(subscription);
    const subscriptionDTO = {
      subscriptionStartTime: new Date(period.start * 1000),
      subscriptionEndTime: new Date(period.end * 1000),
      status: subscription.status,
    };

    return await this.repository.update(subscriptionDTO, {where: {id: subscription.id}});
  }

  async handleTrialEndEvent(subscription: Stripe.Subscription) {
    const savedSubscription = await this.repository.findOne({where: {id: subscription.id}});
    const account = savedSubscription.account;
    const user = await this.userService.findOneByEmail(account.primaryDomain);
    await this.emailService.sendEmail({
      id: uuidv4(),
      useSupportEmail: true,
      meta: {
        name: `${user.firstName} ${user.lastName}`,
        trialEndDate: savedSubscription.trialEndTime,
      },
      to: account.primaryDomain,
      content: {
        templateName: EmailTemplates.TRIAL_ENDS,
      },
    });
  }

  async sendSubscriptionExpiredEmail(response: Stripe.Subscription): Promise<void> {
    const account = await this.accountService.findOne(response.metadata.accountId);
    const user = await this.userService.findOneByEmail(account.primaryDomain);
    await this.emailService.sendEmail({
      id: uuidv4(),
      useSupportEmail: true,
      meta: {
        parentName: `${user.firstName} ${user.lastName}`,
      },
      to: user.email,
      content: {
        templateName: EmailTemplates.BILLING_SUBSCRIPTION_EXPIRED,
      },
    });
  }

  async sendPaymentFailedEmail(subscription: Stripe.Subscription): Promise<void> {
    const savedSubscription = await this.repository.findOne({where: {id: subscription.id}});
    const account = savedSubscription.account;
    const user = await this.userService.findOneByEmail(account.primaryDomain);
    await this.emailService.sendEmail({
      id: uuidv4(),
      useSupportEmail: true,
      meta: {
        name: `${user.firstName} ${user.lastName}`,
      },
      to: user.email,
      content: {
        templateName: EmailTemplates.BILLING_PAYMENT_FAILED,
      },
    });
  }

  async delete(accountId: string): Promise<void> {
    await this.repository.destroy({where: {accountId}, force: true});
  }

  //will run every day at 12:00 AM
  @Cron('0 0 0 * * *')
  async subscriptionCancelOrRenewJob(): Promise<void> {
    this.logger.info('CRON JOB STARTED TO Check Cancel Or Renew Job....', new Date());
    const tomorrowDate = DateUtils.addDays(new Date(), +1);
    const query =
      'select ' +
      'account_id, ' +
      'sub_end_time, ' +
      'cancel_at_period_end ' +
      'from ' +
      'subscription ' +
      'where ' +
      'date (sub_end_time) = date (:tomorrowDate);';
    const subscriptions = await this.repository.sequelize.query(query, {
      replacements: {tomorrowDate},
      type: QueryTypes.SELECT,
      mapToModel: true,
      model: Subscription,
    });
    if (subscriptions.length > 0) {
      for (const subscription of subscriptions) {
        const parent = await this.userService.findParentAccount(subscription.accountId);
        const emailInterface = {
          id: uuidv4(),
          useSupportEmail: true,
          meta: {
            parentName: `${parent.firstName} ${parent.lastName}`,
          },
          to: parent.email,
          content: {
            templateName: EmailTemplates.SUBSCRIPTION_CANCEL,
          },
        } as EmailInterface;

        if (subscription.cancelAtPeriodEnd) {
          await this.emailService.sendEmail(emailInterface);
        } else {
          emailInterface.content.templateName = EmailTemplates.SUBSCRIPTION_RENEW;
          await this.emailService.sendEmail(emailInterface);
        }
      }
    }
  }
}
