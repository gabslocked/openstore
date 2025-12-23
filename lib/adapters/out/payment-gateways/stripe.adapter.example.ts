/**
 * Stripe Payment Gateway Adapter (Example/Template)
 * 
 * This is an example implementation showing how to add a new payment gateway.
 * To use Stripe, you would need to:
 * 1. Install the Stripe SDK: pnpm add stripe
 * 2. Rename this file to stripe.adapter.ts
 * 3. Implement the methods below
 * 4. Register in the factory (index.ts)
 * 5. Add environment variables
 */

import type {
  PaymentGatewayPort,
  CreatePaymentInput,
  PaymentResult,
  PaymentStatusResult,
  WebhookValidation,
  PaymentStatus,
  RefundResult,
} from '@/lib/core/ports/out/payment-gateway.port';

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  publicKey?: string;
}

/**
 * Stripe Payment Gateway Adapter
 * 
 * Implements PaymentGatewayPort for Stripe payments.
 * Supports: Credit Card, PIX (Brazil), Boleto
 */
export class StripeAdapter implements PaymentGatewayPort {
  readonly name = 'stripe';

  // private stripe: Stripe; // Uncomment when implementing

  constructor(private readonly config: StripeConfig) {
    this.validateConfig();
    // this.stripe = new Stripe(config.secretKey, { apiVersion: '2023-10-16' });
  }

  private validateConfig(): void {
    if (!this.config.secretKey) {
      throw new Error('Stripe: secretKey is required');
    }
    if (!this.config.webhookSecret) {
      throw new Error('Stripe: webhookSecret is required');
    }
  }

  /**
   * Create a payment using Stripe Checkout or Payment Intents
   */
  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    // Example implementation:
    // 
    // const session = await this.stripe.checkout.sessions.create({
    //   payment_method_types: ['card', 'pix', 'boleto'],
    //   line_items: [{
    //     price_data: {
    //       currency: 'brl',
    //       product_data: { name: input.description },
    //       unit_amount: input.amount, // in cents
    //     },
    //     quantity: 1,
    //   }],
    //   mode: 'payment',
    //   success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
    //   cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`,
    //   metadata: { externalId: input.externalId },
    // });
    //
    // return {
    //   success: true,
    //   transactionId: session.id,
    //   status: 'pending',
    //   amount: input.amount,
    //   // For PIX, you would get the QR code from the payment intent
    // };

    throw new Error('Stripe adapter not implemented. This is an example file.');
  }

  /**
   * Get payment status from Stripe
   */
  async getPaymentStatus(transactionId: string): Promise<PaymentStatusResult> {
    // Example:
    // const session = await this.stripe.checkout.sessions.retrieve(transactionId);
    // return {
    //   transactionId: session.id,
    //   status: this.mapStatus(session.payment_status),
    //   amount: session.amount_total || 0,
    //   paidAt: session.payment_status === 'paid' ? new Date() : undefined,
    // };

    throw new Error('Stripe adapter not implemented. This is an example file.');
  }

  /**
   * Validate Stripe webhook signature
   */
  validateWebhook(payload: string, signature: string): WebhookValidation {
    // Example:
    // try {
    //   const event = this.stripe.webhooks.constructEvent(
    //     payload,
    //     signature,
    //     this.config.webhookSecret
    //   );
    //   
    //   if (event.type === 'checkout.session.completed') {
    //     const session = event.data.object as Stripe.Checkout.Session;
    //     return {
    //       isValid: true,
    //       payload: {
    //         event: event.type,
    //         transactionId: session.id,
    //         externalId: session.metadata?.externalId,
    //         status: 'paid',
    //         amount: session.amount_total || 0,
    //         paidAt: new Date(),
    //       },
    //     };
    //   }
    //   
    //   return { isValid: true, payload: { ... } };
    // } catch (err) {
    //   return { isValid: false, error: err.message };
    // }

    return {
      isValid: false,
      error: 'Stripe adapter not implemented. This is an example file.',
    };
  }

  /**
   * Cancel a payment (if possible)
   */
  async cancelPayment(transactionId: string): Promise<boolean> {
    // Example:
    // await this.stripe.checkout.sessions.expire(transactionId);
    // return true;

    throw new Error('Stripe adapter not implemented. This is an example file.');
  }

  /**
   * Refund a payment
   */
  async refundPayment(transactionId: string, amount?: number): Promise<RefundResult> {
    // Example:
    // const session = await this.stripe.checkout.sessions.retrieve(transactionId);
    // const refund = await this.stripe.refunds.create({
    //   payment_intent: session.payment_intent as string,
    //   amount: amount, // partial refund if specified
    // });
    // return {
    //   success: true,
    //   refundId: refund.id,
    //   amount: refund.amount,
    //   status: refund.status === 'succeeded' ? 'completed' : 'pending',
    // };

    throw new Error('Stripe adapter not implemented. This is an example file.');
  }

  /**
   * Check supported payment methods
   */
  supportsMethod(method: 'pix' | 'credit_card' | 'boleto' | 'debit_card'): boolean {
    // Stripe Brazil supports all these methods
    return ['pix', 'credit_card', 'boleto', 'debit_card'].includes(method);
  }

  /**
   * Map Stripe status to standard PaymentStatus
   */
  private mapStatus(stripeStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      unpaid: 'pending',
      paid: 'paid',
      no_payment_required: 'paid',
      expired: 'expired',
    };
    return statusMap[stripeStatus] || 'pending';
  }
}

/**
 * How to register this adapter in the factory:
 * 
 * In lib/adapters/out/payment-gateways/index.ts:
 * 
 * ```typescript
 * import { StripeAdapter } from './stripe.adapter';
 * 
 * gatewayRegistry.set('stripe', () => {
 *   return new StripeAdapter({
 *     secretKey: process.env.STRIPE_SECRET_KEY || '',
 *     webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
 *     publicKey: process.env.STRIPE_PUBLIC_KEY,
 *   });
 * });
 * ```
 * 
 * Then set DEFAULT_PAYMENT_GATEWAY=stripe in your .env
 */
