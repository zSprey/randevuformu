import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://isymhicfyatamwiwyuhk.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_Va5Rnrm_uAwrPjKK3ClIzQ_QhJrRadT';

// Universal Supabase Client with Cookie Sync for SSR Middleware
export const supabase =
  typeof window !== 'undefined'
    ? createBrowserClient(supabaseUrl, supabaseAnonKey)
    : createSupabaseClient(supabaseUrl, supabaseAnonKey);
