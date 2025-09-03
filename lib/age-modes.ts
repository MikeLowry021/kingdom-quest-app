import { AgeTier, AgeModeSettings } from './supabase'

export function getAgeGroupLabel(ageGroup: string | null): string {
  switch (ageGroup) {
    case 'child': return 'Child (12 and under)'
    case 'youth': return 'Youth (13-17)'
    case 'adult': return 'Adult (18+)'
    default: return 'Not specified'
  }
}

export function getAgeTierLabel(ageTier: AgeTier | null): string {
  switch (ageTier) {
    case 'toddler': return 'Toddler (2-3)'
    case 'preschool': return 'Preschool (4-5)'
    case 'elementary': return 'Elementary (6-8)'
    case 'preteen': return 'Pre-teen (9-12)'
    case 'early-teen': return 'Early Teen (13-15)'
    case 'late-teen': return 'Late Teen (16-17)'
    case 'young-adult': return 'Young Adult (18-25)'
    case 'adult': return 'Adult (26-64)'
    case 'senior': return 'Senior (65+)'
    default: return 'Not specified'
  }
}

export function getAgeTierFromAge(age: number): AgeTier {
  if (age <= 3) return 'toddler'
  if (age <= 5) return 'preschool'
  if (age <= 8) return 'elementary'
  if (age <= 12) return 'preteen'
  if (age <= 15) return 'early-teen'
  if (age <= 17) return 'late-teen'
  if (age <= 25) return 'young-adult'
  if (age <= 64) return 'adult'
  return 'senior'
}

export function isChildTier(ageTier: AgeTier | null): boolean {
  return ['toddler', 'preschool', 'elementary', 'preteen'].includes(ageTier || '')
}

export function isTeenTier(ageTier: AgeTier | null): boolean {
  return ['early-teen', 'late-teen'].includes(ageTier || '')
}

export function requiresParentalSupervision(ageTier: AgeTier | null): boolean {
  return ['toddler', 'preschool'].includes(ageTier || '')
}

export function getDefaultDifficulty(ageTier: AgeTier | null): 'beginner' | 'intermediate' | 'advanced' {
  switch (ageTier) {
    case 'toddler':
    case 'preschool':
    case 'elementary':
      return 'beginner'
    case 'preteen':
    case 'early-teen':
      return 'intermediate'
    default:
      return 'intermediate'
  }
}

export function getReadingLevel(ageTier: AgeTier | null): 'pre-reading' | 'beginning' | 'intermediate' | 'advanced' {
  switch (ageTier) {
    case 'toddler':
    case 'preschool':
      return 'pre-reading'
    case 'elementary':
      return 'beginning'
    case 'preteen':
    case 'early-teen':
      return 'intermediate'
    default:
      return 'advanced'
  }
}

export function getUIScale(settings: AgeModeSettings | null): {
  fontSize: string
  buttonPadding: string
  touchTarget: string
  spacing: string
} {
  const scale = settings?.ui_preferences?.fontSize || 'standard'
  
  switch (scale) {
    case 'extra-large':
      return {
        fontSize: 'text-xl md:text-2xl',
        buttonPadding: 'px-8 py-4',
        touchTarget: 'min-h-16 min-w-16',
        spacing: 'space-y-6'
      }
    case 'large':
      return {
        fontSize: 'text-lg md:text-xl',
        buttonPadding: 'px-6 py-3',
        touchTarget: 'min-h-12 min-w-12',
        spacing: 'space-y-4'
      }
    case 'small':
      return {
        fontSize: 'text-sm',
        buttonPadding: 'px-3 py-1.5',
        touchTarget: 'min-h-8 min-w-8',
        spacing: 'space-y-2'
      }
    default:
      return {
        fontSize: 'text-base',
        buttonPadding: 'px-4 py-2',
        touchTarget: 'min-h-10 min-w-10',
        spacing: 'space-y-3'
      }
  }
}

export function getColorScheme(settings: AgeModeSettings | null): Record<string, string> {
  const scheme = settings?.ui_preferences?.colorScheme || 'standard'
  
  switch (scheme) {
    case 'high-contrast':
      return {
        primary: 'bg-black text-white',
        secondary: 'bg-white text-black border-2 border-black',
        background: 'bg-white',
        text: 'text-black',
        accent: 'bg-yellow-400 text-black'
      }
    case 'friendly':
      return {
        primary: 'bg-green-500 hover:bg-green-600 text-white',
        secondary: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
        background: 'bg-blue-50',
        text: 'text-gray-800',
        accent: 'bg-yellow-300 text-gray-800'
      }
    case 'modern':
      return {
        primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
        background: 'bg-gray-50',
        text: 'text-gray-900',
        accent: 'bg-indigo-100 text-indigo-800'
      }
    default:
      return {
        primary: 'bg-kingdom-blue-600 hover:bg-kingdom-blue-700 text-white',
        secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300',
        background: 'bg-gray-50',
        text: 'text-gray-900',
        accent: 'bg-gold-100 text-gold-800'
      }
  }
}

export function shouldShowAudio(settings: AgeModeSettings | null): boolean {
  return settings?.ui_preferences?.audioFirst || false
}

export function getAnimationPreference(settings: AgeModeSettings | null): 'none' | 'reduced' | 'standard' {
  const pref = settings?.ui_preferences?.animations || 'standard'
  if (pref === 'none' || pref === 'reduced') return pref
  return 'standard'
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}