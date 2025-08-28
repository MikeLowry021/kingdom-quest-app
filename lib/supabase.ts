import { createClient } from '@supabase/supabase-js'

// Ensure environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Provide fallback values for development/build time
  console.warn('Missing Supabase environment variables, using fallback values')
}

const defaultUrl = supabaseUrl || 'https://placeholder.supabase.co'
const defaultKey = supabaseAnonKey || 'placeholder_key'

// Create Supabase client with SSR-safe configuration
export const supabase = createClient(defaultUrl, defaultKey, {
  auth: {
    // Only enable session persistence on client side
    persistSession: typeof window !== 'undefined',
    autoRefreshToken: typeof window !== 'undefined',
    detectSessionInUrl: typeof window !== 'undefined',
    // Ensure consistent behavior during SSR
    flowType: 'pkce',
    // Prevent automatic sign-in attempts during SSR
    storageKey: typeof window !== 'undefined' ? 'sb-auth-token' : undefined,
  },
  // Only use real-time features on client side
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
  db: {
    // Ensure consistent schema handling
    schema: 'public',
  },
  global: {
    // Add headers to identify requests
    headers: {
      'X-Client-Info': 'kingdomquest-web'
    },
  },
})

export type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  age_group: 'child' | 'youth' | 'adult' | null
  parent_id: string | null
  is_parent: boolean
  preferences: Record<string, any>
  created_at: string
  updated_at: string
}

export type AgeTier = 'toddler' | 'preschool' | 'elementary' | 'preteen' | 'early-teen' | 'late-teen' | 'young-adult' | 'adult' | 'senior'

export type UserPerformanceMetrics = {
  id: string
  user_id: string
  category: string
  accuracy_score: number
  total_attempts: number
  correct_answers: number
  last_updated: string
  rolling_accuracy: number
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  created_at: string
}

export type QuizDifficultyAdjustment = {
  id: string
  user_id: string
  quiz_id: string
  original_difficulty: string
  adjusted_difficulty: string
  adjustment_reason: string
  performance_score: number
  created_at: string
}

export type FamilyAccount = {
  id: string
  parent_id: string
  child_id: string
  relationship_type: string
  permissions: Record<string, any>
  oversight_level: 'full' | 'partial' | 'minimal'
  created_at: string
  updated_at: string
}

export type AgeModeSettings = {
  id: string
  user_id: string
  age_tier: AgeTier
  ui_preferences: {
    fontSize?: 'small' | 'standard' | 'large' | 'extra-large'
    buttonSize?: 'small' | 'standard' | 'large' | 'extra-large'
    colorScheme?: 'standard' | 'high-contrast' | 'friendly' | 'modern' | 'adaptive'
    animations?: 'none' | 'reduced' | 'gentle' | 'standard' | 'full'
    touchTargetSize?: 'small' | 'standard' | 'large' | 'extra-large'
    audioFirst?: boolean
    readingLevel?: 'pre-reading' | 'beginning' | 'intermediate' | 'advanced'
    navigation?: 'simplified' | 'guided' | 'standard' | 'full'
    [key: string]: any
  }
  content_restrictions: {
    maxStoryLength?: number
    allowedThemes?: string[] | 'all'
    vocabularyLevel?: 'basic' | 'elementary' | 'intermediate' | 'advanced'
    conceptComplexity?: 'concrete' | 'basic' | 'moderate' | 'complex'
    requireSupervision?: boolean
    [key: string]: any
  }
  accessibility_settings: {
    screenReader?: boolean
    keyboardNav?: boolean
    voiceGuidance?: 'on' | 'optional' | 'off'
    visualCues?: 'enhanced' | 'standard' | 'minimal'
    motorAssistance?: boolean
    [key: string]: any
  }
  parental_controls: {
    fullControl?: boolean
    contentApproval?: 'required' | 'recommended' | 'optional' | 'none'
    timeRestrictions?: boolean
    progressReporting?: 'detailed' | 'regular' | 'summary' | 'optional'
    supervisionRequired?: boolean
    [key: string]: any
  }
  created_at: string
  updated_at: string
}

export type UserAnalyticsEvent = {
  id: string
  user_id: string | null
  session_id: string | null
  event_type: string
  event_category: string
  event_data: Record<string, any>
  age_tier: AgeTier | null
  difficulty_level: string | null
  timestamp: string
}

export type Story = {
  id: string
  title: string
  description: string | null
  bible_book: string
  bible_chapter: number
  bible_verses: string
  bible_translation: string
  age_rating: 'all' | 'children' | 'youth' | 'adult'
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

export type Scene = {
  id: string
  story_id: string
  title: string
  narrative: string
  scene_order: number
  interactions: any[]
  created_at: string
  updated_at: string
}

export type Quiz = {
  id: string
  story_id: string | null
  title: string
  description: string | null
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null
  passing_score: number
  time_limit: number
  created_at: string
  updated_at: string
}

export type QuizQuestion = {
  id: string
  quiz_id: string
  question_text: string
  question_type: 'multiple-choice' | 'true-false' | 'fill-in-blank' | 'matching'
  bible_book: string | null
  bible_chapter: number | null
  bible_verses: string | null
  points: number
  created_at: string
  updated_at: string
}

export type QuizOption = {
  id: string
  question_id: string
  option_text: string
  is_correct: boolean
  explanation: string | null
  created_at: string
}

export type Prayer = {
  id: string
  title: string
  content: string
  category: 'praise' | 'thanksgiving' | 'confession' | 'supplication' | 'intercession'
  bible_book: string | null
  bible_chapter: number | null
  bible_verses: string | null
  bible_translation: string
  age_rating: 'all' | 'children' | 'youth' | 'adult' | null
  is_template: boolean
  tags: string[] | null
  created_at: string
  updated_at: string
}

export type FamilyAltar = {
  id: string
  title: string
  summary: string | null
  bible_book: string
  bible_chapter: number
  bible_verses: string
  bible_translation: string
  scripture: string
  activity_instructions: string | null
  duration: number | null
  age_rating: 'all' | 'children' | 'youth' | 'adult' | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

export type Media = {
  id: string
  title: string | null
  type: 'image' | 'audio' | 'video' | 'document'
  url: string
  content_type: string
  filename: string | null
  file_size: number | null
  duration: number | null
  alt_text: string | null
  caption: string | null
  attribution: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
}