-- ===========================================
-- OpenStore - Integrations Migration
-- Stores payment gateway and webhook configurations
-- ===========================================

-- ===========================================
-- INTEGRATIONS TABLE
-- Stores encrypted API keys and configuration
-- ===========================================
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Integration type and provider
    type VARCHAR(50) NOT NULL, -- 'payment_gateway', 'webhook', 'shipping', 'analytics'
    provider VARCHAR(50) NOT NULL, -- 'greenpag', 'stripe', 'mercadopago', 'n8n', etc.
    name VARCHAR(100) NOT NULL, -- Display name
    
    -- Status
    enabled BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    
    -- Configuration (encrypted JSON)
    config_encrypted TEXT, -- Encrypted JSON with API keys
    
    -- Public configuration (non-sensitive)
    config_public JSONB DEFAULT '{}', -- Non-sensitive config like API URLs
    
    -- Connection status
    last_test_at TIMESTAMP WITH TIME ZONE,
    last_test_success BOOLEAN,
    last_test_error TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint per type/provider
    UNIQUE(type, provider)
);

-- Trigger for updated_at
CREATE TRIGGER update_integrations_updated_at 
    BEFORE UPDATE ON integrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(type);
CREATE INDEX IF NOT EXISTS idx_integrations_enabled ON integrations(enabled);

-- ===========================================
-- WEBHOOK LOGS TABLE
-- Stores incoming webhook events for debugging
-- ===========================================
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID REFERENCES integrations(id) ON DELETE SET NULL,
    
    -- Request info
    method VARCHAR(10),
    path VARCHAR(255),
    headers JSONB,
    body TEXT,
    
    -- Response info
    status_code INTEGER,
    response TEXT,
    
    -- Processing
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    error TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_integration ON webhook_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created ON webhook_logs(created_at);

-- ===========================================
-- INSERT DEFAULT PAYMENT GATEWAYS (disabled)
-- ===========================================
INSERT INTO integrations (type, provider, name, enabled, config_public) VALUES
    ('payment_gateway', 'greenpag', 'GreenPag', FALSE, '{"api_url": "https://api.greenpag.com.br/v1", "supports": ["pix"]}'),
    ('payment_gateway', 'stripe', 'Stripe', FALSE, '{"api_url": "https://api.stripe.com/v1", "supports": ["card", "pix", "boleto"]}'),
    ('payment_gateway', 'mercadopago', 'MercadoPago', FALSE, '{"api_url": "https://api.mercadopago.com/v1", "supports": ["card", "pix", "boleto"]}')
ON CONFLICT (type, provider) DO NOTHING;
