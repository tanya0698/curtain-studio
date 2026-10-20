// Landing page for Paynow's redirect-flow `returnurl` — the browser lands
// here after a card/ZIMSWITCH payment on Paynow's hosted page. The webhook
// (paynow-status, called by Paynow itself) may arrive slightly after this
// redirect, so we poll a few times before settling on a final state.
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { Button, Spin, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../../cart/contexts/CartContext';
import { checkoutService } from '../services/checkoutService';
import { useColors, spacing, iconSize } from '../../../lib/theme';
import { CustomerLayout } from '../../../shared/components/layout/CustomerLayout';

const { Title, Text } = Typography;

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 10; // ~30s — the webhook usually beats the browser redirect anyway

type Result = 'checking' | 'paid' | 'cancelled' | 'unknown';

export const CheckoutCompletePage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const navigate = useNavigate();
  const colors = useColors();
  const { clearCart } = useCart();
  const [result, setResult] = useState<Result>(orderId ? 'checking' : 'unknown');
  const pollingRef = useRef(true);

  useEffect(() => {
    if (!orderId) return;

    let attempts = 0;
    const tick = async () => {
      if (!pollingRef.current) return;
      attempts += 1;
      try {
        const status = await checkoutService.pollStatus(orderId);
        if (status === 'paid') {
          clearCart();
          setResult('paid');
          setTimeout(() => navigate('/account'), 2500);
          return;
        }
        if (status === 'cancelled') {
          setResult('cancelled');
          return;
        }
      } catch {
        // keep trying until attempts run out
      }
      if (attempts >= MAX_POLL_ATTEMPTS) {
        setResult('unknown');
        return;
      }
      setTimeout(tick, POLL_INTERVAL_MS);
    };

    tick();
    return () => { pollingRef.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return (
    <CustomerLayout>
      <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center', padding: spacing[6] }}>
        {result === 'checking' && (
          <>
            <Spin size="large" />
            <Title level={3} style={{ marginTop: spacing[4] }}>Finalizing your payment…</Title>
            <Text type="secondary">Please wait while we confirm your payment with Paynow.</Text>
          </>
        )}

        {result === 'paid' && (
          <>
            <CheckCircleFilled style={{ fontSize: iconSize.jumbo, color: colors.semantic.success }} />
            <Title level={3} style={{ marginTop: spacing[4] }}>Payment Successful!</Title>
            <Text type="secondary">Your order has been placed. Redirecting to your account...</Text>
          </>
        )}

        {result === 'cancelled' && (
          <>
            <CloseCircleFilled style={{ fontSize: iconSize.jumbo, color: colors.semantic.error }} />
            <Title level={3} style={{ marginTop: spacing[4] }}>Payment Cancelled</Title>
            <Text type="secondary">Your payment wasn't completed. You can try again from your cart.</Text>
            <div style={{ marginTop: spacing[4] }}>
              <Button type="primary" onClick={() => navigate('/cart')}>Back to Cart</Button>
            </div>
          </>
        )}

        {result === 'unknown' && (
          <>
            <Title level={3}>Still processing</Title>
            <Text type="secondary">
              We haven't heard back from Paynow yet. If you completed the payment, it will reflect in
              My Account shortly.
            </Text>
            <div style={{ marginTop: spacing[4] }}>
              <Button type="primary" onClick={() => navigate('/account')}>Go to My Account</Button>
            </div>
          </>
        )}
      </div>
    </CustomerLayout>
  );
};
