/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			fontFamily: {
				sans: ['Nunito', 'system-ui', 'sans-serif'],
				serif: ['Crimson Pro', 'Georgia', 'serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				// KingdomQuest Brand Colors - WCAG AA+ Compliant
				primary: {
					50: '#f0f4ff',
					100: '#e0e7ff', 
					200: '#c7d2fe',
					300: '#a5b4fc',
					400: '#818cf8',
					DEFAULT: '#1e3a5f', // Royal Navy Blue
					600: '#1a3454',
					700: '#152d49',
					800: '#122242',
					900: '#0f1d3a',
					950: '#0a132b',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					50: '#fffbeb',
					100: '#fef3c7',
					200: '#fde68a',
					300: '#fcd34d',
					400: '#fbbf24',
					DEFAULT: '#d4af37', // Gold
					600: '#b8971f',
					700: '#a68327',
					800: '#92400e',
					900: '#705a19',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				tertiary: {
					50: '#fafaf9',
					100: '#f5f5f4',
					200: '#e7e5e4',
					300: '#d6d3d1',
					400: '#c4bab0',
					DEFAULT: '#b8a082', // Sandstone Beige
					600: '#a0906f',
					700: '#94825f',
					800: '#7a6b4f',
					900: '#6b5f41',
				},
				accent: {
					50: '#ecfdf5',
					100: '#d1fae5',
					200: '#a7f3d0',
					300: '#6ee7b7',
					400: '#34d399',
					DEFAULT: '#10b981', // Emerald Green
					600: '#059669',
					700: '#047857',
					800: '#065f46',
					900: '#064e3b',
					foreground: 'hsl(var(--accent-foreground))',
				},
				// Semantic Colors
				success: {
					50: '#ecfdf5',
					100: '#d1fae5',
					DEFAULT: '#22c55e',
					700: '#15803d',
					900: '#14532d',
				},
				warning: {
					50: '#fff7ed',
					100: '#ffedd5',
					DEFAULT: '#f97316',
					700: '#c2410c',
					900: '#9a3412',
				},
				error: {
					50: '#fef2f2',
					100: '#fee2e2',
					DEFAULT: '#ef4444',
					700: '#dc2626',
					900: '#991b1b',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}