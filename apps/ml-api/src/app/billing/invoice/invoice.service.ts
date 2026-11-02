import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Invoice, InvoiceCreationAttributes } from './entities/invoice.entity';
import { INVOICE_REPOSITORY } from '../../constants';
import { BillingService } from '../billing.service';
import { AccountService } from '../../accounts/account.service';
import Stripe from 'stripe';
import { invoiceSubscription } from '../stripe.utils';

@Injectable()
export class InvoiceService {
    constructor(
        @Inject(INVOICE_REPOSITORY) private readonly repository: typeof Invoice,
        private readonly billingService: BillingService,
        private readonly accountService: AccountService
    ) {}

    async handleInvoice(obj: Stripe.Subscription): Promise<void> {
        try {
            const invoice = await this.fetchUpcomingInvoice(obj.id);
            const account = await this.accountService.findByCustomerId(String(invoice.customer));
            const upcomingInvoice : InvoiceCreationAttributes = {
                nextPaymentDate: new Date(invoice.next_payment_attempt * 1000),
                totalPrice: String(invoice.subtotal ? invoice.subtotal / 100 : invoice.subtotal),
                afterPromo: String(invoice.total ? invoice.total / 100 : invoice.total),
                amountPaid: String(invoice.amount_paid ? invoice.amount_paid / 100 : invoice.amount_paid),
                amountDue: String(invoice.amount_due ? invoice.amount_due / 100 : invoice.amount_due),
                amountRemaining: String(invoice.amount_remaining ? invoice.amount_remaining / 100 : invoice.amount_remaining),
                subscriptionId: String(this.subscriptionId(invoice) ?? obj.id),
                accountId: account.id,
            };
            await this.repository.upsert(upcomingInvoice);
        } catch (e) {
            if (e.type === 'StripeInvalidRequestError' && e.statusCode === HttpStatus.NOT_FOUND && e.code === 'invoice_upcoming_none') {
                await this.repository.destroy({ where: { subscriptionId: obj.id } });
            } else {
                throw e;
            }
        }
    }

    private subscriptionId(invoice: Stripe.Invoice): string | null {
        const subscription = invoiceSubscription(invoice);
        return typeof subscription === 'string' ? subscription : subscription?.id ?? null;
    }

    async fetchUpcomingInvoice(subscriptionId: string): Promise<Stripe.Invoice> {
        return await this.billingService.getUpcomingInvoice(subscriptionId);
    }

    async findOne(accountId: string): Promise<Invoice> {
        return await this.repository.findOne({ where: { accountId } });
    }

    async delete(accountId: string): Promise<void> {
        await this.repository.destroy({ where: { accountId }, force: true });
    }
}
