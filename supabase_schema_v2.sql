-- ============================================================
-- SUPABASE SCHEMA V3.1 - HỆ THỐNG QUẢN LÝ GIAO DỊCH ĐA DỊCH VỤ
-- ============================================================
-- Thay đổi chính:
--   1. Xóa bảng Master (phan_loai, dm_danh_muc) 
--   2. Tạo 9 bảng danh mục cụ thể (dm_trang_thai_giao_dich, dm_phuong_thuc_thanh_toan...)
--   3. Thêm tiền tố sys_ cho 6 bảng hệ thống/cấu hình
--   4. Cập nhật khóa ngoại toàn hệ thống
-- ============================================================

-- ========================
-- XÓA BẢNG CŨ (nếu có)
-- ========================
DROP TABLE IF EXISTS public.phieu_dem_tien CASCADE;
DROP TABLE IF EXISTS public.tao_ma_qr CASCADE;
DROP TABLE IF EXISTS public.log_in_hoa_don CASCADE;
DROP TABLE IF EXISTS public.lich_su_thu_chi CASCADE;
DROP TABLE IF EXISTS public.chi_tiet_giao_dich CASCADE;
DROP TABLE IF EXISTS public.ho_so_dich_vu CASCADE;
DROP TABLE IF EXISTS public.giao_dich CASCADE;
DROP TABLE IF EXISTS public.ma_hop_dong CASCADE;
DROP TABLE IF EXISTS public.khach_hang CASCADE;

-- Bảng cấu hình (sys_)
DROP TABLE IF EXISTS public.sys_ql_cot_du_lieu CASCADE;
DROP TABLE IF EXISTS public.sys_menu CASCADE;
DROP TABLE IF EXISTS public.sys_danh_muc_dich_vu CASCADE;
DROP TABLE IF EXISTS public.sys_diem_ban CASCADE;
DROP TABLE IF EXISTS public.sys_loai_dich_vu CASCADE;
DROP TABLE IF EXISTS public.sys_nhom_menu CASCADE;
DROP TABLE IF EXISTS public.sys_quan_ly_chu_ky CASCADE;

-- Bảng cấu hình cũ (nếu user chưa chạy bản trước)
DROP TABLE IF EXISTS public.ql_cot_du_lieu CASCADE;
DROP TABLE IF EXISTS public.menu CASCADE;
DROP TABLE IF EXISTS public.danh_muc_dich_vu CASCADE;
DROP TABLE IF EXISTS public.loai_dich_vu CASCADE;
DROP TABLE IF EXISTS public.nhom_menu CASCADE;
DROP TABLE IF EXISTS public.quan_ly_chu_ky CASCADE;

-- Bảng danh mục cũ
DROP TABLE IF EXISTS public.dm_danh_muc CASCADE;
DROP TABLE IF EXISTS public.phan_loai CASCADE;

-- Bảng danh mục mới
DROP TABLE IF EXISTS public.dm_trang_thai_giao_dich CASCADE;
DROP TABLE IF EXISTS public.dm_phuong_thuc_thanh_toan CASCADE;
DROP TABLE IF EXISTS public.dm_hang_khach_hang CASCADE;
DROP TABLE IF EXISTS public.dm_gioi_tinh CASCADE;
DROP TABLE IF EXISTS public.dm_doi_tuong_kh CASCADE;
DROP TABLE IF EXISTS public.dm_nghe_nghiep CASCADE;
DROP TABLE IF EXISTS public.dm_loai_gd_thu_chi CASCADE;
DROP TABLE IF EXISTS public.dm_cach_tinh_phi CASCADE;
DROP TABLE IF EXISTS public.dm_loai_icon CASCADE;


-- ============================================================
-- 1. CÁC BẢNG DANH MỤC (Dictionaries)
-- ============================================================

CREATE TABLE public.dm_trang_thai_giao_dich (
  id_trang_thai uuid NOT NULL DEFAULT gen_random_uuid(),
  ten_trang_thai text NOT NULL,
  icon text,
  index integer DEFAULT 0,
  ghi_chu text,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  CONSTRAINT dm_trang_thai_pkey PRIMARY KEY (id_trang_thai)
) TABLESPACE pg_default;

CREATE TABLE public.dm_phuong_thuc_thanh_toan (
  id_pttt uuid NOT NULL DEFAULT gen_random_uuid(),
  ten_pttt text NOT NULL,
  icon text,
  index integer DEFAULT 0,
  ghi_chu text,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  CONSTRAINT dm_pttt_pkey PRIMARY KEY (id_pttt)
) TABLESPACE pg_default;

CREATE TABLE public.dm_hang_khach_hang (
  id_hang uuid NOT NULL DEFAULT gen_random_uuid(),
  ten_hang text NOT NULL,
  icon text,
  index integer DEFAULT 0,
  ghi_chu text,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  CONSTRAINT dm_hang_kh_pkey PRIMARY KEY (id_hang)
) TABLESPACE pg_default;

CREATE TABLE public.dm_gioi_tinh (
  id_gioi_tinh uuid NOT NULL DEFAULT gen_random_uuid(),
  ten_gioi_tinh text NOT NULL,
  icon text,
  index integer DEFAULT 0,
  ghi_chu text,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  CONSTRAINT dm_gioi_tinh_pkey PRIMARY KEY (id_gioi_tinh)
) TABLESPACE pg_default;

CREATE TABLE public.dm_doi_tuong_kh (
  id_doi_tuong uuid NOT NULL DEFAULT gen_random_uuid(),
  ten_doi_tuong text NOT NULL,
  icon text,
  index integer DEFAULT 0,
  ghi_chu text,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  CONSTRAINT dm_doi_tuong_pkey PRIMARY KEY (id_doi_tuong)
) TABLESPACE pg_default;

CREATE TABLE public.dm_nghe_nghiep (
  id_nghe_nghiep uuid NOT NULL DEFAULT gen_random_uuid(),
  ten_nghe_nghiep text NOT NULL,
  icon text,
  index integer DEFAULT 0,
  ghi_chu text,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  CONSTRAINT dm_nghe_nghiep_pkey PRIMARY KEY (id_nghe_nghiep)
) TABLESPACE pg_default;

