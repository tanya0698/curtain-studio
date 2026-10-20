import { Typography } from 'antd';
import type { TextProps as AntTextProps } from 'antd/es/typography/Text';
import { typography, useColors } from '../../../lib/theme';

export type TextTone = 'primary' | 'secondary' | 'muted' | 'brand' | 'onDark';
export type TextSize = keyof typeof typography.body;

export interface TextProps extends Omit<AntTextProps, 'type'> {
  tone?: TextTone;
  size?: TextSize;
  /** Tabular mono — prices, measurements, order refs. */
  mono?: boolean;
}

/** antd Text with theme tones and sizes. Keeps ellipsis, copyable, strong, etc. */
export const Text = ({ tone = 'primary', size = 'md', mono, style, ...rest }: TextProps) => {
  const colors = useColors();
  const tones: Record<TextTone, string> = {
    primary: colors.text.primary,
    secondary: colors.text.secondary,
    muted: colors.text.muted,
    brand: colors.brand.deep,
    onDark: colors.text.onDark,
  };
  const t = typography.body[size];
  return (
    <Typography.Text
      style={{
        fontSize: t.fontSize,
        lineHeight: t.lineHeight,
        color: tones[tone],
        ...(mono && { fontFamily: typography.monoFamily, fontVariantNumeric: 'tabular-nums' }),
        ...style,
      }}
      {...rest}
    />
  );
};

/** Small uppercase section label that sits above a Heading. */
export const Eyebrow = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <span className="eyebrow" style={style}>{children}</span>
);
