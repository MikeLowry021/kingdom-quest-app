'use client'

import { useState, useEffect, useMemo } from 'react'
import { AuthProvider } from '@/lib/auth'
import { Toaster } from 'sonner'
import { OfflineIndicator } from '@/lib/service-worker'

// SSR-safe wrapper component that prevents hydration mismatches
function SSRSafeWrapper({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)
  const [isHydrating, setIsHydrating] = useState(true)

  useEffect(() => {
    setIsMounted(true)
    // Small delay to ensure hydration is complete
    const timer = setTimeout(() => {
      setIsHydrating(false)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  // Memoize the wrapper content to prevent unnecessary re-renders
  const wrapperContent = useMemo(() => {
    // Always render children, but mark hydration state
    return (
      <div 
        className={`min-h-screen ${isHydrating ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        suppressHydrationWarning={true}
      >
        <OfflineIndicator />
        {children}
        <Toaster position="top-right" richColors />
      </div>
    )
  }, [children, isHydrating])

  return wrapperContent
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SSRSafeWrapper>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SSRSafeWrapper>
  )
}