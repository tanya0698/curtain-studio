import type { OrderStatus, QuoteStatus } from '../types';
import { useColors, useTheme, withAlpha } from '../../lib/theme';

type Tone = 'brass' | 'caramel' | 'success' | 'warning' | 'danger' | 'neutral';

const ORDER_TONES: Record<OrderStatus, { tone: Tone; label: string }> = {
  pending_payment: { tone: 'warning', label: 'Awaiting Payment' },
  paid: { tone: 'caramel', label: 'Paid' },
  in_progress: { tone: 'brass', label: 'In Progress' },
  ready: { tone: 'success', label: 'Ready' },
  delivered: { tone: 'neutral', label: 'Delivered' },
  cancelled: { tone: 'danger', label: 'Cancelled' },
};

const QUOTE_TONES: Record<QuoteStatus, { tone: Tone; label: string }> = {
  pending: { tone: 'warning', label: 'Pending' },
  quoted: { tone: 'caramel', label: 'Quoted' },
  accepted: { tone: 'success', label: 'Accepted' },
  rejected: { tone: 'danger', label: 'Declined' },
  completed: { tone: 'neutral', label: 'Completed' },
};

type Props =
  | { kind: 'order'; status: OrderStatus }
  | { kind: 'quote'; status: QuoteStatus };

export const StatusChip = ({ kind, status }: Props) => {
  const colors = useColors();
  const { isDark } = useTheme();
  const entry = kind === 'order'
    ? ORDER_TONES[status as OrderStatus]
    : QUOTE_TONES[status as QuoteStatus];
  const { tone, label } = entry ?? { tone: 'neutral' as Tone, label: status };

  const fg: Record<Tone, string> = {
    brass: colors.brand.deep,
    caramel: colors.brand.accent,
    success: colors.semantic.success,
    warning: colors.semantic.warning,
    danger: colors.semantic.error,
    neutral: colors.text.secondary,
  };
  const color = fg[tone];
  const background = tone === 'neutral'
    ? colors.border.subtle
    : withAlpha(tone === 'brass' ? colors.brand.primary : color, isDark ? 0.2 : 0.13);

  return <span className="status-chip" style={{ color, background }}>{label}</span>;
};
