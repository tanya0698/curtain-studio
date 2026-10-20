import { Col, Empty, Row, Segmented, Skeleton, Typography } from 'antd';
import { useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { catalogueService } from '../services/catalogueService';
import type { Product, ProductCategory } from '../../../shared/types';
import { useColors, spacing } from '../../../lib/theme';
import { CustomerLayout } from '../../../shared/components/layout/CustomerLayout';
import { CATEGORY_ICONS } from '../../../shared/config/categoryIcons';
import { LoadError } from '../../../shared/components/LoadError';
import { useSupabaseQuery } from '../../../shared/hooks/useSupabaseQuery';

const { Title, Text } = Typography;

export const CataloguePage = () => {
  const [activeSlug, setActiveSlug] = useState('all');
  const colors = useColors();

  const categoriesQuery = useSupabaseQuery<ProductCategory[]>(() => catalogueService.getCategories(), []);
  const productsQuery = useSupabaseQuery<Product[]>(() => catalogueService.getProducts(activeSlug), [activeSlug]);
  const categories = categoriesQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const loading = productsQuery.loading;
  const error = productsQuery.error ?? categoriesQuery.error;
  const retry = () => {
    if (categoriesQuery.error) categoriesQuery.retry();
    productsQuery.retry();
  };

  const segmentOptions = [
    { label: 'All', value: 'all', icon: CATEGORY_ICONS.all },
    ...categories.map(c => ({
      label: c.name,
      value: c.slug,
      icon: CATEGORY_ICONS[c.slug],
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
        ) : error ? (
          <LoadError what="the catalogue" error={error} onRetry={retry} />
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
