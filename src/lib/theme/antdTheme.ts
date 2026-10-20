import { theme as antTheme } from 'antd';
import type { ThemeConfig } from 'antd';
import type { colors as lightColors } from './colors';
import { typography } from './typography';
import { radius } from './layout';

const { headings } = typography;

/**
 * The one Ant Design theme. Built per colour mode by ThemeProvider — there is
 * deliberately no static light-only copy, so nothing can drift out of dark mode.
 */
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
    colorTextTertiary: colors.text.muted,
    colorTextDisabled: colors.text.disabled,
    colorLink: colors.brand.deep,
    colorLinkHover: colors.brand.primary,

    fontFamily: typography.fontFamily,
    fontFamilyCode: typography.monoFamily,
    fontSize: typography.body.md.fontSize,
    // Typography.Title reads these — same scale as <Heading>
    fontSizeHeading1: headings.h1.fontSize,
    fontSizeHeading2: headings.h2.fontSize,
    fontSizeHeading3: headings.h3.fontSize,
    fontSizeHeading4: headings.h4.fontSize,
    fontSizeHeading5: headings.h5.fontSize,
    lineHeightHeading1: headings.h1.lineHeight,
    lineHeightHeading2: headings.h2.lineHeight,
    lineHeightHeading3: headings.h3.lineHeight,
    lineHeightHeading4: headings.h4.lineHeight,
    lineHeightHeading5: headings.h5.lineHeight,
    fontWeightStrong: typography.fontWeights.semiBold,

    borderRadius: radius.md,
    borderRadiusLG: radius.lg,
    borderRadiusSM: radius.sm,
    colorBgLayout: colors.background.page,
    colorBgContainer: colors.background.surface,
    colorBgElevated: colors.background.surface,
    colorBorder: colors.border.strong,
    colorBorderSecondary: colors.border.subtle,
    // Popups (Select, Dropdown, Drawer) sit above the sticky navbar (z 1000)
    zIndexPopupBase: 1100,
  },
  components: {
    // antd draws Title (and <Text strong>) at fontWeightStrong — scoped here so
    // headings match typography.headings while buttons etc. keep semiBold
    Typography: { fontWeightStrong: headings.h1.fontWeight },
    Button: {
      borderRadius: radius.control,
      fontWeight: typography.fontWeights.semiBold,
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
    /*
      From the hub: without this, table header fill and row hover come from
      antd's derived greys, which read as off-palette next to linen. Pin the
      header to the row surface so it sits flush, keep its text full-strength,
      and inset the outer columns from the card edge.
    */
    Table: {
      headerBg: colors.background.surface,
      headerColor: colors.text.primary,
      headerSplitColor: colors.border.subtle,
      borderColor: colors.border.subtle,
      rowHoverBg: colors.background.muted,
      cellPaddingInline: 20,
    },
  },
});
