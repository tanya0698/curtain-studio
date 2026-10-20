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

  // Photos attached to a quote request. Stored in a private bucket under the
  // uploading customer's own id, per the storage RLS policies in
  // 003_quote_flow_polish.sql — so uploads only ever succeed for the
  // customer's own quotes, regardless of what quoteId is passed in.
  uploadAttachment: async (quoteId: string, file: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const path = `${user.id}/${quoteId}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('quote-attachments').upload(path, file);
    if (error) throw error;
    return path;
  },

  // The bucket is private, so callers need a signed URL rather than a public
  // one — this only succeeds for the photo's owner or an admin (same RLS).
  getAttachmentUrl: async (path: string) => {
    const { data, error } = await supabase.storage
      .from('quote-attachments')
      .createSignedUrl(path, 60 * 10); // 10 minutes — just long enough to view
    if (error) throw error;
    return data.signedUrl;
  },

  attachImages: (quoteId: string, imagePaths: string[]) =>
    supabase.from('quotes').update({ images: imagePaths }).eq('id', quoteId),
};
