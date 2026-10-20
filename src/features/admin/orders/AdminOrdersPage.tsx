import { ShoppingOutlined, WhatsAppOutlined } from '@ant-design/icons';
import { Button, Empty, Select, Space, Table, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/api/supabaseClient';
import { AdminLayout } from '../layout/AdminLayout';
import type { Order, OrderStatus } from '../../../shared/types';
import { StatusChip } from '../../../shared/components/StatusChip';
import { useColors, radius, shadows, spacing } from '../../../lib/theme';
import { buildWhatsAppLink } from '../../../shared/config/whatsapp';
import { orderWhatsAppMessage } from '../../../shared/config/orderStatus';

const { Title } = Typography;

const STATUS_OPTIONS = (
  ['pending_payment', 'paid', 'in_progress', 'ready', 'delivered', 'cancelled'] as OrderStatus[]
).map(value => ({ value, label: <StatusChip kind="order" status={value} /> }));


export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<(Order & { customer?: { full_name: string | null; phone: string | null } })[]>([]);
  const [loading, setLoading] = useState(true);
  const colors = useColors();

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, customer:profiles(full_name, phone), items:order_items(*, product:products(name))')
      .order('created_at', { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    supabase
      .from('orders')
      .select('*, customer:profiles(full_name, phone), items:order_items(*, product:products(name))')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data ?? []); setLoading(false); });
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    fetchOrders();
  };

  return (
    <AdminLayout>
      <Title level={2} style={{ marginBottom: 24 }}>Orders</Title>

      <div style={{
        background: colors.background.surface,
        borderRadius: radius.lg,
        boxShadow: shadows.sm,
        padding: spacing[4],
      }}>
      <Table
        dataSource={orders}
        rowKey="id"
        loading={loading}
        scroll={{ x: 900 }}
        locale={{
          emptyText: (
            <Empty
              image={<ShoppingOutlined style={{ fontSize: 40, color: colors.brand.accent }} />}
              description="No orders yet"
            />
          ),
        }}
        columns={[
          {
            title: 'Order ID',
            dataIndex: 'id',
            render: (id: string) => <code>{id.slice(0, 8).toUpperCase()}</code>,
          },
          {
            title: 'Customer',
            dataIndex: 'customer',
            render: (c: { full_name: string | null }) => c?.full_name ?? '—',
          },
          {
            title: 'Total',
            dataIndex: 'total_amount',
            render: (v: number) => <span className="mono">${v?.toFixed(2)}</span>,
          },
          {
            title: 'Deposit',
            dataIndex: 'deposit_amount',
            render: (v: number | null) => v ? <span className="mono">${v.toFixed(2)}</span> : '—',
          },
          {
            title: 'Payment',
            dataIndex: 'payment_method',
            render: (v: string) => <Tag>{v?.toUpperCase()}</Tag>,
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (status: string, record: Order) => (
              <Select
                value={status}
                size="small"
                variant="borderless"
                style={{ width: 170 }}
                onChange={v => updateStatus(record.id, v)}
                options={STATUS_OPTIONS}
              />
            ),
          },
          {
            title: 'Contact',
            render: (_: unknown, record: Order & { customer?: { phone: string | null } }) =>
              record.customer?.phone ? (
                <Button
                  size="small"
                  icon={<WhatsAppOutlined />}
                  href={buildWhatsAppLink(record.customer.phone, orderWhatsAppMessage(record.id, record.status))}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </Button>
              ) : null,
          },
          {
            title: 'Date',
            dataIndex: 'created_at',
            render: (v: string) => new Date(v).toLocaleDateString(),
          },
          {
            title: 'Items',
            dataIndex: 'items',
            render: (items: { product?: { name: string } }[]) => (
              <Space direction="vertical" size={2}>
                {(items ?? []).map((item, i) => (
                  <Tag key={i} color={colors.brand.primary}>{item.product?.name}</Tag>
                ))}
              </Space>
            ),
          },
        ]}
      />
      </div>
    </AdminLayout>
  );
};
