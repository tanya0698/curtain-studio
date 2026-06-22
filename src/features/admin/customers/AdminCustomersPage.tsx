import { Table, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/api/supabaseClient';
import { AdminLayout } from '../layout/AdminLayout';
import type { Profile } from '../../../shared/types';

const { Title } = Typography;

export const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

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

      <Table
        dataSource={customers}
        rowKey="id"
        loading={loading}
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
    </AdminLayout>
  );
};
