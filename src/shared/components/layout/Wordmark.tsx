import { useColors, typography } from '../../../lib/theme';

// "J&M" in the display serif, "Curtain Studio" as a small-caps label beside it.
export const Wordmark = ({ inverse = false, sub = 'Curtain Studio' }: { inverse?: boolean; sub?: string }) => {
  const colors = useColors();
  const ink = inverse ? colors.text.onDark : colors.text.primary;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 10 }}>
      <span style={{ fontFamily: typography.displayFamily, fontSize: 24, letterSpacing: '0.01em', color: ink }}>
        J&amp;M
      </span>
      <span style={{
        fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
        color: ink, opacity: 0.56,
      }}>
        {sub}
      </span>
    </span>
  );
};
