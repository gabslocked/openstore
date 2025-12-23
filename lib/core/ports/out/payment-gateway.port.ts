/**
 * Payment Gateway Port (Output Port)
 * 
 * This interface defines the contract that any payment gateway adapter must implement.
 * Following the Hexagonal Architecture pattern, the domain/application layer depends
 * on this interface, not on concrete implementations.
 * 
 * To add a new payment gateway:
 * 1. Create a new adapter in /lib/adapters/out/payment-gateways/
 * 2. Implement this interface
 * 3. Register the adapter in the factory
 */

/**
 * Input data for creating a payment
 */
export interface CreatePaymentInput {
  /** Amount in the smallest currency unit (cents for BRL) */
  amount: number;
  /** Payment description */
  description: string;
  /** Customer information */
  customer: {
    name: string;
    document: string;
    email?: string;
    phone?: string;
  };
  /** External reference ID (e.g., order ID) */
  externalId: string;
  /** URL for webhook callbacks */
  callbackUrl?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Payment status enum
 */
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'expired';

/**
 * Result of a payment creation
 */
export interface PaymentResult {
  /** Whether the payment was created successfully */
  success: boolean;
  /** Gateway's transaction ID */
  transactionId: string;
  /** Current payment status */
  status: PaymentStatus;
  /** Payment amount */
  amount: number;
  /** When the payment expires (for PIX, boleto, etc.) */
  expiresAt?: Date;
  /** PIX-specific data */
  pixData?: {
    qrCode: string;
    qrCodeBase64: string;
    pixKey: string;
  };
  /** Credit card-specific data */
  cardData?: {
    authorizationCode: string;
    lastFourDigits: string;
    brand: string;
  };
  /** Boleto-specific data */
  boletoData?: {
    barcode: string;
    digitableLine: string;
    pdfUrl: string;
  };
}

/**
 * Result of a payment status check
 */
export interface PaymentStatusResult {
  transactionId: string;
  status: PaymentStatus;
  amount: number;
  paidAt?: Date;
  refundedAt?: Date;
}

/**
 * Webhook payload after validation
 */
export interface WebhookPayload {
  event: string;
  transactionId: string;
  externalId?: string;
  status: PaymentStatus;
  amount: number;
  paidAt?: Date;
}

/**
 * Result of webhook validation
 */
export interface WebhookValidation {
  isValid: boolean;
  payload?: WebhookPayload;
  error?: string;
}

/**
 * Refund result
 */
export interface RefundResult {
  success: boolean;
  refundId?: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
}

/**
 * Payment Gateway Port Interface
 * 
 * All payment gateway adapters must implement this interface.
 * This allows the application to switch between different payment
 * providers without changing the business logic.
 */
export interface PaymentGatewayPort {
  /** Gateway identifier name */
  readonly name: string;

  /**
   * Create a new payment
   * @param input Payment creation data
   * @returns Payment result with transaction details
   */
  createPayment(input: CreatePaymentInput): Promise<PaymentResult>;

  /**
   * Get the current status of a payment
   * @param transactionId Gateway's transaction ID
   * @returns Current payment status
   */
  getPaymentStatus(transactionId: string): Promise<PaymentStatusResult>;

  /**
   * Validate and parse a webhook payload
   * @param payload Raw webhook payload (string)
   * @param signature Webhook signature header
   * @returns Validation result with parsed payload
   */
  validateWebhook(payload: string, signature: string): WebhookValidation;

  /**
   * Cancel a pending payment (optional)
   * @param transactionId Gateway's transaction ID
   * @returns Whether the cancellation was successful
   */
  cancelPayment?(transactionId: string): Promise<boolean>;

  /**
   * Refund a paid payment (optional)
   * @param transactionId Gateway's transaction ID
   * @param amount Amount to refund (partial refund if less than total)
   * @returns Refund result
   */
  refundPayment?(transactionId: string, amount?: number): Promise<RefundResult>;

  /**
   * Check if the gateway supports a specific payment method
   * @param method Payment method to check
   * @returns Whether the method is supported
   */
  supportsMethod?(method: 'pix' | 'credit_card' | 'boleto' | 'debit_card'): boolean;
}
