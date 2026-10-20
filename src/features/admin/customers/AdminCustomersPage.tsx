import { TeamOutlined } from '@ant-design/icons';
import { Empty, Table, Tag, Typography } from 'antd';
import { supabase } from '../../../lib/api/supabaseClient';
import { LoadError } from '../../../shared/components/LoadError';
import { useSupabaseQuery } from '../../../shared/hooks/useSupabaseQuery';
import { AdminLayout } from '../layout/AdminLayout';
import type { Profile } from '../../../shared/types';
import { useColors, radius, shadows, spacing, iconSize } from '../../../lib/theme';

const { Title } = Typography;

export const AdminCustomersPage = () => {
  const colors = useColors();

  const customersQuery = useSupabaseQuery<Profile[]>(
    () => supabase
      .from('profiles')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: false }),
    [],
  );

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
          dataSource={customersQuery.data ?? []}
          rowKey="id"
          loading={customersQuery.loading}
          locale={{
            emptyText: customersQuery.error ? (
              <LoadError compact what="customers" error={customersQuery.error} onRetry={customersQuery.retry} />
            ) : (
              <Empty
                image={<TeamOutlined style={{ fontSize: iconSize.hero, color: colors.brand.accent }} />}
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
