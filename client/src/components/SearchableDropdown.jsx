import React, { useState, useMemo } from 'react';
import { Select, Button, Divider, Modal, Input } from 'antd';
import { PlusOutlined, SearchOutlined, DownOutlined } from '@ant-design/icons';

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
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1280;

  // Lọc option theo search text trên mobile
  const filteredOptions = useMemo(() => {
    if (!searchText) return options;
    const lowerSearch = searchText.toLowerCase();
    return options.filter(opt => {
      const mainText = opt[labelKey] ? String(opt[labelKey]).toLowerCase() : '';
      const subText = subLabelKey && opt[subLabelKey] ? String(opt[subLabelKey]).toLowerCase() : '';
      return mainText.includes(lowerSearch) || subText.includes(lowerSearch);
    });
  }, [options, searchText, labelKey, subLabelKey]);

  // Tim label dang duoc chon de hien thi tren nut (mobile)
  const selectedOption = options.find(opt => opt[valueKey] === value);
  const displayLabel = selectedOption 
    ? `${selectedOption[labelKey]} ${subLabelKey && selectedOption[subLabelKey] ? `(${selectedOption[subLabelKey]})` : ''}`
    : '';

  if (isMobile) {
    return (
      <>
        {/* Hộp text box giả lập Select */}
        <div 
          onClick={() => !disabled && setMobileModalOpen(true)}
          className={`flex items-center justify-between w-full px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg cursor-pointer transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-violet-500/50 hover:bg-white/10'} ${className}`}
          style={{ minHeight: '34px' }}
        >
          <span className={displayLabel ? 'text-gray-200 text-sm truncate' : 'text-gray-400 text-sm truncate'}>
            {displayLabel || placeholder || 'Chọn...'}
          </span>
          <DownOutlined className="text-gray-500 text-[10px]" />
        </div>

        {/* Modal Fullscreen Tìm Kiếm */}
        <Modal
          title={<span className="font-extrabold text-white text-base tracking-wide">🔍 {placeholder || 'TÌM KIẾM'}</span>}
          open={mobileModalOpen}
          onCancel={() => {
            setMobileModalOpen(false);
            setSearchText('');
          }}
          footer={null}
          className="glass-modal"
          style={{ top: 10 }}
          styles={{ body: { padding: 0 } }}
        >
          {/* Thanh tìm kiếm cố định */}
          <div className="p-3 border-b border-white/5 bg-[#0d1426]/95 backdrop-blur-md sticky top-0 z-10 rounded-t-xl">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Gõ để tìm kiếm nhanh..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="bg-white/5 border-white/10 text-white rounded-xl py-2 shadow-inner"
              allowClear
              autoFocus
            />
          </div>

          {/* Danh sách cuộn */}
          <div className="max-h-[65vh] overflow-y-auto overscroll-contain p-2 space-y-1.5 bg-[#0d1426]/50">
            {onAddNew && (
              <Button
                type="text"
                block
                icon={<PlusOutlined />}
                onClick={() => {
                  setMobileModalOpen(false);
                  onAddNew();
                }}
                className="text-violet-400 font-extrabold hover:text-violet-300 text-left px-4 py-3 h-auto rounded-xl flex items-center mb-2 bg-violet-600/10 border border-violet-500/30 transition-all active:scale-95"
                style={{ justifyContent: 'flex-start' }}
              >
                {addNewText}
              </Button>
            )}

            {filteredOptions.length === 0 ? (
              <div className="text-center p-8 text-gray-500 text-xs border border-dashed border-white/5 mx-2 rounded-xl mt-2">
                Không tìm thấy kết quả phù hợp.
              </div>
            ) : (
              filteredOptions.map(opt => {
                const isSelected = opt[valueKey] === value;
                return (
                  <div
                    key={opt[valueKey]}
                    onClick={() => {
                      onChange(opt[valueKey]);
                      setMobileModalOpen(false);
                      setSearchText('');
                    }}
                    className={`p-3 px-4 rounded-xl cursor-pointer transition-all active:scale-[0.98] ${isSelected ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20 border border-violet-400/50' : 'bg-white/5 border border-white/5 text-gray-300 hover:bg-white/10'}`}
                  >
                    <div className={`text-sm truncate ${isSelected ? 'font-black' : 'font-semibold'}`}>
                      {opt[labelKey]}
                    </div>
                    {subLabelKey && opt[subLabelKey] && (
                      <div className={`text-[11px] mt-0.5 truncate font-medium ${isSelected ? 'text-violet-200' : 'text-gray-500'}`}>
                        {opt[subLabelKey]}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Modal>
      </>
    );
  }

  // Desktop Component (Original)
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
