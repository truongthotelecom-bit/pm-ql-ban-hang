-- ============================================================
-- BẢNG PHÂN QUYỀN VÀ TÀI KHOẢN (RBAC) - V2
-- Dựa trên dự án NhanhRaSim
-- ============================================================

-- 1. NHÓM QUYỀN
CREATE TABLE IF NOT EXISTS public.dm_nhom_quyen (
  id_nhom_quyen uuid NOT NULL DEFAULT gen_random_uuid(),
  ma_quyen text NOT NULL UNIQUE,
  ten_nhom_quyen text NOT NULL,
  mo_ta text,
  is_admin boolean DEFAULT false,
  ngay_tao timestamp with time zone DEFAULT now(),
  CONSTRAINT dm_nhom_quyen_pkey PRIMARY KEY (id_nhom_quyen)
) TABLESPACE pg_default;

-- Dữ liệu mẫu Nhóm quyền
INSERT INTO public.dm_nhom_quyen (id_nhom_quyen, ma_quyen, ten_nhom_quyen, is_admin)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'ADMIN', 'Quản trị viên', true),
  ('00000000-0000-0000-0000-000000000002', 'STAFF', 'Nhân viên', false)
ON CONFLICT (ma_quyen) DO NOTHING;

-- 2. CHỨC NĂNG
CREATE TABLE IF NOT EXISTS public.dm_chuc_nang (
  id_chuc_nang uuid NOT NULL DEFAULT gen_random_uuid(),
  ma_chuc_nang text NOT NULL UNIQUE,
  ten_chuc_nang text NOT NULL,
  module text,
  CONSTRAINT dm_chuc_nang_pkey PRIMARY KEY (id_chuc_nang)
) TABLESPACE pg_default;

-- Dữ liệu mẫu Chức năng
INSERT INTO public.dm_chuc_nang (ma_chuc_nang, ten_chuc_nang, module)
VALUES 
  ('DASHBOARD', 'Bảng điều khiển', 'DASHBOARD'),
  ('TRANSACTIONS', 'Giao dịch', 'TRANSACTIONS'),
  ('CUSTOMERS', 'Khách hàng', 'CUSTOMERS'),
  ('ADMIN_PANEL', 'Cấu hình hệ thống', 'ADMIN')
ON CONFLICT (ma_chuc_nang) DO NOTHING;

-- 3. PHÂN QUYỀN CHỨC NĂNG
CREATE TABLE IF NOT EXISTS public.phan_quyen_chuc_nang (
  id_phan_quyen uuid NOT NULL DEFAULT gen_random_uuid(),
  id_nhom_quyen uuid,
  id_chuc_nang uuid,
  can_view boolean DEFAULT true,
  can_add boolean DEFAULT false,
  can_edit boolean DEFAULT false,
  can_delete boolean DEFAULT false,
  CONSTRAINT phan_quyen_chuc_nang_pkey PRIMARY KEY (id_phan_quyen),
  CONSTRAINT fk_pq_nhom FOREIGN KEY (id_nhom_quyen) REFERENCES public.dm_nhom_quyen(id_nhom_quyen) ON DELETE CASCADE,
  CONSTRAINT fk_pq_chuc_nang FOREIGN KEY (id_chuc_nang) REFERENCES public.dm_chuc_nang(id_chuc_nang) ON DELETE CASCADE
) TABLESPACE pg_default;

-- 4. TÀI KHOẢN NGƯỜI DÙNG (Kế thừa từ auth.users của Supabase)
CREATE TABLE IF NOT EXISTS public.tai_khoan_nguoi_dung (
  id_tai_khoan uuid NOT NULL, -- Reference to auth.users(id)
  id_nhom_quyen uuid,
  id_diem_ban uuid,
  ho_ten text,
  username text,
  email text,
  so_dien_thoai text,
  is_active boolean DEFAULT true,
  ngay_tao timestamp with time zone DEFAULT now(),
  CONSTRAINT tai_khoan_nguoi_dung_pkey PRIMARY KEY (id_tai_khoan),
  CONSTRAINT fk_tk_nhom FOREIGN KEY (id_nhom_quyen) REFERENCES public.dm_nhom_quyen(id_nhom_quyen) ON DELETE SET NULL
) TABLESPACE pg_default;
