/** @type {import('tailwindcss').Config} */
/* eslint-env node */
/* global module, require */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
    theme: {
        extend: {
            fontFamily: {
                'sans': ['Roboto', 'Google Sans', 'system-ui', 'sans-serif'],
                'roboto': ['Roboto', 'sans-serif'],
                'google-sans': ['Google Sans', 'sans-serif'],
            },
            fontSize: {
                'display-large': ['3.5rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
                'display-medium': ['2.8125rem', { lineHeight: '1.2', letterSpacing: '0' }],
                'display-small': ['2.25rem', { lineHeight: '1.2', letterSpacing: '0' }],
                'headline-large': ['2rem', { lineHeight: '1.25', letterSpacing: '0' }],
                'headline-medium': ['1.75rem', { lineHeight: '1.25', letterSpacing: '0' }],
                'headline-small': ['1.5rem', { lineHeight: '1.25', letterSpacing: '0' }],
                'title-large': ['1.375rem', { lineHeight: '1.25', letterSpacing: '0' }],
                'title-medium': ['1rem', { lineHeight: '1.5', letterSpacing: '0.009375em' }],
                'title-small': ['0.875rem', { lineHeight: '1.43', letterSpacing: '0.00625em' }],
                'label-large': ['0.875rem', { lineHeight: '1.43', letterSpacing: '0.00625em' }],
                'label-medium': ['0.75rem', { lineHeight: '1.33', letterSpacing: '0.03125em' }],
                'label-small': ['0.6875rem', { lineHeight: '1.45', letterSpacing: '0.03125em' }],
                'body-large': ['1rem', { lineHeight: '1.5', letterSpacing: '0.009375em' }],
                'body-medium': ['0.875rem', { lineHeight: '1.43', letterSpacing: '0.015625em' }],
                'body-small': ['0.75rem', { lineHeight: '1.33', letterSpacing: '0.025em' }],
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                    container: 'hsl(var(--primary-container))',
                    'on-container': 'hsl(var(--on-primary-container))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                    container: 'hsl(var(--secondary-container))',
                    'on-container': 'hsl(var(--on-secondary-container))'
                },
                tertiary: {
                    DEFAULT: 'hsl(var(--tertiary))',
                    foreground: 'hsl(var(--tertiary-foreground))',
                    container: 'hsl(var(--tertiary-container))',
                    'on-container': 'hsl(var(--on-tertiary-container))'
                },
                surface: {
                    DEFAULT: 'hsl(var(--surface))',
                    foreground: 'hsl(var(--surface-foreground))',
                    variant: 'hsl(var(--surface-variant))',
                    'on-variant': 'hsl(var(--on-surface-variant))'
                },
                error: {
                    DEFAULT: 'hsl(var(--error))',
                    foreground: 'hsl(var(--error-foreground))',
                    container: 'hsl(var(--error-container))',
                    'on-container': 'hsl(var(--on-error-container))'
                },
                outline: {
                    DEFAULT: 'hsl(var(--outline))',
                    variant: 'hsl(var(--outline-variant))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))'
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
                },
                // Google-style Calm Color Palette
                calm: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                    950: '#082f49'
                },
                'calm-gray': {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#020617'
                },
                'calm-teal': {
                    50: '#f0fdfa',
                    100: '#ccfbf1',
                    200: '#99f6e4',
                    300: '#5eead4',
                    400: '#2dd4bf',
                    500: '#14b8a6',
                    600: '#0d9488',
                    700: '#0f766e',
                    800: '#115e59',
                    900: '#134e4a',
                    950: '#042f2e'
                }
            },
            keyframes: {
                'accordion-down': {
                    from: {
                        height: '0'
                    },
                    to: {
                        height: 'var(--radix-accordion-content-height)'
                    }
                },
                'accordion-up': {
                    from: {
                        height: 'var(--radix-accordion-content-height)'
                    },
                    to: {
                        height: '0'
                    }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out'
            },
            backgroundImage: {
                'gradient-calm-blue': 'linear-gradient(135deg, hsl(210 100% 95%) 0%, hsl(210 40% 98%) 100%)',
                'gradient-calm-primary': 'linear-gradient(135deg, hsl(210 100% 50%) 0%, hsl(210 100% 60%) 100%)',
                'gradient-calm-surface': 'linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(210 20% 98%) 100%)',
                'gradient-calm-card': 'linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(210 20% 99%) 100%)',
                'gradient-calm-radial': 'radial-gradient(circle at center, hsl(210 100% 95%) 0%, hsl(210 40% 98%) 100%)'
            },
            boxShadow: {
                'calm-sm': '0 1px 2px 0 hsl(210 20% 0% / 0.05)',
                'calm': '0 1px 3px 0 hsl(210 20% 0% / 0.1), 0 1px 2px -1px hsl(210 20% 0% / 0.1)',
                'calm-md': '0 4px 6px -1px hsl(210 20% 0% / 0.1), 0 2px 4px -2px hsl(210 20% 0% / 0.1)',
                'calm-lg': '0 10px 15px -3px hsl(210 20% 0% / 0.1), 0 4px 6px -4px hsl(210 20% 0% / 0.1)',
                'calm-xl': '0 20px 25px -5px hsl(210 20% 0% / 0.1), 0 8px 10px -6px hsl(210 20% 0% / 0.1)'
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
}