'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  fill?: boolean
  quality?: number
  loading?: 'lazy' | 'eager'
  // Motion preference handling
  disableAnimations?: boolean
  // Custom lazy loading options
  rootMargin?: string
  threshold?: number
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  fill = false,
  quality = 75,
  loading = 'lazy',
  disableAnimations = false,
  rootMargin = '50px',
  threshold = 0.1,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin,
        threshold
      }
    )

    const currentRef = imgRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [priority, isInView, rootMargin, threshold])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  // Don't load image until it's in view (unless priority)
  if (!isInView && !priority) {
    return (
      <div
        ref={imgRef}
        className={cn(
          'bg-gray-200 animate-pulse',
          className,
          // Respect motion preferences
          prefersReducedMotion && 'animate-none'
        )}
        style={
          !fill && width && height 
            ? { width, height } 
            : fill 
            ? { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }
            : undefined
        }
      />
    )
  }

  if (hasError) {
    return (
      <div
        className={cn(
          'bg-gray-100 flex items-center justify-center text-gray-400 text-sm',
          className
        )}
        style={
          !fill && width && height 
            ? { width, height } 
            : fill 
            ? { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }
            : undefined
        }
      >
        Image failed to load
      </div>
    )
  }

  const imageProps = {
    src,
    alt,
    className: cn(
      'transition-opacity duration-300',
      isLoaded ? 'opacity-100' : 'opacity-0',
      // Disable transitions if user prefers reduced motion
      (prefersReducedMotion || disableAnimations) && 'transition-none',
      className
    ),
    onLoad: handleLoad,
    onError: handleError,
    quality,
    priority,
    loading,
    placeholder,
    ...(blurDataURL && { blurDataURL }),
    ...(sizes && { sizes }),
    ...props
  }

  if (fill) {
    return <Image {...imageProps} fill />
  }

  return (
    <Image
      {...imageProps}
      width={width}
      height={height}
    />
  )
}

// Utility hook for motion preferences
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

// Default export for easier imports
export default OptimizedImage
