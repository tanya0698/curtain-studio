import { supabase } from '../../../lib/api/supabaseClient';

export const quotesService = {
  createQuote: async (quoteData: {
    notes: string;
    items: Array<{
      product_id: string;
      quantity: number;
      measurements?: { width?: number; drop?: number; unit?: string };
      fabric_choice?: string;
      customizations?: Record<string, unknown>;
    }>;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({ customer_id: user.id, notes: quoteData.notes, status: 'pending' })
      .select()
      .single();

    if (quoteError) throw quoteError;

    const items = quoteData.items.map(item => ({ ...item, quote_id: quote.id }));
    const { error: itemsError } = await supabase.from('quote_items').insert(items);
    if (itemsError) throw itemsError;

    return quote;
  },

  getMyQuotes: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return supabase
      .from('quotes')
      .select('*, items:quote_items(*, product:products(*))')
      .eq('customer_id', user?.id ?? '')
      .order('created_at', { ascending: false });
  },

  getQuoteById: (id: string) =>
    supabase
      .from('quotes')
      .select('*, items:quote_items(*, product:products(*)), customer:profiles(*)')
      .eq('id', id)
      .single(),

  // Admin
  getAllQuotes: () =>
    supabase
      .from('quotes')
      .select('*, items:quote_items(*, product:products(*)), customer:profiles(*)')
      .order('created_at', { ascending: false }),

  updateQuote: (id: string, updates: { status?: string; admin_notes?: string; quoted_price?: number }) =>
    supabase.from('quotes').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single(),

  acceptQuote: (id: string) =>
    supabase.from('quotes').update({ status: 'accepted', updated_at: new Date().toISOString() }).eq('id', id),
};
