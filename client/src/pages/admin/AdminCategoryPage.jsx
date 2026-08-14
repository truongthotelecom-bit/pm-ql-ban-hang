import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Table, Button, Modal, Form, Input, Popconfirm, Select, Switch, Tabs, App as AntdApp } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, MenuOutlined, CheckSquareOutlined, DeleteFilled, EyeOutlined } from '@ant-design/icons';
import { supabase } from '../../lib/supabaseClient';
import useAppStore from '../../store/useAppStore';
import MoneyTransferForm from '../../components/MoneyTransferForm';
import { adminCategoriesConfig } from '../../config/adminConfig';

export default function AdminCategoryPage({ propTableName }) {
  const params = useParams();
  const tableName = propTableName || params.tableName;
  
  const user = useAppStore(state => state.user);
  const isStoreOwner = user?.dm_nhom_quyen?.ma_quyen === 'CHU_DIEM_BAN';

  const activeConfig = React.useMemo(() => {
    const baseConfig = adminCategoriesConfig.find(c => c.tableName === tableName);
    if (!baseConfig) return null;
    const cloned = { ...baseConfig };
    if (isStoreOwner && tableName === 'dm_bieu_phi') {
      cloned.columns = cloned.columns.filter(c => c.key !== 'id_diem_ban');
    }
    return cloned;
  }, [tableName, isStoreOwner]);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lookupData, setLookupData] = useState({});
  const [searchText, setSearchText] = useState('');
  
  // Row selection state
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const { message } = AntdApp.useApp();

  // Preview state inside Modal
  const [activeTab, setActiveTab] = useState('1');
  const [previewServiceId, setPreviewServiceId] = useState(null);
  const originalConfigRef = React.useRef(null);

  // FAB Dragging state
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [fabPos, setFabPos] = useState({ right: 24, bottom: 80 });
  const isDraggingRef = React.useRef(false);
  const fabRef = React.useRef(null);

  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return; // Chỉ cho phép chuột trái
    isDraggingRef.current = false;
    const startX = e.clientX || (e.touches && e.touches[0].clientX);
    const startY = e.clientY || (e.touches && e.touches[0].clientY);
    const startRight = fabPos.right;
    const startBottom = fabPos.bottom;

    const handleMove = (moveEvent) => {
      isDraggingRef.current = true;
      const mX = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0].clientX);
      const mY = moveEvent.clientY || (moveEvent.touches && moveEvent.touches[0].clientY);
      setFabPos({
        right: Math.max(0, startRight + startX - mX),
        bottom: Math.max(0, startBottom + startY - mY)
      });
    };

    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleUp);
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 50);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleUp);
  };

  
  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const formValues = Form.useWatch([], form);
  
  const currentTableRef = React.useRef(tableName);

  // Load data for active table
  const loadData = async (targetTableName = tableName) => {
    setLoading(true);
    try {
      const hasIndexCol = activeConfig?.columns?.some(c => c.key === 'index');
      let query = hasIndexCol
        ? supabase.from(targetTableName).select('*').order('index', { ascending: true, nullsFirst: false })
        : supabase.from(targetTableName).select('*').order('ngay_tao', { ascending: false });
      
      if (targetTableName === 'dm_bieu_phi' && isStoreOwner && user?.id_diem_ban) {
        query = query.or(`id_diem_ban.eq.${user.id_diem_ban},id_diem_ban.is.null`);
      }

      const { data: tableData, error } = await query;

      if (error) throw error;
      
      if (currentTableRef.current === targetTableName) {
        setData(tableData || []);
        // Đồng bộ dữ liệu mới nhất vào global store nếu đang ở bảng cấu hình cột
        if (targetTableName === 'sys_ql_cot_du_lieu') {
          useAppStore.setState({ columnsConfig: tableData || [] });
        }
      }

      // Fetch lookup data if table has lookup columns
      const lookupCols = activeConfig.columns.filter(c => c.type === 'lookup');
      if (lookupCols.length > 0) {
        const newLookupData = { ...lookupData };
        await Promise.all(lookupCols.map(async (col) => {
          if (!newLookupData[col.lookup.table]) {
            const selectFields = col.lookup.extraSelect 
              ? `${col.lookup.valueField}, ${col.lookup.labelField}, ${col.lookup.extraSelect}`
              : `${col.lookup.valueField}, ${col.lookup.labelField}`;
            const { data: lData } = await supabase.from(col.lookup.table).select(selectFields);
            if (lData && currentTableRef.current === targetTableName) {
              newLookupData[col.lookup.table] = lData;
            }
          }
        }));
        if (currentTableRef.current === targetTableName) {
          setLookupData(newLookupData);
        }
      }
    } catch (err) {
      console.error(err);
      if (currentTableRef.current === targetTableName) {
        message.error(`Lỗi tải dữ liệu bảng`);
      }
    } finally {
      if (currentTableRef.current === targetTableName) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    currentTableRef.current = tableName;
    if (activeConfig) {
      setData([]); // Xoá dữ liệu cũ ngay khi đổi tab để tránh render sai column
      loadData(tableName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableName]);

  if (!activeConfig) {
    return <Navigate to="/admin/danh-muc/dm_trang_thai_giao_dich" replace />;
  }

  // Handle Add/Edit
  const handleSave = async (values) => {
    try {
      const dataToSave = { ...values };
      activeConfig.columns.forEach(col => {
        if (col.isVirtual) {
          delete dataToSave[col.key];
        }
      });

      if (editingRecord) {
        // Update
        const { error } = await supabase
          .from(activeConfig.tableName)
          .update({ ...dataToSave, ngay_sua: new Date().toISOString() })
          .eq(activeConfig.primaryKey, editingRecord[activeConfig.primaryKey]);
        
        if (error) throw error;
        message.success('Cập nhật thành công');
      } else {
        // Insert
        const insertData = { ...dataToSave };
        if (activeConfig.tableName === 'dm_bieu_phi' && isStoreOwner && user?.id_diem_ban) {
          insertData.id_diem_ban = user.id_diem_ban;
        }

        const { error } = await supabase
          .from(activeConfig.tableName)
          .insert([insertData]);
        
        if (error) throw error;
        message.success('Thêm mới thành công');
        
        // Caching for inheritance (Remember last choice for lookup fields)
        try {
          const cacheKey = `admin_cache_${activeConfig.tableName}`;
          localStorage.setItem(cacheKey, JSON.stringify(dataToSave));
        } catch (e) {}
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

  const handleDeleteSelected = async () => {
    if (selectedRowKeys.length === 0) return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from(tableName)
        .delete()
        .in(activeConfig.primaryKey, selectedRowKeys);
      if (error) throw error;
      message.success(`Đã xóa ${selectedRowKeys.length} bản ghi`);
      setSelectedRowKeys([]); // Reset selection
      setIsFabOpen(false); // Đóng FAB
      loadData();
    } catch (error) {
      console.error('Error deleting multiple:', error);
      message.error(error.message || 'Có lỗi xảy ra khi xóa nhiều bản ghi');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (record = null) => {
    setEditingRecord(record);
    setActiveTab('1'); // Reset tab to Form
    if (record) {
      form.setFieldsValue(record);
      if (activeConfig.tableName === 'sys_ql_cot_du_lieu' && record.id_loai_dich_vu) {
        setPreviewServiceId(record.id_loai_dich_vu);
        useAppStore.setState({ selectedServiceFile: { id_loai_dich_vu: record.id_loai_dich_vu, id_ma_hop_dong: 'preview-mode' } });
      }
    } else {
      form.resetFields();
      
      // Khôi phục giá trị kế thừa từ LocalStorage
      try {
        const cacheKey = `admin_cache_${activeConfig.tableName}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          const inheritedData = {};
          // Chỉ kế thừa các trường dạng select (lookup)
          activeConfig.columns.forEach(col => {
            if (col.type === 'lookup' && parsed[col.key] !== undefined) {
              inheritedData[col.key] = parsed[col.key];
            }
          });
          form.setFieldsValue(inheritedData);
        }
      } catch (e) {}

      if (activeConfig.tableName === 'sys_ql_cot_du_lieu') {
        const currentSelectedService = form.getFieldValue('id_loai_dich_vu');
        if (currentSelectedService) {
          setPreviewServiceId(currentSelectedService);
          useAppStore.setState({ selectedServiceFile: { id_loai_dich_vu: currentSelectedService, id_ma_hop_dong: 'preview-mode' } });
        } else {
          setPreviewServiceId(null);
        }
      }
    }
    setIsModalVisible(true);
  };

  // Build Antd Table Columns
  const tableColumns = activeConfig.columns.filter(col => !col.isVirtual).map(col => {
    // Tự động tạo bộ lọc từ dữ liệu hiện có
    const uniqueVals = [...new Set(data.map(item => item[col.key]).filter(v => v !== null && v !== undefined))];
    const filters = uniqueVals.map(val => {
      let label = val;
      if (col.type === 'boolean') {
        label = val ? 'Bật' : 'Tắt';
      } else if (col.type === 'select') {
        const option = col.options?.find(o => o.value === val);
        label = option ? option.label : val;
      } else if (col.type === 'lookup') {
        const tableLookups = lookupData[col.lookup.table] || [];
        const item = tableLookups.find(l => l[col.lookup.valueField] === val);
        label = item ? (col.lookup.formatLabel ? col.lookup.formatLabel(item) : item[col.lookup.labelField]) : val;
      }
      return { text: label, value: val };
    });

    return {
      title: col.label,
      dataIndex: col.key,
      key: col.key,
      filters: filters.length > 0 ? filters : undefined,
      filterSearch: true, // Kích hoạt thanh tìm kiếm bên trong dropdown lọc (chuẩn Excel)
      onFilter: (value, record) => record[col.key] === value,
      render: (text) => {
        if (text === null || text === undefined || text === '') return <span className="text-gray-500">-</span>;
        if (col.key === 'icon') return <span className="text-xl">{text}</span>;
        if (col.key === 'logo') return <img src={text} alt="logo" className="h-8 object-contain bg-white rounded p-1" />;
        if (col.type === 'boolean') {
          return <span className={text ? "text-green-400" : "text-gray-500"}>{text ? 'Bật' : 'Tắt'}</span>;
        }
        if (col.type === 'select') {
          const option = col.options?.find(o => o.value === text);
          return <span className="text-gray-200">{option ? option.label : text}</span>;
        }
        if (col.type === 'lookup') {
          const tableLookups = lookupData[col.lookup.table] || [];
          const item = tableLookups.find(l => l[col.lookup.valueField] === text);
          return <span className="text-gray-200">{item ? (col.lookup.formatLabel ? col.lookup.formatLabel(item) : item[col.lookup.labelField]) : text}</span>;
        }
        return <span className="text-gray-200">{text}</span>;
      }
    };
  });

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

  const filteredData = React.useMemo(() => {
    if (!searchText) return data;
    const lowerSearch = searchText.toLowerCase();
    return data.filter(item => {
      return activeConfig.columns.some(col => {
        let val = item[col.key];
        
        // Resolve lookup labels for searching
        if (col.type === 'lookup' && lookupData[col.lookup.table]) {
          const l = lookupData[col.lookup.table].find(x => x[col.lookup.valueField] === val);
          val = l ? (col.lookup.formatLabel ? col.lookup.formatLabel(l) : l[col.lookup.labelField]) : val;
        } else if (col.type === 'select') {
          const option = col.options?.find(o => o.value === val);
          val = option ? option.label : val;
        } else if (col.type === 'boolean') {
          val = val ? 'Bật' : 'Tắt';
        }
        
        return String(val || '').toLowerCase().includes(lowerSearch);
      });
    });
  }, [data, searchText, activeConfig, lookupData]);

  const renderFormItem = (col) => {
    let options = [];
    if (col.type === 'lookup') {
      let rawOptions = lookupData[col.lookup.table] || [];
      if (col.dependsOn && formValues && formValues[col.dependsOn]) {
        const filterVal = formValues[col.dependsOn];
        rawOptions = rawOptions.filter(opt => opt[col.filterField] === filterVal);
      }
      options = rawOptions.map(l => ({
        value: l[col.lookup.valueField],
        label: col.lookup.formatLabel ? col.lookup.formatLabel(l) : l[col.lookup.labelField]
      }));
    }

    const isBoolean = col.type === 'boolean';

    // Logic gợi ý cho noi_dung_hien_thi trong bảng sys_ql_cot_du_lieu
    let suggestionNode = null;
    if (activeConfig.tableName === 'sys_ql_cot_du_lieu' && col.key === 'noi_dung_hien_thi' && formValues?.id_ten_cot) {
      const defaultCols = lookupData['sys_danh_sach_cot'] || [];
      const selectedCol = defaultCols.find(c => c.id_cot === formValues.id_ten_cot);
      if (selectedCol) {
        suggestionNode = (
          <div className="text-xs mt-1 text-slate-400">
            Gợi ý (Bấm để điền): <span 
              className="text-blue-400 font-bold cursor-pointer hover:underline bg-blue-500/10 px-2 py-0.5 rounded ml-1"
              onClick={() => form.setFieldsValue({ noi_dung_hien_thi: selectedCol.ten_cot })}
            >{selectedCol.ten_cot}</span>
          </div>
        );
      }
    }

    return (
      <Form.Item
        key={col.key}
        name={col.key}
        label={<span className="text-slate-300">{col.label}</span>}
        valuePropName={isBoolean ? 'checked' : 'value'}
        rules={[{ required: col.required && !col.isVirtual && !isBoolean, message: `Vui lòng nhập ${col.label.toLowerCase()}` }]}
        extra={suggestionNode}
      >
        {col.type === 'number' ? (
          <Input type="number" step="any" className="bg-slate-900 border-slate-700 text-white" />
        ) : col.type === 'boolean' ? (
          <Switch />
        ) : col.type === 'select' ? (
          <Select 
            className="w-full admin-select" 
            placeholder={`Chọn ${col.label.toLowerCase()}...`}
            allowClear
            options={col.options}
            rootClassName="dark-select-dropdown"
          />
        ) : col.type === 'lookup' ? (
          <Select 
            className="w-full admin-select" 
            placeholder={`Chọn ${col.label.toLowerCase()}...`}
            allowClear
            options={options}
            rootClassName="dark-select-dropdown"
            onChange={(val) => {
              // Nếu thay đổi trường filter, reset trường phụ thuộc
              const dependentCol = activeConfig.columns.find(c => c.dependsOn === col.key);
              if (dependentCol) {
                form.setFieldsValue({ [dependentCol.key]: undefined });
              }
            }}
          />
        ) : (
          <Input className="bg-slate-900 border-slate-700 text-white" placeholder={`Nhập ${col.label.toLowerCase()}...`} />
        )}
      </Form.Item>
    );
  };

  return (
    <div className="h-full flex gap-6">
      {/* Main Content (Table) */}
      <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col overflow-hidden relative">
        <div className="p-4 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white">{activeConfig.title}</h2>
            <p className="text-xs text-slate-400">Bảng: {activeConfig.tableName}</p>
          </div>
          <div className="flex gap-4 items-center">
            <Input.Search
              placeholder="Tìm kiếm..."
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              className="w-64 custom-admin-search"
            />
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
            rowSelection={{
              selectedRowKeys,
              onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys)
            }}
            dataSource={filteredData} 
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
        onOk={() => {
          if (activeTab === '1' || activeConfig.tableName !== 'sys_ql_cot_du_lieu') {
            form.submit();
          } else {
            setActiveTab('1');
          }
        }}
        onCancel={() => {
          setIsModalVisible(false);
          // Restore original config from table data
          if (activeConfig.tableName === 'sys_ql_cot_du_lieu') {
            useAppStore.setState({ columnsConfig: data });
          }
        }}
        okText={activeTab === '1' || activeConfig.tableName !== 'sys_ql_cot_du_lieu' ? "Lưu lại" : "Quay lại Form"}
        cancelText="Hủy bỏ"
        destroyOnHidden
        width={activeTab === '2' ? 800 : 520}
        className="dark-modal transition-all duration-300"
        okButtonProps={{ className: 'bg-blue-600 border-none font-bold' }}
      >
        {activeConfig.tableName === 'sys_ql_cot_du_lieu' ? (
          <Tabs
            activeKey={activeTab}
            onChange={(key) => {
              setActiveTab(key);
              if (key === '2') {
                const currentServiceId = form.getFieldValue('id_loai_dich_vu');
                if (currentServiceId) {
                  setPreviewServiceId(currentServiceId);
                  useAppStore.setState({ selectedServiceFile: { id_loai_dich_vu: currentServiceId, id_ma_hop_dong: 'preview-mode' } });
                  
                  // LIVE INJECT UNSAVED CHANGES
                  const fieldName = form.getFieldValue('id_ten_cot');
                  if (fieldName) {
                    const originalCfg = [...data]; // Lấy config mới nhất từ bảng thay vì từ store cũ
                    // Remove existing config for this field
                    const filteredCfg = originalCfg.filter(c => !(c.id_ten_bang === 'chi_tiet_giao_dich' && c.id_loai_dich_vu === currentServiceId && c.id_ten_cot === fieldName));
                    // Push the unsaved live config
                    filteredCfg.push({
                      id_ten_bang: 'chi_tiet_giao_dich',
                      id_loai_dich_vu: currentServiceId,
                      id_ten_cot: fieldName,
                      noi_dung_hien_thi: form.getFieldValue('noi_dung_hien_thi'),
                      is_an_cot: form.getFieldValue('is_an_cot')
                    });
                    useAppStore.setState({ columnsConfig: filteredCfg });
                  }
                }
              } else {
                // Restore original config when going back to tab 1
                if (activeConfig.tableName === 'sys_ql_cot_du_lieu') {
                  useAppStore.setState({ columnsConfig: data });
                }
              }
            }}
            items={[
              {
                key: '1',
                label: 'Cấu hình bản ghi',
                children: (
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    className="mt-4"
                  >
                    {activeConfig.columns.map(col => renderFormItem(col))}
                  </Form>
                )
              },
              {
                key: '2',
                label: <span className="text-purple-400 font-bold"><EyeOutlined /> Live Preview</span>,
                children: (
                  <div className="mt-2 min-h-[400px]">
                    {previewServiceId ? (
                      <>
                        <div className="mb-2">
                          <span className="text-slate-400 text-xs mr-2">Dịch vụ đang xem trước:</span>
                          <span className="text-blue-400 font-bold px-3 py-1 bg-blue-500/10 rounded-full text-xs border border-blue-500/20">
                            {lookupData['sys_loai_dich_vu']?.find(s => s.id_loai_dich_vu === previewServiceId)?.ten_loai_dich_vu || 'Không xác định'}
                          </span>
                        </div>
                        <div className="p-6 bg-slate-900 border border-slate-700 rounded-xl mt-4 relative">
                          <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] px-2 py-1 rounded-bl-lg rounded-tr-xl font-bold uppercase tracking-wider">
                            Live Demo
                          </div>
                          <MoneyTransferForm value={{}} onChange={() => {}} />
                        </div>
                      </>
                    ) : (
                      <div className="p-10 text-center text-slate-500 border border-dashed border-slate-700 rounded-xl mt-4">
                        Vui lòng chọn <b>Loại Dịch Vụ</b> ở tab Cấu Hình để xem trước giao diện.
                      </div>
                    )}
                  </div>
                )
              }
            ]}
          />
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            className="mt-4"
          >
            {activeConfig.columns.map(col => renderFormItem(col))}
          </Form>
        )}
      </Modal>

      {/* DRAGGABLE FAB MENU */}
      <div 
        ref={fabRef}
        style={{ right: `${fabPos.right}px`, bottom: `${fabPos.bottom}px` }}
        className="fixed z-40 flex flex-col items-end gap-3 touch-none"
      >
        {isFabOpen && (
          <div className="flex flex-col items-end gap-3 mb-2 animate-in slide-in-from-bottom-5 fade-in duration-200">
            
            {/* Nút Xóa Hàng Loạt (chỉ hiện khi có chọn hàng) */}
            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title={`Xóa ${selectedRowKeys.length} bản ghi?`}
                description="Hành động này không thể hoàn tác!"
                onConfirm={handleDeleteSelected}
                okText="Xóa ngay"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <button className="flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded-full shadow-lg transition-transform active:scale-95 font-bold text-sm">
                  <span className="drop-shadow-md">Xóa {selectedRowKeys.length} mục đã chọn</span>
                  <DeleteFilled size={20} />
                </button>
              </Popconfirm>
            )}

            {/* Nút Thêm Mới */}
            <button 
              onClick={() => { openModal(); setIsFabOpen(false); }}
              className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-full shadow-lg transition-transform active:scale-95 font-bold text-sm"
            >
              <span className="drop-shadow-md">Thêm mới nhanh</span>
              <PlusOutlined size={20} />
            </button>
            
            {/* Nút Bỏ chọn tất cả */}
            {selectedRowKeys.length > 0 && (
              <button 
                onClick={() => setSelectedRowKeys([])}
                className="flex items-center gap-3 bg-slate-600 hover:bg-slate-500 text-white px-4 py-3 rounded-full shadow-lg transition-transform active:scale-95 font-bold text-sm"
              >
                <span className="drop-shadow-md">Bỏ chọn tất cả</span>
                <CheckSquareOutlined size={20} />
              </button>
            )}

          </div>
        )}

        {/* FAB Toggle Button */}
        <button 
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          onClick={(e) => {
            if (isDraggingRef.current) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            setIsFabOpen(!isFabOpen);
          }}
          title="Kéo thả để di chuyển | Click để mở Menu"
          className={`w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 active:scale-90 border-2 cursor-move ${
            isFabOpen ? 'bg-slate-700 border-slate-600' : 'bg-blue-600 border-blue-500 hover:scale-105'
          } ${selectedRowKeys.length > 0 && !isFabOpen ? 'animate-pulse bg-red-600 border-red-500' : ''}`}
        >
          <MenuOutlined className={isFabOpen ? 'text-blue-400 text-xl' : 'text-white text-xl'} />
          {!isFabOpen && (
            <span className="text-[9px] font-black mt-0.5 whitespace-nowrap overflow-visible text-white">
              {selectedRowKeys.length > 0 ? `ĐÃ CHỌN ${selectedRowKeys.length}` : 'MENU'}
            </span>
          )}
        </button>
      </div>

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
        
        /* Select Dark Mode */
        .admin-select .ant-select-selector { background-color: #0f172a !important; border-color: #334155 !important; color: white !important; }
        .admin-select .ant-select-arrow { color: #94a3b8; }
        .admin-select .ant-select-clear { background-color: transparent; color: #94a3b8; }
        .dark-select-dropdown { background-color: #1e293b; border: 1px solid #334155; }
        .dark-select-dropdown .ant-select-item { color: #cbd5e1; }
        .dark-select-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled) { background-color: #334155; color: white; }
        .dark-select-dropdown .ant-select-item-option-selected:not(.ant-select-item-option-disabled) { background-color: #2563eb; color: white; }
      `}</style>
    </div>
  );
}
