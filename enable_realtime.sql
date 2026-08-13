-- Bật tính năng Realtime cho bảng chi_tiet_giao_dich
-- Chạy đoạn mã này trong mục SQL Editor trên trang chủ Supabase

BEGIN;
  -- Đảm bảo publication supabase_realtime tồn tại
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

-- Thêm bảng chi_tiet_giao_dich vào luồng realtime để các máy tự đồng bộ dữ liệu
ALTER PUBLICATION supabase_realtime ADD TABLE chi_tiet_giao_dich;
