/** @type {import('tailwindcss').Config} */

// KingdomQuest Design System - Tailwind CSS Configuration
// Implements complete design token system with WCAG AA+ accessibility compliance
// Optimized for multigenerational Christian family app

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px', 
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    colors: {
      // Brand Colors with Christian Symbolic Meaning
      primary: {
        50: '#f0f4ff',
        100: '#e0e7ff',
        200: '#c7d2fe', 
        300: '#a5b4fc',
        400: '#818cf8',
        500: '#1e3a5f', // Royal Navy Blue - Divine Authority
        600: '#1a3356',
        700: '#162b4c',
        800: '#122242', 
        900: '#0e1a38',
        950: '#0a132b',
        DEFAULT: '#1e3a5f'
      },
      secondary: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fed7aa',
        300: '#fdba74',
        400: '#fb923c',
        500: '#d4af37', // Gold - Divine Glory & Majesty
        600: '#c19b2f',
        700: '#a68327',
        800: '#8b6f20',
        900: '#705a19', 
        950: '#5a4614',
        DEFAULT: '#d4af37'
      },
      tertiary: {
        50: '#fafaf9',
        100: '#f5f5f4',
        200: '#e7e5e4',
        300: '#d6d3d1',
        400: '#a8a29e',
        500: '#b8a082', // Sandstone Beige - Peace & Humility
        600: '#a8926f',
        700: '#94825f',
        800: '#7f714f',
        900: '#6b5f41',
        950: '#544c37',
        DEFAULT: '#b8a082'
      },
      accent: {
        50: '#ecfdf5',
        100: '#d1fae5', 
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#34d399',
        500: '#10b981', // Emerald Green - Resurrection & Renewal
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
        950: '#022c22',
        DEFAULT: '#10b981'
      },

      // Semantic Colors for UI States
      success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0', 
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
        DEFAULT: '#22c55e'
      },
      warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fed7aa',
        300: '#fdba74',
        400: '#fb923c',
        500: '#f97316',
        600: '#ea580c',
        700: '#c2410c',
        800: '#9a3412',
        900: '#7c2d12',
        DEFAULT: '#f97316'
      },
      error: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171', 
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
        DEFAULT: '#ef4444'
      },
      info: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        DEFAULT: '#3b82f6'
      },

      // Neutral Grays
      gray: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#e5e5e5',
        300: '#d4d4d4',
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
        950: '#0a0a0a',
        DEFAULT: '#737373'
      },

      // Special Colors
      white: '#ffffff',
      black: '#000000',
      transparent: 'transparent',
      current: 'currentColor',
    },
    spacing: {
      px: '1px',
      0: '0',
      0.5: '0.125rem',
      1: '0.25rem',
      1.5: '0.375rem', 
      2: '0.5rem',
      2.5: '0.625rem',
      3: '0.75rem',
      3.5: '0.875rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      7: '1.75rem',
      8: '2rem',
      9: '2.25rem',
      10: '2.5rem',
      11: '2.75rem',
      12: '3rem',
      14: '3.5rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
      28: '7rem',
      32: '8rem',
      36: '9rem',
      40: '10rem',
      44: '11rem',
      48: '12rem',
      52: '13rem',
      56: '14rem',
      60: '15rem',
      64: '16rem',
      72: '18rem',
      80: '20rem',
      96: '24rem',
      
      // Accessibility-specific spacing
      'touch-sm': '2.75rem', // 44px minimum touch target
      'touch-md': '3rem',     // 48px recommended touch target
      'touch-lg': '4.6875rem' // 75px children touch target
    },
    fontSize: {
      // Base font sizes with line heights optimized for readability
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],        // 16px minimum for accessibility
      lg: ['1.125rem', { lineHeight: '1.75rem' }],     // 18px recommended for seniors
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1.1' }],
      '6xl': ['3.75rem', { lineHeight: '1.1' }],
      '7xl': ['4.5rem', { lineHeight: '1.1' }],
      '8xl': ['6rem', { lineHeight: '1.1' }],
      '9xl': ['8rem', { lineHeight: '1.1' }],
    },
    fontFamily: {
      // Typography system optimized for Christian content
      serif: ['Crimson Pro', 'Merriweather', 'Georgia', 'serif'],     // Authority & tradition
      sans: ['Nunito', 'Quicksand', 'Inter', 'system-ui', 'sans-serif'], // Modern & accessible
      mono: ['Fira Code', 'Consolas', 'Courier New', 'monospace'],
      
      // Semantic font assignments
      heading: ['Crimson Pro', 'Merriweather', 'Georgia', 'serif'],
      body: ['Nunito', 'Quicksand', 'Inter', 'system-ui', 'sans-serif'],
      scripture: ['Crimson Pro', 'Merriweather', 'Georgia', 'serif']
    },
    fontWeight: {
      thin: '100',
      extralight: '200', 
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900'
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      DEFAULT: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      full: '9999px'
    },
    boxShadow: {
      xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
      none: 'none',
      
      // Elevation system for layered interfaces
      elevation1: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
      elevation2: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
      elevation3: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)'
    },
    extend: {
      // Custom design system extensions
      
      // Accessibility-focused utilities
      width: {
        'touch-sm': '2.75rem',  // 44px 
        'touch-md': '3rem',     // 48px
        'touch-lg': '4.6875rem' // 75px
      },
      height: {
        'touch-sm': '2.75rem',  // 44px
        'touch-md': '3rem',     // 48px  
        'touch-lg': '4.6875rem' // 75px
      },
      minWidth: {
        'touch-sm': '2.75rem',
        'touch-md': '3rem',
        'touch-lg': '4.6875rem'
      },
      minHeight: {
        'touch-sm': '2.75rem',
        'touch-md': '3rem', 
        'touch-lg': '4.6875rem'
      },
      
      // Animation system with reduced motion support
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'fade-out': 'fadeOut 0.25s ease-in',
        'slide-up': 'slideUp 0.25s ease-out',
        'slide-down': 'slideDown 0.25s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
        'pulse-gentle': 'pulseGentle 2s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        }
      },
      
      // Custom letter spacing for readability
      letterSpacing: {
        tightest: '-0.075em',
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em'
      },
      
      // Line height optimized for different age groups
      lineHeight: {
        3: '.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        7: '1.75rem',
        8: '2rem',
        9: '2.25rem',
        10: '2.5rem',
        'extra-loose': '2.5'
      },
      
      // Z-index scale for layered interfaces
      zIndex: {
        1: '1',
        2: '2',
        3: '3',
        4: '4',
        5: '5',
        10: '10',
        20: '20',
        30: '30',
        40: '40',
        50: '50',
        auto: 'auto'
      }
    }
  },
  plugins: [
    // Accessibility-focused focus ring utilities
    function({ addUtilities, theme }) {
      const focusUtilities = {
        '.focus-ring': {
          '&:focus-visible': {
            outline: `2px solid ${theme('colors.primary.500')}`,
            outlineOffset: '2px',
            borderRadius: theme('borderRadius.md')
          }
        },
        '.focus-ring-inset': {
          '&:focus-visible': {
            outline: `2px solid ${theme('colors.primary.500')}`,
            outlineOffset: '-2px',
            borderRadius: theme('borderRadius.md')
          }
        },
        '.focus-ring-white': {
          '&:focus-visible': {
            outline: `2px solid ${theme('colors.white')}`,
            outlineOffset: '2px',
            borderRadius: theme('borderRadius.md')
          }
        }
      };
      
      addUtilities(focusUtilities);
    },
    
    // High contrast mode utilities
    function({ addUtilities }) {
      const highContrastUtilities = {
        '.high-contrast': {
          filter: 'contrast(1.5)'
        },
        '.high-contrast-text': {
          color: '#000000',
          backgroundColor: '#ffffff'
        },
        '.high-contrast-text-inverse': {
          color: '#ffffff', 
          backgroundColor: '#000000'
        }
      };
      
      addUtilities(highContrastUtilities);
    },
    
    // Reduced motion utilities
    function({ addUtilities }) {
      const reducedMotionUtilities = {
        '@media (prefers-reduced-motion: reduce)': {
          '.animate-fade-in, .animate-fade-out, .animate-slide-up, .animate-slide-down, .animate-scale-in': {
            animation: 'none !important'
          },
          '*': {
            'animation-duration': '0.01ms !important',
            'animation-iteration-count': '1 !important',
            'transition-duration': '0.01ms !important',
            'scroll-behavior': 'auto !important'
          }
        }
      };
      
      addUtilities(reducedMotionUtilities);
    },
    
    // Touch target size utilities
    function({ addUtilities, theme }) {
      const touchUtilities = {
        '.touch-target-sm': {
          minWidth: theme('spacing.touch-sm'),
          minHeight: theme('spacing.touch-sm')
        },
        '.touch-target-md': {
          minWidth: theme('spacing.touch-md'),
          minHeight: theme('spacing.touch-md')
        },
        '.touch-target-lg': {
          minWidth: theme('spacing.touch-lg'),
          minHeight: theme('spacing.touch-lg')
        }
      };
      
      addUtilities(touchUtilities);
    }
  ]
};
