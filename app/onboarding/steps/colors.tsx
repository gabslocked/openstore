"use client";

import React from 'react';
import { Palette, Check, Sun, Moon, Monitor } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { StoreSettings, StoreSettingsUpdate } from '@/lib/types/store-settings';
import { COLOR_PRESETS } from '@/lib/types/store-settings';

interface ColorsStepProps {
  settings: Partial<StoreSettings>;
  updateSettings: (updates: StoreSettingsUpdate) => void;
}

export function ColorsStep({ settings, updateSettings }: ColorsStepProps) {
  const applyPreset = (preset: typeof COLOR_PRESETS[number]) => {
    updateSettings({
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-500/20 mb-4">
          <Palette className="h-6 w-6 text-emerald-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Colors & Theme</h2>
        <p className="text-zinc-400">Customize your store's look and feel</p>
      </div>

      {/* Color Presets */}
      <div className="space-y-4">
        <Label className="text-zinc-300">Quick Presets</Label>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {COLOR_PRESETS.map((preset) => {
            const isSelected = settings.primaryColor === preset.primary;
            return (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className={`
                  relative p-3 rounded-xl border-2 transition-all
                  ${isSelected 
                    ? 'border-white scale-105' 
                    : 'border-zinc-700 hover:border-zinc-500'
                  }
                `}
                style={{ backgroundColor: preset.primary }}
              >
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="h-5 w-5 text-white drop-shadow-lg" />
                  </div>
                )}
                <span className="sr-only">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="primaryColor" className="text-zinc-300">
            Primary Color
          </Label>
          <div className="flex gap-2">
            <div 
              className="w-12 h-10 rounded-lg border border-zinc-700"
              style={{ backgroundColor: settings.primaryColor || '#10b981' }}
            />
            <Input
              id="primaryColor"
              type="text"
              placeholder="#10b981"
              value={settings.primaryColor || ''}
              onChange={(e) => updateSettings({ primaryColor: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 font-mono"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="secondaryColor" className="text-zinc-300">
            Secondary Color
          </Label>
          <div className="flex gap-2">
            <div 
              className="w-12 h-10 rounded-lg border border-zinc-700"
              style={{ backgroundColor: settings.secondaryColor || '#3b82f6' }}
            />
            <Input
              id="secondaryColor"
              type="text"
              placeholder="#3b82f6"
              value={settings.secondaryColor || ''}
              onChange={(e) => updateSettings({ secondaryColor: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 font-mono"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="accentColor" className="text-zinc-300">
            Accent Color
          </Label>
          <div className="flex gap-2">
            <div 
              className="w-12 h-10 rounded-lg border border-zinc-700"
              style={{ backgroundColor: settings.accentColor || '#f59e0b' }}
            />
            <Input
              id="accentColor"
              type="text"
              placeholder="#f59e0b"
              value={settings.accentColor || ''}
              onChange={(e) => updateSettings({ accentColor: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 font-mono"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="backgroundColor" className="text-zinc-300">
            Background Color
          </Label>
          <div className="flex gap-2">
            <div 
              className="w-12 h-10 rounded-lg border border-zinc-700"
              style={{ backgroundColor: settings.backgroundColor || '#000000' }}
            />
            <Input
              id="backgroundColor"
              type="text"
              placeholder="#000000"
              value={settings.backgroundColor || ''}
              onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Theme Mode */}
      <div className="space-y-4">
        <Label className="text-zinc-300">Theme Mode</Label>
        <RadioGroup
          value={settings.themeMode || 'dark'}
          onValueChange={(value) => updateSettings({ themeMode: value as 'light' | 'dark' | 'system' })}
          className="grid grid-cols-3 gap-4"
        >
          <Label
            htmlFor="theme-light"
            className={`
              flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all
              ${settings.themeMode === 'light' 
                ? 'border-emerald-500 bg-emerald-500/10' 
                : 'border-zinc-700 hover:border-zinc-500'
              }
            `}
          >
            <RadioGroupItem value="light" id="theme-light" className="sr-only" />
            <Sun className="h-6 w-6 text-yellow-400" />
            <span className="text-sm text-zinc-300">Light</span>
          </Label>

          <Label
            htmlFor="theme-dark"
            className={`
              flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all
              ${settings.themeMode === 'dark' || !settings.themeMode
                ? 'border-emerald-500 bg-emerald-500/10' 
                : 'border-zinc-700 hover:border-zinc-500'
              }
            `}
          >
            <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
            <Moon className="h-6 w-6 text-blue-400" />
            <span className="text-sm text-zinc-300">Dark</span>
          </Label>

          <Label
            htmlFor="theme-system"
            className={`
              flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all
              ${settings.themeMode === 'system' 
                ? 'border-emerald-500 bg-emerald-500/10' 
                : 'border-zinc-700 hover:border-zinc-500'
              }
            `}
          >
            <RadioGroupItem value="system" id="theme-system" className="sr-only" />
            <Monitor className="h-6 w-6 text-zinc-400" />
            <span className="text-sm text-zinc-300">System</span>
          </Label>
        </RadioGroup>
      </div>

      {/* Preview */}
      <div className="mt-8 p-6 rounded-xl border border-zinc-700" style={{ backgroundColor: settings.backgroundColor || '#000000' }}>
        <p className="text-sm text-zinc-400 mb-4">Preview</p>
        <div className="flex gap-3">
          <Button 
            style={{ backgroundColor: settings.primaryColor || '#10b981' }}
            className="text-white"
          >
            Primary Button
          </Button>
          <Button 
            variant="outline"
            style={{ borderColor: settings.secondaryColor || '#3b82f6', color: settings.secondaryColor || '#3b82f6' }}
          >
            Secondary
          </Button>
          <span 
            className="inline-flex items-center px-3 py-2 rounded-lg text-sm"
            style={{ backgroundColor: settings.accentColor || '#f59e0b', color: '#000' }}
          >
            Accent Badge
          </span>
        </div>
      </div>
    </div>
  );
}
