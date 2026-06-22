import { CheckCircleOutlined, CreditCardOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Divider, Radio, Row, Space, Switch, Typography } from 'antd';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../cart/contexts/CartContext';
import { supabase } from '../../../lib/api/supabaseClient';
import { useAuth } from '../../auth/hooks/useAuth';
import { useColors, radius, shadows, spacing } from '../../../lib/theme';
import { CustomerLayout } from '../../../shared/components/layout/CustomerLayout';

const { Title, Text } = Typography;

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID as string;

interface StripeFormProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (msg: string) => void;
}

const StripeForm = ({ amount, onSuccess, onError }: StripeFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const colors = useColors();

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/account/orders` },
      redirect: 'if_required',
    });
    setLoading(false);
    if (error) {
      onError(error.message ?? 'Payment failed');
    } else if (paymentIntent) {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <PaymentElement />
      <Button
        type="primary"
        size="large"
        block
        loading={loading}
        onClick={handleSubmit}
        icon={<CreditCardOutlined />}
        style={{ backgroundColor: colors.brand.primary, borderColor: colors.brand.primary, marginTop: spacing[4] }}
      >
        Pay ${(amount / 100).toFixed(2)} with Card
      </Button>
    </Space>
  );
};

export const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const colors = useColors();
  const quoteId = (location.state as { quoteId?: string } | null)?.quoteId;

  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [useDeposit, setUseDeposit] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [stripeReady, setStripeReady] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isQuoteCheckout = !!quoteId;
  const chargeAmount = useDeposit ? totalPrice * 0.5 : totalPrice;
  const chargeAmountCents = Math.round(chargeAmount * 100);

  const initStripe = async () => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-payment-intent', {
        body: { amount: chargeAmountCents, currency: 'usd' },
      });
      if (fnError) throw fnError;
      setClientSecret(data.clientSecret);
      setStripeReady(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to initialise payment');
    }
  };

  const createOrder = async (paymentIntentId: string, method: 'stripe' | 'paypal') => {
    if (!user) return;
    const { data: order, error: orderError } = await supabase.from('orders').insert({
      customer_id: user.id,
      status: 'paid',
      total_amount: totalPrice,
      deposit_amount: useDeposit ? totalPrice * 0.5 : null,
      payment_method: method,
      payment_intent_id: paymentIntentId,
    }).select().single();

    if (orderError) throw orderError;

    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.product.starting_price,
    }));
    await supabase.from('order_items').insert(orderItems);

    if (quoteId) {
      await supabase.from('quotes').update({ status: 'accepted' }).eq('id', quoteId);
    }

    clearCart();
    setSuccess(true);
    setTimeout(() => navigate('/account'), 2000);
  };

  if (success) {
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

  if (items.length === 0 && !isQuoteCheckout) {
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
              <Radio.Group value={paymentMethod} onChange={e => { setPaymentMethod(e.target.value); setStripeReady(false); }}>
                <Space direction="vertical">
                  <Radio value="stripe">💳 Credit / Debit Card (Stripe)</Radio>
                  <Radio value="paypal">🅿️ PayPal</Radio>
                </Space>
              </Radio.Group>

              <Divider />

              {isQuoteCheckout && (
                <div style={{ marginBottom: spacing[4] }}>
                  <Space align="center">
                    <Switch checked={useDeposit} onChange={setUseDeposit} />
                    <Text>Pay 50% deposit now (${(totalPrice * 0.5).toFixed(2)}), rest on delivery</Text>
                  </Space>
                </div>
              )}

              {paymentMethod === 'stripe' && (
                <>
                  {!stripeReady ? (
                    <Button
                      type="primary"
                      block
                      size="large"
                      onClick={initStripe}
                      style={{ backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }}
                    >
                      Continue with Card Payment
                    </Button>
                  ) : clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <StripeForm
                        amount={chargeAmountCents}
                        onSuccess={id => createOrder(id, 'stripe')}
                        onError={setError}
                      />
                    </Elements>
                  ) : null}
                </>
              )}

              {paymentMethod === 'paypal' && (
                <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'USD' }}>
                  <PayPalButtons
                    style={{ layout: 'vertical' }}
                    createOrder={(_data, actions) =>
                      actions.order.create({
                        intent: 'CAPTURE',
                        purchase_units: [{ amount: { currency_code: 'USD', value: chargeAmount.toFixed(2) } }],
                      })
                    }
                    onApprove={async (_data, actions) => {
                      if (!actions.order) return;
                      const order = await actions.order.capture();
                      await createOrder(order.id ?? '', 'paypal');
                    }}
                    onError={() => setError('PayPal payment failed. Please try again.')}
                  />
                </PayPalScriptProvider>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card style={{ borderRadius: radius.lg, boxShadow: shadows.sm, position: 'sticky', top: 80 }}>
              <Title level={4}>Order Summary</Title>
              <Divider />
              {items.map(item => (
                <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing[2] }}>
                  <Text type="secondary">{item.product.name} × {item.quantity}</Text>
                  <Text>${(item.product.starting_price * item.quantity).toFixed(2)}</Text>
                </div>
              ))}
              <Divider />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing[2] }}>
                <Text>Subtotal</Text>
                <Text>${totalPrice.toFixed(2)}</Text>
              </div>
              {useDeposit && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing[2] }}>
                  <Text type="secondary">Deposit (50%)</Text>
                  <Text type="secondary">−${(totalPrice * 0.5).toFixed(2)}</Text>
                </div>
              )}
              <Divider />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong style={{ fontSize: 16 }}>{useDeposit ? 'Pay Now' : 'Total'}</Text>
                <Text strong style={{ fontSize: 18, color: colors.brand.primary }}>${chargeAmount.toFixed(2)}</Text>
              </div>
              {useDeposit && (
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: spacing[2] }}>
                  Balance of ${(totalPrice * 0.5).toFixed(2)} due on delivery
                </Text>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </CustomerLayout>
  );
};
