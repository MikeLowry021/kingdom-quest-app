// Service Worker for KingdomQuest - Offline Story Access
// This service worker caches story content that users have accessed for offline viewing

const CACHE_VERSION = 'v1.0.0'
const CACHE_PREFIX = 'kingdomquest'
const STATIC_CACHE = `${CACHE_PREFIX}-static-${CACHE_VERSION}`
const STORY_CACHE = `${CACHE_PREFIX}-stories-${CACHE_VERSION}`
const MEDIA_CACHE = `${CACHE_PREFIX}-media-${CACHE_VERSION}`
const API_CACHE = `${CACHE_PREFIX}-api-${CACHE_VERSION}`

// App shell - always cached for offline functionality
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/images/kingdomquest-logo-horizontal.png',
  '/images/kingdomquest-icon-only.png',
  '/_next/static/css/',
  '/_next/static/js/'
]

// Story-related routes and content patterns
const STORY_PATTERNS = [
  /\/quest\/[^/]+/,
  /\/api\/stories\/[^/]+/,
  /\/content\/[^/]+\/story\.json/,
  /\/api\/story-progress/
]

// Media content patterns (images, audio, video)
const MEDIA_PATTERNS = [
  /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i,
  /\.(mp3|wav|ogg|m4a)$/i,
  /\.(mp4|webm|ogv)$/i
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS.filter(asset => !asset.includes('_next/static')))
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith(CACHE_PREFIX) && 
                     !cacheName.includes(CACHE_VERSION)
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      }),
      // Claim all clients
      self.clients.claim()
    ])
  )
})

// Fetch event - handle all network requests
self.addEventListener('fetch', (event) => {
  const { request } = event
  const { url, method } = request
  
  // Only handle GET requests
  if (method !== 'GET') {
    return
  }
  
  // Skip chrome extension requests
  if (url.startsWith('chrome-extension://')) {
    return
  }
  
  console.log('[SW] Handling request:', url)
  
  event.respondWith(handleRequest(request))
})

// Main request handler with caching strategies
async function handleRequest(request) {
  const { url } = request
  
  try {
    // Strategy 1: Static assets - Cache First
    if (isStaticAsset(url)) {
      return await cacheFirstStrategy(request, STATIC_CACHE)
    }
    
    // Strategy 2: Story content - Network First with cache fallback
    if (isStoryContent(url)) {
      return await networkFirstStrategy(request, STORY_CACHE)
    }
    
    // Strategy 3: Media content - Cache First with network fallback
    if (isMediaContent(url)) {
      return await cacheFirstStrategy(request, MEDIA_CACHE)
    }
    
    // Strategy 4: API calls - Network First with cache fallback
    if (isApiRequest(url)) {
      return await networkFirstStrategy(request, API_CACHE)
    }
    
    // Strategy 5: Everything else - Network Only
    return await fetch(request)
    
  } catch (error) {
    console.error('[SW] Request failed:', error)
    return await handleOfflineFallback(request)
  }
}

// Cache First Strategy - check cache first, then network
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  
  if (cached) {
    console.log('[SW] Cache hit:', request.url)
    return cached
  }
  
  console.log('[SW] Cache miss, fetching:', request.url)
  const response = await fetch(request)
  
  // Cache successful responses
  if (response.ok) {
    await cache.put(request, response.clone())
  }
  
  return response
}

// Network First Strategy - try network first, fallback to cache
async function networkFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName)
  
  try {
    console.log('[SW] Network first for:', request.url)
    const response = await fetch(request)
    
    // Cache successful responses
    if (response.ok) {
      await cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.log('[SW] Network failed, checking cache:', request.url)
    const cached = await cache.match(request)
    
    if (cached) {
      console.log('[SW] Serving from cache:', request.url)
      return cached
    }
    
    throw error
  }
}

// Handle offline scenarios
async function handleOfflineFallback(request) {
  const { url } = request
  
  // For story pages, try to serve cached story page or offline page
  if (isStoryContent(url)) {
    const cache = await caches.open(STORY_CACHE)
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }
    
    // Return offline story page
    return new Response(createOfflineStoryPage(), {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'text/html' }
    })
  }
  
  // For API requests, return cached data if available
  if (isApiRequest(url)) {
    const cache = await caches.open(API_CACHE)
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }
  }
  
  // Generic offline response
  return new Response('Offline - Content not available', {
    status: 503,
    statusText: 'Service Unavailable'
  })
}

