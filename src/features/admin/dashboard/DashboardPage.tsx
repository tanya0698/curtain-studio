import { FileTextOutlined, ShoppingOutlined, TeamOutlined, DollarOutlined } from '@ant-design/icons';
import { Card, Col, Row, Spin, Statistic, Typography } from 'antd';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { supabase } from '../../../lib/api/supabaseClient';
import { AdminLayout } from '../layout/AdminLayout';
import { LoadError } from '../../../shared/components/LoadError';
import { useSupabaseQuery } from '../../../shared/hooks/useSupabaseQuery';
import { useColors, radius, shadows, spacing } from '../../../lib/theme';

const { Title } = Typography;

interface DashboardData {
  stats: { orders: number; quotes: number; customers: number; revenue: number };
  chartData: { month: string; revenue: number }[];
}

const fetchDashboard = async () => {
  const [ordersRes, quotesRes, customersRes] = await Promise.all([
    supabase.from('orders').select('id, total_amount, created_at'),
    supabase.from('quotes').select('id, status'),
    supabase.from('profiles').select('id').eq('role', 'customer'),
  ]);

  // Any failure means the numbers would be wrong — report it rather than showing zeros
  const error = ordersRes.error ?? quotesRes.error ?? customersRes.error;
  if (error) return { data: null, error };

  const orders = ordersRes.data ?? [];
  const revenue = orders.reduce((sum, o) => sum + (o.total_amount ?? 0), 0);

  // Monthly revenue for last 6 months
  const now = new Date();
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = d.toLocaleDateString('en', { month: 'short', year: '2-digit' });
    const monthRevenue = orders
      .filter(o => {
        const created = new Date(o.created_at);
        return created.getMonth() === d.getMonth() && created.getFullYear() === d.getFullYear();
      })
      .reduce((sum, o) => sum + (o.total_amount ?? 0), 0);
    return { month: label, revenue: monthRevenue };
  });

  const data: DashboardData = {
    stats: {
      orders: orders.length,
      quotes: (quotesRes.data ?? []).filter(q => q.status === 'pending').length,
      customers: (customersRes.data ?? []).length,
      revenue,
    },
    chartData,
  };
  return { data, error: null };
};

export const DashboardPage = () => {
  const colors = useColors();
  const dashboardQuery = useSupabaseQuery<DashboardData>(fetchDashboard, []);

  if (dashboardQuery.error) {
    return (
      <AdminLayout>
        <LoadError what="the dashboard" error={dashboardQuery.error} onRetry={dashboardQuery.retry} />
      </AdminLayout>
    );
  }
  if (!dashboardQuery.data) return <AdminLayout><Spin size="large" /></AdminLayout>;
  const { stats, chartData } = dashboardQuery.data;

  return (
    <AdminLayout>
      <Title level={2} style={{ marginBottom: spacing[6] }}>Dashboard</Title>

      <Row gutter={[24, 24]} style={{ marginBottom: spacing[8] }}>
        {[
          { title: 'Total Orders', value: stats.orders, icon: <ShoppingOutlined />, color: colors.brand.primary },
          { title: 'Pending Quotes', value: stats.quotes, icon: <FileTextOutlined />, color: colors.semantic.warning },
          { title: 'Customers', value: stats.customers, icon: <TeamOutlined />, color: colors.semantic.success },
          { title: 'Total Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: <DollarOutlined />, color: colors.brand.accent },
        ].map(stat => (
          <Col key={stat.title} xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: radius.lg, boxShadow: shadows.sm }}>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={<span style={{ color: stat.color, fontSize: 18 }}>{stat.icon}</span>}
                valueStyle={{ color: colors.text.primary }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="Revenue — Last 6 Months" style={{ borderRadius: radius.lg, boxShadow: shadows.sm }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border.subtle} />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={v => `$${v}`} />
            <Tooltip formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Revenue']} />
            <Bar dataKey="revenue" fill={colors.brand.primary} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </AdminLayout>
  );
};
