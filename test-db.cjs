require('dotenv').config(); 
const { createClient } = require('@supabase/supabase-js'); 
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY); 

async function run() { 
  const selectFields = 'id_ma_hop_dong, ma_hop_dong, id_loai_dich_vu, chu_hop_dong, sys_danh_muc_dich_vu(ten_viet_tat)';
  const {data, error} = await supabase.from('ma_hop_dong').select(selectFields); 
  console.log('Query:', selectFields);
  console.log('Error:', error);
  console.log('ma_hop_dong:', JSON.stringify(data, null, 2)); 
} 
run();
