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
        serif: ["'Cinzel'", "'Trajan Pro'", "'Times New Roman'", "serif"],
        sans: ["'Source Sans 3'", "sans-serif"],
      },
      /* ── Typographic scale ────────────────────────────── */
      fontSize: {
        /* label / micro — monospace callouts, spec labels */
        "2xs":    ["0.625rem",  { lineHeight: "1rem" }],        /* 10px */
        /* caption — badges, metadata */
        xs:       ["0.75rem",   { lineHeight: "1rem" }],        /* 12px */
        /* body-sm — secondary text */
        sm:       ["0.875rem",  { lineHeight: "1.375rem" }],    /* 14px */
        /* body — default */
        base:     ["1rem",      { lineHeight: "1.625rem" }],    /* 16px */
        /* body-lg — intro paragraphs */
        lg:       ["1.125rem",  { lineHeight: "1.75rem" }],     /* 18px */
        /* heading-card */
        xl:       ["1.25rem",   { lineHeight: "1.75rem" }],     /* 20px */
        "2xl":    ["1.5rem",    { lineHeight: "2rem" }],        /* 24px */
        /* heading-editorial */
        "3xl":    ["1.875rem",  { lineHeight: "2.25rem" }],     /* 30px */
        /* heading-section */
        "4xl":    ["2.25rem",   { lineHeight: "2.5rem" }],      /* 36px */
        "5xl":    ["3rem",      { lineHeight: "1.15" }],        /* 48px */
        /* heading-display */
        "6xl":    ["3.75rem",   { lineHeight: "1.1" }],         /* 60px */
        "7xl":    ["4.5rem",    { lineHeight: "1.05" }],        /* 72px */
      },
      /* ── Spacing scale ────────────────────────────────── */
      spacing: {
        /* Micro gaps */
        "0.5":       "0.125rem",    /* 2px  */
        "1":         "0.25rem",     /* 4px  */
        "1.5":       "0.375rem",    /* 6px  */
        "2":         "0.5rem",      /* 8px  — base unit */
        "3":         "0.75rem",     /* 12px */
        "4":         "1rem",        /* 16px */
        "5":         "1.25rem",     /* 20px */
        "6":         "1.5rem",      /* 24px */
        "8":         "2rem",        /* 32px */
        "10":        "2.5rem",      /* 40px */
        "12":        "3rem",        /* 48px */
        "16":        "4rem",        /* 64px */
        "20":        "5rem",        /* 80px */
        "24":        "6rem",        /* 96px */
        "32":        "8rem",        /* 128px */
        "40":        "10rem",       /* 160px */
        "44":        "11rem",       /* 176px */
        /* Named section tokens — use in py-section-* */
        "section-sm": "2.5rem",     /* 40px  — compact sections */
        "section":    "4rem",       /* 64px  — default section gap */
        "section-md": "6rem",       /* 96px  — standard sections */
        "section-lg": "8rem",       /* 128px — hero-adjacent */
        "section-xl": "11rem",      /* 176px — dramatic breathing room */
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
        gold: {
          DEFAULT: "hsl(var(--gold))",
          light: "hsl(var(--gold-light))",
          dark: "hsl(var(--gold-dark))",
        },
        navy: {
          DEFAULT: "hsl(var(--navy))",
          light: "hsl(var(--navy-light))",
        },
        ivory: "hsl(var(--ivory))",
        cream: "hsl(var(--cream))",
        hero: {
          text: "hsl(var(--hero-text))",
          "text-muted": "hsl(var(--hero-text-muted))",
          glass: "hsl(var(--hero-glass-bg))",
          "glass-border": "hsl(var(--hero-glass-border))",
          "glass-active": "hsl(var(--hero-glass-bg-active))",
          "input-bg": "hsl(var(--hero-input-bg))",
          "input-border": "hsl(var(--hero-input-border))",
          "input-placeholder": "hsl(var(--hero-input-placeholder))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "ken-burns": {
          "0%": { transform: "scale(1) translate(0, 0)" },
          "50%": { transform: "scale(1.08) translate(-1%, -1%)" },
          "100%": { transform: "scale(1.15) translate(-2%, 0)" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.02)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "scale-in": "scale-in 0.4s ease-out forwards",
        "ken-burns": "ken-burns 25s ease-in-out infinite alternate",
        "pulse-subtle": "pulse-subtle 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
