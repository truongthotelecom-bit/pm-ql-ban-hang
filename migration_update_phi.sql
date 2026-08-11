-- Xóa cột id_phi_ngoai không cần thiết
ALTER TABLE public.chi_tiet_giao_dich DROP COLUMN IF EXISTS id_phi_ngoai;

-- Thêm cột so_tien_yeu_cau (số tiền nhập tay trên bàn phím POS)
ALTER TABLE public.chi_tiet_giao_dich ADD COLUMN IF NOT EXISTS so_tien_yeu_cau numeric null default 0;

-- (Tùy chọn) Cập nhật lại dữ liệu cũ nếu muốn so_tien_yeu_cau bằng so_tien
UPDATE public.chi_tiet_giao_dich 
SET so_tien_yeu_cau = so_tien 
WHERE so_tien_yeu_cau = 0 OR so_tien_yeu_cau IS NULL;
