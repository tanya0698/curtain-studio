import { CheckOutlined, ScissorOutlined, StarFilled } from '@ant-design/icons';
import { Typography } from 'antd';
import { useColors, typography, iconSize } from '../../../lib/theme';

const { Text } = Typography;

const FEATURES = [
  'Custom made to your exact measurements',
  'Premium fabrics from top mills',
  '15+ years of trusted craftsmanship',
];

export const AuthImagePanel = () => {
  const colors = useColors();
  return (
    <div style={{
      width: '46%',
      minWidth: 340,
      flexShrink: 0,
      background: colors.brand.dark,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 44px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Pleats along the top edge */}
      <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, display: 'flex', gap: 3, padding: '0 24px' }}>
        {[colors.brand.primary, colors.brand.accent, colors.text.secondary, colors.brand.peach, colors.brand.primary, colors.brand.accent, colors.text.secondary, colors.brand.peach].map((c, i) => (
          <div key={i} style={{ flex: 1, background: c, opacity: 0.22, borderRadius: '0 0 40px 40px', marginBottom: i % 2 ? 0 : 20 }} />
        ))}
      </div>

      {/* Icon circle */}
      <div style={{
        width: 88, height: 88, borderRadius: '50%',
        border: `1px solid ${colors.brand.primary}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24,
        position: 'relative', zIndex: 1,
      }}>
        <ScissorOutlined style={{ fontSize: iconSize.hero, color: colors.brand.peach }} />
      </div>

      {/* Brand name */}
      <div style={{ color: '#fff', fontSize: 28, fontWeight: typography.fontWeights.bold, letterSpacing: '-0.02em', textAlign: 'center', marginBottom: 6, position: 'relative', zIndex: 1 }}>
        J&amp;M Curtain Studio
      </div>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textAlign: 'center', marginBottom: 36, position: 'relative', zIndex: 1 }}>
        Beautiful curtains, crafted for you
      </div>

      {/* Feature list */}
      <div style={{ width: '100%', maxWidth: 280, position: 'relative', zIndex: 1 }}>
        {FEATURES.map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: colors.brand.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: 1,
            }}>
              <CheckOutlined style={{ color: '#fff', fontSize: iconSize.sm }} />
            </div>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: '1.5' }}>{f}</Text>
          </div>
        ))}
      </div>

      {/* Rating strip */}
      <div style={{
        marginTop: 28,
        display: 'flex', alignItems: 'center', gap: 10,
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: 4, padding: '10px 18px',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {[...Array(5)].map((_, i) => <StarFilled key={i} style={{ color: colors.brand.peach, fontSize: iconSize.sm }} />)}
        </div>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500 }}>
          500+ happy customers
        </Text>
      </div>
    </div>
  );
};
