import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        heading: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'sketch-serif': ['Crimson Text', 'Georgia', 'Times New Roman', 'serif'],
      },
      colors: {
        // Legacy compatibility (keep existing shadcn/ui components working)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          600: "hsl(var(--color-accent-600))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // New Sketch-inspired color system
        sketch: {
          bg: "hsl(var(--color-bg))",
          surface: "hsl(var(--color-surface))",
          text: "hsl(var(--color-text))",
          'text-muted': "hsl(var(--color-text-muted))",
          border: "hsl(var(--color-border))",
          accent: {
            DEFAULT: "hsl(var(--color-accent))",
            600: "hsl(var(--color-accent-600))",
          },
          link: "hsl(var(--color-link))",
          success: "hsl(var(--color-success))",
          warning: "hsl(var(--color-warning))",
          danger: "hsl(var(--color-danger))",
        },
      },
      borderRadius: {
        // Legacy compatibility
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        '2xl': '1rem',
        '3xl': '1.5rem',
        // Sketch design system
        'sketch-sm': 'var(--radius-sm)',   // 8px - pills, inputs
        'sketch-md': 'var(--radius-md)',   // 12px - cards, screenshots  
        'sketch-lg': 'var(--radius-lg)',   // 16px - hero tiles
      },
      fontSize: {
        // Legacy typography
        'h1': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['2rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'h4': ['1.25rem', { lineHeight: '1.5', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
        // Sketch typography scale
        'sketch-hero': ['clamp(36px, 6vw, 64px)', { lineHeight: '1.15', fontWeight: '700', letterSpacing: '-0.01em' }],
        'sketch-h1': ['clamp(28px, 4.5vw, 48px)', { lineHeight: '1.15', fontWeight: '700', letterSpacing: '-0.01em' }],
        'sketch-h2': ['clamp(22px, 3.2vw, 32px)', { lineHeight: '1.25', fontWeight: '600', letterSpacing: '-0.01em' }],
        'sketch-h3': ['20px', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '-0.01em' }],
        'sketch-body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'sketch-small': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      spacing: {
        // Legacy spacing
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        // Sketch spacing scale
        'sketch-2': 'var(--space-2)',   // 8px
        'sketch-3': 'var(--space-3)',   // 12px
        'sketch-4': 'var(--space-4)',   // 16px
        'sketch-6': 'var(--space-6)',   // 24px
        'sketch-8': 'var(--space-8)',   // 32px
        'sketch-12': 'var(--space-12)', // 48px
        'sketch-16': 'var(--space-16)', // 64px
      },
      boxShadow: {
        // Legacy shadows
        'soft': '0 2px 8px 0 rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 4px 20px 0 rgba(0, 0, 0, 0.08)',
        'soft-xl': '0 8px 40px 0 rgba(0, 0, 0, 0.12)',
        // Sketch shadow system
        'sketch-soft': 'var(--shadow-soft)',  // 0 2px 12px rgba(0,0,0,0.06)
        'sketch-card': 'var(--shadow-card)',  // 0 8px 30px rgba(0,0,0,0.08)
      },
      maxWidth: {
        'sketch-content': 'var(--content-max)', // 1140px
      },
      letterSpacing: {
        'sketch-tight': '-0.01em',
        'sketch-normal': '0',
      },
      lineHeight: {
        'sketch-tight': '1.15',
        'sketch-normal': '1.5', 
        'sketch-loose': '1.7',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Sketch-style animations
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config