'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { checkFeatureAccessClient, type FeatureAccess, getPlanDisplayName } from '@/lib/feature-gating';

interface PremiumGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  showPreview?: boolean;
  className?: string;
}

export function PremiumGate({ 
  feature, 
  children, 
  fallback, 
  showPreview = true, 
  className = '' 
}: PremiumGateProps) {
  const t = useTranslations('billing');
  const [access, setAccess] = useState<FeatureAccess | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      try {
        const featureAccess = await checkFeatureAccessClient(feature);
        setAccess(featureAccess);
      } catch (error) {
        console.error('Error checking feature access:', error);
        // Default to no access on error
        setAccess({
          hasAccess: false,
          currentPlan: 'free',
          requiredPlan: 'premium',
          upgradeUrl: '/billing?upgrade=premium'
        });
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [feature]);

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg h-32 ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!access) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-red-500">Error loading feature access</p>
      </div>
    );
  }

  if (access.hasAccess) {
    return <div className={className}>{children}</div>;
  }

  // User doesn't have access - show upgrade prompt
  if (fallback) {
    return <div className={className}>{fallback}</div>;
  }

  // Default upgrade prompt
  const requiredPlanName = getPlanDisplayName(access.requiredPlan);
  const currentPlanName = getPlanDisplayName(access.currentPlan);
  
  const planIcons = {
    premium: Crown,
    church: Zap,
    free: Lock
  };
  
  const PlanIcon = planIcons[access.requiredPlan] || Crown;

  return (
    <div className={className}>
      <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white w-fit">
            <PlanIcon className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            {t('features.premium_required')}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {t('features.upgrade_benefits')}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Badge variant="outline" className="bg-gray-100">
              {currentPlanName} {t('billing.currentPlan')}
            </Badge>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              {requiredPlanName} {t('billing.required')}
            </Badge>
          </div>
          
          {showPreview && (
            <div className="relative">
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
                <div className="text-center">
                  <Lock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 font-medium">Premium Content</p>
                </div>
              </div>
              <div className="filter blur-sm opacity-50 pointer-events-none">
                {children}
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Link href={access.upgradeUrl || '/billing'}>
                {t('actions.upgrade_now')}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/billing">
                {t('features.learn_more')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Simplified version for inline use
export function InlinePremiumGate({ 
  feature, 
  children, 
  className = '' 
}: Omit<PremiumGateProps, 'fallback' | 'showPreview'>) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAccess() {
      try {
        const featureAccess = await checkFeatureAccessClient(feature);
        setHasAccess(featureAccess.hasAccess);
      } catch (error) {
        console.error('Error checking feature access:', error);
        setHasAccess(false);
      }
    }

    checkAccess();
  }, [feature]);

  if (hasAccess === null) {
    return <div className={`opacity-50 ${className}`}>{children}</div>;
  }

  if (hasAccess) {
    return <div className={className}>{children}</div>;
  }

  return null;
}
