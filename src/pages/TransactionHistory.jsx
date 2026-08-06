import React, { useState, useMemo } from 'react';
import { Select, DatePicker, Empty, Tag, Button } from 'antd';
import { FilterOutlined, CalendarOutlined, DollarOutlined, RetweetOutlined, CreditCardOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import useAppStore from '../store/useAppStore';

dayjs.extend(isBetween);

const { Option } = Select;
const { RangePicker } = DatePicker;

const DATE_RANGES = {
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

export default function TransactionHistory() {
  const store = useAppStore();
  const [filters, setFilters] = useState({
    nhomMenuId: null,
    loaiDichVuId: null,
    danhMucId: null, // Ngân hàng/nhà mạng
    khachHangId: null,
    trangThaiId: null,
    dateRangeType: DATE_RANGES.TODAY,
    customDateRange: null
  });

  // --- HELPER QUERIES ---
  const getDateRange = (type) => {
    const now = dayjs();
    switch (type) {
      case DATE_RANGES.TODAY:
        return [now.startOf('day'), now.endOf('day')];
      case DATE_RANGES.YESTERDAY:
        const yest = now.subtract(1, 'day');
        return [yest.startOf('day'), yest.endOf('day')];
      case DATE_RANGES.THIS_WEEK:
        return [now.startOf('week'), now.endOf('week')];
      case DATE_RANGES.LAST_WEEK:
        const lastWeek = now.subtract(1, 'week');
        return [lastWeek.startOf('week'), lastWeek.endOf('week')];
      case DATE_RANGES.THIS_MONTH:
        return [now.startOf('month'), now.endOf('month')];
      case DATE_RANGES.LAST_MONTH:
        const lastMonth = now.subtract(1, 'month');
        return [lastMonth.startOf('month'), lastMonth.endOf('month')];
      case DATE_RANGES.THIS_YEAR:
        return [now.startOf('year'), now.endOf('year')];
      case DATE_RANGES.LAST_YEAR:
        const lastYear = now.subtract(1, 'year');
        return [lastYear.startOf('year'), lastYear.endOf('year')];
      default:
        return null;
    }
  };

  const formatCurrency = (val) => {
    if (!val) return '0 ₫';
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ₫';
  };

  // --- LỌC DỮ LIỆU ---
  const filteredTransactions = useMemo(() => {
    return store.allTransactions.filter(tx => {
      // 1. Tìm File liên kết
      const file = store.allServiceFiles?.find(f => f.id_ho_so_dich_vu === tx.id_ho_so_dich_vu);
      if (!file) return false;

      // 2. Tìm Contract, Customer, Category, Service
      const contract = store.ma_hop_dong?.find(c => c.id_ma_hop_dong === file.id_ma_hop_dong);
      const customer = store.customers?.find(c => c.id_khach_hang === file.id_khach_hang);
      const bank = store.banks?.find(b => b.id_danh_muc_dich_vu === contract?.id_danh_muc_dich_vu);
      const service = store.services?.find(s => s.id_loai_dich_vu === file.id_loai_dich_vu);
      const menuGroup = store.menuGroups?.find(m => m.id_nhom_menu === service?.id_nhom_menu);

      // --- ÁP DỤNG BỘ LỌC ---
      if (filters.nhomMenuId && menuGroup?.id_nhom_menu !== filters.nhomMenuId) return false;
      if (filters.loaiDichVuId && service?.id_loai_dich_vu !== filters.loaiDichVuId) return false;
      if (filters.danhMucId && bank?.id_danh_muc_dich_vu !== filters.danhMucId) return false;
      if (filters.khachHangId && customer?.id_khach_hang !== filters.khachHangId) return false;
      if (filters.trangThaiId && tx.id_trang_thai !== filters.trangThaiId) return false;

      // Date Range Filter
      if (filters.dateRangeType) {
        const txDate = dayjs(tx.thoi_gian_giao_dich || tx.ngay_tao);
        if (filters.dateRangeType === DATE_RANGES.CUSTOM && filters.customDateRange) {
          if (!txDate.isBetween(filters.customDateRange[0], filters.customDateRange[1], 'day', '[]')) {
            return false;
          }
        } else if (filters.dateRangeType !== DATE_RANGES.CUSTOM) {
          const range = getDateRange(filters.dateRangeType);
          if (range && !txDate.isBetween(range[0], range[1], 'day', '[]')) {
            return false;
          }
        }
      }

      return true;
    }).map(tx => {
      // Map all related data for rendering
      const file = store.allServiceFiles?.find(f => f.id_ho_so_dich_vu === tx.id_ho_so_dich_vu);
      const contract = store.ma_hop_dong?.find(c => c.id_ma_hop_dong === file?.id_ma_hop_dong);
      const customer = store.customers?.find(c => c.id_khach_hang === file?.id_khach_hang);
      const bank = store.banks?.find(b => b.id_danh_muc_dich_vu === contract?.id_danh_muc_dich_vu);
      const status = store.categories.find(c => c.id_trang_thai === tx.id_trang_thai) || { ten_trang_thai: 'Đang xử lý', icon: '⏳' };
      
      return { tx, file, contract, customer, bank, status };
    });
  }, [store.allTransactions, store.allServiceFiles, filters]);

  // Totals
  const totalAmount = filteredTransactions.reduce((sum, item) => sum + (item.tx.so_tien_di || 0), 0);
  const totalFee = filteredTransactions.reduce((sum, item) => sum + (item.tx.phi_dich_vu || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      
      {/* FILTER BAR */}
      <div className="glass-panel rounded-2xl p-4 lg:p-6 border border-white/5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <FilterOutlined className="text-violet-400" />
          <h3 className="text-white font-extrabold uppercase tracking-wider text-sm">Bộ lọc tìm kiếm</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Thời gian */}
          <div className="space-y-1 lg:col-span-2">
            <label className="text-[10px] text-gray-400 font-bold uppercase block">Giai đoạn</label>
            <div className="flex gap-2">
              <Select 
                value={filters.dateRangeType} 
                onChange={v => setFilters({...filters, dateRangeType: v})}
                className="w-full !bg-white/5"
              >
                <Option value={DATE_RANGES.TODAY}>Hôm nay</Option>
                <Option value={DATE_RANGES.YESTERDAY}>Hôm qua</Option>
                <Option value={DATE_RANGES.THIS_WEEK}>Tuần này</Option>
                <Option value={DATE_RANGES.LAST_WEEK}>Tuần trước</Option>
                <Option value={DATE_RANGES.THIS_MONTH}>Tháng này</Option>
                <Option value={DATE_RANGES.LAST_MONTH}>Tháng trước</Option>
                <Option value={DATE_RANGES.THIS_YEAR}>Năm nay</Option>
                <Option value={DATE_RANGES.LAST_YEAR}>Năm trước</Option>
                <Option value={DATE_RANGES.CUSTOM}>Tùy chọn...</Option>
              </Select>
              {filters.dateRangeType === DATE_RANGES.CUSTOM && (
                <RangePicker 
                  className="!bg-white/5 !border-white/10 !text-white" 
                  onChange={dates => setFilters({...filters, customDateRange: dates})}
                />
              )}
            </div>
          </div>

          {/* Nhóm Menu */}
          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase block">Nhóm Menu</label>
            <Select 
              allowClear 
              placeholder="Tất cả" 
              className="w-full"
              value={filters.nhomMenuId}
              onChange={v => setFilters({...filters, nhomMenuId: v, loaiDichVuId: null})}
            >
              {store.menuGroups.map(m => <Option key={m.id_nhom_menu} value={m.id_nhom_menu}>{m.ten_nhom}</Option>)}
            </Select>
          </div>

          {/* Loại Dịch Vụ */}
          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase block">Loại Dịch Vụ</label>
            <Select 
              allowClear 
              placeholder="Tất cả" 
              className="w-full"
              value={filters.loaiDichVuId}
              onChange={v => setFilters({...filters, loaiDichVuId: v})}
              disabled={!filters.nhomMenuId && store.services.length === 0}
            >
              {store.services
                .filter(s => !filters.nhomMenuId || s.id_nhom_menu === filters.nhomMenuId)
                .map(s => <Option key={s.id_loai_dich_vu} value={s.id_loai_dich_vu}>{s.ten_danh_muc}</Option>)}
            </Select>
          </div>

          {/* Danh mục (Ngân hàng/Nhà mạng) */}
          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase block">Danh mục (NH/Nhà mạng)</label>
            <Select 
              allowClear 
              showSearch
              placeholder="Tất cả" 
              className="w-full"
              value={filters.danhMucId}
              onChange={v => setFilters({...filters, danhMucId: v})}
              filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
            >
              {store.banks.map(b => <Option key={b.id_danh_muc_dich_vu} value={b.id_danh_muc_dich_vu}>{b.ten_viet_tat} - {b.ten_dich_vu}</Option>)}
            </Select>
          </div>

          {/* Người thanh toán */}
          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase block">Người thanh toán</label>
            <Select 
              allowClear 
              showSearch
              placeholder="Tất cả khách hàng" 
              className="w-full"
              value={filters.khachHangId}
              onChange={v => setFilters({...filters, khachHangId: v})}
              filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
            >
              {store.customers.map(c => <Option key={c.id_khach_hang} value={c.id_khach_hang}>{c.ho_va_ten} ({c.so_dien_thoai})</Option>)}
            </Select>
          </div>

          {/* Trạng thái */}
          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase block">Trạng thái GD</label>
            <Select 
              allowClear 
              placeholder="Tất cả" 
              className="w-full"
              value={filters.trangThaiId}
              onChange={v => setFilters({...filters, trangThaiId: v})}
            >
              {store.categories.filter(c => c.id_phan_loai === 'pl-1').map(s => (
                <Option key={s.id_trang_thai} value={s.id_trang_thai}>{s.icon} {s.ten_trang_thai}</Option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="flex gap-4">
        <div className="bg-gradient-to-r from-violet-900/40 to-blue-900/40 border border-violet-500/30 rounded-xl p-4 flex-1">
          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Tổng tiền giao dịch</div>
          <div className="text-2xl font-black text-white">{formatCurrency(totalAmount)}</div>
        </div>
        <div className="bg-gradient-to-r from-orange-900/40 to-red-900/40 border border-orange-500/30 rounded-xl p-4 flex-1">
          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Tổng phí dịch vụ</div>
          <div className="text-2xl font-black text-white">{formatCurrency(totalFee)}</div>
        </div>
        <div className="bg-gradient-to-r from-green-900/40 to-teal-900/40 border border-green-500/30 rounded-xl p-4 flex-1 flex flex-col justify-center items-center">
          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Số lượng GD</div>
          <div className="text-2xl font-black text-white">{filteredTransactions.length}</div>
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="glass-panel p-10 flex flex-col items-center justify-center border border-white/5 rounded-2xl">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className="text-gray-400">Không tìm thấy giao dịch nào</span>} />
          </div>
        ) : (
          filteredTransactions.map((item, index) => (
            <div key={item.tx.id_chi_tiet_giao_dich || index} className="group relative overflow-hidden bg-[#0d1426] border border-white/10 rounded-2xl shadow-lg transition-all hover:border-violet-500/50 hover:shadow-violet-500/20">
              
              {/* Thẻ Giao dịch ngang (Layout kết hợp) */}
              <div className="flex flex-col md:flex-row p-4 gap-4">
                
                {/* Trái: Thông tin Hồ sơ / Người nhận */}
                <div className="flex-1 border-b md:border-b-0 md:border-r border-white/5 pb-4 md:pb-0 md:pr-4 flex gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 p-2 flex items-center justify-center shrink-0">
                    {item.bank?.logo ? (
                      <img src={item.bank.logo} alt="bank" className="w-full h-full object-contain" />
                    ) : (
                      <CreditCardOutlined className="text-2xl text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-lg font-black text-red-400 tracking-wide">{item.contract?.ma_hop_dong || '---'}</div>
                        <div className="text-sm text-gray-100 font-bold uppercase">{item.contract?.chu_hop_dong || '---'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-200">{item.customer?.ho_va_ten || 'Khách lẻ'}</div>
                        <div className="text-xs text-violet-400">{item.customer?.so_dien_thoai || ''}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phải: Thông tin Dòng tiền & Trạng thái */}
                <div className="flex-1 flex flex-col justify-between pl-0 md:pl-2">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs text-gray-400">{dayjs(item.tx.thoi_gian_giao_dich || item.tx.ngay_tao).format('HH:mm:ss DD/MM/YYYY')}</div>
                    <div className="text-right">
                      <div className="text-xl font-black text-violet-400">{formatCurrency(item.tx.so_tien_di)}</div>
                      {item.tx.phi_dich_vu > 0 && (
                        <div className="text-[10px] text-orange-400 font-medium">+ Phí: {formatCurrency(item.tx.phi_dich_vu)}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-sm text-gray-300 font-medium flex items-center gap-1.5 flex-1 pr-4">
                      <div className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                        <span className="text-[10px]">📝</span>
                      </div>
                      <span className="uppercase text-xs truncate max-w-[200px] sm:max-w-[300px]" title={item.tx.noi_dung}>
                        {item.tx.noi_dung || '---'}
                      </span>
                    </div>
                    <div className="shrink-0">
                      <div className="px-3 py-1 rounded-lg bg-black/40 border border-white/5 text-[10px] font-bold text-gray-300 flex items-center gap-1.5 shadow-inner">
                        <span className="text-sm">{item.status?.icon || '⏳'}</span>
                        <span className="uppercase">{item.status?.ten_trang_thai || 'ĐANG XỬ LÝ'}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
