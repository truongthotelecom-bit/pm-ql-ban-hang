import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      const { data, error } = await supabase.from('sys_diem_ban').select('*').order('ngay_tao', { ascending: false });
      if (!error && data) {
        setStores(data);
      }
      setLoading(false);
    };
    fetchStores();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Quản lý Điểm Bán</h1>
        <button className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-colors">
          + Thêm Điểm Bán Mới
        </button>
      </div>

      <div className="bg-[#1A1D27] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-800 bg-[#151821]">
              <th className="p-4 text-sm font-semibold text-gray-300">Mã Điểm Bán</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Tên Điểm Bán</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Địa chỉ</th>
              <th className="p-4 text-sm font-semibold text-gray-300">SĐT</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Trạng thái</th>
              <th className="p-4 text-sm font-semibold text-gray-300 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-4 text-center text-gray-500">Đang tải...</td></tr>
            ) : stores.length === 0 ? (
              <tr><td colSpan="6" className="p-4 text-center text-gray-500">Chưa có dữ liệu</td></tr>
            ) : (
              stores.map(store => (
                <tr key={store.id_diem_ban} className="border-b border-gray-800/50 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-sm text-gray-300 font-mono">{store.ma_diem_ban}</td>
                  <td className="p-4 text-sm font-medium text-white">{store.ten_diem_ban}</td>
                  <td className="p-4 text-sm text-gray-400">{store.dia_chi || '-'}</td>
                  <td className="p-4 text-sm text-gray-400">{store.sdt || '-'}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${store.trang_thai ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {store.trang_thai ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-right">
                    <button className="text-violet-400 hover:text-violet-300 transition-colors">Sửa</button>
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
