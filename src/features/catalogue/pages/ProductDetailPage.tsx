import {
  ArrowLeftOutlined,
  MessageOutlined,
  MinusOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { Button, Col, Form, InputNumber, message, Row, Skeleton, Space, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { catalogueService } from '../services/catalogueService';
import { useCart } from '../../cart/contexts/CartContext';
import { useAuth } from '../../auth/hooks/useAuth';
import type { Product } from '../../../shared/types';
import { useColors, radius, shadows, spacing } from '../../../lib/theme';
import { CustomerLayout } from '../../../shared/components/layout/CustomerLayout';

const { Title, Text, Paragraph } = Typography;

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [width, setWidth] = useState<number | null>(null);
  const [drop, setDrop] = useState<number | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const colors = useColors();

  useEffect(() => {
    if (!id) return;
    catalogueService.getProductById(id).then(({ data }) => {
      setProduct(data);
      setLoading(false);
    });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity, width && drop ? { width, drop, unit: 'cm' } : undefined);
    message.success(`${product.name} added to cart`);
  };

  const handleQuoteRequest = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/quotes/new', { state: { productId: product?.id } });
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: `${spacing[8]}px ${spacing[6]}px` }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      </CustomerLayout>
    );
  }

  if (!product) {
    return (
      <CustomerLayout>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: `${spacing[8]}px ${spacing[6]}px`, textAlign: 'center' }}>
          <Text>Product not found.</Text>
          <Button onClick={() => navigate('/catalogue')} style={{ marginTop: spacing[4] }}>Back to Catalogue</Button>
        </div>
      </CustomerLayout>
    );
  }

  const needsMeasurements = product.category?.slug === 'fabrics';

  return (
    <CustomerLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: `${spacing[8]}px ${spacing[6]}px` }}>
        <Button
          icon={<ArrowLeftOutlined />}
          type="link"
          onClick={() => navigate('/catalogue')}
          style={{ color: colors.brand.primary, marginBottom: spacing[4], padding: 0 }}
        >
          Back to Catalogue
        </Button>

        <Row gutter={[48, 32]}>
          <Col xs={24} md={12}>
            <div style={{
              borderRadius: radius.xl,
              overflow: 'hidden',
              boxShadow: shadows.lg,
              background: colors.brand.light,
              minHeight: 360,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {product.images?.[activeImage] ? (
                <img src={product.images[activeImage]} alt={product.name} style={{ width: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 80 }}>🪟</span>
              )}
            </div>
            {product.images?.length > 1 && (
              <Space style={{ marginTop: spacing[2] }}>
                {product.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    onClick={() => setActiveImage(i)}
                    style={{
                      width: 64, height: 64, objectFit: 'cover',
                      borderRadius: radius.md,
                      cursor: 'pointer',
                      border: i === activeImage ? `2px solid ${colors.brand.primary}` : '2px solid transparent',
                    }}
                  />
                ))}
              </Space>
            )}
          </Col>

          <Col xs={24} md={12}>
            <Space direction="vertical" size={spacing[3]} style={{ width: '100%' }}>
              <div>
                <Tag color={colors.brand.primary}>{product.category?.name}</Tag>
                {product.is_quotable && <Tag color={colors.brand.accent}>Custom Order</Tag>}
              </div>

              <Title level={2} style={{ margin: 0 }}>{product.name}</Title>

              <Space align="center">
                <TagOutlined style={{ color: colors.brand.primary }} />
                <Text strong style={{ fontSize: 24, color: colors.brand.primary }}>
                  From ${product.starting_price}
                </Text>
                <Text type="secondary">{product.unit}</Text>
              </Space>

              <Paragraph style={{ color: colors.text.secondary, fontSize: 15 }}>
                {product.description}
              </Paragraph>

              {product.is_purchasable && (
                <Form layout="vertical">
                  <Form.Item label="Quantity">
                    <Space>
                      <Button icon={<MinusOutlined />} onClick={() => setQuantity(q => Math.max(1, q - 1))} />
                      <InputNumber min={1} value={quantity} onChange={v => setQuantity(v ?? 1)} style={{ width: 80 }} />
                      <Button icon={<PlusOutlined />} onClick={() => setQuantity(q => q + 1)} />
                    </Space>
                  </Form.Item>

                  {needsMeasurements && (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Width (cm)">
                          <InputNumber min={1} value={width ?? undefined} onChange={v => setWidth(v)} style={{ width: '100%' }} placeholder="e.g. 200" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Drop / Length (cm)">
                          <InputNumber min={1} value={drop ?? undefined} onChange={v => setDrop(v)} style={{ width: '100%' }} placeholder="e.g. 250" />
                        </Form.Item>
                      </Col>
                    </Row>
                  )}

                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    block
                    onClick={handleAddToCart}
                    style={{ backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }}
                  >
                    Add to Cart
                  </Button>
                </Form>
              )}

              {product.is_quotable && (
                <Button
                  size="large"
                  icon={<MessageOutlined />}
                  block
                  onClick={handleQuoteRequest}
                  style={{
                    backgroundColor: colors.brand.accent,
                    borderColor: colors.brand.accent,
                    color: '#fff',
                  }}
                >
                  Request a Quote
                </Button>
              )}

              {product.is_quotable && (
                <Text type="secondary" style={{ fontSize: 13 }}>
                  * Custom orders require a quote. Final price is based on your measurements and fabric choice.
                </Text>
              )}
            </Space>
          </Col>
        </Row>
      </div>
    </CustomerLayout>
  );
};
