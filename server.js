const express = require('express');
const cors = require('cors');
const path = require('path');
const supabase = require('./src/config/supabase');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000; // Mặc định chạy port 5000 để tránh xung đột với Vite (3000)

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Kiểm tra xem đã cấu hình Supabase thực tế chưa
const isRealSupabase = process.env.SUPABASE_URL && 
                       !process.env.SUPABASE_URL.includes('your-project-id') && 
                       process.env.SUPABASE_KEY && 
                       !process.env.SUPABASE_KEY.includes('your-supabase-anon-key');

if (!isRealSupabase) {
  console.log('💡 HỆ THỐNG ĐANG CHẠY CHẾ ĐỘ GIẢ LẬP (MOCK DATABASE) DO CHƯA CÓ SUPABASE CREDENTIALS TRONG FILE .env');
} else {
  console.log('✅ ĐÃ KẾT NỐI VỚI SUPABASE THỰC TẾ!');
}

// ----------------------------------------------------
// GIẢ LẬP DATABASE V2 (MOCK) ĐỂ GIAO DIỆN HOẠT ĐỘNG NGAY
// ----------------------------------------------------
const mockDb = {
  phan_loai: [
    { id_phan_loai: 'pl-1', ten_phan_loai: 'Trạng thái giao dịch', icon: 'activity' },
    { id_phan_loai: 'pl-2', ten_phan_loai: 'Phương thức thanh toán', icon: 'credit-card' },
    { id_phan_loai: 'pl-3', ten_phan_loai: 'Hạng khách hàng', icon: 'award' },
    { id_phan_loai: 'pl-4', ten_phan_loai: 'Giới tính', icon: 'user' },
    { id_phan_loai: 'pl-5', ten_phan_loai: 'Đối tượng khách hàng', icon: 'users' },
    { id_phan_loai: 'pl-8', ten_phan_loai: 'Cách tính phí', icon: 'calculator' }
  ],
  dm_danh_muc: [
    // Trạng thái giao dịch (pl-1)
    { id_danh_muc: 'dm-1', ten_danh_muc: 'Thành công', id_phan_loai: 'pl-1', index: 1, icon: 'check-circle' },
    { id_danh_muc: 'dm-2', ten_danh_muc: 'Chờ duyệt', id_phan_loai: 'pl-1', index: 2, icon: 'clock' },
    { id_danh_muc: 'dm-3', ten_danh_muc: 'Thất bại', id_phan_loai: 'pl-1', index: 3, icon: 'x-circle' },
    { id_danh_muc: 'dm-4', ten_danh_muc: 'Đang xử lý', id_phan_loai: 'pl-1', index: 4, icon: 'loader' },
    // Phương thức thanh toán (pl-2)
    { id_danh_muc: 'dm-pay-transfer', ten_danh_muc: 'Chuyển khoản', id_phan_loai: 'pl-2', index: 1, icon: 'repeat' },
    { id_danh_muc: 'dm-pay-cash', ten_danh_muc: 'Tiền mặt', id_phan_loai: 'pl-2', index: 2, icon: 'wallet' },
    { id_danh_muc: 'dm-pay-card', ten_danh_muc: 'Quẹt thẻ', id_phan_loai: 'pl-2', index: 3, icon: 'credit-card' },
    // Hạng khách hàng (pl-3)
    { id_danh_muc: 'dm-lvl-vip', ten_danh_muc: 'VIP Vàng', id_phan_loai: 'pl-3', index: 1, icon: 'zap' },
    { id_danh_muc: 'dm-lvl-member', ten_danh_muc: 'Thành viên', id_phan_loai: 'pl-3', index: 2, icon: 'smile' },
    { id_danh_muc: 'dm-lvl-casual', ten_danh_muc: 'Khách lẻ', id_phan_loai: 'pl-3', index: 3, icon: 'user' },
    // Giới tính (pl-4)
    { id_danh_muc: 'dm-gender-male', ten_danh_muc: 'Nam', id_phan_loai: 'pl-4', index: 1, icon: 'mars' },
    { id_danh_muc: 'dm-gender-female', ten_danh_muc: 'Nữ', id_phan_loai: 'pl-4', index: 2, icon: 'venus' },
    // Đối tượng khách hàng (pl-5)
    { id_danh_muc: 'dm-obj-personal', ten_danh_muc: 'Cá nhân', id_phan_loai: 'pl-5', index: 1, icon: 'user' },
    { id_danh_muc: 'dm-obj-business', ten_danh_muc: 'Doanh nghiệp', id_phan_loai: 'pl-5', index: 2, icon: 'building' },
    // Cách tính phí (pl-8)
    { id_danh_muc: 'dm-fee-percent', ten_danh_muc: 'Theo phần trăm', id_phan_loai: 'pl-8', index: 1, icon: 'percent' },
    { id_danh_muc: 'dm-fee-fixed', ten_danh_muc: 'Cố định', id_phan_loai: 'pl-8', index: 2, icon: 'hash' }
  ],
  nhom_menu: [
    { id_nhom: 'nm-1', ten_nhom: 'CHUYỂN TIỀN - RÚT TIỀN MẶT', index: 1, ghi_chu: 'Dịch vụ chuyển/rút tiền mặt nhanh' },
    { id_nhom: 'nm-2', ten_nhom: 'THU HỘ', index: 2, ghi_chu: 'Dịch vụ thu hộ, thu góp định kỳ' },
    { id_nhom: 'nm-3', ten_nhom: 'CƯỚC VIỄN THÔNG, THẺ CÀO', index: 3, ghi_chu: 'Nạp tiền điện thoại, mua thẻ cào' },
    { id_nhom: 'nm-4', ten_nhom: 'NẠP RÚT DÒNG TIỀN', index: 4, ghi_chu: 'Quản lý dòng tiền nội bộ' },
    { id_nhom: 'nm-5', ten_nhom: 'KHÁCH HÀNG', index: 5, ghi_chu: 'Quản lý chi/thu cá nhân khách hàng' },
    { id_nhom: 'nm-6', ten_nhom: 'DỊCH VỤ KHÁC', index: 6, ghi_chu: 'Các khoản thu nhập/chi phí khác' },
    { id_nhom: 'nm-7', ten_nhom: 'QUẢN LÝ DỮ LIỆU', index: 7, ghi_chu: 'Kinh doanh SIM Online & Dữ liệu đại lý' }
  ],
  loai_dich_vu: [
    { id_loai_dich_vu: 'ldv-1', id_nhom_dich_vu: 'nm-1', icon: '💸', ten_danh_muc: 'CHUYỂN KHOẢN', ma_viet_tat: 'CK' },
    { id_loai_dich_vu: 'ldv-2', id_nhom_dich_vu: 'nm-1', icon: '🏧', ten_danh_muc: 'RÚT TIỀN', ma_viet_tat: 'RT' },
    { id_loai_dich_vu: 'ldv-3', id_nhom_dich_vu: 'nm-2', icon: '🛍️', ten_danh_muc: 'THU HỘ', ma_viet_tat: 'TH' },
    { id_loai_dich_vu: 'ldv-4', id_nhom_dich_vu: 'nm-2', icon: '🪙', ten_danh_muc: 'THU GÓP', ma_viet_tat: 'TG' },
    { id_loai_dich_vu: 'ldv-5', id_nhom_dich_vu: 'nm-3', icon: '📱', ten_danh_muc: 'KPP - NẠP THẺ', ma_viet_tat: 'NT' },
    { id_loai_dich_vu: 'ldv-6', id_nhom_dich_vu: 'nm-3', icon: '🏷️', ten_danh_muc: 'NẠP THẺ CHIẾT KHẤU', ma_viet_tat: 'TC' },
    { id_loai_dich_vu: 'ldv-7', id_nhom_dich_vu: 'nm-3', icon: '📞', ten_danh_muc: 'NẠP SỐ ĐIỆN THOẠI', ma_viet_tat: 'NDT' },
    { id_loai_dich_vu: 'ldv-8', id_nhom_dich_vu: 'nm-3', icon: '🎴', ten_danh_muc: 'KPP - THẺ ĐIỆN THOẠI', ma_viet_tat: 'TDT' },
    { id_loai_dich_vu: 'ldv-9', id_nhom_dich_vu: 'nm-3', icon: '🎮', ten_danh_muc: 'KPP - THẺ GAME', ma_viet_tat: 'TG' },
    { id_loai_dich_vu: 'ldv-10', id_nhom_dich_vu: 'nm-3', icon: '🎮', ten_danh_muc: 'SHOPPE - THẺ GAME', ma_viet_tat: 'TC' },
    { id_loai_dich_vu: 'ldv-11', id_nhom_dich_vu: 'nm-3', icon: '🌐', ten_danh_muc: 'INTERNET', ma_viet_tat: 'IT' },
    { id_loai_dich_vu: 'ldv-12', id_nhom_dich_vu: 'nm-4', icon: '📈', ten_danh_muc: 'NẠP RÚT DÒNG TIỀN', ma_viet_tat: 'DT' },
    { id_loai_dich_vu: 'ldv-13', id_nhom_dich_vu: 'nm-5', icon: '📉', ten_danh_muc: 'CHI CÁ NHÂN', ma_viet_tat: 'CN' },
    { id_loai_dich_vu: 'ldv-14', id_nhom_dich_vu: 'nm-5', icon: '📈', ten_danh_muc: 'THU CÁ NHÂN', ma_viet_tat: 'CN' },
    { id_loai_dich_vu: 'ldv-15', id_nhom_dich_vu: 'nm-6', icon: '📉', ten_danh_muc: 'CÁC KHOẢN CHI KHÁC', ma_viet_tat: 'CT' },
    { id_loai_dich_vu: 'ldv-16', id_nhom_dich_vu: 'nm-6', icon: '📈', ten_danh_muc: 'CÁC THU NHẬP KHÁC', ma_viet_tat: 'TT' },
    { id_loai_dich_vu: 'ldv-17', id_nhom_dich_vu: 'nm-6', icon: '📋', ten_danh_muc: 'THANH TOÁN THEO DANH SÁCH', ma_viet_tat: 'HD' },
    { id_loai_dich_vu: 'ldv-18', id_nhom_dich_vu: 'nm-6', icon: '⚙️', ten_danh_muc: 'CÁC DỊCH VỤ KHÁC', ma_viet_tat: 'DF' },
    { id_loai_dich_vu: 'ldv-19', id_nhom_dich_vu: 'nm-7', icon: '📱', ten_danh_muc: 'KINH DOANH SIM ONLINE', ma_viet_tat: 'OL' }
  ],
  menu: [
    // Liên kết menu nhóm và dịch vụ
    { id_menu: 'm-1', id_nhom: 'nm-1', id_loai_dich_vu: 'ldv-1', view_link: 'ho_so_dich_vu', index: 1 },
    { id_menu: 'm-2', id_nhom: 'nm-1', id_loai_dich_vu: 'ldv-2', view_link: 'ho_so_dich_vu', index: 2 },
    { id_menu: 'm-3', id_nhom: 'nm-2', id_loai_dich_vu: 'ldv-3', view_link: 'ho_so_dich_vu', index: 1 },
    { id_menu: 'm-4', id_nhom: 'nm-2', id_loai_dich_vu: 'ldv-4', view_link: 'ho_so_dich_vu', index: 2 }
  ],
  ql_cot_du_lieu: [
    // Cột cấu hình cho Form lập dòng tiền chi tiết
    { id_ql_cot_du_lieu: 'col-1', id_ten_bang: 'chi_tiet_giao_dich', id_loai_dich_vu: 'ldv-1', id_ten_cot: 'so_tien', noi_dung_hien_thi: 'Số tiền giao dịch', is_an_cot: false, ghi_chu: 'money required' },
    { id_ql_cot_du_lieu: 'col-2', id_ten_bang: 'chi_tiet_giao_dich', id_loai_dich_vu: 'ldv-1', id_ten_cot: 'phi_dich_vu', noi_dung_hien_thi: 'Phí dịch vụ thu khách', is_an_cot: false, ghi_chu: 'money' },
    { id_ql_cot_du_lieu: 'col-3', id_ten_bang: 'chi_tiet_giao_dich', id_loai_dich_vu: 'ldv-1', id_ten_cot: 'chiet_khau', noi_dung_hien_thi: 'Chiết khấu (%)', is_an_cot: false, ghi_chu: 'number' },
    { id_ql_cot_du_lieu: 'col-4', id_ten_bang: 'chi_tiet_giao_dich', id_loai_dich_vu: 'ldv-1', id_ten_cot: 'noi_dung', noi_dung_hien_thi: 'Nội dung chuyển khoản', is_an_cot: false, ghi_chu: 'text required' },
    { id_ql_cot_du_lieu: 'col-5', id_ten_bang: 'chi_tiet_giao_dich', id_loai_dich_vu: 'ldv-1', id_ten_cot: 'id_trang_thai', noi_dung_hien_thi: 'Trạng thái giao dịch', is_an_cot: false, ghi_chu: 'select' }
  ],
  quan_ly_chu_ky: [
    {
      id_chu_ky: 'ck-1',
      ten_chu_ky: 'Quản lý quầy AURA',
      ten_cua_hang: 'AURA FINTECH - DỊCH VỤ TÀI CHÍNH ĐA NĂNG',
      sdt1: '0988.888.888',
      sdt2: '0977.777.777',
      dia_chi: '123 Đường Láng, Đống Đa, Hà Nội',
      zalo: '0988.888.888',
      facebook: 'fb.com/aurashop',
      dich_vu_1: 'Chuyển tiền & Rút tiền mặt nhanh 24/7',
      dich_vu_2: 'Thu hộ cước viễn thông, trả góp, hóa đơn',
      dich_vu_3: 'Mua bán SIM số đẹp toàn quốc, SIM data giá sỉ'
    }
  ],
  danh_muc_dich_vu: [
    { id_danh_muc_dich_vu: 'bank-1', id_loai_dich_vu: 'ldv-1', ma_bin: '970422', ten_dich_vu: 'Ngân hàng Quân Đội', ten_viet_tat: 'MB', logo: 'https://img.vietqr.io/img/MB.png' },
    { id_danh_muc_dich_vu: 'bank-2', id_loai_dich_vu: 'ldv-1', ma_bin: '970436', ten_dich_vu: 'Ngân hàng Vietcombank', ten_viet_tat: 'VCB', logo: 'https://img.vietqr.io/img/VCB.png' },
    { id_danh_muc_dich_vu: 'bank-3', id_loai_dich_vu: 'ldv-1', ma_bin: '970415', ten_dich_vu: 'Ngân hàng VietinBank', ten_viet_tat: 'CTG', logo: 'https://img.vietqr.io/img/ICB.png' },
    { id_danh_muc_dich_vu: 'bank-4', id_loai_dich_vu: 'ldv-1', ma_bin: '970407', ten_dich_vu: 'Ngân hàng Techcombank', ten_viet_tat: 'TCB', logo: 'https://img.vietqr.io/img/TCB.png' }
  ],
  ma_hop_dong: [
    { id_ma_hop_dong: 'hd-1', id_loai_dich_vu: 'ldv-1', ma_hop_dong: 'AURA-2026-001', chu_hop_dong: 'Nguyễn Văn A', ghi_chu: 'Đại lý phân phối cấp 1' },
    { id_ma_hop_dong: 'hd-2', id_loai_dich_vu: 'ldv-1', ma_hop_dong: 'AURA-2026-002', chu_hop_dong: 'Trần Thị B', ghi_chu: 'Hợp đồng mua SIM trả góp' },
    { id_ma_hop_dong: 'hd-3', id_loai_dich_vu: 'ldv-2', ma_hop_dong: 'ATM-SON-001', chu_hop_dong: 'Nguyễn Hoàng Sơn', ghi_chu: 'Hợp đồng thanh toán tiền mặt ATM' }
  ],
  khach_hang: [
    {
      id_khach_hang: 'kh-1',
      ho_va_ten: 'Nguyễn Văn A',
      ten_khac: 'Aura Cường',
      so_dien_thoai: '0901234567',
      so_dien_thoai_2: '0988777666',
      email: 'vana@gmail.com',
      cccd: '012345678999',
      dia_chi: 'Hai Bà Trưng, Hà Nội',
      id_doi_tuong: 'dm-obj-personal',
      id_gioi_tinh: 'dm-gender-male',
      id_level: 'dm-lvl-vip',
      tong_giao_dich: 3,
      tong_so_tien: 24500000,
      lan_giao_dich_cuoi: new Date().toISOString(),
      ghi_chu: 'Khách hàng thân thiết từ 2025'
    },
    {
      id_khach_hang: 'kh-2',
      ho_va_ten: 'Trần Thị B',
      ten_khac: 'Chị Béo',
      so_dien_thoai: '0912345678',
      so_dien_thoai_2: '',
      email: 'thib@gmail.com',
      cccd: '098765432111',
      dia_chi: 'Quận 1, TP. Hồ Chí Minh',
      id_doi_tuong: 'dm-obj-personal',
      id_gioi_tinh: 'dm-gender-female',
      id_level: 'dm-lvl-member',
      tong_giao_dich: 1,
      tong_so_tien: 5000000,
      lan_giao_dich_cuoi: new Date().toISOString(),
      ghi_chu: 'Khách đại lý SIM Data'
    }
  ],
  ho_so_dich_vu: [
    { id_ho_so_dich_vu: 'hs-1', id_khach_hang: 'kh-1', id_loai_dich_vu: 'ldv-1', id_ma_hop_dong: 'hd-1', noi_dung: 'Hồ sơ chuyển khoản thanh toán SIM Lộc Phát', ghi_chu: 'Dùng MBBank làm cổng' },
    { id_ho_so_dich_vu: 'hs-2', id_khach_hang: 'kh-2', id_loai_dich_vu: 'ldv-1', id_ma_hop_dong: 'hd-2', noi_dung: 'Hồ sơ mua SIM trả góp đợt 1', ghi_chu: 'Đã quẹt thẻ đảm bảo' },
    { id_ho_so_dich_vu: 'hs-3', id_khach_hang: 'kh-1', id_loai_dich_vu: 'ldv-2', id_ma_hop_dong: 'hd-3', noi_dung: 'Hồ sơ rút tiền mặt ATM Techcombank', ghi_chu: 'Rút hạn mức VIP' }
  ],
  chi_tiet_giao_dich: [
    {
      id_chi_tiet_giao_dich: 'ctgd-1',
      id_nhan_vien: 'nv-01',
      id_ho_so_dich_vu: 'hs-1',
      id_loai_dich_vu: 'ldv-1',
      id_pttt_nguon: 'dm-pay-transfer',
      so_tien: 12500000,
      so_tien_nhap_tay: 12500000,
      phi_dich_vu: 20000,
      chiet_khau: 5,
      so_tien_giam: 625000,
      id_pttt_di: 'dm-pay-transfer',
      so_tien_di: 11895000,
      noi_dung: 'Thanh toán SIM 0988.888.888 MBBank',
      id_trang_thai: 'dm-1',
      thoi_gian_giao_dich: new Date().toISOString(),
      id_chu_ky: 'ck-1',
      hinh_anh_kiem_duyet: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=600&q=80'
    },
    {
      id_chi_tiet_giao_dich: 'ctgd-2',
      id_nhan_vien: 'nv-01',
      id_ho_so_dich_vu: 'hs-1',
      id_loai_dich_vu: 'ldv-1',
      id_pttt_nguon: 'dm-pay-transfer',
      so_tien: 12000000,
      so_tien_nhap_tay: 12000000,
      phi_dich_vu: 15000,
      chiet_khau: 0,
      so_tien_giam: 0,
      id_pttt_di: 'dm-pay-transfer',
      so_tien_di: 12015000,
      noi_dung: 'Nạp tiền mua sim đợt 2',
      id_trang_thai: 'dm-1',
      thoi_gian_giao_dich: new Date().toISOString(),
      id_chu_ky: 'ck-1',
      hinh_anh_kiem_duyet: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=600&q=80'
    },
    {
      id_chi_tiet_giao_dich: 'ctgd-3',
      id_nhan_vien: 'nv-02',
      id_ho_so_dich_vu: 'hs-2',
      id_loai_dich_vu: 'ldv-1',
      id_pttt_nguon: 'dm-pay-card',
      so_tien: 5000000,
      so_tien_nhap_tay: 5000000,
      phi_dich_vu: 50000,
      chiet_khau: 0,
      so_tien_giam: 0,
      id_pttt_di: 'dm-pay-transfer',
      so_tien_di: 5050000,
      noi_dung: 'Quẹt thẻ trả góp đợt 1',
      id_trang_thai: 'dm-1',
      thoi_gian_giao_dich: new Date().toISOString(),
      id_chu_ky: 'ck-1',
      hinh_anh_kiem_duyet: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=600&q=80'
    }
  ],
  log_in_hoa_don: [],
  tao_ma_qr: [],
  lich_su_thu_chi: [
    { id_lich_su_thu_chi: 'tc-1', id_loai_giao_dich: 'dm-1', so_tien: 11895000, phuong_thuc_thanh_toan_id: 'dm-pay-transfer', so_du_cuoi: 11895000, nguon_goc_bang: 'chi_tiet_giao_dich', id_giao_dich_goc: 'hs-1', noi_dung: 'Thu tiền SIM 0988.888.888' }
  ],
  phieu_dem_tien: []
};

