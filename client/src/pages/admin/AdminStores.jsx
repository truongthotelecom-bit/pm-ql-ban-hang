import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Modal, Form, Input, Button, message, Switch } from 'antd';

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [form] = Form.useForm();

  const fetchStores = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('sys_diem_ban').select('*').order('ngay_tao', { ascending: false });
    if (!error && data) {
      setStores(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const showModal = (store = null) => {
    setEditingStore(store);
    if (store) {
      form.setFieldsValue(store);
    } else {
      form.resetFields();
      form.setFieldsValue({ trang_thai: true });
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingStore(null);
  };

  const onFinish = async (values) => {
    try {
      if (editingStore) {
        const { error } = await supabase
          .from('sys_diem_ban')
          .update(values)
          .eq('id_diem_ban', editingStore.id_diem_ban);
        if (error) throw error;
        message.success('Cập nhật điểm bán thành công!');
      } else {
        const { error } = await supabase
          .from('sys_diem_ban')
          .insert([values]);
        if (error) throw error;
        message.success('Thêm điểm bán mới thành công!');
      }
      setIsModalVisible(false);
      fetchStores();
    } catch (error) {
      console.error(error);
      message.error(error.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Quản lý Điểm Bán</h1>
        <button 
          onClick={() => showModal()}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-colors"
        >
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
                    <button 
                      onClick={() => showModal(store)}
                      className="text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      Sửa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm / Sửa */}
      <Modal
        title={<span className="text-gray-800">{editingStore ? 'Sửa Điểm Bán' : 'Thêm Điểm Bán Mới'}</span>}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="mt-4"
        >
          <Form.Item
            name="ma_diem_ban"
            label="Mã Điểm Bán (Viết liền không dấu)"
            rules={[{ required: true, message: 'Vui lòng nhập mã điểm bán!' }]}
          >
            <Input placeholder="VD: DB01" disabled={!!editingStore} />
          </Form.Item>

          <Form.Item
            name="ten_diem_ban"
            label="Tên Điểm Bán"
            rules={[{ required: true, message: 'Vui lòng nhập tên điểm bán!' }]}
          >
            <Input placeholder="VD: Cửa hàng Quận 1" />
          </Form.Item>

          <Form.Item
            name="dia_chi"
            label="Địa chỉ"
          >
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>

          <Form.Item
            name="sdt"
            label="Số điện thoại"
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="trang_thai"
            label="Trạng thái hoạt động"
            valuePropName="checked"
          >
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={handleCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit" className="bg-violet-600">
              {editingStore ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
