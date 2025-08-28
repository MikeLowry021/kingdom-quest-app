'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Check, X, AlertTriangle, Phone, Mail, MessageCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ConsentRecord {
  id: string;
  consentType: string;
  grantedAt: string;
  withdrawnAt?: string;
  method: string;
  status: string;
}

interface ConsentPreferences {
  data_processing: boolean;
  marketing: boolean;
  analytics: boolean;
  cookies: boolean;
  cross_border_transfers: boolean;
  communication_channels: Record<string, boolean>;
  last_updated?: string;
}

interface ConsentManagerProps {
  userId: string;
  userType?: 'adult' | 'child' | 'parent';
  childId?: string;
  onConsentChange?: (consent: ConsentPreferences) => void;
}

const CONSENT_TYPES = {
  data_processing: {
    title: 'Data Processing',
    description: 'Allow processing of personal information for service provision and improvement.',
    required: true,
    icon: Shield
  },
  marketing: {
    title: 'Marketing Communications',
    description: 'Receive updates, newsletters, and promotional content from KingdomQuest.',
    required: false,
    icon: Mail
  },
  analytics: {
    title: 'Analytics & Performance',
    description: 'Help us improve the app by sharing anonymous usage analytics.',
    required: false,
    icon: Info
  },
  cookies: {
    title: 'Cookies & Tracking',
    description: 'Allow cookies and similar technologies for enhanced user experience.',
    required: false,
    icon: AlertTriangle
  },
  cross_border_transfers: {
    title: 'Cross-Border Data Transfers',
    description: 'Allow transfer of data to international service providers with adequate protection.',
    required: false,
    icon: Shield
  }
};

const COMMUNICATION_CHANNELS = {
  email: { title: 'Email', icon: Mail },
  sms: { title: 'SMS', icon: MessageCircle },
  whatsapp: { title: 'WhatsApp', icon: MessageCircle },
  phone: { title: 'Phone Calls', icon: Phone }
};

