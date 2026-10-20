// Official Paynow Zimbabwe SDK (https://www.npmjs.com/package/paynow). Only
// depends on axios + js-sha512 (pure JS, Deno-npm-compatible). We delegate all
// hash construction/verification and request/response parsing to it rather
// than hand-rolling the Paynow wire protocol — this can't be live-tested until
// real merchant credentials exist, so trusting the maintained SDK over
// hand-rolled crypto/field-ordering logic is the safer bet.
import { Paynow } from 'npm:paynow@2';

// Builds a Paynow client wired up for one specific order: resultUrl is where
// Paynow POSTs server-to-server once a transaction settles (our paynow-status
// function), returnUrl is where the customer's browser lands after a
// redirect-flow (card/ZIMSWITCH) payment.
export const createPaynowClient = (orderId: string) => {
  const integrationId = Deno.env.get('PAYNOW_INTEGRATION_ID');
  const integrationKey = Deno.env.get('PAYNOW_INTEGRATION_KEY');
  const siteUrl = Deno.env.get('SITE_URL');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');

  if (!integrationId || !integrationKey || !siteUrl || !supabaseUrl) {
    throw new Error('Paynow is not configured — missing PAYNOW_INTEGRATION_ID / PAYNOW_INTEGRATION_KEY / SITE_URL secrets');
  }

  const paynow = new Paynow(integrationId, integrationKey);
  paynow.resultUrl = `${supabaseUrl}/functions/v1/paynow-status?orderId=${orderId}`;
  paynow.returnUrl = `${siteUrl}/checkout/complete?orderId=${orderId}`;
  return paynow;
};

// Paynow's poll status strings aren't a fully nailed-down enum from our side
// (see plan notes) — match loosely and treat anything unrecognized as "still
// pending" rather than erroring, so a wording variant doesn't hard-fail us.
export const mapPaynowStatus = (rawStatus: string | undefined): 'paid' | 'cancelled' | 'pending' => {
  const status = (rawStatus ?? '').toLowerCase();
  if (status.includes('paid') || status.includes('awaiting delivery')) return 'paid';
  if (status.includes('cancelled') || status.includes('disputed')) return 'cancelled';
  return 'pending';
};