// Helper functions to identify request types
function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.includes(asset)) ||
         url.includes('_next/static/') ||
         url.includes('.css') ||
         url.includes('.js') ||
         url.endsWith('/favicon.ico')
}

function isStoryContent(url) {
  return STORY_PATTERNS.some(pattern => pattern.test(url))
}

function isMediaContent(url) {
  return MEDIA_PATTERNS.some(pattern => pattern.test(url))
}

function isApiRequest(url) {
  return url.includes('/api/') || url.includes('supabase')
}

// Create offline story page HTML
function createOfflineStoryPage() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - KingdomQuest</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          background: linear-gradient(135deg, #1e3a5f, #2563eb);
          color: white;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
          padding: 20px;
          box-sizing: border-box;
        }
        .offline-container {
          text-align: center;
          max-width: 500px;
          padding: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        h1 { margin-bottom: 16px; color: #d4af37; }
        p { line-height: 1.6; margin-bottom: 24px; opacity: 0.9; }
        .retry-btn {
          background: #d4af37;
          color: #1e3a5f;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 16px;
          transition: transform 0.2s ease;
        }
        .retry-btn:hover {
          transform: translateY(-2px);
        }
        .offline-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 24px;
          opacity: 0.7;
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">📚</div>
        <h1>Story Not Available Offline</h1>
        <p>This story hasn't been cached for offline viewing yet. Please connect to the internet and visit this story to make it available offline.</p>
        <button class="retry-btn" onclick="window.location.reload()">Try Again</button>
      </div>
    </body>
    </html>
  `
}

// Background sync for story caching
self.addEventListener('sync', (event) => {
  if (event.tag === 'cache-stories') {
    event.waitUntil(cacheUserStories())
  }
})

// Cache user's accessed stories
async function cacheUserStories() {
  try {
    // This would integrate with the app's story tracking
    console.log('[SW] Background sync - caching user stories')
    
    // Get list of user's accessed stories from IndexedDB or API
    const accessedStories = await getUserAccessedStories()
    
    const cache = await caches.open(STORY_CACHE)
    
    for (const story of accessedStories) {
      try {
        // Cache story content
        await cache.add(`/api/stories/${story.id}`)
        
        // Cache story media
        if (story.mediaItems) {
          for (const media of story.mediaItems) {
            await cache.add(media.url)
          }
        }
      } catch (error) {
        console.log(`[SW] Failed to cache story ${story.id}:`, error)
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error)
  }
}

// Placeholder function - would integrate with actual app data
async function getUserAccessedStories() {
  // This would read from IndexedDB or make an API call
  // For now, return empty array
  return []
}

// Message handling for cache management
self.addEventListener('message', (event) => {
  const { type, payload } = event.data
  
  switch (type) {
    case 'CACHE_STORY':
      cacheStoryContent(payload.storyId)
      break
    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage({ type: 'CACHE_STATUS', payload: status })
      })
      break
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED' })
      })
      break
  }
})

// Cache specific story content
async function cacheStoryContent(storyId) {
  try {
    const cache = await caches.open(STORY_CACHE)
    
    // Cache story data
    await cache.add(`/api/stories/${storyId}`)
    await cache.add(`/quest/${storyId}`)
    
    console.log(`[SW] Cached story ${storyId} for offline access`)
  } catch (error) {
    console.error(`[SW] Failed to cache story ${storyId}:`, error)
  }
}

// Get cache status
async function getCacheStatus() {
  const cacheNames = await caches.keys()
  const status = {}
  
  for (const cacheName of cacheNames) {
    if (cacheName.startsWith(CACHE_PREFIX)) {
      const cache = await caches.open(cacheName)
      const keys = await cache.keys()
      status[cacheName] = keys.length
    }
  }
  
  return status
}

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys()
  await Promise.all(
    cacheNames
      .filter(name => name.startsWith(CACHE_PREFIX))
      .map(name => caches.delete(name))
  )
}
