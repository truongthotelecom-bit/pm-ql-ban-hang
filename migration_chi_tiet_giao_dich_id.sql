-- ================================================================
-- MIGRATION: Đổi id_chi_tiet_giao_dich từ UUID sang TEXT (YYYY-MM-DD-8KÝTỰ)
-- Chạy trên Supabase SQL Editor
-- ================================================================

-- BƯỚC 1: Thêm cột tạm thời kiểu TEXT cho tất cả các bảng liên quan
ALTER TABLE public.chi_tiet_giao_dich ADD COLUMN IF NOT EXISTS id_chi_tiet_giao_dich_new TEXT;
ALTER TABLE public.tao_ma_qr ADD COLUMN IF NOT EXISTS id_chi_tiet_giao_dich_new TEXT;
ALTER TABLE public.phieu_dem_tien ADD COLUMN IF NOT EXISTS id_chi_tiet_giao_dich_new TEXT;

-- BƯỚC 2: Sinh mã mới cho giao dịch hiện tại
UPDATE public.chi_tiet_giao_dich
SET id_chi_tiet_giao_dich_new = TO_CHAR(thoi_gian_giao_dich, 'YYYY-MM-DD') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))
WHERE id_chi_tiet_giao_dich_new IS NULL;

-- BƯỚC 3: Mapping khóa ngoại cũ sang mới cho các bảng phụ thuộc
UPDATE public.tao_ma_qr qr
SET id_chi_tiet_giao_dich_new = ct.id_chi_tiet_giao_dich_new
FROM public.chi_tiet_giao_dich ct
WHERE qr.id_chi_tiet_giao_dich = ct.id_chi_tiet_giao_dich;

UPDATE public.phieu_dem_tien pdt
SET id_chi_tiet_giao_dich_new = ct.id_chi_tiet_giao_dich_new
FROM public.chi_tiet_giao_dich ct
WHERE pdt.id_chi_tiet_giao_dich = ct.id_chi_tiet_giao_dich;

-- BƯỚC 4: Xóa Foreign Keys cũ trỏ đến id_chi_tiet_giao_dich
ALTER TABLE public.tao_ma_qr DROP CONSTRAINT IF EXISTS qr_id_ctgd_fkey;
ALTER TABLE public.phieu_dem_tien DROP CONSTRAINT IF EXISTS pdt_id_ctgd_fkey;

-- BƯỚC 5: Xóa Primary Key cũ trên chi_tiet_giao_dich
ALTER TABLE public.chi_tiet_giao_dich DROP CONSTRAINT IF EXISTS chi_tiet_giao_dich_pkey;

-- BƯỚC 6: Xóa cột UUID cũ và đổi tên cột mới thành id_chi_tiet_giao_dich
ALTER TABLE public.tao_ma_qr DROP COLUMN IF EXISTS id_chi_tiet_giao_dich;
ALTER TABLE public.tao_ma_qr RENAME COLUMN id_chi_tiet_giao_dich_new TO id_chi_tiet_giao_dich;

ALTER TABLE public.phieu_dem_tien DROP COLUMN IF EXISTS id_chi_tiet_giao_dich;
ALTER TABLE public.phieu_dem_tien RENAME COLUMN id_chi_tiet_giao_dich_new TO id_chi_tiet_giao_dich;

ALTER TABLE public.chi_tiet_giao_dich DROP COLUMN IF EXISTS id_chi_tiet_giao_dich;
ALTER TABLE public.chi_tiet_giao_dich RENAME COLUMN id_chi_tiet_giao_dich_new TO id_chi_tiet_giao_dich;

-- BƯỚC 7: Thêm lại PRIMARY KEY và FOREIGN KEYs bằng cột TEXT
ALTER TABLE public.chi_tiet_giao_dich ADD CONSTRAINT chi_tiet_giao_dich_pkey PRIMARY KEY (id_chi_tiet_giao_dich);

ALTER TABLE public.tao_ma_qr
  ADD CONSTRAINT qr_id_ctgd_fkey FOREIGN KEY (id_chi_tiet_giao_dich)
  REFERENCES public.chi_tiet_giao_dich(id_chi_tiet_giao_dich) ON DELETE SET NULL;

ALTER TABLE public.phieu_dem_tien
  ADD CONSTRAINT pdt_id_ctgd_fkey FOREIGN KEY (id_chi_tiet_giao_dich)
  REFERENCES public.chi_tiet_giao_dich(id_chi_tiet_giao_dich) ON DELETE SET NULL;

-- BƯỚC 8: Kiểm tra kết quả
SELECT id_chi_tiet_giao_dich, noi_dung, so_tien_di FROM public.chi_tiet_giao_dich LIMIT 10;
