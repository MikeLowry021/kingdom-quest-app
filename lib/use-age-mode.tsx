'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './auth'
import { supabase, AgeTier, AgeModeSettings, UserPerformanceMetrics } from './supabase'
import { generateSessionId } from './age-modes'

interface AgeModeContextType {
  ageTier: AgeTier | null
  settings: AgeModeSettings | null
  performance: UserPerformanceMetrics | null
  sessionId: string
  loading: boolean
  error: string | null
  setupAgeMode: (tier: AgeTier, fullName: string, parentId?: string) => Promise<void>
  updateSettings: (updates: Partial<AgeModeSettings>) => Promise<void>
  trackEvent: (eventType: string, category: string, data?: Record<string, any>) => Promise<void>
  updateQuizPerformance: (quizId: string, scorePercentage: number, category?: string) => Promise<{
    currentDifficulty: string
    rollingAccuracy: number
    difficultyChanged: boolean
    adjustmentReason?: string
  }>
}

const AgeModeContext = createContext<AgeModeContextType | undefined>(undefined)

export function useAgeMode() {
  const context = useContext(AgeModeContext)
  if (context === undefined) {
    throw new Error('useAgeMode must be used within an AgeModeProvider')
  }
  return context
}

export function AgeModeProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [ageTier, setAgeTier] = useState<AgeTier | null>(null)
  const [settings, setSettings] = useState<AgeModeSettings | null>(null)
  const [performance, setPerformance] = useState<UserPerformanceMetrics | null>(null)
  const [sessionId] = useState<string>(generateSessionId())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load user's age mode settings
  const loadAgeModeData = useCallback(async () => {
    if (!user || !mounted) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Load age mode settings with fallback
      try {
        const { data: settingsData, error: settingsError } = await supabase
          .from('age_mode_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (settingsError && settingsError.code !== 'PGRST116') {
          console.warn('Age mode settings error (non-critical):', settingsError.message)
        }

        if (settingsData) {
          setSettings(settingsData)
          setAgeTier(settingsData.age_tier)
        }
      } catch (error) {
        console.warn('Age mode settings not available (non-critical):', error)
      }

      // Load performance metrics with fallback
      try {
        const { data: performanceData, error: performanceError } = await supabase
          .from('user_performance_metrics')
          .select('*')
          .eq('user_id', user.id)
          .eq('category', 'general')
          .maybeSingle()

        if (performanceError && performanceError.code !== 'PGRST116') {
          console.warn('Performance metrics error (non-critical):', performanceError.message)
        }

        if (performanceData) {
          setPerformance(performanceData)
        }
      } catch (error) {
        console.warn('Performance metrics not available (non-critical):', error)
      }

    } catch (error) {
      console.warn('Error loading age mode data (non-critical):', error)
      setError('Age mode features may be limited')
    } finally {
      setLoading(false)
    }
  }, [user, mounted])

  useEffect(() => {
    loadAgeModeData()
  }, [loadAgeModeData])

  const setupAgeMode = async (tier: AgeTier, fullName: string, parentId?: string) => {
    if (!user) throw new Error('User not authenticated')

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.functions.invoke('age-mode-setup', {
        body: {
          userId: user.id,
          ageTier: tier,
          fullName,
          parentId,
          isParent: !parentId && (tier === 'adult' || tier === 'senior')
        }
      })

      if (error) throw error

      // Reload age mode data after setup
      await loadAgeModeData()

      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to setup age mode'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (updates: Partial<AgeModeSettings>) => {
    if (!user || !settings) throw new Error('User not authenticated or settings not loaded')

    try {
      const updatedSettings = {
        ...settings,
        ...updates,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('age_mode_settings')
        .update(updatedSettings)
        .eq('user_id', user.id)

      if (error) throw error

      setSettings(updatedSettings)
    } catch (error) {
      console.error('Error updating settings:', error)
      throw error
    }
  }

  const trackEvent = async (eventType: string, category: string, data: Record<string, any> = {}) => {
    try {
      const eventData = {
        events: [{
          userId: user?.id,
          sessionId,
          event_type: eventType,
          event_category: category,
          event_data: data,
          age_tier: ageTier,
          difficulty_level: performance?.difficulty_level
        }]
      }

      const { error } = await supabase.functions.invoke('analytics-tracker', {
        body: eventData
      })

      if (error) {
        console.warn('Analytics tracking failed:', error)
      }
    } catch (error) {
      console.warn('Analytics tracking error:', error)
    }
  }

  const updateQuizPerformance = async (
    quizId: string, 
    scorePercentage: number, 
    category: string = 'general'
  ) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { data, error } = await supabase.functions.invoke('adaptive-quiz-difficulty', {
        body: {
          userId: user.id,
          quizId,
          scorePercentage,
          categoryType: category
        }
      })

      if (error) throw error

      // Update local performance state
      await loadAgeModeData()

      // Track the quiz completion event
      await trackEvent('quiz_completed', 'quiz', {
        quiz_id: quizId,
        score_percentage: scorePercentage,
        difficulty_level: data.data.currentDifficulty,
        category
      })

      return {
        currentDifficulty: data.data.currentDifficulty,
        rollingAccuracy: data.data.rollingAccuracy,
        difficultyChanged: data.data.difficultyChanged,
        adjustmentReason: data.data.adjustmentReason
      }
    } catch (error) {
      console.error('Error updating quiz performance:', error)
      throw error
    }
  }

  // Don't render anything until mounted and auth is ready to avoid hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <AgeModeContext.Provider value={{
      ageTier,
      settings,
      performance,
      sessionId,
      loading,
      error,
      setupAgeMode,
      updateSettings,
      trackEvent,
      updateQuizPerformance
    }}>
      {children}
    </AgeModeContext.Provider>
  )
}