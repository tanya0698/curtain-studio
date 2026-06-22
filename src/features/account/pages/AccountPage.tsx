import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  message,
  Row,
  Space,
  Spin,
  Tag,
  Tabs,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { quotesService } from '../../quotes/services/quotesService';
import { supabase } from '../../../lib/api/supabaseClient';
import type { Order, Quote } from '../../../shared/types';
import { useColors, radius, shadows, spacing } from '../../../lib/theme';
import { CustomerLayout } from '../../../shared/components/layout/CustomerLayout';

const { Title, Text } = Typography;

const ORDER_STATUS_COLOR: Record<string, string> = {
  pending_payment: 'warning',
  paid: 'blue',
  in_progress: 'processing',
  ready: 'cyan',
  delivered: 'success',
  cancelled: 'error',
};

const QUOTE_STATUS_COLOR: Record<string, string> = {
  pending: 'gold',
  quoted: 'blue',
  accepted: 'green',
  rejected: 'red',
  completed: 'purple',
};

export const AccountPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [quotesLoading, setQuotesLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [form] = Form.useForm();
  const colors = useColors();

  useEffect(() => {
    if (profile) {
      form.setFieldsValue({ full_name: profile.full_name, phone: profile.phone, address: profile.address });
    }
  }, [profile, form]);

  useEffect(() => {
    supabase
      .from('orders')
      .select('*, items:order_items(*, product:products(*))')
      .eq('customer_id', user?.id ?? '')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data ?? []); setOrdersLoading(false); });

    quotesService.getMyQuotes().then(({ data }) => { setQuotes(data ?? []); setQuotesLoading(false); });
  }, [user]);

  const handleProfileSave = async (values: { full_name: string; phone?: string; address?: string }) => {
    setProfileLoading(true);
    const { error } = await supabase.from('profiles').update(values).eq('id', user?.id ?? '');
    setProfileLoading(false);
    if (error) message.error('Failed to update profile');
    else message.success('Profile updated');
  };

  const handleAcceptQuote = async (quoteId: string) => {
    await quotesService.acceptQuote(quoteId);
    navigate('/checkout', { state: { quoteId } });
  };

  return (
    <CustomerLayout>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: `${spacing[8]}px ${spacing[6]}px` }}>
        <Title level={2}>
          <UserOutlined style={{ marginRight: spacing[2] }} />
          My Account
        </Title>

        <Tabs
          defaultActiveKey="orders"
          items={[
            {
              key: 'orders',
              label: <span><ShoppingOutlined /> Orders</span>,
              children: ordersLoading ? <Spin /> : orders.length === 0 ? (
                <Empty description="No orders yet">
                  <Button onClick={() => navigate('/catalogue')} type="primary"
                    style={{ backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }}>
                    Browse Catalogue
                  </Button>
                </Empty>
              ) : (
                <Space direction="vertical" style={{ width: '100%' }} size={spacing[3]}>
                  {orders.map(order => (
                    <div key={order.id} style={{
                      background: colors.background.surface,
                      borderRadius: radius.lg,
                      padding: spacing[4],
                      boxShadow: shadows.sm,
                    }}>
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Text strong>Order #{order.id.slice(0, 8).toUpperCase()}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            {new Date(order.created_at).toLocaleDateString()}
                          </Text>
                        </Col>
                        <Col>
                          <Space>
                            <Tag color={ORDER_STATUS_COLOR[order.status] ?? 'default'}>
                              {order.status.replace('_', ' ').toUpperCase()}
                            </Tag>
                            <Text strong style={{ color: colors.brand.primary }}>${order.total_amount}</Text>
                          </Space>
                        </Col>
                      </Row>
                      {order.deposit_amount && (
                        <div style={{ marginTop: spacing[2] }}>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Deposit paid: ${order.deposit_amount} — Balance: ${(order.total_amount - order.deposit_amount).toFixed(2)} due on delivery
                          </Text>
                        </div>
                      )}
                    </div>
                  ))}
                </Space>
              ),
            },
            {
              key: 'quotes',
              label: <span><FileTextOutlined /> My Quotes</span>,
              children: quotesLoading ? <Spin /> : quotes.length === 0 ? (
                <Empty description="No quote requests yet">
                  <Button onClick={() => navigate('/quotes/new')} type="primary"
                    style={{ backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }}>
                    Request a Quote
                  </Button>
                </Empty>
              ) : (
                <Space direction="vertical" style={{ width: '100%' }} size={spacing[3]}>
                  {quotes.map(quote => (
                    <div key={quote.id} style={{
                      background: colors.background.surface,
                      borderRadius: radius.lg,
                      padding: spacing[4],
                      boxShadow: shadows.sm,
                    }}>
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Text strong>Quote #{quote.id.slice(0, 8).toUpperCase()}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            {new Date(quote.created_at).toLocaleDateString()}
                          </Text>
                        </Col>
                        <Col>
                          <Tag color={QUOTE_STATUS_COLOR[quote.status] ?? 'default'}>
                            {quote.status.toUpperCase()}
                          </Tag>
                        </Col>
                      </Row>

                      {quote.notes && (
                        <Text type="secondary" style={{ display: 'block', marginTop: spacing[2], fontSize: 13 }}>
                          {quote.notes}
                        </Text>
                      )}

                      {quote.status === 'quoted' && quote.quoted_price && (
                        <div style={{
                          marginTop: spacing[3],
                          background: colors.background.muted,
                          borderRadius: radius.md,
                          padding: spacing[3],
                        }}>
                          <Space>
                            <CheckCircleOutlined style={{ color: colors.semantic.success }} />
                            <Text strong>Quoted Price: ${quote.quoted_price}</Text>
                          </Space>
                          {quote.admin_notes && (
                            <p style={{ margin: `${spacing[1]}px 0 0`, fontSize: 13, color: colors.text.secondary }}>
                              {quote.admin_notes}
                            </p>
                          )}
                          <Space style={{ marginTop: spacing[3] }}>
                            <Button
                              type="primary"
                              onClick={() => handleAcceptQuote(quote.id)}
                              style={{ backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }}
                            >
                              Accept & Pay
                            </Button>
                            <Button danger onClick={() => quotesService.updateQuote(quote.id, { status: 'rejected' })}>
                              Decline
                            </Button>
                          </Space>
                        </div>
                      )}

                      {quote.status === 'pending' && (
                        <div style={{ marginTop: spacing[2] }}>
                          <ClockCircleOutlined style={{ color: colors.semantic.warning }} />
                          <Text type="secondary" style={{ marginLeft: spacing[1], fontSize: 13 }}>
                            Awaiting review — we'll respond within 24–48 hours
                          </Text>
                        </div>
                      )}
                    </div>
                  ))}
                </Space>
              ),
            },
            {
              key: 'profile',
              label: <span><UserOutlined /> Profile</span>,
              children: (
                <Form form={form} layout="vertical" onFinish={handleProfileSave} style={{ maxWidth: 480 }}>
                  <Form.Item name="full_name" label="Full Name" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item name="phone" label="Phone">
                    <Input />
                  </Form.Item>
                  <Form.Item name="address" label="Address">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                  <Divider />
                  <Text type="secondary" style={{ display: 'block', marginBottom: spacing[3] }}>
                    Email: {user?.email}
                  </Text>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={profileLoading}
                    style={{ backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }}
                  >
                    Save Changes
                  </Button>
                </Form>
              ),
            },
          ]}
        />
      </div>
    </CustomerLayout>
  );
};
