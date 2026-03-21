import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
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
        serif: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs":    ["0.625rem",  { lineHeight: "1rem" }],
        xs:       ["0.75rem",   { lineHeight: "1rem" }],
        sm:       ["0.875rem",  { lineHeight: "1.375rem" }],
        base:     ["1rem",      { lineHeight: "1.625rem" }],
        lg:       ["1.125rem",  { lineHeight: "1.75rem" }],
        xl:       ["1.25rem",   { lineHeight: "1.75rem" }],
        "2xl":    ["1.5rem",    { lineHeight: "2rem" }],
        "3xl":    ["1.875rem",  { lineHeight: "2.25rem" }],
        "4xl":    ["2.25rem",   { lineHeight: "2.5rem" }],
        "5xl":    ["3rem",      { lineHeight: "1.15" }],
        "6xl":    ["3.75rem",   { lineHeight: "1.1" }],
        "7xl":    ["4.5rem",    { lineHeight: "1.05" }],
      },
      spacing: {
        "0.5":       "0.125rem",
        "1":         "0.25rem",
        "1.5":       "0.375rem",
        "2":         "0.5rem",
        "3":         "0.75rem",
        "4":         "1rem",
        "5":         "1.25rem",
        "6":         "1.5rem",
        "8":         "2rem",
        "10":        "2.5rem",
        "12":        "3rem",
        "16":        "4rem",
        "20":        "5rem",
        "24":        "6rem",
        "32":        "8rem",
        "40":        "10rem",
        "44":        "11rem",
        "section-sm": "3rem",
        "section":    "5rem",
        "section-md": "7.5rem",
        "section-lg": "10rem",
        "section-xl": "14rem",
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
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        /* Brand tokens */
        bronze: {
          DEFAULT: "hsl(var(--accent))",
          light: "hsl(var(--accent-light))",
        },
        carbon: "hsl(var(--primary))",
        graphite: "hsl(var(--secondary))",
        stone: "hsl(var(--muted))",
        hero: {
          text: "hsl(var(--hero-text))",
          "text-muted": "hsl(var(--hero-text-muted))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 1px)",
        sm: "calc(var(--radius) - 2px)",
      },
      height: {
        "13": "3.25rem",
        "18": "4.5rem",
        "22": "5.5rem",
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
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "ken-burns": {
          "0%": { transform: "scale(1) translate(0, 0)" },
          "50%": { transform: "scale(1.04) translate(-0.3%, -0.3%)" },
          "100%": { transform: "scale(1.08) translate(-0.6%, 0)" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.92" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-in-up": "fade-in-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "scale-in": "scale-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "ken-burns": "ken-burns 40s ease-in-out infinite alternate",
        "pulse-subtle": "pulse-subtle 6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
