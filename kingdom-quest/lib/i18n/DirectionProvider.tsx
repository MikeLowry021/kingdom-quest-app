/**
 * Direction Provider component for RTL/LTR support
 * Provides direction context to child components
 */

'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useLocale } from 'next-intl';
import { getTextDirection, getRTLStyles, isRTLLocale } from './rtl-utils';
import type { Locale } from '../../i18n';

interface DirectionContextType {
  direction: 'ltr' | 'rtl';
  isRTL: boolean;
  locale: Locale;
  styles: React.CSSProperties;
}

const DirectionContext = createContext<DirectionContextType | undefined>(undefined);

/**
 * Hook to use direction context
 */
export function useDirection(): DirectionContextType {
  const context = useContext(DirectionContext);
  if (context === undefined) {
    throw new Error('useDirection must be used within a DirectionProvider');
  }
  return context;
}

/**
 * Direction Provider component
 */
export interface DirectionProviderProps {
  children: React.ReactNode;
  locale?: Locale;
  className?: string;
}

export function DirectionProvider({ 
  children, 
  locale: propLocale,
  className = ''
}: DirectionProviderProps) {
  const nextIntlLocale = useLocale() as Locale;
  const locale = propLocale || nextIntlLocale;
  
  const contextValue = useMemo(() => {
    const direction = getTextDirection(locale);
    const isRTL = isRTLLocale(locale);
    const styles = getRTLStyles(locale);
    
    return {
      direction,
      isRTL,
      locale,
      styles
    };
  }, [locale]);
  
  const combinedClassName = useMemo(() => {
    const directionClass = contextValue.isRTL ? 'rtl' : 'ltr';
    return `${directionClass} ${className}`.trim();
  }, [contextValue.isRTL, className]);
  
  return (
    <DirectionContext.Provider value={contextValue}>
      <div 
        dir={contextValue.direction}
        className={combinedClassName}
        style={contextValue.styles}
      >
        {children}
      </div>
    </DirectionContext.Provider>
  );
}

/**
 * RTL-aware wrapper component
 */
export interface RTLWrapperProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
}

export function RTLWrapper({
  children,
  as: Component = 'div',
  className = '',
  style = {},
  ...props
}: RTLWrapperProps) {
  const { direction, styles } = useDirection();
  
  const combinedStyle = useMemo(() => ({
    ...styles,
    ...style
  }), [styles, style]);
  
  return React.createElement(
    Component,
    {
      dir: direction,
      className,
      style: combinedStyle,
      ...props
    },
    children
  );
}

/**
 * HOC for RTL-aware components
 */
export function withDirection<P extends object>(
  Component: React.ComponentType<P>
) {
  const WrappedComponent = (props: P) => {
    const direction = useDirection();
    
    return (
      <Component 
        {...props} 
        {...{ direction }} // Pass direction as prop
      />
    );
  };
  
  WrappedComponent.displayName = `withDirection(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * RTL-aware text component
 */
export interface RTLTextProps {
  children: React.ReactNode;
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  className?: string;
  align?: 'start' | 'end' | 'center' | 'justify';
}

export function RTLText({
  children,
  as: Component = 'p',
  className = '',
  align = 'start'
}: RTLTextProps) {
  const { isRTL } = useDirection();
  
  const alignmentClass = useMemo(() => {
    switch (align) {
      case 'start':
        return isRTL ? 'text-right' : 'text-left';
      case 'end':
        return isRTL ? 'text-left' : 'text-right';
      case 'center':
        return 'text-center';
      case 'justify':
        return 'text-justify';
      default:
        return '';
    }
  }, [align, isRTL]);
  
  const combinedClassName = `${alignmentClass} ${className}`.trim();
  
  return React.createElement(
    Component,
    { className: combinedClassName },
    children
  );
}

/**
 * RTL-aware icon component wrapper
 */
export interface RTLIconProps {
  children: React.ReactNode;
  flip?: boolean; // Whether to flip the icon in RTL
  className?: string;
}

export function RTLIcon({
  children,
  flip = false,
  className = ''
}: RTLIconProps) {
  const { isRTL } = useDirection();
  
  const iconClassName = useMemo(() => {
    if (flip && isRTL) {
      return `${className} scale-x-[-1]`.trim();
    }
    return className;
  }, [className, flip, isRTL]);
  
  return (
    <span className={iconClassName}>
      {children}
    </span>
  );
}

/**
 * RTL-aware layout component
 */
export interface RTLLayoutProps {
  children: React.ReactNode;
  type?: 'flex' | 'grid' | 'block';
  reverse?: boolean; // Whether to reverse flex/grid direction in RTL
  className?: string;
}

export function RTLLayout({
  children,
  type = 'block',
  reverse = false,
  className = ''
}: RTLLayoutProps) {
  const { isRTL } = useDirection();
  
  const layoutClassName = useMemo(() => {
    let baseClass = className;
    
    if (type === 'flex') {
      baseClass += ' flex';
      if (reverse && isRTL) {
        baseClass += ' flex-row-reverse';
      }
    } else if (type === 'grid') {
      baseClass += ' grid';
      // Grid RTL handling would depend on specific layout needs
    }
    
    return baseClass.trim();
  }, [className, type, reverse, isRTL]);
  
  return (
    <div className={layoutClassName}>
      {children}
    </div>
  );
}