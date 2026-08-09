-- 1. Bảng phân loại danh mục
CREATE TABLE IF NOT EXISTS phan_loai (
    id_phan_loai UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ten_phan_loai TEXT NOT NULL,
    icon TEXT,
    ghi_chu TEXT,
    ngay_tao TIMESTAMPTZ DEFAULT now(),
    ngay_sua TIMESTAMPTZ DEFAULT now()
);

-- 2. Bảng danh mục chi tiết (dm_danh_muc)
CREATE TABLE IF NOT EXISTS dm_danh_muc (
    id_danh_muc UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ten_danh_muc TEXT NOT NULL,
    id_phan_loai UUID REFERENCES phan_loai(id_phan_loai) ON DELETE CASCADE,
    index INT DEFAULT 0,
    icon TEXT,
    ghi_chu TEXT,
    ngay_tao TIMESTAMPTZ DEFAULT now(),
    ngay_sua TIMESTAMPTZ DEFAULT now()
);

-- 3. Bảng nhóm menu
CREATE TABLE IF NOT EXISTS nhom_menu (
    id_nhom UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ten_nhom TEXT NOT NULL,
    index INT DEFAULT 0,
    ghi_chu TEXT,
    ngay_tao TIMESTAMPTZ DEFAULT now(),
    ngay_sua TIMESTAMPTZ DEFAULT now()
);

-- 4. Bảng menu chức năng
CREATE TABLE IF NOT EXISTS menu (
    id_menu UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_nhom UUID REFERENCES nhom_menu(id_nhom) ON DELETE SET NULL,
    id_loai_dich_vu UUID, -- có thể liên kết với danh mục dịch vụ/loại dịch vụ
    view_link TEXT,
    index INT DEFAULT 0,
    ghi_chu TEXT,
    ngay_tao TIMESTAMPTZ DEFAULT now(),
    ngay_sua TIMESTAMPTZ DEFAULT now()
);

-- 5. Bảng cấu hình cột dữ liệu động
CREATE TABLE IF NOT EXISTS ql_cot_du_lieu (
    id_ql_cot_du_lieu UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_ten_bang TEXT NOT NULL,
    id_loai_dich_vu UUID,
    id_ten_cot TEXT NOT NULL,
    noi_dung_hien_thi TEXT NOT NULL,
    is_an_cot BOOLEAN DEFAULT false,
    ghi_chu TEXT,
    ngay_tao TIMESTAMPTZ DEFAULT now(),
    ngay_sua TIMESTAMPTZ DEFAULT now()
);

-- 6. Bảng quản lý chữ ký & thông tin cửa hàng
CREATE TABLE IF NOT EXISTS quan_ly_chu_ky (
    id_chu_ky UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ten_chu_ky TEXT NOT NULL,
    ten_cua_hang TEXT NOT NULL,
    sdt1 TEXT,
    sdt2 TEXT,
    dia_chi TEXT,
    zalo TEXT,
    facebook TEXT,
    dich_vu_1 TEXT,
    dich_vu_2 TEXT,
    dich_vu_3 TEXT,
    ghi_chu TEXT,
    ngay_tao TIMESTAMPTZ DEFAULT now(),
    ngay_sua TIMESTAMPTZ DEFAULT now()
);

-- 7. Bảng danh mục dịch vụ (Ngân hàng / dịch vụ quét VietQR)
CREATE TABLE IF NOT EXISTS danh_muc_dich_vu (
    id_danh_muc_dich_vu UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_loai_dich_vu UUID,
    ma_bin TEXT, -- Mã BIN Ngân hàng
    ten_dich_vu TEXT NOT NULL,
    ten_viet_tat TEXT,
    ten_viet_tat_2 TEXT,
    logo TEXT,
    ghi_chu TEXT,
    ngay_tao TIMESTAMPTZ DEFAULT now(),
    ngay_sua TIMESTAMPTZ DEFAULT now()
);

-- 8. Bảng mã hợp đồng
CREATE TABLE IF NOT EXISTS ma_hop_dong (
    id_ma_hop_dong UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_loai_dich_vu UUID,
    id_danh_muc_dich_vu UUID REFERENCES danh_muc_dich_vu(id_danh_muc_dich_vu) ON DELETE SET NULL,
    ma_hop_dong TEXT NOT NULL UNIQUE,
    chu_hop_dong TEXT,
    ghi_chu TEXT,
    ngay_tao TIMESTAMPTZ DEFAULT now(),
    ngay_sua TIMESTAMPTZ DEFAULT now()
);

-- 9. Bảng khách hàng
CREATE TABLE IF NOT EXISTS khach_hang (
    id_khach_hang UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    toggle_up_anh BOOLEAN DEFAULT false,
    anh_khach_hang TEXT,
    up_anh_khach_hang TEXT,
    id_doi_tuong UUID REFERENCES dm_danh_muc(id_danh_muc) ON DELETE SET NULL,
    ho_va_ten TEXT NOT NULL,
    ten_khac TEXT,
    so_dien_thoai TEXT NOT NULL,
    so_dien_thoai_2 TEXT,
    dia_chi TEXT,
    ngay_sinh DATE,
    id_gioi_tinh UUID REFERENCES dm_danh_muc(id_danh_muc) ON DELETE SET NULL,
    id_nghe_nghiep UUID REFERENCES dm_danh_muc(id_danh_muc) ON DELETE SET NULL,
    id_level UUID REFERENCES dm_danh_muc(id_danh_muc) ON DELETE SET NULL,
    ngay_tao TIMESTAMPTZ DEFAULT now(),
    ngay_sua TIMESTAMPTZ DEFAULT now()
);

