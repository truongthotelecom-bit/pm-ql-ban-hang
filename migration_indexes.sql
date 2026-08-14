-- Tối ưu hóa (Index) cho tính năng Kế thừa dữ liệu 3 cấp độ

-- 1. Tối ưu tìm kiếm Giao dịch gần nhất của một Hồ sơ cụ thể
-- Giúp lệnh `ORDER BY thoi_gian_giao_dich DESC LIMIT 1` chạy siêu tốc bằng B-Tree
CREATE INDEX IF NOT EXISTS idx_ctgd_hoso_thoigian 
ON chi_tiet_giao_dich (id_ho_so_dich_vu, thoi_gian_giao_dich DESC);

-- 2. Tối ưu JOIN từ Mã Hợp Đồng sang Hồ Sơ Dịch Vụ
-- Giúp tìm nhanh tất cả các Hồ sơ thuộc về một Hợp đồng (dùng cho Ưu tiên 2 và 3)
CREATE INDEX IF NOT EXISTS idx_hoso_mahopdong 
ON ho_so_dich_vu (id_ma_hop_dong);

-- 3. Tối ưu tìm Hợp Đồng theo Danh Mục
-- Giúp tìm nhanh tất cả Hợp đồng thuộc về một Danh mục dịch vụ cụ thể (VD: Nạp thẻ Mobi)
CREATE INDEX IF NOT EXISTS idx_hopdong_danhmuc 
ON ma_hop_dong (id_danh_muc_dich_vu);

-- 4. Tối ưu tìm Danh Mục theo Loại Dịch Vụ
-- Giúp tìm nhanh các Danh mục thuộc chung Loại dịch vụ (VD: Loại 'Chuyển tiền')
CREATE INDEX IF NOT EXISTS idx_danhmuc_loaidv 
ON sys_danh_muc_dich_vu (id_loai_dich_vu);
