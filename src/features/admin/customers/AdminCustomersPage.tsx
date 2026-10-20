import { TeamOutlined } from '@ant-design/icons';
import { Empty, Table, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/api/supabaseClient';
import { AdminLayout } from '../layout/AdminLayout';
import type { Profile } from '../../../shared/types';
import { useColors, radius, shadows, spacing } from '../../../lib/theme';

const { Title } = Typography;

export const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const colors = useColors();

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setCustomers(data ?? []); setLoading(false); });
  }, []);

  return (
    <AdminLayout>
      <Title level={2} style={{ marginBottom: 24 }}>Customers</Title>

      <div style={{
        background: colors.background.surface,
        borderRadius: radius.lg,
        boxShadow: shadows.sm,
        padding: spacing[4],
      }}>
        <Table
          dataSource={customers}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText: (
              <Empty
                image={<TeamOutlined style={{ fontSize: 40, color: colors.brand.accent }} />}
                description="No customers yet"
              />
            ),
          }}
          columns={[
            { title: 'Name', dataIndex: 'full_name', render: (v: string | null) => v ?? '—' },
            { title: 'Phone', dataIndex: 'phone', render: (v: string | null) => v ?? '—' },
            { title: 'Address', dataIndex: 'address', render: (v: string | null) => v ?? '—' },
            {
              title: 'Role',
              dataIndex: 'role',
              render: (v: string) => <Tag color={v === 'admin' ? 'red' : 'blue'}>{v.toUpperCase()}</Tag>,
            },
            {
              title: 'Joined',
              dataIndex: 'created_at',
              render: (v: string) => new Date(v).toLocaleDateString(),
            },
          ]}
        />
      </div>
    </AdminLayout>
  );
};
