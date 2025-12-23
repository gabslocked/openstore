/**
 * Integration Types
 * Defines types for payment gateways and other integrations
 * All payment gateways are configured via Admin UI
 */

export type IntegrationType = 'payment_gateway' | 'webhook' | 'shipping' | 'analytics';

export type PaymentGatewayProvider = 'stripe' | 'mercadopago' | 'pagseguro';

export type WebhookProvider = 'n8n' | 'zapier' | 'custom';

export interface Integration {
  id: string;
  type: IntegrationType;
  provider: string;
  name: string;
  enabled: boolean;
  isDefault: boolean;
  configPublic: Record<string, any>;
  lastTestAt?: string;
  lastTestSuccess?: boolean;
  lastTestError?: string;
  createdAt: string;
  updatedAt: string;
}

// Gateway-specific configuration interfaces
export interface StripeConfig {
  publicKey: string;
  secretKey: string;
  webhookSecret?: string;
}

export interface MercadoPagoConfig {
  accessToken: string;
  publicKey: string;
}

export interface PagSeguroConfig {
  email: string;
  token: string;
}

export interface WebhookConfig {
  url: string;
  secret?: string;
  events?: string[];
}

// Union type for all gateway configs
export type PaymentGatewayConfig = StripeConfig | MercadoPagoConfig | PagSeguroConfig;

// Gateway metadata for UI
export interface GatewayInfo {
  provider: PaymentGatewayProvider;
  name: string;
  description: string;
  logo: string;
  supports: string[];
  fields: GatewayField[];
  testEndpoint?: string;
  docsUrl?: string;
}

export interface GatewayField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url';
  placeholder?: string;
  required: boolean;
  helpText?: string;
}

// Available payment gateways with their configuration
export const PAYMENT_GATEWAYS: GatewayInfo[] = [
  {
    provider: 'stripe',
    name: 'Stripe',
    description: 'Cartões, PIX, Boleto e mais',
    logo: '💳',
    supports: ['Cartão', 'PIX', 'Boleto'],
    docsUrl: 'https://stripe.com/docs',
    fields: [
      {
        key: 'publicKey',
        label: 'Publishable Key',
        type: 'text',
        placeholder: 'pk_test_... ou pk_live_...',
        required: true,
        helpText: 'Encontre em Developers > API Keys',
      },
      {
        key: 'secretKey',
        label: 'Secret Key',
        type: 'password',
        placeholder: 'sk_test_... ou sk_live_...',
        required: true,
        helpText: 'Nunca exponha esta chave no frontend',
      },
      {
        key: 'webhookSecret',
        label: 'Webhook Signing Secret',
        type: 'password',
        placeholder: 'whsec_...',
        required: false,
        helpText: 'Encontre em Developers > Webhooks',
      },
    ],
  },
  {
    provider: 'mercadopago',
    name: 'MercadoPago',
    description: 'Cartões, PIX, Boleto',
    logo: '🔵',
    supports: ['Cartão', 'PIX', 'Boleto'],
    docsUrl: 'https://www.mercadopago.com.br/developers',
    fields: [
      {
        key: 'publicKey',
        label: 'Public Key',
        type: 'text',
        placeholder: 'APP_USR-...',
        required: true,
        helpText: 'Encontre em Suas integrações > Credenciais',
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password',
        placeholder: 'APP_USR-...',
        required: true,
        helpText: 'Token de produção ou sandbox',
      },
    ],
  },
];

// Webhook providers
export const WEBHOOK_PROVIDERS = [
  {
    provider: 'n8n',
    name: 'n8n',
    description: 'Automação de workflows',
    logo: '🔄',
    fields: [
      {
        key: 'url',
        label: 'Webhook URL',
        type: 'url' as const,
        placeholder: 'https://your-n8n.com/webhook/...',
        required: true,
      },
    ],
  },
  {
    provider: 'custom',
    name: 'Webhook Customizado',
    description: 'Envie eventos para qualquer URL',
    logo: '🔗',
    fields: [
      {
        key: 'url',
        label: 'Webhook URL',
        type: 'url' as const,
        placeholder: 'https://...',
        required: true,
      },
      {
        key: 'secret',
        label: 'Secret (HMAC)',
        type: 'password' as const,
        placeholder: 'Opcional',
        required: false,
        helpText: 'Para validar assinatura dos webhooks',
      },
    ],
  },
];