// HELPER ROUTE BUILDER
function registerEndpoints(tableName, mockArray) {
  // GET
  app.get(`/api/${tableName}`, async (req, res) => {
    try {
      if (isRealSupabase) {
        const { data, error } = await supabase.from(tableName).select('*');
        if (error) throw error;
        return res.json(data);
      } else {
        return res.json(mockArray);
      }
    } catch (err) {
      console.error(`Lỗi khi lấy dữ liệu từ bảng ${tableName}:`, err);
      res.status(500).json({ error: err.message });
    }
  });

  // POST
  app.post(`/api/${tableName}`, async (req, res) => {
    try {
      const idPrefix = tableName.substring(0, 4);
      const newItem = { 
        ...req.body,
        [`id_${tableName}`]: req.body[`id_${tableName}`] || `${idPrefix}-${Date.now()}`,
        ngay_tao: new Date().toISOString(),
        ngay_sua: new Date().toISOString()
      };

      if (isRealSupabase) {
        const cleanItem = { ...req.body };
        const { data, error } = await supabase.from(tableName).insert([cleanItem]).select();
        if (error) throw error;
        return res.status(201).json(data[0]);
      } else {
        // Thực hiện tự động cập nhật thống kê Khách hàng khi lập chi tiết giao dịch
        if (tableName === 'chi_tiet_giao_dich') {
          const hsdv = mockDb.ho_so_dich_vu.find(h => h.id_ho_so_dich_vu === newItem.id_ho_so_dich_vu);
          if (hsdv && hsdv.id_khach_hang) {
            const kh = mockDb.khach_hang.find(k => k.id_khach_hang === hsdv.id_khach_hang);
            if (kh) {
              kh.tong_giao_dich = (kh.tong_giao_dich || 0) + 1;
              kh.tong_so_tien = (kh.tong_so_tien || 0) + parseFloat(newItem.so_tien_di || 0);
              kh.lan_giao_dich_cuoi = new Date().toISOString();
            }
          }
          
          // Ghi vào sổ cái tự động
          const lstc = {
            id_lich_su_thu_chi: `tc-${Date.now()}`,
            id_loai_giao_dich: newItem.id_trang_thai || 'dm-1',
            so_tien: newItem.so_tien_di || 0,
            phuong_thuc_thanh_toan_id: newItem.id_pttt_nguon || 'dm-pay-transfer',
            so_du_cuoi: 0,
            nguon_goc_bang: 'chi_tiet_giao_dich',
            id_giao_dich_goc: newItem.id_ho_so_dich_vu,
            noi_dung: newItem.noi_dung || 'Thu tiền dịch vụ',
            ngay_tao: new Date().toISOString()
          };
          mockDb.lich_su_thu_chi.push(lstc);
        }

        mockArray.push(newItem);
        return res.status(201).json(newItem);
      }
    } catch (err) {
      console.error(`Lỗi khi chèn dữ liệu vào bảng ${tableName}:`, err);
      res.status(500).json({ error: err.message });
    }
  });
}

