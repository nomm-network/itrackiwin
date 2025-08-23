import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '1.5rem',
				lg: '2rem',
				xl: '3rem',
				'2xl': '4rem',
			},
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			screens: {
				'xs': '360px',
				'sm-mobile': '375px',
				'md-mobile': '414px',
			},
			spacing: {
				'fluid-3xs': 'var(--fluid-space-3xs)',
				'fluid-2xs': 'var(--fluid-space-2xs)',
				'fluid-xs': 'var(--fluid-space-xs)',
				'fluid-s': 'var(--fluid-space-s)',
				'fluid-m': 'var(--fluid-space-m)',
				'fluid-l': 'var(--fluid-space-l)',
				'fluid-xl': 'var(--fluid-space-xl)',
				'fluid-2xl': 'var(--fluid-space-2xl)',
				'touch-target': 'var(--touch-target-min)',
				'touch-target-comfortable': 'var(--touch-target-comfortable)',
			},
			fontSize: {
				'fluid-sm': 'var(--fluid-text-sm)',
				'fluid-base': 'var(--fluid-text-base)',
				'fluid-lg': 'var(--fluid-text-lg)',
				'fluid-xl': 'var(--fluid-text-xl)',
				'fluid-2xl': 'var(--fluid-text-2xl)',
				'fluid-3xl': 'var(--fluid-text-3xl)',
				'fluid-4xl': 'var(--fluid-text-4xl)',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(10px)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'scale-out': {
					from: { transform: 'scale(1)', opacity: '1' },
					to: { transform: 'scale(0.95)', opacity: '0' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-out-right': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'breath': {
					'0%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.01)' },
					'100%': { transform: 'scale(1)' }
				},
				'heart-pulse': {
					'0%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.15)' },
					'100%': { transform: 'scale(1)' }
				},
				'swipe-reveal': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(-120px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'scale-out': 'scale-out 0.2s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-out-right': 'slide-out-right 0.3s ease-out',
				'enter': 'fade-in 0.3s ease-out, scale-in 0.2s ease-out',
				'exit': 'fade-out 0.3s ease-out, scale-out 0.2s ease-out',
				'breath': 'breath 4s ease-in-out infinite',
				'heart-pulse': 'heart-pulse 1.6s ease-in-out infinite',
				'swipe-reveal': 'swipe-reveal 0.3s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;