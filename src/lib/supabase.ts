import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://isymhicfyatamwiwyuhk.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_Va5Rnrm_uAwrPjKK3ClIzQ_QhJrRadT';

// Singleton Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
