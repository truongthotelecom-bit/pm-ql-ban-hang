-- 1. Create sys_danh_sach_bang
CREATE TABLE IF NOT EXISTS public.sys_danh_sach_bang (
  id_bang text NOT NULL,
  ten_bang text NOT NULL,
  ghi_chu text,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  CONSTRAINT sys_danh_sach_bang_pkey PRIMARY KEY (id_bang)
) TABLESPACE pg_default;

-- 2. Create sys_danh_sach_cot
CREATE TABLE IF NOT EXISTS public.sys_danh_sach_cot (
  id_cot text NOT NULL,
  id_bang text NOT NULL,
  ten_cot text NOT NULL,
  ghi_chu text,
  ngay_tao timestamp with time zone DEFAULT now(),
  ngay_sua timestamp with time zone DEFAULT now(),
  CONSTRAINT sys_danh_sach_cot_pkey PRIMARY KEY (id_cot, id_bang),
  CONSTRAINT sys_dsc_id_bang_fkey FOREIGN KEY (id_bang)
    REFERENCES public.sys_danh_sach_bang(id_bang) ON DELETE CASCADE
) TABLESPACE pg_default;

-- 3. Seed initial data
INSERT INTO public.sys_danh_sach_bang (id_bang, ten_bang)
VALUES ('chi_tiet_giao_dich', 'Form Giao Dịch')
ON CONFLICT (id_bang) DO NOTHING;

INSERT INTO public.sys_danh_sach_cot (id_cot, id_bang, ten_cot)
VALUES 
  ('id_pttt_nguon', 'chi_tiet_giao_dich', 'Hình thức Khách đưa tiền'),
  ('id_pttt_di', 'chi_tiet_giao_dich', 'Hình thức Chuyển tiền đi'),
  ('so_tien', 'chi_tiet_giao_dich', 'Số tiền giao dịch Gốc'),
  ('is_cuoc_trong', 'chi_tiet_giao_dich', 'Chế độ Cước Trong'),
  ('phi_dich_vu', 'chi_tiet_giao_dich', 'Phí Dịch Vụ'),
  ('id_pttt_phi', 'chi_tiet_giao_dich', 'Nguồn tiền đóng phí'),
  ('so_tien_giam', 'chi_tiet_giao_dich', 'Giảm giá trực tiếp'),
  ('chiet_khau', 'chi_tiet_giao_dich', 'Chiết khấu Kế toán (%)'),
  ('noi_dung', 'chi_tiet_giao_dich', 'Nội dung/Ghi chú'),
  ('id_trang_thai', 'chi_tiet_giao_dich', 'Trạng thái giao dịch')
ON CONFLICT (id_cot, id_bang) DO NOTHING;

-- 4. Clean up any invalid data in sys_ql_cot_du_lieu that would break the constraint
DELETE FROM public.sys_ql_cot_du_lieu 
WHERE id_ten_bang NOT IN (SELECT id_bang FROM public.sys_danh_sach_bang)
   OR id_ten_cot NOT IN (SELECT id_cot FROM public.sys_danh_sach_cot);

-- 5. Add constraints to sys_ql_cot_du_lieu
ALTER TABLE public.sys_ql_cot_du_lieu
DROP CONSTRAINT IF EXISTS sys_ql_cot_du_lieu_id_bang_fkey,
ADD CONSTRAINT sys_ql_cot_du_lieu_id_bang_fkey FOREIGN KEY (id_ten_bang)
  REFERENCES public.sys_danh_sach_bang(id_bang) ON DELETE CASCADE;

ALTER TABLE public.sys_ql_cot_du_lieu
DROP CONSTRAINT IF EXISTS sys_ql_cot_du_lieu_id_cot_fkey,
ADD CONSTRAINT sys_ql_cot_du_lieu_id_cot_fkey FOREIGN KEY (id_ten_cot, id_ten_bang)
  REFERENCES public.sys_danh_sach_cot(id_cot, id_bang) ON DELETE CASCADE;