CREATE TABLE public.dm_loai_gd_thu_chi (
  id_loai_gd uuid NOT NULL DEFAULT gen_random_uuid(),
  ten_loai text NOT NULL,
  icon text,
  index integer DEFAULT 0,
  ghi_chu text,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  CONSTRAINT dm_loai_gd_tc_pkey PRIMARY KEY (id_loai_gd)
) TABLESPACE pg_default;

CREATE TABLE public.dm_cach_tinh_phi (
  id_cach_tinh uuid NOT NULL DEFAULT gen_random_uuid(),
  ten_cach_tinh text NOT NULL,
  icon text,
  index integer DEFAULT 0,
  ghi_chu text,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  CONSTRAINT dm_cach_tinh_pkey PRIMARY KEY (id_cach_tinh)
) TABLESPACE pg_default;

CREATE TABLE public.dm_loai_icon (
  id_loai_icon uuid NOT NULL DEFAULT gen_random_uuid(),
  ten_loai text NOT NULL,
  icon text,
  index integer DEFAULT 0,
  ghi_chu text,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  CONSTRAINT dm_loai_icon_pkey PRIMARY KEY (id_loai_icon)
) TABLESPACE pg_default;


-- ============================================================
-- 2. BẢNG HỆ THỐNG / CẤU HÌNH (sys_)
-- ======= 2.0 SYS_DIEM_BAN =======
CREATE TABLE public.sys_diem_ban (
  id_diem_ban uuid NOT NULL DEFAULT gen_random_uuid(),
  ma_diem_ban text NOT NULL UNIQUE,
  ten_diem_ban text NOT NULL,
  dia_chi text,
  sdt text,
  trang_thai boolean DEFAULT true,
  ngay_tao timestamp with time zone DEFAULT now(),
  CONSTRAINT sys_diem_ban_pkey PRIMARY KEY (id_diem_ban)
) TABLESPACE pg_default;

-- ======= 2.1 SYS_QUAN_LY_CHU_KY =======
CREATE TABLE public.sys_quan_ly_chu_ky (
  id_chu_ky uuid NOT NULL DEFAULT gen_random_uuid(),
  id_diem_ban uuid,
  ten_chu_ky text NOT NULL,
  ten_cua_hang text NOT NULL,
  sdt1 text,
  sdt2 text,
  dia_chi text,
  zalo text,
  facebook text,
  dich_vu_1 text,
  dich_vu_2 text,
  dich_vu_3 text,
  ghi_chu text,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  CONSTRAINT sys_quan_ly_chu_ky_pkey PRIMARY KEY (id_chu_ky),
  CONSTRAINT sqck_id_diem_ban_fkey FOREIGN KEY (id_diem_ban)
    REFERENCES public.sys_diem_ban(id_diem_ban) ON DELETE SET NULL
) TABLESPACE pg_default;

-- ======= 2.2 SYS_NHOM_MENU =======
CREATE TABLE public.sys_nhom_menu (
  id_nhom uuid NOT NULL DEFAULT gen_random_uuid(),
  ten_nhom text NOT NULL,
  index integer DEFAULT 0,
  ghi_chu text,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  CONSTRAINT sys_nhom_menu_pkey PRIMARY KEY (id_nhom)
) TABLESPACE pg_default;

-- ======= 2.3 SYS_LOAI_DICH_VU =======
CREATE TABLE public.sys_loai_dich_vu (
  id_loai_dich_vu uuid NOT NULL DEFAULT gen_random_uuid(),
  id_nhom uuid,
  icon text,
  ten_danh_muc text NOT NULL,
  ma_viet_tat text,
  view_text text,
  view_link text,
  ghi_chu text,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  CONSTRAINT sys_loai_dich_vu_pkey PRIMARY KEY (id_loai_dich_vu),
  CONSTRAINT sys_loai_dich_vu_id_nhom_fkey FOREIGN KEY (id_nhom)
    REFERENCES public.sys_nhom_menu(id_nhom) ON DELETE SET NULL
) TABLESPACE pg_default;

-- ======= 2.4 SYS_DANH_MUC_DICH_VU (Ví dụ: Danh sách Ngân hàng VietQR) =======
CREATE TABLE public.sys_danh_muc_dich_vu (
  id_danh_muc_dich_vu uuid NOT NULL DEFAULT gen_random_uuid(),
  id_loai_dich_vu uuid,
  ma_bin text,
  ten_dich_vu text NOT NULL,
  ten_viet_tat text,
  ten_viet_tat_2 text,
  logo text,
  ghi_chu text,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  CONSTRAINT sys_danh_muc_dich_vu_pkey PRIMARY KEY (id_danh_muc_dich_vu),
  CONSTRAINT sys_dmdv_id_loai_dich_vu_fkey FOREIGN KEY (id_loai_dich_vu)
    REFERENCES public.sys_loai_dich_vu(id_loai_dich_vu) ON DELETE CASCADE
) TABLESPACE pg_default;

-- ======= 2.5 SYS_MENU =======
CREATE TABLE public.sys_menu (
  id_menu uuid NOT NULL DEFAULT gen_random_uuid(),
  id_nhom uuid,
  id_loai_dich_vu uuid,
  view_link text,
  index integer DEFAULT 0,
  ghi_chu text,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  CONSTRAINT sys_menu_pkey PRIMARY KEY (id_menu),
  CONSTRAINT sys_menu_id_nhom_fkey FOREIGN KEY (id_nhom)
    REFERENCES public.sys_nhom_menu(id_nhom) ON DELETE SET NULL,
  CONSTRAINT sys_menu_id_loai_dich_vu_fkey FOREIGN KEY (id_loai_dich_vu)
    REFERENCES public.sys_loai_dich_vu(id_loai_dich_vu) ON DELETE SET NULL
) TABLESPACE pg_default;

