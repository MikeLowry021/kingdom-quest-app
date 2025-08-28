'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Shield, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface PrivacySettings {
  privacy_sla_accepted: boolean;
  data_retention_days: number;
  allow_analytics: boolean;
  allow_external_sharing: boolean;
}

export default function PrivacySLA() {
  const t = useTranslations('churchAdmin');
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [settings, setSettings] = useState<PrivacySettings>({
    privacy_sla_accepted: false,
    data_retention_days: 365,
    allow_analytics: true,
    allow_external_sharing: false
  });

  // Load existing privacy settings
  useEffect(() => {
    async function loadPrivacySettings() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: profile, error } = await supabase
          .from('church_profiles')
          .select('privacy_sla_accepted, data_retention_days, allow_analytics, allow_external_sharing')
          .eq('user_id', session.user.id)
          .single();

        if (profile) {
          setSettings({
            privacy_sla_accepted: profile.privacy_sla_accepted || false,
            data_retention_days: profile.data_retention_days || 365,
            allow_analytics: profile.allow_analytics || true,
            allow_external_sharing: profile.allow_external_sharing || false
          });
        }
      } catch (error) {
        console.error('Error loading privacy settings:', error);
      } finally {
        setInitialLoading(false);
      }
    }

    loadPrivacySettings();
  }, [supabase]);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/church-admin-update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'privacy',
          data: settings
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to update privacy settings');
      }

      toast.success(t('privacySettingsUpdated'));
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast.error(t('privacyUpdateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (field: keyof PrivacySettings, value: boolean | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (initialLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">{t('loading')}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          {t('privacySettings')}
        </CardTitle>
        <CardDescription>{t('privacyDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Privacy SLA Acceptance */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">{t('privacySLA')}</Label>
              <p className="text-sm text-gray-600">{t('privacySLADescription')}</p>
            </div>
            <Switch
              checked={settings.privacy_sla_accepted}
              onCheckedChange={(checked) => handleSettingChange('privacy_sla_accepted', checked)}
            />
          </div>
          
          {!settings.privacy_sla_accepted && (
            <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">{t('privacySLARequired')}</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Data Retention */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base font-medium">{t('dataRetention')}</Label>
            <p className="text-sm text-gray-600">{t('dataRetentionDescription')}</p>
          </div>
          
          <Select 
            value={settings.data_retention_days.toString()} 
            onValueChange={(value) => handleSettingChange('data_retention_days', parseInt(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90">{t('90days')}</SelectItem>
              <SelectItem value="180">{t('180days')}</SelectItem>
              <SelectItem value="365">{t('1year')}</SelectItem>
              <SelectItem value="730">{t('2years')}</SelectItem>
              <SelectItem value="1095">{t('3years')}</SelectItem>
              <SelectItem value="-1">{t('indefinite')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Analytics Permissions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">{t('allowAnalytics')}</Label>
              <p className="text-sm text-gray-600">{t('analyticsDescription')}</p>
            </div>
            <Switch
              checked={settings.allow_analytics}
              onCheckedChange={(checked) => handleSettingChange('allow_analytics', checked)}
            />
          </div>
        </div>

        <Separator />

        {/* External Sharing */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">{t('allowExternalSharing')}</Label>
              <p className="text-sm text-gray-600">{t('externalSharingDescription')}</p>
            </div>
            <Switch
              checked={settings.allow_external_sharing}
              onCheckedChange={(checked) => handleSettingChange('allow_external_sharing', checked)}
            />
          </div>
        </div>

        <Separator />

        {/* Compliance Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">{t('complianceInfo')}</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• {t('popiCompliance')}</li>
            <li>• {t('gdprCompliance')}</li>
            <li>• {t('dataSecurityMeasures')}</li>
            <li>• {t('auditTrailMaintained')}</li>
          </ul>
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSubmit} 
          disabled={loading || !settings.privacy_sla_accepted}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('saving')}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t('savePrivacySettings')}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
