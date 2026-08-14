-- ==============================================================================
-- BƯỚC 1: CẬP NHẬT TÊN LOẠI HỢP ĐỒNG KHÁCH LẺ THÀNH MẶC ĐỊNH
-- ==============================================================================
UPDATE public.dm_loai_hop_dong
SET ten_loai = 'Mặc định (Khách Lẻ)'
WHERE ten_loai ILIKE '%Khách Lẻ%';

-- ==============================================================================
-- BƯỚC 2: THÊM 2 CÁCH TÍNH PHÍ MỚI VÀO DANH MỤC CÁCH TÍNH PHÍ
-- ==============================================================================
INSERT INTO public.dm_cach_tinh_phi (id_cach_tinh, ten_cach_tinh, index, icon) VALUES
  ('b0000008-0000-0000-0000-000000000003', 'Theo Lốc 1 (Block 3tr/10k)', 3, 'layers'),
  ('b0000008-0000-0000-0000-000000000004', 'Theo Lốc 2 (10tr/10k, 5tr/5k)', 4, 'layers')
ON CONFLICT (id_cach_tinh) DO UPDATE 
SET ten_cach_tinh = EXCLUDED.ten_cach_tinh;

-- ==============================================================================
-- BƯỚC 3: THÊM CỘT ĐIỂM BÁN (ID_DIEM_BAN) VÀO BẢNG DM_BIEU_PHI
-- ==============================================================================
-- Kiểm tra nếu cột id_diem_ban chưa tồn tại thì thêm vào
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='dm_bieu_phi' AND column_name='id_diem_ban') THEN
        ALTER TABLE public.dm_bieu_phi 
        ADD COLUMN id_diem_ban uuid REFERENCES public.sys_diem_ban(id_diem_ban) ON DELETE CASCADE;
    END IF;
END $$;
