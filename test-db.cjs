require('dotenv').config(); 
const { createClient } = require('@supabase/supabase-js'); 
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY); 

const tables = [
  'dm_trang_thai_giao_dich',
  'dm_phuong_thuc_thanh_toan',
  'dm_hang_khach_hang',
  'dm_loai_gd_thu_chi',
  'sys_nhom_menu',
  'sys_loai_dich_vu',
  'sys_danh_muc_dich_vu',
  'khach_hang',
  'ma_hop_dong',
  'ho_so_dich_vu'
];

async function run() { 
  for (const table of tables) {
    const {data} = await supabase.from(table).select('*'); 
    console.log(`${table}: ${data ? data.length : 'ERROR'}`); 
  }
} 
run();