// Đăng ký toàn bộ 17 bảng trong Schema V2
registerEndpoints('phan_loai', mockDb.phan_loai);
registerEndpoints('dm_danh_muc', mockDb.dm_danh_muc);
registerEndpoints('nhom_menu', mockDb.nhom_menu);
registerEndpoints('loai_dich_vu', mockDb.loai_dich_vu);
registerEndpoints('menu', mockDb.menu);
registerEndpoints('ql_cot_du_lieu', mockDb.ql_cot_du_lieu);
registerEndpoints('quan_ly_chu_ky', mockDb.quan_ly_chu_ky);
registerEndpoints('danh_muc_dich_vu', mockDb.danh_muc_dich_vu);
registerEndpoints('ma_hop_dong', mockDb.ma_hop_dong);
registerEndpoints('khach_hang', mockDb.khach_hang);
registerEndpoints('ho_so_dich_vu', mockDb.ho_so_dich_vu);
registerEndpoints('chi_tiet_giao_dich', mockDb.chi_tiet_giao_dich);
registerEndpoints('log_in_hoa_don', mockDb.log_in_hoa_don);
registerEndpoints('tao_ma_qr', mockDb.tao_ma_qr);
registerEndpoints('lich_su_thu_chi', mockDb.lich_su_thu_chi);
registerEndpoints('phieu_dem_tien', mockDb.phieu_dem_tien);

