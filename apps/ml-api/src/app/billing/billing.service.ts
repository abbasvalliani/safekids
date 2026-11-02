import {LoggingService} from '../logger/logging.service';
import Stripe from 'stripe';
import {HttpException, HttpStatus, Injectable, NotFoundException} from '@nestjs/common';
import {SubscriptionDto} from './subscription/dto/subscription.dto';
import {StripeService} from './stripe.service';
import {PromotionCodeDto} from './plan/dto/promotionCode.dto';
import {discountsParam, promotionCoupon} from './stripe.utils';

@Injectable()
export class BillingService {
  fetchPromoCode(promotionCode: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  constructor(private readonly log: LoggingService, private readonly stripeService: StripeService) {
    this.log.className(BillingService.name);
  }

  //CUSTOMERS
  async createCustomer(accountId: string, email: string, name: string): Promise<string> {
    const {id} = await this.stripeService.client().customers.create({
      email,
      name,
      metadata: {accountId},
    });
    return id;
  }

  async updateCustomer(customerId: string, paymentMethodId: string): Promise<void> {
    await this.stripeService.client().customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
  }

  //SUBSCRIPTIONS
  async cancelSubscriptionAtPeriodEnd(id: string): Promise<void> {
    await this.stripeService.client().subscriptions.update(id, {cancel_at_period_end: true});
  }

  async createSubscription(dto: SubscriptionDto): Promise<void> {
    await this.stripeService.client().subscriptions.create({
      customer: dto.stripeCustomerId,
      metadata: dto.metaData,
      items: [
        {
          price: dto.priceId,
        },
      ],
      trial_period_days: dto.trailPeriod,
      discounts: discountsParam(undefined, dto.promotionCodeId),
    });
  }

  async fetchSubscription(id: string): Promise<Stripe.Subscription> {
    // discounts are ids unless expanded; their coupon sits under source.coupon.
    return await this.stripeService.client().subscriptions.retrieve(id, {
      expand: ['discounts', 'discounts.source.coupon'],
    });
  }

  async updateSubscription(dto: SubscriptionDto): Promise<void> {
    const subscription = await this.fetchSubscription(dto.id);
    await this.stripeService.client().subscriptions.update(dto.id, {
      metadata: dto.metaData,
      cancel_at_period_end: dto.cancelAtPeriodEnd,
      items: [
        {
          id: subscription.items.data[0].id,
          price: dto.priceId,
        },
      ],
      discounts: discountsParam(dto.coupon, dto.promotionCodeId),
    });
  }

  //PAYMENTS
  async createPaymentIntent(accountId: string, customerId: string): Promise<Stripe.SetupIntent> {
    return await this.stripeService.client().setupIntents.create({
      customer: customerId,
      usage: 'off_session',
      metadata: {
        accountId,
      },
    });
  }

  async getPaymentMethod(paymentMethodID: string): Promise<Stripe.PaymentMethod> {
    return await this.stripeService.client().paymentMethods.retrieve(paymentMethodID);
  }

  //PRODUCTS
  async productExists(productId: string, priceId: string): Promise<boolean> {
    const prod = await this.stripeService.client().products.retrieve(productId);
    return prod.id === productId && prod['default_price'] === priceId;
  }

  //WEBHOOK EVENTS
  constructEvent(body, sig: any, secret: string): Stripe.Event {
    const header = this.stripeService.client().webhooks.generateTestHeaderString({
      payload: body,
      secret,
    });
    const event = this.stripeService.client().webhooks.constructEvent(body, header, secret);
    return event;
  }

  //PROMOTION CODES
  async fetchPromotionCodeByName(code: string): Promise<PromotionCodeDto> {
    const codes: Stripe.ApiList<Stripe.PromotionCode> = await this.stripeService.client().promotionCodes.list({
      code,
      expand: ['data.promotion.coupon'],
    });
    if (codes && codes.data && codes.data.length > 0) {
      const promotionCode: Stripe.PromotionCode = codes.data[0];
      if (!promotionCode.active) {
        throw new NotFoundException(`Promotion Code[${code}] is not active.`);
      }
      const referrerAccountId = promotionCode.metadata['referrerAccountId'];
      return {
        id: promotionCode.id,
        active: promotionCode.active,
        expiresAt: promotionCode.expires_at,
        redeemBy: promotionCoupon(promotionCode)?.redeem_by,
        currency: promotionCoupon(promotionCode)?.currency,
        percentOff: promotionCoupon(promotionCode)?.percent_off,
        amountOff: promotionCoupon(promotionCode)?.amount_off,
        referrerAccountId: referrerAccountId,
      };
    }
    throw new HttpException('Promotion Code[${code}] not exists.', HttpStatus.BAD_REQUEST);
  }

  /**
   * Apply promotion code to subscription.
   * @param subscriptionId
   * @param promotionCodeName
   */
  async applyPromotionCode(subscriptionId: string, promotionCodeName: string): Promise<void> {
    const promotionCode = await this.fetchPromotionCodeByName(promotionCodeName).catch((e) => {
      throw e;
    });

    await this.stripeService.client().subscriptions.update(subscriptionId, {
      discounts: discountsParam(undefined, promotionCode.id),
      metadata: {referrer: promotionCode.referrerAccountId},
    });
    this.log.debug(`Promotion code[${promotionCodeName}] applied to subscription[${subscriptionId}]`);
  }

  /**
   * Generate new promotional code
   * @param accountId
   * @param customerId
   * @param code
   * @param coupon
   */
  async generatePromoCode(accountId: string, customerId: string, code: string, coupon: string): Promise<PromotionCodeDto> {
    const responseList: Stripe.ApiList<Stripe.PromotionCode> = await this.stripeService.client().promotionCodes.list({
      active: true,
      coupon,
      code,
      expand: ['data.promotion.coupon'],
    });
    if (responseList && responseList.data.length > 0) {
      return this.buildResponse(responseList.data[0]);
    }

    const promoCodeDto: Stripe.PromotionCodeCreateParams = {
      active: true,
      promotion: {type: 'coupon', coupon},
      code,
      restrictions: {first_time_transaction: true},
      expand: ['promotion.coupon'],
    };
    const response: Stripe.Response<Stripe.PromotionCode> = await this.stripeService.client().promotionCodes.create(promoCodeDto);
    if (response) {
      return this.buildResponse(response);
    }
    return null;
  }

  private buildResponse(response: Stripe.PromotionCode) {
    return {
      code: response.code,
      active: response.active,
      apiKey: response.id,
      coupon: promotionCoupon(response)?.name,
      expiresAt: response.expires_at,
      times_redeemed: response.times_redeemed,
    };
  }

  async getPromotionCode(promotionCode: string | Stripe.PromotionCode | undefined): Promise<string | null> {
    if (!promotionCode) {
      return null;
    }
    const promotionCodeId = typeof promotionCode === 'string' ? promotionCode : (promotionCode as Stripe.PromotionCode).id;
    const response: Stripe.PromotionCode = await this.stripeService.client().promotionCodes.retrieve(promotionCodeId);
    return response?.code;
  }

  async deletePromoCode(id: string): Promise<void> {
    await this.stripeService.client().promotionCodes.update(id, {
      active: false,
    });
  }

  //INVOICE
  // invoices.retrieveUpcoming was replaced by invoices.createPreview (basil).
  async getUpcomingInvoice(subscriptionId: string): Promise<Stripe.Invoice> {
    return await this.stripeService.client().invoices.createPreview({subscription: subscriptionId});
  }
}
