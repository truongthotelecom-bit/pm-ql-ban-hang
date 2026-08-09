-- ================================================================
-- MIGRATION: Đổi id_khach_hang từ UUID sang TEXT (YYYY-MM-DD-8KÝTỰ)
-- Chạy trên Supabase SQL Editor
-- ================================================================

-- BƯỚC 1: Thêm cột tạm thời kiểu TEXT cho tất cả các bảng liên quan
ALTER TABLE public.khach_hang ADD COLUMN IF NOT EXISTS id_khach_hang_new TEXT;
ALTER TABLE public.ho_so_dich_vu ADD COLUMN IF NOT EXISTS id_khach_hang_new TEXT;
ALTER TABLE public.tao_ma_qr ADD COLUMN IF NOT EXISTS id_khach_hang_new TEXT;

-- BƯỚC 2: Sinh mã mới cho khách hàng hiện tại
UPDATE public.khach_hang
SET id_khach_hang_new = TO_CHAR(ngay_tao, 'YYYY-MM-DD') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))
WHERE id_khach_hang_new IS NULL;

-- BƯỚC 3: Mapping khóa ngoại cũ sang mới cho các bảng
UPDATE public.ho_so_dich_vu hs
SET id_khach_hang_new = kh.id_khach_hang_new
FROM public.khach_hang kh
WHERE hs.id_khach_hang = kh.id_khach_hang;

UPDATE public.tao_ma_qr qr
SET id_khach_hang_new = kh.id_khach_hang_new
FROM public.khach_hang kh
WHERE qr.id_khach_hang = kh.id_khach_hang;

-- BƯỚC 4: Xóa Foreign Keys cũ trỏ đến id_khach_hang
ALTER TABLE public.ho_so_dich_vu DROP CONSTRAINT IF EXISTS hsdv_id_khach_hang_fkey;
ALTER TABLE public.tao_ma_qr DROP CONSTRAINT IF EXISTS qr_id_khach_hang_fkey;

-- BƯỚC 5: Xóa Primary Key cũ trên khach_hang
ALTER TABLE public.khach_hang DROP CONSTRAINT IF EXISTS khach_hang_pkey;

-- BƯỚC 6: Xóa cột UUID cũ và đổi tên cột mới thành id_khach_hang
ALTER TABLE public.ho_so_dich_vu DROP COLUMN IF EXISTS id_khach_hang;
ALTER TABLE public.ho_so_dich_vu RENAME COLUMN id_khach_hang_new TO id_khach_hang;

ALTER TABLE public.tao_ma_qr DROP COLUMN IF EXISTS id_khach_hang;
ALTER TABLE public.tao_ma_qr RENAME COLUMN id_khach_hang_new TO id_khach_hang;

ALTER TABLE public.khach_hang DROP COLUMN IF EXISTS id_khach_hang;
ALTER TABLE public.khach_hang RENAME COLUMN id_khach_hang_new TO id_khach_hang;

-- BƯỚC 7: Thêm lại PRIMARY KEY và FOREIGN KEYs bằng cột TEXT
ALTER TABLE public.khach_hang ADD CONSTRAINT khach_hang_pkey PRIMARY KEY (id_khach_hang);

ALTER TABLE public.ho_so_dich_vu
  ADD CONSTRAINT hsdv_id_khach_hang_fkey FOREIGN KEY (id_khach_hang)
  REFERENCES public.khach_hang(id_khach_hang) ON DELETE SET NULL;

ALTER TABLE public.tao_ma_qr
  ADD CONSTRAINT qr_id_khach_hang_fkey FOREIGN KEY (id_khach_hang)
  REFERENCES public.khach_hang(id_khach_hang) ON DELETE SET NULL;

-- BƯỚC 8: Kiểm tra kết quả
SELECT id_khach_hang, ho_va_ten, so_dien_thoai FROM public.khach_hang LIMIT 10;
