import { createClient } from 'npm:@supabase/supabase-js@2';

// Service-role client — bypasses RLS. Only ever used inside Edge Functions,
// never shipped to the browser. SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are
// auto-injected into every Edge Function's environment by the platform.
export const supabaseAdmin = () =>
  createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

// Resolves the calling user from the Authorization header the browser sends
// via supabase.functions.invoke(...). Uses the anon key + the caller's JWT
// (not the service role) so an invalid/expired token is rejected the same
// way the rest of the app's RLS-backed calls would reject it.
export const getCallerUser = async (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;

  const client = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user } } = await client.auth.getUser();
  return user;
};

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};
