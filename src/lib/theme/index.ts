import { theme as antTheme } from 'antd';
import type { ThemeConfig } from 'antd';
import { colors as lightColors } from './colors';
import { typography } from './typography';
import { radius } from './layout';

export { colors } from './colors';
export { typography } from './typography';
export { spacing, radius, shadows } from './layout';
export { breakpoints, mediaQueries } from './breakpoints';
export { useColors, useTheme, ThemeProvider } from './ThemeContext';

// '#CE6A3E', 0.14 → '#CE6A3E24' — palette hexes are always 6-digit
export const withAlpha = (hex: string, alpha: number) =>
  hex + Math.round(alpha * 255).toString(16).padStart(2, '0');

export const buildAntdTheme = (
  colors: typeof lightColors,
  isDark: boolean,
): ThemeConfig => ({
  algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
  token: {
    colorPrimary: colors.brand.primary,
    colorSuccess: colors.semantic.success,
    colorWarning: colors.semantic.warning,
    colorError: colors.semantic.error,
    colorInfo: colors.semantic.info,
    colorText: colors.text.primary,
    colorTextSecondary: colors.text.secondary,
    colorLink: colors.brand.deep,
    fontFamily: typography.fontFamily,
    fontFamilyCode: typography.monoFamily,
    borderRadius: radius.md,
    borderRadiusLG: radius.lg,
    borderRadiusSM: radius.sm,
    colorBgLayout: colors.background.page,
    colorBgContainer: colors.background.surface,
    colorBgElevated: colors.background.surface,
    colorBorder: colors.border.strong,
    colorBorderSecondary: colors.border.subtle,
  },
  components: {
    Button: {
      borderRadius: radius.control,
      fontWeight: 600,
      primaryShadow: 'none',
      defaultShadow: 'none',
    },
    Card: { borderRadiusLG: radius.lg },
    Input: {
      borderRadius: radius.control,
      colorBgContainer: colors.background.muted,
      activeBorderColor: colors.brand.primary,
      hoverBorderColor: colors.brand.accent,
    },
    InputNumber: {
      borderRadius: radius.control,
      colorBgContainer: colors.background.muted,
    },
    Select: {
      borderRadius: radius.control,
      colorBgContainer: colors.background.muted,
    },
    Tag: { borderRadiusSM: radius.sm },
    Tabs: {
      inkBarColor: colors.brand.primary,
      itemSelectedColor: colors.brand.primary,
    },
    Steps: { colorPrimary: colors.brand.primary },
    Menu: {
      darkItemBg: 'transparent',
      darkItemSelectedBg: colors.brand.primary,
      darkItemSelectedColor: '#ffffff',
    },
    Layout: { siderBg: colors.brand.dark },
  },
});

// Legacy static export kept for any non-component usage
export const antdTheme = buildAntdTheme(lightColors, false);
