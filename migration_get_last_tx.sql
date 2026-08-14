CREATE OR REPLACE FUNCTION get_last_tx_by_danh_muc(p_id_danh_muc_dich_vu uuid, p_id_ho_so_dich_vu uuid)
RETURNS SETOF chi_tiet_giao_dich
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT t.*
  FROM chi_tiet_giao_dich t
  JOIN ho_so_dich_vu h ON t.id_ho_so_dich_vu = h.id_ho_so_dich_vu
  JOIN ma_hop_dong m ON h.id_ma_hop_dong = m.id_ma_hop_dong
  WHERE m.id_danh_muc_dich_vu = p_id_danh_muc_dich_vu
    AND t.id_ho_so_dich_vu != p_id_ho_so_dich_vu
  ORDER BY t.thoi_gian_giao_dich DESC
  LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION get_last_tx_by_loai(p_id_loai_dich_vu uuid, p_id_ho_so_dich_vu uuid)
RETURNS SETOF chi_tiet_giao_dich
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT t.*
  FROM chi_tiet_giao_dich t
  JOIN ho_so_dich_vu h ON t.id_ho_so_dich_vu = h.id_ho_so_dich_vu
  JOIN ma_hop_dong m ON h.id_ma_hop_dong = m.id_ma_hop_dong
  JOIN sys_danh_muc_dich_vu d ON m.id_danh_muc_dich_vu = d.id_danh_muc_dich_vu
  WHERE d.id_loai_dich_vu = p_id_loai_dich_vu
    AND t.id_ho_so_dich_vu != p_id_ho_so_dich_vu
  ORDER BY t.thoi_gian_giao_dich DESC
  LIMIT 1;
END;
$$;
