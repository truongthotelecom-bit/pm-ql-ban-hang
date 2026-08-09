-- ================================================================
-- MIGRATION: THÊM KIẾN TRÚC ĐA ĐIỂM BÁN (MULTI-TENANT)
-- Chạy trên Supabase SQL Editor
-- ================================================================

-- BƯỚC 1: TẠO BẢNG ĐIỂM BÁN (sys_diem_ban)
CREATE TABLE IF NOT EXISTS public.sys_diem_ban (
  id_diem_ban uuid NOT NULL DEFAULT gen_random_uuid(),
  ma_diem_ban text NOT NULL UNIQUE,
  ten_diem_ban text NOT NULL,
  dia_chi text,
  sdt text,
  trang_thai boolean DEFAULT true,
  ngay_tao timestamp with time zone DEFAULT now(),
  CONSTRAINT sys_diem_ban_pkey PRIMARY KEY (id_diem_ban)
) TABLESPACE pg_default;

-- Cho phép RLS trên bảng mới (hoặc mở cho authenticated)
ALTER TABLE public.sys_diem_ban ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated on sys_diem_ban" 
ON public.sys_diem_ban FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- BƯỚC 2: TẠO MỘT ĐIỂM BÁN MẶC ĐỊNH CHO DỮ LIỆU HIỆN TẠI
INSERT INTO public.sys_diem_ban (id_diem_ban, ma_diem_ban, ten_diem_ban, dia_chi, sdt)
VALUES (
  '00000000-0000-0000-0000-000000000001', -- Fixed UUID for default store
  'HQ01',
  'Trụ sở chính Aura Fintech',
  '123 Đường Chính, TP.HCM',
  '0909000000'
) ON CONFLICT (ma_diem_ban) DO NOTHING;

-- BƯỚC 3: THÊM CỘT id_diem_ban VÀO CÁC BẢNG LÕI
-- 3.1 Bảng tài khoản người dùng
ALTER TABLE public.tai_khoan_nguoi_dung ADD COLUMN IF NOT EXISTS id_diem_ban uuid;
UPDATE public.tai_khoan_nguoi_dung SET id_diem_ban = '00000000-0000-0000-0000-000000000001' WHERE id_diem_ban IS NULL;
ALTER TABLE public.tai_khoan_nguoi_dung ADD CONSTRAINT tknd_id_diem_ban_fkey FOREIGN KEY (id_diem_ban) REFERENCES public.sys_diem_ban(id_diem_ban) ON DELETE SET NULL;

-- 3.2 Bảng khách hàng
ALTER TABLE public.khach_hang ADD COLUMN IF NOT EXISTS id_diem_ban uuid;
UPDATE public.khach_hang SET id_diem_ban = '00000000-0000-0000-0000-000000000001' WHERE id_diem_ban IS NULL;
ALTER TABLE public.khach_hang ADD CONSTRAINT kh_id_diem_ban_fkey FOREIGN KEY (id_diem_ban) REFERENCES public.sys_diem_ban(id_diem_ban) ON DELETE SET NULL;

-- 3.3 Bảng hồ sơ dịch vụ
ALTER TABLE public.ho_so_dich_vu ADD COLUMN IF NOT EXISTS id_diem_ban uuid;
UPDATE public.ho_so_dich_vu SET id_diem_ban = '00000000-0000-0000-0000-000000000001' WHERE id_diem_ban IS NULL;
ALTER TABLE public.ho_so_dich_vu ADD CONSTRAINT hsdv_id_diem_ban_fkey FOREIGN KEY (id_diem_ban) REFERENCES public.sys_diem_ban(id_diem_ban) ON DELETE SET NULL;

-- 3.4 Bảng chi tiết giao dịch
ALTER TABLE public.chi_tiet_giao_dich ADD COLUMN IF NOT EXISTS id_diem_ban uuid;
UPDATE public.chi_tiet_giao_dich SET id_diem_ban = '00000000-0000-0000-0000-000000000001' WHERE id_diem_ban IS NULL;
ALTER TABLE public.chi_tiet_giao_dich ADD CONSTRAINT ctgd_id_diem_ban_fkey FOREIGN KEY (id_diem_ban) REFERENCES public.sys_diem_ban(id_diem_ban) ON DELETE SET NULL;

-- 3.5 Bảng quản lý chữ ký (in biên lai)
ALTER TABLE public.sys_quan_ly_chu_ky ADD COLUMN IF NOT EXISTS id_diem_ban uuid;
UPDATE public.sys_quan_ly_chu_ky SET id_diem_ban = '00000000-0000-0000-0000-000000000001' WHERE id_diem_ban IS NULL;
ALTER TABLE public.sys_quan_ly_chu_ky ADD CONSTRAINT sqck_id_diem_ban_fkey FOREIGN KEY (id_diem_ban) REFERENCES public.sys_diem_ban(id_diem_ban) ON DELETE SET NULL;

-- 3.6 Bảng lịch sử thu chi
ALTER TABLE public.lich_su_thu_chi ADD COLUMN IF NOT EXISTS id_diem_ban uuid;
UPDATE public.lich_su_thu_chi SET id_diem_ban = '00000000-0000-0000-0000-000000000001' WHERE id_diem_ban IS NULL;
ALTER TABLE public.lich_su_thu_chi ADD CONSTRAINT lstc_id_diem_ban_fkey FOREIGN KEY (id_diem_ban) REFERENCES public.sys_diem_ban(id_diem_ban) ON DELETE SET NULL;

-- BƯỚC 4: THÊM ROLE "CHỦ ĐIỂM BÁN" (NẾU CHƯA CÓ)
INSERT INTO public.dm_nhom_quyen (ma_quyen, ten_nhom_quyen, mo_ta, is_admin)
VALUES ('CHU_DIEM_BAN', 'Chủ Điểm Bán', 'Quản trị viên của một điểm bán cụ thể', false)
ON CONFLICT (ma_quyen) DO NOTHING;

-- Kiểm tra kết quả
SELECT * FROM public.sys_diem_ban;
SELECT username, id_diem_ban FROM public.tai_khoan_nguoi_dung;
