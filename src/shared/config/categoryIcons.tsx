import {
  AppstoreOutlined,
  BgColorsOutlined,
  ScissorOutlined,
  ShoppingOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';

// Keyed by product_categories.slug. The DB `icon` column holds the same names.
export const CATEGORY_ICONS: Record<string, ReactNode> = {
  all: <AppstoreOutlined />,
  'custom-curtains': <ScissorOutlined />,
  'ready-made': <ShoppingOutlined />,
  fabrics: <BgColorsOutlined />,
  alterations: <ToolOutlined />,
};
