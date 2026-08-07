import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Select, message, Modal, Form, Input, Button, Switch } from 'antd';

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [stores, setStores] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

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

  const handleAddUser = async (values) => {
    try {
      const email = `${values.username}@aura.local`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: values.password,
      });

      if (authError) throw authError;
      const newUserId = authData.user?.id;

      if (newUserId) {
        const { error: dbError } = await supabase.from('tai_khoan_nguoi_dung').insert([{
          id_tai_khoan: newUserId,
          username: values.username,
          ho_ten: values.ho_ten,
          id_nhom_quyen: values.id_nhom_quyen,
          id_diem_ban: values.id_diem_ban,
          is_active: values.is_active
        }]);
        
        if (dbError) throw dbError;
        
        message.success('Tạo tài khoản thành công!');
        setIsModalVisible(false);
        form.resetFields();
        fetchData();
      }
    } catch (err) {
      console.error(err);
      message.error(err.message || 'Lỗi khi tạo tài khoản');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Phân Quyền Hệ Thống (Dành cho Dev)</h1>
        <button 
          onClick={() => { form.resetFields(); form.setFieldsValue({ is_active: true }); setIsModalVisible(true); }}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-colors"
        >
          + Thêm Tài Khoản
        </button>
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

      <Modal
        title={<span className="text-gray-800">Tạo Tài Khoản Mới</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAddUser} className="mt-4">
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input placeholder="VD: admin_hcm" />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }, { min: 6 }]}>
            <Input.Password placeholder="Tối thiểu 6 ký tự" />
          </Form.Item>
          <Form.Item name="ho_ten" label="Họ tên" rules={[{ required: true }]}>
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>
          
          <div className="flex gap-4">
            <Form.Item name="id_nhom_quyen" label="Quyền hạn" className="flex-1">
              <Select options={roles.map(r => ({ value: r.id_nhom_quyen, label: r.ten_nhom_quyen }))} placeholder="Chọn quyền" />
            </Form.Item>
            <Form.Item name="id_diem_ban" label="Điểm bán" className="flex-1">
              <Select options={[{ value: null, label: 'Toàn hệ thống' }, ...stores.map(s => ({ value: s.id_diem_ban, label: s.ten_diem_ban }))]} placeholder="Chọn điểm bán" />
            </Form.Item>
          </div>

          <Form.Item name="is_active" label="Hoạt động" valuePropName="checked">
            <Switch checkedChildren="Bật" unCheckedChildren="Khóa" />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" className="bg-violet-600">Tạo Mới</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
