-- Thêm cột so_tien_tu và so_tien_den vào bảng dm_bieu_phi
ALTER TABLE public.dm_bieu_phi 
ADD COLUMN IF NOT EXISTS so_tien_tu numeric,
ADD COLUMN IF NOT EXISTS so_tien_den numeric;

-- Comment mô tả
COMMENT ON COLUMN public.dm_bieu_phi.so_tien_tu IS 'Mốc số tiền giao dịch bắt đầu (Tối thiểu)';
COMMENT ON COLUMN public.dm_bieu_phi.so_tien_den IS 'Mốc số tiền giao dịch kết thúc (Tối đa)';
