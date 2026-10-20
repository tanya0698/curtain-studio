import { supabase } from '../../../lib/api/supabaseClient';

export interface CartItemInput {
  productId: string;
  quantity: number;
  measurements?: { width?: number; drop?: number; unit?: string };
}

export interface InitiatePaymentInput {
  quoteId?: string;
  cartItems?: CartItemInput[];
  useDeposit: boolean;
  channel: 'mobile' | 'redirect';
  method?: 'ecocash' | 'onemoney';
  phone?: string;
}

export interface InitiatePaymentResult {
  orderId: string;
  channel: 'mobile' | 'redirect';
  redirectUrl?: string;
  instructions?: string;
}

export type PollStatusResult = 'pending_payment' | 'paid' | 'cancelled';

export const checkoutService = {
  // Creates the pending order server-side (authoritative pricing) and kicks
  // off the Paynow transaction. Never sends a price to the server — only
  // product/quote ids and quantities; the Edge Function looks up the real
  // price itself.
  initiate: async (input: InitiatePaymentInput): Promise<InitiatePaymentResult> => {
    const { data, error } = await supabase.functions.invoke('paynow-initiate', { body: input });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data as InitiatePaymentResult;
  },

  // Proxies to Paynow's poll URL server-side (avoids exposing it to the
  // browser) and returns the order's current status. Safe to call repeatedly.
  pollStatus: async (orderId: string): Promise<PollStatusResult> => {
    const { data, error } = await supabase.functions.invoke(`paynow-status?orderId=${orderId}`);
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data.status as PollStatusResult;
  },
};
