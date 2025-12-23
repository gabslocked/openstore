"use client";

import React from 'react';
import { Store, Mail, Phone, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { StoreSettings, StoreSettingsUpdate } from '@/lib/types/store-settings';

interface BasicInfoStepProps {
  settings: Partial<StoreSettings>;
  updateSettings: (updates: StoreSettingsUpdate) => void;
}

export function BasicInfoStep({ settings, updateSettings }: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-500/20 mb-4">
          <Store className="h-6 w-6 text-emerald-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Store Information</h2>
        <p className="text-zinc-400">Tell us about your store</p>
      </div>

      <div className="grid gap-6">
        {/* Store Name */}
        <div className="space-y-2">
          <Label htmlFor="storeName" className="text-zinc-300">
            Store Name <span className="text-red-400">*</span>
          </Label>
          <Input
            id="storeName"
            placeholder="My Awesome Store"
            value={settings.storeName || ''}
            onChange={(e) => updateSettings({ storeName: e.target.value })}
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
          />
        </div>

        {/* Store Description */}
        <div className="space-y-2">
          <Label htmlFor="storeDescription" className="text-zinc-300">
            Store Description
          </Label>
          <Textarea
            id="storeDescription"
            placeholder="A brief description of your store..."
            value={settings.storeDescription || ''}
            onChange={(e) => updateSettings({ storeDescription: e.target.value })}
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[100px]"
          />
        </div>

        {/* Contact Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="storeEmail" className="text-zinc-300 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="storeEmail"
              type="email"
              placeholder="contact@mystore.com"
              value={settings.storeEmail || ''}
              onChange={(e) => updateSettings({ storeEmail: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="storePhone" className="text-zinc-300 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone
            </Label>
            <Input
              id="storePhone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={settings.storePhone || ''}
              onChange={(e) => updateSettings({ storePhone: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>
        </div>

        {/* WhatsApp */}
        <div className="space-y-2">
          <Label htmlFor="storeWhatsapp" className="text-zinc-300 flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            WhatsApp (optional)
          </Label>
          <Input
            id="storeWhatsapp"
            type="tel"
            placeholder="(11) 99999-9999"
            value={settings.storeWhatsapp || ''}
            onChange={(e) => updateSettings({ storeWhatsapp: e.target.value })}
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
          />
          <p className="text-xs text-zinc-500">
            Enable WhatsApp button for customer support
          </p>
        </div>
      </div>
    </div>
  );
}
