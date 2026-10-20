export { colors } from './colors';
export { darkColors } from './colors.dark';
export { typography } from './typography';
export type { HeadingLevel } from './typography';
export { iconSize } from './icons';
export type { IconSize } from './icons';
export { spacing, radius, shadows } from './layout';
export { breakpoints, mediaQueries } from './breakpoints';
export { buildAntdTheme } from './antdTheme';
export { useColors, useTheme } from './ThemeContext';
export type { ColorMode, ResolvedMode } from './ThemeContext';
export { ThemeProvider } from './ThemeProvider';

// '#CE6A3E', 0.14 → '#CE6A3E24' — palette hexes are always 6-digit
export const withAlpha = (hex: string, alpha: number) =>
  hex + Math.round(alpha * 255).toString(16).padStart(2, '0');
