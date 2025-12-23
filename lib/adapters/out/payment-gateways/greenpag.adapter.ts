import crypto from 'crypto';
import type {
  PaymentGatewayPort,
  CreatePaymentInput,
  PaymentResult,
  PaymentStatusResult,
  WebhookValidation,
  PaymentStatus,
} from '@/lib/core/ports/out/payment-gateway.port';
import { PaymentGatewayError } from '@/lib/core/domain/errors/payment-error';

/**
 * GreenPag API response data structure
 */
interface GreenPagResponseData {
  transaction_id: string;
  status: string;
  amount: number;
  qr_code: string;
  qr_code_image: string;
  expires_at?: string;
  paid_at?: string;
  created_at?: string;
}

/**
 * GreenPag configuration interface
 */
export interface GreenPagConfig {
  apiUrl: string;
  publicKey: string;
  secretKey: string;
}

/**
 * GreenPag Payment Gateway Adapter
 * 
 * Implements the PaymentGatewayPort interface for GreenPag PIX payments.
 * This adapter can be swapped with any other payment gateway adapter
 * without changing the business logic.
 */
export class GreenPagAdapter implements PaymentGatewayPort {
  readonly name = 'greenpag';

  private readonly apiUrl: string;
  private readonly publicKey: string;
  private readonly secretKey: string;

  constructor(config: GreenPagConfig) {
    this.apiUrl = config.apiUrl;
    this.publicKey = config.publicKey;
    this.secretKey = config.secretKey;

    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.publicKey) {
      throw new Error('GreenPag: publicKey is required');
    }
    if (!this.secretKey) {
      throw new Error('GreenPag: secretKey is required');
    }
    if (!this.apiUrl) {
      throw new Error('GreenPag: apiUrl is required');
    }
  }

  /**
   * Create a PIX payment
   */
  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.apiUrl}/payments`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          amount: input.amount,
          description: input.description,
          customer: {
            name: input.customer.name,
            document: input.customer.document,
            email: input.customer.email,
          },
          external_id: input.externalId,
          callback_url: input.callbackUrl,
        }),
      });

      const result = await this.handleResponse(response);

      return {
        success: true,
        transactionId: result.data.transaction_id,
        status: this.mapStatus(result.data.status),
        amount: result.data.amount,
        expiresAt: result.data.expires_at ? new Date(result.data.expires_at) : undefined,
        pixData: {
          qrCode: result.data.qr_code,
          qrCodeBase64: result.data.qr_code_image,
          pixKey: result.data.qr_code,
        },
      };
    } catch (error) {
      if (error instanceof PaymentGatewayError) {
        throw error;
      }
      throw new PaymentGatewayError(
        `Failed to create payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.name,
        undefined,
        error
      );
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(transactionId: string): Promise<PaymentStatusResult> {
    try {
      const response = await fetch(`${this.apiUrl}/payments/${transactionId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const result = await this.handleResponse(response);

      return {
        transactionId: result.data.transaction_id,
        status: this.mapStatus(result.data.status),
        amount: result.data.amount,
        paidAt: result.data.paid_at ? new Date(result.data.paid_at) : undefined,
      };
    } catch (error) {
      if (error instanceof PaymentGatewayError) {
        throw error;
      }
      throw new PaymentGatewayError(
        `Failed to get payment status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.name,
        undefined,
        error
      );
    }
  }

  /**
   * Validate webhook signature and parse payload
   */
  validateWebhook(payload: string, signature: string): WebhookValidation {
    try {
      // Calculate expected signature using HMAC-SHA256
      const expectedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(payload)
        .digest('hex');

      // Use timing-safe comparison to prevent timing attacks
      const isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature)
      );

      if (!isValid) {
        return {
          isValid: false,
          error: 'Invalid webhook signature',
        };
      }

      // Parse and return payload
      const data = JSON.parse(payload);

      return {
        isValid: true,
        payload: {
          event: data.event,
          transactionId: data.transaction_id,
          externalId: data.external_id,
          status: this.mapStatus(data.status),
          amount: data.amount,
          paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
        },
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Failed to validate webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Check if gateway supports a payment method
   */
  supportsMethod(method: 'pix' | 'credit_card' | 'boleto' | 'debit_card'): boolean {
    return method === 'pix';
  }

  /**
   * Get request headers
   */
  private getHeaders(): HeadersInit {
    return {
      'X-Public-Key': this.publicKey,
      'X-Secret-Key': this.secretKey,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Map GreenPag status to standard PaymentStatus
   */
  private mapStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      pending: 'pending',
      processing: 'processing',
      paid: 'paid',
      failed: 'failed',
      cancelled: 'cancelled',
      refunded: 'refunded',
      expired: 'expired',
    };
    return statusMap[status.toLowerCase()] || 'pending';
  }

  /**
   * Handle API response
   */
  private async handleResponse(response: Response): Promise<{ success: boolean; data: GreenPagResponseData }> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new PaymentGatewayError(
        `GreenPag API error: ${response.status} ${response.statusText}`,
        this.name,
        response.status,
        errorData
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new PaymentGatewayError(
        result.message || 'GreenPag request failed',
        this.name,
        undefined,
        result
      );
    }

    return result;
  }
}