-- 10. Bảng giao dịch chính (giao_dich)
CREATE TABLE IF NOT EXISTS giao_dich (
    id_giao_dich UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_khach_hang UUID REFERENCES khach_hang(id_khach_hang) ON DELETE CASCADE,
    id_loai_dich_vu UUID,
    id_ma_hop_dong UUID REFERENCES ma_hop_dong(id_ma_hop_dong) ON DELETE SET NULL,
    noi_dung TEXT,
    id_loai_icon UUID,
    link_icon_giao_dich TEXT,
    up_anh_icon_giao_dich TEXT,
    ghi_chu TEXT,
    ngay_tao TIMESTAMPTZ DEFAULT now(),
    ngay_sua TIMESTAMPTZ DEFAULT now()
);

-- 11. Bảng chi tiết giao dịch/chuyển khoản (chuyen_khoan_chi_tiet)
CREATE TABLE IF NOT EXISTS chuyen_khoan_chi_tiet (
    id_chuyen_khoan_chi_tiet UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_nhan_vien UUID, -- Liên kết với Nhân viên (auth.users hoặc bảng nhân viên riêng)
    id_giao_dich UUID REFERENCES giao_dich(id_giao_dich) ON DELETE CASCADE,
    nguon_giao_dich_id_phuong_thuc_thanh_toan UUID REFERENCES dm_danh_muc(id_danh_muc) ON DELETE SET NULL,
    so_tien NUMERIC(15, 2) DEFAULT 0,
    so_tien_nhap_tay NUMERIC(15, 2) DEFAULT 0,
    id_phi_ngoai UUID,
    id_cach_tinh_phi UUID,
    nguon_phi_dich_vu_id_phuong_thuc_thanh_toan UUID REFERENCES dm_danh_muc(id_danh_muc) ON DELETE SET NULL,
    phi_dich_vu NUMERIC(15, 2) DEFAULT 0,
    phi_dich_vu_nhap_tay NUMERIC(15, 2) DEFAULT 0,
    chiet_khau NUMERIC(5, 2) DEFAULT 0, -- tỷ lệ %
    toggle_so_tien_giam BOOLEAN DEFAULT false,
    so_tien_giam NUMERIC(15, 2) DEFAULT 0,
    nguon_chuyen_di_id_phuong_thuc_thanh_toan UUID REFERENCES dm_danh_muc(id_danh_muc) ON DELETE SET NULL,
    so_tien_di NUMERIC(15, 2) DEFAULT 0,
    noi_dung TEXT,
    id_trang_thai UUID REFERENCES dm_danh_muc(id_danh_muc) ON DELETE SET NULL,
    hinh_anh_kiem_duyet TEXT,
    file_in TEXT,
    id_chu_ky UUID REFERENCES quan_ly_chu_ky(id_chu_ky) ON DELETE SET NULL,
    ghi_chu TEXT,
    thoi_gian_giao_dich TIMESTAMPTZ,
    ngay_tao TIMESTAMPTZ DEFAULT now(),
    ngay_sua TIMESTAMPTZ DEFAULT now()
);

-- 12. Bảng nhật ký in hóa đơn
CREATE TABLE IF NOT EXISTS log_in_hoa_don (
    id_log_in_hoa_don UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_hoa_don UUID REFERENCES giao_dich(id_giao_dich) ON DELETE CASCADE,
    noi_dung_in TEXT,
    ghi_chu TEXT,
    ngay_tao TIMESTAMPTZ DEFAULT now(),
    ngay_sua TIMESTAMPTZ DEFAULT now()
);

-- 13. Bảng tạo mã QR thanh toán
CREATE TABLE IF NOT EXISTS tao_ma_qr (
    id_tao_ma_qr UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_chuyen_khoan_chi_tiet UUID REFERENCES chuyen_khoan_chi_tiet(id_chuyen_khoan_chi_tiet) ON DELETE CASCADE,
    id_loai_khach_hang UUID REFERENCES dm_danh_muc(id_danh_muc) ON DELETE SET NULL,
    id_khach_hang UUID REFERENCES khach_hang(id_khach_hang) ON DELETE SET NULL,
    id_giao_dich UUID REFERENCES giao_dich(id_giao_dich) ON DELETE SET NULL,
    id_link_tu_dong TEXT,
    id_danh_muc_dich_vu UUID REFERENCES danh_muc_dich_vu(id_danh_muc_dich_vu) ON DELETE SET NULL,
    so_tai_khoan TEXT,
    chu_tai_khoan TEXT,
    noi_dung_chuyen TEXT,
    ghi_chu TEXT,
    ngay_tao TIMESTAMPTZ DEFAULT now(),
    ngay_sua TIMESTAMPTZ DEFAULT now()
);