// BACKWARD-COMPATIBILITY ALIASES ĐỂ FRONTEND CŨ KHÔNG BỊ LỖI TRƯỚC KHI NÂNG CẤP
app.get('/api/giao_dich', async (req, res) => {
  if (isRealSupabase) {
    const { data, error } = await supabase.from('ho_so_dich_vu').select('*');
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data.map(d => ({ ...d, id_giao_dich: d.id_ho_so_dich_vu })));
  } else {
    return res.json(mockDb.ho_so_dich_vu.map(d => ({ ...d, id_giao_dich: d.id_ho_so_dich_vu })));
  }
});

app.post('/api/giao_dich', async (req, res) => {
  const payload = {
    id_ho_so_dich_vu: req.body.id_giao_dich || `hs-${Date.now()}`,
    id_khach_hang: req.body.id_khach_hang,
    id_loai_dich_vu: req.body.id_loai_dich_vu || 'ldv-1',
    id_ma_hop_dong: req.body.id_ma_hop_dong,
    noi_dung: req.body.noi_dung || 'Giao dịch mới',
    ghi_chu: req.body.ghi_chu,
    ngay_tao: new Date().toISOString(),
    ngay_sua: new Date().toISOString()
  };

  if (isRealSupabase) {
    const { data, error } = await supabase.from('ho_so_dich_vu').insert([payload]).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ ...data[0], id_giao_dich: data[0].id_ho_so_dich_vu });
  } else {
    mockDb.ho_so_dich_vu.push(payload);
    return res.status(201).json({ ...payload, id_giao_dich: payload.id_ho_so_dich_vu });
  }
});