-- ======= 2.6 SYS_DANH_SACH_BANG (Quản lý tên bảng UI) =======
CREATE TABLE public.sys_danh_sach_bang (
  id_bang text NOT NULL,
  ten_bang text NOT NULL,
  ghi_chu text,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  CONSTRAINT sys_danh_sach_bang_pkey PRIMARY KEY (id_bang)
) TABLESPACE pg_default;

-- ======= 2.7 SYS_DANH_SACH_COT (Quản lý tên cột UI) =======
CREATE TABLE public.sys_danh_sach_cot (
  id_cot text NOT NULL,
  id_bang text NOT NULL,
  ten_cot text NOT NULL,
  ghi_chu text,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  CONSTRAINT sys_danh_sach_cot_pkey PRIMARY KEY (id_cot, id_bang),
  CONSTRAINT sys_dsc_id_bang_fkey FOREIGN KEY (id_bang)
    REFERENCES public.sys_danh_sach_bang(id_bang) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Dữ liệu mặc định
INSERT INTO public.sys_danh_sach_bang (id_bang, ten_bang) VALUES ('chi_tiet_giao_dich', 'Form Giao Dịch') ON CONFLICT (id_bang) DO NOTHING;
INSERT INTO public.sys_danh_sach_cot (id_cot, id_bang, ten_cot) VALUES 
  ('id_pttt_nguon', 'chi_tiet_giao_dich', 'Hình thức Khách đưa tiền'),
  ('id_pttt_di', 'chi_tiet_giao_dich', 'Hình thức Chuyển tiền đi'),
  ('so_tien', 'chi_tiet_giao_dich', 'Số tiền giao dịch Gốc'),
  ('is_cuoc_trong', 'chi_tiet_giao_dich', 'Chế độ Cước Trong'),
  ('phi_dich_vu', 'chi_tiet_giao_dich', 'Phí Dịch Vụ'),
  ('so_tien_giam', 'chi_tiet_giao_dich', 'Giảm giá trực tiếp'),
  ('chiet_khau', 'chi_tiet_giao_dich', 'Chiết khấu Kế toán (%)'),
  ('noi_dung', 'chi_tiet_giao_dich', 'Nội dung/Ghi chú'),
  ('id_trang_thai', 'chi_tiet_giao_dich', 'Trạng thái giao dịch')
ON CONFLICT (id_cot, id_bang) DO NOTHING;

-- ======= 2.8 SYS_QL_COT_DU_LIEU (Cấu hình UI lưới) =======
CREATE TABLE public.sys_ql_cot_du_lieu (
  id_ql_cot_du_lieu uuid NOT NULL DEFAULT gen_random_uuid(),
  id_ten_bang text NOT NULL,
  id_loai_dich_vu uuid,
  id_ten_cot text NOT NULL,
  noi_dung_hien_thi text NOT NULL,
  is_an_cot boolean DEFAULT false,
  ghi_chu text,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  CONSTRAINT sys_ql_cot_du_lieu_pkey PRIMARY KEY (id_ql_cot_du_lieu),
  CONSTRAINT sys_qlcdl_id_loai_dv_fkey FOREIGN KEY (id_loai_dich_vu)
    REFERENCES public.sys_loai_dich_vu(id_loai_dich_vu) ON DELETE SET NULL,
  CONSTRAINT sys_ql_cot_du_lieu_id_bang_fkey FOREIGN KEY (id_ten_bang)
    REFERENCES public.sys_danh_sach_bang(id_bang) ON DELETE CASCADE,
  CONSTRAINT sys_ql_cot_du_lieu_id_cot_fkey FOREIGN KEY (id_ten_cot, id_ten_bang)
    REFERENCES public.sys_danh_sach_cot(id_cot, id_bang) ON DELETE CASCADE
) TABLESPACE pg_default;


-- ============================================================
-- 3. BẢNG NGHIỆP VỤ / DỮ LIỆU ĐỘNG (Business Data)
-- ============================================================

-- ======= KHACH_HANG =======
CREATE TABLE public.khach_hang (
  id_khach_hang TEXT NOT NULL, -- Format: YYYY-MM-DD-XXXXXXXX (sinh tự động phía client)
  toggle_up_anh boolean DEFAULT false,
  anh_khach_hang text,
  up_anh_khach_hang text,
  id_doi_tuong uuid,
  ho_va_ten text NOT NULL,
  ten_khac text,
  so_dien_thoai text NOT NULL,
  so_dien_thoai_2 text,
  email text,
  so_cccd text,
  dia_chi text,
  id_diem_ban uuid,
  ngay_sinh date,
  id_gioi_tinh uuid,
  id_nghe_nghiep uuid,
  id_level uuid,
  ghi_chu text,
  utm_source text,
  last_interaction timestamp with time zone,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  CONSTRAINT khach_hang_pkey PRIMARY KEY (id_khach_hang),
  CONSTRAINT kh_id_doi_tuong_fkey FOREIGN KEY (id_doi_tuong)
    REFERENCES public.dm_doi_tuong_kh(id_doi_tuong) ON DELETE SET NULL,
  CONSTRAINT kh_id_gioi_tinh_fkey FOREIGN KEY (id_gioi_tinh)
    REFERENCES public.dm_gioi_tinh(id_gioi_tinh) ON DELETE SET NULL,
  CONSTRAINT kh_id_nghe_nghiep_fkey FOREIGN KEY (id_nghe_nghiep)
    REFERENCES public.dm_nghe_nghiep(id_nghe_nghiep) ON DELETE SET NULL,
  CONSTRAINT kh_id_level_fkey FOREIGN KEY (id_level)
    REFERENCES public.dm_hang_khach_hang(id_hang) ON DELETE SET NULL,
  CONSTRAINT kh_id_diem_ban_fkey FOREIGN KEY (id_diem_ban)
    REFERENCES public.sys_diem_ban(id_diem_ban) ON DELETE SET NULL
) TABLESPACE pg_default;

-- ======= MA_HOP_DONG =======
CREATE TABLE public.ma_hop_dong (
  id_ma_hop_dong uuid NOT NULL DEFAULT gen_random_uuid(),
  id_loai_dich_vu uuid,
  id_danh_muc_dich_vu uuid,
  ma_hop_dong text NOT NULL UNIQUE,
  chu_hop_dong text,
  ghi_chu text,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  CONSTRAINT ma_hop_dong_pkey PRIMARY KEY (id_ma_hop_dong),
  CONSTRAINT ma_hop_dong_id_loai_dich_vu_fkey FOREIGN KEY (id_loai_dich_vu)
    REFERENCES public.sys_loai_dich_vu(id_loai_dich_vu) ON DELETE SET NULL,
  CONSTRAINT ma_hop_dong_id_danh_muc_dich_vu_fkey FOREIGN KEY (id_danh_muc_dich_vu)
    REFERENCES public.sys_danh_muc_dich_vu(id_danh_muc_dich_vu) ON DELETE SET NULL
) TABLESPACE pg_default;

-- ======= HO_SO_DICH_VU =======
CREATE TABLE public.ho_so_dich_vu (
  id_ho_so_dich_vu uuid NOT NULL DEFAULT gen_random_uuid(),
  id_khach_hang TEXT,
  id_diem_ban uuid,
  id_loai_dich_vu uuid,
  id_ma_hop_dong uuid,
  noi_dung text,
  id_loai_icon uuid,
  link_icon_giao_dich text,
  up_anh_icon_giao_dich text,
  ghi_chu text,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  id_tai_khoan_tao uuid,
  CONSTRAINT ho_so_dich_vu_pkey PRIMARY KEY (id_ho_so_dich_vu),
  CONSTRAINT hsdv_id_khach_hang_fkey FOREIGN KEY (id_khach_hang)
    REFERENCES public.khach_hang(id_khach_hang) ON DELETE SET NULL,
  CONSTRAINT hsdv_id_loai_dich_vu_fkey FOREIGN KEY (id_loai_dich_vu)
    REFERENCES public.sys_loai_dich_vu(id_loai_dich_vu) ON DELETE SET NULL,
  CONSTRAINT hsdv_id_ma_hop_dong_fkey FOREIGN KEY (id_ma_hop_dong)
    REFERENCES public.ma_hop_dong(id_ma_hop_dong) ON DELETE SET NULL,
  CONSTRAINT hsdv_id_loai_icon_fkey FOREIGN KEY (id_loai_icon)
    REFERENCES public.dm_loai_icon(id_loai_icon) ON DELETE SET NULL,
  CONSTRAINT hsdv_id_diem_ban_fkey FOREIGN KEY (id_diem_ban)
    REFERENCES public.sys_diem_ban(id_diem_ban) ON DELETE SET NULL,
  CONSTRAINT hsdv_id_tai_khoan_tao_fkey FOREIGN KEY (id_tai_khoan_tao)
    REFERENCES public.tai_khoan_nguoi_dung(id_tai_khoan) ON DELETE SET NULL
) TABLESPACE pg_default;

-- ======= CHI_TIET_GIAO_DICH =======
CREATE TABLE public.chi_tiet_giao_dich (
  id_chi_tiet_giao_dich TEXT NOT NULL, -- Format: YYYY-MM-DD-8KÝTỰNGẪUNHIÊN
  id_diem_ban uuid,
  id_nhan_vien uuid,
  id_ho_so_dich_vu uuid,
  id_loai_dich_vu uuid,
  id_pttt_nguon uuid,
  so_tien numeric DEFAULT 0,
  so_tien_nhap_tay numeric DEFAULT 0,
  id_phi_ngoai uuid,
  id_cach_tinh_phi uuid,
  id_pttt_phi uuid,
  phi_dich_vu numeric DEFAULT 0,
  phi_dich_vu_nhap_tay numeric DEFAULT 0,
  chiet_khau numeric DEFAULT 0,
  toggle_so_tien_giam boolean DEFAULT false,
  so_tien_giam numeric DEFAULT 0,
  id_pttt_di uuid,
  so_tien_di numeric DEFAULT 0,
  noi_dung text,
  id_trang_thai uuid,
  hinh_anh_kiem_duyet text,
  file_in text,
  id_chu_ky uuid,
  ghi_chu text,
  thoi_gian_giao_dich timestamp with time zone,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  id_tai_khoan_tao uuid,
  CONSTRAINT chi_tiet_giao_dich_pkey PRIMARY KEY (id_chi_tiet_giao_dich),
  CONSTRAINT ctgd_id_ho_so_dich_vu_fkey FOREIGN KEY (id_ho_so_dich_vu)
    REFERENCES public.ho_so_dich_vu(id_ho_so_dich_vu) ON DELETE CASCADE,
  CONSTRAINT ctgd_id_loai_dich_vu_fkey FOREIGN KEY (id_loai_dich_vu)
    REFERENCES public.sys_loai_dich_vu(id_loai_dich_vu) ON DELETE SET NULL,
  CONSTRAINT ctgd_id_chu_ky_fkey FOREIGN KEY (id_chu_ky)
    REFERENCES public.sys_quan_ly_chu_ky(id_chu_ky) ON DELETE SET NULL,
  CONSTRAINT ctgd_id_diem_ban_fkey FOREIGN KEY (id_diem_ban)
    REFERENCES public.sys_diem_ban(id_diem_ban) ON DELETE SET NULL,
  CONSTRAINT ctgd_id_tai_khoan_tao_fkey FOREIGN KEY (id_tai_khoan_tao)
    REFERENCES public.tai_khoan_nguoi_dung(id_tai_khoan) ON DELETE SET NULL,
  
  -- Ràng buộc với các bảng danh mục mới
  CONSTRAINT ctgd_id_trang_thai_fkey FOREIGN KEY (id_trang_thai)
    REFERENCES public.dm_trang_thai_giao_dich(id_trang_thai) ON DELETE SET NULL,
  CONSTRAINT ctgd_id_pttt_nguon_fkey FOREIGN KEY (id_pttt_nguon)
    REFERENCES public.dm_phuong_thuc_thanh_toan(id_pttt) ON DELETE SET NULL,
  CONSTRAINT ctgd_id_pttt_phi_fkey FOREIGN KEY (id_pttt_phi)
    REFERENCES public.dm_phuong_thuc_thanh_toan(id_pttt) ON DELETE SET NULL,
  CONSTRAINT ctgd_id_pttt_di_fkey FOREIGN KEY (id_pttt_di)
    REFERENCES public.dm_phuong_thuc_thanh_toan(id_pttt) ON DELETE SET NULL,
  CONSTRAINT ctgd_id_cach_tinh_phi_fkey FOREIGN KEY (id_cach_tinh_phi)
    REFERENCES public.dm_cach_tinh_phi(id_cach_tinh) ON DELETE SET NULL
) TABLESPACE pg_default;


-- ======= TAO_MA_QR =======
CREATE TABLE public.tao_ma_qr (
  id_tao_ma_qr uuid NOT NULL DEFAULT gen_random_uuid(),
  id_chi_tiet_giao_dich uuid,
  id_loai_khach_hang uuid,
  id_khach_hang uuid,
  id_ho_so_dich_vu uuid,
  id_link_tu_dong text,
  id_danh_muc_dich_vu uuid,
  so_tai_khoan text,
  chu_tai_khoan text,
  noi_dung_chuyen text,
  ghi_chu text,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  CONSTRAINT tao_ma_qr_pkey PRIMARY KEY (id_tao_ma_qr),
  CONSTRAINT qr_id_ctgd_fkey FOREIGN KEY (id_chi_tiet_giao_dich)
    REFERENCES public.chi_tiet_giao_dich(id_chi_tiet_giao_dich) ON DELETE SET NULL,
  CONSTRAINT qr_id_loai_kh_fkey FOREIGN KEY (id_loai_khach_hang)
    REFERENCES public.dm_doi_tuong_kh(id_doi_tuong) ON DELETE SET NULL,
  CONSTRAINT qr_id_khach_hang_fkey FOREIGN KEY (id_khach_hang)
    REFERENCES public.khach_hang(id_khach_hang) ON DELETE SET NULL,
  CONSTRAINT qr_id_ho_so_dv_fkey FOREIGN KEY (id_ho_so_dich_vu)
    REFERENCES public.ho_so_dich_vu(id_ho_so_dich_vu) ON DELETE SET NULL,
  CONSTRAINT qr_id_danh_muc_dv_fkey FOREIGN KEY (id_danh_muc_dich_vu)
    REFERENCES public.sys_danh_muc_dich_vu(id_danh_muc_dich_vu) ON DELETE SET NULL
) TABLESPACE pg_default;

-- ======= PHIEU_DEM_TIEN =======
CREATE TABLE public.phieu_dem_tien (
  id_phieu_dem_tien uuid NOT NULL DEFAULT gen_random_uuid(),
  id_chi_tiet_giao_dich uuid,
  ngay_dem timestamp with time zone DEFAULT now(),
  nguoi_dem text,
  so_to_500k integer DEFAULT 0,
  so_to_200k integer DEFAULT 0,
  so_to_100k integer DEFAULT 0,
  so_to_50k integer DEFAULT 0,
  so_to_20k integer DEFAULT 0,
  so_to_10k integer DEFAULT 0,
  so_to_5k integer DEFAULT 0,
  so_to_2k integer DEFAULT 0,
  so_to_1k integer DEFAULT 0,
  so_to_500d integer DEFAULT 0,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  CONSTRAINT phieu_dem_tien_pkey PRIMARY KEY (id_phieu_dem_tien),
  CONSTRAINT pdt_id_ctgd_fkey FOREIGN KEY (id_chi_tiet_giao_dich)
    REFERENCES public.chi_tiet_giao_dich(id_chi_tiet_giao_dich) ON DELETE SET NULL
) TABLESPACE pg_default;

-- ======= LOG_IN_HOA_DON =======
CREATE TABLE public.log_in_hoa_don (
  id_log_in_hoa_don uuid NOT NULL DEFAULT gen_random_uuid(),
  id_ho_so_dich_vu uuid,
  noi_dung_in text,
  ghi_chu text,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  CONSTRAINT log_in_hoa_don_pkey PRIMARY KEY (id_log_in_hoa_don),
  CONSTRAINT log_id_ho_so_dv_fkey FOREIGN KEY (id_ho_so_dich_vu)
    REFERENCES public.ho_so_dich_vu(id_ho_so_dich_vu) ON DELETE SET NULL
) TABLESPACE pg_default;

-- ======= LICH_SU_THU_CHI =======
CREATE TABLE public.lich_su_thu_chi (
  id_lich_su_thu_chi uuid NOT NULL DEFAULT gen_random_uuid(),
  id_diem_ban uuid,
  id_loai_giao_dich uuid,
  so_tien numeric DEFAULT 0,
  phuong_thuc_thanh_toan_id uuid,
  so_du_cuoi numeric DEFAULT 0,
  nguon_goc_bang text,
  id_giao_dich_goc uuid,
  noi_dung text,
  ngay_tao timestamp with time zone DEFAULT now(),
  CONSTRAINT lich_su_thu_chi_pkey PRIMARY KEY (id_lich_su_thu_chi),
  CONSTRAINT lstc_id_loai_gd_fkey FOREIGN KEY (id_loai_giao_dich)
    REFERENCES public.dm_loai_gd_thu_chi(id_loai_gd) ON DELETE SET NULL,
  CONSTRAINT lstc_pttt_fkey FOREIGN KEY (phuong_thuc_thanh_toan_id)
    REFERENCES public.dm_phuong_thuc_thanh_toan(id_pttt) ON DELETE SET NULL,
  CONSTRAINT lstc_id_diem_ban_fkey FOREIGN KEY (id_diem_ban)
    REFERENCES public.sys_diem_ban(id_diem_ban) ON DELETE SET NULL
) TABLESPACE pg_default;


-- ============================================================
-- RLS (Row Level Security) - Cho phép anon truy cập (Dev)
-- ============================================================
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'dm_trang_thai_giao_dich', 'dm_phuong_thuc_thanh_toan', 'dm_hang_khach_hang', 
      'dm_gioi_tinh', 'dm_doi_tuong_kh', 'dm_nghe_nghiep', 'dm_loai_gd_thu_chi', 
      'dm_cach_tinh_phi', 'dm_loai_icon',
      'sys_quan_ly_chu_ky', 'sys_nhom_menu', 'sys_loai_dich_vu', 'sys_menu', 
      'sys_danh_muc_dich_vu', 'sys_ql_cot_du_lieu',
      'khach_hang', 'ma_hop_dong', 'ho_so_dich_vu', 'chi_tiet_giao_dich',
      'tao_ma_qr', 'phieu_dem_tien', 'log_in_hoa_don', 'lich_su_thu_chi'
    ])
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY "Allow all for anon" ON public.%I FOR ALL TO anon USING (true) WITH CHECK (true)',
      t
    );
    EXECUTE format(
      'CREATE POLICY "Allow all for authenticated" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      t
    );
  END LOOP;
