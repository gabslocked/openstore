"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { StoreSettings } from '@/lib/types/store-settings';

interface StoreHeroProps {
  settings: Partial<StoreSettings>;
}

export function StoreHero({ settings }: StoreHeroProps) {
  // Don't render if hero type is none or not set
  if (!settings.heroType || settings.heroType === 'none') {
    return null;
  }

  const hasContent = settings.heroTitle || settings.heroSubtitle || settings.heroCtaText;

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background */}
      <div className="relative aspect-[16/6] md:aspect-[21/9] w-full">
        {settings.heroType === 'image' && settings.heroImageUrl && (
          <img
            src={settings.heroImageUrl}
            alt={settings.heroTitle || 'Store banner'}
            className="w-full h-full object-cover"
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
        {hasContent && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center justify-center text-center p-4 md:p-8">
            {settings.heroTitle && (
              <h1 
                className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4 max-w-4xl"
                style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
              >
                {settings.heroTitle}
              </h1>
            )}
            
            {settings.heroSubtitle && (
              <p 
                className="text-sm md:text-lg lg:text-xl text-zinc-200 mb-4 md:mb-6 max-w-2xl"
                style={{ textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}
              >
                {settings.heroSubtitle}
              </p>
            )}
            
            {settings.heroCtaText && settings.heroCtaLink && (
              <Link href={settings.heroCtaLink}>
                <Button 
                  size="lg"
                  className="text-white font-semibold px-8"
                  style={{ backgroundColor: settings.primaryColor || '#10b981' }}
                >
                  {settings.heroCtaText}
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