app.get('/api/chuyen_khoan_chi_tiet', async (req, res) => {
  if (isRealSupabase) {
    const { data, error } = await supabase.from('chi_tiet_giao_dich').select('*');
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data.map(d => ({ 
      ...d, 
      id_chuyen_khoan_chi_tiet: d.id_chi_tiet_giao_dich,
      id_giao_dich: d.id_ho_so_dich_vu,
      nguon_giao_dich_id_phuong_thuc_thanh_toan: d.id_pttt_nguon,
      nguon_phi_dich_vu_id_phuong_thuc_thanh_toan: d.id_pttt_phi,
      nguon_chuyen_di_id_phuong_thuc_thanh_toan: d.id_pttt_di
    })));
  } else {
    return res.json(mockDb.chi_tiet_giao_dich.map(d => ({ 
      ...d, 
      id_chuyen_khoan_chi_tiet: d.id_chi_tiet_giao_dich,
      id_giao_dich: d.id_ho_so_dich_vu,
      nguon_giao_dich_id_phuong_thuc_thanh_toan: d.id_pttt_nguon,
      nguon_phi_dich_vu_id_phuong_thuc_thanh_toan: d.id_pttt_phi,
      nguon_chuyen_di_id_phuong_thuc_thanh_toan: d.id_pttt_di
    })));
  }
});

