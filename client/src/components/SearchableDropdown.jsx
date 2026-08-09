import React from 'react';
import { Select, Button, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export default function SearchableDropdown({
  options = [],
  value,
  onChange,
  placeholder,
  labelKey,
  valueKey,
  subLabelKey,
  onAddNew,
  addNewText = '+ Tạo mới',
  disabled = false,
  className = '',
  ...rest
}) {
  return (
    <Select
      {...rest}
      className={className}
      showSearch
      disabled={disabled}
      value={value}
      placeholder={placeholder}
      optionFilterProp="children"
      onChange={onChange}
      dropdownRender={(menu) => (
        <>
          {onAddNew && (
            <>
              <Button
                type="text"
                block
                icon={<PlusOutlined />}
                onClick={onAddNew}
                className="text-violet-500 font-bold hover:bg-violet-600/10 text-left px-3 py-1 mt-1"
                style={{ justifyContent: 'flex-start' }}
              >
                {addNewText}
              </Button>
              <Divider style={{ margin: '4px 0' }} />
            </>
          )}
          {menu}
        </>
      )}
    >
      {options.map((opt) => (
        <Select.Option key={opt[valueKey]} value={opt[valueKey]}>
          {opt[labelKey]} {subLabelKey && opt[subLabelKey] ? `(${opt[subLabelKey]})` : ''}
        </Select.Option>
      ))}
    </Select>
  );
}
