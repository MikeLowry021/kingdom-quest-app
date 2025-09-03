'use client'

import React from 'react'
import { Button as BaseButton } from '@/components/ui/button'
import { useAgeMode } from '@/lib/use-age-mode'
import { getUIScale, getColorScheme, getAnimationPreference } from '@/lib/age-modes'
import { cn } from '@/lib/utils'

interface AdaptiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'default' | 'lg' | 'adaptive'
  children: React.ReactNode
  audioLabel?: string // For screen readers and audio-first interfaces
}

export function AdaptiveButton({ 
  variant = 'primary', 
  size = 'adaptive', 
  className, 
  children, 
  audioLabel,
  onClick,
  ...props 
}: AdaptiveButtonProps) {
  const { settings, trackEvent } = useAgeMode()
  const uiScale = getUIScale(settings)
  const colorScheme = getColorScheme(settings)
  const animationPref = getAnimationPreference(settings)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Track button interactions for analytics
    trackEvent('button_click', 'ui_interaction', {
      button_variant: variant,
      audio_label: audioLabel || (typeof children === 'string' ? children : 'button'),
      context: 'adaptive_ui'
    })

    if (onClick) {
      onClick(e)
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return colorScheme.primary
      case 'secondary':
        return colorScheme.secondary
      default:
        return colorScheme.secondary + ' border'
    }
  }

  const getSizeClasses = () => {
    if (size === 'adaptive') {
      return `${uiScale.buttonPadding} ${uiScale.fontSize} ${uiScale.touchTarget}`
    }
    return '' // Use default button sizing
  }

  const getAnimationClasses = () => {
    switch (animationPref) {
      case 'none':
        return ''
      case 'reduced':
        return 'transition-colors duration-150'
      default:
        return 'transition-all duration-200 hover:scale-105 active:scale-95'
    }
  }

  return (
    <button
      {...props}
      className={cn(
        'rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kingdom-blue-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        getVariantClasses(),
        getSizeClasses(),
        getAnimationClasses(),
        className
      )}
      onClick={handleClick}
      aria-label={audioLabel || (typeof children === 'string' ? children : undefined)}
    >
      {children}
    </button>
  )
}

interface AdaptiveCardProps {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
  interactive?: boolean
  onClick?: () => void
}

export function AdaptiveCard({ 
  children, 
  className, 
  title, 
  description, 
  interactive = false,
  onClick 
}: AdaptiveCardProps) {
  const { settings, trackEvent } = useAgeMode()
  const uiScale = getUIScale(settings)
  const colorScheme = getColorScheme(settings)
  const animationPref = getAnimationPreference(settings)

  const handleClick = () => {
    if (interactive && onClick) {
      trackEvent('card_click', 'ui_interaction', {
        card_title: title || 'untitled',
        context: 'adaptive_ui'
      })
      onClick()
    }
  }

  const getAnimationClasses = () => {
    if (!interactive) return ''
    
    switch (animationPref) {
      case 'none':
        return 'cursor-pointer'
      case 'reduced':
        return 'cursor-pointer transition-colors duration-150'
      default:
        return 'cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg'
    }
  }

  return (
    <div
      className={cn(
        'bg-white rounded-lg border shadow-sm',
        uiScale.spacing,
        interactive && getAnimationClasses(),
        className
      )}
      onClick={handleClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      <div className={`p-4 ${uiScale.spacing}`}>
        {title && (
          <h3 className={`font-semibold ${colorScheme.text} ${uiScale.fontSize} mb-2`}>
            {title}
          </h3>
        )}
        {description && (
          <p className={`${colorScheme.text} opacity-70 text-sm mb-3`}>
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  )
}

interface AdaptiveTextProps {
  children: React.ReactNode
  variant?: 'title' | 'heading' | 'body' | 'caption'
  className?: string
  readingLevel?: 'simple' | 'standard' | 'advanced'
}

export function AdaptiveText({ 
  children, 
  variant = 'body', 
  className,
  readingLevel = 'standard'
}: AdaptiveTextProps) {
  const { settings } = useAgeMode()
  const uiScale = getUIScale(settings)
  const colorScheme = getColorScheme(settings)
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'title':
        return `text-2xl md:text-3xl font-serif font-bold ${colorScheme.text}`
      case 'heading':
        return `text-lg md:text-xl font-semibold ${colorScheme.text}`
      case 'caption':
        return `text-sm ${colorScheme.text} opacity-70`
      default:
        return `${uiScale.fontSize} ${colorScheme.text}`
    }
  }

  const Component = variant === 'title' ? 'h1' : variant === 'heading' ? 'h2' : 'p'

  return (
    <Component className={cn(getVariantClasses(), className)}>
      {children}
    </Component>
  )
}

interface AdaptiveInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
}

export function AdaptiveInput({ 
  label, 
  error, 
  helpText, 
  className, 
  ...props 
}: AdaptiveInputProps) {
  const { settings, trackEvent } = useAgeMode()
  const uiScale = getUIScale(settings)
  const colorScheme = getColorScheme(settings)

  const handleFocus = () => {
    trackEvent('input_focus', 'ui_interaction', {
      input_label: label || 'unlabeled',
      context: 'adaptive_ui'
    })
  }

  return (
    <div className={uiScale.spacing}>
      {label && (
        <label className={`block ${uiScale.fontSize} font-medium ${colorScheme.text} mb-2`}>
          {label}
        </label>
      )}
      <input
        {...props}
        className={cn(
          `w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kingdom-blue-500 focus:border-transparent`,
          uiScale.fontSize,
          uiScale.touchTarget,
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        onFocus={handleFocus}
      />
      {helpText && (
        <p className="text-sm text-gray-600 mt-1">{helpText}</p>
      )}
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}