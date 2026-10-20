// Reconciles an order's payment status with Paynow. Serves two callers through
// one idempotent path: Paynow's own `resulturl` webhook (anonymous,
// server-to-server — see supabase/config.toml verify_jwt=false), and the
// browser polling for status after initiating a mobile-money or redirect
// payment.
//
// We never trust the POSTed webhook body for the actual status — it's only a
// "something happened, go check" trigger. The stored poll URL is looked up
// and hit via the Paynow SDK, which performs its own hash-verified GET, and
// *that* verified result is what updates the order.
import { corsHeaders, supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { mapPaynowStatus } from '../_shared/paynow.ts';
import { Paynow } from 'npm:paynow@2';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const orderId = url.searchParams.get('orderId');
  if (!orderId) return json({ error: 'orderId is required' }, 400);

  try {
    const admin = supabaseAdmin();

    const { data: order } = await admin.from('orders').select('id, status').eq('id', orderId).single();
    if (!order) return json({ error: 'Order not found' }, 404);

    // Already settled — nothing to do, just report it (keeps this endpoint
    // cheap and safe to call repeatedly from both Paynow and the browser).
    if (order.status === 'paid' || order.status === 'cancelled') {
      return json({ status: order.status });
    }

    const { data: payment } = await admin
      .from('order_payments')
      .select('poll_url')
      .eq('order_id', orderId)
      .single();
    if (!payment) return json({ error: 'No payment record for this order' }, 404);

    const integrationId = Deno.env.get('PAYNOW_INTEGRATION_ID')!;
    const integrationKey = Deno.env.get('PAYNOW_INTEGRATION_KEY')!;
    const paynow = new Paynow(integrationId, integrationKey);
    const pollResult = await paynow.pollTransaction(payment.poll_url);

    const mapped = mapPaynowStatus(pollResult?.status);

    await admin
      .from('order_payments')
      .update({ last_status: pollResult?.status ?? null, updated_at: new Date().toISOString() })
      .eq('order_id', orderId);

    if (mapped === 'paid') {
      await admin.from('orders').update({ status: 'paid' }).eq('id', orderId);
    } else if (mapped === 'cancelled') {
      await admin.from('orders').update({ status: 'cancelled' }).eq('id', orderId);
    }

    return json({ status: mapped === 'pending' ? 'pending_payment' : mapped });
  } catch (err) {
    console.error(err);
    return json({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
