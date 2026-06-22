import {
  AppstoreOutlined,
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  ShoppingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Typography } from 'antd';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { useColors, spacing } from '../../../lib/theme';

const { Sider, Content } = Layout;
const { Text } = Typography;

const MENU_ITEMS = [
  { key: '/admin', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/admin/orders', icon: <ShoppingOutlined />, label: 'Orders' },
  { key: '/admin/quotes', icon: <FileTextOutlined />, label: 'Quotes' },
  { key: '/admin/catalogue', icon: <AppstoreOutlined />, label: 'Catalogue' },
  { key: '/admin/customers', icon: <TeamOutlined />, label: 'Customers' },
];

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const colors = useColors();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={220}
        style={{ background: colors.brand.dark, position: 'fixed', height: '100vh', zIndex: 100 }}
      >
        <div style={{ padding: `${spacing[6]}px ${spacing[4]}px`, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Text strong style={{ color: '#fff', fontSize: 16 }}>✂️ Admin Panel</Text>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ background: 'transparent', border: 'none', marginTop: spacing[2] }}
          items={MENU_ITEMS.map(item => ({
            ...item,
            onClick: () => navigate(item.key),
            style: { color: 'rgba(255,255,255,0.85)' },
          }))}
        />

        <div style={{ position: 'absolute', bottom: 0, width: '100%', padding: spacing[4] }}>
          <Menu
            theme="dark"
            mode="inline"
            style={{ background: 'transparent', border: 'none' }}
            items={[{
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'Sign Out',
              onClick: async () => { await logout(); navigate('/'); },
              style: { color: 'rgba(255,255,255,0.65)' },
            }]}
          />
        </div>
      </Sider>

      <Layout style={{ marginLeft: 220 }}>
        <Content style={{ padding: spacing[8], background: colors.background.page, minHeight: '100vh' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