END $$;

-- ============================================================
-- SEED DATA - Dữ liệu mẫu khởi tạo
-- ============================================================

-- ======= CÁC BẢNG DANH MỤC =======
INSERT INTO public.dm_trang_thai_giao_dich (id_trang_thai, ten_trang_thai, index, icon) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'Thành công', 1, 'check-circle'),
  ('b0000001-0000-0000-0000-000000000002', 'Chờ duyệt', 2, 'clock'),
  ('b0000001-0000-0000-0000-000000000003', 'Thất bại', 3, 'x-circle'),
  ('b0000001-0000-0000-0000-000000000004', 'Đang xử lý', 4, 'loader');

INSERT INTO public.dm_phuong_thuc_thanh_toan (id_pttt, ten_pttt, index, icon) VALUES
  ('b0000002-0000-0000-0000-000000000001', 'Chuyển khoản', 1, 'repeat'),
  ('b0000002-0000-0000-0000-000000000002', 'Tiền mặt', 2, 'wallet'),
  ('b0000002-0000-0000-0000-000000000003', 'Quẹt thẻ', 3, 'credit-card');

INSERT INTO public.dm_hang_khach_hang (id_hang, ten_hang, index, icon) VALUES
  ('b0000003-0000-0000-0000-000000000001', 'VIP Vàng', 1, 'zap'),
  ('b0000003-0000-0000-0000-000000000002', 'Thành viên', 2, 'smile'),
  ('b0000003-0000-0000-0000-000000000003', 'Khách lẻ', 3, 'user');

