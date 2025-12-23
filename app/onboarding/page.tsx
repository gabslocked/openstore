"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, Palette, Image, CreditCard, Check, ArrowRight, ArrowLeft, 
  Sparkles, Loader2 
} from 'lucide-react';

// Convert hex color to HSL format for CSS variables
function hexToHsl(hex: string): string {
  if (!hex || !hex.startsWith('#')) return '160 84% 39%'; // Default emerald
  
  hex = hex.replace('#', '');
  if (hex.length !== 6) return '160 84% 39%';
  
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

import { WelcomeStep } from './steps/welcome';
import { BasicInfoStep } from './steps/basic-info';
import { BrandingStep } from './steps/branding';
import { ColorsStep } from './steps/colors';
import { HeroStep } from './steps/hero';
import { PaymentStep } from './steps/payment';
import { ReviewStep } from './steps/review';

import type { StoreSettings, StoreSettingsUpdate } from '@/lib/types/store-settings';
import { ONBOARDING_STEPS } from '@/lib/types/store-settings';

const STEP_ICONS = [Sparkles, Store, Image, Palette, Image, CreditCard, Check];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [settings, setSettings] = useState<Partial<StoreSettings>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Get the current primary color for dynamic styling
  const primaryColor = settings.primaryColor || '#10b981';
  const primaryHsl = useMemo(() => hexToHsl(primaryColor), [primaryColor]);

  // Apply CSS variables in real-time when colors change
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.primaryColor) {
      root.style.setProperty('--primary', hexToHsl(settings.primaryColor));
      root.style.setProperty('--accent', hexToHsl(settings.primaryColor));
      root.style.setProperty('--ring', hexToHsl(settings.primaryColor));
    }
    if (settings.accentColor) {
      root.style.setProperty('--accent', hexToHsl(settings.accentColor));
    }
    
    // Cleanup: reset to defaults when leaving onboarding
    return () => {
      root.style.setProperty('--primary', '160 84% 39%');
      root.style.setProperty('--accent', '160 84% 39%');
      root.style.setProperty('--ring', '160 84% 39%');
    };
  }, [settings.primaryColor, settings.accentColor]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/store-settings');
      const data = await response.json();
      if (data.settings) {
        setSettings(data.settings);
        // If onboarding is completed, redirect to admin
        if (data.settings.onboardingCompleted) {
          router.push('/admin');
          return;
        }
        // Resume from last step
        setCurrentStep(data.settings.onboardingStep || 0);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (updates: StoreSettingsUpdate) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const saveAndContinue = async () => {
    setIsSaving(true);
    try {
      const nextStep = currentStep + 1;
      await fetch('/api/store-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...settings, 
          onboardingStep: nextStep,
          onboardingCompleted: nextStep >= ONBOARDING_STEPS.length - 1
        }),
      });
      
      if (nextStep >= ONBOARDING_STEPS.length) {
        router.push('/admin');
      } else {
        setCurrentStep(nextStep);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: primaryColor }} />
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onContinue={() => setCurrentStep(1)} />;
      case 1:
        return <BasicInfoStep settings={settings} updateSettings={updateSettings} />;
      case 2:
        return <BrandingStep settings={settings} updateSettings={updateSettings} />;
      case 3:
        return <ColorsStep settings={settings} updateSettings={updateSettings} />;
      case 4:
        return <HeroStep settings={settings} updateSettings={updateSettings} />;
      case 5:
        return <PaymentStep settings={settings} updateSettings={updateSettings} />;
      case 6:
        return <ReviewStep settings={settings} />;
      default:
        return null;
    }
  };

  const StepIcon = STEP_ICONS[currentStep] || Store;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(to bottom right, ${primaryColor}, ${settings.secondaryColor || primaryColor})` }}
              >
                <StepIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">
                  {ONBOARDING_STEPS[currentStep]?.title}
                </h1>
                <p className="text-sm text-zinc-400">
                  {ONBOARDING_STEPS[currentStep]?.description}
                </p>
              </div>
            </div>
            <div className="text-sm text-zinc-400">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </div>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-center gap-2 mb-8">
          {ONBOARDING_STEPS.map((step, index) => {
            const Icon = STEP_ICONS[index];
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <button
                key={step.id}
                onClick={() => index <= currentStep && setCurrentStep(index)}
                disabled={index > currentStep}
                className="flex items-center justify-center h-10 w-10 rounded-full transition-all"
                style={{
                  backgroundColor: isActive 
                    ? primaryColor 
                    : isCompleted 
                      ? `${primaryColor}33` 
                      : undefined,
                  color: isActive 
                    ? 'white' 
                    : isCompleted 
                      ? primaryColor 
                      : undefined,
                  transform: isActive ? 'scale(1.1)' : undefined,
                }}
                {...(!isActive && !isCompleted && { className: 'flex items-center justify-center h-10 w-10 rounded-full transition-all bg-zinc-800 text-zinc-500' })}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
              <CardContent className="p-6 md:p-8">
                {renderStep()}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {currentStep > 0 && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={goBack}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={saveAndContinue}
              disabled={isSaving}
              className="text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : currentStep === ONBOARDING_STEPS.length - 1 ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <ArrowRight className="h-4 w-4 mr-2" />
              )}
              {currentStep === ONBOARDING_STEPS.length - 1 ? 'Launch Store' : 'Continue'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
