import type { PaymentGatewayPort } from '@/lib/core/ports/out/payment-gateway.port';
import { getPaymentGateway, resetPaymentGateway, setPaymentGateway } from '@/lib/adapters/out/payment-gateways';
import { CreatePaymentUseCase } from '@/lib/core/use-cases/create-payment.use-case';
import { ProcessWebhookUseCase } from '@/lib/core/use-cases/process-webhook.use-case';

/**
 * Simple Dependency Injection Container
 * 
 * Manages the lifecycle of dependencies and provides factory methods
 * for use cases. This allows easy swapping of implementations for testing.
 * 
 * Usage:
 * ```typescript
 * // Get a use case
 * const createPayment = container.getCreatePaymentUseCase();
 * await createPayment.execute({ ... });
 * 
 * // For testing, inject mocks
 * container.setPaymentGateway(mockGateway);
 * ```
 */
export const container = {
  /**
   * Get the payment gateway instance
   */
  getPaymentGateway(): PaymentGatewayPort {
    return getPaymentGateway();
  },

  /**
   * Set a custom payment gateway (for testing)
   */
  setPaymentGateway(gateway: PaymentGatewayPort): void {
    setPaymentGateway(gateway);
  },

  /**
   * Reset all instances (for testing)
   */
  reset(): void {
    resetPaymentGateway();
  },

  /**
   * Get CreatePaymentUseCase instance
   */
  getCreatePaymentUseCase(
    onPaymentCreated?: Parameters<typeof CreatePaymentUseCase.prototype.execute>[0] extends infer T
      ? (result: Awaited<ReturnType<PaymentGatewayPort['createPayment']>>, orderId: string) => Promise<void>
      : never
  ): CreatePaymentUseCase {
    return new CreatePaymentUseCase(
      this.getPaymentGateway(),
      onPaymentCreated
    );
  },

  /**
   * Get ProcessWebhookUseCase instance
   */
  getProcessWebhookUseCase(handlers?: {
    onPaymentConfirmed?: (transactionId: string, externalId?: string) => Promise<void>;
    onPaymentFailed?: (transactionId: string, externalId?: string) => Promise<void>;
  }): ProcessWebhookUseCase {
    return new ProcessWebhookUseCase(
      this.getPaymentGateway(),
      handlers?.onPaymentConfirmed,
      handlers?.onPaymentFailed
    );
  },
};

export type Container = typeof container;
