import type { PaymentGatewayPort } from '@/lib/core/ports/out/payment-gateway.port';

/**
 * Supported payment gateway types
 * Payment gateways are configured via Admin UI, not hardcoded
 */
export type GatewayType = 'stripe' | 'mercadopago' | 'pagseguro';

/**
 * Gateway factory registry
 * Gateways are registered dynamically based on configuration
 */
const gatewayRegistry = new Map<GatewayType, () => PaymentGatewayPort>();

/**
 * Create a payment gateway instance
 * @param type Gateway type (defaults to environment configuration)
 * @returns Payment gateway instance or null if not configured
 */
export function createPaymentGateway(type?: GatewayType): PaymentGatewayPort | null {
  const gatewayType = type || getDefaultGateway();

  if (!gatewayType) {
    return null;
  }

  const factory = gatewayRegistry.get(gatewayType);

  if (!factory) {
    console.warn(
      `Payment gateway '${gatewayType}' is not registered. ` +
      `Available gateways: ${Array.from(gatewayRegistry.keys()).join(', ') || 'none'}`
    );
    return null;
  }

  try {
    return factory();
  } catch (error) {
    console.error(`Failed to create payment gateway '${gatewayType}':`, error);
    return null;
  }
}

/**
 * Get the default payment gateway from environment
 */
function getDefaultGateway(): GatewayType | null {
  const gateway = process.env.DEFAULT_PAYMENT_GATEWAY as GatewayType;
  return gateway || null;
}

/**
 * Singleton instance for default gateway
 */
let defaultGatewayInstance: PaymentGatewayPort | null = null;

/**
 * Get the default payment gateway (singleton)
 * @returns Default payment gateway instance or null if not configured
 */
export function getPaymentGateway(): PaymentGatewayPort | null {
  if (!defaultGatewayInstance) {
    defaultGatewayInstance = createPaymentGateway();
  }
  return defaultGatewayInstance;
}

/**
 * Check if a payment gateway is configured
 */
export function hasPaymentGateway(): boolean {
  return getPaymentGateway() !== null;
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

/**
 * Get list of available gateway types
 */
export function getAvailableGateways(): GatewayType[] {
  return Array.from(gatewayRegistry.keys());
}

// Re-export types
export type { PaymentGatewayPort } from '@/lib/core/ports/out/payment-gateway.port';
