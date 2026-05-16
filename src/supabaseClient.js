import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fbhjydivvwkwaxoeczmp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiaGp5ZGl2dndrd2F4b2Vjem1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MTA2MDUsImV4cCI6MjA5NDQ4NjYwNX0.IjbgohAnfwf-XLow-MLsChyS3k54L0jWub-Eex1dgyM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
