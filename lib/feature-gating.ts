import { getSubscription, getSubscriptionClient } from '@/lib/subscriptions';

export type PlanType = 'free' | 'premium' | 'church';

export interface FeatureAccess {
  hasAccess: boolean;
  currentPlan: PlanType;
  requiredPlan: PlanType;
  upgradeUrl?: string;
}

// Features mapped to required plan levels
export const FEATURE_REQUIREMENTS: Record<string, PlanType> = {
  // Free tier features
  'core_stories': 'free',
  'basic_quizzes': 'free',
  'family_altar': 'free',
  'community_support': 'free',
  
  // Premium tier features
  'deluxe_quest_packs': 'premium',
  'extra_media_content': 'premium',
  'offline_access': 'premium',
  'priority_support': 'premium',
  'advanced_analytics': 'premium',
  'premium_stories': 'premium',
  'premium_quizzes': 'premium',
  
  // Church tier features
  'admin_dashboard': 'church',
  'custom_branding': 'church',
  'user_analytics': 'church',
  'privacy_sla': 'church',
  'user_management': 'church',
  'bulk_enrollment': 'church',
  'dedicated_support': 'church',
};

// Get current user's plan type
export async function getCurrentPlan(): Promise<PlanType> {
  try {
    const subscription = await getSubscription();
    if (!subscription) return 'free';
    
    const planName = subscription.subscription_plans?.name?.toLowerCase();
    if (planName === 'premium') return 'premium';
    if (planName === 'church') return 'church';
    
    return 'free';
  } catch (error) {
    console.error('Error getting current plan:', error);
    return 'free';
  }
}

// Client-side version
export async function getCurrentPlanClient(): Promise<PlanType> {
  try {
    const subscription = await getSubscriptionClient();
    if (!subscription) return 'free';
    
    const planName = subscription.subscription_plans?.name?.toLowerCase();
    if (planName === 'premium') return 'premium';
    if (planName === 'church') return 'church';
    
    return 'free';
  } catch (error) {
    console.error('Error getting current plan:', error);
    return 'free';
  }
}

// Check if user has access to a specific feature
export async function checkFeatureAccess(featureName: string): Promise<FeatureAccess> {
  const currentPlan = await getCurrentPlan();
  const requiredPlan = FEATURE_REQUIREMENTS[featureName] || 'premium';
  
  const planHierarchy: PlanType[] = ['free', 'premium', 'church'];
  const currentLevel = planHierarchy.indexOf(currentPlan);
  const requiredLevel = planHierarchy.indexOf(requiredPlan);
  
  const hasAccess = currentLevel >= requiredLevel;
  
  return {
    hasAccess,
    currentPlan,
    requiredPlan,
    upgradeUrl: hasAccess ? undefined : `/billing?upgrade=${requiredPlan}`
  };
}

// Client-side version
export async function checkFeatureAccessClient(featureName: string): Promise<FeatureAccess> {
  const currentPlan = await getCurrentPlanClient();
  const requiredPlan = FEATURE_REQUIREMENTS[featureName] || 'premium';
  
  const planHierarchy: PlanType[] = ['free', 'premium', 'church'];
  const currentLevel = planHierarchy.indexOf(currentPlan);
  const requiredLevel = planHierarchy.indexOf(requiredPlan);
  
  const hasAccess = currentLevel >= requiredLevel;
  
  return {
    hasAccess,
    currentPlan,
    requiredPlan,
    upgradeUrl: hasAccess ? undefined : `/billing?upgrade=${requiredPlan}`
  };
}

// Helper function to get plan display name
export function getPlanDisplayName(plan: PlanType): string {
  const names = {
    'free': 'Free',
    'premium': 'Premium',
    'church': 'Church'
  };
  return names[plan] || 'Free';
}

// Check multiple features at once
export async function checkMultipleFeatures(features: string[]): Promise<Record<string, FeatureAccess>> {
  const currentPlan = await getCurrentPlan();
  const results: Record<string, FeatureAccess> = {};
  
  const planHierarchy: PlanType[] = ['free', 'premium', 'church'];
  const currentLevel = planHierarchy.indexOf(currentPlan);
  
  for (const feature of features) {
    const requiredPlan = FEATURE_REQUIREMENTS[feature] || 'premium';
    const requiredLevel = planHierarchy.indexOf(requiredPlan);
    const hasAccess = currentLevel >= requiredLevel;
    
    results[feature] = {
      hasAccess,
      currentPlan,
      requiredPlan,
      upgradeUrl: hasAccess ? undefined : `/billing?upgrade=${requiredPlan}`
    };
  }
  
  return results;
}
