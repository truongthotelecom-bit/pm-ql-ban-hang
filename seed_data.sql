-- DỮ LIỆU MẪU BAN ĐẦU CHO HỆ THỐNG
-- Cần chạy đoạn script này trong Supabase SQL Editor sau khi đã chạy schema

-- 1. Trạng thái giao dịch
INSERT INTO dm_trang_thai_giao_dich (id_trang_thai, ten_trang_thai, icon) VALUES
('11111111-1111-1111-1111-111111111111', 'Đang xử lý', '⏳'),
('22222222-2222-2222-2222-222222222222', 'Hoàn thành', '✅'),
('33333333-3333-3333-3333-333333333333', 'Đã hủy', '❌')
ON CONFLICT (id_trang_thai) DO NOTHING;

-- 2. Phương thức thanh toán
INSERT INTO dm_phuong_thuc_thanh_toan (id_pttt, ten_pttt, icon) VALUES
('44444444-4444-4444-4444-444444444444', 'Tiền mặt', '💵'),
('55555555-5555-5555-5555-555555555555', 'Chuyển khoản (VietQR)', '📱'),
('66666666-6666-6666-6666-666666666666', 'Quẹt thẻ (POS)', '💳')
ON CONFLICT (id_pttt) DO NOTHING;

-- 3. Cấu hình chữ ký
INSERT INTO sys_quan_ly_chu_ky (id_chu_ky, ten_chu_ky, ten_cua_hang) VALUES
('77777777-7777-7777-7777-777777777777', 'Nguyễn Văn A', 'AURA FINTECH STORE')
ON CONFLICT (id_chu_ky) DO NOTHING;

-- 4. Nhóm menu & Loại dịch vụ
INSERT INTO sys_nhom_menu (id_nhom, ten_nhom, index) VALUES
('88888888-8888-8888-8888-888888888888', 'Dịch Vụ Tài Chính', 1)
ON CONFLICT (id_nhom) DO NOTHING;

INSERT INTO sys_loai_dich_vu (id_loai_dich_vu, id_nhom, ten_danh_muc, ma_viet_tat, icon) VALUES
('99999999-9999-9999-9999-999999999999', '88888888-8888-8888-8888-888888888888', 'Dịch vụ Đáo hạn Thẻ', 'DH', '💳'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '88888888-8888-8888-8888-888888888888', 'Chuyển khoản nhanh', 'CK', '💸')
ON CONFLICT (id_loai_dich_vu) DO NOTHING;

-- 5. Danh mục dịch vụ (Ngân hàng/Máy POS)
INSERT INTO sys_danh_muc_dich_vu (id_danh_muc_dich_vu, id_loai_dich_vu, ten_dich_vu, ten_viet_tat, ma_bin) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ngân hàng Vietcombank', 'VCB', '970436'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ngân hàng Techcombank', 'TCB', '970415')
ON CONFLICT (id_danh_muc_dich_vu) DO NOTHING;

-- 6. Khách hàng mẫu
INSERT INTO khach_hang (ho_va_ten, so_dien_thoai) VALUES
('Khách Hàng Test 1', '0901234567'),
('Khách Hàng Test 2', '0987654321');
