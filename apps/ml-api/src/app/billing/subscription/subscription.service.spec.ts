import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionService } from './subscription.service';
import { AccountService } from '../../accounts/account.service';
import { UserService } from '../../user/user.service';
import { CustomerService } from '../customer/customer.service';
import { PlanService } from '../plan/plan.service';
import { EmailService } from '../../email/email.service';
import { BillingService } from '../billing.service';
import { SubscriptionDto } from './dto/subscription.dto';
import { CreateSubscriptionDto } from './dto/createSubscriptionDto';
import { LoggingService } from '../../logger/logging.service';
import { SubscriptionFeedbackService } from '../subscription-feedback/subscription-feedback.service';

class Fixture {
    static BillingService = class {
        static createSubscription = Fixture.getMock();
        static deleteSubscription = Fixture.getMock();
        static fetchSubscription = Fixture.getMock();
        static fetchPromotionCodeByName = Fixture.getMock();
        static updateSubscription = Fixture.getMock();
        static getPromotionCode = Fixture.getMock();
        static cancelSubscriptionAtPeriodEnd = Fixture.getMock();
    };

    static AccountService = class {
        static update = Fixture.getMock();
        static findOne = Fixture.getMock();
    };

    static UserService = class {
        static findOneByEmail = Fixture.getMock();
        static findParentAccount = Fixture.getMock();
        static get = Fixture.getMock();
    };

    static CustomerService = class {
        static createCustomer = Fixture.getMock();
        static get = Fixture.getMock();
    };

    static PlanService = class {
        static findOne = Fixture.getMock();
        static get = Fixture.getMock();
    };

    static EmailService = class {
        static sendEmail = Fixture.getMock();
        static get = Fixture.getMock();
    };

    static SubscriptionFeedbackService = class {
        static delete = Fixture.getMock();
        static create = Fixture.getMock();
    };

    static SUBSCRIPTION_REPOSITORY = class {
        static findOne = Fixture.getMock();
        static update = Fixture.getMock();
        static destroy = Fixture.getMock();
        static create = Fixture.getMock();
        static sequelize = { query: jest.fn() };
    };

    static getMock() {
        return jest.fn();
    }

    static getSubscription() {
        return {
            id: 'id',
            metadata: {
                planId: 'planId',
                accountId: 'accountId',
            },
            status: 'trialing',
            trial_start: new Date().getTime(),
            trial_end: new Date().getTime(),
            // API 2025-03-31.basil+: the period is on the items, discounts are a
            // list (expanded here) whose coupon sits under source.coupon.
            items: {
                data: [
                    {
                        current_period_start: new Date().getTime(),
                        current_period_end: new Date().getTime(),
                    },
                ],
            },
            trialUsed: true,
            cancel_at_period_end: true,
            discounts: [
                {
                    source: { type: 'coupon', coupon: { name: 'TEST' } },
                    promotion_code: 'TEST00',
                },
            ],
        } as any;
    }

    static getLoggingService() {
        return {
            className: Fixture.getMock(),
            debug: Fixture.getMock(),
            info: Fixture.getMock(),
            error: Fixture.getMock(),
        };
    }

    static Sequelize = class {
        static transaction = Fixture.getMock().mockResolvedValue({
            commit: jest.fn(),
            rollback: jest.fn(),
        });
    };
}

