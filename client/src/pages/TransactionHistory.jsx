// Force HMR
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Select, DatePicker, Empty, Table, Tag, Modal, Tooltip, Button, Drawer, App as AntdApp } from 'antd';
import { FilterOutlined, CreditCardOutlined, QrcodeOutlined, EditOutlined, StopOutlined, DeleteOutlined, FolderOpenOutlined } from '@ant-design/icons';
import useAppStore from '../store/useAppStore';
import { supabase } from '../lib/supabaseClient';
import MoneyTransferForm from '../components/MoneyTransferForm';

const { Option } = Select;
const { RangePicker } = DatePicker;

const DATE_RANGES = {
  ALL: 'all',
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  THIS_WEEK: 'this_week',
  LAST_WEEK: 'last_week',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_YEAR: 'this_year',
  LAST_YEAR: 'last_year',
  CUSTOM: 'custom'
};

function getDateRange(type) {
  const now = new Date();
  const startOfDay = (d) => { const r = new Date(d); r.setHours(0, 0, 0, 0); return r; };
  const endOfDay = (d) => { const r = new Date(d); r.setHours(23, 59, 59, 999); return r; };

  switch (type) {
    case DATE_RANGES.TODAY:
      return [startOfDay(now), endOfDay(now)];
    case DATE_RANGES.YESTERDAY: {
      const d = new Date(now); d.setDate(d.getDate() - 1);
      return [startOfDay(d), endOfDay(d)];
    }
    case DATE_RANGES.THIS_WEEK: {
      const d = new Date(now);
      const day = d.getDay() || 7;
      d.setDate(d.getDate() - day + 1);
      return [startOfDay(d), endOfDay(now)];
    }
    case DATE_RANGES.LAST_WEEK: {
      const d = new Date(now);
      const day = d.getDay() || 7;
      const startThis = new Date(d); startThis.setDate(d.getDate() - day + 1);
      const end = new Date(startThis); end.setDate(startThis.getDate() - 1);
      const start = new Date(end); start.setDate(end.getDate() - 6);
      return [startOfDay(start), endOfDay(end)];
    }
    case DATE_RANGES.THIS_MONTH: {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return [startOfDay(start), endOfDay(end)];
    }
    case DATE_RANGES.LAST_MONTH: {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return [startOfDay(start), endOfDay(end)];
    }
    case DATE_RANGES.THIS_YEAR: {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
      return [startOfDay(start), endOfDay(end)];
    }
    case DATE_RANGES.LAST_YEAR: {
      const start = new Date(now.getFullYear() - 1, 0, 1);
      const end = new Date(now.getFullYear() - 1, 11, 31);
      return [startOfDay(start), endOfDay(end)];
    }
    default:
      return null;
  }
}

function isInRange(txDate, range) {
  const d = new Date(txDate);
  return d >= range[0] && d <= range[1];
}

function formatCurrency(val) {
  if (!val && val !== 0) return '0 ₫';
  return Number(val).toLocaleString('vi-VN') + ' ₫';
}

