'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { hasFeatureAccess, getUserPlanType, getUpgradePrompt, FEATURE_ACCESS, type PlanType } from '@/lib/subscription-utils'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Crown, Sparkles, Church, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface FeatureGateProps {
  feature: keyof typeof FEATURE_ACCESS
  children: React.ReactNode
  fallback?: React.ReactNode
  showUpgradePrompt?: boolean
}

interface UpgradePromptProps {
  feature: keyof typeof FEATURE_ACCESS
  currentPlan: PlanType
  onUpgrade?: () => void
}

const PlanIcon = ({ plan }: { plan: PlanType }) => {
  switch (plan) {
    case 'premium':
      return <Crown className="h-5 w-5 text-yellow-500" />
    case 'church':
      return <Church className="h-5 w-5 text-purple-500" />
    default:
      return <Sparkles className="h-5 w-5 text-blue-500" />
  }
}

function UpgradePrompt({ feature, currentPlan, onUpgrade }: UpgradePromptProps) {
  const t = useTranslations('Billing')
  const allowedPlans = FEATURE_ACCESS[feature]
  const requiredPlan = allowedPlans.find(plan => plan !== 'free') as PlanType
  
  if (!requiredPlan) return null
  
  const promptMessage = getUpgradePrompt(feature, currentPlan)
  
  return (
    <Card className="mx-auto max-w-md border-dashed border-2 border-gray-300">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
          <PlanIcon plan={requiredPlan} />
        </div>
        <CardTitle className="text-xl">
          {t('unlock_feature')}
        </CardTitle>
        <CardDescription>
          {promptMessage}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Badge variant="outline" className="mb-4">
          {requiredPlan === 'premium' ? t('premium_required') : t('church_required')}
        </Badge>
        <div className="space-y-2 text-sm text-gray-600">
          <p>{t('upgrade_benefits')}</p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" className="flex-1" asChild>
          <Link href="/billing">
            {t('learn_more')}
          </Link>
        </Button>
        <Button className="flex-1" onClick={onUpgrade} asChild>
          <Link href={`/billing?upgrade=${requiredPlan}`}>
            {t('upgrade_now')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export function FeatureGate({ feature, children, fallback, showUpgradePrompt = true }: FeatureGateProps) {
  const { user } = useAuth()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [userPlan, setUserPlan] = useState<PlanType>('free')
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function checkAccess() {
      if (!user) {
        setHasAccess(false)
        setLoading(false)
        return
      }
      
      try {
        const [access, plan] = await Promise.all([
          hasFeatureAccess(user.id, feature),
          getUserPlanType(user.id)
        ])
        
        setHasAccess(access)
        setUserPlan(plan)
      } catch (error) {
        console.error('Error checking feature access:', error)
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }
    
    checkAccess()
  }, [user, feature])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    )
  }
  
  if (hasAccess) {
    return <>{children}</>
  }
  
  if (fallback) {
    return <>{fallback}</>
  }
  
  if (showUpgradePrompt) {
    return (
      <UpgradePrompt 
        feature={feature} 
        currentPlan={userPlan}
        onUpgrade={() => {
          // Analytics tracking could go here
        }}
      />
    )
  }
  
  return null
}

// Higher-order component for page-level feature gating
export function withFeatureGate<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  feature: keyof typeof FEATURE_ACCESS,
  options?: { showUpgradePrompt?: boolean; fallback?: React.ReactNode }
) {
  return function FeatureGatedComponent(props: P) {
    return (
      <FeatureGate 
        feature={feature} 
        showUpgradePrompt={options?.showUpgradePrompt}
        fallback={options?.fallback}
      >
        <WrappedComponent {...props} />
      </FeatureGate>
    )
  }
}

// Hook for checking feature access in components
export function useFeatureAccess(feature: keyof typeof FEATURE_ACCESS) {
  const { user } = useAuth()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [userPlan, setUserPlan] = useState<PlanType>('free')
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function checkAccess() {
      if (!user) {
        setHasAccess(false)
        setLoading(false)
        return
      }
      
      try {
        const [access, plan] = await Promise.all([
          hasFeatureAccess(user.id, feature),
          getUserPlanType(user.id)
        ])
        
        setHasAccess(access)
        setUserPlan(plan)
      } catch (error) {
        console.error('Error checking feature access:', error)
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }
    
    checkAccess()
  }, [user, feature])
  
  return { hasAccess, userPlan, loading }
}