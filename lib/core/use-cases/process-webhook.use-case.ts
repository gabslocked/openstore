import type { PaymentGatewayPort, PaymentStatus } from '../ports/out/payment-gateway.port';
import { PaymentError, PaymentErrorCode } from '../domain/errors/payment-error';

/**
 * Input for processing a webhook
 */
export interface ProcessWebhookInput {
  /** Raw webhook payload as string */
  payload: string;
  /** Webhook signature from headers */
  signature: string;
}

/**
 * Output after processing a webhook
 */
export interface ProcessWebhookOutput {
  /** Whether the webhook was processed successfully */
  processed: boolean;
  /** Transaction ID from the webhook */
  transactionId: string;
  /** External ID (order ID) if present */
  externalId?: string;
  /** New payment status */
  newStatus: PaymentStatus;
  /** Whether this was a payment confirmation */
  isPaid: boolean;
}

/**
 * Process Webhook Use Case
 * 
 * Handles incoming payment webhooks from any gateway.
 * Validates the webhook signature and updates the payment/order status.
 * 
 * This use case is gateway-agnostic - it uses the PaymentGatewayPort
 * interface to validate and parse webhooks from any provider.
 */
export class ProcessWebhookUseCase {
  constructor(
    private readonly paymentGateway: PaymentGatewayPort,
    private readonly onPaymentConfirmed?: (transactionId: string, externalId?: string) => Promise<void>,
    private readonly onPaymentFailed?: (transactionId: string, externalId?: string) => Promise<void>,
  ) {}

  /**
   * Execute the use case
   * @param input Webhook payload and signature
   * @returns Processing result
   */
  async execute(input: ProcessWebhookInput): Promise<ProcessWebhookOutput> {
    // 1. Validate webhook signature and parse payload
    const validation = this.paymentGateway.validateWebhook(
      input.payload,
      input.signature
    );

    if (!validation.isValid || !validation.payload) {
      throw new PaymentError(
        validation.error || 'Invalid webhook signature',
        PaymentErrorCode.WEBHOOK_INVALID
      );
    }

    const { transactionId, externalId, status } = validation.payload;

    // 2. Handle payment confirmation
    if (status === 'paid' && this.onPaymentConfirmed) {
      await this.onPaymentConfirmed(transactionId, externalId);
    }

    // 3. Handle payment failure
    if ((status === 'failed' || status === 'cancelled') && this.onPaymentFailed) {
      await this.onPaymentFailed(transactionId, externalId);
    }

    return {
      processed: true,
      transactionId,
      externalId,
      newStatus: status,
      isPaid: status === 'paid',
    };
  }
}

/**
 * Factory function to create ProcessWebhookUseCase with default handlers
 */
export function createProcessWebhookUseCase(
  paymentGateway: PaymentGatewayPort,
  handlers: {
    onPaymentConfirmed?: (transactionId: string, externalId?: string) => Promise<void>;
    onPaymentFailed?: (transactionId: string, externalId?: string) => Promise<void>;
  } = {}
): ProcessWebhookUseCase {
  return new ProcessWebhookUseCase(
    paymentGateway,
    handlers.onPaymentConfirmed,
    handlers.onPaymentFailed
  );
}
