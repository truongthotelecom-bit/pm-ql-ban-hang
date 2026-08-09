import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eadprkkkllnglzmxlnha.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhZHBya2trbGxuZ2x6bXhsbmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mzg0NjksImV4cCI6MjA5NTUxNDQ2OX0.TdNmG4308d9CErMdJ8jIz4ztCZWUQvcm51yWRxA-eIg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('chi_tiet_giao_dich').select('invalid_column_to_get_schema').limit(1);
  console.log("chi_tiet_giao_dich columns error:", error);
}

run();
