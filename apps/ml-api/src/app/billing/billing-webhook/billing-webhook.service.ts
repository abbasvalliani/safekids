import { Inject, Injectable } from '@nestjs/common';
import { ConfigService} from '@nestjs/config';
import { LoggingService } from '../../logger/logging.service';
import { SubscriptionService } from '../subscription/subscription.service';
import Stripe from 'stripe';
import { invoiceSubscription } from '../stripe.utils';
import { PromoCodeService } from '../promo-code/promo-code.service';
import { InvoiceService } from '../invoice/invoice.service';
import { OrgUnitService } from '../../org-unit/org-unit.service';
import { SEQUELIZE } from '../../constants';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class BillingWebhookService {
    /** Subscription id of an invoice (`parent.subscription_details` since API 2025-03-31.basil). */
    private static subscriptionId(invoice: Stripe.Invoice): string {
        const subscription = invoiceSubscription(invoice);
        return typeof subscription === 'string' ? subscription : subscription?.id;
    }

    constructor(
        private readonly config: ConfigService,
        private readonly log: LoggingService,
        private readonly subscriptionService: SubscriptionService,
        private readonly promoCodeService: PromoCodeService,
        private readonly invoiceService: InvoiceService,
        private readonly orgUnitService: OrgUnitService,
        @Inject(SEQUELIZE) private readonly sequelize: Sequelize
    ) {
        this.log.className(BillingWebhookService.name);
    }

    async handleWebhookEvent(event) {
        const dataObject = event.data.object;
        this.log.debug('Handling event', event.type);
        switch (event.type) {
            //invoices
            case 'invoice.paid':
                {
                    try {
                        await this.subscriptionService.extendSubscription(BillingWebhookService.subscriptionId(dataObject));
                        this.log.debug('Renewed customer subscription', event);
                    } catch (error) {
                        this.log.error(`Error while handling ${event.type} event`, error);
                    }
                }
                break;
            case 'invoice.payment_failed':
                {
                    const invoice: Stripe.Invoice = dataObject;
                    try {
                        this.log.error('Failed Payment', {
                            event,
                            paymentIntentStatus: invoice.status,
                        });
                        if (dataObject.next_payment_attempt == null) {
                            //handle subscription cancelled automatically on final failed payment based
                            // upon your subscription settings
                            this.log.debug('Downgrading user after all payment attempts failed');
                            //await this.subscriptionService.downgradePlan(dataObject.customer);
                        } else {
                            await this.subscriptionService.updateSubscription(BillingWebhookService.subscriptionId(invoice));
                        }

                        // The invoice carries the subscription id; the email only needs the id.
                        await this.subscriptionService.sendPaymentFailedEmail({
                            id: BillingWebhookService.subscriptionId(invoice),
                        } as Stripe.Subscription);
                    } catch (ex) {
                        this.log.error('Error while handling failed payment hook', {
                            ex,
                            event,
                        });
                    }
                }
                break;

            //subscriptions
            case 'customer.subscription.created':
                {
                    let transaction;
                    try {
                        this.log.debug('Creating subscription.........', dataObject);
                        transaction = await this.sequelize.transaction();
                        await this.subscriptionService.saveSubscription(dataObject);
                        await this.orgUnitService.updateCategories(dataObject.metadata.planId, dataObject.metadata.accountId, false);
                        this.log.debug('Handling invoice..........', dataObject);
                        await this.invoiceService.handleInvoice(dataObject);
                        await transaction.commit();
                    } catch (error) {
                        await transaction.rollback();
                        this.log.error(`Error while handling ${event.type} event`, {
                            error,
                            event,
                        });
                    }
                }
                break;
            case 'customer.subscription.deleted':
                {
                    try {
                        const subscription: Stripe.Subscription = dataObject;
                        await this.subscriptionService.deleteCancelledSubscription(subscription);
                        this.log.debug('Deleted user subscription', event);
                    } catch (error) {
                        this.log.error('Error deleting user subscription', {
                            ex: error,
                            event,
                        });
                    }
                }
                break;
            case 'customer.subscription.updated':
                {
                    let transaction;
                    try {
                        this.log.debug('Updating subscription.........', event);
                        transaction = await this.sequelize.transaction();
                        await this.subscriptionService.updateSubscription(dataObject);
                        await this.orgUnitService.updateCategories(dataObject.metadata.planId, dataObject.metadata.accountId, false);
                        this.log.debug('Handling invoice..........', dataObject);
                        await this.invoiceService.handleInvoice(dataObject);
                        await transaction.commit();
                    } catch (error) {
                        await transaction.rollback();
                        this.log.error(`Error while handling ${event.type} event`, {
                            error,
                            event,
                        });
                    }
                }
                break;
            case 'customer.subscription.trial_will_end':
                await this.subscriptionService.handleTrialEndEvent(dataObject);
                break;

            //promotion codes
            case 'promotion_code.updated':
                await this.promoCodeService.updatePromoCode(dataObject);
                break;

            default:
                this.log.info('EVENT NOT HANDLED....', event.type);
            // Unexpected event type
        }
    }
}
