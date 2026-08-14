-- ==============================================================================
-- BƯỚC 1: THÊM 2 CỘT MỚI VÀO BẢNG BIỂU PHÍ (CHO THUẬT TOÁN ĐỘNG)
-- ==============================================================================
ALTER TABLE public.dm_bieu_phi 
ADD COLUMN IF NOT EXISTS phi_toi_thieu numeric,
ADD COLUMN IF NOT EXISTS buoc_lam_tron numeric;

COMMENT ON COLUMN public.dm_bieu_phi.phi_toi_thieu IS 'Mức phí tối thiểu áp dụng sau khi nhân %';
COMMENT ON COLUMN public.dm_bieu_phi.buoc_lam_tron IS 'Làm tròn lên bội số của bước này (vd: 5000, 10000)';

-- ==============================================================================
-- BƯỚC 2: THÊM CÁCH TÍNH PHÍ ĐỘNG VÀO DANH MỤC CÁCH TÍNH PHÍ
-- ==============================================================================
INSERT INTO public.dm_cach_tinh_phi (id_cach_tinh, ten_cach_tinh, index, icon) VALUES
  ('b0000008-0000-0000-0000-000000000005', 'Theo % và Làm tròn lên', 5, 'percentage')
ON CONFLICT (id_cach_tinh) DO UPDATE 
SET ten_cach_tinh = EXCLUDED.ten_cach_tinh;
