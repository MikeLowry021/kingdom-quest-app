import { supabase } from '@/lib/supabase'

// Subscription plan types
export type PlanType = 'free' | 'premium' | 'church'

export interface SubscriptionPlan {
  id: PlanType
  name: string
  display_name: string
  description: string
  price_monthly: number // in cents (ZAR)
  price_annual: number // in cents (ZAR)
  features: string[]
  is_active: boolean
  sort_order: number
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: PlanType
  status: 'active' | 'inactive' | 'cancelled' | 'past_due'
  billing_cycle: 'monthly' | 'annual'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  trial_start?: string
  trial_end?: string
  yoco_payment_method_id?: string
  yoco_customer_id?: string
  created_at: string
  updated_at: string
}

export interface ChurchProfile {
  id: string
  user_id: string
  church_name: string
  church_address?: string
  church_phone?: string
  church_email?: string
  denomination?: string
  pastor_name?: string
  church_size?: 'small' | 'medium' | 'large' | 'mega'
  logo_url?: string
  primary_color: string
  secondary_color: string
  custom_message?: string
  privacy_sla_accepted: boolean
  privacy_sla_accepted_date?: string
  data_retention_days: number
  allow_analytics: boolean
  allow_external_sharing: boolean
  created_at: string
  updated_at: string
}

// Feature definitions for each plan
export const PLAN_FEATURES = {
  free: [
    'Core Stories',
    'Basic Quizzes', 
    'Family Altar',
    'Community Support'
  ],
  premium: [
    'Everything in Free',
    'Deluxe Quest Packs',
    'Extra Media Content',
    'Offline Access',
    'Priority Support',
    'Advanced Analytics'
  ],
  church: [
    'Everything in Premium',
    'Admin Dashboard',
    'Custom Branding',
    'User Analytics',
    'Privacy SLA',
    'User Management',
    'Bulk Enrollment',
    'Dedicated Support'
  ]
} as const

// Feature access mapping
export const FEATURE_ACCESS = {
  // Core features (available to all)
  'core_stories': ['free', 'premium', 'church'],
  'basic_quizzes': ['free', 'premium', 'church'],
  'family_altar': ['free', 'premium', 'church'],
  'community_support': ['free', 'premium', 'church'],
  
  // Premium features
  'deluxe_quest_packs': ['premium', 'church'],
  'extra_media_content': ['premium', 'church'],
  'offline_access': ['premium', 'church'],
  'priority_support': ['premium', 'church'],
  'advanced_analytics': ['premium', 'church'],
  
  // Church-only features
  'admin_dashboard': ['church'],
  'custom_branding': ['church'],
  'user_analytics': ['church'],
  'privacy_sla': ['church'],
  'user_management': ['church'],
  'bulk_enrollment': ['church'],
  'dedicated_support': ['church']
} as const

// Get user's current subscription
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle()
    
    if (error) {
      console.error('Error fetching user subscription:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error in getUserSubscription:', error)
    return null
  }
}

// Get user's current plan type
export async function getUserPlanType(userId: string): Promise<PlanType> {
  try {
    const subscription = await getUserSubscription(userId)
    
    if (subscription && subscription.status === 'active') {
      return subscription.plan_id
    }
    
    // Fallback to checking profile table for plan_type
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan_type')
      .eq('id', userId)
      .maybeSingle()
    
    return (profile?.plan_type as PlanType) || 'free'
  } catch (error) {
    console.error('Error getting user plan type:', error)
    return 'free'
  }
}

// Check if user has access to a specific feature
export async function hasFeatureAccess(userId: string, featureName: keyof typeof FEATURE_ACCESS): Promise<boolean> {
  try {
    const userPlan = await getUserPlanType(userId)
    const allowedPlans = FEATURE_ACCESS[featureName]
    return allowedPlans.includes(userPlan)
  } catch (error) {
    console.error('Error checking feature access:', error)
    return false // Fail closed for security
  }
}

// Get all subscription plans
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    
    if (error) {
      console.error('Error fetching subscription plans:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error in getSubscriptionPlans:', error)
    return []
  }
}

// Get church profile for user
export async function getChurchProfile(userId: string): Promise<ChurchProfile | null> {
  try {
    const { data, error } = await supabase
      .from('church_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (error) {
      console.error('Error fetching church profile:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error in getChurchProfile:', error)
    return null
  }
}

// Check if user is on church plan
export async function isChurchUser(userId: string): Promise<boolean> {
  const userPlan = await getUserPlanType(userId)
  return userPlan === 'church'
}

// Format currency for ZAR display
export function formatZAR(cents: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(cents / 100)
}

// Calculate discounted annual price
export function calculateAnnualDiscount(monthlyPrice: number): number {
  // 2 months free with annual billing
  return monthlyPrice * 10
}

// Get feature upgrade prompts
export function getUpgradePrompt(featureName: keyof typeof FEATURE_ACCESS, currentPlan: PlanType): string {
  const allowedPlans = FEATURE_ACCESS[featureName]
  const requiredPlan = allowedPlans.find(plan => plan !== 'free')
  
  if (!requiredPlan) {
    return 'This feature requires a subscription upgrade.'
  }
  
  const planName = requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)
  
  switch (featureName) {
    case 'deluxe_quest_packs':
      return `Unlock Deluxe Quest Packs with ${planName}! Get access to premium biblical adventures with enhanced storytelling and interactive elements.`
    case 'extra_media_content':
      return `Access premium media content with ${planName}! Enjoy high-quality videos, audio narrations, and interactive visual elements.`
    case 'offline_access':
      return `Take KingdomQuest anywhere with ${planName}! Download content for offline use during trips or areas with limited internet.`
    case 'admin_dashboard':
      return `Manage your church community with Church Plan! Access powerful admin tools to oversee members and track spiritual growth.`
    case 'custom_branding':
      return `Personalize KingdomQuest for your church with Church Plan! Add your logo, colors, and custom messaging.`
    default:
      return `This premium feature is available with ${planName} plan. Upgrade to unlock enhanced spiritual growth tools.`
  }
}

// Log user analytics event
export async function logUserAnalytics(
  userId: string,
  eventType: string,
  eventData: Record<string, any> = {},
  churchId?: string
): Promise<void> {
  try {
    await supabase.functions.invoke('log-user-analytics', {
      body: {
        userId,
        eventType,
        churchId,
        eventData,
        sessionId: generateSessionId(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
        ipAddress: null // Will be filled by edge function
      }
    })
  } catch (error) {
    console.error('Error logging analytics:', error)
  }
}

// Generate session ID
function generateSessionId(): string {
  return typeof window !== 'undefined' 
    ? `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    : `server_${Date.now()}`
}