describe('Subscription Service tests', () => {
    let service: SubscriptionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SubscriptionService,
                {
                    provide: BillingService,
                    useValue: Fixture.BillingService,
                },
                {
                    provide: LoggingService,
                    useValue: Fixture.getLoggingService(),
                },
                {
                    provide: AccountService,
                    useValue: Fixture.AccountService,
                },
                {
                    provide: UserService,
                    useValue: Fixture.UserService,
                },
                {
                    provide: CustomerService,
                    useValue: Fixture.CustomerService,
                },
                {
                    provide: PlanService,
                    useValue: Fixture.PlanService,
                },
                {
                    provide: EmailService,
                    useValue: Fixture.EmailService,
                },
                {
                    provide: 'SUBSCRIPTION_REPOSITORY',
                    useValue: Fixture.SUBSCRIPTION_REPOSITORY,
                },
                {
                    provide: SubscriptionFeedbackService,
                    useValue: Fixture.SubscriptionFeedbackService,
                },
                {
                    provide: 'SEQUELIZE',
                    useValue: Fixture.Sequelize,
                },
            ],
        }).compile();

        service = module.get<SubscriptionService>(SubscriptionService);
    });

    it('Should create subscription', async () => {
        //given
        const accountId = 'accountId';
        const planId = 'planId';
        const stripeCustomerId = 'stripeCustomerId';
        const plan = {
            trialPeriod: 7,
            priceId: 'priceId',
            id: 'id',
        };

        const promotionCode = 'SK2022';
        //mocks
        Fixture.AccountService.findOne.mockResolvedValueOnce({ stripeCustomerId });
        Fixture.PlanService.findOne.mockResolvedValueOnce({ trialPeriod: plan.trialPeriod, priceId: plan.priceId, id: plan.id });
        Fixture.BillingService.fetchPromotionCodeByName.mockResolvedValueOnce(promotionCode);

        //when
        await service.createStripeSubscription(accountId, planId, promotionCode);

        //then
        expect(Fixture.AccountService.findOne).toBeCalledTimes(1);
        expect(Fixture.AccountService.findOne).toBeCalledWith(accountId);
        expect(Fixture.PlanService.findOne).toBeCalledTimes(1);
        expect(Fixture.PlanService.findOne).toBeCalledWith(planId);
        expect(Fixture.BillingService.createSubscription).toBeCalledTimes(1);
        const dto = {
            accountId,
            stripeCustomerId,
            trailPeriod: plan.trialPeriod,
            priceId: plan.priceId,
            metaData: {
                planId: plan.id,
                accountId,
                promotionCode,
            },
        } as SubscriptionDto;

        expect(Fixture.BillingService.createSubscription).toBeCalledWith(dto);
    });

    it('Should create stripe subscription if not created', async () => {
        //given
        const accountId = 'accountId';
        const planId = 'planId';
        const stripeCustomerId = 'stripeCustomerId';
        const promotionCode = 'SK2022';

        //mocks
        Fixture.SUBSCRIPTION_REPOSITORY.findOne.mockResolvedValueOnce(null);
        Fixture.CustomerService.createCustomer.mockResolvedValueOnce({ stripeCustomerId });
        Fixture.AccountService.update.mockResolvedValueOnce({ name: 'name', primaryDomain: 'some' });
        jest.spyOn(service, 'createStripeSubscription').mockResolvedValueOnce(null);
        Fixture.AccountService.findOne.mockResolvedValueOnce({ name: 'name', primaryDomain: 'some' });
        Fixture.BillingService.fetchPromotionCodeByName.mockResolvedValueOnce(promotionCode);
        //when
        await service.updateStripeSubscription(accountId, planId);

        //then
        expect(Fixture.SUBSCRIPTION_REPOSITORY.findOne).toBeCalledTimes(1);
        expect(Fixture.SUBSCRIPTION_REPOSITORY.findOne).toBeCalledWith({ where: { accountId } });
        expect(Fixture.AccountService.findOne).toBeCalledTimes(1);
        expect(Fixture.AccountService.findOne).toBeCalledWith(accountId);
        expect(Fixture.CustomerService.createCustomer).toBeCalledTimes(1);
        expect(Fixture.AccountService.update).toBeCalledTimes(1);
    });

    it('Should update stripe subscription if already created', async () => {
        //given
        const accountId = 'accountId';
        const planId = 'planId';

        //mocks
        Fixture.SUBSCRIPTION_REPOSITORY.findOne.mockResolvedValueOnce({ id: 'sub_id' });
        Fixture.PlanService.findOne.mockResolvedValueOnce({ priceId: '123', id: planId });

        //when
        await service.updateStripeSubscription(accountId, planId);

        //then
        expect(Fixture.SUBSCRIPTION_REPOSITORY.findOne).toBeCalledTimes(1);
        expect(Fixture.SUBSCRIPTION_REPOSITORY.findOne).toBeCalledWith({ where: { accountId } });
        expect(Fixture.BillingService.updateSubscription).toBeCalledTimes(1);
        expect(Fixture.PlanService.findOne).toBeCalledTimes(1);
        expect(Fixture.PlanService.findOne).toBeCalledWith(planId);
    });

    it('Should delete subscription', async () => {
        //given
        const accountId = 'accountId';
        const dto = {
            accountId,
            feedback: [],
        };
        const id = 'id';

        //mocks
        Fixture.SUBSCRIPTION_REPOSITORY.findOne.mockResolvedValueOnce({ id });

        //when
        await service.cancelSubscriptionAtPeriodEnd(dto);

        //then
        expect(Fixture.SUBSCRIPTION_REPOSITORY.findOne).toBeCalledTimes(1);
        expect(Fixture.SUBSCRIPTION_REPOSITORY.findOne).toBeCalledWith({ where: { accountId } });

        expect(Fixture.BillingService.cancelSubscriptionAtPeriodEnd).toBeCalledTimes(1);
        expect(Fixture.BillingService.cancelSubscriptionAtPeriodEnd).toBeCalledWith(id);
    });

    it('Should save subscription', async () => {
        //given
        const subscription = Fixture.getSubscription();

        jest.spyOn(Fixture.BillingService, 'getPromotionCode').mockResolvedValue(subscription.discounts[0].promotion_code);

        //when
        await service.saveSubscription(subscription);

        //then
        expect(Fixture.SUBSCRIPTION_REPOSITORY.create).toBeCalledTimes(1);

        const result = {
            id: subscription.id,
            planId: subscription.metadata.planId,
            status: subscription.status,
            trialStartTime: new Date(subscription.trial_start * 1000),
            trialEndTime: new Date(subscription.trial_end * 1000),
            subscriptionStartTime: new Date(subscription.items.data[0].current_period_start * 1000),
            subscriptionEndTime: new Date(subscription.items.data[0].current_period_end * 1000),
            trialUsed: true,
            accountId: subscription.metadata.accountId,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            coupon: subscription.discounts[0].source.coupon.name,
            promotionCode: subscription.discounts[0].promotion_code,
        } as CreateSubscriptionDto;

        expect(Fixture.SUBSCRIPTION_REPOSITORY.create).toHaveBeenCalledWith(result);
    });

    it('Should update subscription', async () => {
        //given
        const subscription = Fixture.getSubscription();
        jest.spyOn(Fixture.BillingService, 'getPromotionCode').mockResolvedValue(subscription.discounts[0].promotion_code);

        //when
        await service.updateSubscription(subscription);

        //then
        expect(Fixture.SUBSCRIPTION_REPOSITORY.update).toBeCalledTimes(1);
        expect(Fixture.AccountService.update).toBeCalledTimes(1);
        expect(Fixture.AccountService.update.mock.calls[0][0]).toEqual(subscription.metadata.accountId);
        expect(Fixture.AccountService.update.mock.calls[0][1]).toEqual({ notifyExpiredExtension: false });
    });

    it('Should delete canceled subscription', async () => {
        //given
        const subscription = Fixture.getSubscription();

        //mocks
        Fixture.AccountService.findOne.mockResolvedValueOnce({ id: subscription.metadata.accountId });
        Fixture.AccountService.findOne.mockResolvedValueOnce({ id: subscription.metadata.accountId, primaryDomain: 'some' });
        Fixture.UserService.findOneByEmail.mockResolvedValueOnce({ firstName: 'firstName', lastName: 'lastName', email: 'email' });

        //when
        await service.deleteCancelledSubscription(subscription);

        //then
        expect(Fixture.AccountService.findOne).toBeCalledTimes(2);
        expect(Fixture.AccountService.findOne).toHaveBeenCalledWith(subscription.metadata.accountId);
        expect(Fixture.SUBSCRIPTION_REPOSITORY.destroy).toBeCalledTimes(1);
        expect(Fixture.AccountService.update.mock.calls[0][0]).toEqual(subscription.metadata.accountId);
        expect(Fixture.AccountService.update.mock.calls[0][1]).toEqual({ notifyExpiredExtension: false });
        expect(Fixture.EmailService.sendEmail).toBeCalledTimes(1);
        expect(Fixture.UserService.findOneByEmail).toBeCalledTimes(1);
    });

    it('Should extend subscription', async () => {
        //given
        const subscription = Fixture.getSubscription();

        //mocks
        Fixture.BillingService.fetchSubscription.mockResolvedValueOnce({ id: subscription.id });
        Fixture.AccountService.findOne.mockResolvedValueOnce({ id: subscription.metadata.accountId, primaryDomain: 'some' });
        Fixture.UserService.findOneByEmail.mockResolvedValueOnce({ firstName: 'firstName', lastName: 'lastName', email: 'email' });

        //when
        await service.extendSubscription(subscription);

        //then
        expect(Fixture.SUBSCRIPTION_REPOSITORY.update).toBeCalledTimes(1);
        expect(Fixture.SUBSCRIPTION_REPOSITORY.update.mock.calls[0][1]).toEqual({ where: { id: subscription.id } });
    });

    it('Should handle trial event', async () => {
        //given
        const subscription = Fixture.getSubscription();

        //mocks
        Fixture.SUBSCRIPTION_REPOSITORY.findOne.mockResolvedValueOnce({ account: { primaryDomain: 'email' } });
        Fixture.UserService.findOneByEmail.mockResolvedValueOnce({ firstName: 'firstName', lastName: 'lastName', email: 'email' });

        //when
        await service.handleTrialEndEvent(subscription);

        //then
        expect(Fixture.UserService.findOneByEmail).toBeCalledTimes(1);
        expect(Fixture.UserService.findOneByEmail).toHaveBeenCalledWith('email');
        expect(Fixture.SUBSCRIPTION_REPOSITORY.findOne).toBeCalledTimes(1);
        expect(Fixture.SUBSCRIPTION_REPOSITORY.findOne).toHaveBeenCalledWith({ where: { id: subscription.id } });
        expect(Fixture.EmailService.sendEmail).toBeCalledTimes(1);
    });

    it('Should send payment failed email', async () => {
        //given
        const subscription = Fixture.getSubscription();

        //mocks
        Fixture.SUBSCRIPTION_REPOSITORY.findOne.mockResolvedValueOnce({ account: { primaryDomain: 'email' } });
        Fixture.UserService.findOneByEmail.mockResolvedValueOnce({ firstName: 'firstName', lastName: 'lastName', email: 'email' });

        //when
        await service.sendPaymentFailedEmail(subscription);

        //then
        expect(Fixture.UserService.findOneByEmail).toBeCalledTimes(1);
        expect(Fixture.UserService.findOneByEmail).toHaveBeenCalledWith('email');
        expect(Fixture.SUBSCRIPTION_REPOSITORY.findOne).toBeCalledTimes(1);
        expect(Fixture.SUBSCRIPTION_REPOSITORY.findOne).toHaveBeenCalledWith({ where: { id: subscription.id } });
        expect(Fixture.EmailService.sendEmail).toBeCalledTimes(1);
    });

    it('Should send subscription cancel email', async () => {
        //given
        const res = [
            { accountId: '1', cancelAtPeriodEnd: true },
            { accountId: '2', cancelAtPeriodEnd: false },
        ];

        //mocks
        jest.spyOn(Fixture.SUBSCRIPTION_REPOSITORY.sequelize, 'query').mockResolvedValueOnce(res);
        Fixture.UserService.findParentAccount.mockResolvedValueOnce({ firstName: 'f', lastName: 'l', email: 'email' });
        Fixture.UserService.findParentAccount.mockResolvedValueOnce({ firstName: 'f', lastName: 'l', email: 'email' });

        //when
        await service.subscriptionCancelOrRenewJob();

        //then
        expect(Fixture.SUBSCRIPTION_REPOSITORY.sequelize.query).toBeCalledTimes(1);
        expect(Fixture.UserService.findParentAccount).toBeCalledTimes(2);
        expect(Fixture.EmailService.sendEmail).toBeCalledTimes(2);
    });
});
