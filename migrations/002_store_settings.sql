-- ===========================================
-- OpenStore - Store Settings Migration
-- Customizable store configuration
-- ===========================================

-- ===========================================
-- STORE SETTINGS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS store_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Info
    store_name VARCHAR(255) NOT NULL DEFAULT 'My Store',
    store_description TEXT,
    store_email VARCHAR(255),
    store_phone VARCHAR(50),
    store_whatsapp VARCHAR(50),
    
    -- Address
    store_address VARCHAR(255),
    store_city VARCHAR(100),
    store_state VARCHAR(2),
    store_zip VARCHAR(10),
    store_country VARCHAR(2) DEFAULT 'BR',
    
    -- Branding - Logo
    logo_url VARCHAR(500),
    logo_dark_url VARCHAR(500),
    favicon_url VARCHAR(500),
    
    -- Branding - Hero/Banner
    hero_type VARCHAR(20) DEFAULT 'image', -- 'image', 'video', 'none'
    hero_image_url VARCHAR(500),
    hero_video_url VARCHAR(500),
    hero_title VARCHAR(255),
    hero_subtitle TEXT,
    hero_cta_text VARCHAR(100),
    hero_cta_link VARCHAR(255),
    
    -- Theme Colors
    primary_color VARCHAR(7) DEFAULT '#10b981', -- Emerald green
    secondary_color VARCHAR(7) DEFAULT '#3b82f6', -- Blue
    accent_color VARCHAR(7) DEFAULT '#f59e0b', -- Amber
    background_color VARCHAR(7) DEFAULT '#000000', -- Black
    foreground_color VARCHAR(7) DEFAULT '#ffffff', -- White
    muted_color VARCHAR(7) DEFAULT '#71717a', -- Gray
    border_color VARCHAR(7) DEFAULT '#27272a', -- Dark gray
    
    -- Theme Settings
    theme_mode VARCHAR(10) DEFAULT 'dark', -- 'light', 'dark', 'system'
    border_radius VARCHAR(10) DEFAULT '0.5rem',
    font_family VARCHAR(100) DEFAULT 'Montserrat',
    
    -- Social Links
    social_instagram VARCHAR(255),
    social_facebook VARCHAR(255),
    social_twitter VARCHAR(255),
    social_youtube VARCHAR(255),
    social_tiktok VARCHAR(255),
    
    -- SEO
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT,
    og_image_url VARCHAR(500),
    
    -- Features
    enable_wishlist BOOLEAN DEFAULT TRUE,
    enable_reviews BOOLEAN DEFAULT TRUE,
    enable_newsletter BOOLEAN DEFAULT TRUE,
    enable_whatsapp_button BOOLEAN DEFAULT FALSE,
    
    -- Payment
    default_payment_gateway VARCHAR(50) DEFAULT 'greenpag',
    currency VARCHAR(3) DEFAULT 'BRL',
    currency_symbol VARCHAR(5) DEFAULT 'R$',
    
    -- Shipping
    free_shipping_threshold DECIMAL(10, 2),
    shipping_origin_zip VARCHAR(10),
    
    -- Onboarding
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_step INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for updated_at
CREATE TRIGGER update_store_settings_updated_at 
    BEFORE UPDATE ON store_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings if not exists
INSERT INTO store_settings (store_name, store_description)
SELECT 'My Store', 'Welcome to my store'
WHERE NOT EXISTS (SELECT 1 FROM store_settings);

-- ===========================================
-- STORE ASSETS TABLE (for uploaded files)
-- ===========================================
CREATE TABLE IF NOT EXISTS store_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'image', 'video'
    file_url VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    alt_text VARCHAR(255),
    category VARCHAR(50), -- 'logo', 'hero', 'product', 'banner'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_store_assets_category ON store_assets(category);
