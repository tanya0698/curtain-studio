import {
  LogoutOutlined,
  MenuOutlined,
  MoonOutlined,
  ShoppingCartOutlined,
  SunOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Badge, Button, Drawer, Grid, Menu, Space } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { useCart } from '../../../features/cart/contexts/CartContext';
import { useColors, useTheme, spacing } from '../../../lib/theme';
import { Wordmark } from './Wordmark';

const { useBreakpoint } = Grid;

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

  const linkStyle = { color: colors.text.secondary, fontSize: 14 };
  const iconBtn = { background: colors.background.surface };

  const themeButton = (
    <Button
      shape="circle"
      icon={isDark ? <SunOutlined /> : <MoonOutlined />}
      onClick={toggleTheme}
      style={iconBtn}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    />
  );

  const cartButton = (
    <Badge count={totalItems} size="small" color={colors.brand.primary}>
      <Button shape="circle" icon={<ShoppingCartOutlined />} onClick={() => navigate('/cart')} style={iconBtn} aria-label="Cart" />
    </Badge>
  );

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: colors.background.page,
      borderBottom: `1px solid ${colors.border.strong}`,
    }}>
    <div className="nav-pill" style={{
      maxWidth: 1180,
      margin: '0 auto',
      padding: `0 ${spacing[8]}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 72,
    }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <Wordmark />
      </Link>

      {screens.md ? (
        <Space size="large">
          <Link to="/" style={linkStyle}>Home</Link>
          <Link to="/catalogue" style={linkStyle}>Catalogue</Link>
          <Link to="/quotes/new" style={linkStyle}>Request a quote</Link>
          {isAdmin && <Link to="/admin" style={{ ...linkStyle, color: colors.brand.deep }}>Admin</Link>}

          {themeButton}
          {cartButton}

          {isAuthenticated ? (
            <Space>
              <Button shape="circle" icon={<UserOutlined />} onClick={() => navigate('/account')} style={iconBtn} aria-label="My account" />
              <Button shape="circle" icon={<LogoutOutlined />} onClick={handleLogout} style={iconBtn} aria-label="Sign out" />
            </Space>
          ) : (
            <Space>
              <Button onClick={() => navigate('/login')}>Sign In</Button>
              <Button type="primary" onClick={() => navigate('/register')}>Register</Button>
            </Space>
          )}
        </Space>
      ) : (
        <Space>
          {themeButton}
          {cartButton}
          <Button shape="circle" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} style={iconBtn} aria-label="Menu" />
        </Space>
      )}

    </div>

      <Drawer title="Menu" open={drawerOpen} onClose={() => setDrawerOpen(false)} placement="right">
        <Menu
          mode="inline"
          items={[
            ...navLinks,
            { key: '/quotes/new', label: <Link to="/quotes/new">Request a quote</Link> },
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
