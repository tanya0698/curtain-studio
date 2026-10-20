import { MailOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Grid, Input, Typography } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useColors, spacing, iconSize } from '../../../lib/theme';
import { AuthImagePanel } from '../components/AuthImagePanel';

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

export const ForgotPasswordPage = () => {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const colors = useColors();
  const screens = useBreakpoint();

  const onFinish = async ({ email }: { email: string }) => {
    setError('');
    setLoading(true);
    try {
      const { error: err } = await authService.forgotPassword(email);
      if (err) throw err;
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
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
              fontSize: iconSize.lg, color: colors.brand.primary, margin: '0 auto 14px',
            }}>
              <MailOutlined />
            </div>
            <Title level={3} style={{ color: colors.brand.primary, margin: 0 }}>
              Reset Password
            </Title>
            <Text type="secondary">We'll send you a link to reset your password</Text>
          </div>

          {sent ? (
            <Alert
              type="success"
              message="Check your email"
              description="If an account exists with that email, you'll receive a reset link shortly."
              showIcon
            />
          ) : (
            <>
              {error && <Alert type="error" message={error} style={{ marginBottom: spacing[4] }} showIcon />}
              <Form layout="vertical" onFinish={onFinish} size="large">
                <Form.Item name="email" label="Email" rules={[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Enter a valid email' },
                ]}>
                  <Input prefix={<MailOutlined />} placeholder="you@example.com" />
                </Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}
                  style={{ backgroundColor: colors.brand.primary, borderColor: colors.brand.primary, height: 44 }}>
                  Send Reset Link
                </Button>
              </Form>
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: spacing[5] }}>
            <Link to="/login" style={{ color: colors.brand.primary, fontWeight: 600 }}>
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
