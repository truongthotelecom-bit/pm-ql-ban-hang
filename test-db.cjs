require('dotenv').config(); 
const { createClient } = require('@supabase/supabase-js'); 
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY); 

async function run() { 
  const {data} = await supabase.from('sys_loai_dich_vu').select('*'); 
  console.log('Loại dịch vụ:', JSON.stringify(data, null, 2)); 
} 
run();
