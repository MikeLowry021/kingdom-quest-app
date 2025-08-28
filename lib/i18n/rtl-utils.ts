/**
 * RTL (Right-to-Left) support utilities for KingdomQuest
 * Provides utilities and components for handling RTL languages
 */

import { Locale } from '../../i18n';

// RTL locale configuration - Add RTL locales here when implemented
export const RTL_LOCALES: readonly Locale[] = [] as const;

// Future RTL locales (commented out until translations are ready)
// export const RTL_LOCALES: readonly string[] = ['ar', 'he', 'fa', 'ur'] as const;

/**
 * Check if a locale uses RTL direction
 */
export function isRTLLocale(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}

/**
 * Get text direction for a locale
 */
export function getTextDirection(locale: Locale): 'ltr' | 'rtl' {
  return isRTLLocale(locale) ? 'rtl' : 'ltr';
}

/**
 * Get the appropriate CSS class for text direction
 */
export function getDirectionClass(locale: Locale): string {
  return isRTLLocale(locale) ? 'rtl' : 'ltr';
}

/**
 * RTL-aware margin/padding utilities
 */
export const rtlUtils = {
  // Margin utilities
  ml: (value: string) => `ml-${value} rtl:ml-0 rtl:mr-${value}`,
  mr: (value: string) => `mr-${value} rtl:mr-0 rtl:ml-${value}`,
  
  // Padding utilities
  pl: (value: string) => `pl-${value} rtl:pl-0 rtl:pr-${value}`,
  pr: (value: string) => `pr-${value} rtl:pr-0 rtl:pl-${value}`,
  
  // Border utilities
  'border-l': (value: string = '1') => `border-l-${value} rtl:border-l-0 rtl:border-r-${value}`,
  'border-r': (value: string = '1') => `border-r-${value} rtl:border-r-0 rtl:border-l-${value}`,
  
  // Rounded corners
  'rounded-l': (value: string = '') => `rounded-l${value ? '-' + value : ''} rtl:rounded-l-none rtl:rounded-r${value ? '-' + value : ''}`,
  'rounded-r': (value: string = '') => `rounded-r${value ? '-' + value : ''} rtl:rounded-r-none rtl:rounded-l${value ? '-' + value : ''}`,
  
  // Text alignment
  'text-left': 'text-left rtl:text-right',
  'text-right': 'text-right rtl:text-left',
  
  // Flexbox utilities
  'justify-start': 'justify-start rtl:justify-end',
  'justify-end': 'justify-end rtl:justify-start',
  
  // Transform utilities for icons
  'rotate-0': 'rtl:scale-x-[-1]',
  'rotate-180': 'rotate-180 rtl:rotate-0 rtl:scale-x-[-1]',
};

/**
 * RTL-aware class name builder
 */
export function rtlClass(classes: Record<string, string>, locale?: Locale): string {
  if (!locale) return '';
  
  const direction = getTextDirection(locale);
  const rtlClasses: string[] = [];
  
  for (const [key, value] of Object.entries(classes)) {
    if (key === 'ltr' && direction === 'ltr') {
      rtlClasses.push(value);
    } else if (key === 'rtl' && direction === 'rtl') {
      rtlClasses.push(value);
    } else if (key === 'common') {
      rtlClasses.push(value);
    }
  }
  
  return rtlClasses.join(' ');
}

/**
 * RTL-aware position utilities
 */
export const rtlPosition = {
  left: (value: string) => `left-${value} rtl:left-auto rtl:right-${value}`,
  right: (value: string) => `right-${value} rtl:right-auto rtl:left-${value}`,
  
  // Transform origin utilities
  'origin-left': 'origin-left rtl:origin-right',
  'origin-right': 'origin-right rtl:origin-left',
  
  // Float utilities
  'float-left': 'float-left rtl:float-right',
  'float-right': 'float-right rtl:float-left',
};

/**
 * Icon direction utilities for common UI patterns
 */
export const iconDirection = {
  // Arrow icons
  arrowLeft: 'rtl:rotate-180',
  arrowRight: 'rtl:rotate-180',
  
  // Chevron icons
  chevronLeft: 'rtl:rotate-180',
  chevronRight: 'rtl:rotate-180',
  
  // Navigation icons
  back: 'rtl:rotate-180',
  forward: 'rtl:rotate-180',
  next: 'rtl:rotate-180',
  previous: 'rtl:rotate-180',
};

/**
 * RTL-aware animation utilities
 */
export const rtlAnimation = {
  // Slide animations
  'slide-in-left': 'animate-slide-in-left rtl:animate-slide-in-right',
  'slide-in-right': 'animate-slide-in-right rtl:animate-slide-in-left',
  'slide-out-left': 'animate-slide-out-left rtl:animate-slide-out-right',
  'slide-out-right': 'animate-slide-out-right rtl:animate-slide-out-left',
};

