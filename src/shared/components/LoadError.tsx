import { ReloadOutlined, WhatsAppOutlined } from '@ant-design/icons';
import { Button, Result, Space } from 'antd';
import { buildWhatsAppLink, BUSINESS_WHATSAPP_NUMBER } from '../config/whatsapp';

interface Props {
  /** What failed to load, e.g. "the catalogue". */
  what: string;
  onRetry: () => void;
  /** Raw error, shown small for support/debugging. */
  error?: string | null;
  /** Tighter layout for use inside a card or table. */
  compact?: boolean;
}

/** Shown when data couldn't be fetched — never pretend the list is just empty. */
export const LoadError = ({ what, onRetry, error, compact }: Props) => (
  <Result
    status="warning"
    title={`We couldn't load ${what}`}
    subTitle={
      <>
        This is usually a brief connection problem on our side. Please try again in a moment.
        {error && <><br /><span className="mono" style={{ fontSize: 12, opacity: 0.7 }}>{error}</span></>}
      </>
    }
    style={compact ? { padding: '24px 0' } : undefined}
    extra={
      <Space wrap style={{ justifyContent: 'center' }}>
        <Button type="primary" icon={<ReloadOutlined />} onClick={onRetry}>
          Try again
        </Button>
        {!compact && (
          <Button
            icon={<WhatsAppOutlined />}
            href={buildWhatsAppLink(BUSINESS_WHATSAPP_NUMBER, `Hi, the website couldn't load ${what} — can you help?`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Message us on WhatsApp
          </Button>
        )}
      </Space>
    }
  />
);
