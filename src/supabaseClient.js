import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fbhjydivvwkwaxoeczmp.supabase.co';
const supabaseAnonKey = 'sb_publishable_ZjXvit_BBtv9Su9UZ1kwqw_gt117cm9';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);