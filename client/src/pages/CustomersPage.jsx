import React, { useEffect } from 'react';
import useAppStore from '../store/useAppStore';

export default function CustomersPage() {
  const store = useAppStore();

  useEffect(() => {
    store.fetchCustomers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
      <h2 className="text-lg font-bold text-gray-200 border-b border-gray-800 pb-3">Hồ sơ khách hàng CRM</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="py-3 px-4">Họ và tên</th>
              <th className="py-3 px-4">Điện thoại</th>
              <th className="py-3 px-4">Địa chỉ cư trú</th>
              <th className="py-3 px-4">Giới tính</th>
              <th className="py-3 px-4">Cấp bậc</th>
            </tr>
          </thead>
          <tbody>
            {store.customers.map(c => (
              <tr key={c.id_khach_hang} className="border-b border-gray-800/40 hover:bg-white/5 transition-all text-gray-300">
                <td className="py-3 px-4 font-bold">{c.ho_va_ten}</td>
                <td className="py-3 px-4">{c.so_dien_thoai}</td>
                <td className="py-3 px-4">{c.dia_chi || '-'}</td>
                <td className="py-3 px-4">{c.id_gioi_tinh === 'dm-gender-male' ? 'Nam' : 'Nữ'}</td>
                <td className="py-3 px-4 text-violet-400 font-bold">{c.id_level === 'dm-lvl-vip' ? 'VIP Vàng' : 'Thành viên'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