INSERT INTO public.dm_gioi_tinh (id_gioi_tinh, ten_gioi_tinh, index, icon) VALUES
  ('b0000004-0000-0000-0000-000000000001', 'Nam', 1, 'mars'),
  ('b0000004-0000-0000-0000-000000000002', 'Nữ', 2, 'venus');

INSERT INTO public.dm_doi_tuong_kh (id_doi_tuong, ten_doi_tuong, index, icon) VALUES
  ('b0000005-0000-0000-0000-000000000001', 'Cá nhân', 1, 'user'),
  ('b0000005-0000-0000-0000-000000000002', 'Doanh nghiệp', 2, 'building');

INSERT INTO public.dm_loai_gd_thu_chi (id_loai_gd, ten_loai, index, icon) VALUES
  ('b0000007-0000-0000-0000-000000000001', 'Thu', 1, 'arrow-down-left'),
  ('b0000007-0000-0000-0000-000000000002', 'Chi', 2, 'arrow-up-right');

INSERT INTO public.dm_cach_tinh_phi (id_cach_tinh, ten_cach_tinh, index, icon) VALUES
  ('b0000008-0000-0000-0000-000000000001', 'Theo phần trăm', 1, 'percent'),
  ('b0000008-0000-0000-0000-000000000002', 'Cố định', 2, 'hash');

