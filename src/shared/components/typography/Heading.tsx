import { Typography } from 'antd';
import type { TitleProps } from 'antd/es/typography/Title';
import { typography, useColors } from '../../../lib/theme';

export type HeadingTone = 'default' | 'onDark';

export interface HeadingProps extends Omit<TitleProps, 'level'> {
  level?: 1 | 2 | 3 | 4 | 5;
  /** Fluid hero sizes from typography.display — overrides the level's size. */
  display?: keyof typeof typography.display;
  tone?: HeadingTone;
}

/**
 * antd Title on the theme scale. Sizes come from the antd heading tokens
 * (buildAntdTheme); h1–h4 get the display serif via index.css.
 */
export const Heading = ({ level = 2, display, tone = 'default', style, ...rest }: HeadingProps) => {
  const colors = useColors();
  const d = display ? typography.display[display] : undefined;
  return (
    <Typography.Title
      level={level}
      style={{
        ...(d && { fontSize: d.fontSize, lineHeight: d.lineHeight, letterSpacing: d.letterSpacing }),
        ...(tone === 'onDark' && { color: colors.text.onDark }),
        ...style,
      }}
      {...rest}
    />
  );
};
