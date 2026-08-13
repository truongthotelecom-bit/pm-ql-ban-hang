import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import useAuthStore from '../store/useAuthStore';
import { supabase } from '../lib/supabaseClient';
import { Button, Tag, App as AntdApp, Modal, Input, Select, Radio, Badge, Pagination, Checkbox, Dropdown, Popover } from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  ReloadOutlined, 
  InfoCircleOutlined,
  FilterOutlined,
  EditOutlined, 
  ShoppingCartOutlined, 
  HistoryOutlined, 
  CopyOutlined, 
  QrcodeOutlined, 
  PrinterOutlined, 
  SyncOutlined, 
  UserOutlined, 
  KeyOutlined, 
  CheckCircleOutlined, 
  PhoneOutlined,
  EllipsisOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import TransactionDrawer from '../components/TransactionDrawer';
import MoneyTransferForm from '../components/MoneyTransferForm';
import SearchableDropdown from '../components/SearchableDropdown';
import { adminCategoriesConfig } from '../config/adminConfig';

const MemoizedFileCard = React.memo(({ file, cust, hd, bank, isSelected, loaiHopDongText, iconFallback, onSelectMobile, onSelectDesktop, onAddTx, onEditFile, onViewFile, onCopyFile, onDeleteFile }) => {
  const lastDateObj = file._lastTxDate || (file.ngay_tao ? new Date(file.ngay_tao) : new Date());
  const diffDays = (new Date().getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24);
  let dotColorClass = "bg-red-500 shadow-red-500/50";
  if (diffDays <= 7) dotColorClass = "bg-blue-500 shadow-blue-500/50";
  else if (diffDays <= 60) dotColorClass = "bg-green-500 shadow-green-500/50";
  else if (diffDays <= 180) dotColorClass = "bg-orange-500 shadow-orange-500/50";
  
  return (
    <div 
        onClick={() => {
          if (window.innerWidth < 1280) {
            onSelectMobile(file);
          } else {
            onSelectDesktop(file);
          }
        }}
        className={`px-3 py-3 rounded-xl border transition-all cursor-pointer overflow-hidden ${isSelected ? 'bg-[#0d1426] border-violet-500/80 shadow-[0_0_15px_rgba(139,92,246,0.15)]' : 'bg-[#131c33]/40 border-white/5 hover:border-white/10 hover:bg-[#131c33]/60'}`}
      >
        {/* Dòng trên cùng: Ngày GD cuối (trái) & Ngày tạo (phải) */}
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5 text-[10px] font-medium">
          <span className="text-indigo-400 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${dotColorClass}`}></span>
            {file._lastTxDate 
              ? `${file._lastTxDate.toLocaleDateString('vi-VN')} ${file._lastTxDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
              : `${file.ngay_tao ? new Date(file.ngay_tao).toLocaleDateString('vi-VN') : '—'}`}
          </span>
          <span className="text-gray-500">
            Ngày tạo: {file.ngay_tao ? new Date(file.ngay_tao).toLocaleDateString('vi-VN') : '—'}
          </span>
        </div>

        {/* Dòng giữa: Logo + Thông tin Hợp Đồng & Khách hàng */}
        <div className={`flex ${isSelected ? 'flex-col gap-2' : 'justify-between items-center gap-2'} mb-1`}>
          {/* Trái (Contract Info) */}
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Logo dịch vụ */}
            <div className={`flex-shrink-0 bg-white rounded-xl flex items-center justify-center overflow-hidden ${isSelected ? 'w-14 h-14 p-1.5' : 'w-10 h-10 p-1'}`}>
              {bank?.logo ? (
                <img src={bank.logo} alt={bank?.ten_viet_tat} className="w-full h-full object-contain" />
              ) : (
                <span className="text-xl text-violet-600 font-bold">{iconFallback}</span>
              )}
            </div>

            {/* Thông tin HĐ */}
            <div className="flex flex-col min-w-0 justify-center">
              {isSelected && (
                <span className="text-violet-400 font-bold text-[10px] tracking-wider uppercase mb-0.5">
                  {bank?.ten_viet_tat || 'DỊCH VỤ'}
                </span>
              )}
              <span className={`text-red-500 font-black tracking-wider uppercase truncate leading-none ${isSelected ? 'text-xl mb-1' : 'text-sm mb-0.5'}`}>
                {hd?.ma_hop_dong || 'CHƯA CÓ HỢP ĐỒNG'}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-gray-200 font-medium truncate ${isSelected ? 'text-sm' : 'text-xs'}`}>
                  {hd?.chu_hop_dong || '—'}
                </span>
                {isSelected && (
                  <span className="px-2 py-0.5 rounded-full bg-[#0d1426] text-green-500 font-bold text-[8px] uppercase shadow-inner border border-green-500/20 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-green-500"></span>
                    {loaiHopDongText}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Phải (Customer Info) */}
          <div className={`flex flex-shrink-0 ${isSelected ? 'items-center justify-between border-t border-white/5 pt-3 mt-1' : 'flex-col items-end justify-center'}`}>
            <div className={`flex ${isSelected ? 'items-center gap-3' : 'flex-col items-end gap-1'}`}>
              <div className="flex items-center gap-1.5 text-gray-300">
                {isSelected && <UserOutlined className="text-violet-400" />}
                <span className={`font-bold uppercase truncate max-w-[120px] ${isSelected ? 'text-[11px]' : 'text-[10px]'}`}>{cust?.ho_va_ten || 'Khách lẻ'}</span>
              </div>
              {isSelected && <div className="w-[1px] h-3 bg-white/10"></div>}
              <div className="flex items-center gap-1.5 text-violet-400/90">
                {isSelected && <PhoneOutlined />}
                <span className={`font-medium ${isSelected ? 'text-[11px]' : 'text-[9px]'}`}>{cust?.so_dien_thoai || '—'}</span>
              </div>
            </div>
            {/* Tùy chọn tag cho desktop selected */}
            {isSelected && <div className="opacity-0 w-16 h-4 bg-green-500/20 blur-sm"></div>}
          </div>
        </div>

        {file.noi_dung && (
          <div className="mt-2 mb-1 flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400/80 font-medium italic truncate">
              📝 {file.noi_dung}
            </span>
          </div>
        )}

        {/* ACTION BAR (Chỉ hiện khi Card đang được chọn) */}
        {isSelected && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-1.5 animate-in fade-in slide-in-from-top-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onViewFile(); }}
              className="flex-1 flex flex-col items-center justify-center gap-1 text-blue-400 bg-blue-900/30 border border-blue-500/30 rounded-xl py-1.5 hover:bg-blue-500/30 hover:border-blue-500/60 transition-all shadow-inner shadow-blue-500/10"
            >
              <InfoCircleOutlined className="text-base" />
              <span className="text-[9px] font-extrabold uppercase tracking-wider">Xem</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onEditFile(); }}
              className="flex-1 flex flex-col items-center justify-center gap-1 text-violet-400 bg-violet-900/30 border border-violet-500/30 rounded-xl py-1.5 hover:bg-violet-500/30 hover:border-violet-500/60 transition-all shadow-inner shadow-violet-500/10"
            >
              <EditOutlined className="text-base" />
              <span className="text-[9px] font-extrabold uppercase tracking-wider">Sửa</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onCopyFile(); }}
              className="flex-1 flex flex-col items-center justify-center gap-1 text-cyan-400 bg-cyan-900/30 border border-cyan-500/30 rounded-xl py-1.5 hover:bg-cyan-500/30 hover:border-cyan-500/60 transition-all shadow-inner shadow-cyan-500/10"
            >
              <CopyOutlined className="text-base" />
              <span className="text-[9px] font-extrabold uppercase tracking-wider">Copy</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onAddTx(); }}
              className="flex-1 flex flex-col items-center justify-center gap-1 text-green-400 bg-green-900/30 border border-green-500/30 rounded-xl py-1.5 hover:bg-green-500/30 hover:border-green-500/60 transition-all shadow-inner shadow-green-500/10"
            >
              <PlusOutlined className="text-base" />
              <span className="text-[9px] font-extrabold uppercase tracking-wider">Giao dịch</span>
            </button>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                if (onDeleteFile) onDeleteFile(file); 
              }}
              className="flex-1 flex flex-col items-center justify-center gap-1 text-red-400 bg-red-900/30 border border-red-500/30 rounded-xl py-1.5 hover:bg-red-500/30 hover:border-red-500/60 transition-all shadow-inner shadow-red-500/10"
            >
              <DeleteOutlined className="text-base" />
              <span className="text-[9px] font-extrabold uppercase tracking-wider">Xóa</span>
            </button>
          </div>
        )}
    </div>
  );
});

const { Option } = Select;
const { Search } = Input;

