import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Table, Button, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { supabase } from '../../lib/supabaseClient';
import { adminCategoriesConfig } from '../../config/adminConfig';

export default function AdminCategoryPage() {
  const { tableName } = useParams();
  
  const activeConfig = adminCategoriesConfig.find(c => c.tableName === tableName);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // Load data for active table
  const loadData = async () => {
    setLoading(true);
    try {
      const { data: tableData, error } = await supabase
        .from(activeConfig.tableName)
        .select('*')
        .order('ngay_tao', { ascending: false });

      if (error) throw error;
      setData(tableData || []);
    } catch (err) {
      console.error(err);
      message.error(`Lỗi tải dữ liệu bảng ${activeConfig.title}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeConfig) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableName]);

  if (!activeConfig) {
    return <Navigate to="/admin/danh-muc/dm_trang_thai_giao_dich" replace />;
  }

  // Handle Add/Edit
  const handleSave = async (values) => {
    try {
      if (editingRecord) {
        // Update
        const { error } = await supabase
          .from(activeConfig.tableName)
          .update({ ...values, ngay_sua: new Date().toISOString() })
          .eq(activeConfig.primaryKey, editingRecord[activeConfig.primaryKey]);
        
        if (error) throw error;
        message.success('Cập nhật thành công');
      } else {
        // Insert
        const { error } = await supabase
          .from(activeConfig.tableName)
          .insert([{ ...values }]);
        
        if (error) throw error;
        message.success('Thêm mới thành công');
      }
      setIsModalVisible(false);
      form.resetFields();
      loadData();
    } catch (err) {
      console.error(err);
      message.error('Lỗi khi lưu dữ liệu');
    }
  };

  // Handle Delete
  const handleDelete = async (record) => {
    try {
      const { error } = await supabase
        .from(activeConfig.tableName)
        .delete()
        .eq(activeConfig.primaryKey, record[activeConfig.primaryKey]);
      
      if (error) throw error;
      message.success('Xóa thành công');
      loadData();
    } catch (err) {
      console.error(err);
      message.error('Lỗi khi xóa dữ liệu. Có thể do dữ liệu này đang được sử dụng ở bảng khác.');
    }
  };

  const openModal = (record = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // Build Antd Table Columns
  const tableColumns = activeConfig.columns.map(col => ({
    title: col.label,
    dataIndex: col.key,
    key: col.key,
    render: (text) => {
      if (!text) return <span className="text-gray-500">-</span>;
      if (col.key === 'icon') return <span className="text-xl">{text}</span>;
      if (col.key === 'logo') return <img src={text} alt="logo" className="h-8 object-contain bg-white rounded p-1" />;
      return <span className="text-gray-200">{text}</span>;
    }
  }));

  // Add Action column
  tableColumns.push({
    title: 'Thao tác',
    key: 'action',
    width: 120,
    render: (_, record) => (
      <div className="flex gap-2">
        <Button 
          type="text" 
          size="small" 
          icon={<EditOutlined />} 
          className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
          onClick={() => openModal(record)}
        />
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa?"
          onConfirm={() => handleDelete(record)}
          okText="Có, Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <Button 
            type="text" 
            size="small" 
            danger 
            icon={<DeleteOutlined />} 
            className="hover:bg-red-500/10"
          />
        </Popconfirm>
      </div>
    )
  });

  return (
    <div className="h-full flex gap-6">
      {/* Main Content (Table) */}
      <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col overflow-hidden relative">
        <div className="p-4 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white">{activeConfig.title}</h2>
            <p className="text-xs text-slate-400">Bảng: {activeConfig.tableName}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadData}
              className="bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
            >
              Làm mới
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => openModal()}
              className="bg-blue-600 border-none font-bold"
            >
              Thêm mới
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 custom-antd-table">
          <Table 
            dataSource={data} 
            columns={tableColumns} 
            rowKey={activeConfig.primaryKey}
            loading={loading}
            pagination={{ pageSize: 20 }}
            className="admin-table"
          />
        </div>
      </div>

      {/* Modal Add/Edit */}
      <Modal
        title={<span className="font-bold text-white">{editingRecord ? 'Cập nhật bản ghi' : 'Thêm bản ghi mới'}</span>}
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
        okText="Lưu lại"
        cancelText="Hủy bỏ"
        destroyOnClose
        className="dark-modal"
        okButtonProps={{ className: 'bg-blue-600 border-none font-bold' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          className="mt-4"
        >
          {activeConfig.columns.map(col => (
            <Form.Item
              key={col.key}
              name={col.key}
              label={<span className="text-slate-300">{col.label}</span>}
              rules={[{ required: col.required, message: `Vui lòng nhập ${col.label.toLowerCase()}` }]}
            >
              {col.type === 'number' ? (
                <Input type="number" className="bg-slate-900 border-slate-700 text-white" />
              ) : (
                <Input className="bg-slate-900 border-slate-700 text-white" placeholder={`Nhập ${col.label.toLowerCase()}...`} />
              )}
            </Form.Item>
          ))}
        </Form>
      </Modal>

      <style>{`
        /* CSS cho Table Antd trong Dark mode */
        .admin-table .ant-table { background: transparent !important; color: #cbd5e1; }
        .admin-table .ant-table-thead > tr > th { 
          background: #1e293b !important; 
          color: #f8fafc; 
          border-bottom: 1px solid #334155; 
        }
        .admin-table .ant-table-tbody > tr > td { 
          border-bottom: 1px solid #1e293b; 
        }
        .admin-table .ant-table-tbody > tr:hover > td { 
          background: #0f172a !important; 
        }
        .admin-table .ant-pagination { color: white; }
        .admin-table .ant-pagination-item a { color: #94a3b8; }
        .admin-table .ant-pagination-item-active { background: #2563eb; border-color: #2563eb; }
        .admin-table .ant-pagination-item-active a { color: white; }
        .admin-table .ant-empty-description { color: #64748b; }
        
        /* Modal Dark Mode */
        .dark-modal .ant-modal-content { background-color: #0f172a; border: 1px solid #334155; }
        .dark-modal .ant-modal-header { background-color: #0f172a; border-bottom: 1px solid #334155; padding-bottom: 16px;}
        .dark-modal .ant-modal-title { color: white; }
        .dark-modal .ant-modal-close { color: #94a3b8; }
        .dark-modal .ant-modal-footer { border-top: 1px solid #334155; padding-top: 16px;}
      `}</style>
    </div>
  );
}
