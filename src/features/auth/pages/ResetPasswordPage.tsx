import { CheckCircleFilled, KeyOutlined, LockOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Grid, Input, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useColors, spacing, iconSize } from '../../../lib/theme';
import { AuthImagePanel } from '../components/AuthImagePanel';

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

type Stage = 'checking' | 'ready' | 'invalid' | 'done';

const HEADINGS: Record<Stage, { title: string; subtitle: string }> = {
  checking: { title: 'Choose a new password', subtitle: 'Checking your reset link…' },
  ready: { title: 'Choose a new password', subtitle: 'Pick something you haven’t used here before' },
  invalid: { title: 'Reset link expired', subtitle: 'You’ll need a fresh link to continue' },
  done: { title: 'Password updated', subtitle: 'You’re signed in with your new password' },
};

// Supabase puts link errors (e.g. otp_expired) in the URL fragment, or the
// query string for some flows. Read them before supabase-js tidies the URL.
const linkErrorFromUrl = (): string | null => {
  const params = new URLSearchParams(window.location.hash.slice(1) || window.location.search);
  const description = params.get('error_description');
  if (!params.get('error') && !description) return null;
  return description?.replace(/\+/g, ' ') ?? 'This reset link is invalid.';
};

/**
 * Landing page for the email link from ForgotPasswordPage
 * (authService.forgotPassword → redirectTo /reset-password).
 * supabase-js (implicit flow, detectSessionInUrl) turns the link into a
 * recovery session; this page then sets the new password.
 */
export const ResetPasswordPage = () => {
  const [linkError] = useState(linkErrorFromUrl);
  const [stage, setStage] = useState<Stage>(linkError ? 'invalid' : 'checking');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const colors = useColors();
  const screens = useBreakpoint();
  const navigate = useNavigate();

  useEffect(() => {
    if (linkError) return;
    let cancelled = false;
    // getSession() waits for supabase-js to finish reading the link
    authService.getSession().then(({ data: { session } }) => {
      if (!cancelled) setStage(session ? 'ready' : 'invalid');
    });
    return () => { cancelled = true; };
  }, [linkError]);

  const onFinish = async ({ password }: { password: string }) => {
    setError('');
    setSaving(true);
    const { error: err } = await authService.updatePassword(password);
    setSaving(false);
    if (err) setError(err.message);
    else setStage('done');
  };

  const headerIcon = stage === 'done'
    ? <CheckCircleFilled style={{ color: colors.semantic.success }} />
    : <KeyOutlined />;

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
              {headerIcon}
            </div>
            <Title level={3} style={{ color: colors.brand.primary, margin: 0 }}>
              {HEADINGS[stage].title}
            </Title>
            <Text type="secondary">{HEADINGS[stage].subtitle}</Text>
          </div>

          {stage === 'checking' && (
            <div style={{ textAlign: 'center', padding: spacing[6] }}><Spin /></div>
          )}

          {stage === 'invalid' && (
            <Alert
              type="warning"
              showIcon
              title="This reset link has expired or was already used"
              description={
                <>
                  {linkError && <><Text type="secondary" style={{ fontSize: 12 }}>{linkError}</Text><br /></>}
                  Reset links work once and only for a limited time. Request a new one and use the latest email.
                </>
              }
              action={<Button size="small" onClick={() => navigate('/forgot-password')}>New link</Button>}
            />
          )}

          {stage === 'ready' && (
            <>
              {error && <Alert type="error" title={error} style={{ marginBottom: spacing[4] }} showIcon />}
              <Form layout="vertical" onFinish={onFinish} size="large" requiredMark={false}>
                <Form.Item name="password" label="New password" rules={[
                  { required: true, message: 'Enter a new password' },
                  { min: 8, message: 'At least 8 characters' },
                ]}>
                  <Input.Password prefix={<LockOutlined />} placeholder="••••••••" autoComplete="new-password" autoFocus />
                </Form.Item>
                <Form.Item name="confirm" label="Confirm new password" dependencies={['password']} rules={[
                  { required: true, message: 'Confirm your new password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) return Promise.resolve();
                      return Promise.reject(new Error('Passwords do not match'));
                    },
                  }),
                ]}>
                  <Input.Password prefix={<LockOutlined />} placeholder="••••••••" autoComplete="new-password" />
                </Form.Item>
                <Button type="primary" htmlType="submit" block loading={saving} style={{ height: 44 }}>
                  Update password
                </Button>
              </Form>
            </>
          )}

          {stage === 'done' && (
            <Button type="primary" block style={{ height: 44 }} onClick={() => navigate('/account')}>
              Go to my account
            </Button>
          )}

          {stage !== 'done' && (
            <div style={{ textAlign: 'center', marginTop: spacing[5] }}>
              <Link to="/login" style={{ color: colors.brand.primary, fontWeight: 600 }}>
                ← Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
