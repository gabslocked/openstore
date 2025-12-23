"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Store, Palette, Image, CreditCard, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeStepProps {
  onContinue: () => void;
}

const features = [
  { icon: Store, title: 'Store Info', description: 'Name, contact, and basic details' },
  { icon: Image, title: 'Branding', description: 'Logo and visual identity' },
  { icon: Palette, title: 'Theme', description: 'Colors and styling' },
  { icon: CreditCard, title: 'Payments', description: 'Payment gateway setup' },
];

export function WelcomeStep({ onContinue }: WelcomeStepProps) {
  return (
    <div className="text-center py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="inline-flex items-center justify-center h-20 w-20 rounded-2xl mb-6 bg-primary"
      >
        <Sparkles className="h-10 w-10 text-white" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl md:text-4xl font-bold text-white mb-4"
      >
        Welcome to OpenStore
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-lg text-zinc-400 mb-8 max-w-md mx-auto"
      >
        Let's set up your store in just a few minutes. We'll guide you through each step.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50"
          >
            <feature.icon className="h-6 w-6 text-primary mx-auto mb-2" />
            <h3 className="text-sm font-medium text-white mb-1">{feature.title}</h3>
            <p className="text-xs text-zinc-500">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Button
          size="lg"
          onClick={onContinue}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
        >
          <Rocket className="h-5 w-5 mr-2" />
          Get Started
        </Button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-sm text-zinc-500 mt-6"
      >
        This will only take about 5 minutes
      </motion.p>
    </div>
  );
}
