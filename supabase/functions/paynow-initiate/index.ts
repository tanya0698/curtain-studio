// Creates a pending order with a server-computed, authoritative price (never
// trusting client-sent amounts) and kicks off a Paynow transaction for it.
// Requires a logged-in customer (see supabase/config.toml verify_jwt).
import { corsHeaders, getCallerUser, supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { createPaynowClient } from '../_shared/paynow.ts';

interface CartItemInput {
  productId: string;
  quantity: number;
  measurements?: { width?: number; drop?: number; unit?: string };
}

interface InitiateBody {
  quoteId?: string;
  cartItems?: CartItemInput[];
  useDeposit: boolean;
  channel: 'mobile' | 'redirect';
  method?: 'ecocash' | 'onemoney';
  phone?: string;
}

interface OrderItemRow {
  product_id: string;
  quantity: number;
  unit_price: number;
  customizations: Record<string, unknown> | null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const user = await getCallerUser(req);
    if (!user) return json({ error: 'Not authenticated' }, 401);

    const body = (await req.json()) as InitiateBody;
    const admin = supabaseAdmin();

    // --- Resolve authoritative total + order line items server-side ---
    let total = 0;
    let orderItems: OrderItemRow[] = [];

    if (body.quoteId) {
      const { data: quote, error: quoteError } = await admin
        .from('quotes')
        .select('*, items:quote_items(*)')
        .eq('id', body.quoteId)
        .eq('customer_id', user.id)
        .single();

      if (quoteError || !quote) return json({ error: 'Quote not found' }, 404);
      if (quote.status !== 'accepted') return json({ error: 'Quote is not ready for payment' }, 400);
      if (quote.quoted_price == null) return json({ error: 'This quote has no price set yet' }, 400);

      total = Number(quote.quoted_price);
      orderItems = (quote.items ?? []).map((item: Record<string, unknown>) => ({
        product_id: item.product_id as string,
        quantity: item.quantity as number,
        // Informational only — order.total_amount (the quote's price) is the authoritative charge.
        unit_price: 0,
        customizations: {
          measurements: item.measurements,
          fabric_choice: item.fabric_choice,
        },
      }));
    } else {
      if (!body.cartItems?.length) return json({ error: 'Cart is empty' }, 400);

      const productIds = body.cartItems.map((i) => i.productId);
      const { data: products, error: productsError } = await admin
        .from('products')
        .select('*')
        .in('id', productIds)
        .eq('is_active', true)
        .eq('is_purchasable', true);

      if (productsError) return json({ error: 'Failed to load products' }, 500);

      const productMap = new Map((products ?? []).map((p) => [p.id, p]));
      for (const item of body.cartItems) {
        const product = productMap.get(item.productId);
        if (!product) return json({ error: `Product ${item.productId} is unavailable` }, 400);

        const quantity = Math.max(1, Math.floor(item.quantity));
        const unitPrice = Number(product.starting_price);
        total += unitPrice * quantity;
        orderItems.push({
          product_id: product.id,
          quantity,
          unit_price: unitPrice,
          customizations: item.measurements ? { measurements: item.measurements } : null,
        });
      }
    }

    if (total <= 0) return json({ error: 'Nothing to charge' }, 400);
    if (body.channel === 'mobile' && !body.phone) {
      return json({ error: 'Phone number is required for mobile money' }, 400);
    }

    const depositAmount = body.useDeposit ? round2(total * 0.5) : null;
    const chargeAmount = depositAmount ?? round2(total);
    const paymentMethod = body.channel === 'mobile'
      ? (body.method === 'onemoney' ? 'paynow_onemoney' : 'paynow_ecocash')
      : 'paynow_card';

    // --- Create the pending order (service role — bypasses RLS) ---
    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        customer_id: user.id,
        status: 'pending_payment',
        total_amount: round2(total),
        deposit_amount: depositAmount,
        payment_method: paymentMethod,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error(orderError);
      return json({ error: 'Failed to create order' }, 500);
    }

    await admin.from('order_items').insert(
      orderItems.map((item) => ({ ...item, order_id: order.id })),
    );

    // --- Kick off the Paynow transaction ---
    const paynow = createPaynowClient(order.id);
    const payment = paynow.createPayment(order.id, user.email ?? '');
    payment.add(`Order ${order.id}`, chargeAmount);

    const paynowResponse = body.channel === 'mobile'
      ? await paynow.sendMobile(payment, body.phone!, body.method === 'onemoney' ? 'onemoney' : 'ecocash')
      : await paynow.send(payment);

    if (!paynowResponse.success) {
      await admin.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
      return json({ error: paynowResponse.error ?? 'Paynow rejected the transaction' }, 502);
    }

    await admin.from('order_payments').insert({
      order_id: order.id,
      poll_url: paynowResponse.pollUrl,
    });

    if (paynowResponse.paynowReference) {
      await admin
        .from('orders')
        .update({ paynow_reference: String(paynowResponse.paynowReference) })
        .eq('id', order.id);
    }

    return json({
      orderId: order.id,
      channel: body.channel,
      redirectUrl: body.channel === 'redirect' ? paynowResponse.redirectUrl : undefined,
      instructions: body.channel === 'mobile' ? paynowResponse.instructions : undefined,
    });
  } catch (err) {
    console.error(err);
    return json({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
