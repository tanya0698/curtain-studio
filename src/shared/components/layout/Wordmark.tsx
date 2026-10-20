import { useColors, typography } from '../../../lib/theme';

// Text-only wordmark: bold "J&M", "Curtain Studio" as a small-caps label beside it.
export const Wordmark = ({ inverse = false, sub = 'Curtain Studio' }: { inverse?: boolean; sub?: string }) => {
  const colors = useColors();
  const ink = inverse ? colors.text.onDark : colors.text.primary;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 10 }}>
      <span style={{ fontSize: 22, fontWeight: typography.fontWeights.bold, letterSpacing: '-0.02em', color: ink }}>
        J&amp;M
      </span>
      <span style={{
        fontSize: 11, fontWeight: typography.fontWeights.semiBold,
        letterSpacing: typography.letterSpacings.wordmark, textTransform: 'uppercase',
        color: ink, opacity: 0.56,
      }}>
        {sub}
      </span>
    </span>
  );
};
