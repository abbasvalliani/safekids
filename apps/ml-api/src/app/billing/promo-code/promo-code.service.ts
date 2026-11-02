import {Inject, Injectable, NotFoundException} from '@nestjs/common';
import {BillingService} from '../billing.service';
import {PromoCode} from './entities/promo-code.entity';
import {UserService} from '../../user/user.service';
import {ConfigService} from '@nestjs/config';
import {PROMO_CODE_REPOSITORY} from '../../constants';
import {PromotionCodeDto} from '../plan/dto/promotionCode.dto';
import {CreatePromoCodeDto} from './dto/create-promo-code.dto';
import {CommonUtils} from '../../utils/commonUtils';
import {Account} from '../../accounts/entities/account.entity';
import {PromoCodeErrors} from './promo-code.errors';
import {LoggingService} from '../../logger/logging.service';
import {AccountService} from '../../accounts/account.service';
import {Op} from 'sequelize';
import Stripe from 'stripe';
import {SubscriptionService} from '../subscription/subscription.service';
import {CouponService} from '../coupon/coupon.service';
import {CreateSubscriptionDto} from '../subscription/dto/createSubscriptionDto';
import {PromoCodeDto} from './dto/promo-code.dto';
import {WebAppConfig} from "../../config/webapp";

@Injectable()
export class PromoCodeService {
  private readonly WEB_URL: string;
  private readonly PROMO_CODE_URI: string = 'p/c';

  constructor(
    private readonly config: ConfigService,
    private readonly billingService: BillingService,
    @Inject(PROMO_CODE_REPOSITORY) private readonly promoCodeRepository: typeof PromoCode,
    private readonly userService: UserService,
    private readonly accountService: AccountService,
    private readonly couponService: CouponService,
    private readonly subscriptionService: SubscriptionService,
    private readonly logger: LoggingService
  ) {
    this.WEB_URL = this.config.get<WebAppConfig>('webAppConfig').url;
  }

  /* find promotion code details
   * @param promotionCode
   */
  async findCodeDetails(promotionCode: string): Promise<PromotionCodeDto> {
    return await this.billingService.fetchPromotionCodeByName(promotionCode);
  }

  async delete(accountId: string): Promise<void> {
    await this.promoCodeRepository.destroy({where: {accountId}, force: true});
  }

  /**
   * Generate Promotion Code Link
   * @param userId
   * @param accountId
   */
  async getPromotionCodeLink(userId: string, accountId: string): Promise<PromoCodeDto> {
    const account = await this.accountService.findOne(accountId);
    const promoCode: PromoCode = await this.findPromoCodeByAccount(accountId);
    if (promoCode) {
      return {
        timesRedeemed: promoCode.times_redeemed,
        code: promoCode.code,
      } as PromoCodeDto;
    }
    let tries = 0;
    let promoCodeDto: PromoCodeDto = undefined;

    try {
      promoCodeDto = await this.createPromotionCode(account, userId);
    } catch (e) {
      this.logger.error(`${PromoCodeErrors.failed()} for account[${accountId}] - ${e}`);
      if (tries++ < 5) {
        promoCodeDto = await this.createPromotionCode(account, userId);
      }
    }
    if (!promoCodeDto) {
      this.logger.error(`${PromoCodeErrors.failed()} for account[${accountId}]`);
      throw new Error(PromoCodeErrors.failed());
    }
    return promoCodeDto;
  }

  /**
   * find promotion codes for account which are active and not expired
   * @param accountId
   * @private
   */
  private async findPromoCodeByAccount(accountId: string): Promise<PromoCode> {
    return await this.promoCodeRepository.findOne({where: {accountId, active: true}, order: [['created_at', 'DESC']]});
  }

