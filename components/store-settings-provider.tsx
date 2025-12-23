"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { StoreSettings } from '@/lib/types/store-settings';

interface StoreSettingsContextType {
  settings: StoreSettings | null;
  isLoading: boolean;
}

const StoreSettingsContext = createContext<StoreSettingsContextType>({
  settings: null,
  isLoading: true,
});

export function useStoreConfig() {
  return useContext(StoreSettingsContext);
}

// Convert hex color to HSL format for CSS variables
function hexToHsl(hex: string): string {
  if (!hex || !hex.startsWith('#')) return '0 0% 50%';
  
  hex = hex.replace('#', '');
  if (hex.length !== 6) return '0 0% 50%';
  
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

interface StoreSettingsProviderProps {
  children: ReactNode;
  initialSettings?: StoreSettings | null;
}

export function StoreSettingsProvider({ children, initialSettings }: StoreSettingsProviderProps) {
  const [settings, setSettings] = useState<StoreSettings | null>(initialSettings || null);
  const [isLoading, setIsLoading] = useState(!initialSettings);

  useEffect(() => {
    if (!initialSettings) {
      fetch('/api/store-settings')
        .then(res => res.json())
        .then(data => {
          if (data.settings) {
            setSettings(data.settings);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [initialSettings]);

  // Apply custom CSS variables when settings change
  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;
    
    // Apply theme colors as CSS custom properties (hex format)
    if (settings.primaryColor) {
      root.style.setProperty('--color-primary', settings.primaryColor);
      // Also set HSL format for shadcn components
      root.style.setProperty('--primary', hexToHsl(settings.primaryColor));
      root.style.setProperty('--ring', hexToHsl(settings.primaryColor));
    }
    if (settings.secondaryColor) {
      root.style.setProperty('--color-secondary', settings.secondaryColor);
    }
    if (settings.accentColor) {
      root.style.setProperty('--color-accent', settings.accentColor);
      root.style.setProperty('--accent', hexToHsl(settings.accentColor));
    }
    if (settings.backgroundColor) {
      root.style.setProperty('--color-background', settings.backgroundColor);
    }
    if (settings.foregroundColor) {
      root.style.setProperty('--color-foreground', settings.foregroundColor);
    }
    if (settings.borderRadius) {
      root.style.setProperty('--radius', settings.borderRadius);
    }

    // Update document title
    if (settings.storeName) {
      document.title = settings.storeName;
    }

    // Update favicon if set
    if (settings.faviconUrl) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = settings.faviconUrl;
      document.head.appendChild(link);
    }
  }, [settings]);

  return (
    <StoreSettingsContext.Provider value={{ settings, isLoading }}>
      {children}
    </StoreSettingsContext.Provider>
  );
}