INSERT INTO public.dm_nghe_nghiep (id_nghe_nghiep, ten_nghe_nghiep, index, icon) VALUES
  ('b0000006-0000-0000-0000-000000000001', 'Nhân viên văn phòng', 1, 'briefcase');
  
INSERT INTO public.dm_loai_icon (id_loai_icon, ten_loai, index, icon) VALUES
  ('b0000009-0000-0000-0000-000000000001', 'Icon Hóa đơn', 1, 'image');


-- ======= SYS_QUAN_LY_CHU_KY (Mẫu chữ ký) =======
INSERT INTO public.sys_quan_ly_chu_ky (ten_chu_ky, ten_cua_hang, sdt1, dia_chi, zalo, dich_vu_1, dich_vu_2, dich_vu_3) VALUES
  ('Quản lý cửa hàng', 'AURA FINTECH - DỊCH VỤ TÀI CHÍNH ĐA NĂNG', '0988888888', '123 Đường Láng, Đống Đa, Hà Nội', '0988888888', 'Chuyển khoản - Rút tiền', 'Thu hộ - Nạp thẻ', 'Dịch vụ viễn thông trọn gói');


-- ======= SYS_NHOM_MENU (7 nhóm) =======
INSERT INTO public.sys_nhom_menu (id_nhom, ten_nhom, index) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'THU HỘ', 2),
  ('c0000001-0000-0000-0000-000000000002', 'CHUYỂN TIỀN - RÚT TIỀN MẶT', 1),
  ('c0000001-0000-0000-0000-000000000003', 'CƯỚC VIỄN THÔNG, THẺ CÀO', 3),
  ('c0000001-0000-0000-0000-000000000004', 'NẠP RÚT DÒNG TIỀN', 4),
  ('c0000001-0000-0000-0000-000000000005', 'KHÁCH HÀNG', 5),
  ('c0000001-0000-0000-0000-000000000006', 'DỊCH VỤ KHÁC', 6),
  ('c0000001-0000-0000-0000-000000000007', 'QUẢN LÝ DỮ LIỆU', 7);

