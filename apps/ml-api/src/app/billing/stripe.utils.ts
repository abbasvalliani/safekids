import Stripe from 'stripe';

// Helpers for the object shapes of Stripe API 2025-03-31.basil and later.

/** Billing period of a subscription; since basil it lives on the items. */
export function subscriptionPeriod(subscription: Stripe.Subscription): { start: number; end: number } {
    const item = subscription.items?.data?.[0];
    return { start: item?.current_period_start, end: item?.current_period_end };
}

/** The first discount, when the subscription was retrieved with `discounts` expanded. */
export function firstDiscount(subscription: Stripe.Subscription): Stripe.Discount | null {
    const discount = subscription.discounts?.[0];
    return discount && typeof discount !== 'string' ? discount : null;
}

/** Whether discounts are present only as ids (webhook payloads) and need a retrieve to read. */
export function hasUnexpandedDiscounts(subscription: Stripe.Subscription): boolean {
    return (subscription.discounts ?? []).some((discount) => typeof discount === 'string');
}

/** Coupon of a discount (`source.coupon` since clover). */
export function discountCoupon(discount: Stripe.Discount | null): Stripe.Coupon | null {
    const coupon = discount?.source?.coupon;
    return coupon && typeof coupon !== 'string' ? coupon : null;
}

/** Coupon of a promotion code (`promotion.coupon` since clover), when expanded. */
export function promotionCoupon(promotionCode: Stripe.PromotionCode): Stripe.Coupon | null {
    const coupon = promotionCode?.promotion?.coupon;
    return coupon && typeof coupon !== 'string' ? coupon : null;
}

/** Subscription an invoice belongs to (`parent.subscription_details` since basil). */
export function invoiceSubscription(invoice: Stripe.Invoice): string | Stripe.Subscription | null {
    return invoice?.parent?.subscription_details?.subscription ?? null;
}

/** `discounts` param for a subscription create/update; undefined leaves them unchanged. */
export function discountsParam(coupon?: string, promotionCode?: string): Array<{ coupon?: string; promotion_code?: string }> | undefined {
    const discounts = [];
    if (coupon) {
        discounts.push({ coupon });
    }
    if (promotionCode) {
        discounts.push({ promotion_code: promotionCode });
    }
    return discounts.length ? discounts : undefined;
}