export function ConsentManager({ userId, userType = 'adult', childId, onConsentChange }: ConsentManagerProps) {
  const [consentStatus, setConsentStatus] = useState<{
    preferences: ConsentPreferences;
    history: ConsentRecord[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadConsentStatus();
  }, [userId]);

  const loadConsentStatus = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('consent-manager', {
        body: {
          action: 'get_consent_status',
          userId: userId
        }
      });

      if (error) throw error;
      setConsentStatus(data);
    } catch (error: any) {
      console.error('Failed to load consent status:', error);
      toast.error('Failed to load consent preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleConsentChange = async (consentType: string, granted: boolean) => {
    try {
      setUpdating(consentType);
      
      const action = granted ? 'grant_consent' : 'withdraw_consent';
      const { data, error } = await supabase.functions.invoke('consent-manager', {
        body: {
          action,
          userId: userType === 'parent' && childId ? childId : userId,
          consentType,
          consentData: {
            legalBasis: 'consent',
            method: 'web_form',
            channel: 'web',
            version: '1.0'
          },
          ...(userType === 'parent' && childId ? { parentId: userId, childId } : {})
        }
      });

      if (error) throw error;

      // Update local state
      if (consentStatus) {
        const updatedPreferences = {
          ...consentStatus.preferences,
          [consentType]: granted
        };
        setConsentStatus({
          ...consentStatus,
          preferences: updatedPreferences
        });
        onConsentChange?.(updatedPreferences);
      }

      toast.success(`Consent ${granted ? 'granted' : 'withdrawn'} successfully`);
    } catch (error: any) {
      console.error('Failed to update consent:', error);
      toast.error('Failed to update consent preference');
    } finally {
      setUpdating(null);
    }
  };

  const handleCommunicationChannelChange = async (channel: string, enabled: boolean) => {
    try {
      setUpdating(`comm_${channel}`);
      
      const updatedChannels = {
        ...consentStatus?.preferences.communication_channels,
        [channel]: enabled
      };

      // Update communication channels preference
      const { error } = await supabase.functions.invoke('consent-manager', {
        body: {
          action: enabled ? 'grant_consent' : 'withdraw_consent',
          userId: userType === 'parent' && childId ? childId : userId,
          consentType: 'marketing',
          consentData: {
            legalBasis: 'consent',
            method: 'web_form',
            channel: 'web',
            version: '1.0',
            additionalData: { communication_channels: updatedChannels }
          },
          ...(userType === 'parent' && childId ? { parentId: userId, childId } : {})
        }
      });

      if (error) throw error;

      // Update local state
      if (consentStatus) {
        const updatedPreferences = {
          ...consentStatus.preferences,
          communication_channels: updatedChannels
        };
        setConsentStatus({
          ...consentStatus,
          preferences: updatedPreferences
        });
        onConsentChange?.(updatedPreferences);
      }

      toast.success(`${channel} communication ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      console.error('Failed to update communication preference:', error);
      toast.error('Failed to update communication preference');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-primary" />
            <CardTitle>Privacy & Consent Management</CardTitle>
          </div>
          <CardDescription>
            Loading your consent preferences...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted-foreground rounded" />
                  <div className="h-3 w-48 bg-muted-foreground rounded" />
                </div>
                <div className="w-12 h-6 bg-muted-foreground rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-primary" />
            <CardTitle>
              {userType === 'parent' ? 'Child Account Privacy Settings' : 'Privacy & Consent Management'}
            </CardTitle>
          </div>
          <CardDescription>
            Manage your privacy preferences and consent settings. You can change these at any time.
            {userType === 'parent' && ' You are managing settings for your child\'s account.'}
          </CardDescription>
          {consentStatus?.preferences.last_updated && (
            <Badge variant="outline" className="w-fit">
              Last updated: {new Date(consentStatus.preferences.last_updated).toLocaleDateString()}
            </Badge>
          )}
        </CardHeader>
      </Card>

      <Tabs defaultValue="preferences" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preferences">Consent Preferences</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="history">Consent History</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Processing Consent</CardTitle>
              <CardDescription>
                Control how your personal information is processed and used.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(CONSENT_TYPES).map(([key, config]) => {
                const IconComponent = config.icon;
                const isEnabled = consentStatus?.preferences[key as keyof ConsentPreferences] || false;
                const isUpdating = updating === key;

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start space-x-3 flex-1">
                      <IconComponent className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{config.title}</h4>
                          {config.required && (
                            <Badge variant="secondary" size="sm">Required</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {config.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) => handleConsentChange(key, checked)}
                        disabled={config.required || isUpdating}
                        className="data-[state=checked]:bg-primary"
                      />
                      {isEnabled ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Communication Preferences</CardTitle>
              <CardDescription>
                Choose how you\'d like to receive communications from us through different channels.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(COMMUNICATION_CHANNELS).map(([key, config]) => {
                const IconComponent = config.icon;
                const isEnabled = consentStatus?.preferences.communication_channels?.[key] || false;
                const isUpdating = updating === `comm_${key}`;

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{config.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Receive updates and communications via {config.title.toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) => handleCommunicationChannelChange(key, checked)}
                        disabled={isUpdating}
                        className="data-[state=checked]:bg-primary"
                      />
                      {isEnabled ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
            <CardFooter>
              <div className="text-sm text-muted-foreground">
                Note: Communication preferences only apply when marketing consent is granted.
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Consent History</CardTitle>
              <CardDescription>
                View the complete history of your consent decisions and changes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {consentStatus?.history && consentStatus.history.length > 0 ? (
                <div className="space-y-3">
                  {consentStatus.history.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {CONSENT_TYPES[record.consentType as keyof typeof CONSENT_TYPES]?.title || record.consentType}
                          </span>
                          <Badge 
                            variant={record.status === 'active' ? 'default' : 'secondary'}
                            size="sm"
                          >
                            {record.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {record.status === 'active' ? 'Granted' : 'Withdrawn'} on{' '}
                          {new Date(record.grantedAt).toLocaleString()}
                          {record.withdrawnAt && (
                            <span>
                              {' '}- Withdrawn on {new Date(record.withdrawnAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Method: {record.method}
                        </div>
                      </div>
                      {record.status === 'active' ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <X className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No consent history available</p>
                  <p className="text-sm">Your consent decisions will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {userType === 'adult' && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-amber-900 dark:text-amber-100">
                  Your Rights Under POPIA
                </h4>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  You have the right to access, correct, or delete your personal information at any time.
                  You can also object to processing or request data portability. Visit the Data Rights
                  section to exercise these rights.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ConsentManager;