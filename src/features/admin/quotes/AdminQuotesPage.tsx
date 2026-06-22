import { Button, Collapse, Form, Input, InputNumber, message, Select, Space, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { quotesService } from '../../quotes/services/quotesService';
import { AdminLayout } from '../layout/AdminLayout';
import type { Quote } from '../../../shared/types';
import { useColors, radius, shadows, spacing } from '../../../lib/theme';

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

const STATUS_COLOR: Record<string, string> = {
  pending: 'gold', quoted: 'blue', accepted: 'green', rejected: 'red', completed: 'purple',
};

export const AdminQuotesPage = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const colors = useColors();

  const fetchQuotes = async () => {
    const { data } = await quotesService.getAllQuotes();
    setQuotes(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchQuotes(); }, []);

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

  return (
    <AdminLayout>
      <Title level={2} style={{ marginBottom: 24 }}>Quote Requests</Title>

      {loading ? <Text>Loading...</Text> : (
        <Space direction="vertical" style={{ width: '100%' }} size={spacing[3]}>
          {quotes.map(quote => (
            <div key={quote.id} style={{
              background: colors.background.surface,
              borderRadius: radius.lg,
              boxShadow: shadows.sm,
              overflow: 'hidden',
            }}>
              <div style={{ padding: `${spacing[4]}px ${spacing[4]}px 0` }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space>
                    <Text strong>#{quote.id.slice(0, 8).toUpperCase()}</Text>
                    <Text type="secondary">{(quote.customer as unknown as { full_name: string | null } | undefined)?.full_name ?? 'Unknown'}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{new Date(quote.created_at).toLocaleDateString()}</Text>
                  </Space>
                  <Tag color={STATUS_COLOR[quote.status]}>{quote.status.toUpperCase()}</Tag>
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
              </div>

              <Collapse ghost>
                <Panel header="Respond to this quote" key="respond" style={{ padding: `0 ${spacing[2]}px` }}>
                  <Form
                    layout="vertical"
                    initialValues={{ status: quote.status, admin_notes: quote.admin_notes ?? '', quoted_price: quote.quoted_price }}
                    onFinish={values => handleRespond(quote.id, values)}
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
                      loading={saving[quote.id]}
                      style={{ backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }}
                    >
                      Save Response
                    </Button>
                  </Form>
                </Panel>
              </Collapse>
            </div>
          ))}
        </Space>
      )}
    </AdminLayout>
  );
};
