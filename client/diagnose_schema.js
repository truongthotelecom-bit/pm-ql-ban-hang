import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eadprkkkllnglzmxlnha.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhZHBya2trbGxuZ2x6bXhsbmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mzg0NjksImV4cCI6MjA5NTUxNDQ2OX0.TdNmG4308d9CErMdJ8jIz4ztCZWUQvcm51yWRxA-eIg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('ho_so_dich_vu').select('*').limit(1);
  console.log("Ho_so_dich_vu columns:", data ? Object.keys(data[0]) : error);
}

run();
