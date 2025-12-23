"use client";

import React from 'react';
import { Image, Video, X, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { StoreSettings, StoreSettingsUpdate } from '@/lib/types/store-settings';

interface HeroStepProps {
  settings: Partial<StoreSettings>;
  updateSettings: (updates: StoreSettingsUpdate) => void;
}

export function HeroStep({ settings, updateSettings }: HeroStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-500/20 mb-4">
          <Image className="h-6 w-6 text-emerald-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Homepage Hero</h2>
        <p className="text-zinc-400">Configure your homepage banner or video</p>
      </div>

      {/* Hero Type Selection */}
      <div className="space-y-4">
        <Label className="text-zinc-300">Hero Type</Label>
        <RadioGroup
          value={settings.heroType || 'none'}
          onValueChange={(value) => updateSettings({ heroType: value as 'image' | 'video' | 'none' })}
          className="grid grid-cols-3 gap-4"
        >
          <Label
            htmlFor="hero-none"
            className={`
              flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all
              ${settings.heroType === 'none' || !settings.heroType
                ? 'border-emerald-500 bg-emerald-500/10' 
                : 'border-zinc-700 hover:border-zinc-500'
              }
            `}
          >
            <RadioGroupItem value="none" id="hero-none" className="sr-only" />
            <X className="h-6 w-6 text-zinc-400" />
            <span className="text-sm text-zinc-300">None</span>
          </Label>

          <Label
            htmlFor="hero-image"
            className={`
              flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all
              ${settings.heroType === 'image' 
                ? 'border-emerald-500 bg-emerald-500/10' 
                : 'border-zinc-700 hover:border-zinc-500'
              }
            `}
          >
            <RadioGroupItem value="image" id="hero-image" className="sr-only" />
            <Image className="h-6 w-6 text-blue-400" />
            <span className="text-sm text-zinc-300">Image</span>
          </Label>

          <Label
            htmlFor="hero-video"
            className={`
              flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all
              ${settings.heroType === 'video' 
                ? 'border-emerald-500 bg-emerald-500/10' 
                : 'border-zinc-700 hover:border-zinc-500'
              }
            `}
          >
            <RadioGroupItem value="video" id="hero-video" className="sr-only" />
            <Video className="h-6 w-6 text-purple-400" />
            <span className="text-sm text-zinc-300">Video</span>
          </Label>
        </RadioGroup>
      </div>

      {/* Image URL */}
      {settings.heroType === 'image' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="space-y-2">
            <Label htmlFor="heroImageUrl" className="text-zinc-300">
              Banner Image URL
            </Label>
            <Input
              id="heroImageUrl"
              placeholder="https://example.com/banner.jpg"
              value={settings.heroImageUrl || ''}
              onChange={(e) => updateSettings({ heroImageUrl: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
            <p className="text-xs text-zinc-500">
              Recommended size: 1920x600 pixels
            </p>
          </div>
        </div>
      )}

      {/* Video URL */}
      {settings.heroType === 'video' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="space-y-2">
            <Label htmlFor="heroVideoUrl" className="text-zinc-300">
              Video URL
            </Label>
            <Input
              id="heroVideoUrl"
              placeholder="https://example.com/video.mp4"
              value={settings.heroVideoUrl || ''}
              onChange={(e) => updateSettings({ heroVideoUrl: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
            <p className="text-xs text-zinc-500">
              Supports MP4, WebM. YouTube/Vimeo embeds coming soon.
            </p>
          </div>
        </div>
      )}

      {/* Hero Content */}
      {settings.heroType !== 'none' && settings.heroType && (
        <div className="space-y-4 pt-4 border-t border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-300">Hero Content (Optional)</h3>
          
          <div className="space-y-2">
            <Label htmlFor="heroTitle" className="text-zinc-300">
              Title
            </Label>
            <Input
              id="heroTitle"
              placeholder="Welcome to our store"
              value={settings.heroTitle || ''}
              onChange={(e) => updateSettings({ heroTitle: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="heroSubtitle" className="text-zinc-300">
              Subtitle
            </Label>
            <Textarea
              id="heroSubtitle"
              placeholder="Discover amazing products..."
              value={settings.heroSubtitle || ''}
              onChange={(e) => updateSettings({ heroSubtitle: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="heroCtaText" className="text-zinc-300">
                Button Text
              </Label>
              <Input
                id="heroCtaText"
                placeholder="Shop Now"
                value={settings.heroCtaText || ''}
                onChange={(e) => updateSettings({ heroCtaText: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroCtaLink" className="text-zinc-300">
                Button Link
              </Label>
              <Input
                id="heroCtaLink"
                placeholder="/products"
                value={settings.heroCtaLink || ''}
                onChange={(e) => updateSettings({ heroCtaLink: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {(settings.heroImageUrl || settings.heroVideoUrl) && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-4 w-4 text-zinc-400" />
            <Label className="text-zinc-300">Preview</Label>
          </div>
          <div className="relative rounded-xl overflow-hidden border border-zinc-700 aspect-[16/6]">
            {settings.heroType === 'image' && settings.heroImageUrl && (
              <img 
                src={settings.heroImageUrl} 
                alt="Hero preview" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23333" width="100" height="100"/><text fill="%23666" x="50%" y="50%" text-anchor="middle" dy=".3em">Image not found</text></svg>';
                }}
              />
            )}
            {settings.heroType === 'video' && settings.heroVideoUrl && (
              <video 
                src={settings.heroVideoUrl} 
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            )}
            {/* Overlay with content */}
            {(settings.heroTitle || settings.heroSubtitle) && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
                {settings.heroTitle && (
                  <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">
                    {settings.heroTitle}
                  </h2>
                )}
                {settings.heroSubtitle && (
                  <p className="text-sm md:text-lg text-zinc-200 mb-4 max-w-lg">
                    {settings.heroSubtitle}
                  </p>
                )}
                {settings.heroCtaText && (
                  <button 
                    className="px-6 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: settings.primaryColor || '#10b981' }}
                  >
                    {settings.heroCtaText}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