-- 14. Bảng lịch sử thu chi dòng tiền (Ledger)
CREATE TABLE IF NOT EXISTS lich_su_thu_chi (
    id_lich_su_thu_chi UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_loai_giao_dich UUID REFERENCES dm_danh_muc(id_danh_muc) ON DELETE SET NULL,
    so_tien NUMERIC(15, 2) DEFAULT 0,
    phuong_thuc_thanh_toan_id UUID REFERENCES dm_danh_muc(id_danh_muc) ON DELETE SET NULL,
    so_du_cuoi NUMERIC(15, 2) DEFAULT 0,
    nguon_goc_bang TEXT,
    id_giao_dich_goc UUID,
    noi_dung TEXT,
    ngay_tao TIMESTAMPTZ DEFAULT now()
);

-- 15. Bảng lập phiếu đếm tiền mặt
CREATE TABLE IF NOT EXISTS phieu_dem_tien (
    id_phieu_dem_tien UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_chuyen_khoan_chi_tiet UUID REFERENCES chuyen_khoan_chi_tiet(id_chuyen_khoan_chi_tiet) ON DELETE CASCADE,
    ngay_dem TIMESTAMPTZ DEFAULT now(),
    nguoi_dem TEXT,
    so_to_500k INT DEFAULT 0,
    so_to_200k INT DEFAULT 0,
    so_to_100k INT DEFAULT 0,
    so_to_50k INT DEFAULT 0,
    so_to_20k INT DEFAULT 0,
    so_to_10k INT DEFAULT 0,
    so_to_5k INT DEFAULT 0,
    so_to_20k INT DEFAULT 0, -- dự phòng
    so_to_2k INT DEFAULT 0,
    so_to_1k INT DEFAULT 0,
    so_to_500d INT DEFAULT 0,
    ngay_tao TIMESTAMPTZ DEFAULT now(),
    ngay_sua TIMESTAMPTZ DEFAULT now()
);

-- =========================================
-- Bật chế độ ROW LEVEL SECURITY (RLS) & Tạo Policies
-- =========================================
ALTER TABLE phan_loai ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_danh_muc ENABLE ROW LEVEL SECURITY;
ALTER TABLE nhom_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE ql_cot_du_lieu ENABLE ROW LEVEL SECURITY;
ALTER TABLE quan_ly_chu_ky ENABLE ROW LEVEL SECURITY;
ALTER TABLE danh_muc_dich_vu ENABLE ROW LEVEL SECURITY;
ALTER TABLE ma_hop_dong ENABLE ROW LEVEL SECURITY;
ALTER TABLE khach_hang ENABLE ROW LEVEL SECURITY;
ALTER TABLE giao_dich ENABLE ROW LEVEL SECURITY;
ALTER TABLE chuyen_khoan_chi_tiet ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_in_hoa_don ENABLE ROW LEVEL SECURITY;
ALTER TABLE tao_ma_qr ENABLE ROW LEVEL SECURITY;
ALTER TABLE lich_su_thu_chi ENABLE ROW LEVEL SECURITY;
ALTER TABLE phieu_dem_tien ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid collision
DROP POLICY IF EXISTS "Allow all for anon" ON phan_loai;
DROP POLICY IF EXISTS "Allow all for anon" ON dm_danh_muc;
DROP POLICY IF EXISTS "Allow all for anon" ON nhom_menu;
DROP POLICY IF EXISTS "Allow all for anon" ON menu;
DROP POLICY IF EXISTS "Allow all for anon" ON ql_cot_du_lieu;
DROP POLICY IF EXISTS "Allow all for anon" ON quan_ly_chu_ky;
DROP POLICY IF EXISTS "Allow all for anon" ON danh_muc_dich_vu;
DROP POLICY IF EXISTS "Allow all for anon" ON ma_hop_dong;
DROP POLICY IF EXISTS "Allow all for anon" ON khach_hang;
DROP POLICY IF EXISTS "Allow all for anon" ON giao_dich;
DROP POLICY IF EXISTS "Allow all for anon" ON chuyen_khoan_chi_tiet;
DROP POLICY IF EXISTS "Allow all for anon" ON log_in_hoa_don;
DROP POLICY IF EXISTS "Allow all for anon" ON tao_ma_qr;
DROP POLICY IF EXISTS "Allow all for anon" ON lich_su_thu_chi;
DROP POLICY IF EXISTS "Allow all for anon" ON phieu_dem_tien;

-- Cấp quyền truy cập mở cho việc chạy thử (tương tự dự án ql sim)
CREATE POLICY "Allow all for anon" ON phan_loai FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON dm_danh_muc FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON nhom_menu FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON menu FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON ql_cot_du_lieu FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON quan_ly_chu_ky FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON danh_muc_dich_vu FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON ma_hop_dong FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON khach_hang FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON giao_dich FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON chuyen_khoan_chi_tiet FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON log_in_hoa_don FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON tao_ma_qr FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON lich_su_thu_chi FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON phieu_dem_tien FOR ALL USING (true) WITH CHECK (true);
