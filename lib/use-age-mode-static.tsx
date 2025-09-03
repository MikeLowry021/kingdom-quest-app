'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './auth-static'
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
  const { user } = useAuth()
  const [clientOnly, setClientOnly] = useState(false)
  const [ageTier, setAgeTier] = useState<AgeTier | null>(null)
  const [settings, setSettings] = useState<AgeModeSettings | null>(null)
  const [performance, setPerformance] = useState<UserPerformanceMetrics | null>(null)
  const [sessionId] = useState<string>(generateSessionId())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Set client-only flag
  useEffect(() => {
    setClientOnly(true)
  }, [])

  // Load user's age mode settings
  const loadAgeModeData = useCallback(async () => {
    if (!user || !clientOnly) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Load age mode settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('age_mode_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (settingsError) throw settingsError

      if (settingsData) {
        setSettings(settingsData)
        setAgeTier(settingsData.age_tier)
      }

      // Load performance metrics
      const { data: performanceData, error: performanceError } = await supabase
        .from('user_performance_metrics')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', 'general')
        .maybeSingle()

      if (performanceError && performanceError.code !== 'PGRST116') {
        console.warn('Error loading performance data:', performanceError)
      }

      if (performanceData) {
        setPerformance(performanceData)
      }

    } catch (error) {
      console.error('Error loading age mode data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load age mode data')
    } finally {
      setLoading(false)
    }
  }, [user, clientOnly])

  useEffect(() => {
    if (clientOnly) {
      loadAgeModeData()
    }
  }, [loadAgeModeData, clientOnly])

  const setupAgeMode = async (tier: AgeTier, fullName: string, parentId?: string) => {
    if (!user) throw new Error('User not authenticated')
    if (!clientOnly) return

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
    if (!clientOnly) return

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
    if (!clientOnly) return
    
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
    if (!clientOnly) return { currentDifficulty: 'medium', rollingAccuracy: 0, difficultyChanged: false }

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