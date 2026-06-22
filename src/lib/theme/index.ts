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
    fontFamily: typography.fontFamily,
    borderRadius: radius.md,
    colorBgLayout: colors.background.page,
    colorBgContainer: colors.background.surface,
    colorBorder: colors.border.strong,
    colorBorderSecondary: colors.border.subtle,
  },
  components: {
    Button: { borderRadius: radius.pill },
    Card: { borderRadiusLG: radius.lg },
    Input: {
      borderRadius: radius.pill,
      colorBgContainer: colors.background.muted,
      colorBorder: 'transparent',
      activeBorderColor: colors.brand.primary,
      hoverBorderColor: colors.brand.accent,
    },
    Select: {
      borderRadius: radius.md,
      colorBgContainer: colors.background.muted,
    },
    Tabs: {
      inkBarColor: colors.brand.primary,
      itemSelectedColor: colors.brand.primary,
    },
    Steps: { colorPrimary: colors.brand.primary },
    Menu: {
      darkItemSelectedBg: colors.brand.primary,
      darkItemSelectedColor: '#ffffff',
    },
  },
});

// Legacy static export kept for any non-component usage
export const antdTheme = buildAntdTheme(lightColors, false);
