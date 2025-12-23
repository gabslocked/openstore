/**
 * Store Settings Data Access Layer
 * Handles database operations for store configuration
 */

import { query, queryOne } from './infrastructure/database/pool';
import type { StoreSettings, StoreSettingsUpdate } from './types/store-settings';

// Convert snake_case DB columns to camelCase
function dbToSettings(row: any): StoreSettings {
  return {
    id: row.id,
    storeName: row.store_name,
    storeDescription: row.store_description,
    storeEmail: row.store_email,
    storePhone: row.store_phone,
    storeWhatsapp: row.store_whatsapp,
    storeAddress: row.store_address,
    storeCity: row.store_city,
    storeState: row.store_state,
    storeZip: row.store_zip,
    storeCountry: row.store_country,
    logoUrl: row.logo_url,
    logoDarkUrl: row.logo_dark_url,
    faviconUrl: row.favicon_url,
    heroType: row.hero_type,
    heroImageUrl: row.hero_image_url,
    heroVideoUrl: row.hero_video_url,
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    heroCtaText: row.hero_cta_text,
    heroCtaLink: row.hero_cta_link,
    primaryColor: row.primary_color,
    secondaryColor: row.secondary_color,
    accentColor: row.accent_color,
    backgroundColor: row.background_color,
    foregroundColor: row.foreground_color,
    mutedColor: row.muted_color,
    borderColor: row.border_color,
    themeMode: row.theme_mode,
    borderRadius: row.border_radius,
    fontFamily: row.font_family,
    socialInstagram: row.social_instagram,
    socialFacebook: row.social_facebook,
    socialTwitter: row.social_twitter,
    socialYoutube: row.social_youtube,
    socialTiktok: row.social_tiktok,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    seoKeywords: row.seo_keywords,
    ogImageUrl: row.og_image_url,
    enableWishlist: row.enable_wishlist,
    enableReviews: row.enable_reviews,
    enableNewsletter: row.enable_newsletter,
    enableWhatsappButton: row.enable_whatsapp_button,
    defaultPaymentGateway: row.default_payment_gateway,
    currency: row.currency,
    currencySymbol: row.currency_symbol,
    freeShippingThreshold: row.free_shipping_threshold ? parseFloat(row.free_shipping_threshold) : undefined,
    shippingOriginZip: row.shipping_origin_zip,
    onboardingCompleted: row.onboarding_completed,
    onboardingStep: row.onboarding_step,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Convert camelCase to snake_case for DB
function settingsToDb(settings: StoreSettingsUpdate): Record<string, any> {
  const mapping: Record<string, string> = {
    storeName: 'store_name',
    storeDescription: 'store_description',
    storeEmail: 'store_email',
    storePhone: 'store_phone',
    storeWhatsapp: 'store_whatsapp',
    storeAddress: 'store_address',
    storeCity: 'store_city',
    storeState: 'store_state',
    storeZip: 'store_zip',
    storeCountry: 'store_country',
    logoUrl: 'logo_url',
    logoDarkUrl: 'logo_dark_url',
    faviconUrl: 'favicon_url',
    heroType: 'hero_type',
    heroImageUrl: 'hero_image_url',
    heroVideoUrl: 'hero_video_url',
    heroTitle: 'hero_title',
    heroSubtitle: 'hero_subtitle',
    heroCtaText: 'hero_cta_text',
    heroCtaLink: 'hero_cta_link',
    primaryColor: 'primary_color',
    secondaryColor: 'secondary_color',
    accentColor: 'accent_color',
    backgroundColor: 'background_color',
    foregroundColor: 'foreground_color',
    mutedColor: 'muted_color',
    borderColor: 'border_color',
    themeMode: 'theme_mode',
    borderRadius: 'border_radius',
    fontFamily: 'font_family',
    socialInstagram: 'social_instagram',
    socialFacebook: 'social_facebook',
    socialTwitter: 'social_twitter',
    socialYoutube: 'social_youtube',
    socialTiktok: 'social_tiktok',
    seoTitle: 'seo_title',
    seoDescription: 'seo_description',
    seoKeywords: 'seo_keywords',
    ogImageUrl: 'og_image_url',
    enableWishlist: 'enable_wishlist',
    enableReviews: 'enable_reviews',
    enableNewsletter: 'enable_newsletter',
    enableWhatsappButton: 'enable_whatsapp_button',
    defaultPaymentGateway: 'default_payment_gateway',
    currency: 'currency',
    currencySymbol: 'currency_symbol',
    freeShippingThreshold: 'free_shipping_threshold',
    shippingOriginZip: 'shipping_origin_zip',
    onboardingCompleted: 'onboarding_completed',
    onboardingStep: 'onboarding_step',
  };

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(settings)) {
    const dbKey = mapping[key];
    if (dbKey && value !== undefined) {
      result[dbKey] = value;
    }
  }
  return result;
}

/**
 * Get store settings (creates default if not exists)
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    let row = await queryOne('SELECT * FROM store_settings LIMIT 1');
    
    if (!row) {
      // Create default settings
      row = await queryOne(`
        INSERT INTO store_settings (store_name, store_description)
        VALUES ('My Store', 'Welcome to my store')
        RETURNING *
      `);
    }
    
    return dbToSettings(row);
  } catch (error) {
    console.error('Error getting store settings:', error);
    throw error;
  }
}

/**
 * Update store settings
 */
export async function updateStoreSettings(updates: StoreSettingsUpdate): Promise<StoreSettings> {
  try {
    const dbUpdates = settingsToDb(updates);
    const keys = Object.keys(dbUpdates);
    
    if (keys.length === 0) {
      return getStoreSettings();
    }
    
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = Object.values(dbUpdates);
    
    const row = await queryOne(`
      UPDATE store_settings
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT id FROM store_settings LIMIT 1)
      RETURNING *
    `, values);
    
    if (!row) {
      throw new Error('Failed to update store settings');
    }
    
    return dbToSettings(row);
  } catch (error) {
    console.error('Error updating store settings:', error);
    throw error;
  }
}

/**
 * Check if onboarding is completed
 */
export async function isOnboardingCompleted(): Promise<boolean> {
  try {
    const row = await queryOne('SELECT onboarding_completed FROM store_settings LIMIT 1');
    return row?.onboarding_completed ?? false;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
}

/**
 * Get current onboarding step
 */
export async function getOnboardingStep(): Promise<number> {
  try {
    const row = await queryOne('SELECT onboarding_step FROM store_settings LIMIT 1');
    return row?.onboarding_step ?? 0;
  } catch (error) {
    console.error('Error getting onboarding step:', error);
    return 0;
  }
}

/**
 * Complete onboarding
 */
export async function completeOnboarding(): Promise<void> {
  try {
    await query(`
      UPDATE store_settings
      SET onboarding_completed = TRUE, onboarding_step = 6, updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT id FROM store_settings LIMIT 1)
    `);
  } catch (error) {
    console.error('Error completing onboarding:', error);
    throw error;
  }
}
