import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import useAuthStore from '../store/useAuthStore';
import { Modal, Form, Input, Button, message, Select, Switch } from 'antd';

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const user = useAuthStore(state => state.user);

  const fetchStaff = async () => {
    setLoading(true);
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

  useEffect(() => {
    if (user) fetchStaff();
  }, [user]);

  const handleAddStaff = async (values) => {
    try {
      // Vì Supabase yêu cầu email cho auth, ta tạo email giả từ username nếu người dùng ko nhập email thật
      const email = `${values.username}@aura.local`;
      
      // BƯỚC 1: Tạo tài khoản trên Supabase Auth 
      // (Lưu ý: Trong thực tế, gọi signUp ở Client sẽ tự động đăng nhập user mới. 
      // Ở môi trường production cần dùng Edge Function hoặc Service Role Key để tạo user ngầm)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: values.password,
      });

      if (authError) throw authError;

      const newUserId = authData.user?.id;

      if (newUserId) {
        // BƯỚC 2: Thêm thông tin vào bảng tai_khoan_nguoi_dung
        const { error: dbError } = await supabase.from('tai_khoan_nguoi_dung').insert([{
          id_tai_khoan: newUserId,
          username: values.username,
          ho_ten: values.ho_ten,
          id_diem_ban: user?.id_diem_ban, // Gán tự động vào điểm bán hiện tại
          is_active: values.is_active
        }]);
        
        if (dbError) throw dbError;
        
        message.success('Tạo tài khoản nhân viên thành công!');
        setIsModalVisible(false);
        form.resetFields();
        fetchStaff();
      }
    } catch (err) {
      console.error(err);
      message.error(err.message || 'Lỗi khi tạo tài khoản');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Quản lý Nhân Viên</h1>
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
                    <button className="text-blue-400 hover:text-blue-300 transition-colors">Sửa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        title={<span className="text-gray-800">Tạo Tài Khoản Nhân Viên Mới</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddStaff}
          className="mt-4"
        >
          <Form.Item
            name="username"
            label="Tên Đăng Nhập (Username)"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input placeholder="VD: nhanvien01" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }, { min: 6, message: 'Mật khẩu phải ít nhất 6 ký tự' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item
            name="ho_ten"
            label="Họ và Tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên nhân viên!' }]}
          >
            <Input placeholder="VD: Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Trạng thái hoạt động"
            valuePropName="checked"
          >
            <Switch checkedChildren="Bật" unCheckedChildren="Khóa" />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" className="bg-violet-600">
              Tạo Tài Khoản
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
