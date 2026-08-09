-- ================================================================
-- MIGRATION: THÊM CỘT NGƯỜI TẠO ĐỂ PHÂN QUYỀN SỬA GIAO DỊCH
-- Chạy trên Supabase SQL Editor
-- ================================================================

-- 1. Bảng hồ sơ dịch vụ
ALTER TABLE public.ho_so_dich_vu ADD COLUMN IF NOT EXISTS id_tai_khoan_tao uuid;

ALTER TABLE public.ho_so_dich_vu ADD CONSTRAINT hsdv_id_tai_khoan_tao_fkey 
  FOREIGN KEY (id_tai_khoan_tao) REFERENCES public.tai_khoan_nguoi_dung(id_tai_khoan) ON DELETE SET NULL;

-- 2. Bảng chi tiết giao dịch
ALTER TABLE public.chi_tiet_giao_dich ADD COLUMN IF NOT EXISTS id_tai_khoan_tao uuid;

ALTER TABLE public.chi_tiet_giao_dich ADD CONSTRAINT ctgd_id_tai_khoan_tao_fkey 
  FOREIGN KEY (id_tai_khoan_tao) REFERENCES public.tai_khoan_nguoi_dung(id_tai_khoan) ON DELETE SET NULL;

-- Lưu ý: Không update lại dữ liệu cũ, vì dữ liệu cũ mặc định admin hoặc chủ điểm bán quản lý.
-- Dữ liệu sinh ra từ thời điểm này sẽ được gán id_tai_khoan_tao.
