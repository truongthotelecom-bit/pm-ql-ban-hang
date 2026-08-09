import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env vars in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DEFAULT_COLUMNS = [
  { id_ten_cot: 'id_pttt_nguon', noi_dung_hien_thi: 'Hình thức KHÁCH ĐƯA TIỀN', is_an_cot: false },
  { id_ten_cot: 'id_pttt_di', noi_dung_hien_thi: 'Hình thức CHUYỂN TIỀN ĐI', is_an_cot: false },
  { id_ten_cot: 'so_tien', noi_dung_hien_thi: 'SỐ TIỀN GIAO DỊCH (GỐC)', is_an_cot: false },
  { id_ten_cot: 'is_cuoc_trong', noi_dung_hien_thi: 'Chế độ Cước Trong', is_an_cot: false },
  { id_ten_cot: 'phi_dich_vu', noi_dung_hien_thi: 'Phí Dịch Vụ (Thu Khách)', is_an_cot: false },
  { id_ten_cot: 'so_tien_giam', noi_dung_hien_thi: 'Giảm giá Trực tiếp (Bớt cho khách)', is_an_cot: false },
  { id_ten_cot: 'chiet_khau', noi_dung_hien_thi: 'Chiết khấu Kế toán Nội bộ (%)', is_an_cot: false },
  { id_ten_cot: 'noi_dung', noi_dung_hien_thi: 'Nội dung chuyển khoản / Ghi chú', is_an_cot: false },
  { id_ten_cot: 'id_trang_thai', noi_dung_hien_thi: 'Trạng thái giao dịch', is_an_cot: false }
];

async function seed() {
  console.log("Fetching services...");
  const { data: services, error: errSvc } = await supabase.from('sys_loai_dich_vu').select('*');
  
  if (errSvc) {
    console.error("Error fetching services:", errSvc);
    return;
  }

  let count = 0;

  for (const svc of services) {
    console.log(`Processing service: ${svc.ten_danh_muc}`);
    for (const col of DEFAULT_COLUMNS) {
      // Check if exists
      const { data: existing } = await supabase
        .from('sys_ql_cot_du_lieu')
        .select('id_ql_cot_du_lieu')
        .eq('id_ten_bang', 'chi_tiet_giao_dich')
        .eq('id_loai_dich_vu', svc.id_loai_dich_vu)
        .eq('id_ten_cot', col.id_ten_cot);

      if (!existing || existing.length === 0) {
        const payload = {
          id_ten_bang: 'chi_tiet_giao_dich',
          id_loai_dich_vu: svc.id_loai_dich_vu,
          id_ten_cot: col.id_ten_cot,
          noi_dung_hien_thi: col.noi_dung_hien_thi,
          is_an_cot: col.is_an_cot,
          ghi_chu: 'Khởi tạo mặc định'
        };
        const { error } = await supabase.from('sys_ql_cot_du_lieu').insert([payload]);
        if (error) {
          console.error("Error inserting:", error);
        } else {
          count++;
        }
      }
    }
  }

  console.log(`Done! Inserted ${count} default column configurations.`);
}

seed();
