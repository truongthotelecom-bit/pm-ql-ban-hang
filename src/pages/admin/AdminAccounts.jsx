import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Select, message } from 'antd';

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [stores, setStores] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [accRes, storeRes, roleRes] = await Promise.all([
      supabase.from('tai_khoan_nguoi_dung').select('*, dm_nhom_quyen(ten_nhom_quyen), sys_diem_ban(ten_diem_ban)').order('ngay_tao', { ascending: false }),
      supabase.from('sys_diem_ban').select('*'),
      supabase.from('dm_nhom_quyen').select('*')
    ]);
    
    if (!accRes.error) setAccounts(accRes.data || []);
    if (!storeRes.error) setStores(storeRes.data || []);
    if (!roleRes.error) setRoles(roleRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateAccount = async (accountId, field, value) => {
    try {
      const { error } = await supabase
        .from('tai_khoan_nguoi_dung')
        .update({ [field]: value })
        .eq('id_tai_khoan', accountId);
      
      if (error) throw error;
      message.success('Cập nhật thành công!');
      fetchData();
    } catch (err) {
      console.error(err);
      message.error('Lỗi khi cập nhật!');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Phân Quyền Hệ Thống (Dành cho Dev)</h1>
      </div>
      
      <div className="bg-[#1A1D27] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-800 bg-[#151821]">
              <th className="p-4 text-sm font-semibold text-gray-300">Tài khoản</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Họ tên</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Quyền hạn (Role)</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Thuộc Điểm Bán</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="p-4 text-center text-gray-500">Đang tải...</td></tr>
            ) : accounts.length === 0 ? (
              <tr><td colSpan="4" className="p-4 text-center text-gray-500">Chưa có dữ liệu</td></tr>
            ) : (
              accounts.map(acc => (
                <tr key={acc.id_tai_khoan} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                  <td className="p-4 text-sm text-gray-300 font-mono">{acc.username}</td>
                  <td className="p-4 text-sm font-medium text-white">{acc.ho_ten}</td>
                  <td className="p-4">
                    <Select
                      value={acc.id_nhom_quyen}
                      className="w-48"
                      onChange={(val) => handleUpdateAccount(acc.id_tai_khoan, 'id_nhom_quyen', val)}
                      options={[
                        { value: null, label: 'Chưa phân quyền' },
                        ...roles.map(r => ({ value: r.id_nhom_quyen, label: r.ten_nhom_quyen }))
                      ]}
                    />
                  </td>
                  <td className="p-4">
                    <Select
                      value={acc.id_diem_ban}
                      className="w-48"
                      onChange={(val) => handleUpdateAccount(acc.id_tai_khoan, 'id_diem_ban', val)}
                      options={[
                        { value: null, label: 'Toàn hệ thống (Không gắn điểm bán)' },
                        ...stores.map(s => ({ value: s.id_diem_ban, label: s.ten_diem_ban }))
                      ]}
                    />
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
