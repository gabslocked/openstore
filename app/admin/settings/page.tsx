"use client";

import React, { useState, useEffect } from 'react';
import { 
  Settings, Store, Palette, Image, CreditCard, Save, 
  Loader2, Check, RefreshCw 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

import type { StoreSettings, StoreSettingsUpdate } from '@/lib/types/store-settings';
import { COLOR_PRESETS } from '@/lib/types/store-settings';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Partial<StoreSettings>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/store-settings');
      const data = await response.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = (updates: StoreSettingsUpdate) => {
    setSettings(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/store-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) throw new Error('Failed to save');
      
      toast.success('Settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Store Settings
          </h1>
          <p className="text-zinc-400 mt-1">
            Customize your store appearance and configuration
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchSettings}
            className="border-zinc-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={saveSettings}
            disabled={!hasChanges || isSaving}
            className="bg-primary hover:bg-primary/90"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-zinc-800 border border-zinc-700">
          <TabsTrigger value="general" className="data-[state=active]:bg-primary">
            <Store className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="branding" className="data-[state=active]:bg-primary">
            <Image className="h-4 w-4 mr-2" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="theme" className="data-[state=active]:bg-primary">
            <Palette className="h-4 w-4 mr-2" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="payment" className="data-[state=active]:bg-primary">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Store Information</CardTitle>
              <CardDescription>Basic information about your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Store Name</Label>
                  <Input
                    value={settings.storeName || ''}
                    onChange={(e) => updateSettings({ storeName: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Email</Label>
                  <Input
                    type="email"
                    value={settings.storeEmail || ''}
                    onChange={(e) => updateSettings({ storeEmail: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Phone</Label>
                  <Input
                    value={settings.storePhone || ''}
                    onChange={(e) => updateSettings({ storePhone: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">WhatsApp</Label>
                  <Input
                    value={settings.storeWhatsapp || ''}
                    onChange={(e) => updateSettings({ storeWhatsapp: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Description</Label>
                <Textarea
                  value={settings.storeDescription || ''}
                  onChange={(e) => updateSettings({ storeDescription: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding">
          <div className="grid gap-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Logo</CardTitle>
                <CardDescription>Your store logo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Logo URL</Label>
                  <Input
                    value={settings.logoUrl || ''}
                    onChange={(e) => updateSettings({ logoUrl: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                {settings.logoUrl && (
                  <div className="p-4 bg-zinc-800 rounded-lg">
                    <img 
                      src={settings.logoUrl} 
                      alt="Logo preview" 
                      className="max-h-16 object-contain"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Hero Section</CardTitle>
                <CardDescription>Homepage banner or video</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Hero Image URL</Label>
                    <Input
                      value={settings.heroImageUrl || ''}
                      onChange={(e) => updateSettings({ heroImageUrl: e.target.value, heroType: 'image' })}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      placeholder="https://example.com/banner.jpg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Hero Video URL</Label>
                    <Input
                      value={settings.heroVideoUrl || ''}
                      onChange={(e) => updateSettings({ heroVideoUrl: e.target.value, heroType: 'video' })}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      placeholder="https://example.com/video.mp4"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Hero Title</Label>
                    <Input
                      value={settings.heroTitle || ''}
                      onChange={(e) => updateSettings({ heroTitle: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Hero Subtitle</Label>
                    <Input
                      value={settings.heroSubtitle || ''}
                      onChange={(e) => updateSettings({ heroSubtitle: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Theme Tab */}
        <TabsContent value="theme">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Colors</CardTitle>
              <CardDescription>Customize your store colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Color Presets */}
              <div className="space-y-2">
                <Label className="text-zinc-300">Quick Presets</Label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => updateSettings({
                        primaryColor: preset.primary,
                        secondaryColor: preset.secondary,
                        accentColor: preset.accent,
                      })}
                      className={`
                        w-10 h-10 rounded-lg border-2 transition-all
                        ${settings.primaryColor === preset.primary 
                          ? 'border-white scale-110' 
                          : 'border-zinc-600 hover:border-zinc-400'
                        }
                      `}
                      style={{ backgroundColor: preset.primary }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Primary Color</Label>
                  <div className="flex gap-2">
                    <div 
                      className="w-10 h-10 rounded-lg border border-zinc-600"
                      style={{ backgroundColor: settings.primaryColor || '#10b981' }}
                    />
                    <Input
                      value={settings.primaryColor || '#10b981'}
                      onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Secondary Color</Label>
                  <div className="flex gap-2">
                    <div 
                      className="w-10 h-10 rounded-lg border border-zinc-600"
                      style={{ backgroundColor: settings.secondaryColor || '#3b82f6' }}
                    />
                    <Input
                      value={settings.secondaryColor || '#3b82f6'}
                      onChange={(e) => updateSettings({ secondaryColor: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Accent Color</Label>
                  <div className="flex gap-2">
                    <div 
                      className="w-10 h-10 rounded-lg border border-zinc-600"
                      style={{ backgroundColor: settings.accentColor || '#f59e0b' }}
                    />
                    <Input
                      value={settings.accentColor || '#f59e0b'}
                      onChange={(e) => updateSettings({ accentColor: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 rounded-lg border border-zinc-700" style={{ backgroundColor: settings.backgroundColor || '#000' }}>
                <p className="text-sm text-zinc-400 mb-3">Preview</p>
                <div className="flex gap-3">
                  <Button style={{ backgroundColor: settings.primaryColor || '#10b981' }}>
                    Primary
                  </Button>
                  <Button variant="outline" style={{ borderColor: settings.secondaryColor, color: settings.secondaryColor }}>
                    Secondary
                  </Button>
                  <span 
                    className="px-3 py-2 rounded text-sm"
                    style={{ backgroundColor: settings.accentColor || '#f59e0b', color: '#000' }}
                  >
                    Accent
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Payment Settings</CardTitle>
              <CardDescription>Configure payment options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Default Gateway</Label>
                  <Input
                    value={settings.defaultPaymentGateway || ''}
                    onChange={(e) => updateSettings({ defaultPaymentGateway: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Currency</Label>
                  <Input
                    value={settings.currency || 'BRL'}
                    onChange={(e) => updateSettings({ currency: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Currency Symbol</Label>
                  <Input
                    value={settings.currencySymbol || 'R$'}
                    onChange={(e) => updateSettings({ currencySymbol: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Free Shipping Threshold</Label>
                  <Input
                    type="number"
                    value={settings.freeShippingThreshold || ''}
                    onChange={(e) => updateSettings({ freeShippingThreshold: parseFloat(e.target.value) || undefined })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="100.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
