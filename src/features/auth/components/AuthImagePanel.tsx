import { CheckOutlined, ScissorOutlined, StarFilled } from '@ant-design/icons';
import { Typography } from 'antd';
import { useColors } from '../../../lib/theme';

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
      background: `linear-gradient(145deg, ${colors.brand.dark} 0%, ${colors.brand.primary} 100%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 44px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative background circles */}
      <div style={{ position: 'absolute', top: -90, right: -90, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'absolute', bottom: -70, left: -70, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      <div style={{ position: 'absolute', top: '38%', left: -28, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
      <div style={{ position: 'absolute', top: '15%', right: 20, width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />

      {/* Icon circle */}
      <div style={{
        width: 100, height: 100, borderRadius: '50%',
        background: 'rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24,
        boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
        position: 'relative', zIndex: 1,
      }}>
        <ScissorOutlined style={{ fontSize: 44, color: '#fff' }} />
      </div>

      {/* Brand name */}
      <div style={{ color: '#fff', fontSize: 26, fontWeight: 800, letterSpacing: 0.5, textAlign: 'center', marginBottom: 6, position: 'relative', zIndex: 1 }}>
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
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: 1,
            }}>
              <CheckOutlined style={{ color: '#fff', fontSize: 11 }} />
            </div>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: '1.5' }}>{f}</Text>
          </div>
        ))}
      </div>

      {/* Rating strip */}
      <div style={{
        marginTop: 28,
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(255,255,255,0.12)',
        borderRadius: 14, padding: '10px 18px',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {[...Array(5)].map((_, i) => <StarFilled key={i} style={{ color: '#FDCB6E', fontSize: 13 }} />)}
        </div>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500 }}>
          500+ happy customers
        </Text>
      </div>
    </div>
  );
};
