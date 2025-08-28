'use client'

import { useEffect, useState } from 'react'

interface ServiceWorkerState {
  isSupported: boolean
  isInstalled: boolean
  isWaitingUpdate: boolean
  isOnline: boolean
  cacheStatus: Record<string, number>
}

interface CacheableStory {
  id: string
  title: string
  isCached: boolean
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null
  private listeners: Array<(state: ServiceWorkerState) => void> = []

  async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported')
      return false
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('Service Worker registered:', this.registration.scope)

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        this.notifyListeners()
      })

      // Listen for controller changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker controller changed')
        window.location.reload()
      })

      // Check for waiting service worker
      if (this.registration.waiting) {
        this.notifyListeners()
      }

      return true
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return false
    }
  }

  async getState(): Promise<ServiceWorkerState> {
    const isSupported = 'serviceWorker' in navigator
    const isInstalled = !!this.registration?.active
    const isWaitingUpdate = !!this.registration?.waiting
    const isOnline = navigator.onLine
    
    let cacheStatus: Record<string, number> = {}
    
    if (isInstalled && navigator.serviceWorker.controller) {
      try {
        cacheStatus = await this.getCacheStatus()
      } catch (error) {
        console.error('Failed to get cache status:', error)
      }
    }

    return {
      isSupported,
      isInstalled,
      isWaitingUpdate,
      isOnline,
      cacheStatus
    }
  }

  async cacheStory(storyId: string): Promise<void> {
    if (!navigator.serviceWorker.controller) {
      throw new Error('Service Worker not available')
    }

    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_STORY',
      payload: { storyId }
    })
  }

  async getCacheStatus(): Promise<Record<string, number>> {
    if (!navigator.serviceWorker.controller) {
      return {}
    }

    return new Promise((resolve) => {
      const channel = new MessageChannel()
      
      channel.port1.onmessage = (event) => {
        const { type, payload } = event.data
        if (type === 'CACHE_STATUS') {
          resolve(payload)
        }
      }

      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_CACHE_STATUS' },
        [channel.port2]
      )

      // Timeout after 5 seconds
      setTimeout(() => resolve({}), 5000)
    })
  }

  async clearCache(): Promise<void> {
    if (!navigator.serviceWorker.controller) {
      throw new Error('Service Worker not available')
    }

    return new Promise<void>((resolve) => {
      const channel = new MessageChannel()
      
      channel.port1.onmessage = (event) => {
        const { type } = event.data
        if (type === 'CACHE_CLEARED') {
          resolve()
        }
      }

      navigator.serviceWorker.controller.postMessage(
        { type: 'CLEAR_CACHE' },
        [channel.port2]
      )

      // Timeout after 10 seconds
      setTimeout(() => resolve(), 10000)
    })
  }

  async updateServiceWorker(): Promise<void> {
    if (!this.registration?.waiting) {
      throw new Error('No waiting service worker')
    }

    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }

  onStateChange(callback: (state: ServiceWorkerState) => void): () => void {
    this.listeners.push(callback)
    
    // Initial state
    this.getState().then(callback)
    
    // Return cleanup function
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private notifyListeners(): void {
    this.getState().then(state => {
      this.listeners.forEach(listener => listener(state))
    })
  }
}

// Singleton instance
const serviceWorkerManager = new ServiceWorkerManager()

// React hook for service worker management
export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isInstalled: false,
    isWaitingUpdate: false,
    isOnline: true,
    cacheStatus: {}
  })

  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    let cleanup: (() => void) | undefined

    const initializeServiceWorker = async () => {
      setIsInitializing(true)
      
      try {
        await serviceWorkerManager.initialize()
        
        // Listen for state changes
        cleanup = serviceWorkerManager.onStateChange(setState)
      } catch (error) {
        console.error('Failed to initialize service worker:', error)
      } finally {
        setIsInitializing(false)
      }
    }

    // Listen for online/offline events
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    initializeServiceWorker()

    return () => {
      cleanup?.()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const cacheStory = async (storyId: string): Promise<void> => {
    return serviceWorkerManager.cacheStory(storyId)
  }

  const clearCache = async (): Promise<void> => {
    return serviceWorkerManager.clearCache()
  }

  const updateServiceWorker = async (): Promise<void> => {
    return serviceWorkerManager.updateServiceWorker()
  }

  const refreshCacheStatus = async (): Promise<void> => {
    const cacheStatus = await serviceWorkerManager.getCacheStatus()
    setState(prev => ({ ...prev, cacheStatus }))
  }

  return {
    state,
    isInitializing,
    cacheStory,
    clearCache,
    updateServiceWorker,
    refreshCacheStatus
  }
}

// Offline indicator component
export function OfflineIndicator() {
  const { state } = useServiceWorker()

  if (state.isOnline) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-amber-900 px-4 py-2 text-center text-sm font-medium z-50">
      📱 You're offline - Previously viewed stories are available
    </div>
  )
}

// Story caching button component
interface StoryCacheButtonProps {
  storyId: string
  storyTitle: string
  className?: string
}

export function StoryCacheButton({ storyId, storyTitle, className }: StoryCacheButtonProps) {
  const { state, cacheStory } = useServiceWorker()
  const [isLoading, setIsLoading] = useState(false)
  const [isCached, setIsCached] = useState(false)

  const cacheKey = `kingdomquest-stories-v1.0.0`
  const storyUrl = `/api/stories/${storyId}`

  useEffect(() => {
    // Check if story is already cached
    const checkCacheStatus = async () => {
      if ('caches' in window) {
        try {
          const cache = await caches.open(cacheKey)
          const response = await cache.match(storyUrl)
          setIsCached(!!response)
        } catch (error) {
          console.error('Error checking cache status:', error)
        }
      }
    }

    checkCacheStatus()
  }, [storyId, storyUrl, cacheKey])

  const handleCacheStory = async () => {
    if (!state.isSupported || isLoading) return

    setIsLoading(true)
    try {
      await cacheStory(storyId)
      setIsCached(true)
    } catch (error) {
      console.error('Failed to cache story:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!state.isSupported || !state.isInstalled) {
    return null
  }

  return (
    <button
      onClick={handleCacheStory}
      disabled={isLoading || isCached}
      className={`
        inline-flex items-center gap-2 px-3 py-2 text-sm font-medium
        rounded-md transition-colors duration-200
        ${isCached 
          ? 'bg-green-100 text-green-800 cursor-default' 
          : 'bg-blue-100 text-blue-800 hover:bg-blue-200 active:bg-blue-300'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title={isCached ? 'Story available offline' : 'Save for offline reading'}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-blue-800 border-t-transparent rounded-full animate-spin" />
          <span>Saving...</span>
        </>
      ) : isCached ? (
        <>
          <span className="text-green-600">✓</span>
          <span>Offline Ready</span>
        </>
      ) : (
        <>
          <span>📱</span>
          <span>Save Offline</span>
        </>
      )}
    </button>
  )
}

export default serviceWorkerManager
