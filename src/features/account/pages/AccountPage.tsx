import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  UserOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons';
import {
  App,
  Button,
  Col,
  Divider,
  Empty,
  Form,
  Image,
  Input,
  Popconfirm,
  Row,
  Space,
  Spin,
  Steps,
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
import { StatusChip } from '../../../shared/components/StatusChip';
import { LoadError } from '../../../shared/components/LoadError';
import { useSupabaseQuery } from '../../../shared/hooks/useSupabaseQuery';
import { buildWhatsAppLink, BUSINESS_WHATSAPP_NUMBER } from '../../../shared/config/whatsapp';
import { ORDER_STATUS_STEPS, orderStatusStepIndex, orderWhatsAppMessage } from '../../../shared/config/orderStatus';

const { Title, Text } = Typography;

interface QuoteCardProps {
  quote: Quote;
  onAccept: (quoteId: string) => void;
  onDecline: (quoteId: string) => void;
}

const CustomerQuoteCard = ({ quote, onAccept, onDecline }: QuoteCardProps) => {
  const colors = useColors();
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!quote.images?.length) return;
    let cancelled = false;
    Promise.all(quote.images.map(path => quotesService.getAttachmentUrl(path)))
      .then(urls => { if (!cancelled) setImageUrls(urls); })
      .catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote.id, quote.images.join('|')]);

  const whatsappMessage = quote.quoted_price
    ? `Hi, I have a question about my quote #${quote.id.slice(0, 8).toUpperCase()} (quoted at $${quote.quoted_price}).`
    : `Hi, I'd like to follow up on my quote request #${quote.id.slice(0, 8).toUpperCase()}.`;

  return (
    <div style={{
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
          <StatusChip kind="quote" status={quote.status} />
        </Col>
      </Row>

      {quote.notes && (
        <Text type="secondary" style={{ display: 'block', marginTop: spacing[2], fontSize: 13 }}>
          {quote.notes}
        </Text>
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
          <Space style={{ marginTop: spacing[3] }} wrap>
            <Popconfirm
              title="Accept this quote?"
              description="You'll be taken to checkout to pay for it."
              onConfirm={() => onAccept(quote.id)}
              okText="Accept & Pay"
            >
              <Button
                type="primary"
                style={{ backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }}
              >
                Accept & Pay
              </Button>
            </Popconfirm>
            <Popconfirm
              title="Decline this quote?"
              description="This can't be undone — you'd need to submit a new request."
              onConfirm={() => onDecline(quote.id)}
              okText="Decline"
              okButtonProps={{ danger: true }}
            >
              <Button danger>Decline</Button>
            </Popconfirm>
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

      <div style={{ marginTop: spacing[3] }}>
        <Button
          size="small"
          icon={<WhatsAppOutlined />}
          href={buildWhatsAppLink(BUSINESS_WHATSAPP_NUMBER, whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Chat on WhatsApp
        </Button>
      </div>
    </div>
  );
};

const CustomerOrderCard = ({ order }: { order: Order }) => {
  const colors = useColors();
  const whatsappLink = buildWhatsAppLink(BUSINESS_WHATSAPP_NUMBER, orderWhatsAppMessage(order.id, order.status));

  return (
    <div style={{
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
            <StatusChip kind="order" status={order.status} />
            <Text strong className="mono" style={{ color: colors.brand.deep }}>${order.total_amount}</Text>
          </Space>
        </Col>
      </Row>

      {order.items && order.items.length > 0 && (
        <Space style={{ marginTop: spacing[2] }} wrap>
          {order.items.map(item => (
            <Tag key={item.id} color={colors.brand.primary}>
              {item.product?.name ?? 'Item'} × {item.quantity}
            </Tag>
          ))}
        </Space>
      )}

      {order.status === 'cancelled' ? (
        <div style={{ marginTop: spacing[3] }}>
          <Tag color="error">This order was cancelled</Tag>
        </div>
      ) : (
        <div style={{ marginTop: spacing[4] }}>
          <Steps
            size="small"
            current={orderStatusStepIndex(order.status)}
            items={ORDER_STATUS_STEPS.map(s => ({ title: s.title }))}
          />
        </div>
      )}

      {order.deposit_amount && (
        <div style={{ marginTop: spacing[3] }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Deposit paid: ${order.deposit_amount} — Balance: ${(order.total_amount - order.deposit_amount).toFixed(2)} due on delivery
          </Text>
        </div>
      )}

      <div style={{ marginTop: spacing[3] }}>
        <Button
          size="small"
          icon={<WhatsAppOutlined />}
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          Chat on WhatsApp
        </Button>
      </div>
    </div>
  );
};

export const AccountPage = () => {
  const { message } = App.useApp();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [profileLoading, setProfileLoading] = useState(false);
  const [form] = Form.useForm();
  const colors = useColors();

  useEffect(() => {
    if (profile) {
      form.setFieldsValue({ full_name: profile.full_name, phone: profile.phone, address: profile.address });
    }
  }, [profile, form]);

  const ordersQuery = useSupabaseQuery<Order[]>(
    () => supabase
      .from('orders')
      .select('*, items:order_items(*, product:products(*))')
      .eq('customer_id', user?.id ?? '')
      .order('created_at', { ascending: false }),
    [user?.id],
  );
  const quotesQuery = useSupabaseQuery<Quote[]>(() => quotesService.getMyQuotes(), [user?.id]);
  const orders = ordersQuery.data ?? [];
  const quotes = quotesQuery.data ?? [];

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

  const handleDeclineQuote = async (quoteId: string) => {
    await quotesService.updateQuote(quoteId, { status: 'rejected' });
    message.success('Quote declined');
    quotesQuery.retry();
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
              children: ordersQuery.loading ? <Spin /> : ordersQuery.error ? (
                <LoadError compact what="your orders" error={ordersQuery.error} onRetry={ordersQuery.retry} />
              ) : orders.length === 0 ? (
                <Empty description="No orders yet">
                  <Button onClick={() => navigate('/catalogue')} type="primary"
                    style={{ backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }}>
                    Browse Catalogue
                  </Button>
                </Empty>
              ) : (
                <Space direction="vertical" style={{ width: '100%' }} size={spacing[3]}>
                  {orders.map(order => (
                    <CustomerOrderCard key={order.id} order={order} />
                  ))}
                </Space>
              ),
            },
            {
              key: 'quotes',
              label: <span><FileTextOutlined /> My Quotes</span>,
              children: quotesQuery.loading ? <Spin /> : quotesQuery.error ? (
                <LoadError compact what="your quotes" error={quotesQuery.error} onRetry={quotesQuery.retry} />
              ) : quotes.length === 0 ? (
                <Empty description="No quote requests yet">
                  <Button onClick={() => navigate('/quotes/new')} type="primary"
                    style={{ backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }}>
                    Request a Quote
                  </Button>
                </Empty>
              ) : (
                <Space direction="vertical" style={{ width: '100%' }} size={spacing[3]}>
                  {quotes.map(quote => (
                    <CustomerQuoteCard
                      key={quote.id}
                      quote={quote}
                      onAccept={handleAcceptQuote}
                      onDecline={handleDeclineQuote}
                    />
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
