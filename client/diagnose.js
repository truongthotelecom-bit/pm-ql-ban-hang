import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eadprkkkllnglzmxlnha.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhZHBya2trbGxuZ2x6bXhsbmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mzg0NjksImV4cCI6MjA5NTUxNDQ2OX0.TdNmG4308d9CErMdJ8jIz4ztCZWUQvcm51yWRxA-eIg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: hd, error } = await supabase.from('ma_hop_dong').select('*').limit(5000);
  console.log("Contracts fetched with limit(5000):", hd ? hd.length : 0);
}

run();
