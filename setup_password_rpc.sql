-- ==============================================================================
-- FILE CHẠY MỘT LẦN: TẠO HÀM (RPC) ĐỂ ADMIN ĐỔI MẬT KHẨU TÀI KHOẢN KHÁC
-- Bắt buộc chạy bằng tài khoản postgres (Admin của Supabase)
-- ==============================================================================

-- 1. Bật module pgcrypto nếu chưa có
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Tạo hàm đổi mật khẩu chạy bằng quyền cao nhất (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.admin_update_user_password(user_id uuid, new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Cập nhật mật khẩu trong auth.users
  UPDATE auth.users 
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE id = user_id;
END;
$$;

-- 3. Cấp quyền thực thi hàm cho authenticated users (vì UI Admin gọi hàm này bằng auth client)
GRANT EXECUTE ON FUNCTION public.admin_update_user_password(uuid, text) TO authenticated;

-- ==============================================================================
-- 4. Tạo hàm XÓA tài khoản (SECURITY DEFINER)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Xoá trong bảng public trước
  DELETE FROM public.tai_khoan_nguoi_dung WHERE id_tai_khoan = target_user_id;
  
  -- Xoá trong auth.users (Tài khoản đăng nhập)
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;
