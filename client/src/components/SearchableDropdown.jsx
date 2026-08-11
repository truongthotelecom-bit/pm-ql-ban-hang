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
  iconKey,
  onAddNew,
  addNewText = '+ Tạo mới',
  disabled = false,
  className = '',
  ...rest
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

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

  return (
    <>
      {/* Hộp text box giả lập Select */}
      <div 
        onClick={() => !disabled && setModalOpen(true)}
        className={`flex items-center justify-between w-full px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg cursor-pointer transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-violet-500/50 hover:bg-white/10'} ${className}`}
        style={{ minHeight: '34px' }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedOption && iconKey && (
            <div className="w-5 h-5 rounded-[4px] bg-violet-500/20 text-violet-300 flex items-center justify-center overflow-hidden shrink-0 border border-violet-500/30">
              {selectedOption[iconKey] ? (
                <img src={selectedOption[iconKey]} className="w-full h-full object-contain bg-white/10 p-[1px]" />
              ) : (
                <span className="text-[10px] font-bold">
                  {selectedOption[labelKey] ? String(selectedOption[labelKey]).charAt(0).toUpperCase() : '?'}
                </span>
              )}
            </div>
          )}
          <span className={displayLabel ? 'text-gray-200 text-sm truncate' : 'text-gray-400 text-sm truncate'}>
            {displayLabel || placeholder || 'Chọn...'}
          </span>
        </div>
        <DownOutlined className="text-gray-500 text-[10px] ml-2 shrink-0" />
      </div>

      {/* Modal Tìm Kiếm */}
      <Modal
        title={<span className="font-extrabold text-white text-base tracking-wide">🔍 {placeholder || 'TÌM KIẾM'}</span>}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
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
          <div className="max-h-[65vh] overflow-y-auto scrollbar-thin overscroll-contain p-2 space-y-1.5 bg-[#0d1426]/50">
            {onAddNew && (
              <Button
                type="text"
                block
                icon={<PlusOutlined />}
                onClick={() => {
                  setModalOpen(false);
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
              filteredOptions.map((opt, index) => {
                const isSelected = opt[valueKey] === value;
                return (
                  <div
                    key={`${opt[valueKey]}-${index}`}
                    onClick={() => {
                      onChange(opt[valueKey]);
                      setModalOpen(false);
                      setSearchText('');
                    }}
                    className={`p-3 px-4 rounded-xl cursor-pointer transition-all active:scale-[0.98] ${isSelected ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20 border border-violet-400/50' : 'bg-white/5 border border-white/5 text-gray-300 hover:bg-white/10'}`}
                  >
                    <div className="flex gap-3 items-center">
                      {iconKey && (
                        <div className="w-8 h-8 rounded bg-violet-500/20 text-violet-300 flex items-center justify-center overflow-hidden shrink-0 border border-violet-500/30">
                          {opt[iconKey] ? (
                            <img src={opt[iconKey]} className="w-full h-full object-contain bg-white/10 p-1" />
                          ) : (
                            <span className="text-sm font-bold">
                              {opt[labelKey] ? String(opt[labelKey]).charAt(0).toUpperCase() : '?'}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm truncate ${isSelected ? 'font-black' : 'font-semibold'}`}>
                          {opt[labelKey]}
                        </div>
                        {subLabelKey && opt[subLabelKey] && (
                          <div className={`text-[11px] mt-0.5 truncate font-medium ${isSelected ? 'text-violet-200' : 'text-gray-500'}`}>
                            {opt[subLabelKey]}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Modal>
    </>
  );
}
