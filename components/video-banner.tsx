"use client"

import { useStoreConfig } from "@/components/store-settings-provider"
import { motion } from "framer-motion"
import { Store } from "lucide-react"

export default function VideoBanner() {
  const { settings, isLoading } = useStoreConfig()

  // Show loading state
  if (isLoading) {
    return (
      <div className="relative w-full h-[200px] sm:h-[280px] md:h-[350px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 animate-pulse" />
    )
  }

  // Check if user has configured a hero
  const hasConfiguredHero = settings?.heroType && settings.heroType !== 'none' && 
    ((settings.heroType === 'image' && settings.heroImageUrl) || 
     (settings.heroType === 'video' && settings.heroVideoUrl))

  // If user configured a hero, show it
  if (hasConfiguredHero) {
    return (
      <div className="relative w-full h-[200px] sm:h-[280px] md:h-[350px] overflow-hidden">
        {settings.heroType === 'image' && settings.heroImageUrl && (
          <img
            src={settings.heroImageUrl}
            alt={settings.heroTitle || 'Banner'}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        
        {settings.heroType === 'video' && settings.heroVideoUrl && (
          <video
            src={settings.heroVideoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        )}

        {/* Overlay with content */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col items-center justify-center text-center p-4">
          {settings.heroTitle && (
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-2 md:mb-4 drop-shadow-lg">
              {settings.heroTitle}
            </h1>
          )}
          {settings.heroSubtitle && (
            <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl drop-shadow-md">
              {settings.heroSubtitle}
            </p>
          )}
        </div>
      </div>
    )
  }

  // Default placeholder hero with logo when user hasn't configured
  return (
    <div className="relative w-full h-[200px] sm:h-[280px] md:h-[350px] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          {/* Logo or placeholder */}
          {settings?.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.storeName || 'Logo'}
              className="h-16 sm:h-20 md:h-24 w-auto mb-4 drop-shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-xl">
              <Store className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white" />
            </div>
          )}
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
            {settings?.storeName || 'Bem-vindo'}
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-md">
            {settings?.storeDescription || 'Explore nossa coleção de produtos'}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
