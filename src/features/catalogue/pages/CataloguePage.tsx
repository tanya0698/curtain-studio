import { Col, Empty, Row, Segmented, Skeleton, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { catalogueService } from '../services/catalogueService';
import type { Product, ProductCategory } from '../../../shared/types';
import { useColors, spacing } from '../../../lib/theme';
import { CustomerLayout } from '../../../shared/components/layout/CustomerLayout';

const { Title, Text } = Typography;

const CATEGORY_ICONS: Record<string, string> = {
  'custom-curtains': '🎨',
  'ready-made': '🛍️',
  fabrics: '🧵',
  alterations: '✂️',
};

export const CataloguePage = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeSlug, setActiveSlug] = useState('all');
  const [loading, setLoading] = useState(true);
  const colors = useColors();

  useEffect(() => {
    catalogueService.getCategories().then(({ data }) => {
      setCategories(data ?? []);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    catalogueService.getProducts(activeSlug).then(({ data }) => {
      setProducts(data ?? []);
      setLoading(false);
    });
  }, [activeSlug]);

  const segmentOptions = [
    { label: '🪟 All', value: 'all' },
    ...categories.map(c => ({
      label: `${CATEGORY_ICONS[c.slug] ?? ''} ${c.name}`,
      value: c.slug,
    })),
  ];

  return (
    <CustomerLayout>
      <div style={{ background: colors.brand.dark, padding: `${spacing[12]}px ${spacing[6]}px` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Title style={{ color: '#fff', margin: 0 }}>Our Catalogue</Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
            Custom designs, ready-made curtains, fabrics & alterations
          </Text>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: `${spacing[8]}px ${spacing[6]}px` }}>
        <div style={{ marginBottom: spacing[6], overflowX: 'auto' }}>
          <Segmented
            options={segmentOptions}
            value={activeSlug}
            onChange={v => setActiveSlug(v as string)}
            size="large"
          />
        </div>

        {loading ? (
          <Row gutter={[24, 24]}>
            {[...Array(6)].map((_, i) => (
              <Col key={i} xs={24} sm={12} lg={8}>
                <Skeleton active style={{ height: 340 }} />
              </Col>
            ))}
          </Row>
        ) : products.length === 0 ? (
          <Empty description="No products found in this category" />
        ) : (
          <Row gutter={[24, 24]}>
            {products.map(product => (
              <Col key={product.id} xs={24} sm={12} lg={8}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </CustomerLayout>
  );
};
