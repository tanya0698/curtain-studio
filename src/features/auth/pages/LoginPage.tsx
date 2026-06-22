import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Grid, Input, Typography } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useColors, spacing } from '../../../lib/theme';
import { AuthImagePanel } from '../components/AuthImagePanel';

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const colors = useColors();
  const screens = useBreakpoint();

  const onFinish = async (values: { email: string; password: string }) => {
    setError('');
    setLoading(true);
    try {
      await login(values);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {screens.md && <AuthImagePanel />}

      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.background.surface,
        padding: `${spacing[8]}px ${spacing[6]}px`,
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: spacing[7] }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: colors.background.muted,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, margin: '0 auto 14px',
            }}>
              ✂️
            </div>
            <Title level={3} style={{ color: colors.brand.primary, margin: 0 }}>
              Welcome back
            </Title>
            <Text type="secondary">Sign in to your account</Text>
          </div>

          {error && <Alert type="error" message={error} style={{ marginBottom: spacing[4] }} showIcon />}

          <Form layout="vertical" onFinish={onFinish} size="large">
            <Form.Item name="email" label="Email" rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Enter a valid email' },
            ]}>
              <Input prefix={<MailOutlined />} placeholder="you@example.com" />
            </Form.Item>

            <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Password is required' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
            </Form.Item>

            <div style={{ textAlign: 'right', marginBottom: spacing[4], marginTop: -spacing[3] }}>
              <Link to="/forgot-password" style={{ color: colors.brand.primary, fontSize: 13 }}>
                Forgot password?
              </Link>
            </div>

            <Button type="primary" htmlType="submit" block loading={loading}
              style={{ backgroundColor: colors.brand.primary, borderColor: colors.brand.primary, height: 44 }}>
              Sign In
            </Button>
          </Form>

          <div style={{ textAlign: 'center', marginTop: spacing[5] }}>
            <Text type="secondary">Don't have an account? </Text>
            <Link to="/register" style={{ color: colors.brand.primary, fontWeight: 600 }}>Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