  /**
   * Generate promotion code and persist
   * @param account
   * @param userId
   */
  async createPromotionCode(account: Account, userId: string): Promise<PromoCodeDto> {
    const code = await this.generateUniqueCode();
    const coupon = await this.couponService.findActiveCoupon();

    if (!coupon) {
      throw new NotFoundException(PromoCodeErrors.activeCouponNotFound());
    }
    let promoCode: PromotionCodeDto;

    try {
      promoCode = await this.billingService.generatePromoCode(account.id, account.stripeCustomerId, code, coupon.id);
      if (!promoCode) {
        throw new Error(PromoCodeErrors.failedToGenerate());
      }

      const promoCodeInstance = {
        accountId: account.id,
        active: promoCode.active,
        apiKey: promoCode.apiKey,
        code: promoCode.code,
        coupon: promoCode.coupon,
        times_redeemed: promoCode.times_redeemed,
        createdBy: userId,
        expiresAt: new Date(promoCode.expiresAt),
        stripeCustomerId: account.stripeCustomerId,
        updatedBy: userId,
      } as CreatePromoCodeDto;
      if (promoCode.expiresAt) {
        promoCodeInstance.expiresAt = new Date(promoCode.expiresAt);
      }
      await this.promoCodeRepository.create(promoCodeInstance);
      this.logger.debug(`promo code[${promoCode.code}] saved successfully.`);
    } catch (e) {
      if (!promoCode) {
        throw e
      }
      //revert promo code creation
      this.billingService
        .deletePromoCode(promoCode.apiKey)
        .then(() => {
          this.logger.debug(`Promo code [${code}] deactivated.`);
        })
        .catch((error) => {
          this.logger.error(`Failed to deactivate promo code [${code}].`);
          throw error;
        });
      throw e;
    }
    return {
      timesRedeemed: promoCode.times_redeemed,
      code: promoCode.code,
    } as PromoCodeDto;
  }

  private async generateUniqueCode() {
    let isUniqueCode = false;
    let code = '';
    while (!isUniqueCode) {
      code = await CommonUtils.generate6DigitAlphanumericCode();

      const codeExists = await this.promoCodeRepository.findOne({where: {code}});
      if (!codeExists) {
        isUniqueCode = true;
      }
    }
    return code;
  }

  /** Apply promotion code to existing subscription
   * @param accountId
   * @param promotionCode promotion code to be applied.
   * @returns void
   */
  async applyPromotionCode(accountId: string, promotionCode?: string): Promise<void> {
    const subscription = await this.subscriptionService.findOneByAccountId(accountId);
    await this.billingService.applyPromotionCode(subscription.id, promotionCode);
  }

  /**
   * Activate promotion code on subscription after first payment is done.
   * @param subscriptionId
   */
  async activatePromotionCode(subscriptionId: string): Promise<void> {
    const subscription = await this.billingService.fetchSubscription(subscriptionId);

    if (!subscription) {
      throw new NotFoundException(`Subscription[${subscriptionId}] not found.`);
    }
    const metadata: Stripe.Metadata = subscription.metadata;
    const promotionCodeName = metadata['promotionCode'];

    this.logger.debug(`Promotion Code[${promotionCodeName}] found for subscription[${subscriptionId}]`);

    // fetchSubscription expands discounts; any discount (coupon or promotion code) counts.
    if (promotionCodeName && !subscription.discounts?.length) {
      this.logger.debug(`Activating Promotion Code[${promotionCodeName}] on subscription[${subscriptionId}]`);
      await this.billingService.applyPromotionCode(subscriptionId, promotionCodeName);
    } else {
      this.logger.debug(`Subscription has no promotion code.`);
    }
  }

  /**
   * Update promo code.
   * @param response
   */
  async updatePromoCode(response: Stripe.PromotionCode): Promise<void> {
    const objToUpdate: CreatePromoCodeDto = {
      active: response.active,
      times_redeemed: response.times_redeemed,
      expiresAt: new Date(response.expires_at),
    };
    if (response.expires_at) {
      objToUpdate.expiresAt = new Date(response.expires_at);
    }

    await this.promoCodeRepository.update(objToUpdate, {
      where: {
        apiKey: response.id,
        code: response.code,
      },
    });
  }
}
