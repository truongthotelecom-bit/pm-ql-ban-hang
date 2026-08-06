import React from 'react';
import { Input, InputNumber, Select, Switch } from 'antd';

const { Option } = Select;

export default function DynamicForm({ config, value = {}, onChange, categories = [], customers = [], contracts = [] }) {
  // Sắp xếp các cột hiển thị
  const visibleCols = config.filter(c => !c.is_an_cot);

  const handleFieldChange = (field, val) => {
    if (onChange) {
      onChange({ ...value, [field]: val });
    }
  };

  return (
    <div className="space-y-4">
      {visibleCols.map(col => {
        const fieldName = col.id_ten_cot;
        const fieldVal = value[fieldName] || '';
        const fieldType = col.ghi_chu || 'text'; // 'money', 'number', 'select', 'required' (text)

        return (
          <div key={col.id_ql_cot_du_lieu} className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400">
              {col.noi_dung_hien_thi} {fieldType.includes('required') && <span className="text-red-500">*</span>}
            </label>

            {/* CUSTOMER SELECTOR */}
            {fieldName === 'id_khach_hang' && (
              <Select
                showSearch
                placeholder="Chọn khách hàng..."
                optionFilterProp="children"
                value={fieldVal || undefined}
                onChange={(v) => handleFieldChange(fieldName, v)}
                className="w-full"
              >
                {customers.map(c => (
                  <Option key={c.id_khach_hang} value={c.id_khach_hang}>
                    {c.ho_va_ten} ({c.so_dien_thoai})
                  </Option>
                ))}
              </Select>
            )}

            {/* CONTRACT SELECTOR */}
            {fieldName === 'id_ma_hop_dong' && (
              <Select
                placeholder="Chọn mã hợp đồng..."
                value={fieldVal || undefined}
                onChange={(v) => handleFieldChange(fieldName, v)}
                className="w-full"
              >
                {contracts.map(c => (
                  <Option key={c.id_ma_hop_dong} value={c.id_ma_hop_dong}>
                    {c.ma_hop_dong} - {c.chu_hop_dong}
                  </Option>
                ))}
              </Select>
            )}

            {/* TRANSACTION STATUS */}
            {fieldName === 'id_trang_thai' && (
              <Select
                value={fieldVal || undefined}
                onChange={(v) => handleFieldChange(fieldName, v)}
                className="w-full"
              >
                {categories.filter(cat => cat.id_phan_loai === 'pl-1').map(s => (
                  <Option key={s.id_danh_muc} value={s.id_danh_muc}>
                    {s.ten_danh_muc}
                  </Option>
                ))}
              </Select>
            )}

            {/* STANDARD MONEY INPUT */}
            {fieldType.includes('money') && fieldName !== 'id_khach_hang' && fieldName !== 'id_ma_hop_dong' && fieldName !== 'id_trang_thai' && (
              <InputNumber
                value={fieldVal || 0}
                formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={v => v.replace(/\$\s?|(,*)/g, '')}
                onChange={(v) => handleFieldChange(fieldName, v)}
                className="w-full"
                placeholder="Nhập số tiền..."
              />
            )}

            {/* STANDARD NUMBER INPUT */}
            {fieldType.includes('number') && fieldName !== 'id_khach_hang' && fieldName !== 'id_ma_hop_dong' && fieldName !== 'id_trang_thai' && (
              <InputNumber
                value={fieldVal || 0}
                min={0}
                max={100}
                onChange={(v) => handleFieldChange(fieldName, v)}
                className="w-full"
                placeholder="0"
              />
            )}

            {/* STANDARD TEXT INPUT */}
            {!fieldType.includes('money') && !fieldType.includes('number') && fieldName !== 'id_khach_hang' && fieldName !== 'id_ma_hop_dong' && fieldName !== 'id_trang_thai' && (
              <Input
                value={fieldVal}
                onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                placeholder={`Nhập ${col.noi_dung_hien_thi.toLowerCase()}...`}
                className="w-full"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
