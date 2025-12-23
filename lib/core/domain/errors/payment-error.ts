import { DomainError } from './domain-error';

/**
 * Error codes for payment-related errors
 */
export enum PaymentErrorCode {
  GATEWAY_UNAVAILABLE = 'GATEWAY_UNAVAILABLE',
  GATEWAY_ERROR = 'GATEWAY_ERROR',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_CUSTOMER = 'INVALID_CUSTOMER',
  PAYMENT_DECLINED = 'PAYMENT_DECLINED',
  PAYMENT_NOT_FOUND = 'PAYMENT_NOT_FOUND',
  PAYMENT_ALREADY_PROCESSED = 'PAYMENT_ALREADY_PROCESSED',
  WEBHOOK_INVALID = 'WEBHOOK_INVALID',
  WEBHOOK_SIGNATURE_MISMATCH = 'WEBHOOK_SIGNATURE_MISMATCH',
  REFUND_FAILED = 'REFUND_FAILED',
  CANCEL_FAILED = 'CANCEL_FAILED',
}

/**
 * Error class for payment-related errors
 */
export class PaymentError extends DomainError {
  constructor(
    message: string,
    public readonly code: PaymentErrorCode,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'PaymentError';
    Object.setPrototypeOf(this, PaymentError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }
}

/**
 * Error class for payment gateway infrastructure errors
 */
export class PaymentGatewayError extends Error {
  constructor(
    message: string,
    public readonly gatewayName: string,
    public readonly statusCode?: number,
    public readonly rawError?: unknown
  ) {
    super(message);
    this.name = 'PaymentGatewayError';
    Object.setPrototypeOf(this, PaymentGatewayError.prototype);
  }
}
