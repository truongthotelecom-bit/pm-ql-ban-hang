import { createClient } from '@supabase/supabase-js';

// Khởi tạo Supabase client dựa trên biến môi trường hoặc localStorage (nếu có config động)
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const savedUrl = localStorage.getItem('supabase_url');
const savedKey = localStorage.getItem('supabase_key');

const supabaseUrl = envUrl || savedUrl;
const supabaseKey = envKey || savedKey;

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;
