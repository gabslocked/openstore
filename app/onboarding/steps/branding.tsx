"use client";

import React, { useState } from 'react';
import { Image, Upload, X, Link as LinkIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { StoreSettings, StoreSettingsUpdate } from '@/lib/types/store-settings';

interface BrandingStepProps {
  settings: Partial<StoreSettings>;
  updateSettings: (updates: StoreSettingsUpdate) => void;
}

export function BrandingStep({ settings, updateSettings }: BrandingStepProps) {
  const [uploadMethod, setUploadMethod] = useState<'url' | 'upload'>('url');

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/20 mb-4">
          <Image className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Branding</h2>
        <p className="text-zinc-400">Add your logo and visual identity</p>
      </div>

      <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as 'url' | 'upload')}>
        <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
          <TabsTrigger value="url" className="data-[state=active]:bg-primary">
            <LinkIcon className="h-4 w-4 mr-2" />
            URL
          </TabsTrigger>
          <TabsTrigger value="upload" className="data-[state=active]:bg-primary">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="mt-6 space-y-6">
          {/* Logo URL */}
          <div className="space-y-2">
            <Label htmlFor="logoUrl" className="text-zinc-300">
              Logo URL (Light background)
            </Label>
            <Input
              id="logoUrl"
              placeholder="https://example.com/logo.png"
              value={settings.logoUrl || ''}
              onChange={(e) => updateSettings({ logoUrl: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          {/* Dark Logo URL */}
          <div className="space-y-2">
            <Label htmlFor="logoDarkUrl" className="text-zinc-300">
              Logo URL (Dark background) - Optional
            </Label>
            <Input
              id="logoDarkUrl"
              placeholder="https://example.com/logo-dark.png"
              value={settings.logoDarkUrl || ''}
              onChange={(e) => updateSettings({ logoDarkUrl: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
            <p className="text-xs text-zinc-500">
              If not provided, the main logo will be used
            </p>
          </div>

          {/* Favicon URL */}
          <div className="space-y-2">
            <Label htmlFor="faviconUrl" className="text-zinc-300">
              Favicon URL - Optional
            </Label>
            <Input
              id="faviconUrl"
              placeholder="https://example.com/favicon.ico"
              value={settings.faviconUrl || ''}
              onChange={(e) => updateSettings({ faviconUrl: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>
        </TabsContent>

        <TabsContent value="upload" className="mt-6">
          <div className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center">
            <Upload className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
            <p className="text-zinc-400 mb-2">
              Drag and drop your logo here, or click to browse
            </p>
            <p className="text-xs text-zinc-500 mb-4">
              PNG, JPG, SVG up to 2MB
            </p>
            <Button variant="outline" className="border-zinc-600 text-zinc-300">
              Choose File
            </Button>
            <p className="text-xs text-zinc-500 mt-4">
              File upload coming soon. Please use URL for now.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview */}
      {(settings.logoUrl || settings.logoDarkUrl) && (
        <div className="mt-8">
          <Label className="text-zinc-300 mb-4 block">Preview</Label>
          <div className="grid md:grid-cols-2 gap-4">
            {settings.logoUrl && (
              <div className="bg-white rounded-xl p-6 flex items-center justify-center min-h-[120px]">
                <img 
                  src={settings.logoUrl} 
                  alt="Logo preview (light)" 
                  className="max-h-16 max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            {(settings.logoDarkUrl || settings.logoUrl) && (
              <div className="bg-zinc-900 rounded-xl p-6 flex items-center justify-center min-h-[120px] border border-zinc-700">
                <img 
                  src={settings.logoDarkUrl || settings.logoUrl} 
                  alt="Logo preview (dark)" 
                  className="max-h-16 max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
