import type { colors as lightColors } from './colors';
import { typography } from './typography';
import { radius, shadows } from './layout';

type Colors = typeof lightColors;

const rgba = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

/**
 * Publishes the active theme as CSS custom properties on <html>, so plain CSS
 * (index.css) reads the same values as Ant Design — no colour or font values
 * are duplicated in stylesheets. Called by ThemeProvider on every mode change.
 */
export const setCSSCustomProperties = (colors: Colors, isDark: boolean) => {
  const root = document.documentElement;
  const set = (name: string, value: string) => root.style.setProperty(name, value);

  // Full token set: --color-<group>-<key>
  (Object.keys(colors) as (keyof Colors)[]).forEach(group => {
    Object.entries(colors[group]).forEach(([key, value]) => set(`--color-${group}-${key}`, value));
  });

  // Short aliases used by index.css
  set('--ink', colors.text.primary);
  set('--ink-soft', colors.text.secondary);
  set('--ink-faint', colors.text.muted);
  set('--brass', colors.brand.primary);
  set('--brass-deep', colors.brand.deep);
  set('--brass-soft', rgba(colors.brand.primary, isDark ? 0.2 : 0.14));
  set('--caramel', colors.brand.accent);
  set('--caramel-soft', rgba(colors.brand.accent, isDark ? 0.18 : 0.16));
  set('--linen', colors.background.page);
  set('--surface', colors.background.surface);
  set('--line', colors.border.strong);
  set('--line-soft', colors.border.subtle);
  set('--glow', rgba(colors.brand.peach, isDark ? 0.28 : 0.5));

  set('--shadow-sm', isDark ? '0 1px 2px rgba(0, 0, 0, 0.4)' : shadows.sm);
  set('--shadow-md', isDark ? '0 10px 30px rgba(0, 0, 0, 0.35)' : shadows.md);
  set('--radius-sm', `${radius.sm}px`);
  set('--radius-md', `${radius.md}px`);

  // Typography
  set('--font-body', typography.fontFamily);
  set('--font-mono', typography.monoFamily);
  set('--eyebrow-size', `${typography.eyebrow.fontSize}px`);
  set('--eyebrow-tracking', typography.eyebrow.letterSpacing);
};
