'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface ChurchProfile {
  church_name: string;
  church_address: string;
  church_phone: string;
  church_email: string;
  denomination: string;
  pastor_name: string;
  church_size: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  custom_message: string;
}

export default function BrandingForm() {
  const t = useTranslations('churchAdmin');
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<ChurchProfile>({
    church_name: '',
    church_address: '',
    church_phone: '',
    church_email: '',
    denomination: '',
    pastor_name: '',
    church_size: '',
    logo_url: '',
    primary_color: '#3B82F6',
    secondary_color: '#EF4444',
    custom_message: ''
  });

  // Load existing church profile data
  useEffect(() => {
    async function loadChurchProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: profile, error } = await supabase
          .from('church_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (profile) {
          setFormData({
            church_name: profile.church_name || '',
            church_address: profile.church_address || '',
            church_phone: profile.church_phone || '',
            church_email: profile.church_email || '',
            denomination: profile.denomination || '',
            pastor_name: profile.pastor_name || '',
            church_size: profile.church_size || '',
            logo_url: profile.logo_url || '',
            primary_color: profile.primary_color || '#3B82F6',
            secondary_color: profile.secondary_color || '#EF4444',
            custom_message: profile.custom_message || ''
          });
        }
      } catch (error) {
        console.error('Error loading church profile:', error);
      } finally {
        setInitialLoading(false);
      }
    }

    loadChurchProfile();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          type: 'branding',
          data: formData
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to update branding');
      }

      toast.success(t('brandingUpdated'));
    } catch (error) {
      console.error('Error updating branding:', error);
      toast.error(t('brandingUpdateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ChurchProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        <CardTitle>{t('churchBranding')}</CardTitle>
        <CardDescription>{t('brandingDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Church Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('basicInformation')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="church_name">{t('churchName')} *</Label>
                <Input
                  id="church_name"
                  value={formData.church_name}
                  onChange={(e) => handleChange('church_name', e.target.value)}
                  required
                  placeholder={t('enterChurchName')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pastor_name">{t('pastorName')}</Label>
                <Input
                  id="pastor_name"
                  value={formData.pastor_name}
                  onChange={(e) => handleChange('pastor_name', e.target.value)}
                  placeholder={t('enterPastorName')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="church_address">{t('churchAddress')}</Label>
              <Textarea
                id="church_address"
                value={formData.church_address}
                onChange={(e) => handleChange('church_address', e.target.value)}
                placeholder={t('enterChurchAddress')}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="church_phone">{t('churchPhone')}</Label>
                <Input
                  id="church_phone"
                  value={formData.church_phone}
                  onChange={(e) => handleChange('church_phone', e.target.value)}
                  placeholder={t('enterChurchPhone')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="church_email">{t('churchEmail')}</Label>
                <Input
                  id="church_email"
                  type="email"
                  value={formData.church_email}
                  onChange={(e) => handleChange('church_email', e.target.value)}
                  placeholder={t('enterChurchEmail')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="denomination">{t('denomination')}</Label>
                <Input
                  id="denomination"
                  value={formData.denomination}
                  onChange={(e) => handleChange('denomination', e.target.value)}
                  placeholder={t('enterDenomination')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="church_size">{t('churchSize')}</Label>
              <Select value={formData.church_size} onValueChange={(value) => handleChange('church_size', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectChurchSize')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">{t('smallChurch')}</SelectItem>
                  <SelectItem value="medium">{t('mediumChurch')}</SelectItem>
                  <SelectItem value="large">{t('largeChurch')}</SelectItem>
                  <SelectItem value="megachurch">{t('megaChurch')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Visual Branding */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('visualBranding')}</h3>
            
            <div className="space-y-2">
              <Label htmlFor="logo_url">{t('logoUrl')}</Label>
              <Input
                id="logo_url"
                type="url"
                value={formData.logo_url}
                onChange={(e) => handleChange('logo_url', e.target.value)}
                placeholder={t('enterLogoUrl')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary_color">{t('primaryColor')}</Label>
                <div className="flex space-x-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={formData.primary_color}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secondary_color">{t('secondaryColor')}</Label>
                <div className="flex space-x-2">
                  <Input
                    id="secondary_color"
                    type="color"
                    value={formData.secondary_color}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={formData.secondary_color}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                    placeholder="#EF4444"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom_message">{t('customMessage')}</Label>
              <Textarea
                id="custom_message"
                value={formData.custom_message}
                onChange={(e) => handleChange('custom_message', e.target.value)}
                placeholder={t('enterCustomMessage')}
                rows={4}
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('saving')}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t('saveBranding')}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
