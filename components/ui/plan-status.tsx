'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Lock, Zap, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import { getCurrentPlanClient, type PlanType, getPlanDisplayName } from '@/lib/feature-gating';

export function PlanStatus() {
  const t = useTranslations('billing');
  const [currentPlan, setCurrentPlan] = useState<PlanType>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlan() {
      try {
        const plan = await getCurrentPlanClient();
        setCurrentPlan(plan);
      } catch (error) {
        console.error('Error loading plan:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPlan();
  }, []);

  if (loading) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const planConfig = {
    free: {
      icon: Star,
      color: 'bg-gray-100 text-gray-800',
      gradient: 'from-gray-400 to-gray-600',
      description: t('plans.free.description')
    },
    premium: {
      icon: Crown,
      color: 'bg-blue-100 text-blue-800',
      gradient: 'from-blue-500 to-purple-600',
      description: t('plans.premium.description')
    },
    church: {
      icon: Zap,
      color: 'bg-purple-100 text-purple-800',
      gradient: 'from-purple-500 to-pink-600',
      description: t('plans.church.description')
    }
  };

  const config = planConfig[currentPlan];
  const PlanIcon = config.icon;
  const planName = getPlanDisplayName(currentPlan);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-full bg-gradient-to-r ${config.gradient} text-white`}>
            <PlanIcon className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-lg">{planName} Plan</CardTitle>
            <Badge className={config.color} variant="secondary">
              {currentPlan === 'free' ? 'Free' : 'Active'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4 text-sm">
          {config.description}
        </CardDescription>
        
        {currentPlan === 'free' && (
          <Button asChild size="sm" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            <Link href="/billing">
              <Crown className="mr-2 h-4 w-4" />
              {t('actions.upgrade_now')}
            </Link>
          </Button>
        )}
        
        {currentPlan !== 'free' && (
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/billing">
              {t('actions.manage_subscription')}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
