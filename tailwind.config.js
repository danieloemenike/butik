/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
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
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        ink: {
          DEFAULT: "var(--landing-ink)",
          soft: "var(--landing-ink-soft)",
          muted: "var(--landing-ink-muted)",
        },
        surface: {
          DEFAULT: "var(--landing-surface)",
          raised: "var(--landing-surface-raised)",
          deep: "var(--landing-surface-deep)",
        },
        teal: {
          DEFAULT: "var(--landing-teal)",
          soft: "var(--landing-teal-soft)",
          deep: "var(--landing-teal-deep)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "landing-fade-up": {
          from: { opacity: 0, transform: "translateY(18px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "landing-fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        "landing-pan": {
          "0%": { transform: "scale(1.04) translate3d(0, 0, 0)" },
          "100%": { transform: "scale(1) translate3d(0, -1.5%, 0)" },
        },
        "logo-breathe": {
          "0%, 100%": { opacity: 0.18 },
          "50%": { opacity: 1 },
        },
        "dash-enter": {
          from: { opacity: 0, transform: "translate3d(24px, 18px, 0) scale(0.98)" },
          to: { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
        },
        "dash-fade-up": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "dash-bar": {
          from: { transform: "scaleY(0)" },
          to: { transform: "scaleY(1)" },
        },
        "dash-float": {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -6px, 0)" },
        },
        "dash-soft-pulse": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.72 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "landing-fade-up": "landing-fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) both",
        "landing-fade-in": "landing-fade-in 1s ease both",
        "landing-pan": "landing-pan 18s ease-out both",
        "logo-breathe": "logo-breathe 1.8s ease-in-out infinite",
        "dash-enter": "dash-enter 1s cubic-bezier(0.22, 1, 0.36, 1) both",
        "dash-fade-up": "dash-fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both",
        "dash-bar": "dash-bar 0.85s cubic-bezier(0.22, 1, 0.36, 1) both",
        "dash-float": "dash-float 7s ease-in-out infinite",
        "dash-soft-pulse": "dash-soft-pulse 2.8s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}