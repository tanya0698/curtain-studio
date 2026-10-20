import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
// Supabase's newer "publishable key" format (sb_publishable_...) replaces the
// legacy JWT-based anon key — same role (safe for the browser, RLS-gated),
// just a new naming/format from Supabase.
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