app.post('/api/chuyen_khoan_chi_tiet', async (req, res) => {
  const payload = {
    id_chi_tiet_giao_dich: req.body.id_chuyen_khoan_chi_tiet || `ctgd-${Date.now()}`,
    id_nhan_vien: req.body.id_nhan_vien || 'nv-01',
    id_ho_so_dich_vu: req.body.id_giao_dich,
    id_loai_dich_vu: req.body.id_loai_dich_vu || 'ldv-1',
    id_pttt_nguon: req.body.nguon_giao_dich_id_phuong_thuc_thanh_toan || 'dm-pay-transfer',
    so_tien: req.body.so_tien || 0,
    so_tien_nhap_tay: req.body.so_tien_nhap_tay || 0,
    phi_dich_vu: req.body.phi_dich_vu || 0,
    chiet_khau: req.body.chiet_khau || 0,
    so_tien_giam: req.body.so_tien_giam || 0,
    id_pttt_di: req.body.nguon_chuyen_di_id_phuong_thuc_thanh_toan || 'dm-pay-transfer',
    so_tien_di: req.body.so_tien_di || 0,
    noi_dung: req.body.noi_dung || '',
    id_trang_thai: req.body.id_trang_thai || 'dm-1',
    hinh_anh_kiem_duyet: req.body.hinh_anh_kiem_duyet || '',
    id_chu_ky: req.body.id_chu_ky || 'ck-1',
    thoi_gian_giao_dich: req.body.thoi_gian_giao_dich || new Date().toISOString(),
    ngay_tao: new Date().toISOString(),
    ngay_sua: new Date().toISOString()
  };

  if (isRealSupabase) {
    const { data, error } = await supabase.from('chi_tiet_giao_dich').insert([payload]).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({
      ...data[0],
      id_chuyen_khoan_chi_tiet: data[0].id_chi_tiet_giao_dich,
      id_giao_dich: data[0].id_ho_so_dich_vu,
      nguon_giao_dich_id_phuong_thuc_thanh_toan: data[0].id_pttt_nguon,
      nguon_phi_dich_vu_id_phuong_thuc_thanh_toan: data[0].id_pttt_phi,
      nguon_chuyen_di_id_phuong_thuc_thanh_toan: data[0].id_pttt_di
    });
  } else {
    // Cập nhật tích lũy của khách hàng
    const hsdv = mockDb.ho_so_dich_vu.find(h => h.id_ho_so_dich_vu === payload.id_ho_so_dich_vu);
    if (hsdv && hsdv.id_khach_hang) {
      const kh = mockDb.khach_hang.find(k => k.id_khach_hang === hsdv.id_khach_hang);
      if (kh) {
        kh.tong_giao_dich = (kh.tong_giao_dich || 0) + 1;
        kh.tong_so_tien = (kh.tong_so_tien || 0) + parseFloat(payload.so_tien_di || 0);
        kh.lan_giao_dich_cuoi = new Date().toISOString();
      }
    }

    mockDb.chi_tiet_giao_dich.push(payload);
    return res.status(201).json({
      ...payload,
      id_chuyen_khoan_chi_tiet: payload.id_chi_tiet_giao_dich,
      id_giao_dich: payload.id_ho_so_dich_vu,
      nguon_giao_dich_id_phuong_thuc_thanh_toan: payload.id_pttt_nguon,
      nguon_phi_dich_vu_id_phuong_thuc_thanh_toan: payload.id_pttt_phi,
      nguon_chuyen_di_id_phuong_thuc_thanh_toan: payload.id_pttt_di
    });
  }
});

// Endpoint upload ảnh giả lập
app.post('/api/upload', (req, res) => {
  res.json({
    url: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=600&q=80'
  });
});

// Trang mặc định chuyển đến UI
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy thành công tại http://localhost:${PORT}`);
});
