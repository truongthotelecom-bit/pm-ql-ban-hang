-- Cập nhật tự động "Khách Lẻ (Tiêu chuẩn)" cho tất cả các hồ sơ chưa có loại hợp đồng
UPDATE public.ho_so_dich_vu
SET id_loai_hop_dong = 'a1000000-0000-0000-0000-000000000001'
WHERE id_loai_hop_dong IS NULL;