export default function Transactions() {
  const navigate = useNavigate();
  const store = useAppStore();
  const { message, modal: modalInstance } = AntdApp.useApp();
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(40);
  const [filterCustId, setFilterCustId] = useState(undefined);
  const [filterCategoryId, setFilterCategoryId] = useState(undefined);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const observerTarget = React.useRef(null);
  
  // Modals state
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showEditCustModal, setShowEditCustModal] = useState(false);
  const [showCustHistoryModal, setShowCustHistoryModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showEditFileModal, setShowEditFileModal] = useState(false);
  const [showEditContractModal, setShowEditContractModal] = useState(false);
  const [showEditDetailModal, setShowEditDetailModal] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Mobile state
  const [showMobileDetail, setShowMobileDetail] = useState(false); // Hien thi modal chi tiet tren mobile
  const [showMobileTxDetail, setShowMobileTxDetail] = useState(false); // Modal chi tiet GD
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1280;

  // New Case File Form State
  const [newFilePayload, setNewFilePayload] = useState({
    id_khach_hang: '',
    id_ma_hop_dong: '',
    id_loai_hop_dong: '',
    noi_dung: '',
    ghi_chu: ''
  });
  const [editFilePayload, setEditFilePayload] = useState({});
  const [editDetailPayload, setEditDetailPayload] = useState({});
  const [editContractPayload, setEditContractPayload] = useState({});
  // Inline Creation Toggle inside Modal
  const [addNewContractInline, setAddNewContractInline] = useState(false);
  const [newContractPayload, setNewContractPayload] = useState({
    ma_hop_dong: '',
    chu_hop_dong: '',
    ghi_chu: '',
    id_danh_muc_dich_vu: undefined
  });

  const [addNewCustInline, setAddNewCustInline] = useState(false);
  const [editAddNewCustInline, setEditAddNewCustInline] = useState(false);
  const [editAddNewContractInline, setEditAddNewContractInline] = useState(false);
  const [newCustPayload, setNewCustPayload] = useState({
    ho_va_ten: '',
    so_dien_thoai: '',
    dia_chi: '',
    so_cccd: '',
    email: '',
    id_gioi_tinh: 'b0000004-0000-0000-0000-000000000001',
    id_level: 'b0000003-0000-0000-0000-000000000002'
  });

  // Edit Customer Form State
  const [editCustPayload, setEditCustPayload] = useState({});

  // Copy Modal State
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyOptions, setCopyOptions] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_copy_options_pref');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      serviceName: false,
      contractId: true,
      contractOwner: false
    };
  });

  useEffect(() => {
    localStorage.setItem('aura_copy_options_pref', JSON.stringify(copyOptions));
  }, [copyOptions]);

  const handleCopyData = () => {
    const activeFile = store.selectedServiceFile;
    if (!activeFile) return;

    const currentHd = store.ma_hop_dong.find(h => h.id_ma_hop_dong === activeFile.id_ma_hop_dong) || activeFile.ma_hop_dong;
    
    let copyParts = [];
    if (copyOptions.serviceName) copyParts.push(store.selectedService?.ten_danh_muc || 'Không xác định');
    if (copyOptions.contractId) copyParts.push(currentHd?.ma_hop_dong || 'Không xác định');
    if (copyOptions.contractOwner) copyParts.push(currentHd?.chu_hop_dong || 'Không xác định');

    if (copyParts.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 thông tin để copy!');
      return;
    }

    const textToCopy = copyParts.join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      message.success('Đã copy thông tin thành công!');
      setShowCopyModal(false);
    }).catch(() => {
      message.error('Không thể copy, vui lòng thử lại!');
    });
  };
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  
  const [showCol2Menu, setShowCol2Menu] = useState(false);
  const [showCol3Menu, setShowCol3Menu] = useState(false);
  const [showCol3StatusMenu, setShowCol3StatusMenu] = useState(false);

  const currentUser = useAuthStore(state => state.user);

  const handleSelectMobile = React.useCallback((file) => {
    store.selectServiceFile(file);
  }, [store]);

  const handleSelectDesktop = React.useCallback((file) => {
    store.selectServiceFile(file);
  }, [store]);

  useEffect(() => {
    store.fetchCustomers();
    
    // Khóa cuộn trang toàn cục trên màn hình Giao Dịch để giữ form cố định
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    if (!store.isBootstrapped) {
      store.fetchSystemConfig();
    }
  }, []);

  useEffect(() => {
    if (store.isBootstrapped) {
      setCurrentPage(1);
      store.fetchServiceFiles(store.selectedService?.id_loai_dich_vu || null, searchTerm, 1, pageSize, false, filterCustId, filterCategoryId);
    }
  }, [store.selectedService, pageSize, store.refetchTrigger, filterCustId, filterCategoryId]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    store.fetchServiceFiles(store.selectedService?.id_loai_dich_vu || null, value, 1, pageSize, false, filterCustId, filterCategoryId);
  };

  const [isFetchingMore, setIsFetchingMore] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && store.hasMoreServiceFiles && !isFetchingMore) {
          setIsFetchingMore(true);
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          store.fetchServiceFiles(store.selectedService?.id_loai_dich_vu || null, searchTerm, nextPage, pageSize, true, filterCustId, filterCategoryId).finally(() => {
            setIsFetchingMore(false);
          });
        }
      },
      { threshold: 1.0 }
    );
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [observerTarget, store.hasMoreServiceFiles, currentPage, searchTerm, pageSize, store.selectedService, isFetchingMore, filterCustId, filterCategoryId]);

  // 1. Tiền xử lý tính toán thời gian và Áp dụng bộ lọc (Cho dữ liệu trang hiện tại)
  const sortedFiles = useMemo(() => {
    let filesToProcess = store.serviceFiles;

    if (filterCustId) {
      filesToProcess = filesToProcess.filter(f => f.id_khach_hang === filterCustId);
    }
    
    if (filterCategoryId) {
      filesToProcess = filesToProcess.filter(f => {
        const hd = store.ma_hop_dong?.find(h => h.id_ma_hop_dong === f.id_ma_hop_dong) || f.ma_hop_dong;
        return hd && hd.id_danh_muc_dich_vu === filterCategoryId;
      });
    }

    return filesToProcess.map(file => {
      const txs = store.allTransactions?.filter(t => t.id_ho_so_dich_vu === file.id_ho_so_dich_vu) || [];
      let latestDate = new Date(file.ngay_tao || 0).getTime();
      if (txs.length > 0) {
        latestDate = txs.reduce((latest, t) => {
          const tDate = new Date(t.thoi_gian_giao_dich || t.ngay_tao || 0).getTime();
          return Math.max(latest, tDate);
        }, latestDate);
      }
      return {
        ...file,
        _sortTime: latestDate,
        _lastTxDate: txs.length > 0 && latestDate > 0 ? new Date(latestDate) : null
      };
    }).sort((a, b) => b._sortTime - a._sortTime);
  }, [store.serviceFiles, store.allTransactions, filterCustId, filterCategoryId, store.ma_hop_dong]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    message.success('📋 Đã sao chép vào clipboard!');
  };

  const getStatusTag = (statusId) => {
    const status = store.categories.find(c => c.id_danh_muc === statusId);
    const statusName = (status?.ten_danh_muc || '').toLowerCase();
    
    let color = 'default';
    if (statusName.includes('hoàn thành') || statusName.includes('thành công')) color = 'success';
    else if (statusName.includes('xử lý') || statusName.includes('chờ')) color = 'warning';
    else if (statusName.includes('hủy') || statusName.includes('thất bại')) color = 'error';

    return (
      <Tag color={color} className="font-extrabold uppercase px-2.5 py-0.5 rounded border-none">
        {status?.ten_danh_muc || 'Không rõ'}
      </Tag>
    );
  };

  const getAmountColorClass = (statusId) => {
    const status = store.categories.find(c => c.id_danh_muc === statusId);
    const statusName = (status?.ten_danh_muc || '').toLowerCase();
    
    if (statusName.includes('hoàn thành') || statusName.includes('thành công')) return 'text-green-400';
    if (statusName.includes('hủy') || statusName.includes('thất bại')) return 'text-red-400';
    return 'text-orange-400';
  };

  // Tạo nhanh Mã hợp đồng inline
  const handleCreateContractInline = async () => {
    if (!newContractPayload.ma_hop_dong) {
      message.error('Vui lòng nhập mã số hợp đồng!');
      return;
    }
    
    // Kiểm tra trùng mã hợp đồng và danh mục dịch vụ
    const existing = store.ma_hop_dong?.find(h => 
      h.ma_hop_dong.toLowerCase().trim() === newContractPayload.ma_hop_dong.toLowerCase().trim() && 
      h.id_danh_muc_dich_vu === newContractPayload.id_danh_muc_dich_vu
    );

    if (existing) {
      modalInstance.confirm({
        title: 'Hợp đồng đã tồn tại',
        content: 'Mã hợp đồng này đã tồn tại với cùng Ngân hàng / Nhà mạng. Bạn có muốn sử dụng hợp đồng đã có thay vì tạo mới không?',
        okText: 'Có, sử dụng',
        cancelText: 'Không, hủy',
        onOk: () => {
          setSearchInput(existing.ma_hop_dong);
          handleSearch(existing.ma_hop_dong);
          setAddNewContractInline(false);
          setNewContractPayload({ ma_hop_dong: '', chu_hop_dong: '', ghi_chu: '', id_danh_muc_dich_vu: undefined });
          // Delay đóng modal cha để tránh lỗi kẹt DOM của Ant Design khi đóng nhiều modal cùng lúc
          setTimeout(() => {
            setShowNewFileModal(false);
          }, 100);
        }
      });
      return;
    }

    const data = await store.addContract(newContractPayload);
    if (data) {
      message.success('🎉 Đã thêm mã hợp đồng mới vào danh mục!');
      setNewFilePayload({ ...newFilePayload, id_ma_hop_dong: data.id_ma_hop_dong });
      setAddNewContractInline(false);
      setNewContractPayload({ ma_hop_dong: '', chu_hop_dong: '', ghi_chu: '', id_danh_muc_dich_vu: undefined });
    }
  };

  // Tạo nhanh Khách hàng inline
  const handleCreateCustInline = async () => {
    if (!newCustPayload.ho_va_ten) {
      message.error('Vui lòng điền tên khách hàng!');
      return;
    }
    const data = await store.addCustomer(newCustPayload);
    if (data) {
      message.success('🎉 Đã khởi tạo hồ sơ khách hàng mới!');
      setNewFilePayload({ ...newFilePayload, id_khach_hang: data.id_khach_hang });
      setAddNewCustInline(false);
      setNewCustPayload({ ho_va_ten: '', so_dien_thoai: '', dia_chi: '', so_cccd: '', email: '', id_gioi_tinh: 'b0000004-0000-0000-0000-000000000001', id_level: 'b0000003-0000-0000-0000-000000000002' });
    } else {
      message.error('Không thể lưu khách! Kiểm tra Console (F12) để xem lỗi chi tiết.');
    }
  };

  const handleEditCreateCustInline = async () => {
    if (!newCustPayload.ho_va_ten) {
      message.error('Vui lòng điền tên khách hàng!');
      return;
    }
    const data = await store.addCustomer(newCustPayload);
    if (data) {
      message.success('🎉 Đã khởi tạo hồ sơ khách hàng mới!');
      setEditFilePayload({ ...editFilePayload, id_khach_hang: data.id_khach_hang });
      setEditAddNewCustInline(false);
      setNewCustPayload({ ho_va_ten: '', so_dien_thoai: '', dia_chi: '', so_cccd: '', email: '', id_gioi_tinh: 'b0000004-0000-0000-0000-000000000001', id_level: 'b0000003-0000-0000-0000-000000000002' });
    } else {
      message.error('Không thể lưu khách! Kiểm tra Console (F12) để xem lỗi chi tiết.');
    }
  };

  const handleEditCreateContractInline = async () => {
    if (!newContractPayload.ma_hop_dong) {
      message.error('Vui lòng nhập mã số hợp đồng!');
      return;
    }
    
    // Kiểm tra trùng mã hợp đồng và danh mục dịch vụ
    const existing = store.ma_hop_dong?.find(h => 
      h.ma_hop_dong.toLowerCase().trim() === newContractPayload.ma_hop_dong.toLowerCase().trim() && 
      h.id_danh_muc_dich_vu === newContractPayload.id_danh_muc_dich_vu
    );

    if (existing) {
      modalInstance.confirm({
        title: 'Hợp đồng đã tồn tại',
        content: 'Mã hợp đồng này đã tồn tại với cùng Ngân hàng / Nhà mạng. Bạn có muốn sử dụng hợp đồng đã có thay vì tạo mới không?',
        okText: 'Có, sử dụng',
        cancelText: 'Không, hủy',
        onOk: () => {
          setEditFilePayload({ ...editFilePayload, id_ma_hop_dong: existing.id_ma_hop_dong });
          setEditAddNewContractInline(false);
          setNewContractPayload({ ma_hop_dong: '', chu_hop_dong: '', ghi_chu: '', id_danh_muc_dich_vu: undefined });
          setTimeout(() => {
            setShowEditFileModal(false);
          }, 100);
        }
      });
      return;
    }

    const data = await store.addContract(newContractPayload);
    if (data) {
      message.success('🎉 Đã thêm mã hợp đồng mới vào danh mục!');
      setEditFilePayload({ ...editFilePayload, id_ma_hop_dong: data.id_ma_hop_dong });
      setEditAddNewContractInline(false);
      setNewContractPayload({ ma_hop_dong: '', chu_hop_dong: '', ghi_chu: '', id_danh_muc_dich_vu: undefined });
    }
  };

  // Sửa hồ sơ dịch vụ
  const handleEditFileSubmit = async () => {
    const activeFile = store.selectedServiceFile;
    if (!activeFile) return;
    
    // Chỉ gửi các trường có thể cập nhật, bỏ qua id, ngày tạo, timestamps
    const { id_khach_hang, id_ma_hop_dong, noi_dung, id_loai_hop_dong, ghi_chu } = editFilePayload;
    const safePayload = { id_khach_hang, id_ma_hop_dong, noi_dung, id_loai_hop_dong, ghi_chu };
    
    const data = await store.updateServiceFile(activeFile.id_ho_so_dich_vu, safePayload);
    if (data) {
      message.success('Đã cập nhật chi tiết hồ sơ dịch vụ thành công!');
      setShowEditFileModal(false);
    }
  };


  const openEditFileModal = () => {
    const activeFile = store.selectedServiceFile;
    if (activeFile) {
      setEditFilePayload(activeFile);
      setShowEditFileModal(true);
    }
  };

  // Sửa mã hợp đồng
  const handleEditContractSubmit = async () => {
    const activeFile = store.selectedServiceFile;
    const activeHd = store.ma_hop_dong.find(h => h.id_ma_hop_dong === activeFile?.id_ma_hop_dong) || activeFile?.ma_hop_dong;
    if (!activeHd) return;
    
    // Chỉ gửi các trường có thể cập nhật, bỏ qua các cột tự động (id, created_at, ngay_tao...)
    const { ma_hop_dong, chu_hop_dong, id_danh_muc_dich_vu, ghi_chu } = editContractPayload;
    const safePayload = { ma_hop_dong, chu_hop_dong, id_danh_muc_dich_vu, ghi_chu };
    
    const data = await store.updateContract(activeHd.id_ma_hop_dong, safePayload);
    if (data) {
      message.success('Đã cập nhật mã hợp đồng thành công!');
      setShowEditContractModal(false);
    }
  };


  const openEditContractModal = () => {
    const activeFile = store.selectedServiceFile;
    const activeHd = store.ma_hop_dong.find(h => h.id_ma_hop_dong === activeFile?.id_ma_hop_dong) || activeFile?.ma_hop_dong;
    if (activeHd) {
      setEditContractPayload(activeHd);
      setShowEditContractModal(true);
    } else {
      message.error('Hồ sơ này chưa gắn với mã hợp đồng nào!');
    }
  };

  // ============================================================
  // HÀM IN HÓA ĐƠN 2 LIÊN NỬa A4
  // ============================================================
  const handlePrintInvoice = () => {
    if (!activeDetail) return;

    const fmtVND = (val) => {
      const num = parseFloat(val || 0);
      return isNaN(num) ? '0 ₫' : num.toLocaleString('vi-VN') + ' ₫';
    };

    // Lấy thông tin ngân hàng từ hợp đồng
    const bank = store.banks?.find(b => b.id_danh_muc_dich_vu === activeHd?.id_danh_muc_dich_vu);
    const tenDonVi = bank?.ten_dich_vu || store.selectedService?.ten_danh_muc || '';
    const maTaiKhoan = activeHd?.ma_hop_dong || '';
    const chuTaiKhoan = activeHd?.chu_hop_dong || '';
    const ngayGD = new Date(activeDetail.thoi_gian_giao_dich || activeDetail.ngay_tao).toLocaleString('vi-VN');

    // Xây dựng chuỷ ký
    const sig = store.signature || {};
    const chuKyText = [
      sig.ten_cua_hang || '',
      sig.dia_chi ? 'DC: ' + sig.dia_chi : '',
      sig.sdt1 ? 'SĐT: ' + sig.sdt1 : '',
      sig.zalo ? 'Zalo: ' + sig.zalo : '',
    ].filter(Boolean).join('\n');

    const createPane = (lienName) => `
    <div class="invoice-pane">
      <div class="lien-badge">${lienName}</div>
      <div class="title">BIÊN LAI GIAO DỊCH</div>
      <div class="dynamic-title">DV: ${store.selectedService?.ten_danh_muc || ''}</div>

      <div class="section-title">⌨ THÔNG TIN THANH TOÁN</div>
      <div class="data-row"><div class="data-label">- Đơn vị DV</div><div class="data-value">: ${tenDonVi}</div></div>
      <div class="data-row"><div class="data-label">- Mã TT</div><div class="data-value">: ${maTaiKhoan}</div></div>
      <div class="data-row"><div class="data-label">- Chủ HĐ</div><div class="data-value">: ${chuTaiKhoan}</div></div>

      <div class="section-title">⌨ THÔNG TIN NGƯỜI GỎI</div>
      <div class="data-row"><div class="data-label">- Họ và tên</div><div class="data-value">: ${activeCust?.ho_va_ten || 'Khách lẻ'}</div></div>
      <div class="data-row"><div class="data-label">- Sđt</div><div class="data-value">: ${activeCust?.so_dien_thoai || ''}</div></div>

      <div class="section-title">⌨ THÔNG TIN CHI TIẾT</div>
      <div class="data-row"><div class="data-label">- Nội dung</div><div class="data-value">: ${activeDetail.noi_dung || ''}</div></div>
      <div class="data-row"><div class="data-label">- Số tiền</div><div class="data-value">: ${fmtVND(activeDetail.so_tien)}</div></div>
      <div class="data-row"><div class="data-label">- Phí DV</div><div class="data-value">: ${fmtVND(activeDetail.phi_dich_vu)}</div></div>
      ${parseFloat(activeDetail.chiet_khau) > 0 ? `<div class="data-row"><div class="data-label">- Giảm</div><div class="data-value">: -${fmtVND(activeDetail.so_tien_giam)}</div></div>` : ''}
      <div class="data-row total-row"><div class="data-label">- Tổng</div><div class="data-value">: ${fmtVND(activeDetail.so_tien_di)}</div></div>
      <div class="data-row"><div class="data-label">- Ngày GD</div><div class="data-value">: ${ngayGD}</div></div>

      <div style="flex-grow:1"></div>

      <div class="sign-block">
        <div class="sign-row">
          <div class="sign-col"><b>Khách hàng</b><i>(İKý, ghi rõ)</i></div>
          <div class="sign-col"><b>Nhân viên</b><i>(İKý, ghi rõ)</i></div>
        </div>
      </div>

      <div class="contact-box">${chuKyText}</div>

      <div class="service-box">
        <b>CUNG CẤP DỊCH VỤ</b>
        <div class="srv-table">
          <div class="srv-row">
            <div class="srv-cell">- Thu hộ trả góp, điện, nước</div>
            <div class="srv-cell">- Trả trước – trả sau</div>
          </div>
          <div class="srv-row">
            <div class="srv-cell">- Chuyển tiền, nhận tiền mặt</div>
            <div class="srv-cell">- Internet, camera, định vị</div>
          </div>
          <div class="srv-row">
            <div class="srv-cell">- Cấp lại sim Viettel</div>
            <div class="srv-cell">- Sim số đẹp, 4G–5G</div>
          </div>
        </div>
      </div>
      <div class="footer-ad">BẢO HIỂM XE MÁY 2 NĂM 100K</div>
    </div>`;

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;width:0;height:0;border:0';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Biên lai 2 liên Nửa A4</title>
    <style>
      @page { size: A4 portrait; margin: 0; }
      body { margin:0; font-family: Arial, Helvetica, sans-serif; color:#000; box-sizing:border-box; }
      .page-container { width:210mm; height:148.5mm; display:flex; flex-direction:row; border-bottom:1px dashed #bbb; }
      .invoice-pane { width:50%; height:100%; box-sizing:border-box; padding:5mm 8mm; position:relative; display:flex; flex-direction:column; }
      .invoice-pane:first-child { border-right:1px dashed #666; }
      .lien-badge { text-align:center; font-size:11px; font-weight:bold; text-transform:uppercase; margin-bottom:4px; color:#555; }
      .title { text-align:center; font-size:16px; font-weight:bold; text-transform:uppercase; margin-bottom:6px; }
      .dynamic-title { font-size:13px; font-weight:bold; margin-bottom:6px; text-transform:uppercase; color:#222; border-bottom:1px solid #000; padding-bottom:3px; }
      .section-title { font-weight:bold; font-size:12px; margin-top:5px; margin-bottom:2px; }
      .data-row { display:flex; font-size:11px; line-height:1.4; }
      .data-label { width:65px; flex-shrink:0; }
      .data-value { font-weight:bold; flex-grow:1; }
      .total-row .data-value { font-size:12px; }
      .sign-block { width:100%; margin-bottom:6px; }
      .sign-row { display:flex; justify-content:space-around; }
      .sign-col { text-align:center; }
      .sign-col b { display:block; font-size:11.5px; margin-bottom:1px; }
      .sign-col i { font-size:10px; color:#555; font-weight:normal; }
      .contact-box { font-size:10.5px; line-height:1.35; margin-bottom:6px; border-top:1px dashed #ccc; padding-top:4px; white-space:pre-wrap; }
      .service-box { border:1px solid #000; padding:4px; margin-bottom:6px; border-radius:3px; }
      .service-box b { display:block; text-align:center; font-size:11px; margin-bottom:3px; }
      .srv-table { display:table; width:100%; font-size:10px; line-height:1.3; }
      .srv-row { display:table-row; }
      .srv-cell { display:table-cell; width:50%; }
      .footer-ad { text-align:center; font-weight:bold; font-size:12px; }
    </style></head><body>
      <div class="page-container">
        ${createPane('Liên 1: Cửa hàng lưu')}
        ${createPane('Liên 2: Giao khách hàng')}
      </div>
    </body></html>`);
    doc.close();
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => iframe.remove(), 1500);
  };

  // Tạo hồ sơ dịch vụ chính thức
  const handleCreateServiceFile = async () => {
    if (!newFilePayload.id_khach_hang || !newFilePayload.id_ma_hop_dong) {
      message.error('Vui lòng chọn đầy đủ Khách hàng và Mã hợp đồng!');
      return;
    }
    const data = await store.createServiceFile(newFilePayload);
    if (data) {
      message.success('🎉 Lập hồ sơ quản lý dịch vụ mới thành công!');
      setShowNewFileModal(false);
      setNewFilePayload({ id_khach_hang: '', id_ma_hop_dong: '', id_loai_hop_dong: '', noi_dung: '', ghi_chu: '' });
    }
  };

  // Lưu chỉnh sửa thông tin khách hàng nhanh
  const handleSaveEditCust = async () => {
    if (!editCustPayload.ho_va_ten) {
      message.error('Họ và tên khách hàng không được để trống!');
      return;
    }
    const data = await store.updateCustomer(editCustPayload.id_khach_hang, editCustPayload);
    if (data) {
      message.success('🎉 Đã cập nhật hồ sơ khách hàng thành công!');
      setShowEditCustModal(false);
      store.fetchCustomers();
    }
  };

  // Mở Form chỉnh sửa khách hàng
  const openEditCustModal = (cust) => {
    setEditCustPayload(cust);
    setShowEditCustModal(true);
  };

  // --- TÍNH TOÁN LỊCH SỬ KHÁCH HÀNG CRM ---
  const getCustomerStats = (custId) => {
    // 1. Tìm tất cả hồ sơ của khách này
    const custFiles = store.serviceFiles.filter(f => f.id_khach_hang === custId);
    
    // 2. Lấy danh sách các mã hợp đồng đã dùng
    const contractsUsed = custFiles.map(f => {
      const hd = store.ma_hop_dong.find(h => h.id_ma_hop_dong === f.id_ma_hop_dong) || f.ma_hop_dong;
      return hd ? hd.ma_hop_dong : null;
    }).filter(Boolean);
    const uniqueContracts = [...new Set(contractsUsed)];

    // 3. Tính tổng số tiền và tổng giao dịch từ transactions trong store
    const custTxs = store.transactions.filter(t => {
      const file = store.serviceFiles.find(f => f.id_ho_so_dich_vu === t.id_ho_so_dich_vu);
      return file && file.id_khach_hang === custId;
    });

    const totalAmt = custTxs.reduce((sum, t) => sum + parseFloat(t.so_tien_di || 0), 0);

    return {
      filesCount: custFiles.length,
      txsCount: custTxs.length,
      totalSpent: totalAmt,
      contractsList: uniqueContracts
    };
  };

  const activeFile = store.selectedServiceFile;
  const activeCust = store.customers.find(c => c.id_khach_hang === activeFile?.id_khach_hang);
  const activeHd = store.ma_hop_dong.find(h => h.id_ma_hop_dong === activeFile?.id_ma_hop_dong) || activeFile?.ma_hop_dong;
  const activeBank = store.banks.find(b => b.id_danh_muc_dich_vu === activeHd?.id_danh_muc_dich_vu);
  const activeDetail = store.selectedDetail;
  
  // Tính tổng tự động
  const calcAmt = activeDetail ? parseFloat(activeDetail.so_tien || 0) : 0;
  const calcFee = activeDetail ? parseFloat(activeDetail.phi_dich_vu || 0) : 0;
  const calcGiam = activeDetail ? parseFloat(activeDetail.so_tien_giam || 0) : 0;
  const calcIsTrong = activeDetail?.is_cuoc_trong;
  const globalCalculatedTotal = calcIsTrong ? (calcAmt - calcGiam) : (calcAmt + calcFee - calcGiam);
  // Quyền thao tác
  const isSuperAdminOrOwner = currentUser?.dm_nhom_quyen?.is_admin || currentUser?.dm_nhom_quyen?.ma_quyen === 'CHU_DIEM_BAN';
  
  const canEditFile = () => {
    if (isSuperAdminOrOwner) return true;
    if (!activeFile) return false;
    return activeFile.id_tai_khoan_tao === currentUser?.id_tai_khoan;
  };

  const canCancelTransaction = () => {
    if (isSuperAdminOrOwner) return true;
    if (!activeDetail) return false;
    
    const status = store.categories.find(c => c.id_danh_muc === activeDetail.id_trang_thai);
    const statusName = (status?.ten_danh_muc || '').toLowerCase();
    const isCompletedOrCanceled = statusName.includes('hoàn thành') || statusName.includes('thành công') || statusName.includes('hủy') || statusName.includes('thất bại');
    
    return activeDetail.id_tai_khoan_tao === currentUser?.id_tai_khoan && !isCompletedOrCanceled;
  };

  const handleCancelTransaction = async () => {
    if (!activeDetail) return;
    
    const huyId = store.categories.find(c => (c.ten_danh_muc || '').toLowerCase().includes('hủy'))?.id_danh_muc;
    if (!huyId) {
      message.error('Hệ thống chưa thiết lập trạng thái Hủy.');
      return;
    }

    modalInstance.confirm({
      title: 'Xác nhận Hủy Giao Dịch?',
      content: 'Bạn có chắc chắn muốn chuyển trạng thái giao dịch này thành THẤT BẠI/HỦY?',
      okText: 'Hủy Giao Dịch',
      okType: 'danger',
      cancelText: 'Đóng',
      onOk: async () => {
        try {
          const { error } = await supabase
            .from('chi_tiet_giao_dich')
            .update({ id_trang_thai: huyId }) // Dynamic ID
            .eq('id_chi_tiet_giao_dich', activeDetail.id_chi_tiet_giao_dich);
          
          if (error) throw error;
          message.success('Đã hủy giao dịch thành công!');
          await store.fetchTransactionDetails(activeFile.id_ho_so_dich_vu);
        } catch (err) {
          message.error('Lỗi khi hủy giao dịch: ' + err.message);
        }
      }
    });
  };

  const handleChangeStatus = async (statusId, statusName) => {
    if (!activeDetail) return;
    if (activeDetail.id_trang_thai === statusId) {
      message.info(`Giao dịch đã ở trạng thái ${statusName}`);
      return;
    }
    
    modalInstance.confirm({
      title: 'Xác nhận Đổi Trạng Thái?',
      content: `Chuyển giao dịch thành "${statusName}"?`,
      okText: 'Xác nhận',
      cancelText: 'Đóng',
      onOk: async () => {
        try {
          const { error } = await supabase
            .from('chi_tiet_giao_dich')
            .update({ id_trang_thai: statusId })
            .eq('id_chi_tiet_giao_dich', activeDetail.id_chi_tiet_giao_dich);
          
          if (error) throw error;
          message.success(`Đã đổi trạng thái thành ${statusName}!`);
          await store.fetchTransactionDetails(activeFile.id_ho_so_dich_vu);
          setShowCol3StatusMenu(false);
        } catch (err) {
          message.error('Lỗi khi đổi trạng thái: ' + err.message);
        }
      }
    });
  };

  // Link VietQR động cho dòng tiền đang chọn
  const binCode = activeBank?.ma_bin || '970422'; // fallback về MBBank
  const activeQrUrl = activeDetail && activeHd && binCode !== '000000'
    ? `https://api.vietqr.io/image/${binCode}-${activeHd.ma_hop_dong}-compact.png?amount=${activeDetail.so_tien_di}&addInfo=${encodeURIComponent(activeDetail.noi_dung)}&accountName=${encodeURIComponent(activeCust?.ho_va_ten || 'AURA CUSTOMER')}`
    : '';

  return (
    <div className="flex flex-col xl:flex-row gap-5 h-[calc(100vh-112px)] md:h-[calc(100vh-140px)] animate-fadeIn -mx-4 sm:mx-0">
      
      {/* ============================================================
         CỘT 1 (BÊN TRÁI): DANH SÁCH HỒ SƠ DỊCH VỤ (CASE MANAGEMENT)
         ============================================================ */}
      <div className={`relative w-full p-2 sm:p-3 rounded-none sm:rounded-2xl bg-[#0d1426]/70 border-y sm:border-y-0 sm:border border-white/5 flex flex-col gap-3 sm:gap-4 shadow-xl backdrop-blur-md h-full transition-all duration-300 ${!activeFile ? 'xl:w-1/2' : (!activeDetail ? 'xl:w-[40%]' : 'xl:w-[32%]')}`}>
        <div className="flex justify-between items-center border-b border-white/5 pb-3 flex-shrink-0 px-2 sm:px-1">
          <div className="flex items-center gap-2">
            {store.selectedService?.icon?.startsWith('http') 
              ? <img src={store.selectedService.icon} alt="icon" className="h-6 w-6 object-contain" />
              : <span className="text-lg">{store.selectedService?.icon || '📁'}</span>
            }
            <span className="font-extrabold text-white text-xs tracking-wider uppercase">DANH SÁCH HỒ SƠ</span>
          </div>
          <div className="flex gap-1.5">
            <Button 
              size="small" 
              type="primary" 
              icon={<HistoryOutlined />} 
              onClick={() => navigate(`/lich-su?id_dich_vu=${store.selectedService?.id_loai_dich_vu || ''}`)} 
              className="bg-violet-600 border-none shadow-md shadow-violet-900/50 hover:bg-violet-500 !rounded-lg"
            >
              Lịch sử
            </Button>
          </div>
        </div>

        {/* Bộ lọc nâng cao */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(searchInput); }} className="flex-1 flex">
              {(() => {
                const isResetMode = searchTerm && searchInput === searchTerm;
                return (
                  <Search 
                    placeholder="Nhập hợp đồng, tên, SĐT..." 
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    onSearch={(val) => {
                      if (isResetMode) {
                        setSearchInput('');
                        handleSearch('');
                      } else {
                        handleSearch(val);
                      }
                    }}
                    enterButton={
                      <span className="font-semibold tracking-wide px-1 flex items-center justify-center">
                        {isResetMode ? <ReloadOutlined spin={false} /> : 'TÌM'}
                      </span>
                    }
                    className={`bg-[#0d1426]/50 border-white/10 text-white flex-1 custom-search-input shadow-inner h-[40px] ${isResetMode ? 'search-btn-light-violet' : 'search-btn-violet'}`}
                    allowClear
                  />
                );
              })()}
            </form>
            <Button 
              type="text" 
              icon={<FilterOutlined />} 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`h-auto px-3 rounded-xl border hover:bg-white/10 transition-colors ${
                showAdvancedFilters || filterCustId || filterCategoryId 
                  ? 'bg-violet-600/20 text-violet-400 border-violet-500/30' 
                  : 'bg-white/5 text-gray-400 border-white/5'
              }`}
            />
          </div>
          
          {showAdvancedFilters && (
            <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <Select
                showSearch
                allowClear
                placeholder="Khách hàng..."
                className="flex-1"
                optionFilterProp="children"
                value={filterCustId}
                onChange={setFilterCustId}
              >
                {store.customers.map(c => (
                  <Option key={c.id_khach_hang} value={c.id_khach_hang}>{c.ho_va_ten}</Option>
                ))}
              </Select>
              <Select
                showSearch
                allowClear
                placeholder="Danh mục dịch vụ..."
                className="flex-1"
                optionFilterProp="children"
                value={filterCategoryId}
                onChange={setFilterCategoryId}
              >
                {store.banks
                  .filter(b => store.selectedService ? b.id_loai_dich_vu === store.selectedService.id_loai_dich_vu : true)
                  .map(b => (
                    <Option key={b.id_danh_muc_dich_vu} value={b.id_danh_muc_dich_vu}>
                      {b.ten_viet_tat || b.ten_dich_vu}
                    </Option>
                  ))
                }
              </Select>
            </div>
          )}
        </div>

        {/* Danh sách Hồ sơ (Virtual Scrolling) */}
        <div className="w-full flex-1 flex flex-col min-h-0">
          {store.isLoadingFiles ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-violet-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 animate-spin"></div>
              </div>
              <span className="text-xs text-gray-500 font-medium animate-pulse">Đang tải hồ sơ...</span>
            </div>
          ) : sortedFiles.length === 0 ? (
            <div className="p-8 text-center text-gray-500 border border-dashed border-white/5 rounded-xl text-xs">
              Chưa có hồ sơ dịch vụ nào được lập cho phân hệ này.
            </div>
          ) : (
            <>
            <div className="flex-1 space-y-1.5 pb-4 overflow-y-auto scrollbar-thin pr-1 min-h-0 overscroll-none">
              {sortedFiles.map((file, index) => {
                const cust = store.customers.find(c => c.id_khach_hang === file.id_khach_hang);
                const hd = store.ma_hop_dong.find(h => h.id_ma_hop_dong === file.id_ma_hop_dong) || file.ma_hop_dong;
                const bank = store.banks.find(b => b.id_danh_muc_dich_vu === hd?.id_danh_muc_dich_vu);
                const isSelected = store.selectedServiceFile?.id_ho_so_dich_vu === file.id_ho_so_dich_vu;
                const loaiHopDongText = store.loaiHopDongs?.find(l => l.id_loai_hop_dong === file.id_loai_hop_dong)?.ten_loai || 'TIÊU CHUẨN';
                
                return (
                  <MemoizedFileCard
                    key={file.id_ho_so_dich_vu}
                    file={file}
                    cust={cust}
                    hd={hd}
                    bank={bank}
                    isSelected={isSelected}
                    loaiHopDongText={loaiHopDongText}
                    iconFallback={store.selectedService?.icon || '📁'}
                    onSelectMobile={handleSelectMobile}
                    onSelectDesktop={handleSelectDesktop}
                    onAddTx={() => { handleSelectDesktop(file); setDrawerOpen(true); }}
                    onEditFile={() => { setShowCol2Menu(false); openEditFileModal(); }}
                    onViewFile={() => setShowMobileDetail(true)}
                    onCopyFile={() => setShowCopyModal(true)}
                  />
                );
              })}
              <div ref={observerTarget} className="h-10 mt-4 pb-20 md:pb-0 flex justify-center items-center">
                {store.hasMoreServiceFiles && (
                  <span className="text-gray-500 text-xs animate-pulse font-medium">Đang tải thêm dữ liệu...</span>
                )}
                {!store.hasMoreServiceFiles && sortedFiles.length > 0 && (
                  <span className="text-gray-600 text-xs italic">Đã hiển thị toàn bộ hồ sơ.</span>
                )}
              </div>
            </div>
            </>
          )}

          {/* FAB CỘT 1: Tạo hồ sơ */}
          <div className="absolute bottom-4 right-4 z-20">
            <button
              onClick={() => {
                const stdType = store.loaiHopDongs?.find(l => l.ten_loai?.toLowerCase().includes('tiêu chuẩn'))?.id_loai_hop_dong;
                setNewFilePayload(prev => ({ ...prev, id_loai_hop_dong: stdType || '' }));
                setShowNewFileModal(true);
              }}
              className="h-14 px-6 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center gap-2 shadow-[0_8px_30px_rgb(124,58,237,0.5)] transition-all hover:scale-105 active:scale-95"
            >
              <PlusOutlined className="text-xl font-bold" />
              <span className="font-extrabold uppercase text-sm">Tạo hồ sơ</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
         CỘT 2 + 3: Chi TIET - an tren mobile, hien tren desktop
         ============================================================ */}
      {React.useMemo(() => (
      <div className={`${showMobileDetail ? 'fixed inset-0 z-[100] bg-[#0d1426] flex flex-col gap-2 p-1 pt-4 animate-in slide-in-from-bottom' : 'hidden'} xl:contents`}>
        
      <div className={`relative w-full p-2 xl:p-4 rounded-2xl bg-[#0d1426]/70 border border-white/5 flex flex-col gap-4 shadow-xl backdrop-blur-md justify-between flex-1 min-h-0 xl:h-full transition-all duration-300 ${!activeFile ? 'xl:hidden' : (!activeDetail ? 'xl:w-[60%]' : 'xl:w-[40%]')}`}>
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="font-extrabold text-white text-base xl:text-xs tracking-wider uppercase">THÔNG TIN HỒ SƠ</span>
            <div className="flex items-center gap-2">
              <Button 
                type="primary"
                onClick={() => {
                  if (activeCust?.id_khach_hang) {
                    navigate(`/lich-su?id_khach_hang=${activeCust.id_khach_hang}`);
                  }
                }}
                className="bg-violet-600 hover:bg-violet-500 border-none font-bold text-[10px] xl:text-xs h-7 xl:h-8 px-2 xl:px-4 !rounded-lg shadow-[0_0_15px_rgba(124,58,237,0.3)] flex items-center gap-1.5"
                title="Lịch sử giao dịch khách hàng"
              >
                <HistoryOutlined /> Lịch sử
              </Button>
              <button 
                onClick={() => setShowMobileDetail(false)}
                className="xl:hidden w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white font-bold active:scale-95"
              >
                ✕
              </button>
            </div>
          </div>

          {store.isLoadingFiles || store.isLoadingDetails ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-4 border-violet-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 animate-spin"></div>
              </div>
              <span className="text-[10px] text-gray-500 font-medium animate-pulse">Đang tải hồ sơ...</span>
            </div>
          ) : activeFile ? (
            <div className="flex-1 flex flex-col min-h-0 space-y-4">
              {/* Card thông tin Hợp đồng */}
              <div className="p-4 rounded-2xl bg-[#131c33]/50 border border-white/5 relative overflow-hidden flex flex-col gap-3">
                <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/5 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 min-w-0 flex-1">
                    {/* Logo */}
                    <div className="w-[72px] h-[72px] bg-white rounded-2xl border border-white/20 p-2 flex items-center justify-center flex-shrink-0 shadow-sm">
                      {activeBank?.logo ? (
                        <img src={activeBank.logo} alt="logo" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-3xl text-violet-600 font-bold">{store.selectedService?.icon || '📁'}</span>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex flex-col min-w-0 pt-0.5 justify-center">
                      <span className="text-violet-400 font-black text-sm tracking-wider uppercase mb-1">
                        {activeBank?.ten_viet_tat || store.selectedService?.ten_danh_muc || 'CHƯA PHÂN LOẠI'}
                      </span>
                      <span className="text-red-500 font-black text-2xl tracking-wider uppercase truncate leading-none mb-1.5">
                        {activeHd?.ma_hop_dong || 'CHƯA CÓ HỢP ĐỒNG'}
                      </span>
                      {activeHd?.chu_hop_dong && (
                        <span className="text-gray-200 font-medium text-sm truncate">
                          {activeHd.chu_hop_dong}
                        </span>
                      )}
                      
                      {/* Badge Loại Hồ Sơ */}
                      <div className="mt-2.5 flex items-center">
                        <span className="px-3 py-1 rounded-full bg-[#0d1426] text-green-500 font-bold text-[10px] uppercase shadow-inner border border-green-500/20 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          {store.loaiHopDongs?.find(l => l.id_loai_hop_dong === activeFile?.id_loai_hop_dong)?.ten_loai || 'TIÊU CHUẨN'}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 mt-1 truncate">
                        {activeBank?.ten_dich_vu || '---'}
                      </span>
                    </div>
                  </div>
                  {/* Options Menu button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCol2Menu(!showCol2Menu);
                    }}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all flex-shrink-0"
                  >
                    <EllipsisOutlined className="text-lg" />
                  </button>
                </div>
              </div>

              {/* KHU VỰC KHÁCH HÀNG */}
              <div 
                className="p-4 rounded-2xl bg-[#131c33]/50 border border-white/5 flex flex-col gap-4 cursor-pointer hover:bg-[#131c33]/70 hover:border-white/10 transition-all group"
                onClick={() => setShowCustomerModal(true)}
              >
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <UserOutlined className="text-violet-400 text-lg" />
                  <span className="font-extrabold text-violet-400 text-sm tracking-wider uppercase">KHÁCH HÀNG</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex gap-8">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-gray-500 font-medium">Loại khách hàng</span>
                      <span className="text-gray-100 font-bold uppercase text-sm truncate max-w-[150px]">{activeCust?.ho_va_ten || 'KHÁCH LẺ'}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-gray-500 font-medium">Số điện thoại</span>
                      <span className="text-violet-400 font-bold text-sm">{activeCust?.so_dien_thoai || '---'}</span>
                    </div>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white shadow-[0_4px_15px_rgba(124,58,237,0.3)] hover:scale-105 active:scale-95 transition-all flex-shrink-0 group-hover:bg-violet-500">
                    <PhoneOutlined className="text-lg" />
                  </button>
                </div>
              </div>

              {/* Danh sách Dòng tiền chi tiết */}
              <div className="flex-1 flex flex-col min-h-0 space-y-2">
                <span className="font-extrabold text-gray-400 text-[10px] tracking-wider uppercase block">Các dòng tiền chi tiết phát sinh</span>
                
                <div className="flex-1 space-y-2.5 overflow-y-auto pr-1 scrollbar-thin min-h-0 overscroll-none">
                  {store.isLoadingDetails ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12">
                      <div className="relative w-10 h-10">
                        <div className="absolute inset-0 rounded-full border-4 border-violet-500/20"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 animate-spin"></div>
                      </div>
                      <span className="text-[10px] text-gray-500 font-medium animate-pulse">Đang tải giao dịch...</span>
                    </div>
                  ) : store.transactionDetails.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 border border-dashed border-white/5 rounded-xl text-xs">
                      Hồ sơ này chưa phát sinh dòng tiền nào. Vui lòng bấm "Lập phiếu POS" ở trên để tạo giao dịch đầu tiên!
                    </div>
                  ) : (
                    [...store.transactionDetails]
                      .sort((a, b) => new Date(b.thoi_gian_giao_dich || 0) - new Date(a.thoi_gian_giao_dich || 0))
                      .map(detail => {
                      const isSelected = store.selectedDetail?.id_chi_tiet_giao_dich === detail.id_chi_tiet_giao_dich;
                      
                      return (
                        <div 
                          key={detail.id_chi_tiet_giao_dich}
                          onClick={() => {
                            store.setSelectedDetail(detail);
                            if (isMobile) setShowMobileTxDetail(true);
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${isSelected ? 'bg-violet-600/5 border-violet-500/30' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
                        >
                          <div>
                            <span className="text-[9px] text-gray-500 font-bold block">
                              {new Date(detail.thoi_gian_giao_dich || detail.ngay_tao).toLocaleString('vi-VN')}
                            </span>
                            <span className="text-xs text-gray-200 font-bold mt-1 block max-w-[220px] truncate">
                              {detail.noi_dung}
                            </span>
                          </div>
                          
                          <div className="text-right flex flex-col items-end">
                            <span className={`text-[13px] font-extrabold block ${getAmountColorClass(detail.id_trang_thai)}`}>
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(detail.so_tien_di)}
                            </span>
                            <span className="text-[9px] text-gray-400 font-semibold mt-1.5 bg-white/5 px-1.5 py-0.5 rounded border border-white/5 uppercase tracking-wide">
                              Phí: <span className="text-gray-200">+{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(detail.phi_dich_vu)}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3">
              <InfoCircleOutlined style={{ fontSize: '32px' }} />
              <p className="text-xs">Vui lòng chọn một Hồ sơ dịch vụ ở cột bên trái hoặc bấm nút "Lập hồ sơ mới" để bắt đầu thao tác.</p>
            </div>
          )}

          {/* CỘT 2 - SPEED DIAL (Nút Nổi Menu) */}
          {activeFile && (
            <div className="mt-4 pt-4 border-t border-white/5 flex gap-2 shrink-0">
              <Button 
                onClick={() => setDrawerOpen(true)}
                className="flex-1 h-12 bg-gradient-to-r from-violet-600 to-indigo-600 border-none text-white font-extrabold shadow-[0_4px_15px_rgb(124,58,237,0.4)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                <PlusOutlined /> <span className="hidden sm:inline">THÊM</span>
              </Button>
              <Popover 
                content={
                  <div className="flex flex-col gap-2 w-[220px] p-1">
                    <Button onClick={() => openEditFileModal()} disabled={!canEditFile()} className="h-12 bg-[#1a2238] border-none text-white text-sm font-bold hover:bg-violet-600 hover:text-white justify-start px-4 transition-all"><EditOutlined className="text-lg" /> Sửa hồ sơ</Button>
                    <Button onClick={() => openEditCustModal(activeCust)} disabled={!canEditFile()} className="h-12 bg-[#1a2238] border-none text-white text-sm font-bold hover:bg-violet-600 hover:text-white justify-start px-4 transition-all"><UserOutlined className="text-lg" /> Sửa khách</Button>
                    <Button onClick={() => openEditContractModal()} disabled={!canEditFile()} className="h-12 bg-[#1a2238] border-none text-white text-sm font-bold hover:bg-violet-600 hover:text-white justify-start px-4 transition-all"><EditOutlined className="text-lg" /> Sửa HĐ</Button>
                  </div>
                }
                trigger="click" 
                placement="top"
                overlayInnerStyle={{ backgroundColor: '#0d1426', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              >
                <Button className="flex-1 h-12 bg-[#131c33] border border-white/10 text-white font-bold hover:border-violet-500 hover:text-violet-400 shadow-lg flex items-center justify-center gap-2">
                  <EditOutlined /> <span className="hidden sm:inline">SỬA</span>
                </Button>
              </Popover>
              <Button 
                onClick={() => setShowCopyModal(true)}
                className="flex-1 h-12 bg-[#131c33] border border-white/10 text-white font-bold hover:border-violet-500 hover:text-violet-400 shadow-lg flex items-center justify-center gap-2"
              >
                <CopyOutlined /> <span className="hidden sm:inline">COPY</span>
              </Button>
            </div>
          )}
        </div>
      </div>
      </div>
      ), [showMobileDetail, activeFile, activeCust, activeHd, activeBank, store.transactionDetails, showCol2Menu, activeDetail])}

      {/* ============================================================
         CỘT 3 (BÊN PHẢI): BẢNG TỔNG CỘNG, VIETQR & IN ẤN NHANH
         ============================================================ */}
      {React.useMemo(() => (
      <div className={`${showMobileTxDetail ? 'fixed inset-0 z-[110] bg-[#0d1426] flex flex-col gap-2 p-1 pt-4 animate-in slide-in-from-bottom' : 'hidden'} xl:contents`}>
        
      <div className={`w-full p-2 xl:p-4 rounded-2xl bg-[#0d1426]/70 border border-white/5 flex flex-col gap-4 shadow-xl backdrop-blur-md justify-between flex-1 min-h-0 overflow-y-auto scrollbar-thin xl:h-full transition-all duration-300 ${!activeDetail ? 'xl:hidden' : 'xl:w-[28%]'}`}>
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="font-extrabold text-white text-base xl:text-xs tracking-wider uppercase">CHI TIẾT GIAO DỊCH</span>
            <div className="flex items-center gap-2">
              <Button 
                type="primary"
                onClick={() => setShowCopyModal(true)}
                className="bg-cyan-600 hover:bg-cyan-500 border-none font-bold text-[10px] xl:text-xs h-7 xl:h-8 px-2 xl:px-4 !rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-1.5"
                title="Copy thông tin"
              >
                <CopyOutlined /> COPY
              </Button>
              <button 
                onClick={() => setShowMobileTxDetail(false)}
                className="xl:hidden w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white font-bold active:scale-95"
              >
                ✕
              </button>
            </div>
          </div>

          {store.isLoadingDetails ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-4 border-violet-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 animate-spin"></div>
              </div>
              <span className="text-[10px] text-gray-500 font-medium animate-pulse">Đang tải chi tiết...</span>
            </div>
          ) : activeDetail ? (
            <div className="space-y-4">
              {/* Bảng tính toán tiền chi tiết */}
              <div className="p-4 rounded-xl bg-gray-950/80 border border-white/5 space-y-2.5">
                <div className="flex justify-between text-xs text-gray-400 font-bold">
                  <span>DỊCH VỤ:</span>
                  <span className="text-gray-200 uppercase">{store.selectedService?.ten_danh_muc || 'KHÁC'}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-300">
                  <span>SỐ TIỀN GIAO DỊCH:</span>
                  <span className="text-white font-extrabold text-sm">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activeDetail.so_tien_di)}</span>
                </div>
                {parseFloat(activeDetail.phi_dich_vu) > 0 && (
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>PHÍ DỊCH VỤ:</span>
                    <span className="text-orange-400 font-semibold">+{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activeDetail.phi_dich_vu)}</span>
                  </div>
                )}
                {parseFloat(activeDetail.so_tien_giam) > 0 && (
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>GIẢM TRỪ CHO KHÁCH:</span>
                    <span className="text-green-400 font-semibold">-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activeDetail.so_tien_giam)}</span>
                  </div>
                )}
                <div className="border-t border-white/5 my-2 pt-2 flex justify-between text-sm font-extrabold text-violet-400">
                  <span>TỔNG THANH TOÁN:</span>
                  <span className="text-base">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(globalCalculatedTotal)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold mt-2 border-t border-dashed border-white/5 pt-2">
                  <span>TRẠNG THÁI GD:</span>
                  <span>{getStatusTag(activeDetail.id_trang_thai)}</span>
                </div>
              </div>

              {activeQrUrl && (
                <div className="flex flex-col items-center gap-3 w-full">
                  <div 
                    onClick={() => setShowQrModal(true)}
                    className="p-3 bg-white rounded-xl shadow-lg flex flex-col items-center max-w-[200px] mx-auto border border-gray-200 cursor-pointer hover:scale-[1.02] transition-all"
                  >
                    <img 
                      src={activeQrUrl}
                      className="w-[140px] h-[140px] object-contain" 
                      alt="VietQR code preview" 
                    />
                    <span className="text-[8px] text-gray-500 font-extrabold mt-1.5 uppercase tracking-wide">Quét chuyển tiền realtime</span>
                  </div>

                  <div className="flex flex-col gap-1.5 text-center w-full bg-white/5 p-3 rounded-xl border border-white/5">
                    <p className="text-[12px] text-gray-100 font-bold">{activeBank?.ten_dich_vu || store.selectedService?.ten_danh_muc || '—'}</p>
                    <p className="text-[12px] text-violet-300 font-black">{activeHd?.ma_hop_dong || '—'}</p>
                    <p className="text-[12px] text-gray-100 font-bold">{activeHd?.chu_hop_dong || '—'}</p>
                    <p className="text-[12px] text-gray-300 font-semibold"><span className="text-[10px] text-gray-500 mr-1">NỘI DUNG:</span>{activeDetail?.noi_dung || '—'}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 border border-dashed border-white/5 rounded-xl text-xs">
              Vui lòng chọn dòng giao dịch chi tiết ở cột giữa để xem QR, in hóa đơn.
            </div>
          )}

          {/* CỘT 3 - SPEED DIAL (Tính năng & Trạng thái) */}
          {activeDetail && (
            <div className="absolute bottom-4 right-4 z-20 flex gap-3">
              
              {/* FAB Trạng Thái */}
              <div className="relative flex flex-col items-center">
                {showCol3StatusMenu && (() => {
                  const hoanThanhId = store.categories.find(c => (c.ten_danh_muc || '').toLowerCase().includes('hoàn thành'))?.id_danh_muc || 'dm-1';
                  const dangXuLyId = store.categories.find(c => (c.ten_danh_muc || '').toLowerCase().includes('đang xử lý'))?.id_danh_muc || 'dm-4';
                  const huyId = store.categories.find(c => (c.ten_danh_muc || '').toLowerCase().includes('hủy'))?.id_danh_muc || 'dm-3';
                  
                  return (
                    <div className="absolute bottom-[110%] flex flex-col gap-2 mb-2 animate-in slide-in-from-bottom-2 fade-in zoom-in-95 origin-bottom">
                      <button onClick={() => handleChangeStatus(hoanThanhId, 'Hoàn thành')} className="flex items-center gap-3 bg-[#0d1426]/90 backdrop-blur-md border border-green-500/50 px-4 py-2 rounded-full text-green-400 hover:text-white hover:bg-green-600 transition-all shadow-xl font-bold text-xs whitespace-nowrap">
                        Hoàn thành <CheckCircleOutlined />
                      </button>
                      <button onClick={() => handleChangeStatus(dangXuLyId, 'Đang xử lý')} className="flex items-center gap-3 bg-[#0d1426]/90 backdrop-blur-md border border-yellow-500/50 px-4 py-2 rounded-full text-yellow-400 hover:text-white hover:bg-yellow-600 transition-all shadow-xl font-bold text-xs whitespace-nowrap">
                        Đang xử lý <SyncOutlined />
                      </button>
                      <button onClick={handleCancelTransaction} disabled={!canCancelTransaction()} className="flex items-center gap-3 bg-[#0d1426]/90 backdrop-blur-md border border-red-500/50 px-4 py-2 rounded-full text-red-400 hover:text-white hover:bg-red-600 transition-all shadow-xl font-bold text-xs whitespace-nowrap disabled:opacity-50">
                        Hủy GD <span className="font-bold text-base">✕</span>
                      </button>
                    </div>
                  );
                })()}
                {(() => {
                  const statusObj = store.categories.find(c => c.id_danh_muc === activeDetail.id_trang_thai);
                  const statusName = (statusObj?.ten_danh_muc || '').toLowerCase();

                  let statusText = "ĐANG XỬ LÝ";
                  let statusColorClass = "from-yellow-600 to-orange-500 shadow-[0_8px_30px_rgb(234,179,8,0.4)] hover:from-yellow-500 hover:to-orange-400";
                  let StatusIcon = SyncOutlined;
                  
                  if (statusName.includes('hoàn thành') || statusName.includes('thành công')) {
                    statusText = "HOÀN THÀNH";
                    statusColorClass = "from-green-600 to-emerald-500 shadow-[0_8px_30px_rgb(34,197,94,0.4)] hover:from-green-500 hover:to-emerald-400";
                    StatusIcon = CheckCircleOutlined;
                  } else if (statusName.includes('hủy') || statusName.includes('thất bại')) {
                    statusText = "ĐÃ HỦY";
                    statusColorClass = "from-red-600 to-rose-500 shadow-[0_8px_30px_rgb(239,68,68,0.4)] hover:from-red-500 hover:to-rose-400";
                    StatusIcon = () => <span className="font-bold text-base">✕</span>;
                  }

                  return (
                    <button
                      onClick={() => { setShowCol3StatusMenu(!showCol3StatusMenu); setShowCol3Menu(false); }}
                      className={`h-14 px-5 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 ${showCol3StatusMenu ? 'bg-[#131c33] text-white border border-white/20' : `bg-gradient-to-tr ${statusColorClass} text-white`}`}
                    >
                      {showCol3StatusMenu ? <span className="text-xl font-bold rotate-45 transition-transform w-[90px] text-center">✕</span> : (
                        <>
                          <span className="font-black text-xs tracking-wider whitespace-nowrap">{statusText}</span>
                          <StatusIcon className="text-lg font-bold" />
                        </>
                      )}
                    </button>
                  );
                })()}
              </div>

              {/* FAB Tiện Ích */}
              <div className="relative flex flex-col items-center">
                {showCol3Menu && (
                  <div className="absolute bottom-[110%] flex flex-col gap-2 mb-2 animate-in slide-in-from-bottom-2 fade-in zoom-in-95 origin-bottom">
                    <button onClick={() => { setShowCol3Menu(false); setShowQrModal(true); }} className="flex items-center gap-3 bg-[#0d1426]/90 backdrop-blur-md border border-blue-500/50 px-4 py-2 rounded-full text-blue-400 hover:text-white hover:bg-blue-600 transition-all shadow-xl font-bold text-xs whitespace-nowrap">
                      Tạo QR <QrcodeOutlined />
                    </button>
                    <button onClick={() => { setShowCol3Menu(false); handlePrintInvoice(); }} className="flex items-center gap-3 bg-[#0d1426]/90 backdrop-blur-md border border-violet-500/50 px-4 py-2 rounded-full text-violet-400 hover:text-white hover:bg-violet-600 transition-all shadow-xl font-bold text-xs whitespace-nowrap">
                      In hóa đơn <PrinterOutlined />
                    </button>
                    <button onClick={() => { setShowCol3Menu(false); setEditDetailPayload(activeDetail); setShowEditDetailModal(true); }} className="flex items-center gap-3 bg-[#0d1426]/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-gray-300 hover:text-white hover:bg-white/20 transition-all shadow-xl font-bold text-xs whitespace-nowrap">
                      Sửa GD <EditOutlined />
                    </button>
                  </div>
                )}
                <button
                  onClick={() => { setShowCol3Menu(!showCol3Menu); setShowCol3StatusMenu(false); }}
                  className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-[0_8px_30px_rgb(59,130,246,0.5)] transition-all hover:scale-105 active:scale-95 ${showCol3Menu ? 'bg-[#131c33] text-white border border-white/20' : 'bg-gradient-to-tr from-blue-600 to-indigo-500 text-white hover:from-blue-500 hover:to-indigo-400'}`}
                >
                  {showCol3Menu ? <span className="text-xl font-bold rotate-45 transition-transform">✕</span> : <span className="text-2xl font-bold transition-transform">⚙️</span>}
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
      {/* Dong wrapper cot 3 cho desktop */}
      </div>
      ), [showMobileTxDetail, showMobileDetail, activeDetail, activeFile, activeHd, activeBank, activeCust, store.selectedService, showCol3Menu, showCol3StatusMenu, globalCalculatedTotal, activeQrUrl, currentUser, isSuperAdminOrOwner, store.isLoadingDetails, store.isLoadingFiles, store.transactionDetails])}



      {/* Mobile detail section removed because it's now a full screen modal */}

      <Modal
        title={<span className="font-extrabold text-white text-base">✨ LẬP HỒ SƠ QUẢN LÝ DỊCH VỤ MỚI</span>}
        open={showNewFileModal}
        onCancel={() => setShowNewFileModal(false)}
        okText="Tạo hồ sơ"
        cancelText="Đóng"
        onOk={handleCreateServiceFile}
        className="glass-modal"
        width={500}
      >
        <div className="space-y-4 pt-3 text-gray-200">
          
          {/* PHẦN 1: MÃ HỢP ĐỒNG */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-400">1. CHỌN MÃ SỐ HỢP ĐỒNG *</label>
            </div>

            <Modal
              title={<span className="font-extrabold text-white text-base">✨ TẠO MÃ SỐ HỢP ĐỒNG MỚI</span>}
              open={addNewContractInline}
              onCancel={() => setAddNewContractInline(false)}
              onOk={handleCreateContractInline}
              okText="Lưu & Áp dụng"
              cancelText="Hủy"
              className="glass-modal z-[200]"
            >
              <div className="space-y-3 pt-4 text-gray-200">
                <Input 
                  placeholder="Mã số hợp đồng (ví dụ: AURA-2026-X)" 
                  value={newContractPayload.ma_hop_dong} 
                  onChange={e => setNewContractPayload({ ...newContractPayload, ma_hop_dong: e.target.value })}
                  className="bg-white/5 border-white/5 text-gray-300"
                />
                <Input 
                  placeholder="Họ tên chủ hợp đồng" 
                  value={newContractPayload.chu_hop_dong} 
                  onChange={e => setNewContractPayload({ ...newContractPayload, chu_hop_dong: e.target.value })}
                  className="bg-white/5 border-white/5 text-gray-300"
                />
                <SearchableDropdown
                  placeholder="Chọn danh mục dịch vụ..."
                  className="w-full"
                  value={newContractPayload.id_danh_muc_dich_vu || undefined}
                  onChange={v => setNewContractPayload({ ...newContractPayload, id_danh_muc_dich_vu: v })}
                  options={store.banks
                    .filter(b => store.selectedService ? b.id_loai_dich_vu === store.selectedService.id_loai_dich_vu : true)
                    .map(b => ({
                      ...b,
                      displayLabel: b.ten_viet_tat ? `${b.ten_viet_tat} - ${b.ten_dich_vu}` : b.ten_dich_vu
                    }))
                  }
                  labelKey="displayLabel"
                  valueKey="id_danh_muc_dich_vu"
                  iconKey="logo"
                />
                <Input 
                  placeholder="Ghi chú thêm" 
                  value={newContractPayload.ghi_chu} 
                  onChange={e => setNewContractPayload({ ...newContractPayload, ghi_chu: e.target.value })}
                  className="bg-white/5 border-white/5 text-gray-300"
                />
              </div>
            </Modal>

            <SearchableDropdown
              placeholder="Chọn hợp đồng..."
              className="w-full"
              value={newFilePayload.id_ma_hop_dong || undefined}
              onChange={v => setNewFilePayload({ ...newFilePayload, id_ma_hop_dong: v })}
              options={store.ma_hop_dong.filter(h => {
                if (!store.selectedService) return true;
                const bank = store.banks?.find(b => b.id_danh_muc_dich_vu === h.id_danh_muc_dich_vu);
                return !bank || bank.id_loai_dich_vu === store.selectedService.id_loai_dich_vu;
              }).map(h => {
                const bank = store.banks?.find(b => b.id_danh_muc_dich_vu === h.id_danh_muc_dich_vu);
                const prefix = bank?.ten_viet_tat ? `${bank.ten_viet_tat} - ` : '';
                return {
                  ...h,
                  displayLabel: `${prefix}${h.ma_hop_dong}`,
                  logo: bank?.logo || ''
                };
              })}
              labelKey="displayLabel"
              valueKey="id_ma_hop_dong"
              subLabelKey="chu_hop_dong"
              iconKey="logo"
              onAddNew={() => {
                const defaultBank = store.banks?.find(b => store.selectedService ? b.id_loai_dich_vu === store.selectedService.id_loai_dich_vu : true);
                setNewContractPayload({ ma_hop_dong: '', chu_hop_dong: '', ghi_chu: '', id_danh_muc_dich_vu: defaultBank?.id_danh_muc_dich_vu });
                setAddNewContractInline(true);
              }}
              addNewText="+ Thêm hợp đồng mới"
            />
          </div>

          {/* PHẦN 2: KHÁCH HÀNG */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-400">2. CHỌN KHÁCH HÀNG CRM *</label>
            </div>

            <Modal
              title={<span className="font-extrabold text-white text-base">✨ TẠO MỚI KHÁCH HÀNG CRM</span>}
              open={addNewCustInline}
              onCancel={() => setAddNewCustInline(false)}
              onOk={handleCreateCustInline}
              okText="Lưu & Áp dụng"
              cancelText="Hủy"
              className="glass-modal z-[200]"
            >
              <div className="space-y-3 pt-4 text-gray-200">
                <Input 
                  placeholder="Họ & Tên khách hàng *" 
                  value={newCustPayload.ho_va_ten} 
                  onChange={e => setNewCustPayload({ ...newCustPayload, ho_va_ten: e.target.value })}
                  className="bg-white/5 border-white/5 text-gray-300"
                />
                <Input 
                  placeholder="Số điện thoại di động (Tuỳ chọn)" 
                  value={newCustPayload.so_dien_thoai} 
                  onChange={e => setNewCustPayload({ ...newCustPayload, so_dien_thoai: e.target.value })}
                  className="bg-white/5 border-white/5 text-gray-300"
                />
                <Input 
                  placeholder="Số căn cước công dân (CCCD)" 
                  value={newCustPayload.so_cccd} 
                  onChange={e => setNewCustPayload({ ...newCustPayload, so_cccd: e.target.value })}
                  className="bg-white/5 border-white/5 text-gray-300"
                />
                <Input 
                  placeholder="Địa chỉ cư trú" 
                  value={newCustPayload.dia_chi} 
                  onChange={e => setNewCustPayload({ ...newCustPayload, dia_chi: e.target.value })}
                  className="bg-white/5 border-white/5 text-gray-300"
                />
              </div>
            </Modal>

            <SearchableDropdown
              placeholder="Chọn khách hàng từ CRM..."
              className="w-full"
              value={newFilePayload.id_khach_hang || undefined}
              onChange={v => setNewFilePayload({ ...newFilePayload, id_khach_hang: v })}
              options={store.customers}
              labelKey="ho_va_ten"
              valueKey="id_khach_hang"
              subLabelKey="so_dien_thoai"
              iconKey="anh_khach_hang"
              onAddNew={() => setAddNewCustInline(true)}
              addNewText="+ Tạo mới khách hàng"
            />
          </div>

          {/* PHẦN 2.5: LOẠI HỢP ĐỒNG */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400">CHỌN LOẠI HỢP ĐỒNG *</label>
            <SearchableDropdown
              placeholder="Chọn phân loại hợp đồng (VIP, Tiêu chuẩn...)"
              className="w-full"
              value={newFilePayload.id_loai_hop_dong || undefined}
              onChange={v => setNewFilePayload({ ...newFilePayload, id_loai_hop_dong: v })}
              options={store.loaiHopDongs || []}
              labelKey="ten_loai"
              valueKey="id_loai_hop_dong"
            />
          </div>

          {/* PHAN 3: NOI DUNG MO TA */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400">3. MO TA HO SO DICH VU</label>
            <Input.TextArea 
              placeholder="Nhap noi dung mo ta, yeu cau ban dau cua khach hang..." 
              value={newFilePayload.noi_dung}
              onChange={e => setNewFilePayload({ ...newFilePayload, noi_dung: e.target.value })}
              className="bg-white/5 border-white/5 text-gray-300 rounded"
              rows={2}
            />
          </div>
        </div>
      </Modal>

      {/* ============================================================
         MODAL 2: SUA NHANH THONG TIN KHACH HANG CRM
         ============================================================ */}
      <Modal
        title={<span className="font-extrabold text-white text-base">✏️ CAP NHAT HO SO KHACH HANG</span>}
        open={showEditCustModal}
        onCancel={() => setShowEditCustModal(false)}
        okText="Luu thay doi"
        cancelText="Huy"
        onOk={handleSaveEditCust}
        className="glass-modal"
      >
        <div className="space-y-3 pt-3">
          {/* Anh dai dien */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400">Anh dai dien</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 border-2 border-violet-500/30 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
                {editCustPayload.anh_khach_hang ? (
                  <img
                    src={editCustPayload.anh_khach_hang}
                    alt="avatar"
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span className="text-white font-black text-xl">
                    {editCustPayload.ho_va_ten?.[0] || 'K'}
                  </span>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <Input
                  placeholder="Dan link anh URL..."
                  value={editCustPayload.anh_khach_hang || ''}
                  onChange={e => setEditCustPayload({ ...editCustPayload, anh_khach_hang: e.target.value })}
                  className="bg-white/5 border-white/5 text-gray-300 text-xs"
                  prefix={<span className="text-gray-500 text-xs">🔗</span>}
                />
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const img = new Image();
                      img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;
                        const maxDim = 800; // Giới hạn kích thước tối đa
                        if (width > height && width > maxDim) {
                          height *= maxDim / width;
                          width = maxDim;
                        } else if (height > maxDim) {
                          width *= maxDim / height;
                          height = maxDim;
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7); // Nén JPEG 70%
                        setEditCustPayload({ ...editCustPayload, anh_khach_hang: compressedBase64 });
                        URL.revokeObjectURL(img.src);
                      };
                      img.src = URL.createObjectURL(f);
                    }}
                  />
                  <Button size="small" icon={<UserOutlined />} className="w-full bg-white/5 border-white/10 text-gray-400 text-xs">
                    Chon anh tu may tinh
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400">Ho va ten *</label>
            <Input value={editCustPayload.ho_va_ten || ''} onChange={e => setEditCustPayload({ ...editCustPayload, ho_va_ten: e.target.value })} className="bg-white/5 border-white/5 text-gray-300" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400">So dien thoai</label>
            <Input value={editCustPayload.so_dien_thoai || ''} onChange={e => setEditCustPayload({ ...editCustPayload, so_dien_thoai: e.target.value })} className="bg-white/5 border-white/5 text-gray-300" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400">So CCCD</label>
            <Input value={editCustPayload.so_cccd || ''} onChange={e => setEditCustPayload({ ...editCustPayload, so_cccd: e.target.value })} className="bg-white/5 border-white/5 text-gray-300" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400">Email</label>
            <Input value={editCustPayload.email || ''} onChange={e => setEditCustPayload({ ...editCustPayload, email: e.target.value })} className="bg-white/5 border-white/5 text-gray-300" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400">Dia chi</label>
            <Input value={editCustPayload.dia_chi || ''} onChange={e => setEditCustPayload({ ...editCustPayload, dia_chi: e.target.value })} className="bg-white/5 border-white/5 text-gray-300" />
          </div>
        </div>
      </Modal>

      {/* ============================================================
         MODAL 3: XEM CHI TIẾT LỊCH SỬ KHÁCH HÀNG CRM
         ============================================================ */}
      <Modal
        title={<span className="font-extrabold text-white text-base">📊 LỊCH SỬ GIAO DỊCH TÍCH LŨY KHÁCH HÀNG</span>}
        open={showCustHistoryModal}
        onCancel={() => setShowCustHistoryModal(false)}
        footer={[<Button key="close" onClick={() => setShowCustHistoryModal(false)}>Đóng</Button>]}
        className="glass-modal"
      >
        {activeCust && (() => {
          const stats = getCustomerStats(activeCust.id_khach_hang);
          return (
            <div className="space-y-4 pt-3 text-gray-200">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Tổng số giao dịch</span>
                  <h2 className="text-2xl font-black text-violet-400 mt-1">{stats.txsCount} lần</h2>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Doanh số tích lũy</span>
                  <h2 className="text-lg font-black text-green-400 mt-1.5">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalSpent)}
                  </h2>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Mã hợp đồng đã liên kết ({stats.contractsList.length}):</span>
                {stats.contractsList.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">Chưa liên kết mã hợp đồng nào.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {stats.contractsList.map(code => (
                      <Tag key={code} color="red" className="font-extrabold text-xs px-2.5 py-0.5 rounded border-none bg-red-500/10 text-red-400">
                        {code}
                      </Tag>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 border-t border-white/5 pt-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Thông tin hồ sơ CRM:</span>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <p><strong>Ngày tham gia:</strong> {new Date(activeCust.ngay_tao).toLocaleDateString('vi-VN')}</p>
                  <p><strong>Lần giao dịch cuối:</strong> {activeCust.lan_giao_dich_cuoi ? new Date(activeCust.lan_giao_dich_cuoi).toLocaleString('vi-VN') : 'Chưa giao dịch'}</p>
                  <p><strong>Địa chỉ:</strong> {activeCust.dia_chi || 'Chưa cập nhật'}</p>
                  <p><strong>Số CCCD:</strong> {activeCust.so_cccd || 'Chưa cập nhật'}</p>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ============================================================
         MODAL 6: CHỈNH SỬA CHI TIẾT HỒ SƠ
         ============================================================ */}
      <Modal
        title={<span className="font-extrabold text-white text-base">✏️ CHỈNH SỬA CHI TIẾT HỒ SƠ</span>}
        open={showEditFileModal}
        onCancel={() => setShowEditFileModal(false)}
        footer={null}
        className="glass-modal"
      >
        <div className="p-4 border border-white/5 rounded-xl bg-white/[0.01] space-y-4">
          <div className="flex flex-col gap-1.5">
            <Modal
              title={<span className="font-extrabold text-white text-base">✨ TẠO MỚI KHÁCH HÀNG CRM</span>}
              open={editAddNewCustInline}
              onCancel={() => setEditAddNewCustInline(false)}
              onOk={handleEditCreateCustInline}
              okText="Lưu & Áp dụng"
              cancelText="Hủy"
              className="glass-modal z-[200]"
            >
              <div className="space-y-3 pt-4 text-gray-200">
                <Input placeholder="Họ & Tên khách hàng *" value={newCustPayload.ho_va_ten} onChange={e => setNewCustPayload({ ...newCustPayload, ho_va_ten: e.target.value })} className="bg-white/5 border-white/5 text-gray-300" />
                <Input placeholder="Số điện thoại di động (Tuỳ chọn)" value={newCustPayload.so_dien_thoai} onChange={e => setNewCustPayload({ ...newCustPayload, so_dien_thoai: e.target.value })} className="bg-white/5 border-white/5 text-gray-300" />
                <Input placeholder="Số căn cước công dân (CCCD)" value={newCustPayload.so_cccd} onChange={e => setNewCustPayload({ ...newCustPayload, so_cccd: e.target.value })} className="bg-white/5 border-white/5 text-gray-300" />
                <Input placeholder="Địa chỉ cư trú" value={newCustPayload.dia_chi} onChange={e => setNewCustPayload({ ...newCustPayload, dia_chi: e.target.value })} className="bg-white/5 border-white/5 text-gray-300" />
              </div>
            </Modal>

            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-400">Khách Hàng</label>
            </div>
            <SearchableDropdown
              className="w-full"
              options={store.customers || []}
              value={editFilePayload.id_khach_hang || undefined}
              onChange={v => setEditFilePayload({...editFilePayload, id_khach_hang: v})}
              placeholder="Chọn khách hàng"
              labelKey="ho_va_ten"
              valueKey="id_khach_hang"
              subLabelKey="so_dien_thoai"
              iconKey="anh_khach_hang"
              onAddNew={() => setEditAddNewCustInline(true)}
              addNewText="Tạo Khách Hàng Mới"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Modal
              title={<span className="font-extrabold text-white text-base">✨ TẠO MÃ SỐ HỢP ĐỒNG MỚI</span>}
              open={editAddNewContractInline}
              onCancel={() => setEditAddNewContractInline(false)}
              onOk={handleEditCreateContractInline}
              okText="Lưu & Áp dụng"
              cancelText="Hủy"
              className="glass-modal z-[200]"
            >
              <div className="space-y-3 pt-4 text-gray-200">
                <Input placeholder="Mã số hợp đồng (ví dụ: AURA-2026-X)" value={newContractPayload.ma_hop_dong} onChange={e => setNewContractPayload({ ...newContractPayload, ma_hop_dong: e.target.value })} className="bg-white/5 border-white/5 text-gray-300" />
                <Input placeholder="Họ tên chủ hợp đồng" value={newContractPayload.chu_hop_dong} onChange={e => setNewContractPayload({ ...newContractPayload, chu_hop_dong: e.target.value })} className="bg-white/5 border-white/5 text-gray-300" />
                <SearchableDropdown
                  placeholder="Chọn danh mục dịch vụ..."
                  className="w-full"
                  value={newContractPayload.id_danh_muc_dich_vu || undefined}
                  onChange={v => setNewContractPayload({ ...newContractPayload, id_danh_muc_dich_vu: v })}
                  options={store.banks
                    .filter(b => store.selectedService ? b.id_loai_dich_vu === store.selectedService.id_loai_dich_vu : true)
                    .map(b => ({
                      ...b,
                      displayLabel: b.ten_viet_tat ? `${b.ten_viet_tat} - ${b.ten_dich_vu}` : b.ten_dich_vu
                    }))
                  }
                  labelKey="displayLabel"
                  valueKey="id_danh_muc_dich_vu"
                  iconKey="logo"
                />
                <Input placeholder="Ghi chú thêm" value={newContractPayload.ghi_chu} onChange={e => setNewContractPayload({ ...newContractPayload, ghi_chu: e.target.value })} className="bg-white/5 border-white/5 text-gray-300" />
              </div>
            </Modal>

            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-400">Mã Số Hợp Đồng</label>
            </div>
            <SearchableDropdown
              className="w-full"
              options={(store.ma_hop_dong || []).map(h => {
                const bank = store.banks?.find(b => b.id_danh_muc_dich_vu === h.id_danh_muc_dich_vu);
                return {
                  ...h,
                  logo: bank?.logo || ''
                };
              })}
              value={editFilePayload.id_ma_hop_dong || undefined}
              onChange={v => setEditFilePayload({...editFilePayload, id_ma_hop_dong: v})}
              placeholder="Chọn mã số hợp đồng"
              labelKey="ma_hop_dong"
              valueKey="id_ma_hop_dong"
              subLabelKey="chu_hop_dong"
              iconKey="logo"
              onAddNew={() => {
                const defaultBank = store.banks?.find(b => store.selectedService ? b.id_loai_dich_vu === store.selectedService.id_loai_dich_vu : true);
                setNewContractPayload({ ma_hop_dong: '', chu_hop_dong: '', ghi_chu: '', id_danh_muc_dich_vu: defaultBank?.id_danh_muc_dich_vu });
                setEditAddNewContractInline(true);
              }}
              addNewText="Tạo Hợp Đồng Mới"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400">Nội dung hồ sơ</label>
            <Input 
              value={editFilePayload.noi_dung || ''} 
              onChange={e => setEditFilePayload({...editFilePayload, noi_dung: e.target.value})}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400">Loại Hợp Đồng</label>
            <SearchableDropdown
              className="w-full"
              value={editFilePayload.id_loai_hop_dong || undefined}
              onChange={v => setEditFilePayload({...editFilePayload, id_loai_hop_dong: v})}
              placeholder="Chọn phân loại hợp đồng"
              options={store.loaiHopDongs || []}
              labelKey="ten_loai"
              valueKey="id_loai_hop_dong"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400">Ghi chú</label>
            <Input.TextArea 
              value={editFilePayload.ghi_chu || ''} 
              onChange={e => setEditFilePayload({...editFilePayload, ghi_chu: e.target.value})}
              className="bg-white/5 border-white/10 text-white"
              rows={3}
            />
          </div>
          <Button 
            type="primary" 
            onClick={handleEditFileSubmit} 
            className="w-full bg-violet-600 border-none font-bold mt-2"
          >
            Lưu thay đổi
          </Button>
        </div>
      </Modal>

      {/* ============================================================
         MODAL 4: QUÉT MÃ QR VIETQR PHÁT SINH
         ============================================================ */}
      <Modal
        title={<span className="font-extrabold text-white text-base">📲 QUÉT MÃ QR VIETQR CHUYỂN TIỀN</span>}
        open={showQrModal}
        onCancel={() => setShowQrModal(false)}
        footer={[<Button key="close" onClick={() => setShowQrModal(false)}>Đóng</Button>]}
        className="glass-modal"
      >
        {activeDetail && activeQrUrl && (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <p className="text-sm font-semibold text-gray-300 mb-4">Sử dụng App Ngân hàng bất kỳ để quét mã thanh toán tự động</p>
            <div className="p-4 bg-white rounded-2xl shadow-xl border border-gray-100 max-w-[280px]">
              <img 
                src={activeQrUrl} 
                className="w-[240px] h-[240px] object-contain bg-white" 
                alt="VietQR code large" 
              />
            </div>
            <h3 className="text-2xl font-black text-violet-400 mt-6 tracking-wide">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activeDetail.so_tien_di)}
            </h3>
            <div className="flex flex-col gap-1.5 mt-4 text-center w-full bg-white/5 p-3 rounded-xl border border-white/5">
              <p className="text-[13px] text-gray-100 font-bold">{activeBank?.ten_dich_vu || store.selectedService?.ten_danh_muc || '—'}</p>
              <p className="text-[14px] text-violet-300 font-black tracking-wide">{activeHd?.ma_hop_dong || '—'}</p>
              <p className="text-[13px] text-gray-100 font-bold">{activeHd?.chu_hop_dong || '—'}</p>
              <p className="text-[12px] text-gray-300 font-semibold"><span className="text-[10px] text-gray-500 mr-1">NỘI DUNG:</span>{activeDetail?.noi_dung || '—'}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 5: Đã thay thế bằng in trực tiếp - không còn modal xem trước */}

      {/* POS TRANSACTION DRAWER */}
      {/* ============================================================
         MODAL 7: CHỈNH SỬA MÃ HỢP ĐỒNG
         ============================================================ */}
      <Modal
        title={<span className="font-extrabold text-white text-base">✏️ CHỈNH SỬA MÃ HỢP ĐỒNG</span>}
        open={showEditContractModal}
        onCancel={() => setShowEditContractModal(false)}
        footer={null}
        className="glass-modal"
      >
        <div className="p-4 border border-white/5 rounded-xl bg-white/[0.01] space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400">Mã hợp đồng</label>
            <Input 
              value={editContractPayload.ma_hop_dong || ''} 
              onChange={e => setEditContractPayload({...editContractPayload, ma_hop_dong: e.target.value})}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400">Chủ hợp đồng</label>
            <Input 
              value={editContractPayload.chu_hop_dong || ''} 
              onChange={e => setEditContractPayload({...editContractPayload, chu_hop_dong: e.target.value})}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400">Phân hệ dịch vụ / Ngân hàng</label>
            <SearchableDropdown
              className="w-full"
              placeholder="Chọn ngân hàng / nhà mạng"
              value={editContractPayload.id_danh_muc_dich_vu || undefined}
              onChange={v => setEditContractPayload({...editContractPayload, id_danh_muc_dich_vu: v})}
              options={store.banks?.map(b => ({
                ...b,
                displayLabel: b.ten_viet_tat ? `${b.ten_viet_tat} - ${b.ten_dich_vu}` : b.ten_dich_vu
              })) || []}
              labelKey="displayLabel"
              valueKey="id_danh_muc_dich_vu"
              iconKey="logo"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400">Ghi chú thêm</label>
            <Input.TextArea 
              value={editContractPayload.ghi_chu || ''} 
              onChange={e => setEditContractPayload({...editContractPayload, ghi_chu: e.target.value})}
              className="bg-white/5 border-white/10 text-white"
              rows={2}
            />
          </div>
          <Button 
            type="primary" 
            onClick={handleEditContractSubmit} 
            className="w-full bg-violet-600 border-none font-bold mt-2"
          >
            Lưu thay đổi
          </Button>
        </div>
      </Modal>

      {/* ============================================================
         MODAL 8: SỬA CHI TIẾT GIAO DỊCH
         ============================================================ */}
      <Modal
        title={<span className="font-extrabold text-white text-base">✏️ CHỈNH SỬA GIAO DỊCH</span>}
        open={showEditDetailModal}
        onCancel={() => setShowEditDetailModal(false)}
        footer={null}
        width={600}
        className="glass-modal"
      >
        <div className="p-4 border border-white/5 rounded-xl bg-[#0d1426] space-y-4">
          <MoneyTransferForm value={editDetailPayload} onChange={setEditDetailPayload} />
          <Button 
            type="primary" 
            onClick={async () => {
              if (!editDetailPayload.so_tien || editDetailPayload.so_tien <= 0) {
                message.error('Vui lòng nhập số tiền hợp lệ!');
                return;
              }
              try {
                const dataToSave = { ...editDetailPayload };
                const { error } = await supabase
                  .from('chi_tiet_giao_dich')
                  .update(dataToSave)
                  .eq('id_chi_tiet_giao_dich', editDetailPayload.id_chi_tiet_giao_dich);
                
                if (error) throw error;
                message.success('Cập nhật giao dịch thành công!');
                setShowEditDetailModal(false);
                if (activeFile) {
                  await store.fetchTransactionDetails(activeFile.id_ho_so_dich_vu);
                }
              } catch (err) {
                message.error('Lỗi khi cập nhật giao dịch: ' + err.message);
              }
            }} 
            className="w-full bg-violet-600 border-none font-bold mt-2 h-10"
          >
            Lưu thay đổi
          </Button>
        </div>
      </Modal>

      <TransactionDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Modal Chi tiết Khách hàng */}
      <Modal
        title={
          <span className="font-black text-violet-400 uppercase tracking-wider text-sm flex items-center gap-2">
            <UserOutlined /> THÔNG TIN KHÁCH HÀNG
          </span>
        }
        open={showCustomerModal}
        onCancel={() => setShowCustomerModal(false)}
        footer={null}
        centered
        wrapClassName="dark-modal"
        width={400}
      >
        <div className="flex flex-col items-center pt-4 pb-2">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 p-1 mb-4 shadow-xl border border-violet-500/20">
            <div className="w-full h-full rounded-full bg-[#0d1426] flex items-center justify-center overflow-hidden">
              {activeCust?.anh_khach_hang ? (
                <img src={activeCust.anh_khach_hang} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl text-white font-bold">{activeCust?.ho_va_ten?.[0] || 'K'}</span>
              )}
            </div>
          </div>
          
          <h3 className="text-lg font-black text-white text-center mb-1">{activeCust?.ho_va_ten || 'Khách lẻ'}</h3>
          <p className="text-violet-400 font-bold text-sm tracking-wide mb-3">{activeCust?.so_dien_thoai || 'Không có SĐT'}</p>
          
          <Tag color="purple" className="px-3 py-1 text-xs font-bold border-none rounded mb-6">
            {activeCust?.id_level === 'dm-lvl-vip' ? 'Hạng: VIP VÀNG' : 'Hạng: THÀNH VIÊN'}
          </Tag>

          <div className="w-full bg-white/5 rounded-xl p-4 border border-white/5 space-y-3">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-gray-400 text-xs">Mã KH:</span>
              <span className="text-gray-200 text-xs font-mono">{activeCust?.id_khach_hang?.split('-')?.pop() || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-gray-400 text-xs">CCCD/CMND:</span>
              <span className="text-gray-200 text-xs font-semibold">{activeCust?.so_cccd || '--'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-gray-400 text-xs">Email:</span>
              <span className="text-gray-200 text-xs font-semibold">{activeCust?.email || '--'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs">Địa chỉ:</span>
              <span className="text-gray-200 text-xs font-semibold text-right max-w-[200px] truncate">{activeCust?.dia_chi || '--'}</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Copy Thông Tin */}
      <Modal
        title={
          <span className="font-black text-violet-400 uppercase tracking-wider text-sm flex items-center gap-2">
            <CopyOutlined /> COPY THÔNG TIN
          </span>
        }
        open={showCopyModal}
        onCancel={() => setShowCopyModal(false)}
        footer={null}
        centered
        wrapClassName="dark-modal"
        width={400}
      >
        <div className="flex flex-col space-y-4 pt-4 pb-2">
          {(() => {
            const activeFile = store.selectedServiceFile;
            const currentHd = activeFile ? (store.ma_hop_dong.find(h => h.id_ma_hop_dong === activeFile.id_ma_hop_dong) || activeFile.ma_hop_dong) : null;
            return (
              <>
                <Checkbox 
                  checked={copyOptions.serviceName} 
                  onChange={(e) => setCopyOptions(prev => ({ ...prev, serviceName: e.target.checked }))}
                  className="text-white font-semibold"
                >
                  1. Tên danh mục dịch vụ <span className="text-gray-400 font-normal ml-1">({store.selectedService?.ten_danh_muc || 'N/A'})</span>
                </Checkbox>
                <Checkbox 
                  checked={copyOptions.contractId} 
                  onChange={(e) => setCopyOptions(prev => ({ ...prev, contractId: e.target.checked }))}
                  className="text-white font-semibold"
                >
                  2. Mã hợp đồng <span className="text-gray-400 font-normal ml-1">({currentHd?.ma_hop_dong || 'N/A'})</span>
                </Checkbox>
                <Checkbox 
                  checked={copyOptions.contractOwner} 
                  onChange={(e) => setCopyOptions(prev => ({ ...prev, contractOwner: e.target.checked }))}
                  className="text-white font-semibold"
                >
                  3. Chủ hợp đồng <span className="text-gray-400 font-normal ml-1">({currentHd?.chu_hop_dong || 'N/A'})</span>
                </Checkbox>
              </>
            );
          })()}

          <Button 
            type="primary" 
            onClick={handleCopyData}
            className="w-full bg-violet-600 border-none font-bold mt-4 h-10 hover:bg-violet-500 transition-colors"
            icon={<CopyOutlined />}
          >
            Copy dữ liệu đã chọn
          </Button>
        </div>
      </Modal>
    </div>
  );
}
