import { Test, TestingModule } from '@nestjs/testing';
import { BillingWebhookService } from './billing-webhook.service';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from '../../logger/logging.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { PaymentService } from '../payment/payment.service';
import { PromoCodeService } from '../promo-code/promo-code.service';
import { BillingService } from '../billing.service';
import { Stripe } from 'stripe';
import { InvoiceService } from '../invoice/invoice.service';
import { OrgUnitService } from '../../org-unit/org-unit.service';
class Fixture {
  static PaymentService = class {
    static sequelize = { query: jest.fn() };
    static create = Fixture.getMock();
  };

  static SubscriptionService = class {
    static extendSubscription = Fixture.getMock();
    static updateSubscriptionStatus = Fixture.getMock();
    static updateSubscription = Fixture.getMock();
    static sendPaymentFailedEmail = Fixture.getMock();
    static saveSubscription = Fixture.getMock();
    static deleteCancelledSubscription = Fixture.getMock();
    static handleTrialEndEvent = Fixture.getMock();
  };

  static OrgUnitService = class {
    static updateCategories = Fixture.getMock();
  };

  static Sequelize = class {
    static transaction = Fixture.getMock().mockResolvedValue({
      commit: jest.fn(),
      rollback: jest.fn(),
    });
  };

  static PromoCodeService = class {};

  static getMock() {
    return jest.fn();
  }

  static getLoggingService() {
    return {
      className: Fixture.getMock(),
      debug: Fixture.getMock(),
      info: Fixture.getMock(),
      error: Fixture.getMock(),
    };
  }

  static getConfigService = class {
    static _isDevelopment = Fixture.getMock().mockReturnValue(true);
    static get = Fixture.getMock().mockReturnValue({ gmailExtension: {} });
  };

  static getBillingService = class {
    static get = Fixture.getMock();
    static fetchPromotionCodeByName = Fixture.getMock();
    static generatePromoCode = Fixture.getMock();
    static applyPromotionCode = Fixture.getMock();
    static fetchSubscription = Fixture.getMock();
  };

  static InvoiceService = class {
    static handleInvoice = Fixture.getMock();
  };
}

const subscription: Stripe.Subscription = {
  application_fee_percent: undefined,
  billing_cycle_anchor: 0,
  billing_thresholds: undefined,
  cancel_at: undefined,
  cancel_at_period_end: false,
  canceled_at: undefined,
  collection_method: undefined,
  created: 0,
  current_period_end: 0,
  current_period_start: 0,
  customer: undefined,
  days_until_due: undefined,
  default_payment_method: undefined,
  default_source: undefined,
  discount: undefined,
  ended_at: undefined,
  id: 'subscription_id',
  items: undefined,
  latest_invoice: undefined,
  livemode: false,
  metadata: { accountId: 'accountId', planId: 'planId' },
  next_pending_invoice_item_invoice: undefined,
  object: 'subscription',
  pause_collection: undefined,
  pending_invoice_item_interval: undefined,
  pending_setup_intent: undefined,
  pending_update: undefined,
  schedule: undefined,
  start_date: 0,
  status: undefined,
  transfer_data: undefined,
  trial_end: undefined,
  trial_start: undefined,
};

describe('BillingWebhookService', () => {
  let service: BillingWebhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingWebhookService,
        {
          provide: ConfigService,
          useValue: Fixture.getConfigService,
        },
        {
          provide: LoggingService,
          useValue: Fixture.getLoggingService(),
        },
        {
          provide: PaymentService,
          useValue: Fixture.PaymentService,
        },
        {
          provide: PromoCodeService,
          useValue: Fixture.PromoCodeService,
        },
        {
          provide: SubscriptionService,
          useValue: Fixture.SubscriptionService,
        },
        {
          provide: BillingService,
          useValue: Fixture.getBillingService,
        },
        {
          provide: InvoiceService,
          useValue: Fixture.InvoiceService,
        },
        {
          provide: OrgUnitService,
          useValue: Fixture.OrgUnitService,
        },
        {
          provide: 'SEQUELIZE',
          useValue: Fixture.Sequelize,
        },
      ],
    }).compile();

    service = module.get<BillingWebhookService>(BillingWebhookService);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('should handle invoice paid event', async () => {
    const event = {
      type: 'invoice.paid',
      data: {
        object: {
          subscription: 'subscriptionId',
        },
      },
    };
    const subscription = {
      current_period_start: new Date(),
      current_period_end: new Date(),
      status: 'SUCCESS',
    };

    jest
      .spyOn(Fixture.getBillingService, 'fetchSubscription')
      .mockResolvedValue(subscription);

    await service.handleWebhookEvent(event);

    expect(Fixture.SubscriptionService.extendSubscription).toHaveBeenCalled();
  });

  it('should handle invoice.payment_failed event and update subscription', async () => {
    const event = {
      type: 'invoice.payment_failed',
      data: {
        object: {
          next_payment_attempt: 123352523632463246,
          subscription,
        },
      },
    };

    await service.handleWebhookEvent(event);

    expect(Fixture.SubscriptionService.updateSubscription).toHaveBeenCalled();
  });

  it('should handle customer.subscription.created event', async () => {
    const event = {
      type: 'customer.subscription.created',
      data: {
        object: subscription,
      },
    };

    await service.handleWebhookEvent(event);

    expect(Fixture.SubscriptionService.saveSubscription).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should handle customer.subscription.updated event', async () => {
    const event = {
      type: 'customer.subscription.updated',
      data: {
        object: subscription,
      },
    };

    await service.handleWebhookEvent(event);

    expect(
      Fixture.SubscriptionService.updateSubscription,
    ).toHaveBeenCalledTimes(1);
  });

  it('should handle customer.subscription.deleted event', async () => {
    const event = {
      type: 'customer.subscription.deleted',
      data: {
        object: subscription,
      },
    };

    await service.handleWebhookEvent(event);

    expect(
      Fixture.SubscriptionService.deleteCancelledSubscription,
    ).toHaveBeenCalled();
  });

  it('should handle customer.subscription.trial_will_end event', async () => {
    const event = {
      type: 'customer.subscription.trial_will_end',
      data: {
        object: subscription,
      },
    };

    await service.handleWebhookEvent(event);

    expect(Fixture.SubscriptionService.handleTrialEndEvent).toHaveBeenCalled();
  });
});