-- ======= SYS_LOAI_DICH_VU (19 dịch vụ) =======
INSERT INTO public.sys_loai_dich_vu (id_loai_dich_vu, id_nhom, icon, ten_danh_muc, ma_viet_tat) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000003', 'https://cdn-icons-png.freepik.com/128/8402/8402535.png', 'SHOPPE - THẺ GAME', 'TC'),
  ('d0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000002', 'https://cdn-icons-png.freepik.com/256/4108/4108042.png', 'CHUYỂN KHOẢN', 'CK'),
  ('d0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000001', 'https://cdn-icons-png.freepik.com/256/1162/1162499.png', 'THU HỘ', 'TH'),
  ('d0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000003', 'https://kpp.bankplus.vn/Content/img/logo-VTP.png', 'KPP - THẺ ĐIỆN THOẠI', 'TC'),
  ('d0000001-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000006', 'https://cdn-icons-png.freepik.com/256/781/781831.png', 'CÁC KHOẢN CHI KHÁC', 'CT'),
  ('d0000001-0000-0000-0000-000000000006', 'c0000001-0000-0000-0000-000000000002', 'https://cdn-icons-png.freepik.com/128/1087/1087072.png', 'RÚT TIỀN', 'RT'),
  ('d0000001-0000-0000-0000-000000000007', 'c0000001-0000-0000-0000-000000000003', 'https://kpp.bankplus.vn/Content/img/logo-VTP.png', 'KPP - NẠP THẺ', 'NT'),
  ('d0000001-0000-0000-0000-000000000008', 'c0000001-0000-0000-0000-000000000003', 'https://kpp.bankplus.vn/Content/img/logo-VTP.png', 'KPP - THẺ GAME', 'TG'),
  ('d0000001-0000-0000-0000-000000000009', 'c0000001-0000-0000-0000-000000000003', 'https://cdn-icons-png.flaticon.com/128/515/515636.png', 'INTERNET', 'IT'),
  ('d0000001-0000-0000-0000-000000000010', 'c0000001-0000-0000-0000-000000000004', 'https://cdn-icons-png.flaticon.com/128/2953/2953536.png', 'NẠP RÚT DÒNG TIỀN', 'DT'),
  ('d0000001-0000-0000-0000-000000000011', 'c0000001-0000-0000-0000-000000000003', 'https://cdn-icons-png.flaticon.com/128/10919/10919768.png', 'NẠP THẺ CHIẾT KHẤU', 'TC'),
  ('d0000001-0000-0000-0000-000000000012', 'c0000001-0000-0000-0000-000000000006', 'https://cdn-icons-png.freepik.com/128/4694/4694422.png', 'CÁC THU NHẬP KHÁC', 'TT'),
  ('d0000001-0000-0000-0000-000000000013', 'c0000001-0000-0000-0000-000000000006', 'https://cdn-icons-png.freepik.com/512/18097/18097481.png', 'CÁC DỊCH VỤ KHÁC', 'DF'),
  ('d0000001-0000-0000-0000-000000000014', 'c0000001-0000-0000-0000-000000000006', 'https://cdn-icons-png.freepik.com/128/8090/8090840.png', 'THANH TOÁN THEO DANH SÁCH', 'HD'),
  ('d0000001-0000-0000-0000-000000000015', 'c0000001-0000-0000-0000-000000000005', 'https://cdn-icons-png.freepik.com/128/8002/8002875.png', 'CHI CÁ NHÂN', 'CN'),
  ('d0000001-0000-0000-0000-000000000016', 'c0000001-0000-0000-0000-000000000005', 'https://cdn-icons-png.freepik.com/512/3225/3225798.png', 'THU CÁ NHÂN', 'CN'),
  ('d0000001-0000-0000-0000-000000000017', 'c0000001-0000-0000-0000-000000000007', 'https://cdn-icons-png.freepik.com/128/11168/11168344.png', 'KINH DOANH SIM ONLINE', 'OL'),
  ('d0000001-0000-0000-0000-000000000018', 'c0000001-0000-0000-0000-000000000003', 'https://cdn-icons-png.flaticon.com/128/12270/12270074.png', 'NẠP SỐ ĐIỆN THOẠI', 'NDT'),
  ('d0000001-0000-0000-0000-000000000019', 'c0000001-0000-0000-0000-000000000001', 'https://cdn-icons-png.freepik.com/128/6856/6856916.png', 'THU GÓP', 'TG');

-- ======= SYS_MENU (Liên kết nhóm ↔ dịch vụ) =======
INSERT INTO public.sys_menu (id_nhom, id_loai_dich_vu, view_link, index) VALUES
  -- CHUYỂN TIỀN - RÚT TIỀN MẶT
  ('c0000001-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000002', 'ho_so_dich_vu', 1),
  ('c0000001-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000006', 'ho_so_dich_vu', 2),
  -- THU HỘ
  ('c0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000003', 'ho_so_dich_vu', 1),
  ('c0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000019', 'ho_so_dich_vu', 2),
  -- CƯỚC VIỄN THÔNG, THẺ CÀO
  ('c0000001-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000007', 'ho_so_dich_vu', 1),
  ('c0000001-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000011', 'ho_so_dich_vu', 2),
  ('c0000001-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000004', 'ho_so_dich_vu', 3),
  ('c0000001-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000008', 'ho_so_dich_vu', 4),
  ('c0000001-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000001', 'ho_so_dich_vu', 5),
  ('c0000001-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000018', 'ho_so_dich_vu', 6),
  ('c0000001-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000009', 'ho_so_dich_vu', 7),
  -- NẠP RÚT DÒNG TIỀN
  ('c0000001-0000-0000-0000-000000000004', 'd0000001-0000-0000-0000-000000000010', 'ho_so_dich_vu', 1),
  -- KHÁCH HÀNG
  ('c0000001-0000-0000-0000-000000000005', 'd0000001-0000-0000-0000-000000000015', 'ho_so_dich_vu', 1),
  ('c0000001-0000-0000-0000-000000000005', 'd0000001-0000-0000-0000-000000000016', 'ho_so_dich_vu', 2),
  -- DỊCH VỤ KHÁC
  ('c0000001-0000-0000-0000-000000000006', 'd0000001-0000-0000-0000-000000000005', 'ho_so_dich_vu', 1),
  ('c0000001-0000-0000-0000-000000000006', 'd0000001-0000-0000-0000-000000000012', 'ho_so_dich_vu', 2),
  ('c0000001-0000-0000-0000-000000000006', 'd0000001-0000-0000-0000-000000000014', 'ho_so_dich_vu', 3),
  ('c0000001-0000-0000-0000-000000000006', 'd0000001-0000-0000-0000-000000000013', 'ho_so_dich_vu', 99),
  -- QUẢN LÝ DỮ LIỆU
  ('c0000001-0000-0000-0000-000000000007', 'd0000001-0000-0000-0000-000000000017', 'ho_so_dich_vu', 1);

