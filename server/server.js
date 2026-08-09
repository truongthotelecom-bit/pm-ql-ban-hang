const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Kết nối Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const isRealSupabase = supabaseUrl && !supabaseUrl.includes('your-project-id') && supabaseKey;

let supabase;
if (isRealSupabase) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('💚 Backend đã kết nối với Supabase thực tế.');
} else {
  console.log('⚡ Backend đang sử dụng Mock Database để chạy thử nghiệm.');
}

// ----------------------------------------------------
// MOCK DATABASE & DEMO SEED DATA
// ----------------------------------------------------
const mockDb = {
  phan_loai: [
    { id_phan_loai: 'pl-1', ten_phan_loai: 'Trạng thái giao dịch', icon: 'CheckSquare' },
    { id_phan_loai: 'pl-2', ten_phan_loai: 'Phương thức thanh toán', icon: 'CreditCard' },
    { id_phan_loai: 'pl-3', ten_phan_loai: 'Hạng khách hàng', icon: 'Award' },
    { id_phan_loai: 'pl-4', ten_phan_loai: 'Giới tính', icon: 'User' }
  ],
  dm_danh_muc: [
    { id_danh_muc: 'dm-status-success', ten_danh_muc: 'Thành công', id_phan_loai: 'pl-1', index: 1, icon: 'CheckCircle2' },
    { id_danh_muc: 'dm-status-pending', ten_danh_muc: 'Chờ duyệt', id_phan_loai: 'pl-1', index: 2, icon: 'Clock' },
    { id_danh_muc: 'dm-status-failed', ten_danh_muc: 'Thất bại', id_phan_loai: 'pl-1', index: 3, icon: 'XCircle' },
    { id_danh_muc: 'dm-pay-transfer', ten_danh_muc: 'Chuyển khoản', id_phan_loai: 'pl-2', index: 1, icon: 'Send' },
    { id_danh_muc: 'dm-pay-cash', ten_danh_muc: 'Tiền mặt', id_phan_loai: 'pl-2', index: 2, icon: 'Wallet' },
    { id_danh_muc: 'dm-lvl-vip', ten_danh_muc: 'VIP Vàng', id_phan_loai: 'pl-3', index: 1, icon: 'Zap' },
    { id_danh_muc: 'dm-lvl-member', ten_danh_muc: 'Thành viên', id_phan_loai: 'pl-3', index: 2, icon: 'UserCheck' },
    { id_danh_muc: 'dm-gender-male', ten_danh_muc: 'Nam', id_phan_loai: 'pl-4', index: 1, icon: 'Mars' },
    { id_danh_muc: 'dm-gender-female', ten_danh_muc: 'Nữ', id_phan_loai: 'pl-4', index: 2, icon: 'Venus' }
  ],
  nhom_menu: [
    { id_nhom: 'nm-1', ten_nhom: 'Giao dịch nhanh', index: 1, ghi_chu: 'Quầy giao dịch chính' },
    { id_nhom: 'nm-2', ten_nhom: 'Báo cáo & Cài đặt', index: 2, ghi_chu: 'Thống kê tổng quan' }
  ],
  menu: [
    { id_menu: 'm-1', id_nhom: 'nm-1', id_loai_dich_vu: null, view_link: 'dashboard', index: 1, ghi_chu: 'Dashboard dịch vụ' },
    { id_menu: 'm-2', id_nhom: 'nm-1', id_loai_dich_vu: null, view_link: 'transactions', index: 2, ghi_chu: 'Danh sách giao dịch' },
    { id_menu: 'm-3', id_nhom: 'nm-1', id_loai_dich_vu: null, view_link: 'customers', index: 3, ghi_chu: 'Danh mục khách hàng' },
    { id_menu: 'm-4', id_nhom: 'nm-2', id_loai_dich_vu: null, view_link: 'settings', index: 4, ghi_chu: 'Cấu hình chữ ký' }
  ],
  ql_cot_du_lieu: [
    { id_ql_cot_du_lieu: 'col-1', id_ten_bang: 'giao_dich', id_ten_cot: 'id_khach_hang', noi_dung_hien_thi: 'Khách hàng', is_an_cot: false, ghi_chu: 'required' },
    { id_ql_cot_du_lieu: 'col-2', id_ten_bang: 'giao_dich', id_ten_cot: 'id_ma_hop_dong', noi_dung_hien_thi: 'Mã hợp đồng', is_an_cot: false, ghi_chu: 'select' },
    { id_ql_cot_du_lieu: 'col-3', id_ten_bang: 'giao_dich', id_ten_cot: 'so_tien', noi_dung_hien_thi: 'Số tiền nạp (đ)', is_an_cot: false, ghi_chu: 'money' },
    { id_ql_cot_du_lieu: 'col-4', id_ten_bang: 'giao_dich', id_ten_cot: 'phi_dich_vu', noi_dung_hien_thi: 'Phí dịch vụ ngoài (đ)', is_an_cot: false, ghi_chu: 'money' },
    { id_ql_cot_du_lieu: 'col-5', id_ten_bang: 'giao_dich', id_ten_cot: 'chiet_khau', noi_dung_hien_thi: 'Chiết khấu (%)', is_an_cot: false, ghi_chu: 'number' },
    { id_ql_cot_du_lieu: 'col-6', id_ten_bang: 'giao_dich', id_ten_cot: 'id_trang_thai', noi_dung_hien_thi: 'Trạng thái giao dịch', is_an_cot: false, ghi_chu: 'select' }
  ],
  quan_ly_chu_ky: [
    {
      id_chu_ky: 'sig-1',
      ten_chu_ky: 'Kế toán trưởng',
      ten_cua_hang: 'AURA FINTECH HUB - POS & SIM',
      sdt1: '0988.888.888',
      sdt2: '0911.222.333',
      dia_chi: '88 Cầu Giấy, Quan Hoa, Cầu Giấy, Hà Nội',
      zalo: '0988888888',
      facebook: 'facebook.com/aurafintech',
      dich_vu_1: 'Chuyển tiền nhanh 24/7',
      dich_vu_2: 'Thanh toán QR-Code POS',
      dich_vu_3: 'Dịch vụ Viễn thông cao cấp'
    }
  ],
  danh_muc_dich_vu: [
    { id_danh_muc_dich_vu: 'bank-vcb', ma_bin: '970436', ten_dich_vu: 'Ngân hàng Ngoại Thương VN', ten_viet_tat: 'Vietcombank', logo: 'https://img.vietqr.io/image/vietcombank-logo.png' },
    { id_danh_muc_dich_vu: 'bank-tcb', ma_bin: '970407', ten_dich_vu: 'Ngân hàng Kỹ Thương VN', ten_viet_tat: 'Techcombank', logo: 'https://img.vietqr.io/image/techcombank-logo.png' },
    { id_danh_muc_dich_vu: 'bank-mbb', ma_bin: '970422', ten_dich_vu: 'Ngân hàng Quân Đội', ten_viet_tat: 'MBBank', logo: 'https://img.vietqr.io/image/mbbank-logo.png' }
  ],
  ma_hop_dong: [
    { id_ma_hop_dong: 'hd-001', ma_hop_dong: 'AURA-POS-9921', chu_hop_dong: 'Phạm Minh Đức', ghi_chu: 'Hợp đồng liên kết POS' },
    { id_ma_hop_dong: 'hd-002', ma_hop_dong: 'AURA-SIM-1120', chu_hop_dong: 'Nguyễn Bích Phương', ghi_chu: 'Hợp đồng cung cấp Sim số Vip' }
  ],
  khach_hang: [
    {
      id_khach_hang: 'cust-1',
      toggle_up_anh: false,
      anh_khach_hang: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      up_anh_khach_hang: '',
      id_doi_tuong: 'dm-lvl-vip',
      ho_va_ten: 'Phạm Minh Đức',
      ten_khac: 'Đức Bill',
      so_dien_thoai: '0966778899',
      so_dien_thoai_2: '0988223344',
      dia_chi: 'Xuân Thủy, Cầu Giấy, Hà Nội',
      ngay_sinh: '1992-06-15',
      id_gioi_tinh: 'dm-gender-male',
      id_level: 'dm-lvl-vip'
    },
    {
      id_khach_hang: 'cust-2',
      toggle_up_anh: false,
      anh_khach_hang: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      up_anh_khach_hang: '',
      id_doi_tuong: 'dm-lvl-member',
      ho_va_ten: 'Nguyễn Bích Phương',
      ten_khac: 'Phương Sim',
      so_dien_thoai: '0912345678',
      so_dien_thoai_2: '',
      dia_chi: 'Nguyễn Trãi, Thanh Xuân, Hà Nội',
      ngay_sinh: '1995-10-20',
      id_gioi_tinh: 'dm-gender-female',
      id_level: 'dm-lvl-member'
    }
  ],
  giao_dich: [
    {
      id_giao_dich: 'gd-001',
      id_khach_hang: 'cust-1',
      id_loai_dich_vu: null,
      id_ma_hop_dong: 'hd-001',
      noi_dung: 'Giao dịch nạp quỹ chuyển khoản POS doanh nghiệp',
      id_loai_icon: null,
      link_icon_giao_dich: '',
      up_anh_icon_giao_dich: '',
      ghi_chu: 'Nạp quỹ Techcombank'
    }
  ],
  chuyen_khoan_chi_tiet: [
    {
      id_chuyen_khoan_chi_tiet: 'ckct-001',
      id_nhan_vien: 'usr-admin',
      id_giao_dich: 'gd-001',
      id_khach_hang: 'cust-1', // Cột hỗ trợ truy vấn nhanh ở mock
      nguon_giao_dich_id_phuong_thuc_thanh_toan: 'dm-pay-transfer',
      so_tien: 25000000,
      so_tien_nhap_tay: 25000000,
      phi_dich_vu: 50000,
      chiet_khau: 0,
      so_tien_giam: 0,
      so_tien_di: 25050000,
      noi_dung: 'Thanh toán hợp đồng POS AURA-POS-9921',
      id_trang_thai: 'dm-status-success',
      hinh_anh_kiem_duyet: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=600&q=80',
      id_chu_ky: 'sig-1',
      thoi_gian_giao_dich: new Date().toISOString()
    }
  ],
  log_in_hoa_don: [],
  tao_ma_qr: [],
  lich_su_thu_chi: [
    {
      id_lich_su_thu_chi: 'tc-001',
      id_loai_giao_dich: 'dm-status-success',
      so_tien: 25050000,
      phuong_thuc_thanh_toan_id: 'dm-pay-transfer',
      so_du_cuoi: 25050000,
      nguon_goc_bang: 'chuyen_khoan_chi_tiet',
      id_giao_dich_goc: 'gd-001',
      noi_dung: 'Thu tiền tự động giao dịch POS AURA-POS-9921',
      ngay_tao: new Date().toISOString()
    }
  ],
  phieu_dem_tien: []
};

