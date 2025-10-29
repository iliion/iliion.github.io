import { createClient, SupabaseClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your actual Supabase project URL and Anon Key.
// It is highly recommended to use environment variables for these values.
const supabaseUrl = 'https://xlpigvebvflukebwqizh.supabase.co';
const supabaseAnonKey = 'sb_publishable_rcr3e6qyXSngrEcCZ92GkQ_Dltr_ztG';

let supabase: SupabaseClient | null = null;

// Only initialize if the credentials are not the default placeholders.
// This prevents failed API calls when the app is first set up.
if (supabaseUrl !== 'https://xlpigvebvflukebwqizh.supabase.co' && supabaseAnonKey !== 'sb_publishable_rcr3e6qyXSngrEcCZ92GkQ_Dltr_ztG') {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
  }
} else {
    // If using placeholders, explicitly keep supabase as null
    // and let the app fall back to mock data gracefully.
    console.warn('Supabase credentials are placeholders. The app will use sample data. Please update `lib/supabaseClient.ts` to connect to your database.');
}

export { supabase };