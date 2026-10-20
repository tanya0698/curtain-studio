import { DeleteOutlined, MinusOutlined, PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Button, Col, Divider, Empty, InputNumber, Row, Space, Typography } from 'antd';
import { ImagePlaceholder } from '../../../shared/components/ImagePlaceholder';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useColors, radius, shadows, spacing, iconSize } from '../../../lib/theme';
import { CustomerLayout } from '../../../shared/components/layout/CustomerLayout';

const { Title, Text } = Typography;

export const CartPage = () => {
  const { items, totalPrice, updateQuantity, removeItem, totalItems } = useCart();
  const navigate = useNavigate();
  const colors = useColors();

  return (
    <CustomerLayout>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: `${spacing[8]}px ${spacing[6]}px` }}>
        <Title level={2}>
          <ShoppingCartOutlined style={{ marginRight: spacing[2] }} />
          Your Cart {totalItems > 0 && <Text type="secondary" style={{ fontSize: 16 }}>({totalItems} items)</Text>}
        </Title>

        {items.length === 0 ? (
          <Empty
            image={<ShoppingCartOutlined style={{ fontSize: iconSize.jumbo, color: colors.brand.accent }} />}
            description="Your cart is empty"
          >
            <Button type="primary" onClick={() => navigate('/catalogue')}
              style={{ backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }}>
              Browse Catalogue
            </Button>
          </Empty>
        ) : (
          <Row gutter={[32, 16]}>
            <Col xs={24} lg={16}>
              <Space direction="vertical" style={{ width: '100%' }} size={spacing[3]}>
                {items.map(item => (
                  <div key={item.product.id} style={{
                    background: colors.background.surface,
                    borderRadius: radius.lg,
                    padding: spacing[4],
                    boxShadow: shadows.sm,
                    display: 'flex',
                    gap: spacing[4],
                    alignItems: 'center',
                  }}>
                    <div style={{
                      width: 80, height: 80, flexShrink: 0,
                      borderRadius: radius.md,
                      background: colors.brand.light,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden',
                    }}>
                      {item.product.images?.[0]
                        ? <img src={item.product.images[0]} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <ImagePlaceholder size="lg" />
                      }
                    </div>

                    <div style={{ flex: 1 }}>
                      <Text strong>{item.product.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        ${item.product.starting_price} {item.product.unit}
                      </Text>
                      {item.measurements && (
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {item.measurements.width}cm × {item.measurements.drop}cm
                          </Text>
                        </div>
                      )}
                    </div>

                    <Space>
                      <Button size="small" icon={<MinusOutlined />} onClick={() => updateQuantity(item.product.id, item.quantity - 1)} />
                      <InputNumber
                        min={1}
                        value={item.quantity}
                        onChange={v => updateQuantity(item.product.id, v ?? 1)}
                        style={{ width: 60 }}
                        size="small"
                      />
                      <Button size="small" icon={<PlusOutlined />} onClick={() => updateQuantity(item.product.id, item.quantity + 1)} />
                    </Space>

                    <Text strong style={{ minWidth: 80, textAlign: 'right' }}>
                      ${(item.product.starting_price * item.quantity).toFixed(2)}
                    </Text>

                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      type="text"
                      onClick={() => removeItem(item.product.id)}
                    />
                  </div>
                ))}
              </Space>
            </Col>

            <Col xs={24} lg={8}>
              <div style={{
                background: colors.background.surface,
                borderRadius: radius.lg,
                padding: spacing[6],
                boxShadow: shadows.md,
                position: 'sticky',
                top: 80,
              }}>
                <Title level={4}>Order Summary</Title>
                <Divider />
                {items.map(item => (
                  <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing[2] }}>
                    <Text type="secondary">{item.product.name} × {item.quantity}</Text>
                    <Text>${(item.product.starting_price * item.quantity).toFixed(2)}</Text>
                  </div>
                ))}
                <Divider />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing[6] }}>
                  <Text strong style={{ fontSize: 16 }}>Total</Text>
                  <Text strong style={{ fontSize: 18, color: colors.brand.primary }}>${totalPrice.toFixed(2)}</Text>
                </div>
                <Button
                  type="primary"
                  size="large"
                  block
                  style={{ backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }}
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                </Button>
                <Button block style={{ marginTop: spacing[2] }} onClick={() => navigate('/catalogue')}>
                  Continue Shopping
                </Button>
              </div>
            </Col>
          </Row>
        )}
      </div>
    </CustomerLayout>
  );
};
