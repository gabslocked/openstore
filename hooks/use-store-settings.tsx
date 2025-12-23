"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { StoreSettings, StoreSettingsUpdate } from '@/lib/types/store-settings';

interface StoreSettingsContextType {
  settings: StoreSettings | null;
  isLoading: boolean;
  error: string | null;
  updateSettings: (updates: StoreSettingsUpdate) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const StoreSettingsContext = createContext<StoreSettingsContextType | undefined>(undefined);

interface StoreSettingsProviderProps {
  children: ReactNode;
  initialSettings?: StoreSettings;
}

export function StoreSettingsProvider({ children, initialSettings }: StoreSettingsProviderProps) {
  const [settings, setSettings] = useState<StoreSettings | null>(initialSettings || null);
  const [isLoading, setIsLoading] = useState(!initialSettings);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/store-settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      const data = await response.json();
      setSettings(data.settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (updates: StoreSettingsUpdate) => {
    try {
      setError(null);
      const response = await fetch('/api/store-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update settings');
      }
      const data = await response.json();
      setSettings(data.settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, []);

  useEffect(() => {
    if (!initialSettings) {
      fetchSettings();
    }
  }, [initialSettings, fetchSettings]);

  return (
    <StoreSettingsContext.Provider
      value={{
        settings,
        isLoading,
        error,
        updateSettings,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  const context = useContext(StoreSettingsContext);
  if (context === undefined) {
    throw new Error('useStoreSettings must be used within a StoreSettingsProvider');
  }
  return context;
}

/**
 * Hook to apply custom theme colors from store settings
 */
export function useCustomTheme() {
  const { settings } = useStoreSettings();

  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;
    
    // Apply custom CSS variables
    root.style.setProperty('--primary', settings.primaryColor);
    root.style.setProperty('--secondary', settings.secondaryColor);
    root.style.setProperty('--accent', settings.accentColor);
    root.style.setProperty('--background', settings.backgroundColor);
    root.style.setProperty('--foreground', settings.foregroundColor);
    root.style.setProperty('--muted', settings.mutedColor);
    root.style.setProperty('--border', settings.borderColor);
    root.style.setProperty('--radius', settings.borderRadius);

    // Apply font family
    if (settings.fontFamily) {
      root.style.setProperty('--font-family', settings.fontFamily);
    }
  }, [settings]);
}
