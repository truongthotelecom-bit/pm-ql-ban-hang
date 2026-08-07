import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import useAuthStore from '../../store/useAuthStore';

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    const fetchStaff = async () => {
      // Nếu là Admin Hệ thống, thấy tất cả. Nếu là Chủ điểm bán, chỉ thấy nhân viên của mình
      let query = supabase.from('tai_khoan_nguoi_dung').select(`
        *,
        dm_nhom_quyen(ten_nhom_quyen, ma_quyen),
        sys_diem_ban(ten_diem_ban)
      `).order('ngay_tao', { ascending: false });

      if (user?.dm_nhom_quyen?.ma_quyen === 'CHU_DIEM_BAN' && user?.id_diem_ban) {
        query = query.eq('id_diem_ban', user.id_diem_ban);
      }

      const { data, error } = await query;
      if (!error && data) {
        setStaff(data);
      }
      setLoading(false);
    };
    if (user) fetchStaff();
  }, [user]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Quản lý Nhân Viên</h1>
        <button className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-colors">
          + Thêm Tài Khoản
        </button>
      </div>

      <div className="bg-[#1A1D27] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-800 bg-[#151821]">
              <th className="p-4 text-sm font-semibold text-gray-300">Tài khoản (Tên Đăng Nhập)</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Họ & Tên</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Nhóm Quyền</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Điểm Bán</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Trạng thái</th>
              <th className="p-4 text-sm font-semibold text-gray-300 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-4 text-center text-gray-500">Đang tải...</td></tr>
            ) : staff.length === 0 ? (
              <tr><td colSpan="6" className="p-4 text-center text-gray-500">Chưa có dữ liệu</td></tr>
            ) : (
              staff.map(s => (
                <tr key={s.id_tai_khoan} className="border-b border-gray-800/50 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-sm text-gray-300 font-mono font-medium">{s.username}</td>
                  <td className="p-4 text-sm font-medium text-white">{s.ho_ten}</td>
                  <td className="p-4 text-sm text-gray-400">{s.dm_nhom_quyen?.ten_nhom_quyen}</td>
                  <td className="p-4 text-sm text-gray-400">{s.sys_diem_ban?.ten_diem_ban || '-'}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${s.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {s.is_active ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-right">
                    <button className="text-violet-400 hover:text-violet-300 transition-colors">Phân Quyền</button>
                    <span className="mx-2 text-gray-700">|</span>
                    <button className="text-blue-400 hover:text-blue-300 transition-colors">Sửa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
