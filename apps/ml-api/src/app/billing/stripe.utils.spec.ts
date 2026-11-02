import Stripe from 'stripe';
import {
    discountCoupon,
    discountsParam,
    firstDiscount,
    hasUnexpandedDiscounts,
    invoiceSubscription,
    promotionCoupon,
    subscriptionPeriod,
} from './stripe.utils';
import { StripeService } from './stripe.service';

// Object shapes are the Stripe API 2025-03-31.basil / 2025-09-30.clover ones
// the SDK pins; see https://docs.stripe.com/changelog.
describe('stripe.utils', () => {
    it('reads the billing period from the first subscription item', () => {
        const subscription = { items: { data: [{ current_period_start: 10, current_period_end: 20 }] } } as unknown as Stripe.Subscription;
        expect(subscriptionPeriod(subscription)).toEqual({ start: 10, end: 20 });
    });

    it('reads the first expanded discount and its coupon', () => {
        const coupon = { id: 'co_1', name: 'TEST' };
        const subscription = { discounts: [{ promotion_code: 'promo_1', source: { type: 'coupon', coupon } }] } as unknown as Stripe.Subscription;
        expect(hasUnexpandedDiscounts(subscription)).toBe(false);
        expect(firstDiscount(subscription)?.promotion_code).toBe('promo_1');
        expect(discountCoupon(firstDiscount(subscription))).toBe(coupon);
    });

    it('treats discount ids (webhook payloads) as unexpanded', () => {
        const subscription = { discounts: ['di_1'] } as unknown as Stripe.Subscription;
        expect(hasUnexpandedDiscounts(subscription)).toBe(true);
        expect(firstDiscount(subscription)).toBeNull();
        expect(firstDiscount({ discounts: [] } as unknown as Stripe.Subscription)).toBeNull();
        expect(discountCoupon(null)).toBeNull();
    });

    it('reads the coupon of a promotion code only when expanded', () => {
        expect(promotionCoupon({ promotion: { type: 'coupon', coupon: { name: 'X' } } } as unknown as Stripe.PromotionCode)?.name).toBe('X');
        expect(promotionCoupon({ promotion: { type: 'coupon', coupon: 'co_1' } } as unknown as Stripe.PromotionCode)).toBeNull();
    });

    it('reads the subscription of an invoice from parent.subscription_details', () => {
        expect(invoiceSubscription({ parent: { type: 'subscription_details', subscription_details: { subscription: 'sub_1' } } } as unknown as Stripe.Invoice)).toBe('sub_1');
        expect(invoiceSubscription({ parent: null } as unknown as Stripe.Invoice)).toBeNull();
    });

    it('builds the discounts param, leaving discounts unchanged when nothing is given', () => {
        expect(discountsParam()).toBeUndefined();
        expect(discountsParam(undefined, 'promo_1')).toEqual([{ promotion_code: 'promo_1' }]);
        expect(discountsParam('co_1', 'promo_1')).toEqual([{ coupon: 'co_1' }, { promotion_code: 'promo_1' }]);
    });
});

describe('StripeService', () => {
    const saved = { ...process.env };
    afterEach(() => {
        process.env = { ...saved };
    });

    it('pins the SDK API version', () => {
        delete process.env.STRIPE_API_VERSION;
        process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
        const client = new StripeService().client() as unknown as { getApiField: (k: string) => string };
        expect(client.getApiField('version')).toBe(Stripe.API_VERSION);
    });

    it('ignores a different STRIPE_API_VERSION and keeps the pinned one', () => {
        process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
        process.env.STRIPE_API_VERSION = '2024-06-20';
        const client = new StripeService().client() as unknown as { getApiField: (k: string) => string };
        expect(client.getApiField('version')).toBe(Stripe.API_VERSION);
    });
});