/**
 * Typography utilities for RTL languages
 */
export const rtlTypography = {
  // Text direction
  direction: (locale: Locale) => ({ direction: getTextDirection(locale) }),
  
  // Font families that support RTL
  fontFamily: (locale: Locale) => {
    const rtlFonts = {
      // Add RTL-specific fonts when implementing RTL languages
      // 'ar': 'font-arabic',
      // 'he': 'font-hebrew',
      // 'fa': 'font-persian',
    };
    
    return rtlFonts[locale as keyof typeof rtlFonts] || 'font-sans';
  },
};

/**
 * Layout utilities for RTL support
 */
export const rtlLayout = {
  // Grid and flex container utilities
  container: (locale: Locale) => {
    const direction = getTextDirection(locale);
    return {
      direction,
      ...(direction === 'rtl' && { textAlign: 'right' as const })
    };
  },
  
  // Form layout utilities
  formField: 'flex flex-col rtl:text-right',
  inputGroup: 'flex rtl:flex-row-reverse',
  
  // Navigation layout
  navList: 'flex rtl:flex-row-reverse',
  breadcrumb: 'flex items-center rtl:flex-row-reverse',
};

/**
 * Utility function to get RTL-aware CSS properties
 */
export function getRTLStyles(locale: Locale): React.CSSProperties {
  const direction = getTextDirection(locale);
  
  return {
    direction,
    textAlign: direction === 'rtl' ? 'right' : 'left',
  };
}

/**
 * Helper function to reverse arrays for RTL layouts
 */
export function maybeReverse<T>(array: T[], locale: Locale): T[] {
  return isRTLLocale(locale) ? [...array].reverse() : array;
}

/**
 * Helper function to get the opposite direction
 */
export function getOppositeDirection(direction: 'ltr' | 'rtl'): 'ltr' | 'rtl' {
  return direction === 'ltr' ? 'rtl' : 'ltr';
}

/**
 * Helper function to convert logical properties
 */
export const logicalProperties = {
  marginInlineStart: (locale: Locale, value: string) => 
    isRTLLocale(locale) ? { marginRight: value } : { marginLeft: value },
  
  marginInlineEnd: (locale: Locale, value: string) => 
    isRTLLocale(locale) ? { marginLeft: value } : { marginRight: value },
  
  paddingInlineStart: (locale: Locale, value: string) => 
    isRTLLocale(locale) ? { paddingRight: value } : { paddingLeft: value },
  
  paddingInlineEnd: (locale: Locale, value: string) => 
    isRTLLocale(locale) ? { paddingLeft: value } : { paddingRight: value },
  
  borderInlineStart: (locale: Locale, value: string) => 
    isRTLLocale(locale) ? { borderRight: value } : { borderLeft: value },
  
  borderInlineEnd: (locale: Locale, value: string) => 
    isRTLLocale(locale) ? { borderLeft: value } : { borderRight: value },
};

/**
 * Date and time formatting utilities for RTL locales
 */
export const rtlDateTime = {
  // Get appropriate date formatting options
  getDateFormatOptions: (locale: Locale): Intl.DateTimeFormatOptions => ({
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(isRTLLocale(locale) && {
      // Add RTL-specific date formatting options if needed
    })
  }),
  
  // Get appropriate number formatting options
  getNumberFormatOptions: (locale: Locale): Intl.NumberFormatOptions => ({
    ...(isRTLLocale(locale) && {
      // Add RTL-specific number formatting options if needed
      numberingSystem: 'latn' // Use Western digits even in RTL languages
    })
  }),
};

/**
 * Accessibility utilities for RTL languages
 */
export const rtlA11y = {
  // ARIA attributes for RTL content
  getAriaAttributes: (locale: Locale) => ({
    'aria-orientation': isRTLLocale(locale) ? 'horizontal' : undefined,
    dir: getTextDirection(locale),
  }),
  
  // Screen reader utilities
  getScreenReaderText: (text: string, locale: Locale) => {
    // Add RTL-specific screen reader optimizations if needed
    return text;
  },
};

// Export all utilities as a single object for convenience
export const RTL = {
  isRTL: isRTLLocale,
  direction: getTextDirection,
  class: rtlClass,
  utils: rtlUtils,
  position: rtlPosition,
  icon: iconDirection,
  animation: rtlAnimation,
  typography: rtlTypography,
  layout: rtlLayout,
  styles: getRTLStyles,
  reverse: maybeReverse,
  logical: logicalProperties,
  dateTime: rtlDateTime,
  a11y: rtlA11y,
};

export default RTL;