export default function TransactionHistory() {
  const store = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleGoToWorkspace = (record) => {
    if (record.file) {
      store.setSelectedServiceFile(record.file);
      navigate('/');
    } else {
      message.error('Không tìm thấy thông tin hồ sơ gốc!');
    }
  };

  const [filters, setFilters] = useState({
    nhomMenuId: null,
    loaiDichVuId: null,
    danhMucId: null,
    khachHangId: null,
    trangThaiId: null,
    dateRangeType: DATE_RANGES.TODAY,
    customDateRange: null
  });

  const [displayCount, setDisplayCount] = useState(20);
  const { message } = AntdApp.useApp();

  // States cho các chức năng quản lý
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeQrUrl, setActiveQrUrl] = useState('');
  const [activeDetail, setActiveDetail] = useState(null);

  const [showEditDetailModal, setShowEditDetailModal] = useState(false);
  const [editDetailPayload, setEditDetailPayload] = useState(null);

  // Modal bộ lọc nâng cao
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [mobileFilterType, setMobileFilterType] = useState(null); // 'time' | 'status' | 'advanced' | null

  // Khóa cuộn body toàn trang để dùng cuộn nội bộ
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Reset số lượng hiển thị khi đổi bộ lọc
  useEffect(() => {
    setDisplayCount(20);
  }, [filters]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id_dich_vu = params.get('id_dich_vu');
    if (id_dich_vu) {
      setFilters(prev => ({ ...prev, loaiDichVuId: id_dich_vu }));
    }
  }, [location.search]);

  // Lấy dữ liệu lịch sử
  const fetchHistory = () => {
    let fromDate = null;
    let toDate = null;

    if (filters.dateRangeType !== DATE_RANGES.ALL) {
      if (filters.dateRangeType === DATE_RANGES.CUSTOM && filters.customDateRange) {
        fromDate = filters.customDateRange[0]?.toDate?.() || new Date(filters.customDateRange[0]);
        toDate = filters.customDateRange[1]?.toDate?.() || new Date(filters.customDateRange[1]);
        if (fromDate) fromDate.setHours(0, 0, 0, 0);
        if (toDate) toDate.setHours(23, 59, 59, 999);
      } else if (filters.dateRangeType !== DATE_RANGES.CUSTOM) {
        const range = getDateRange(filters.dateRangeType);
        if (range) {
          fromDate = range[0];
          toDate = range[1];
        }
      }
    }
    if (filters.dateRangeType === DATE_RANGES.CUSTOM && !filters.customDateRange) return;
    store.fetchHistoryTransactions(fromDate, toDate);
  };

  useEffect(() => {
    fetchHistory();
  }, [filters.dateRangeType, filters.customDateRange]);

  // Handlers cho chức năng Quản lý
  const handleStatusChange = async (record, newStatusId) => {
    try {
      await store.updateTransactionStatus(record.tx.id_chi_tiet_giao_dich, newStatusId);
      message.success('Đổi trạng thái thành công!');
      fetchHistory(); // Tải lại danh sách
    } catch (err) {
      message.error('Lỗi khi đổi trạng thái: ' + err.message);
    }
  };

  const handleShowQR = (record) => {
    const bank = record.bank;
    const contract = record.contract;
    const customer = record.customer;
    
    if (!contract || !contract.ma_hop_dong) {
      message.error('Không có thông tin hợp đồng để tạo mã QR');
      return;
    }

    const binCode = bank?.ma_bin || '970422'; // fallback về MBBank
    if (binCode === '000000') {
      message.error('Ngân hàng này không hỗ trợ tạo mã QR');
      return;
    }

    const amount = record.tx.so_tien_di || 0;
    const noiDung = record.tx.noi_dung || '';
    const accountName = customer?.ho_va_ten || 'AURA CUSTOMER';

    const url = `https://api.vietqr.io/image/${binCode}-${contract.ma_hop_dong}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(noiDung)}&accountName=${encodeURIComponent(accountName)}`;
    
    setActiveQrUrl(url);
    setActiveDetail(record);
    setShowQrModal(true);
  };

  const handleEdit = (record) => {
    setEditDetailPayload({ ...record.tx });
    setShowEditDetailModal(true);
  };

  const handleOpenFile = (record) => {
    const file = store.allServiceFiles?.find(f => f.id_ho_so_dich_vu === record.tx.id_ho_so_dich_vu);
    if (file) {
      store.selectServiceFile(file);
      navigate('/');
    } else {
      message.error('Không tìm thấy thông tin hồ sơ gốc!');
    }
  };

  const handleCancel = (record) => {
    const huyId = store.categories.find(c => (c.ten_danh_muc || '').toLowerCase().includes('hủy'))?.id_danh_muc || 'dm-3';
    Modal.confirm({
      title: 'Xác nhận Hủy Giao Dịch?',
      content: 'Bạn có chắc chắn muốn chuyển trạng thái giao dịch này thành THẤT BẠI/HỦY?',
      okText: 'Hủy Giao Dịch',
      okType: 'danger',
      cancelText: 'Đóng',
      onOk: () => handleStatusChange(record, huyId)
    });
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Xóa giao dịch này?',
      content: 'Hành động này sẽ xóa vĩnh viễn giao dịch khỏi hệ thống và không thể hoàn tác. Bạn có chắc chắn?',
      okText: 'Xóa Giao Dịch',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const { error } = await supabase.from('chi_tiet_giao_dich').delete().eq('id_chi_tiet_giao_dich', record.tx.id_chi_tiet_giao_dich);
          if (error) throw error;
          message.success('Đã xóa giao dịch thành công!');
          fetchHistory(); // Tải lại danh sách
        } catch (err) {
          message.error('Lỗi khi xóa: ' + err.message);
        }
      }
    });
  };

  // Danh sách Loại Dịch Vụ lọc theo Nhóm Menu đã chọn
  const filteredServices = useMemo(() => {
    if (!filters.nhomMenuId) return store.services || [];
    return (store.services || []).filter(s => s.id_nhom === filters.nhomMenuId);
  }, [store.services, filters.nhomMenuId]);

  // Danh sách Danh mục (ngân hàng) lọc theo Loại Dịch Vụ đã chọn
  const filteredBanks = useMemo(() => {
    if (!filters.loaiDichVuId) return store.banks || [];
    return (store.banks || []).filter(b => b.id_loai_dich_vu === filters.loaiDichVuId);
  }, [store.banks, filters.loaiDichVuId]);

  // Lọc danh sách giao dịch
  const filteredTransactions = useMemo(() => {
    const txs = store.historyTransactions || [];
    const files = store.historyFiles || [];
    const contracts = store.ma_hop_dong || [];
    const customers = store.customers || [];
    const banks = store.banks || [];
    const services = store.services || [];

    const result = [];

    for (const tx of txs) {
      const file = files.find(f => f.id_ho_so_dich_vu === tx.id_ho_so_dich_vu);
      if (!file) continue;

      const contract = contracts.find(c => c.id_ma_hop_dong === file.id_ma_hop_dong) || file.ma_hop_dong;
      const customer = customers.find(c => c.id_khach_hang === file.id_khach_hang);
      const bank = banks.find(b => b.id_danh_muc_dich_vu === contract?.id_danh_muc_dich_vu);
      const service = services.find(s => s.id_loai_dich_vu === file.id_loai_dich_vu);

      // Lọc Nhóm Menu (dùng id_nhom là PK của sys_nhom_menu)
      if (filters.nhomMenuId && service?.id_nhom !== filters.nhomMenuId) continue;
      // Lọc Loại Dịch Vụ
      if (filters.loaiDichVuId && service?.id_loai_dich_vu !== filters.loaiDichVuId) continue;
      // Lọc Danh mục (NH/Nhà mạng) - dùng id_danh_muc_dich_vu từ bank của file
      if (filters.danhMucId && bank?.id_danh_muc_dich_vu !== filters.danhMucId) continue;
      // Lọc Khách hàng
      if (filters.khachHangId && customer?.id_khach_hang !== filters.khachHangId) continue;
      // Lọc Trạng thái
      if (filters.trangThaiId && tx.id_trang_thai !== filters.trangThaiId) continue;

      // Lọc ngày tháng
      if (filters.dateRangeType !== DATE_RANGES.ALL) {
        const txDateStr = tx.thoi_gian_giao_dich || tx.ngay_tao;
        if (txDateStr) {
          if (filters.dateRangeType === DATE_RANGES.CUSTOM && filters.customDateRange) {
            const from = filters.customDateRange[0]?.toDate?.() || new Date(filters.customDateRange[0]);
            const to = filters.customDateRange[1]?.toDate?.() || new Date(filters.customDateRange[1]);
            from.setHours(0, 0, 0, 0); to.setHours(23, 59, 59, 999);
            if (!isInRange(txDateStr, [from, to])) continue;
          } else if (filters.dateRangeType !== DATE_RANGES.CUSTOM) {
            const range = getDateRange(filters.dateRangeType);
            if (range && !isInRange(txDateStr, range)) continue;
          }
        }
      }

      const status = store.categories.find(c => c.id_danh_muc === tx.id_trang_thai)
        || { ten_danh_muc: 'Chờ giao dịch', icon: '⏳' };

      result.push({ tx, file, contract, customer, bank, status, service });
    }

    return result;
  }, [store.historyTransactions, store.historyFiles, store.ma_hop_dong, store.customers, store.banks, store.services, store.categories, filters]);
  const validTransactions = filteredTransactions.filter(i => {
    const statusName = (i.status?.ten_danh_muc || '').toLowerCase();
    return !statusName.includes('hủy') && !statusName.includes('thất bại') && !statusName.includes('lỗi');
  });

  const totalAmount = validTransactions.reduce((s, i) => s + (i.tx.so_tien_di || 0), 0);
  const totalFee = validTransactions.reduce((s, i) => s + (i.tx.phi_dich_vu || 0), 0);

  const fmtDate = (d) => {
    if (!d) return '---';
    return new Date(d).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 100;
    if (bottom && displayCount < filteredTransactions.length) {
      setDisplayCount(prev => prev + 20);
    }
  };

  const visibleTransactions = filteredTransactions.slice(0, displayCount);

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-100px)] md:h-[calc(100vh-40px)] flex-1 min-h-0">

      {/* Vùng Header (Cố định) */}
      <div className="shrink-0 space-y-4">
        {/* 1. SUMMARY CARDS (Đã chuyển lên trên) */}
        <div className="hidden md:grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-violet-900/40 to-blue-900/40 border border-violet-500/30 rounded-xl p-4">
            <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Tổng tiền GD</div>
            <div className="text-2xl font-black text-white">{formatCurrency(totalAmount)}</div>
          </div>
          <div className="bg-gradient-to-r from-orange-900/40 to-red-900/40 border border-orange-500/30 rounded-xl p-4">
            <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Tổng phí DV</div>
            <div className="text-2xl font-black text-white">{formatCurrency(totalFee)}</div>
          </div>
          <div className="bg-gradient-to-r from-green-900/40 to-teal-900/40 border border-green-500/30 rounded-xl p-4 flex flex-col items-center justify-center">
            <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Số lượng GD (Hợp lệ)</div>
            <div className="text-2xl font-black text-white">{validTransactions.length}</div>
          </div>
        </div>

        {/* 2. BỘ LỌC TÌM KIẾM CƠ BẢN */}
        <div className="flex flex-col gap-2">
          {/* DESKTOP FILTERS */}
          <div className="hidden md:flex items-center gap-2">
            {/* Vị trí 3: Giai đoạn (Select) */}
            <Select
              value={filters.dateRangeType}
              onChange={v => setFilters({ ...filters, dateRangeType: v, customDateRange: null })}
              className="flex-1 min-w-[110px]"
            >
              <Option value={DATE_RANGES.ALL}>Tất cả</Option>
              <Option value={DATE_RANGES.TODAY}>Hôm nay</Option>
              <Option value={DATE_RANGES.YESTERDAY}>Hôm qua</Option>
              <Option value={DATE_RANGES.THIS_WEEK}>Tuần này</Option>
              <Option value={DATE_RANGES.LAST_WEEK}>Tuần trước</Option>
              <Option value={DATE_RANGES.THIS_MONTH}>Tháng này</Option>
              <Option value={DATE_RANGES.LAST_MONTH}>Tháng trước</Option>
              <Option value={DATE_RANGES.THIS_YEAR}>Năm nay</Option>
              <Option value={DATE_RANGES.LAST_YEAR}>Năm trước</Option>
              <Option value={DATE_RANGES.CUSTOM}>Tùy chỉnh...</Option>
            </Select>

            {/* Vị trí 6: Trạng thái GD */}
            <Select
              allowClear
              placeholder="Trạng thái"
              className="flex-1 min-w-[110px]"
              value={filters.trangThaiId}
              onChange={v => setFilters({ ...filters, trangThaiId: v })}
            >
              {store.categories.filter(c => c.id_phan_loai === 'pl-1').map(s => (
                <Option key={s.id_danh_muc} value={s.id_danh_muc}>{s.icon} {s.ten_danh_muc}</Option>
              ))}
            </Select>

            {/* Vị trí 4: Nút Bộ lọc nâng cao */}
            <Button 
              type="primary" 
              icon={<FilterOutlined />} 
              onClick={() => setShowFilterModal(true)}
              className="bg-violet-600 border-none font-bold shadow-md"
            >
              Bộ lọc
            </Button>
          </div>

          {/* Vị trí 5: Từ ngày đến ngày (Chung cho Desktop & Mobile) */}
          {filters.dateRangeType === DATE_RANGES.CUSTOM && (
            <div className="w-full mt-1">
              <RangePicker
                className="w-full h-10 rounded-xl"
                placeholder={['Từ ngày', 'Đến ngày']}
                format="DD/MM/YYYY"
                value={filters.customDateRange}
                onChange={dates => setFilters({ ...filters, dateRangeType: DATE_RANGES.CUSTOM, customDateRange: dates })}
              />
            </div>
          )}

          {/* MOBILE FILTERS (Buttons to open Drawer) */}
          <div className="flex md:hidden items-center gap-2">
            <Button 
              className="flex-1 bg-[#131b33] border-white/10 text-gray-300 rounded-xl h-10" 
              onClick={() => setMobileFilterType('time')}
            >
              {filters.dateRangeType === DATE_RANGES.CUSTOM ? 'Tùy chỉnh...' : 'Thời gian...'}
            </Button>
            <Button 
              className="flex-1 bg-[#131b33] border-white/10 text-gray-300 rounded-xl h-10"
              onClick={() => setMobileFilterType('status')}
            >
              {filters.trangThaiId ? 'Trạng thái...' : 'Tất cả trạng thái'}
            </Button>
            <Button 
              type="primary" 
              icon={<FilterOutlined />} 
              onClick={() => setMobileFilterType('advanced')}
              className="bg-violet-600 border-none font-bold shadow-md rounded-xl h-10"
            />
          </div>
        </div>
      </div> {/* Kết thúc Vùng Header */}

      {/* DRAWER BỘ LỌC MOBILE */}
      <Drawer
        title={<span className="font-extrabold text-white">
          {mobileFilterType === 'time' ? 'CHỌN THỜI GIAN' : mobileFilterType === 'status' ? 'CHỌN TRẠNG THÁI' : 'BỘ LỌC NÂNG CAO'}
        </span>}
        placement="bottom"
        open={!!mobileFilterType}
        onClose={() => setMobileFilterType(null)}
        height="auto"
        className="dark-drawer"
        styles={{ header: { borderBottom: '1px solid rgba(255,255,255,0.1)', background: '#0d1426' }, body: { padding: '24px 16px', background: '#0d1426' } }}
      >
        <div className="space-y-6">
          {mobileFilterType === 'time' && (
            <div className="space-y-2">
              <label className="text-[10px] text-gray-400 font-bold uppercase block">Khoảng thời gian</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: DATE_RANGES.ALL, label: 'Tất cả' },
                  { value: DATE_RANGES.TODAY, label: 'Hôm nay' },
                  { value: DATE_RANGES.YESTERDAY, label: 'Hôm qua' },
                  { value: DATE_RANGES.THIS_WEEK, label: 'Tuần này' },
                  { value: DATE_RANGES.LAST_WEEK, label: 'Tuần trước' },
                  { value: DATE_RANGES.THIS_MONTH, label: 'Tháng này' },
                  { value: DATE_RANGES.LAST_MONTH, label: 'Tháng trước' },
                  { value: DATE_RANGES.THIS_YEAR, label: 'Năm nay' },
                  { value: DATE_RANGES.LAST_YEAR, label: 'Năm trước' },
                  { value: DATE_RANGES.CUSTOM, label: 'Tùy chỉnh khoảng ngày...' },
                ].map(opt => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      setFilters({ ...filters, dateRangeType: opt.value, customDateRange: null });
                      if (opt.value === DATE_RANGES.CUSTOM) setMobileFilterType(null); // Đóng Drawer để hiện lịch ở ngoài
                    }}
                    className={`p-3 rounded-xl border text-center text-sm font-semibold transition-colors cursor-pointer select-none ${
                      filters.dateRangeType === opt.value
                        ? 'bg-violet-600 border-violet-500 text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                        : 'bg-[#131b33] border-white/10 text-gray-300'
                    } ${opt.value === DATE_RANGES.CUSTOM ? 'col-span-2' : ''}`}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {mobileFilterType === 'status' && (
            <div className="space-y-2">
              <label className="text-[10px] text-gray-400 font-bold uppercase block">Trạng thái giao dịch</label>
              <div className="grid grid-cols-2 gap-2">
                <div
                  onClick={() => setFilters({ ...filters, trangThaiId: null })}
                  className={`p-3 rounded-xl border text-center text-sm font-semibold transition-colors cursor-pointer select-none col-span-2 ${
                    !filters.trangThaiId
                      ? 'bg-violet-600 border-violet-500 text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                      : 'bg-[#131b33] border-white/10 text-gray-300'
                  }`}
                >
                  Tất cả trạng thái
                </div>
                {store.categories.filter(c => c.id_phan_loai === 'pl-1').map(s => (
                  <div
                    key={s.id_danh_muc}
                    onClick={() => setFilters({ ...filters, trangThaiId: s.id_danh_muc })}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition-colors cursor-pointer select-none ${
                      filters.trangThaiId === s.id_danh_muc
                        ? 'bg-violet-600 border-violet-500 text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                        : 'bg-[#131b33] border-white/10 text-gray-300'
                    }`}
                  >
                    <span>{s.icon}</span> <span>{s.ten_danh_muc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {mobileFilterType === 'advanced' && (
            <>
              {/* Thêm các bộ lọc nâng cao vào Drawer Mobile để tiện dụng hơn */}
              <div className="space-y-2">
                <label className="text-[10px] text-gray-400 font-bold uppercase block">Người thanh toán</label>
                <Select
                  allowClear showSearch
                  placeholder="Tất cả khách hàng"
                  className="w-full h-10"
                  value={filters.khachHangId}
                  onChange={v => setFilters({ ...filters, khachHangId: v })}
                  filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
                >
                  {(store.customers || []).map(c => (
                    <Option key={c.id_khach_hang} value={c.id_khach_hang}>{c.ho_va_ten} ({c.so_dien_thoai})</Option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-400 font-bold uppercase block">Dịch vụ (Tất cả nhóm)</label>
                <Select
                  allowClear showSearch
                  placeholder="Tất cả dịch vụ"
                  className="w-full h-10"
                  value={filters.loaiDichVuId}
                  onChange={v => setFilters({ ...filters, loaiDichVuId: v })}
                  filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
                >
                  {(store.services || []).map(s => (
                    <Option key={s.id_loai_dich_vu} value={s.id_loai_dich_vu}>{s.ten_danh_muc}</Option>
                  ))}
                </Select>
              </div>
            </>
          )}

          <Button type="primary" onClick={() => setMobileFilterType(null)} className="w-full h-12 bg-violet-600 font-bold text-lg mt-4 shadow-lg rounded-xl">
            Áp dụng
          </Button>
        </div>
      </Drawer>

      {/* MODAL BỘ LỌC NÂNG CAO */}
      <Modal
        title={<span className="font-extrabold text-white">BỘ LỌC NÂNG CAO</span>}
        open={showFilterModal}
        onCancel={() => setShowFilterModal(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setShowFilterModal(false)} className="bg-violet-600 border-none font-bold">
            Hoàn tất
          </Button>
        ]}
        className="dark-modal"
      >
        <div className="space-y-4 pt-4">
          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase block">Người thanh toán</label>
            <Select
              allowClear showSearch
              placeholder="Tất cả khách hàng"
              className="w-full"
              value={filters.khachHangId}
              onChange={v => setFilters({ ...filters, khachHangId: v })}
              filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
            >
              {(store.customers || []).map(c => (
                <Option key={c.id_khach_hang} value={c.id_khach_hang}>{c.ho_va_ten} ({c.so_dien_thoai})</Option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase block">Nhóm Menu</label>
            <Select
              allowClear
              placeholder="Tất cả nhóm"
              className="w-full"
              value={filters.nhomMenuId}
              onChange={v => setFilters({ ...filters, nhomMenuId: v, loaiDichVuId: null, danhMucId: null })}
            >
              {(store.menuGroups || []).map(m => (
                <Option key={m.id_nhom} value={m.id_nhom}>{m.ten_nhom}</Option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase block">
              Loại Dịch Vụ {filters.nhomMenuId && <span className="text-violet-400">(đã lọc)</span>}
            </label>
            <Select
              allowClear
              placeholder="Tất cả dịch vụ"
              className="w-full"
              value={filters.loaiDichVuId}
              onChange={v => setFilters({ ...filters, loaiDichVuId: v, danhMucId: null })}
            >
              {filteredServices.map(s => (
                <Option key={s.id_loai_dich_vu} value={s.id_loai_dich_vu}>{s.ten_danh_muc}</Option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase block">
              Danh mục (NH/Nhà mạng) {filters.loaiDichVuId && <span className="text-violet-400">(đã lọc)</span>}
            </label>
            <Select
              allowClear showSearch
              placeholder="Tất cả"
              className="w-full"
              value={filters.danhMucId}
              onChange={v => setFilters({ ...filters, danhMucId: v })}
              filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
            >
              {filteredBanks.map(b => (
                <Option key={b.id_danh_muc_dich_vu} value={b.id_danh_muc_dich_vu}>
                  {b.ten_viet_tat} - {b.ten_dich_vu}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </Modal>

      {/* Vùng Cuộn Nội Bộ (Scrollable) */}
      <div 
        className="flex-1 min-h-0 overflow-y-auto overscroll-none scrollbar-thin pb-20 md:pb-0"
        onScroll={handleScroll}
      >
        {/* DESKTOP TABLE VIEW */}
        <div className="hidden lg:block glass-panel rounded-2xl border border-white/5 shadow-xl overflow-hidden mb-6">
        <Table
          loading={store.isHistoryLoading}
          dataSource={filteredTransactions}
          rowKey={(record) => record.tx.id_chi_tiet_giao_dich || record.tx.ngay_tao || Math.random().toString()}
          pagination={{ pageSize: 10, position: ['bottomCenter'], showSizeChanger: true }}
          className="custom-dark-table"
          scroll={{ x: 1000 }}
          size="middle"
          columns={[
            {
              title: 'Thời gian',
              dataIndex: ['tx', 'thoi_gian_giao_dich'],
              key: 'thoi_gian_giao_dich',
              render: (val, record) => <span className="text-gray-300 font-medium text-xs whitespace-nowrap">{fmtDate(val || record.tx.ngay_tao)}</span>,
              width: 150,
            },
            {
              title: 'Mã HĐ',
              key: 'ma_hd',
              render: (_, record) => <span className="text-red-400 font-black tracking-wide whitespace-nowrap">{record.contract?.ma_hop_dong || '---'}</span>,
              width: 130,
            },
            {
              title: 'Chủ HĐ',
              key: 'chu_hd',
              render: (_, record) => <span className="text-gray-100 font-bold uppercase">{record.contract?.chu_hop_dong || '---'}</span>,
              width: 160,
            },
            {
              title: 'Dịch vụ',
              key: 'dich_vu',
              render: (_, record) => <span className="text-gray-400 text-xs whitespace-nowrap">{record.bank?.ten_viet_tat ? `${record.bank.ten_viet_tat} - ${record.bank.ten_dich_vu}` : record.service?.ten_danh_muc || '---'}</span>,
              width: 180,
            },
            {
              title: 'Khách hàng',
              key: 'khach_hang',
              render: (_, record) => (
                <div className="whitespace-nowrap font-bold text-gray-200">
                  {record.customer?.ho_va_ten || 'Khách lẻ'}
                </div>
              ),
              width: 150,
            },
            {
              title: 'SĐT',
              key: 'sdt',
              render: (_, record) => (
                <div className="whitespace-nowrap text-violet-400 font-semibold">
                  {record.customer?.so_dien_thoai || '---'}
                </div>
              ),
              width: 120,
            },
            {
              title: 'Số tiền',
              dataIndex: ['tx', 'so_tien_di'],
              key: 'so_tien_di',
              render: (val) => <span className="font-black text-violet-400 whitespace-nowrap">{formatCurrency(val)}</span>,
              align: 'right',
              width: 120,
            },
            {
              title: 'Phí',
              dataIndex: ['tx', 'phi_dich_vu'],
              key: 'phi_dich_vu',
              render: (val) => val > 0 ? <span className="text-orange-400 font-medium text-xs whitespace-nowrap">+ {formatCurrency(val)}</span> : null,
              align: 'right',
              width: 100,
            },
            {
              title: 'Trạng thái',
              key: 'trang_thai',
              render: (_, record) => {
                return (
                  <Select
                    value={record.tx.id_trang_thai}
                    onChange={(val) => handleStatusChange(record, val)}
                    className="w-[120px]"
                    onClick={(e) => e.stopPropagation()}
                    variant="borderless"
                    popupClassName="min-w-[150px]"
                  >
                    {store.categories.filter(c => c.id_phan_loai === 'pl-1').map(s => (
                      <Option key={s.id_danh_muc} value={s.id_danh_muc}>
                        <div className="flex items-center gap-1.5 font-bold uppercase text-[10px]">
                          <span>{s.icon}</span>
                          <span>{s.ten_danh_muc}</span>
                        </div>
                      </Option>
                    ))}
                  </Select>
                );
              },
              width: 130,
              align: 'center'
            },
            {
              title: 'Thao tác',
              key: 'actions',
              align: 'right',
              width: 140,
              render: (_, record) => {
                const hasContract = !!(record.contract?.ma_hop_dong);
                return (
                  <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                    <Tooltip title={hasContract ? "Mã QR" : "Không có hợp đồng để tạo QR"}>
                      <Button 
                        type="text" 
                        icon={<QrcodeOutlined />} 
                        onClick={() => handleShowQR(record)}
                        disabled={!hasContract}
                        className={hasContract ? "text-blue-400 hover:text-blue-300 hover:bg-blue-400/10" : "opacity-30 cursor-not-allowed"}
                      />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa Hồ sơ">
                      <Button 
                        type="text" 
                        icon={<FolderOpenOutlined />} 
                        onClick={() => handleGoToWorkspace(record)}
                        className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
                      />
                    </Tooltip>
                    <Tooltip title="Sửa">
                      <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        onClick={() => handleEdit(record)}
                        className="text-violet-400 hover:text-violet-300 hover:bg-violet-400/10"
                      />
                    </Tooltip>
                    <Tooltip title="Hủy GD">
                      <Button 
                        type="text" 
                        icon={<StopOutlined />} 
                        onClick={() => handleCancel(record)}
                        className="text-orange-400 hover:text-orange-300 hover:bg-orange-400/10"
                      />
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <Button 
                        type="text" 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDelete(record)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      />
                    </Tooltip>
                  </div>
                );
              }
            },
            {
              title: 'Nội dung',
              dataIndex: ['tx', 'noi_dung'],
              key: 'noi_dung',
              render: (val) => <span className="text-gray-300 text-xs">{val || '---'}</span>,
            },
          ]}
        />
      </div>

      {/* MOBILE LIST VIEW */}
      <div className="block lg:hidden space-y-3">
        {store.isHistoryLoading ? (
          <div className="flex justify-center p-10"><span className="text-violet-400">Đang tải...</span></div>
        ) : filteredTransactions.length === 0 ? (
          <div className="glass-panel p-10 flex flex-col items-center justify-center border border-white/5 rounded-2xl">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className="text-gray-400">Không tìm thấy giao dịch nào trong khoảng thời gian này</span>} />
          </div>
        ) : (
          <>
            {visibleTransactions.map((item, index) => (
            <div
              key={item.tx.id_chi_tiet_giao_dich || index}
              className="bg-[#0d1426] border border-white/10 rounded-2xl shadow-lg transition-all hover:border-violet-500/50 hover:shadow-violet-500/20"
            >
              <div className="flex flex-col md:flex-row p-4 gap-4">

                {/* Trái: Logo + Mã HĐ + Chủ TK + KH */}
                <div className="flex-1 border-b md:border-b-0 md:border-r border-white/5 pb-4 md:pb-0 md:pr-4 flex gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 p-2 flex items-center justify-center shrink-0">
                    {item.bank?.logo
                      ? <img src={item.bank.logo} alt="bank" className="w-full h-full object-contain" />
                      : <CreditCardOutlined className="text-2xl text-gray-500" />
                    }
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="text-base font-black text-red-400 tracking-wide">{item.contract?.ma_hop_dong || '---'}</div>
                        <div className="text-sm text-gray-100 font-bold uppercase">{item.contract?.chu_hop_dong || '---'}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{item.bank?.ten_viet_tat ? `${item.bank.ten_viet_tat} - ${item.bank.ten_dich_vu}` : item.service?.ten_danh_muc || '---'}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-gray-200">{item.customer?.ho_va_ten || 'Khách lẻ'}</div>
                        <div className="text-xs text-violet-400">{item.customer?.so_dien_thoai || ''}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phải: Số tiền + Trạng thái + Nội dung */}
                <div className="flex-1 flex flex-col justify-between pl-0 md:pl-2">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs text-gray-400">{fmtDate(item.tx.thoi_gian_giao_dich || item.tx.ngay_tao)}</div>
                    <div className="text-right">
                      <div className="text-xl font-black text-violet-400">{formatCurrency(item.tx.so_tien_di)}</div>
                      {item.tx.phi_dich_vu > 0 && (
                        <div className="text-[10px] text-orange-400 font-medium">+ Phí: {formatCurrency(item.tx.phi_dich_vu)}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-xs text-gray-300 flex items-center gap-1.5 flex-1 pr-4 truncate">
                      <span>📝</span>
                      <span className="uppercase truncate" title={item.tx.noi_dung}>{item.tx.noi_dung || '---'}</span>
                    </div>
                    <div className="shrink-0 rounded-lg bg-black/40 border border-white/5" onClick={e => e.stopPropagation()}>
                      <Select
                        value={item.tx.id_trang_thai}
                        onChange={(val) => handleStatusChange(item, val)}
                        className="min-w-[130px]"
                        variant="borderless"
                        popupClassName="min-w-[150px]"
                      >
                        {store.categories.filter(c => c.id_phan_loai === 'pl-1').map(s => (
                          <Option key={s.id_danh_muc} value={s.id_danh_muc}>
                            <div className="flex items-center gap-1.5 font-bold uppercase text-[10px]">
                              <span>{s.icon}</span>
                              <span>{s.ten_danh_muc}</span>
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  
                  {/* MOBILE ACTIONS */}
                  <div className="grid grid-cols-5 gap-1.5 mt-2 pt-2 border-t border-white/5" onClick={e => e.stopPropagation()}>
                    <Button block size="small" type="primary" ghost icon={<QrcodeOutlined />} onClick={() => handleShowQR(item)} disabled={!item.contract?.ma_hop_dong}>QR</Button>
                    <Button block size="small" className="bg-transparent border border-blue-500/30 text-blue-400 hover:text-white hover:bg-blue-500 hover:border-blue-500" icon={<EditOutlined />} onClick={() => handleEdit(item)}>Sửa</Button>
                    <Button block size="small" className="bg-transparent border border-green-500/30 text-green-400 hover:text-white hover:bg-green-500 hover:border-green-500" icon={<FolderOpenOutlined />} onClick={() => handleOpenFile(item)}>Mở</Button>
                    <Button block size="small" danger ghost icon={<StopOutlined />} onClick={() => handleCancel(item)}>Hủy</Button>
                    <Button block size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(item)} />
                  </div>
                </div>
              </div>
            </div>
            ))}
            {displayCount < filteredTransactions.length && (
              <div className="text-center p-4 text-violet-400 text-sm animate-pulse">
                Đang tải thêm... vuốt lên nữa đi
              </div>
            )}
            <div className="h-[150px] shrink-0"></div> {/* Spacer for fixed mobile summary */}
          </>
        )}
      </div>

      {/* 4. VÙNG TỔNG CỘNG DƯỚI CÙNG (MOBILE ONLY) */}
      <div className="md:hidden fixed bottom-[75px] left-3 right-3 z-40 flex flex-col gap-1.5 pointer-events-none">
        {/* Row 1: Tổng tiền */}
        <div className="flex justify-between items-center">
          <span className="text-violet-400 text-[11px] font-bold uppercase tracking-wider bg-[#0d1426]/70 backdrop-blur-md px-2 py-1 rounded-lg">Tổng tiền GD</span>
          <span className="text-white font-black text-lg bg-[#0d1426]/70 backdrop-blur-md px-2 py-0.5 rounded-lg">{formatCurrency(totalAmount)}</span>
        </div>
        {/* Row 2: Phí */}
        <div className="flex justify-between items-center">
          <span className="text-orange-400 text-[11px] font-bold uppercase tracking-wider bg-[#0d1426]/70 backdrop-blur-md px-2 py-1 rounded-lg">Tổng phí DV</span>
          <span className="text-white font-black text-lg bg-[#0d1426]/70 backdrop-blur-md px-2 py-0.5 rounded-lg">{formatCurrency(totalFee)}</span>
        </div>
        {/* Row 3: Số lượng */}
        <div className="flex justify-between items-center">
          <span className="text-green-400 text-[11px] font-bold uppercase tracking-wider bg-[#0d1426]/70 backdrop-blur-md px-2 py-1 rounded-lg">Số lượng GD</span>
          <span className="text-white font-black text-lg bg-[#0d1426]/70 backdrop-blur-md px-2 py-0.5 rounded-lg">{validTransactions.length}</span>
        </div>
      </div>
      </div> {/* Kết thúc Vùng Cuộn Nội Bộ */}

      {/* MODALS QUẢN LÝ GIAO DỊCH */}
      
      {/* 1. Modal QR Code */}
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
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activeDetail.tx.so_tien_di)}
            </h3>
            <div className="flex flex-col gap-1.5 mt-4 text-center w-full bg-white/5 p-3 rounded-xl border border-white/5">
              <p className="text-[13px] text-gray-100 font-bold">{activeDetail.bank?.ten_dich_vu || '—'}</p>
              <p className="text-[14px] text-violet-300 font-black tracking-wide">{activeDetail.contract?.ma_hop_dong || '—'}</p>
              <p className="text-[13px] text-gray-100 font-bold">{activeDetail.contract?.chu_hop_dong || '—'}</p>
              <p className="text-[12px] text-gray-300 font-semibold"><span className="text-[10px] text-gray-500 mr-1">NỘI DUNG:</span>{activeDetail.tx.noi_dung || '—'}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* 2. Modal Chỉnh Sửa Giao Dịch */}
      <Modal
        title={<span className="font-extrabold text-white text-base">✏️ CHỈNH SỬA GIAO DỊCH</span>}
        open={showEditDetailModal}
        onCancel={() => setShowEditDetailModal(false)}
        footer={null}
        width="100%"
        style={{ top: 0, padding: 0, margin: 0, maxWidth: '100vw', paddingBottom: 0 }}
        classNames={{ 
          content: '!rounded-none !h-[100dvh] flex flex-col bg-[#0d1426] border-none', 
          body: 'flex-1 overflow-y-auto !p-2 md:!p-6' 
        }}
        className="!m-0 !p-0"
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
                fetchHistory(); // Tải lại danh sách
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

    </div>
  );
}
