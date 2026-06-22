import { supabase } from '../../../lib/api/supabaseClient';

export const catalogueService = {
  getCategories: () =>
    supabase.from('product_categories').select('*').order('name'),

  getProducts: (categorySlug?: string) => {
    let query = supabase
      .from('products')
      .select('*, category:product_categories(*)')
      .eq('is_active', true)
      .order('name');

    if (categorySlug && categorySlug !== 'all') {
      query = query.eq('category.slug', categorySlug);
    }
    return query;
  },

  getProductById: (id: string) =>
    supabase
      .from('products')
      .select('*, category:product_categories(*)')
      .eq('id', id)
      .single(),

  // Admin operations
  createProduct: (product: Record<string, unknown>) =>
    supabase.from('products').insert(product).select().single(),

  updateProduct: (id: string, updates: Record<string, unknown>) =>
    supabase.from('products').update(updates).eq('id', id).select().single(),

  deleteProduct: (id: string) =>
    supabase.from('products').delete().eq('id', id),

  uploadImage: async (file: File) => {
    const filename = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filename, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);
    return publicUrl;
  },
};
