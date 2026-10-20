import { WhatsAppOutlined } from '@ant-design/icons';
import { Badge, Button, Collapse, Form, Image, Input, InputNumber, message, Segmented, Select, Space, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { quotesService } from '../../quotes/services/quotesService';
import { AdminLayout } from '../layout/AdminLayout';
import type { Quote, QuoteStatus } from '../../../shared/types';
import { useColors, radius, shadows, spacing } from '../../../lib/theme';
import { buildWhatsAppLink } from '../../../shared/config/whatsapp';

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

const STATUS_COLOR: Record<string, string> = {
  pending: 'gold', quoted: 'blue', accepted: 'green', rejected: 'red', completed: 'purple',
};

const FILTERS: { label: string; value: 'all' | QuoteStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Quoted', value: 'quoted' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Completed', value: 'completed' },
  { label: 'Rejected', value: 'rejected' },
];

interface QuoteCardProps {
  quote: Quote;
  saving: boolean;
  onRespond: (quoteId: string, values: { quoted_price: number; admin_notes: string; status: string }) => void;
}

const QuoteCard = ({ quote, saving, onRespond }: QuoteCardProps) => {
  const colors = useColors();
  const [form] = Form.useForm();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const customer = quote.customer as unknown as { full_name: string | null; phone: string | null } | undefined;

  useEffect(() => {
    if (!quote.images?.length) return;
    let cancelled = false;
    Promise.all(quote.images.map(path => quotesService.getAttachmentUrl(path)))
      .then(urls => { if (!cancelled) setImageUrls(urls); })
      .catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote.id, quote.images.join('|')]);

  const greeting = customer?.full_name ? `Hi ${customer.full_name}` : 'Hi';
  const whatsappMessage = `${greeting}, this is J&M Curtain Studio regarding your quote #${quote.id.slice(0, 8).toUpperCase()}.`;
  const whatsappLink = customer?.phone ? buildWhatsAppLink(customer.phone, whatsappMessage) : null;

  return (
    <div style={{
      background: colors.background.surface,
      borderRadius: radius.lg,
      boxShadow: shadows.sm,
      overflow: 'hidden',
    }}>
      <div style={{ padding: `${spacing[4]}px ${spacing[4]}px 0` }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
          <Space wrap>
            <Text strong>#{quote.id.slice(0, 8).toUpperCase()}</Text>
            <Text type="secondary">{customer?.full_name ?? 'Unknown'}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{new Date(quote.created_at).toLocaleDateString()}</Text>
          </Space>
          <Space>
            {whatsappLink && (
              <Button
                size="small"
                icon={<WhatsAppOutlined />}
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp Customer
              </Button>
            )}
            <Tag color={STATUS_COLOR[quote.status]}>{quote.status.toUpperCase()}</Tag>
          </Space>
        </Space>

        {quote.notes && (
          <div style={{ marginTop: spacing[2], padding: spacing[3], background: colors.background.muted, borderRadius: radius.md }}>
            <Text type="secondary" style={{ fontSize: 13 }}>{quote.notes}</Text>
          </div>
        )}

        {quote.items && quote.items.length > 0 && (
          <Space style={{ marginTop: spacing[2] }} wrap>
            {quote.items.map(item => (
              <Tag key={item.id} color={colors.brand.primary}>
                {(item.product as unknown as { name: string } | undefined)?.name ?? 'Product'} × {item.quantity}
                {item.measurements ? ` (${item.measurements.width}×${item.measurements.drop}cm)` : ''}
                {item.fabric_choice ? ` — ${item.fabric_choice}` : ''}
              </Tag>
            ))}
          </Space>
        )}

        {imageUrls.length > 0 && (
          <Space style={{ marginTop: spacing[2] }} wrap>
            <Image.PreviewGroup>
              {imageUrls.map(url => (
                <Image key={url} src={url} width={56} height={56} style={{ objectFit: 'cover', borderRadius: radius.md }} />
              ))}
            </Image.PreviewGroup>
          </Space>
        )}
      </div>

      <Collapse ghost>
        <Panel header="Respond to this quote" key="respond" style={{ padding: `0 ${spacing[2]}px` }}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{ status: quote.status, admin_notes: quote.admin_notes ?? '', quoted_price: quote.quoted_price }}
            onFinish={values => onRespond(quote.id, values)}
            onValuesChange={(changed, all) => {
              // Setting a price while status is still Pending is an easy way
              // to accidentally never surface it to the customer (they only
              // see quoted_price once status is 'quoted') — nudge it forward.
              if (changed.quoted_price != null && all.status === 'pending') {
                form.setFieldsValue({ status: 'quoted' });
              }
            }}
          >
            <Space style={{ width: '100%' }} size={spacing[4]}>
              <Form.Item name="quoted_price" label="Quoted Price ($)" style={{ flex: 1, margin: 0 }}>
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} prefix="$" />
              </Form.Item>
              <Form.Item name="status" label="Update Status" style={{ flex: 1, margin: 0 }}>
                <Select options={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'quoted', label: 'Quoted (send to customer)' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'rejected', label: 'Rejected' },
                ]} />
              </Form.Item>
            </Space>
            <Form.Item name="admin_notes" label="Message to Customer" style={{ marginTop: spacing[3] }}>
              <TextArea rows={3} placeholder="Explain the quote, mention timeline, materials, etc." />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              style={{ backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }}
            >
              Save Response
            </Button>
          </Form>
        </Panel>
      </Collapse>
    </div>
  );
};

export const AdminQuotesPage = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [statusFilter, setStatusFilter] = useState<'all' | QuoteStatus>('all');

  const fetchQuotes = async () => {
    const { data } = await quotesService.getAllQuotes();
    setQuotes(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    quotesService.getAllQuotes().then(({ data }) => { setQuotes(data ?? []); setLoading(false); });
  }, []);

  const handleRespond = async (quoteId: string, values: { quoted_price: number; admin_notes: string; status: string }) => {
    setSaving(s => ({ ...s, [quoteId]: true }));
    try {
      await quotesService.updateQuote(quoteId, values);
      message.success('Quote updated');
      fetchQuotes();
    } catch {
      message.error('Failed to update quote');
    } finally {
      setSaving(s => ({ ...s, [quoteId]: false }));
    }
  };

  const pendingCount = quotes.filter(q => q.status === 'pending').length;
  const filteredQuotes = statusFilter === 'all' ? quotes : quotes.filter(q => q.status === statusFilter);

  return (
    <AdminLayout>
      <Title level={2} style={{ marginBottom: 24 }}>Quote Requests</Title>

      <Segmented
        style={{ marginBottom: spacing[4] }}
        value={statusFilter}
        onChange={v => setStatusFilter(v as 'all' | QuoteStatus)}
        options={FILTERS.map(f => ({
          label: f.value === 'pending' && pendingCount > 0
            ? <Badge count={pendingCount} size="small" offset={[8, -2]}>{f.label}</Badge>
            : f.label,
          value: f.value,
        }))}
      />

      {loading ? <Text>Loading...</Text> : filteredQuotes.length === 0 ? (
        <Text type="secondary">No quotes in this filter.</Text>
      ) : (
        <Space direction="vertical" style={{ width: '100%' }} size={spacing[3]}>
          {filteredQuotes.map(quote => (
            <QuoteCard key={quote.id} quote={quote} saving={!!saving[quote.id]} onRespond={handleRespond} />
          ))}
        </Space>
      )}
    </AdminLayout>
  );
};