-- ======= SYS_DANH_MUC_DICH_VU (Ngân hàng mẫu cho VietQR) =======
INSERT INTO public.sys_danh_muc_dich_vu (id_loai_dich_vu, ma_bin, ten_dich_vu, ten_viet_tat, logo) VALUES
  ('d0000001-0000-0000-0000-000000000002', '970422', 'Ngân hàng Quân Đội (MB Bank)', 'MB', 'https://img.vietqr.io/img/MB.png'),
  ('d0000001-0000-0000-0000-000000000002', '970436', 'Ngân hàng Vietcombank', 'VCB', 'https://img.vietqr.io/img/VCB.png'),
  ('d0000001-0000-0000-0000-000000000002', '970415', 'Ngân hàng VietinBank', 'CTG', 'https://img.vietqr.io/img/ICB.png'),
  ('d0000001-0000-0000-0000-000000000002', '970418', 'Ngân hàng BIDV', 'BIDV', 'https://img.vietqr.io/img/BIDV.png'),
  ('d0000001-0000-0000-0000-000000000002', '970423', 'Ngân hàng TPBank', 'TPB', 'https://img.vietqr.io/img/TPB.png');

-- ======= MIGRATION MỚI (BẢNG BIỂU PHÍ & LOẠI HỢP ĐỒNG) =======
-- 1. TẠO BẢNG DANH MỤC LOẠI HỢP ĐỒNG
CREATE TABLE public.dm_loai_hop_dong (
  id_loai_hop_dong uuid NOT NULL DEFAULT gen_random_uuid(),
  ten_loai text NOT NULL,
  index integer,
  trang_thai boolean DEFAULT true,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  CONSTRAINT dm_loai_hop_dong_pkey PRIMARY KEY (id_loai_hop_dong)
) TABLESPACE pg_default;

-- Thêm Data mồi
INSERT INTO public.dm_loai_hop_dong (id_loai_hop_dong, ten_loai, index) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Khách Lẻ (Tiêu chuẩn)', 1),
  ('a1000000-0000-0000-0000-000000000002', 'Khách VIP', 2),
  ('a1000000-0000-0000-0000-000000000003', 'Đại lý / Buôn', 3)
ON CONFLICT DO NOTHING;

-- 2. TẠO BẢNG DANH MỤC BIỂU PHÍ
CREATE TABLE public.dm_bieu_phi (
  id_bieu_phi uuid NOT NULL DEFAULT gen_random_uuid(),
  ten_bieu_phi text NOT NULL,
  
  -- Điều kiện áp dụng
  id_loai_dich_vu uuid,
  id_danh_muc_dich_vu uuid,
  id_loai_hop_dong uuid,
  so_tien_tu numeric,
  so_tien_den numeric,
  
  -- Kết quả tính toán
  phi_dich_vu_mac_dinh numeric DEFAULT 0,
  id_cach_tinh_phi uuid,
  chiet_khau_mac_dinh numeric DEFAULT 0,
  id_cach_tinh_chiet_khau uuid,
  
  trang_thai boolean DEFAULT true,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  
  CONSTRAINT dm_bieu_phi_pkey PRIMARY KEY (id_bieu_phi),
  CONSTRAINT bieuphi_loaidv_fkey FOREIGN KEY (id_loai_dich_vu) REFERENCES public.sys_loai_dich_vu(id_loai_dich_vu) ON DELETE SET NULL,
  CONSTRAINT bieuphi_danhmucdv_fkey FOREIGN KEY (id_danh_muc_dich_vu) REFERENCES public.sys_danh_muc_dich_vu(id_danh_muc_dich_vu) ON DELETE SET NULL,
  CONSTRAINT bieuphi_loaihopdong_fkey FOREIGN KEY (id_loai_hop_dong) REFERENCES public.dm_loai_hop_dong(id_loai_hop_dong) ON DELETE SET NULL,
  CONSTRAINT bieuphi_cachtinhphi_fkey FOREIGN KEY (id_cach_tinh_phi) REFERENCES public.dm_cach_tinh_phi(id_cach_tinh) ON DELETE SET NULL,
  CONSTRAINT bieuphi_cachtinhck_fkey FOREIGN KEY (id_cach_tinh_chiet_khau) REFERENCES public.dm_cach_tinh_phi(id_cach_tinh) ON DELETE SET NULL
) TABLESPACE pg_default;

-- Thêm Data mồi mẫu (Chuyển khoản tiêu chuẩn)
INSERT INTO public.dm_bieu_phi (ten_bieu_phi, phi_dich_vu_mac_dinh, id_cach_tinh_phi) VALUES
  ('Mặc định toàn hệ thống', 0, 'b0000008-0000-0000-0000-000000000002');

-- 3. CẬP NHẬT CÁC BẢNG HIỆN TẠI
ALTER TABLE public.ho_so_dich_vu
ADD COLUMN IF NOT EXISTS id_loai_hop_dong uuid REFERENCES public.dm_loai_hop_dong(id_loai_hop_dong) ON DELETE SET NULL;

ALTER TABLE public.chi_tiet_giao_dich
ADD COLUMN IF NOT EXISTS is_cuoc_trong boolean DEFAULT false;

-- 4. BẬT RLS (Mặc định cho phép CRUD nếu dùng Anon Key trong dự án này)
ALTER TABLE public.dm_loai_hop_dong ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cho phép tất cả thao tác dm_loai_hop_dong" ON public.dm_loai_hop_dong FOR ALL USING (true);

ALTER TABLE public.dm_bieu_phi ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cho phép tất cả thao tác dm_bieu_phi" ON public.dm_bieu_phi FOR ALL USING (true);
