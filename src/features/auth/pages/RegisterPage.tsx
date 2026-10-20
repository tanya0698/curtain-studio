import { LockOutlined, MailOutlined, PhoneOutlined, UserAddOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Col, Form, Grid, Input, Row, Typography } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useColors, spacing, iconSize } from '../../../lib/theme';
import { AuthImagePanel } from '../components/AuthImagePanel';

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const colors = useColors();
  const screens = useBreakpoint();

  const onFinish = async (values: {
    full_name: string;
    email: string;
    phone?: string;
    password: string;
  }) => {
    setError('');
    setLoading(true);
    try {
      await register(values);
      navigate('/login?registered=true');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fi = { marginBottom: 10 };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {screens.md && <AuthImagePanel />}

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.background.surface,
        padding: `${spacing[5]}px ${spacing[6]}px`,
        overflow: 'hidden',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: spacing[4] }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: colors.background.muted,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: iconSize.lg, color: colors.brand.primary, flexShrink: 0,
            }}>
              <UserAddOutlined />
            </div>
            <div>
              <Title level={4} style={{ color: colors.brand.primary, margin: 0, lineHeight: 1.2 }}>
                Create Account
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>Join Curtain Studio today</Text>
            </div>
          </div>

          {error && <Alert type="error" message={error} style={{ marginBottom: spacing[3] }} showIcon />}

          <Form layout="vertical" onFinish={onFinish} size="middle">
            <Form.Item name="full_name" label="Full Name" style={fi}
              rules={[{ required: true, message: 'Name is required' }]}>
              <Input prefix={<UserOutlined />} placeholder="Jane Smith" />
            </Form.Item>

            <Form.Item name="email" label="Email" style={fi} rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Enter a valid email' },
            ]}>
              <Input prefix={<MailOutlined />} placeholder="you@example.com" />
            </Form.Item>

            <Form.Item name="phone" label="Phone (optional)" style={fi}>
              <Input prefix={<PhoneOutlined />} placeholder="+263 77 000 0000" />
            </Form.Item>

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item name="password" label="Password" style={fi} rules={[
                  { required: true, message: 'Required' },
                  { min: 8, message: 'Min 8 chars' },
                ]}>
                  <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="confirm" label="Confirm" style={fi} dependencies={['password']}
                  rules={[
                    { required: true, message: 'Required' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) return Promise.resolve();
                        return Promise.reject(new Error('Passwords do not match'));
                      },
                    }),
                  ]}>
                  <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
                </Form.Item>
              </Col>
            </Row>

            <Button type="primary" htmlType="submit" block loading={loading}
              style={{ backgroundColor: colors.brand.primary, borderColor: colors.brand.primary, height: 40, marginTop: spacing[2] }}>
              Create Account
            </Button>
          </Form>

          <div style={{ textAlign: 'center', marginTop: spacing[3] }}>
            <Text type="secondary" style={{ fontSize: 13 }}>Already have an account? </Text>
            <Link to="/login" style={{ color: colors.brand.primary, fontWeight: 600, fontSize: 13 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
