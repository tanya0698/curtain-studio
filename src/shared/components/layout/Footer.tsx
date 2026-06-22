import { Typography } from 'antd';
import { useColors, spacing } from '../../../lib/theme';

const { Text } = Typography;

export const Footer = () => {
  const colors = useColors();
  return (
    <footer style={{
      background: colors.brand.dark,
      color: '#fff',
      padding: `${spacing[8]}px ${spacing[6]}px`,
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing[8] }}>
        <div>
          <Text strong style={{ color: '#fff', fontSize: 18 }}>✂️ Curtain Studio</Text>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: spacing[2] }}>
            Custom designs, ready-made curtains, fabrics &amp; alterations — crafted with care.
          </p>
        </div>
        <div>
          <Text strong style={{ color: '#fff' }}>Services</Text>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: spacing[2] }}>
            {['Custom Curtains', 'Ready-Made', 'Fabrics', 'Alterations'].map(s => (
              <li key={s} style={{ color: 'rgba(255,255,255,0.7)', marginBottom: spacing[1] }}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <Text strong style={{ color: '#fff' }}>Contact</Text>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: spacing[2] }}>
            Reach us via WhatsApp or the quote request form for custom orders.
          </p>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: spacing[8], borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: spacing[4] }}>
        <Text style={{ color: 'rgba(255,255,255,0.5)' }}>© {new Date().getFullYear()} Curtain Studio. All rights reserved.</Text>
      </div>
    </footer>
  );
};
