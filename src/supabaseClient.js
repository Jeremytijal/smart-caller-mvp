import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase Client Initialization:');
console.log('- URL:', supabaseUrl ? 'Loaded ✓' : 'MISSING ✗');
console.log('- Anon Key:', supabaseAnonKey ? 'Loaded ✓' : 'MISSING ✗');

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ CRITICAL: Supabase environment variables are missing!');
    console.error('Please check your .env file contains:');
    console.error('  VITE_SUPABASE_URL=your_url');
    console.error('  VITE_SUPABASE_ANON_KEY=your_key');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
