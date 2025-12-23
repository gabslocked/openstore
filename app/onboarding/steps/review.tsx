"use client";

import React from 'react';
import { Check, Store, Image, Palette, CreditCard, Rocket } from 'lucide-react';
import type { StoreSettings } from '@/lib/types/store-settings';

interface ReviewStepProps {
  settings: Partial<StoreSettings>;
}

export function ReviewStep({ settings }: ReviewStepProps) {
  const sections = [
    {
      icon: Store,
      title: 'Store Info',
      items: [
        { label: 'Name', value: settings.storeName },
        { label: 'Email', value: settings.storeEmail },
        { label: 'Phone', value: settings.storePhone },
      ].filter(item => item.value),
    },
    {
      icon: Image,
      title: 'Branding',
      items: [
        { label: 'Logo', value: settings.logoUrl ? '✓ Configured' : 'Not set' },
        { label: 'Hero', value: settings.heroType !== 'none' ? `${settings.heroType} configured` : 'None' },
      ],
    },
    {
      icon: Palette,
      title: 'Theme',
      items: [
        { label: 'Primary Color', value: settings.primaryColor, isColor: true },
        { label: 'Theme Mode', value: settings.themeMode || 'dark' },
      ],
    },
    {
      icon: CreditCard,
      title: 'Payment',
      items: [
        { label: 'Gateway', value: settings.defaultPaymentGateway || 'Not configured' },
        { label: 'Currency', value: `${settings.currencySymbol || 'R$'} (${settings.currency || 'BRL'})` },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/20 mb-4">
          <Rocket className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Ready to Launch!</h2>
        <p className="text-zinc-400">Review your settings before going live</p>
      </div>

      {/* Settings Summary */}
      <div className="grid md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <div 
            key={section.title}
            className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700"
          >
            <div className="flex items-center gap-2 mb-3">
              <section.icon className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-white">{section.title}</h3>
            </div>
            <div className="space-y-2">
              {section.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-zinc-400">{item.label}</span>
                  <span className="text-white flex items-center gap-2">
                    {(item as any).isColor && (
                      <span 
                        className="w-4 h-4 rounded-full border border-zinc-600"
                        style={{ backgroundColor: item.value as string }}
                      />
                    )}
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Preview Card */}
      {settings.logoUrl && (
        <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
          <h3 className="font-medium text-white mb-3">Store Preview</h3>
          <div 
            className="p-4 rounded-lg flex items-center gap-4"
            style={{ backgroundColor: settings.backgroundColor || '#000000' }}
          >
            <img 
              src={settings.logoUrl} 
              alt="Logo" 
              className="h-10 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div>
              <h4 
                className="font-semibold"
                style={{ color: settings.foregroundColor || '#ffffff' }}
              >
                {settings.storeName || 'My Store'}
              </h4>
              <p 
                className="text-sm"
                style={{ color: settings.mutedColor || '#71717a' }}
              >
                {settings.storeDescription || 'Welcome to our store'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Checklist */}
      <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
        <h4 className="font-medium text-primary mb-3">Before you launch</h4>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-sm text-zinc-300">
            <Check className="h-4 w-4 text-primary" />
            Add your payment gateway API keys to environment variables
          </li>
          <li className="flex items-center gap-2 text-sm text-zinc-300">
            <Check className="h-4 w-4 text-primary" />
            Add products to your catalog
          </li>
          <li className="flex items-center gap-2 text-sm text-zinc-300">
            <Check className="h-4 w-4 text-primary" />
            Test the checkout flow
          </li>
        </ul>
      </div>

      {/* Launch Message */}
      <div className="text-center py-4">
        <p className="text-zinc-400">
          Click <span className="text-primary font-medium">Launch Store</span> to complete setup and go to your admin dashboard.
        </p>
      </div>
    </div>
  );
}