// ----------------------------------------------------
// LEDGER AUTO-TRIGGER CONTROLLER
// ----------------------------------------------------
function triggerLedgerInsert(transaction) {
  const isIncome = transaction.id_trang_thai === 'dm-status-success';
  const amount = transaction.so_tien_di || (parseFloat(transaction.so_tien || 0) + parseFloat(transaction.phi_dich_vu || 0) - parseFloat(transaction.so_tien_giam || 0));
  
  // Tính toán số dư cuối tích lũy
  const lastLedger = mockDb.lich_su_thu_chi[mockDb.lich_su_thu_chi.length - 1];
  const lastBalance = lastLedger ? parseFloat(lastLedger.so_du_cuoi) : 0;
  const newBalance = lastBalance + (isIncome ? amount : -amount);

  const newLedgerItem = {
    id_lich_su_thu_chi: `tc-${Date.now()}`,
    id_loai_giao_dich: transaction.id_trang_thai,
    so_tien: amount,
    phuong_thuc_thanh_toan_id: transaction.nguon_giao_dich_id_phuong_thuc_thanh_toan,
    so_du_cuoi: newBalance,
    nguon_goc_bang: 'chuyen_khoan_chi_tiet',
    id_giao_dich_goc: transaction.id_giao_dich,
    noi_dung: `Tự động ghi sổ cái: ${transaction.noi_dung}`,
    ngay_tao: new Date().toISOString()
  };

  mockDb.lich_su_thu_chi.push(newLedgerItem);
  console.log('📊 Ledger đã tự động cập nhật bản ghi mới:', newLedgerItem);
}

