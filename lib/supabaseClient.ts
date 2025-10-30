import { createClient, SupabaseClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your actual Supabase project URL and Anon Key.
// It is highly recommended to use environment variables for these values.
const supabaseUrl = 'https://xlpigvebvflukebwqizh.supabase.co';
const supabaseAnonKey = 'sb_publishable_rcr3e6qyXSngrEcCZ92GkQ_Dltr_ztG';

let supabase: SupabaseClient | null = null;

if (supabaseUrl !== 'https://xlpigvebvflukebwqizh.supabase.co' && supabaseAnonKey !== 'sb_publishable_rcr3e6qyXSngrEcCZ92GkQ_Dltr_ztG') {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
  }
} else {
    console.warn('Supabase credentials are placeholders. The app will use sample data. Please update `lib/supabaseClient.ts` to connect to your database.');
}

export { supabase };
