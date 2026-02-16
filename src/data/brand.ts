/**
 * Peninsula Equine — Brand Guidelines (Code-Level Constants)
 *
 * This file is the single source of truth for brand rules.
 * Import from here in any component that renders the logo, brand name,
 * or brand colors — never hard-code brand values inline.
 */

/* ─── Logo Usage Rules ──────────────────────────────────── */

export const logoRules = {
  /** Always use the provided PNG assets — never recreate or approximate. */
  assets: {
    monogram: {
      file: "logo-pe-mark.png",
      description: "Rope-circle mark with serif P.E initials",
      use: "Favicons, avatars, compact placements, header nav, mobile header",
    },
    wordmark: {
      file: "logo-pe.png",
      description: "Full logo lockup with wordmark",
      use: "Hero sections, loading splash, print materials, large format",
    },
    banner: {
      file: "pe-banner.png",
      description: "Wide banner with 'From Dirt to Dynasty' tagline",
      use: "Email headers, social media covers, event banners",
    },
  },

  /** Minimum clear space around the logo = height of the 'P' initial. */
  clearSpace: "1× the height of the 'P' initial on all sides",

  /** Never stretch, rotate, distort, add shadows/glows, or recolor. */
  prohibitions: [
    "Never stretch or distort the logo",
    "Never rotate the logo",
    "Never add drop shadows or outer glows",
    "Never recolor the logo outside approved palette",
    "Never place on busy or low-contrast backgrounds",
    "Never recreate the logo in a 'similar' font",
  ],

  /** Minimum rendered sizes */
  minSize: {
    monogram: { mobile: 32, desktop: 40, unit: "px" },
    wordmark: { mobile: 96, desktop: 128, unit: "px" },
  },
} as const;

/* ─── Color Tokens ──────────────────────────────────────── */

export const brandColors = {
  /** Primary gold accent — use for CTAs, highlights, interactive elements */
  gold: {
    token: "--accent",
    hsl: "42 76% 65%",
    hex: "#E8C067",
    usage: "CTAs, active states, links, decorative dividers, icon accents",
    contrast: "5.8:1 on navy — WCAG AA for all text sizes",
  },
  goldLight: {
    token: "--gold-light",
    hsl: "44 70% 78%",
    hex: "#E8D8A8",
    usage: "Hover states on gold, subtle card highlights",
  },
  goldDark: {
    token: "--gold-dark",
    hsl: "40 80% 50%",
    hex: "#E6A817",
    usage: "Gold text on light backgrounds (passes AA contrast)",
  },
  navy: {
    token: "--primary",
    hsl: "228 16% 11%",
    hex: "#171A23",
    usage: "Primary backgrounds, header/footer, hero overlays",
  },
  navyLight: {
    token: "--navy-light / --secondary",
    hsl: "221 20% 21%",
    hex: "#2B3242",
    usage: "Card backgrounds on dark sections, secondary surfaces",
  },
  ivory: {
    token: "--background / --ivory",
    hsl: "42 45% 93%",
    hex: "#F0ECDF",
    usage: "Page background, light section backgrounds",
  },
  cream: {
    token: "--card / --cream",
    hsl: "42 40% 95%",
    hex: "#F5F0E8",
    usage: "Card surfaces, elevated containers",
  },
} as const;

/* ─── Typography Rules ──────────────────────────────────── */

export const typographyRules = {
  /**
   * Serif (Cinzel) — Headings, section titles, editorial emphasis.
   * NEVER use for the brand name "Peninsula Equine" as a logo substitute.
   * The brand name in text form must use font-sans to avoid fake-serif mimicry.
   */
  serif: {
    family: "Cinzel",
    fallbacks: "'Trajan Pro', 'Times New Roman', serif",
    tailwindClass: "font-serif",
    use: [
      "H1–H4 section headings",
      "Card titles",
      "Blockquote text",
      "Phase/step numbers",
      "Testimonial author names",
    ],
    doNot: [
      "Never use for the brand name 'Peninsula Equine' — use font-sans or the logo image",
      "Never use for body paragraphs",
      "Never use for UI labels, buttons, or form fields",
    ],
  },

  /**
   * Sans (Source Sans 3) — Body text, UI elements, brand name text labels.
   * Used everywhere the serif is NOT appropriate.
   */
  sans: {
    family: "Source Sans 3",
    fallbacks: "sans-serif",
    tailwindClass: "font-sans",
    use: [
      "Body paragraphs",
      "Button labels",
      "Form inputs and labels",
      "Navigation links",
      "Brand name text (when rendered as text, not logo image)",
      "Metadata, captions, tags",
    ],
  },

  /**
   * Brand name rule: when "Peninsula Equine" appears as text (header nav,
   * footer, hero subtitle), it must use font-sans with tracking-[0.2em]
   * uppercase — never font-serif, to avoid mimicking the logo.
   */
  brandNameClass: "font-sans font-semibold tracking-[0.2em] uppercase",
} as const;

/* ─── Spacing Scale ─────────────────────────────────────── */

export const spacingScale = {
  "section-sm": "2.5rem",   // 40px — compact sections
  "section":    "4rem",     // 64px — default section padding
  "section-md": "6rem",     // 96px — generous sections
  "section-lg": "8rem",     // 128px — hero/feature sections
  "section-xl": "11rem",    // 176px — full-bleed hero spacing
} as const;

/* ─── Usage Summary ─────────────────────────────────────── */

export const usageRules = {
  do: [
    "Use the rope-mark monogram on dark backgrounds with adequate contrast",
    "Maintain minimum clear space equal to the height of the 'P' initial",
    "Use the gold accent (--accent) for interactive highlights and CTAs",
    "Pair Cinzel headings with Source Sans 3 body text",
    "Use font-sans for any text rendering of 'Peninsula Equine'",
    "Keep imagery warm-toned and editorially composed",
    "Use monogram in header nav; wordmark in hero and loading splash",
  ],
  dont: [
    "Stretch, rotate, or distort the logo in any way",
    "Place the logo on busy or low-contrast backgrounds",
    "Use font-serif (Cinzel) for the brand name — it mimics the logo",
    "Use more than two typeface families in a single layout",
    "Replace gold accents with arbitrary bright colors",
    "Apply drop shadows or outer glows to the logo mark",
    "Use the wordmark at sizes below 96px wide",
  ],
} as const;
