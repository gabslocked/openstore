"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plug, Check, X, Loader2, ExternalLink, Eye, EyeOff,
  CreditCard, Webhook, TestTube, Settings2, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

import type { Integration } from '@/lib/types/integrations';
import { PAYMENT_GATEWAYS, WEBHOOK_PROVIDERS } from '@/lib/types/integrations';

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [credentials, setCredentials] = useState<Record<string, Record<string, string>>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations');
      const data = await response.json();
      setIntegrations(data.integrations || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast.error('Failed to load integrations');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCredential = (integrationId: string, key: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [integrationId]: {
        ...prev[integrationId],
        [key]: value,
      },
    }));
  };

  const saveIntegration = async (integration: Integration, enabled: boolean) => {
    setSaving(integration.id);
    try {
      const creds = credentials[integration.id];
      
      const response = await fetch(`/api/integrations/${integration.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled,
          credentials: creds && Object.keys(creds).length > 0 ? creds : undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      toast.success(`${integration.name} ${enabled ? 'enabled' : 'disabled'}`);
      fetchIntegrations();
    } catch (error) {
      console.error('Error saving integration:', error);
      toast.error('Failed to save integration');
    } finally {
      setSaving(null);
    }
  };

  const testConnection = async (integration: Integration) => {
    setTesting(integration.id);
    try {
      // First save any pending credentials
      const creds = credentials[integration.id];
      if (creds && Object.keys(creds).length > 0) {
        await fetch(`/api/integrations/${integration.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credentials: creds }),
        });
      }

      // Then test
      const response = await fetch(`/api/integrations/${integration.id}/test`, {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success) {
        toast.success(`${integration.name}: Connection successful!`);
      } else {
        toast.error(`${integration.name}: ${result.error || 'Connection failed'}`);
      }

      fetchIntegrations();
    } catch (error) {
      console.error('Error testing integration:', error);
      toast.error('Failed to test connection');
    } finally {
      setTesting(null);
    }
  };

  const setAsDefault = async (integration: Integration) => {
    try {
      await fetch(`/api/integrations/${integration.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
      toast.success(`${integration.name} set as default`);
      fetchIntegrations();
    } catch (error) {
      toast.error('Failed to set as default');
    }
  };

  const getGatewayInfo = (provider: string) => {
    return PAYMENT_GATEWAYS.find(g => g.provider === provider);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const paymentGateways = integrations.filter(i => i.type === 'payment_gateway');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Plug className="h-6 w-6" />
          Integrations
        </h1>
        <p className="text-zinc-400 mt-1">
          Connect payment gateways and other services
        </p>
      </div>

      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList className="bg-zinc-800 border border-zinc-700">
          <TabsTrigger value="payments" className="data-[state=active]:bg-primary">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment Gateways
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="data-[state=active]:bg-primary">
            <Webhook className="h-4 w-4 mr-2" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        {/* Payment Gateways */}
        <TabsContent value="payments" className="space-y-4">
          {paymentGateways.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-8 text-center">
                <AlertCircle className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
                <p className="text-zinc-400">No payment gateways available</p>
              </CardContent>
            </Card>
          ) : (
            paymentGateways.map((integration) => {
              const gatewayInfo = getGatewayInfo(integration.provider);
              const isCurrentlySaving = saving === integration.id;
              const isCurrentlyTesting = testing === integration.id;
              const creds = credentials[integration.id] || {};

              return (
                <Card 
                  key={integration.id} 
                  className={`bg-zinc-900 border-zinc-800 transition-all ${
                    integration.enabled ? 'border-primary/50' : ''
                  }`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{gatewayInfo?.logo || '💳'}</span>
                        <div>
                          <CardTitle className="text-white flex items-center gap-2">
                            {integration.name}
                            {integration.isDefault && (
                              <Badge className="bg-primary/20 text-primary border-primary/30">
                                Default
                              </Badge>
                            )}
                            {integration.enabled && (
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                Active
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            {gatewayInfo?.description}
                            {gatewayInfo?.docsUrl && (
                              <a 
                                href={gatewayInfo.docsUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline inline-flex items-center gap-1"
                              >
                                Docs <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={integration.enabled}
                          onCheckedChange={(checked) => saveIntegration(integration, checked)}
                          disabled={isCurrentlySaving}
                        />
                      </div>
                    </div>

                    {/* Supported methods */}
                    {gatewayInfo?.supports && (
                      <div className="flex gap-2 mt-3">
                        {gatewayInfo.supports.map((method) => (
                          <Badge 
                            key={method} 
                            variant="outline" 
                            className="border-zinc-700 text-zinc-400"
                          >
                            {method}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* API Keys Form */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {gatewayInfo?.fields.map((field) => (
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
                                  [`${integration.id}-${field.key}`]: !prev[`${integration.id}-${field.key}`]
                                }))}
                                className="text-zinc-500 hover:text-zinc-300"
                              >
                                {showSecrets[`${integration.id}-${field.key}`] ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            )}
                          </Label>
                          <Input
                            type={
                              field.type === 'password' && !showSecrets[`${integration.id}-${field.key}`]
                                ? 'password'
                                : 'text'
                            }
                            placeholder={field.placeholder}
                            value={creds[field.key] || ''}
                            onChange={(e) => updateCredential(integration.id, field.key, e.target.value)}
                            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 font-mono text-sm"
                          />
                          {field.helpText && (
                            <p className="text-xs text-zinc-500">{field.helpText}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Test Status */}
                    {integration.lastTestAt && (
                      <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                        integration.lastTestSuccess 
                          ? 'bg-primary/10 text-primary border border-primary/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}>
                        {integration.lastTestSuccess ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                        <span>
                          Last test: {integration.lastTestSuccess ? 'Successful' : 'Failed'}
                          {integration.lastTestError && ` - ${integration.lastTestError}`}
                        </span>
                        <span className="text-xs opacity-70 ml-auto">
                          {new Date(integration.lastTestAt).toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => testConnection(integration)}
                        disabled={isCurrentlyTesting}
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      >
                        {isCurrentlyTesting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <TestTube className="h-4 w-4 mr-2" />
                        )}
                        Test Connection
                      </Button>
                      
                      {integration.enabled && !integration.isDefault && (
                        <Button
                          variant="outline"
                          onClick={() => setAsDefault(integration)}
                          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                          Set as Default
                        </Button>
                      )}

                      <Button
                        onClick={() => saveIntegration(integration, integration.enabled)}
                        disabled={isCurrentlySaving || Object.keys(creds).length === 0}
                        className="bg-primary hover:bg-primary/90 ml-auto"
                      >
                        {isCurrentlySaving ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        Save Credentials
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="py-8 text-center">
              <Webhook className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Webhook Integrations</h3>
              <p className="text-zinc-400 mb-4">
                Connect to n8n, Zapier, or custom webhooks for order notifications
              </p>
              <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                Coming Soon
              </Badge>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
