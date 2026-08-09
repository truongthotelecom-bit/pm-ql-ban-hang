import React, { useState, useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

export default function ContractsPage() {
  const store = useAppStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  
  // Refetch when component mounts just in case
  useEffect(() => {
    store.fetchContracts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleOpenEdit = (record) => {
    setEditingId(record.id_ma_hop_dong);
    form.setFieldsValue({
      ma_hop_dong: record.ma_hop_dong,
      chu_hop_dong: record.chu_hop_dong,
      id_danh_muc_dich_vu: record.id_danh_muc_dich_vu,
      ghi_chu: record.ghi_chu
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    const success = await store.deleteContract(id);
    if (success) {
      message.success('Xóa mã hợp đồng thành công');
    } else {
      message.error('Lỗi khi xóa mã hợp đồng (có thể dữ liệu đang được sử dụng)');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await store.updateContract(editingId, values);
        message.success('Cập nhật mã hợp đồng thành công');
      } else {
        await store.addContract(values);
        message.success('Thêm mới mã hợp đồng thành công');
      }
      setIsModalVisible(false);
    } catch (err) {
      console.log('Validate Failed:', err);
    }
  };

  const columns = [
    {
      title: 'Mã Hợp Đồng',
      dataIndex: 'ma_hop_dong',
      key: 'ma_hop_dong',
      render: (text) => <span className="font-bold text-violet-400">{text}</span>
    },
    {
      title: 'Chủ Hợp Đồng',
      dataIndex: 'chu_hop_dong',
      key: 'chu_hop_dong',
    },
    {
      title: 'Dịch vụ liên kết',
      dataIndex: 'id_danh_muc_dich_vu',
      key: 'id_danh_muc_dich_vu',
      render: (val) => {
        const svc = store.services?.find(s => s.id_loai_dich_vu === val);
        return svc ? svc.ten_dich_vu : '-';
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'ngay_tao',
      key: 'ngay_tao',
      render: (val) => val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '-'
    },
    {
      title: 'Ghi chú',
      dataIndex: 'ghi_chu',
      key: 'ghi_chu',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined className="text-blue-400" />} 
            onClick={() => handleOpenEdit(record)} 
          />
          <Popconfirm
            title="Xóa mã hợp đồng"
            description="Bạn có chắc chắn muốn xóa mã hợp đồng này?"
            onConfirm={() => handleDelete(record.id_ma_hop_dong)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
      <div className="flex justify-between items-center border-b border-gray-800 pb-3">
        <h2 className="text-xl font-bold text-gray-200">Quản lý Mã Hợp Đồng</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleOpenAdd}
          className="bg-violet-600 hover:bg-violet-500 border-none rounded-lg"
        >
          Thêm hợp đồng
        </Button>
      </div>

      <div className="overflow-x-auto bg-[#0d1426]/50 rounded-xl p-2">
        <Table 
          columns={columns} 
          dataSource={store.ma_hop_dong || []} 
          rowKey="id_ma_hop_dong"
          pagination={{ pageSize: 10 }}
          className="custom-table"
        />
      </div>

      <Modal
        title={<span className="text-gray-100">{editingId ? 'Cập nhật Mã Hợp Đồng' : 'Thêm mới Mã Hợp Đồng'}</span>}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
        className="dark-modal"
        okButtonProps={{ className: 'bg-violet-600 hover:bg-violet-500 border-none' }}
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            name="ma_hop_dong"
            label={<span className="text-gray-300">Mã hợp đồng</span>}
            rules={[{ required: true, message: 'Vui lòng nhập mã hợp đồng!' }]}
          >
            <Input placeholder="VD: HD-00123" className="bg-[#1a2333] border-gray-700 text-white placeholder-gray-500" />
          </Form.Item>

          <Form.Item
            name="chu_hop_dong"
            label={<span className="text-gray-300">Tên chủ hợp đồng</span>}
          >
            <Input placeholder="Nhập tên người đứng tên hợp đồng" className="bg-[#1a2333] border-gray-700 text-white placeholder-gray-500" />
          </Form.Item>

          <Form.Item
            name="id_danh_muc_dich_vu"
            label={<span className="text-gray-300">Dịch vụ liên kết</span>}
          >
            <Select 
              placeholder="Chọn dịch vụ" 
              className="dark-select"
              popupClassName="dark-dropdown"
              allowClear
            >
              {store.services?.map(s => (
                <Select.Option key={s.id_loai_dich_vu} value={s.id_loai_dich_vu}>
                  {s.ten_dich_vu}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="ghi_chu"
            label={<span className="text-gray-300">Ghi chú thêm</span>}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Ghi chú về hợp đồng này..." 
              className="bg-[#1a2333] border-gray-700 text-white placeholder-gray-500"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
