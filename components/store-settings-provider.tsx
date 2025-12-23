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
    
    // Apply theme colors as CSS custom properties
    if (settings.primaryColor) {
      root.style.setProperty('--color-primary', settings.primaryColor);
    }
    if (settings.secondaryColor) {
      root.style.setProperty('--color-secondary', settings.secondaryColor);
    }
    if (settings.accentColor) {
      root.style.setProperty('--color-accent', settings.accentColor);
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
