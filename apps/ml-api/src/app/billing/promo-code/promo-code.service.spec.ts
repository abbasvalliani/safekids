import { Test, TestingModule } from '@nestjs/testing';
import { PromoCodeService } from './promo-code.service';
import { BillingService } from '../billing.service';
import { LoggingService } from '../../logger/logging.service';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { AccountService } from '../../accounts/account.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { Account } from '../../accounts/entities/account.entity';
import { CouponService } from '../coupon/coupon.service';
import { CouponStatus } from '../coupon/coupon.status.enum';

const accountId = '12345678910';
class Fixture {
  static StripeService = class {
    static productExists = Fixture.getMock();
  };

  static PROMO_CODE_REPOSITORY = class {
    static findAll = Fixture.getMock();
    static findOne = Fixture.getMock();
    static create = Fixture.getMock();
    static update = Fixture.getMock();
  };

  static CouponService = class {
    static findActiveCoupon = Fixture.getMock();
    static findOne = Fixture.getMock();
  };

  static UserService = class {};

  static AccountService = class {
    static findOne = Fixture.getMock().mockResolvedValue({
      id: accountId,
    });
  };
  static SubscriptionService = class {
    static findOneByAccountId = Fixture.getMock();
  };

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
    static get = Fixture.getMock().mockReturnValue(Fixture.getConfig());
  };

  static getConfig() {
    return {
      webapp: {
        url: 'http://localhost:8080',
      },
    };
  }

  static getBillingService = class {
    static get = Fixture.getMock();
    static fetchPromotionCodeByName = Fixture.getMock();
    static generatePromoCode = Fixture.getMock();
    static applyPromotionCode = Fixture.getMock();
    static fetchSubscription = Fixture.getMock();
  };
}

describe('Test PromoCodeService', () => {
  let service: PromoCodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromoCodeService,
        {
          provide: BillingService,
          useValue: Fixture.getBillingService,
        },
        {
          provide: LoggingService,
          useValue: Fixture.getLoggingService(),
        },
        {
          provide: ConfigService,
          useValue: Fixture.getConfigService,
        },

        {
          provide: 'PROMO_CODE_REPOSITORY',
          useValue: Fixture.PROMO_CODE_REPOSITORY,
        },
        {
          provide: UserService,
          useValue: Fixture.UserService,
        },
        {
          provide: AccountService,
          useValue: Fixture.AccountService,
        },

        {
          provide: SubscriptionService,
          useValue: Fixture.SubscriptionService,
        },
        {
          provide: CouponService,
          useValue: Fixture.CouponService,
        },
      ],
    }).compile();

    service = module.get<PromoCodeService>(PromoCodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find details of promotion code', async () => {
    //given
    const promotionCodeDetail = {
      id: 'TESTCODE',
      active: true,
      expiresAt: new Date(),
      redeemBy: '',
      currency: 'USD',
      percentOff: 10.0,
      amountOff: null,
      referrerAccountId: '1234567890',
    };

    jest
      .spyOn(Fixture.getBillingService, 'fetchPromotionCodeByName')
      .mockResolvedValue(promotionCodeDetail);

    const promotionCode = await service.findCodeDetails('TESTCODE');

    //assert
    expect(promotionCode).toMatchObject(promotionCodeDetail);
  });

  it('should create promotion code and save ', async () => {
    //given
    const promotionCode = {
      code: 'TESTCODE',
      active: true,
      expiresAt: new Date(),
      redeemBy: '',
      currency: 'USD',
      percentOff: 10.0,
      amountOff: null,
      referrerAccountId: '1234567890',
    };
    const account: Account = Fixture.AccountService.findOne();
    const userId = '12345';
    const coupon = { code: 'TEST', status: CouponStatus.ACTIVE };

    jest
      .spyOn(Fixture.getBillingService, 'generatePromoCode')
      .mockResolvedValue(promotionCode);
    jest
      .spyOn(Fixture.CouponService, 'findActiveCoupon')
      .mockResolvedValue(coupon);

    const link = await service.createPromotionCode(account, userId);

    expect(Fixture.PROMO_CODE_REPOSITORY.create).toHaveBeenCalled();
  });

  it('should apply promotion code on existing subscription', async () => {
    const accountId = '111-222-333';
    const promotionCode = 'promotioncode';
    const subscriptionId = 'subscription1';
    jest
      .spyOn(Fixture.SubscriptionService, 'findOneByAccountId')
      .mockResolvedValue({ id: subscriptionId });

    await service.applyPromotionCode(accountId, promotionCode);

    expect(Fixture.getBillingService.applyPromotionCode).toHaveBeenCalledWith(
      subscriptionId,
      promotionCode,
    );
  });

  it('should activate promotion for existing subscription', async () => {
    const subscriptionId = 'subscription1';
    jest
      .spyOn(Fixture.getBillingService, 'fetchSubscription')
      .mockResolvedValue({ metadata: { promotionCode: 'TESTCODE' } });

    await service.activatePromotionCode(subscriptionId);

    expect(Fixture.getBillingService.applyPromotionCode).toHaveBeenCalled();
  });

  it('should update promotion code without expires at', async () => {
    const response: any = {
      active: true,
      times_redeemed: 1,
      expiresAt: null,
      id: '1',
      code: 'code',
    };
    jest
      .spyOn(Fixture.getBillingService, 'fetchSubscription')
      .mockResolvedValue({ metadata: { promotionCode: 'TESTCODE' } });

    await service.updatePromoCode(response);

    expect(Fixture.PROMO_CODE_REPOSITORY.update).toHaveBeenCalledTimes(1);
  });

  it('should update promotion code with expires at', async () => {
    const response: any = {
      active: true,
      times_redeemed: 1,
      expiresAt: new Date().getTime(),
      id: '1',
      code: 'code',
    };
    jest
      .spyOn(Fixture.getBillingService, 'fetchSubscription')
      .mockResolvedValue({ metadata: { promotionCode: 'TESTCODE' } });

    await service.updatePromoCode(response);

    expect(Fixture.PROMO_CODE_REPOSITORY.update).toHaveBeenCalledTimes(1);
  });
});
