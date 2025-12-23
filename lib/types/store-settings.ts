/**
 * Store Settings Types
 * Defines all customizable store configuration options
 */

export interface StoreBasicInfo {
  storeName: string;
  storeDescription?: string;
  storeEmail?: string;
  storePhone?: string;
  storeWhatsapp?: string;
}

export interface StoreAddress {
  storeAddress?: string;
  storeCity?: string;
  storeState?: string;
  storeZip?: string;
  storeCountry: string;
}

export interface StoreBranding {
  logoUrl?: string;
  logoDarkUrl?: string;
  faviconUrl?: string;
}

export interface StoreHero {
  heroType: 'image' | 'video' | 'none';
  heroImageUrl?: string;
  heroVideoUrl?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaText?: string;
  heroCtaLink?: string;
}

export interface StoreTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  foregroundColor: string;
  mutedColor: string;
  borderColor: string;
  themeMode: 'light' | 'dark' | 'system';
  borderRadius: string;
  fontFamily: string;
}

export interface StoreSocial {
  socialInstagram?: string;
  socialFacebook?: string;
  socialTwitter?: string;
  socialYoutube?: string;
  socialTiktok?: string;
}

export interface StoreSeo {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImageUrl?: string;
}

export interface StoreFeatures {
  enableWishlist: boolean;
  enableReviews: boolean;
  enableNewsletter: boolean;
  enableWhatsappButton: boolean;
}

export interface StorePayment {
  defaultPaymentGateway: string;
  currency: string;
  currencySymbol: string;
}

export interface StoreShipping {
  freeShippingThreshold?: number;
  shippingOriginZip?: string;
}

export interface StoreOnboarding {
  onboardingCompleted: boolean;
  onboardingStep: number;
}

export interface StoreSettings extends 
  StoreBasicInfo, 
  StoreAddress, 
  StoreBranding, 
  StoreHero, 
  StoreTheme, 
  StoreSocial, 
  StoreSeo, 
  StoreFeatures, 
  StorePayment, 
  StoreShipping,
  StoreOnboarding {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettingsUpdate extends Partial<Omit<StoreSettings, 'id' | 'createdAt' | 'updatedAt'>> {}

// Default settings for new stores
export const DEFAULT_STORE_SETTINGS: Omit<StoreSettings, 'id' | 'createdAt' | 'updatedAt'> = {
  // Basic Info
  storeName: 'My Store',
  storeDescription: 'Welcome to my store',
  storeCountry: 'BR',
  
  // Hero
  heroType: 'none',
  
  // Theme - Emerald green style (matching onboarding)
  primaryColor: '#10b981',
  secondaryColor: '#059669',
  accentColor: '#34d399',
  backgroundColor: '#000000',
  foregroundColor: '#ffffff',
  mutedColor: '#71717a',
  borderColor: '#27272a',
  themeMode: 'dark',
  borderRadius: '0.5rem',
  fontFamily: 'Poppins',
  
  // Features
  enableWishlist: true,
  enableReviews: true,
  enableNewsletter: true,
  enableWhatsappButton: false,
  
  // Payment
  defaultPaymentGateway: '',
  currency: 'BRL',
  currencySymbol: 'R$',
  
  // Onboarding
  onboardingCompleted: false,
  onboardingStep: 0,
};

// Onboarding steps configuration
export const ONBOARDING_STEPS = [
  { id: 0, title: 'Welcome', description: 'Get started with your store' },
  { id: 1, title: 'Basic Info', description: 'Store name and contact' },
  { id: 2, title: 'Branding', description: 'Logo and visual identity' },
  { id: 3, title: 'Colors', description: 'Theme and colors' },
  { id: 4, title: 'Hero', description: 'Homepage banner or video' },
  { id: 5, title: 'Payment', description: 'Payment gateway setup' },
  { id: 6, title: 'Review', description: 'Review and launch' },
] as const;

export type OnboardingStepId = typeof ONBOARDING_STEPS[number]['id'];

// Color presets for quick selection
export const COLOR_PRESETS = [
  { name: 'Emerald', primary: '#10b981', secondary: '#059669', accent: '#34d399' },
  { name: 'Blue', primary: '#3b82f6', secondary: '#2563eb', accent: '#60a5fa' },
  { name: 'Purple', primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa' },
  { name: 'Rose', primary: '#f43f5e', secondary: '#e11d48', accent: '#fb7185' },
  { name: 'Orange', primary: '#f97316', secondary: '#ea580c', accent: '#fb923c' },
  { name: 'Teal', primary: '#14b8a6', secondary: '#0d9488', accent: '#2dd4bf' },
  { name: 'Indigo', primary: '#6366f1', secondary: '#4f46e5', accent: '#818cf8' },
  { name: 'Pink', primary: '#ec4899', secondary: '#db2777', accent: '#f472b6' },
] as const;

// Font options
export const FONT_OPTIONS = [
  'Montserrat',
  'Inter',
  'Roboto',
  'Open Sans',
  'Poppins',
  'Lato',
  'Nunito',
  'Raleway',
] as const;
