import type { PaymentGatewayPort, PaymentResult } from '../ports/out/payment-gateway.port';
import { PaymentError, PaymentErrorCode } from '../domain/errors/payment-error';
import { Document } from '../domain/value-objects/document';
import { Money } from '../domain/value-objects/money';

/**
 * Input for creating a payment
 */
export interface CreatePaymentUseCaseInput {
  /** Order ID (external reference) */
  orderId: string;
  /** Payment amount in decimal (e.g., 150.50) */
  amount: number;
  /** Customer information */
  customer: {
    name: string;
    document: string;
    email?: string;
    phone?: string;
  };
  /** Payment description */
  description?: string;
  /** Callback URL for webhooks */
  callbackUrl?: string;
}

/**
 * Output after creating a payment
 */
export interface CreatePaymentUseCaseOutput {
  /** Gateway transaction ID */
  transactionId: string;
  /** Payment amount */
  amount: Money;
  /** Payment status */
  status: string;
  /** Gateway name used */
  gateway: string;
  /** PIX data if available */
  pixData?: {
    qrCode: string;
    qrCodeBase64: string;
  };
  /** Expiration date if available */
  expiresAt?: Date;
}

/**
 * Create Payment Use Case
 * 
 * Orchestrates the payment creation process.
 * This use case is gateway-agnostic - it uses the PaymentGatewayPort
 * interface to create payments with any provider.
 * 
 * Responsibilities:
 * - Validate customer document (CPF/CNPJ)
 * - Validate payment amount
 * - Create payment via gateway
 * - Return standardized result
 */
export class CreatePaymentUseCase {
  constructor(
    private readonly paymentGateway: PaymentGatewayPort,
    private readonly onPaymentCreated?: (result: PaymentResult, orderId: string) => Promise<void>,
  ) {}

  /**
   * Execute the use case
   * @param input Payment creation data
   * @returns Payment result
   */
  async execute(input: CreatePaymentUseCaseInput): Promise<CreatePaymentUseCaseOutput> {
    // 1. Validate customer document
    let document: Document;
    try {
      document = Document.create(input.customer.document);
    } catch (error) {
      throw new PaymentError(
        'Invalid customer document (CPF/CNPJ)',
        PaymentErrorCode.INVALID_CUSTOMER,
        { document: input.customer.document }
      );
    }

    // 2. Validate amount
    let amount: Money;
    try {
      amount = Money.fromDecimal(input.amount);
    } catch (error) {
      throw new PaymentError(
        'Invalid payment amount',
        PaymentErrorCode.INVALID_AMOUNT,
        { amount: input.amount }
      );
    }

    if (amount.isZero()) {
      throw new PaymentError(
        'Payment amount must be greater than zero',
        PaymentErrorCode.INVALID_AMOUNT,
        { amount: input.amount }
      );
    }

    // 3. Create payment via gateway
    const result = await this.paymentGateway.createPayment({
      amount: input.amount,
      description: input.description || `Pedido ${input.orderId}`,
      customer: {
        name: input.customer.name,
        document: document.raw,
        email: input.customer.email,
        phone: input.customer.phone,
      },
      externalId: input.orderId,
      callbackUrl: input.callbackUrl,
    });

    // 4. Call hook if provided
    if (this.onPaymentCreated) {
      await this.onPaymentCreated(result, input.orderId);
    }

    // 5. Return standardized output
    return {
      transactionId: result.transactionId,
      amount,
      status: result.status,
      gateway: this.paymentGateway.name,
      pixData: result.pixData ? {
        qrCode: result.pixData.qrCode,
        qrCodeBase64: result.pixData.qrCodeBase64,
      } : undefined,
      expiresAt: result.expiresAt,
    };
  }
}

/**
 * Factory function to create CreatePaymentUseCase
 */
export function createCreatePaymentUseCase(
  paymentGateway: PaymentGatewayPort,
  onPaymentCreated?: (result: PaymentResult, orderId: string) => Promise<void>
): CreatePaymentUseCase {
  return new CreatePaymentUseCase(paymentGateway, onPaymentCreated);
}
