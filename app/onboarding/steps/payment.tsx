"use client";

import React, { useState, useEffect } from 'react';
import { CreditCard, Check, DollarSign, Eye, EyeOff, TestTube, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { StoreSettings, StoreSettingsUpdate } from '@/lib/types/store-settings';
import type { Integration } from '@/lib/types/integrations';
import { PAYMENT_GATEWAYS } from '@/lib/types/integrations';

interface PaymentStepProps {
  settings: Partial<StoreSettings>;
  updateSettings: (updates: StoreSettingsUpdate) => void;
}

const CURRENCIES = [
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
];

export function PaymentStep({ settings, updateSettings }: PaymentStepProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<string>('');
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations?type=payment_gateway');
      const data = await response.json();
      setIntegrations(data.integrations || []);
      
      // Find enabled gateway
      const enabled = data.integrations?.find((i: Integration) => i.enabled);
      if (enabled) {
        setSelectedGateway(enabled.provider);
        updateSettings({ defaultPaymentGateway: enabled.provider });
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
    }
  };

  const getGatewayInfo = (provider: string) => {
    return PAYMENT_GATEWAYS.find(g => g.provider === provider);
  };

  const getIntegration = (provider: string) => {
    return integrations.find(i => i.provider === provider);
  };

  const saveCredentials = async () => {
    const integration = getIntegration(selectedGateway);
    if (!integration) return;

    setSaving(true);
    setTestResult(null);
    
    try {
      await fetch(`/api/integrations/${integration.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: true,
          isDefault: true,
          credentials,
        }),
      });

      updateSettings({ defaultPaymentGateway: selectedGateway });
      setTestResult({ success: true, message: 'Credentials saved successfully!' });
      fetchIntegrations();
    } catch (error) {
      setTestResult({ success: false, message: 'Failed to save credentials' });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    const integration = getIntegration(selectedGateway);
    if (!integration) return;

    setTesting(true);
    setTestResult(null);

    try {
      // First save credentials
      if (Object.keys(credentials).length > 0) {
        await fetch(`/api/integrations/${integration.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credentials }),
        });
      }

      // Then test
      const response = await fetch(`/api/integrations/${integration.id}/test`, {
        method: 'POST',
      });
      const result = await response.json();

      setTestResult({
        success: result.success,
        message: result.success ? 'Connection successful!' : (result.error || 'Connection failed'),
      });

      if (result.success) {
        fetchIntegrations();
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Failed to test connection' });
    } finally {
      setTesting(false);
    }
  };

  const gatewayInfo = getGatewayInfo(selectedGateway);
  const currentIntegration = getIntegration(selectedGateway);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-500/20 mb-4">
          <CreditCard className="h-6 w-6 text-emerald-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Payment Setup</h2>
        <p className="text-zinc-400">Configure your payment gateway</p>
      </div>

      {/* Payment Gateway Selection */}
      <div className="space-y-4">
        <Label className="text-zinc-300">Select Payment Gateway</Label>
        <div className="grid gap-3">
          {PAYMENT_GATEWAYS.map((gateway) => {
            const integration = getIntegration(gateway.provider);
            const isSelected = selectedGateway === gateway.provider;
            const isConfigured = integration?.enabled && integration?.lastTestSuccess;

            return (
              <button
                key={gateway.provider}
                type="button"
                onClick={() => {
                  setSelectedGateway(gateway.provider);
                  setCredentials({});
                  setTestResult(null);
                }}
                className={`
                  flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all
                  ${isSelected
                    ? 'border-emerald-500 bg-emerald-500/10' 
                    : 'border-zinc-700 hover:border-zinc-500'
                  }
                `}
              >
                <span className="text-2xl">{gateway.logo}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{gateway.name}</span>
                    {isConfigured && (
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Configured
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-zinc-400">{gateway.description}</span>
                  <div className="flex gap-1 mt-1">
                    {gateway.supports.map((method) => (
                      <span key={method} className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
                {isSelected && <Check className="h-5 w-5 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* API Keys Configuration */}
      {gatewayInfo && (
        <div className="space-y-4 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-white flex items-center gap-2">
              Configure {gatewayInfo.name}
              {gatewayInfo.docsUrl && (
                <a 
                  href={gatewayInfo.docsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline text-sm font-normal inline-flex items-center gap-1"
                >
                  Docs <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </h3>
          </div>

          <div className="grid gap-4">
            {gatewayInfo.fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label className="text-zinc-300 flex items-center justify-between">
                  <span>
                    {field.label}
                    {field.required && <span className="text-red-400 ml-1">*</span>}
                  </span>
                  {field.type === 'password' && (
                    <button
                      type="button"
                      onClick={() => setShowSecrets(prev => ({
                        ...prev,
                        [field.key]: !prev[field.key]
                      }))}
                      className="text-zinc-500 hover:text-zinc-300"
                    >
                      {showSecrets[field.key] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </Label>
                <Input
                  type={field.type === 'password' && !showSecrets[field.key] ? 'password' : 'text'}
                  placeholder={field.placeholder}
                  value={credentials[field.key] || ''}
                  onChange={(e) => setCredentials(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 font-mono text-sm"
                />
                {field.helpText && (
                  <p className="text-xs text-zinc-500">{field.helpText}</p>
                )}
              </div>
            ))}
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
              testResult.success 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/10 text-red-400 border border-red-500/30'
            }`}>
              {testResult.success ? (
                <Check className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              {testResult.message}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={testConnection}
              disabled={testing || Object.keys(credentials).length === 0}
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
            >
              {testing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4 mr-2" />
              )}
              Test Connection
            </Button>
            <Button
              type="button"
              onClick={saveCredentials}
              disabled={saving || Object.keys(credentials).length === 0}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Save & Enable
            </Button>
          </div>
        </div>
      )}

      {/* Currency Selection */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="currency" className="text-zinc-300 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Currency
          </Label>
          <Select
            value={settings.currency || 'BRL'}
            onValueChange={(value) => {
              const currency = CURRENCIES.find(c => c.code === value);
              updateSettings({ 
                currency: value,
                currencySymbol: currency?.symbol || 'R$'
              });
            }}
          >
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {CURRENCIES.map((currency) => (
                <SelectItem 
                  key={currency.code} 
                  value={currency.code}
                  className="text-white hover:bg-zinc-700"
                >
                  {currency.symbol} - {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="freeShippingThreshold" className="text-zinc-300">
            Free Shipping Threshold
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
              {settings.currencySymbol || 'R$'}
            </span>
            <Input
              id="freeShippingThreshold"
              type="number"
              placeholder="100.00"
              value={settings.freeShippingThreshold || ''}
              onChange={(e) => updateSettings({ freeShippingThreshold: parseFloat(e.target.value) || undefined })}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 pl-10"
            />
          </div>
          <p className="text-xs text-zinc-500">
            Orders above this value get free shipping. Leave empty to disable.
          </p>
        </div>
      </div>

      {/* Skip Notice */}
      <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
        <p className="text-sm text-zinc-400">
          💡 You can skip this step and configure payment gateways later in{' '}
          <span className="text-emerald-400">Admin → Integrations</span>
        </p>
      </div>
    </div>
  );
}
