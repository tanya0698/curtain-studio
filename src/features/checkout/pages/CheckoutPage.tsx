import { CheckCircleOutlined, CreditCardOutlined, MobileOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Divider, Input, Radio, Row, Space, Spin, Switch, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../cart/contexts/CartContext';
import { quotesService } from '../../quotes/services/quotesService';
import { checkoutService } from '../services/checkoutService';
import { useColors, radius, shadows, spacing } from '../../../lib/theme';
import { CustomerLayout } from '../../../shared/components/layout/CustomerLayout';
import type { Quote } from '../../../shared/types';

const { Title, Text } = Typography;

type PaynowChannel = 'ecocash' | 'onemoney' | 'card';
type Phase = 'form' | 'awaiting' | 'success' | 'timeout';

const POLL_INTERVAL_MS = 4000;
const MAX_POLL_ATTEMPTS = 22; // ~88s of polling before giving up

export const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const colors = useColors();
  const quoteId = (location.state as { quoteId?: string } | null)?.quoteId;
  const isQuoteCheckout = !!quoteId;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(isQuoteCheckout);
  const [paymentMethod, setPaymentMethod] = useState<PaynowChannel>('ecocash');
  const [phone, setPhone] = useState('');
  const [useDeposit, setUseDeposit] = useState(false);
  const [phase, setPhase] = useState<Phase>('form');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [instructions, setInstructions] = useState('');
  const pollingRef = useRef(false);

  useEffect(() => {
    if (!isQuoteCheckout) return;
    quotesService.getQuoteById(quoteId!).then(({ data, error: fetchError }) => {
      if (fetchError || !data) {
        setError('Could not load your quote. Please try again from your account.');
      } else {
        setQuote(data);
      }
      setQuoteLoading(false);
    });
  }, [isQuoteCheckout, quoteId]);

  useEffect(() => () => { pollingRef.current = false; }, []);

  const subtotal = isQuoteCheckout ? (quote?.quoted_price ?? 0) : totalPrice;
  const depositAmount = useDeposit ? subtotal * 0.5 : 0;
  const chargeAmount = useDeposit ? depositAmount : subtotal;

  const startPolling = (orderId: string) => {
    pollingRef.current = true;
    let attempts = 0;

    const tick = async () => {
      if (!pollingRef.current) return;
      attempts += 1;
      try {
        const status = await checkoutService.pollStatus(orderId);
        if (status === 'paid') {
          pollingRef.current = false;
          clearCart();
          setPhase('success');
          setTimeout(() => navigate('/account'), 2000);
          return;
        }
        if (status === 'cancelled') {
          pollingRef.current = false;
          setError('Payment was cancelled or declined. Please try again.');
          setPhase('form');
          return;
        }
      } catch {
        // transient network hiccup — keep polling until we run out of attempts
      }
      if (attempts >= MAX_POLL_ATTEMPTS) {
        pollingRef.current = false;
        setPhase('timeout');
        return;
      }
      setTimeout(tick, POLL_INTERVAL_MS);
    };

    tick();
  };

  const handleSubmit = async () => {
    setError('');
    if (paymentMethod !== 'card' && !phone.trim()) {
      setError('Please enter your mobile money number.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await checkoutService.initiate({
        quoteId: isQuoteCheckout ? quoteId : undefined,
        cartItems: isQuoteCheckout
          ? undefined
          : items.map(item => ({
              productId: item.product.id,
              quantity: item.quantity,
              measurements: item.measurements,
            })),
        useDeposit,
        channel: paymentMethod === 'card' ? 'redirect' : 'mobile',
        method: paymentMethod === 'card' ? undefined : paymentMethod,
        phone: paymentMethod === 'card' ? undefined : phone.trim(),
      });

      if (result.channel === 'redirect' && result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }

      setInstructions(result.instructions ?? 'Check your phone and enter your PIN to approve the payment.');
      setPhase('awaiting');
      startPolling(result.orderId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (phase === 'success') {
    return (
      <CustomerLayout>
        <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center', padding: spacing[6] }}>
          <CheckCircleOutlined style={{ fontSize: 64, color: colors.semantic.success }} />
          <Title level={3} style={{ marginTop: spacing[4] }}>Payment Successful!</Title>
          <Text type="secondary">Your order has been placed. Redirecting to your account...</Text>
        </div>
      </CustomerLayout>
    );
  }

  if (phase === 'awaiting') {
    return (
      <CustomerLayout>
        <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center', padding: spacing[6] }}>
          <Spin size="large" />
          <Title level={3} style={{ marginTop: spacing[4] }}>Waiting for confirmation</Title>
          <Text type="secondary">{instructions}</Text>
        </div>
      </CustomerLayout>
    );
  }

  if (phase === 'timeout') {
    return (
      <CustomerLayout>
        <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center', padding: spacing[6] }}>
          <Title level={3}>Still processing</Title>
          <Text type="secondary">
            This is taking longer than expected. If you approved the payment on your phone, it will
            reflect in My Account shortly. Otherwise, please try again.
          </Text>
          <div style={{ marginTop: spacing[4] }}>
            <Space>
              <Button onClick={() => navigate('/account')}>Go to My Account</Button>
              <Button type="primary" onClick={() => setPhase('form')}>Try Again</Button>
            </Space>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!isQuoteCheckout && items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <CustomerLayout>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: `${spacing[8]}px ${spacing[6]}px` }}>
        <Title level={2}>Checkout</Title>

        {error && <Alert type="error" message={error} style={{ marginBottom: spacing[4] }} showIcon />}

        <Row gutter={[32, 24]}>
          <Col xs={24} lg={14}>
            <Card style={{ borderRadius: radius.lg, boxShadow: shadows.sm }}>
              <Title level={4}>Payment Method</Title>
              <Radio.Group
                value={paymentMethod}
                onChange={e => { setPaymentMethod(e.target.value); setError(''); }}
              >
                <Space direction="vertical">
                  <Radio value="ecocash"><MobileOutlined /> EcoCash</Radio>
                  <Radio value="onemoney"><MobileOutlined /> OneMoney</Radio>
                  <Radio value="card"><CreditCardOutlined /> Card / ZIMSWITCH (via Paynow)</Radio>
                </Space>
              </Radio.Group>

              {paymentMethod !== 'card' && (
                <div style={{ marginTop: spacing[4] }}>
                  <Text style={{ display: 'block', marginBottom: spacing[1] }}>Mobile money number</Text>
                  <Input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="07XXXXXXXX"
                    size="large"
                  />
                </div>
              )}

              <Divider />

              {isQuoteCheckout && !quoteLoading && quote?.quoted_price != null && (
                <div style={{ marginBottom: spacing[4] }}>
                  <Space align="center">
                    <Switch checked={useDeposit} onChange={setUseDeposit} />
                    <Text>Pay 50% deposit now (${depositAmount.toFixed(2)}), rest on delivery</Text>
                  </Space>
                </div>
              )}

              <Button
                type="primary"
                size="large"
                block
                loading={submitting || quoteLoading}
                disabled={isQuoteCheckout && (quoteLoading || quote?.quoted_price == null)}
                onClick={handleSubmit}
                icon={paymentMethod === 'card' ? <CreditCardOutlined /> : <MobileOutlined />}
                style={{ backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }}
              >
                {paymentMethod === 'card' ? 'Continue to Paynow' : `Pay $${chargeAmount.toFixed(2)}`}
              </Button>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card style={{ borderRadius: radius.lg, boxShadow: shadows.sm, position: 'sticky', top: 80 }}>
              <Title level={4}>Order Summary</Title>
              <Divider />

              {isQuoteCheckout ? (
                quoteLoading ? (
                  <Spin />
                ) : (
                  (quote?.items ?? []).map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing[2] }}>
                      <Text type="secondary">{item.product?.name ?? 'Item'} × {item.quantity}</Text>
                    </div>
                  ))
                )
              ) : (
                items.map(item => (
                  <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing[2] }}>
                    <Text type="secondary">{item.product.name} × {item.quantity}</Text>
                    <Text>${(item.product.starting_price * item.quantity).toFixed(2)}</Text>
                  </div>
                ))
              )}

              <Divider />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing[2] }}>
                <Text>Subtotal</Text>
                <Text>${subtotal.toFixed(2)}</Text>
              </div>
              {useDeposit && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing[2] }}>
                  <Text type="secondary">Deposit (50%)</Text>
                  <Text type="secondary">−${depositAmount.toFixed(2)}</Text>
                </div>
              )}
              <Divider />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong style={{ fontSize: 16 }}>{useDeposit ? 'Pay Now' : 'Total'}</Text>
                <Text strong style={{ fontSize: 18, color: colors.brand.primary }}>${chargeAmount.toFixed(2)}</Text>
              </div>
              {useDeposit && (
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: spacing[2] }}>
                  Balance of ${depositAmount.toFixed(2)} due on delivery
                </Text>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </CustomerLayout>
  );
};
