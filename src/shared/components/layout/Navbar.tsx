import {
  LogoutOutlined,
  MenuOutlined,
  MoonOutlined,
  ShoppingCartOutlined,
  SunOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Badge, Button, Drawer, Grid, Menu, Space, Typography } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { useCart } from '../../../features/cart/contexts/CartContext';
import { useColors, useTheme, spacing } from '../../../lib/theme';

const { useBreakpoint } = Grid;
const { Text } = Typography;

export const Navbar = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const colors = useColors();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { key: '/', label: <Link to="/">Home</Link> },
    { key: '/catalogue', label: <Link to="/catalogue">Catalogue</Link> },
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      padding: '10px 16px 6px',
      background: colors.background.page,
    }}>
    <div className="nav-pill" style={{
      background: `linear-gradient(135deg, ${colors.brand.dark} 0%, ${colors.brand.primary} 100%)`,
      borderRadius: 16,
      padding: `0 ${spacing[6]}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 56,
      boxShadow: '0 4px 20px rgba(45,43,85,0.28)',
    }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <Text strong style={{ color: '#fff', fontSize: 20, letterSpacing: 1 }}>
          ✂️ Curtain Studio
        </Text>
      </Link>

      {screens.md ? (
        <Space size="large">
          <Link to="/" style={{ color: '#fff' }}>Home</Link>
          <Link to="/catalogue" style={{ color: '#fff' }}>Catalogue</Link>
          {isAdmin && <Link to="/admin" style={{ color: colors.brand.accent }}>Admin</Link>}

          <Button
            icon={isDark ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff' }}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          />

          <Badge count={totalItems} size="small">
            <Button
              icon={<ShoppingCartOutlined />}
              onClick={() => navigate('/cart')}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff' }}
            />
          </Badge>

          {isAuthenticated ? (
            <Space>
              <Button
                icon={<UserOutlined />}
                onClick={() => navigate('/account')}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff' }}
              />
              <Button
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff' }}
              />
            </Space>
          ) : (
            <Space>
              <Button onClick={() => navigate('/login')} ghost>Sign In</Button>
              <Button
                onClick={() => navigate('/register')}
                style={{ backgroundColor: colors.brand.accent, borderColor: colors.brand.accent }}
                type="primary"
              >
                Register
              </Button>
            </Space>
          )}
        </Space>
      ) : (
        <Space>
          <Button
            icon={isDark ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
            ghost
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          />
          <Badge count={totalItems} size="small">
            <Button icon={<ShoppingCartOutlined />} onClick={() => navigate('/cart')} ghost />
          </Badge>
          <Button icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} ghost />
        </Space>
      )}

    </div>

      <Drawer title="Menu" open={drawerOpen} onClose={() => setDrawerOpen(false)} placement="right">
        <Menu
          mode="inline"
          items={[
            ...navLinks,
            ...(isAdmin ? [{ key: '/admin', label: <Link to="/admin">Admin Panel</Link> }] : []),
            ...(isAuthenticated
              ? [
                  { key: '/account', label: <Link to="/account">My Account</Link> },
                  { key: 'logout', label: <span onClick={handleLogout}>Sign Out</span> },
                ]
              : [
                  { key: '/login', label: <Link to="/login">Sign In</Link> },
                  { key: '/register', label: <Link to="/register">Register</Link> },
                ]),
          ]}
          onClick={() => setDrawerOpen(false)}
        />
      </Drawer>
    </header>
  );
};
