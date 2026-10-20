/**
 * Type scale — the single source of truth.
 *
 * Feeds Ant Design (buildAntdTheme maps headings → fontSizeHeading1..5) and the
 * CSS custom properties (cssVariables.ts). Don't redefine sizes in CSS or set
 * font families inline — use these tokens, <Heading>/<Text>, or the `.mono` class.
 */
export const typography = {
  // One family for everything — Inter, loaded in index.html (300–700), as in the hub
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  // Prices, measurements, IDs, stats — tabular figures
  monoFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',

  // Only weights index.html actually loads — nothing above 700
  fontWeights: {
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  },
  lineHeights: {
    none: 1,
    tight: 1.1,
    snug: 1.3,
    normal: 1.5,
    relaxed: 1.65,
  },
  letterSpacings: {
    tight: '-0.01em',
    normal: '0',
    wide: '0.08em',
    eyebrow: '0.14em',
    wordmark: '0.18em',
  },

  // h1–h5 share one weight so antd's Typography.Title (single titleFontWeight)
  // and <Heading> always agree.
  headings: {
    h1: { fontSize: 40, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' },
    h2: { fontSize: 30, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.01em' },
    h3: { fontSize: 24, fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.01em' },
    h4: { fontSize: 20, fontWeight: 700, lineHeight: 1.35 },
    h5: { fontSize: 16, fontWeight: 700, lineHeight: 1.4 },
    h6: { fontSize: 14, fontWeight: 600, lineHeight: 1.4 },
  },
  // Hero / marketing headlines — fluid
  display: {
    lg: { fontSize: 'clamp(2.4rem, 4.6vw, 4rem)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.025em' },
    md: { fontSize: 'clamp(1.9rem, 3.4vw, 2.75rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' },
  },
  body: {
    lg: { fontSize: 17, fontWeight: 400, lineHeight: 1.65 },
    md: { fontSize: 14, fontWeight: 400, lineHeight: 1.55 },
    sm: { fontSize: 13, fontWeight: 400, lineHeight: 1.5 },
    xs: { fontSize: 12, fontWeight: 400, lineHeight: 1.4 },
  },
  // Small uppercase section label above headings
  eyebrow: { fontSize: 11.5, fontWeight: 600, letterSpacing: '0.14em' },
} as const;

export type Typography = typeof typography;
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
