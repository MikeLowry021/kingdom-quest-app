'use client'

import { useEffect, useState } from 'react'
import { useAgeMode } from '@/lib/use-age-mode'
import { AgeModeOnboarding } from '@/components/age-mode-onboarding'
import { shouldShowAudio } from '@/lib/age-modes'

interface AgeModeWrapperProps {
  children: React.ReactNode
}

export function AgeModeWrapper({ children }: AgeModeWrapperProps) {
  const { ageTier, settings, loading } = useAgeMode()
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && !ageTier) {
      setNeedsOnboarding(true)
    }
  }, [mounted, loading, ageTier])

  // Don't render anything until mounted (avoid hydration issues)
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kingdom-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const handleOnboardingComplete = () => {
    setNeedsOnboarding(false)
  }

  // Show onboarding if needed
  if (needsOnboarding) {
    return <AgeModeOnboarding onComplete={handleOnboardingComplete} />
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kingdom-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your experience...</p>
        </div>
      </div>
    )
  }

  // Apply age-specific body classes for global styling
  useEffect(() => {
    if (settings) {
      const body = document.body
      
      // Remove any existing age-tier classes
      body.classList.forEach(className => {
        if (className.startsWith('age-tier-')) {
          body.classList.remove(className)
        }
      })
      
      // Add current age tier class
      body.classList.add(`age-tier-${ageTier}`)
      
      // Add UI preference classes
      if (settings.ui_preferences?.animations === 'reduced' || settings.ui_preferences?.animations === 'none') {
        body.classList.add('reduce-motion')
      }
      
      if (settings.ui_preferences?.colorScheme === 'high-contrast') {
        body.classList.add('high-contrast')
      }
      
      if (shouldShowAudio(settings)) {
        body.classList.add('audio-first')
      }
    }
  }, [settings, ageTier])

  return <>{children}</>
}