// ----------------------------------------------------
// EXPRESS GENERIC CRUD CONTROLLER CREATOR
// ----------------------------------------------------
function buildCRUD(tableName, mockArray) {
  // 1. GET ALL
  app.get(`/api/${tableName}`, async (req, res) => {
    try {
      if (isRealSupabase) {
        const { data, error } = await supabase.from(tableName).select('*').order('ngay_tao', { ascending: false });
        if (error) throw error;
        return res.json(data);
      } else {
        return res.json(mockArray);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. GET BY ID
  app.get(`/api/${tableName}/:id`, async (req, res) => {
    try {
      const idKey = `id_${tableName}`;
      if (isRealSupabase) {
        const { data, error } = await supabase.from(tableName).select('*').eq(idKey, req.params.id).single();
        if (error) throw error;
        return res.json(data);
      } else {
        const item = mockArray.find(x => x[idKey] === req.params.id);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        return res.json(item);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. CREATE (POST)
  app.post(`/api/${tableName}`, async (req, res) => {
    try {
      const idKey = `id_${tableName}`;
      const payload = {
        ...req.body,
        [idKey]: req.body[idKey] || `${tableName.substring(0, 3)}-${Date.now()}`,
        ngay_tao: new Date().toISOString(),
        ngay_sua: new Date().toISOString()
      };

      if (isRealSupabase) {
        const cleanPayload = { ...req.body };
        const { data, error } = await supabase.from(tableName).insert([cleanPayload]).select();
        if (error) throw error;
        return res.status(201).json(data[0]);
      } else {
        mockArray.push(payload);
        
        // Kích hoạt Ledger tự động nếu là tạo chi tiết giao dịch thành công
        if (tableName === 'chuyen_khoan_chi_tiet') {
          triggerLedgerInsert(payload);
        }

        return res.status(201).json(payload);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. UPDATE (PUT)
  app.put(`/api/${tableName}/:id`, async (req, res) => {
    try {
      const idKey = `id_${tableName}`;
      if (isRealSupabase) {
        const cleanPayload = { ...req.body, ngay_sua: new Date().toISOString() };
        const { data, error } = await supabase.from(tableName).update(cleanPayload).eq(idKey, req.params.id).select();
        if (error) throw error;
        return res.json(data[0]);
      } else {
        const index = mockArray.findIndex(x => x[idKey] === req.params.id);
        if (index === -1) return res.status(404).json({ error: 'Item not found' });
        
        mockArray[index] = { ...mockArray[index], ...req.body, ngay_sua: new Date().toISOString() };
        return res.json(mockArray[index]);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. DELETE
  app.delete(`/api/${tableName}/:id`, async (req, res) => {
    try {
      const idKey = `id_${tableName}`;
      if (isRealSupabase) {
        const { data, error } = await supabase.from(tableName).delete().eq(idKey, req.params.id).select();
        if (error) throw error;
        return res.json({ success: true, deleted: data });
      } else {
        const index = mockArray.findIndex(x => x[idKey] === req.params.id);
        if (index === -1) return res.status(404).json({ error: 'Item not found' });
        
        const deleted = mockArray.splice(index, 1);
        return res.json({ success: true, deleted });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// Đăng ký toàn bộ 15 bảng CRUD
Object.keys(mockDb).forEach(table => {
  buildCRUD(table, mockDb[table]);
});

// ----------------------------------------------------
// STORAGE MOCK UPLOAD API
// ----------------------------------------------------
app.post('/api/upload', (req, res) => {
  // Trả về URL mock ngẫu nhiên cực đẹp
  const mockImages = [
    'https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=600&q=80'
  ];
  const randomUrl = mockImages[Math.floor(Math.random() * mockImages.length)];
  return res.json({ url: randomUrl });
});

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`🚀 CRM Backend Server đang hoạt động tại cổng http://localhost:${PORT}`);
});
