import { Select, Space, Table, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/api/supabaseClient';
import { AdminLayout } from '../layout/AdminLayout';
import type { Order } from '../../../shared/types';
import { useColors } from '../../../lib/theme';

const { Title } = Typography;

const STATUS_OPTIONS = [
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'paid', label: 'Paid' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'ready', label: 'Ready' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];


export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<(Order & { customer?: { full_name: string | null; email?: string } })[]>([]);
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

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    fetchOrders();
  };

  return (
    <AdminLayout>
      <Title level={2} style={{ marginBottom: 24 }}>Orders</Title>

      <Table
        dataSource={orders}
        rowKey="id"
        loading={loading}
        scroll={{ x: 900 }}
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
            render: (v: number) => `$${v?.toFixed(2)}`,
          },
          {
            title: 'Deposit',
            dataIndex: 'deposit_amount',
            render: (v: number | null) => v ? `$${v.toFixed(2)}` : '—',
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
                style={{ width: 160 }}
                onChange={v => updateStatus(record.id, v)}
                options={STATUS_OPTIONS}
              />
            ),
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
    </AdminLayout>
  );
};
