import { z } from 'zod';

/**
 * Environment variables schema
 * All required environment variables are validated at startup
 * No fallback values for sensitive credentials
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),

  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters for security'),

  // Payment Gateway Selection
  DEFAULT_PAYMENT_GATEWAY: z
    .enum(['greenpag', 'stripe', 'mercadopago', 'pagseguro'])
    .default('greenpag'),

  // GreenPag Configuration
  GREENPAG_API_URL: z.string().url().default('https://greenpag.com/api/v1'),
  GREENPAG_PUBLIC_KEY: z.string().min(1, 'GREENPAG_PUBLIC_KEY is required when using GreenPag'),
  GREENPAG_SECRET_KEY: z.string().min(1, 'GREENPAG_SECRET_KEY is required when using GreenPag'),

  // Stripe Configuration (optional - for future use)
  STRIPE_PUBLIC_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // MercadoPago Configuration (optional - for future use)
  MERCADOPAGO_ACCESS_TOKEN: z.string().optional(),
  MERCADOPAGO_PUBLIC_KEY: z.string().optional(),

  // Site Configuration
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),

  // Webhooks
  N8N_WEBHOOK_URL: z.string().url().optional(),

  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type EnvConfig = z.infer<typeof envSchema>;

let cachedConfig: EnvConfig | null = null;

/**
 * Validate and get environment configuration
 * Throws an error with detailed messages if validation fails
 */
export function getEnvConfig(): EnvConfig {
  if (cachedConfig) return cachedConfig;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(
      `\n❌ Environment validation failed:\n${errors}\n\n` +
        `Please check your .env file and ensure all required variables are set.\n` +
        `See .env.example for reference.\n`
    );
  }

  cachedConfig = result.data;
  return cachedConfig;
}

/**
 * Helper object for accessing typed environment configuration
 */
export const env = {
  get database() {
    return {
      url: getEnvConfig().DATABASE_URL,
    };
  },

  get auth() {
    return {
      jwtSecret: getEnvConfig().JWT_SECRET,
    };
  },

  get greenpag() {
    const config = getEnvConfig();
    return {
      apiUrl: config.GREENPAG_API_URL,
      publicKey: config.GREENPAG_PUBLIC_KEY,
      secretKey: config.GREENPAG_SECRET_KEY,
    };
  },

  get stripe() {
    const config = getEnvConfig();
    return {
      publicKey: config.STRIPE_PUBLIC_KEY,
      secretKey: config.STRIPE_SECRET_KEY,
      webhookSecret: config.STRIPE_WEBHOOK_SECRET,
    };
  },

  get mercadopago() {
    const config = getEnvConfig();
    return {
      accessToken: config.MERCADOPAGO_ACCESS_TOKEN,
      publicKey: config.MERCADOPAGO_PUBLIC_KEY,
    };
  },

  get defaultPaymentGateway() {
    return getEnvConfig().DEFAULT_PAYMENT_GATEWAY;
  },

  get siteUrl() {
    return getEnvConfig().NEXT_PUBLIC_SITE_URL;
  },

  get n8nWebhookUrl() {
    return getEnvConfig().N8N_WEBHOOK_URL;
  },

  get isDevelopment() {
    return getEnvConfig().NODE_ENV === 'development';
  },

  get isProduction() {
    return getEnvConfig().NODE_ENV === 'production';
  },

  get isTest() {
    return getEnvConfig().NODE_ENV === 'test';
  },
};

/**
 * Validate environment on module load in production
 * In development, validation happens on first access
 */
if (process.env.NODE_ENV === 'production') {
  try {
    getEnvConfig();
    console.log('✅ Environment configuration validated successfully');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
