import { ShoppingCartOutlined, MessageOutlined } from '@ant-design/icons';
import { Button, Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../../shared/types';
import { useColors, radius, spacing, typography } from '../../../lib/theme';
import { ImagePlaceholder } from '../../../shared/components/ImagePlaceholder';

const { Text } = Typography;

interface Props {
  product: Product;
}

export const ProductCard = ({ product }: Props) => {
  const navigate = useNavigate();
  const colors = useColors();

  return (
    <Card
      hoverable
      className="hover-card"
      style={{ borderRadius: radius.lg, overflow: 'hidden', height: '100%', border: `1px solid ${colors.border.strong}` }}
      cover={
        product.images?.[0] ? (
          <img
            alt={product.name}
            src={product.images[0]}
            style={{ height: 220, objectFit: 'cover', borderRadius: 0 }}
          />
        ) : (
          <ImagePlaceholder style={{ height: 220 }} />
        )
      }
      styles={{ body: { padding: `${spacing[4]}px ${spacing[4]}px ${spacing[4]}px` } }}
      onClick={() => navigate(`/catalogue/${product.id}`)}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
        <Text strong style={{ fontSize: 15, color: colors.text.primary }} ellipsis>
          {product.name}
        </Text>

        <Text type="secondary" style={{ fontSize: 13, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.description}
        </Text>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: spacing[2] }}>
          <span style={{ fontFamily: typography.monoFamily, fontVariantNumeric: 'tabular-nums', fontSize: 14, color: colors.brand.deep }}>
            From ${product.starting_price}
          </span>
          <Text style={{ fontSize: 12, color: colors.text.muted }}>
            {product.is_quotable ? 'Made to measure' : product.unit}
          </Text>
        </div>

        <Button
          type={product.is_quotable ? 'default' : 'primary'}
          block
          icon={product.is_quotable ? <MessageOutlined /> : <ShoppingCartOutlined />}
          style={{ marginTop: spacing[3], ...(product.is_quotable ? { borderColor: colors.text.primary, color: colors.text.primary } : {}) }}
          onClick={e => {
            e.stopPropagation();
            navigate(`/catalogue/${product.id}`);
          }}
        >
          {product.is_quotable ? 'Request Quote' : 'Add to Cart'}
        </Button>
      </div>
    </Card>
  );
};
