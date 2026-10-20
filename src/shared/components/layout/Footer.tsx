import { Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useColors, spacing } from '../../../lib/theme';
import { Wordmark } from './Wordmark';

const { Text } = Typography;

export const Footer = () => {
  const colors = useColors();
  const muted = { color: colors.text.muted, fontSize: 13 };
  return (
    <footer style={{
      background: colors.background.page,
      borderTop: `1px solid ${colors.border.strong}`,
      padding: `${spacing[10]}px ${spacing[8]}px ${spacing[8]}px`,
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing[8] }}>
        <div>
          <Wordmark />
          <p style={{ ...muted, marginTop: spacing[3], maxWidth: '34ch' }}>
            Custom curtains, ready-made panels, fabric by the metre and alterations — measured twice, cut once, in Harare.
          </p>
        </div>
        <div>
          <span className="eyebrow">Services</span>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: spacing[3] }}>
            {['Custom Curtains', 'Ready-Made', 'Fabrics', 'Alterations'].map(s => (
              <li key={s} style={{ ...muted, marginBottom: spacing[1] }}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <span className="eyebrow">Contact</span>
          <p style={{ ...muted, marginTop: spacing[3] }}>
            Reach us via WhatsApp or the <Link to="/quotes/new" style={{ color: colors.brand.deep }}>quote request form</Link> for custom orders.
          </p>
        </div>
      </div>
      <div style={{
        maxWidth: 1180, margin: `${spacing[8]}px auto 0`, paddingTop: spacing[4],
        borderTop: `1px solid ${colors.border.subtle}`,
        display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing[3],
      }}>
        <Text style={muted}>© {new Date().getFullYear()} J&amp;M Curtain Studio — Harare</Text>
        <Text style={muted}>Custom curtains · Ready-made · Fabrics · Alterations</Text>
      </div>
    </footer>
  );
};
