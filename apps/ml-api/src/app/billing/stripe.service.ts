import Stripe from 'stripe';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class StripeService {
    private static warned = false;

    client() {
        // The code is written against the API version this SDK pins
        // (Stripe.API_VERSION, 2025-03-31.basil and later object shapes:
        // subscription.discounts, invoice.parent, promotion_code.promotion).
        // An older STRIPE_API_VERSION would return shapes this code no longer
        // reads, so it is ignored (with a warning) rather than passed on.
        const configured = process.env.STRIPE_API_VERSION;
        if (configured && configured !== Stripe.API_VERSION && !StripeService.warned) {
            StripeService.warned = true;
            new Logger(StripeService.name).warn(
                `Ignoring STRIPE_API_VERSION=${configured}; the Stripe SDK is pinned to ${Stripe.API_VERSION}.`,
            );
        }
        return new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: Stripe.API_VERSION,
            typescript: true,
        } as Stripe.StripeConfig);
    }
}
