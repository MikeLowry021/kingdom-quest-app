'use client';

import { Button } from '@/components/ui/button';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

export default function StartJourneyButton() {
  const t = useTranslations('auth');
  const locale = useLocale();
  
  return (
    <Button 
      size="lg" 
      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
      asChild
    >
      <Link href={`/${locale}/auth`}>{t('startYourJourney')}</Link>
    </Button>
  );
}