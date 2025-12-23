import type { PaymentGatewayPort } from '@/lib/core/ports/out/payment-gateway.port';
import { GreenPagAdapter, type GreenPagConfig } from './greenpag.adapter';

/**
 * Supported payment gateway types
 */
export type GatewayType = 'greenpag' | 'stripe' | 'mercadopago' | 'pagseguro';

/**
 * Gateway factory registry
 */
const gatewayRegistry = new Map<GatewayType, () => PaymentGatewayPort>();

/**
 * Register GreenPag adapter
 */
gatewayRegistry.set('greenpag', () => {
  const config: GreenPagConfig = {
    apiUrl: process.env.GREENPAG_API_URL || 'https://greenpag.com/api/v1',
    publicKey: process.env.GREENPAG_PUBLIC_KEY || '',
    secretKey: process.env.GREENPAG_SECRET_KEY || '',
  };

  if (!config.publicKey || !config.secretKey) {
    throw new Error('GreenPag: GREENPAG_PUBLIC_KEY and GREENPAG_SECRET_KEY are required');
  }

  return new GreenPagAdapter(config);
});

/**
 * Create a payment gateway instance
 * @param type Gateway type (defaults to environment configuration)
 * @returns Payment gateway instance
 */
export function createPaymentGateway(type?: GatewayType): PaymentGatewayPort {
  const gatewayType = type || getDefaultGateway();

  const factory = gatewayRegistry.get(gatewayType);

  if (!factory) {
    throw new Error(
      `Payment gateway '${gatewayType}' is not registered. ` +
      `Available gateways: ${Array.from(gatewayRegistry.keys()).join(', ')}`
    );
  }

  return factory();
}

/**
 * Get the default payment gateway from environment
 */
function getDefaultGateway(): GatewayType {
  const gateway = process.env.DEFAULT_PAYMENT_GATEWAY as GatewayType;
  return gateway || 'greenpag';
}

/**
 * Singleton instance for default gateway
 */
let defaultGatewayInstance: PaymentGatewayPort | null = null;

/**
 * Get the default payment gateway (singleton)
 * @returns Default payment gateway instance
 */
export function getPaymentGateway(): PaymentGatewayPort {
  if (!defaultGatewayInstance) {
    defaultGatewayInstance = createPaymentGateway();
  }
  return defaultGatewayInstance;
}

/**
 * Reset the gateway instance (useful for testing)
 */
export function resetPaymentGateway(): void {
  defaultGatewayInstance = null;
}

/**
 * Set a custom gateway instance (useful for testing)
 */
export function setPaymentGateway(gateway: PaymentGatewayPort): void {
  defaultGatewayInstance = gateway;
}

/**
 * Register a new gateway adapter
 * @param type Gateway type identifier
 * @param factory Factory function to create the gateway
 */
export function registerGateway(
  type: GatewayType,
  factory: () => PaymentGatewayPort
): void {
  gatewayRegistry.set(type, factory);
}

// Re-export types and adapters
export { GreenPagAdapter, type GreenPagConfig } from './greenpag.adapter';
export type { PaymentGatewayPort } from '@/lib/core/ports/out/payment-gateway.port';
