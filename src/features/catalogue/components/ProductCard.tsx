import { ShoppingCartOutlined, MessageOutlined, TagOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Space, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../../shared/types';
import { useColors, radius, shadows, spacing } from '../../../lib/theme';

const { Text, Title } = Typography;

interface Props {
  product: Product;
}

export const ProductCard = ({ product }: Props) => {
  const navigate = useNavigate();
  const colors = useColors();

  return (
    <Card
      hoverable
      style={{ borderRadius: radius.lg, overflow: 'hidden', boxShadow: shadows.md, height: '100%' }}
      cover={
        product.images?.[0] ? (
          <img
            alt={product.name}
            src={product.images[0]}
            style={{ height: 220, objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            height: 220,
            background: `linear-gradient(135deg, ${colors.brand.light}, ${colors.brand.accent}33)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 48,
          }}>
            🪟
          </div>
        )
      }
      bodyStyle={{ padding: spacing[4] }}
      onClick={() => navigate(`/catalogue/${product.id}`)}
    >
      <Space direction="vertical" style={{ width: '100%' }} size={spacing[1]}>
        <Title level={5} style={{ margin: 0, color: colors.text.primary }} ellipsis>
          {product.name}
        </Title>

        <Text type="secondary" style={{ fontSize: 13, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.description}
        </Text>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing[2] }}>
          <Space>
            <TagOutlined style={{ color: colors.brand.primary }} />
            <Text strong style={{ color: colors.brand.primary }}>
              From ${product.starting_price}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{product.unit}</Text>
          </Space>
          {product.is_quotable && (
            <Badge color={colors.brand.accent} text={<Text style={{ fontSize: 11 }}>Quote</Text>} />
          )}
        </div>

        <Button
          type="primary"
          block
          icon={product.is_quotable ? <MessageOutlined /> : <ShoppingCartOutlined />}
          style={{
            marginTop: spacing[2],
            backgroundColor: product.is_quotable ? colors.brand.accent : colors.brand.primary,
            borderColor: product.is_quotable ? colors.brand.accent : colors.brand.primary,
          }}
          onClick={e => {
            e.stopPropagation();
            navigate(`/catalogue/${product.id}`);
          }}
        >
          {product.is_quotable ? 'Request Quote' : 'Add to Cart'}
        </Button>
      </Space>
    </Card>
  );
};
