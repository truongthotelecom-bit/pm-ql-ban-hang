import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eadprkkkllnglzmxlnha.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhZHBya2trbGxuZ2x6bXhsbmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mzg0NjksImV4cCI6MjA5NTUxNDQ2OX0.TdNmG4308d9CErMdJ8jIz4ztCZWUQvcm51yWRxA-eIg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: hsNullDiemBan } = await supabase.from('ho_so_dich_vu').select('id_ho_so_dich_vu').is('id_diem_ban', null);
  console.log("Ho so dich vu WITHOUT id_diem_ban:", hsNullDiemBan ? hsNullDiemBan.length : 0);
  
  const { data: hs } = await supabase.from('ho_so_dich_vu').select('*, ma_hop_dong(id_danh_muc_dich_vu, sys_danh_muc_dich_vu(id_loai_dich_vu))').limit(3);
  console.log("Sample nested select:", JSON.stringify(hs, null, 2));
}

run();
