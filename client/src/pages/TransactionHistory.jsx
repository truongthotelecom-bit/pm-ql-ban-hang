import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Select, DatePicker, Empty, Table, Tag } from 'antd';
import { FilterOutlined, CreditCardOutlined } from '@ant-design/icons';
import useAppStore from '../store/useAppStore';

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
  const [filters, setFilters] = useState({
    nhomMenuId: null,
    loaiDichVuId: null,
    danhMucId: null,
    khachHangId: null,
    trangThaiId: null,
    dateRangeType: DATE_RANGES.TODAY,
    customDateRange: null
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id_dich_vu = params.get('id_dich_vu');
    if (id_dich_vu) {
      setFilters(prev => ({ ...prev, loaiDichVuId: id_dich_vu }));
    }
  }, [location.search]);

  useEffect(() => {
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
    
    // Tự động fetch data mỗi khi khoảng thời gian thay đổi
    // Tránh fetch liên tục nếu customDateRange chưa chọn đủ 2 ngày
    if (filters.dateRangeType === DATE_RANGES.CUSTOM && !filters.customDateRange) return;
    
    store.fetchHistoryTransactions(fromDate, toDate);
  }, [filters.dateRangeType, filters.customDateRange]);

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

      const contract = contracts.find(c => c.id_ma_hop_dong === file.id_ma_hop_dong);
      const customer = customers.find(c => c.id_khach_hang === file.id_khach_hang);
      const bank = banks.find(b => b.id_danh_muc_dich_vu === contract?.id_danh_muc_dich_vu);
      const service = services.find(s => s.id_loai_dich_vu === bank?.id_loai_dich_vu);

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

  return (
    <div className="flex flex-col gap-6">

      {/* FILTER BAR */}
      <div className="glass-panel rounded-2xl p-4 lg:p-6 border border-white/5 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <FilterOutlined className="text-violet-400" />
          <h3 className="text-white font-extrabold uppercase tracking-wider text-sm">Bộ lọc tìm kiếm</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          {/* Thời gian */}
          <div className="space-y-1 lg:col-span-2">
            <label className="text-[10px] text-gray-400 font-bold uppercase block">Giai đoạn</label>
            <div className="flex gap-2">
              <Select
                value={filters.dateRangeType}
                onChange={v => setFilters({ ...filters, dateRangeType: v, customDateRange: null })}
                className="w-[150px] shrink-0"
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
              <RangePicker
                className="flex-1"
                placeholder={['Từ ngày', 'Đến ngày']}
                format="DD/MM/YYYY"
                value={filters.customDateRange}
                onChange={dates => setFilters({ ...filters, dateRangeType: DATE_RANGES.CUSTOM, customDateRange: dates })}
              />
            </div>
          </div>

          {/* Trạng thái */}
          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase block">Trạng thái GD</label>
            <Select
              allowClear
              placeholder="Tất cả"
              className="w-full"
              value={filters.trangThaiId}
              onChange={v => setFilters({ ...filters, trangThaiId: v })}
            >
              {store.categories.filter(c => c.id_phan_loai === 'pl-1').map(s => (
                <Option key={s.id_danh_muc} value={s.id_danh_muc}>{s.icon} {s.ten_danh_muc}</Option>
              ))}
            </Select>
          </div>

          {/* Người thanh toán */}
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
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Nhóm Menu */}
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

          {/* Loại Dịch Vụ - lọc theo Nhóm Menu */}
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

          {/* Danh mục (NH/Nhà mạng) - lọc theo Loại DV */}
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
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-3 gap-4">
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

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden lg:block glass-panel rounded-2xl border border-white/5 shadow-xl overflow-hidden">
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
                let color = 'default';
                const st = record.tx.id_trang_thai;
                if (st === 'dm-1') color = 'success';
                else if (st === 'dm-2' || st === 'dm-4') color = 'warning';
                else if (st === 'dm-3') color = 'error';
                return (
                  <Tag color={color} className="font-bold uppercase whitespace-nowrap">
                    {record.status?.ten_danh_muc || 'CHỜ GD'}
                  </Tag>
                );
              },
              width: 130,
              align: 'center'
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
          filteredTransactions.map((item, index) => (
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
                    <div className="shrink-0 px-3 py-1 rounded-lg bg-black/40 border border-white/5 text-[10px] font-bold text-gray-300 flex items-center gap-1.5">
                      <span>{item.status?.icon || '⏳'}</span>
                      <span className="uppercase">{item.status?.ten_danh_muc || 'CHỜ GIAO DỊCH'}</span>
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
