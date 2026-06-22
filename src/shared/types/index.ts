export type UserRole = 'customer' | 'admin';

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  role: UserRole;
  created_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string;
  starting_price: number;
  unit: string;
  is_quotable: boolean;
  is_purchasable: boolean;
  images: string[];
  is_active: boolean;
  created_at: string;
  category?: ProductCategory;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  product_id: string;
  quantity: number;
  measurements: { width?: number; drop?: number; unit?: string } | null;
  fabric_choice: string | null;
  customizations: Record<string, unknown> | null;
  product?: Product;
}

export type QuoteStatus = 'pending' | 'quoted' | 'accepted' | 'rejected' | 'completed';

export interface Quote {
  id: string;
  customer_id: string;
  status: QuoteStatus;
  notes: string | null;
  admin_notes: string | null;
  quoted_price: number | null;
  created_at: string;
  updated_at: string;
  items?: QuoteItem[];
  customer?: Profile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  customizations: Record<string, unknown> | null;
  product?: Product;
}

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'in_progress'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'stripe' | 'paypal';

export interface Order {
  id: string;
  customer_id: string;
  status: OrderStatus;
  total_amount: number;
  deposit_amount: number | null;
  payment_method: PaymentMethod | null;
  payment_intent_id: string | null;
  created_at: string;
  items?: OrderItem[];
  customer?: Profile;
}

export interface CartItem {
  product: Product;
  quantity: number;
  measurements?: { width?: number; drop?: number; unit?: string };
}
