import React, { useState, useEffect } from 'react';
import { Input, InputNumber, Select, Switch, Button, Divider, Alert, Radio, Popover } from 'antd';
import { SwapOutlined, CheckCircleOutlined, DollarOutlined, RetweetOutlined, InfoCircleOutlined } from '@ant-design/icons';
import useAppStore from '../store/useAppStore';
import PosAmountKeyboard from './PosAmountKeyboard';

const { Option } = Select;
const { TextArea } = Input;

export default function MoneyTransferForm({ value, onChange }) {
  const [showDiscount, setShowDiscount] = useState(false);
  const [kbConfig, setKbConfig] = useState({ open: false, field: '', value: 0, title: '', unit: 'VNĐ' });
  const openKb = (field, value, title, unit = 'VNĐ') => setKbConfig({ open: true, field, value, title, unit });
  const store = useAppStore();
  const activeFile = store.selectedServiceFile;
  const activeContract = store.ma_hop_dong.find(h => h.id_ma_hop_dong === activeFile?.id_ma_hop_dong) || activeFile?.ma_hop_dong;

  // Đảm bảo loai_cuoc_phi luôn có giá trị để UI radio button hoạt động đúng
  const initialValue = value ? { ...value } : null;
  if (initialValue && !initialValue.loai_cuoc_phi) {
    const isMienPhi = initialValue.phi_dich_vu === 0 || !initialValue.phi_dich_vu;
    initialValue.loai_cuoc_phi = isMienPhi ? 'mien_phi' : (initialValue.is_cuoc_trong ? 'trong' : 'ngoai');
  }

  const form = initialValue || {
    so_tien: 0,
    id_pttt_nguon: undefined,
    id_pttt_di: undefined,
    is_cuoc_trong: false,
    phi_dich_vu: 0,
    id_pttt_phi: undefined,
    loai_cuoc_phi: 'mien_phi', // Mặc định miễn phí khi mới mở form trắng
    chiet_khau: 0,
    so_tien_giam: 0,
    noi_dung: '',
    id_trang_thai: '11111111-1111-1111-1111-111111111111'
  };

  const setForm = (newFormOrCallback) => {
    const newForm = typeof newFormOrCallback === 'function' ? newFormOrCallback(form) : newFormOrCallback;
    
    // Auto calculate so_tien_di
    const amt = newForm.so_tien || 0;
    const fee = newForm.phi_dich_vu || 0;
    const isTrong = newForm.is_cuoc_trong;
    // Chiết khấu lưu theo % nhưng tính ra tiền giảm
    const ckPercent = newForm.chiet_khau || 0;
    const tienGiamCK = Math.round((amt * ckPercent) / 100);
    newForm.so_tien_giam_ck = tienGiamCK; // lưu để hiển thị, không ảnh hưởng so_tien_giam của khách
    const giam = newForm.so_tien_giam || 0;
    newForm.so_tien_di = isTrong ? (amt - giam) : (amt + fee - giam);
    newForm.toggle_so_tien_giam = newForm.so_tien_giam > 0;
    
    onChange(newForm);
  };

  useEffect(() => {
    if (activeFile && activeContract && Object.keys(value || {}).length <= 1) {
      resolveFeeSchedule(form.so_tien);
    }
  }, [activeFile?.id_loai_hop_dong, activeContract?.id_danh_muc_dich_vu]);

  // Tự động điền hình thức thanh toán & chế độ phí từ giao dịch gần nhất
  useEffect(() => {
    if (!activeFile || Object.keys(value || {}).length > 1) return; // Chỉ tự động điền khi là tạo mới

    const idLoaiDV = store.banks?.find(b => b.id_danh_muc_dich_vu === activeContract?.id_danh_muc_dich_vu)?.id_loai_dich_vu;
    const idHoSo = activeFile?.id_ho_so_dich_vu;
    const idDanhMuc = activeContract?.id_danh_muc_dich_vu;

    let lastTx = null;
    
    const getLoaiDichVuId = (tx) => {
      const file = store.allServiceFiles?.find(f => f.id_ho_so_dich_vu === tx.id_ho_so_dich_vu);
      const hd = store.ma_hop_dong?.find(h => h.id_ma_hop_dong === file?.id_ma_hop_dong);
      const dm = store.banks?.find(b => b.id_danh_muc_dich_vu === hd?.id_danh_muc_dich_vu);
      return dm?.id_loai_dich_vu;
    };
    
    const getDanhMucId = (tx) => {
      const file = store.allServiceFiles?.find(f => f.id_ho_so_dich_vu === tx.id_ho_so_dich_vu);
      const hd = store.ma_hop_dong?.find(h => h.id_ma_hop_dong === file?.id_ma_hop_dong);
      return hd?.id_danh_muc_dich_vu;
    };

    // Ưu tiên 1: Cùng hồ sơ
    lastTx = store.allTransactions?.find(t => t.id_ho_so_dich_vu === idHoSo);
    
    // Ưu tiên 2: Cùng danh mục dịch vụ
    if (!lastTx) {
      lastTx = store.allTransactions?.find(t => getDanhMucId(t) === idDanhMuc);
    }
    
    // Ưu tiên 3: Cùng loại dịch vụ
    if (!lastTx) {
      lastTx = store.allTransactions?.find(t => getLoaiDichVuId(t) === idLoaiDV);
    }

    if (lastTx) {
      const isMienPhi = lastTx.phi_dich_vu === 0 || !lastTx.phi_dich_vu;
      const inheritedLoaiCuoc = isMienPhi ? 'mien_phi' : (lastTx.is_cuoc_trong ? 'trong' : 'ngoai');
      
      onChange(prev => ({
        ...(prev || {}),
        id_pttt_nguon: (prev || {}).id_pttt_nguon || lastTx.id_pttt_nguon || undefined,
        id_pttt_di:    (prev || {}).id_pttt_di    || lastTx.id_pttt_di    || undefined,
        id_pttt_phi:   (prev || {}).id_pttt_phi   || lastTx.id_pttt_phi   || undefined,
        is_cuoc_trong: lastTx.is_cuoc_trong || false,
        loai_cuoc_phi: inheritedLoaiCuoc
      }));
    } else {
       // Mặc định
       onChange(prev => ({
        ...(prev || {}),
        loai_cuoc_phi: 'ngoai',
        is_cuoc_trong: false
      }));
    }
  }, [activeFile?.id_ho_so_dich_vu]);

  useEffect(() => {
    if (form.so_tien_giam > 0 && !showDiscount) {
      setShowDiscount(true);
    }
  }, [form.so_tien_giam]);

  const resolveFeeSchedule = (amount) => {
    // 1. Tìm biểu phí phù hợp nhất
    const id_loai_dich_vu = store.banks?.find(b => b.id_danh_muc_dich_vu === activeContract?.id_danh_muc_dich_vu)?.id_loai_dich_vu;
    const id_danh_muc_dich_vu = activeContract?.id_danh_muc_dich_vu;
    const id_loai_hop_dong = activeFile?.id_loai_hop_dong;

    let bestMatch = null;
    let maxScore = -1;

    store.bieuPhis?.forEach(bp => {
      let score = 0;
      let isValid = true;

      // Check Loai dich vu
      if (bp.id_loai_dich_vu) {
        if (bp.id_loai_dich_vu === id_loai_dich_vu) score += 1;
        else isValid = false;
      }
      
      // Check Danh muc dich vu (Ngan hang)
      if (bp.id_danh_muc_dich_vu) {
        if (bp.id_danh_muc_dich_vu === id_danh_muc_dich_vu) score += 2; // Ưu tiên cụ thể dịch vụ hơn
        else isValid = false;
      }

      // Check Loai hop dong (VIP/Thuong)
      if (bp.id_loai_hop_dong) {
        if (bp.id_loai_hop_dong === id_loai_hop_dong) score += 3; // Ưu tiên xếp hạng khách hàng cao nhất
        else isValid = false;
      }

      // Check Mốc số tiền (nếu có)
      const amt = amount || 0;
      if (bp.so_tien_tu !== null && bp.so_tien_tu !== undefined) {
        if (amt >= bp.so_tien_tu) score += 1;
        else isValid = false;
      }
      if (bp.so_tien_den !== null && bp.so_tien_den !== undefined) {
        if (amt <= bp.so_tien_den) score += 1;
        else isValid = false;
      }

      if (isValid && score > maxScore) {
        maxScore = score;
        bestMatch = bp;
      }
    });

    if (bestMatch && amount) {
      // Tính phí
      let newPhi = 0;
      let newCk = 0;
      const cachTinhPhi = store.categories.find(c => c.id_danh_muc === bestMatch.id_cach_tinh_phi);
      const cachTinhCk = store.categories.find(c => c.id_danh_muc === bestMatch.id_cach_tinh_chiet_khau);
      
      // Tính Phí DV
      if (cachTinhPhi?.ten_cach_tinh?.toLowerCase().includes('phần trăm') || cachTinhPhi?.ten_cach_tinh?.toLowerCase().includes('%')) {
        newPhi = (amount * (bestMatch.phi_dich_vu_mac_dinh || 0)) / 100;
      } else {
        newPhi = bestMatch.phi_dich_vu_mac_dinh || 0;
      }

      // Tính CK
      if (cachTinhCk?.ten_cach_tinh?.toLowerCase().includes('phần trăm') || cachTinhCk?.ten_cach_tinh?.toLowerCase().includes('%')) {
        newCk = (amount * (bestMatch.chiet_khau_mac_dinh || 0)) / 100;
      } else {
        newCk = bestMatch.chiet_khau_mac_dinh || 0;
      }

      setForm(prev => {
        let newLoaiCuoc = prev.loai_cuoc_phi;
        if (newPhi > 0 && newLoaiCuoc === 'mien_phi') {
          newLoaiCuoc = 'ngoai'; // Tự động bật tính phí nếu biểu phí có phí
        }
        return { 
          ...prev, 
          phi_dich_vu: newPhi, 
          chiet_khau: newCk,
          loai_cuoc_phi: newLoaiCuoc,
          is_cuoc_trong: newLoaiCuoc === 'trong' 
        };
      });
    }
  };

  const handleValueChange = (key, val) => {
    setForm(prev => {
      const next = { ...prev, [key]: val };
      // Nếu đổi Hình thức khách đưa tiền (id_pttt_nguon), thì Hình thức đóng phí (id_pttt_phi) tự động đổi theo
      if (key === 'id_pttt_nguon') {
        next.id_pttt_phi = val;
      }
      return next;
    });
  };

  const handleFeeModeChange = (mode) => {
    let is_cuoc_trong = form.is_cuoc_trong;
    let phi_dich_vu = form.phi_dich_vu;

    if (mode === 'mien_phi') {
      phi_dich_vu = 0;
      is_cuoc_trong = false;
    } else if (mode === 'trong') {
      is_cuoc_trong = true;
    } else {
      is_cuoc_trong = false;
    }

    setForm(prev => ({ ...prev, loai_cuoc_phi: mode, is_cuoc_trong, phi_dich_vu }));
  };

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  // === CÔNG THỨC TOÁN HỌC ===
  const A = form.so_tien || 0;
  const B = form.phi_dich_vu || 0;
  const C = form.chiet_khau || 0; // Kế toán nội bộ
  const D = form.so_tien_giam || 0;
  
  let tongThuKhach = 0;
  let thucChuyenDi = 0;
  
  if (form.is_cuoc_trong) {
    tongThuKhach = A - D;
    thucChuyenDi = A - B;
  } else {
    tongThuKhach = A + B - D;
    thucChuyenDi = A;
  }

  // Đọc cấu hình cột động từ DB
  const getFieldConfig = (fieldName, hardcodedDefault) => {
    // 1. Lấy nhãn mặc định chuẩn từ bảng sys_danh_sach_cot
    const defaultCol = store.danhSachCot?.find(c => c.id_bang === 'chi_tiet_giao_dich' && c.id_cot === fieldName);
    const defaultLabel = defaultCol ? defaultCol.ten_cot : hardcodedDefault;

    const currentLoaiDV = store.banks?.find(b => b.id_danh_muc_dich_vu === activeContract?.id_danh_muc_dich_vu)?.id_loai_dich_vu;
    if (!currentLoaiDV) return { label: defaultLabel, hidden: false };
    
    // 2. Nếu có cấu hình ghi đè (ẩn/hiện, đổi nhãn) cho Dịch vụ này trong sys_ql_cot_du_lieu
    const config = store.columnsConfig?.find(
      c => c.id_ten_bang === 'chi_tiet_giao_dich' &&
           c.id_loai_dich_vu === currentLoaiDV &&
           c.id_ten_cot === fieldName
    );
    if (!config) return { label: defaultLabel, hidden: false };
    return {
      label: config.noi_dung_hien_thi || defaultLabel,
      hidden: config.is_an_cot
    };
  };

  const f_nguon = getFieldConfig('id_pttt_nguon', 'Hình thức KHÁCH ĐƯA TIỀN');
  const f_di = getFieldConfig('id_pttt_di', 'Hình thức CHUYỂN TIỀN ĐI');
  const f_tien = getFieldConfig('so_tien', 'SỐ TIỀN GIAO DỊCH (GỐC)');
  const f_cuoc = getFieldConfig('is_cuoc_trong', 'Chế độ Cước Trong');
  const f_phi = getFieldConfig('phi_dich_vu', 'Phí Dịch Vụ (Thu Khách)');
  const f_giam = getFieldConfig('so_tien_giam', 'Giảm giá Trực tiếp (Bớt cho khách)');
  const f_ck = getFieldConfig('chiet_khau', 'Chiết khấu Kế toán Nội bộ (%)');
  const f_noidung = getFieldConfig('noi_dung', 'Nội dung chuyển khoản / Ghi chú');
  const f_trangthai = getFieldConfig('id_trang_thai', 'Trạng thái giao dịch');
  const f_pttt_phi = getFieldConfig('id_pttt_phi', 'Hình thức KHÁCH TRẢ PHÍ');

  return (
    <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      {/* CỤM 1: NGUỒN TIỀN & ĐÍCH ĐẾN */}
      <div className="mb-6 space-y-4">
        <h4 className="text-violet-400 font-extrabold text-xs tracking-wider uppercase flex items-center gap-2 mb-3">
          <SwapOutlined /> 1. Luồng Giao Dịch
        </h4>
        {!f_tien.hidden && (
        <div className="space-y-1 mt-4">
          <label className="text-white text-xs font-bold block uppercase">{f_tien.label} <span className="text-red-500">*</span></label>
          <div 
            className="w-full text-xl font-bold bg-white/5 border-2 border-violet-500/50 text-white rounded-xl px-4 py-3 cursor-pointer flex justify-between items-center active:scale-[0.98] transition-transform shadow-lg shadow-violet-900/20"
            onClick={() => openKb('so_tien', form.so_tien, f_tien.label, 'VNĐ')}
          >
            <span>{form.so_tien ? form.so_tien.toLocaleString('vi-VN') : '0'}</span>
            <span className="text-violet-400 text-sm flex items-center gap-2 font-bold">VNĐ <span className="text-[10px] bg-violet-600 px-2 py-1 rounded-md text-white shadow-md">⌨ BẤM ĐỂ NHẬP</span></span>
          </div>
        </div>
        )}
      </div>

      <Divider className="border-white/10 my-4" />

      {/* CỤM 2: PHÍ & ƯU ĐÃI */}
      <div className="mb-6 space-y-4">
        <h4 className="text-orange-400 font-extrabold text-xs tracking-wider uppercase flex items-center gap-2 mb-3">
          <DollarOutlined /> 2. Cước Phí & Ưu Đãi
        </h4>
        {!f_cuoc.hidden && (
        <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-white font-bold text-sm flex items-center gap-1">
              {f_cuoc.label}
              <Popover
                content={
                  <div className="max-w-[250px] text-sm text-gray-700">
                    {form.loai_cuoc_phi === 'mien_phi' ? 'Giao dịch này được miễn phí dịch vụ.' : 
                     form.loai_cuoc_phi === 'trong' ? 'Phí dịch vụ sẽ được TRỪ TRỰC TIẾP vào số tiền chuyển đi. Khách chỉ cần đưa đúng số chẵn.' : 
                     'Khách hàng sẽ trả CỘNG THÊM phí dịch vụ ở ngoài.'}
                  </div>
                }
                title="Giải thích cước phí"
                trigger={['hover', 'click']}
              >
                <InfoCircleOutlined className="text-orange-400 cursor-pointer ml-1" />
              </Popover>
            </div>
            <Radio.Group 
              value={form.loai_cuoc_phi} 
              onChange={(e) => handleFeeModeChange(e.target.value)}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value="mien_phi">Miễn phí</Radio.Button>
              <Radio.Button value="trong">Phí trong</Radio.Button>
              <Radio.Button value="ngoai">Phí ngoài</Radio.Button>
            </Radio.Group>
          </div>
        </div>
        )}

        <div className="space-y-4">
          {!f_phi.hidden && form.loai_cuoc_phi !== 'mien_phi' && (
          <div className="space-y-1">
            <label className="text-gray-300 text-xs font-bold block uppercase">{f_phi.label}</label>
            <div 
              className="w-full text-lg font-bold bg-white/5 border border-white/10 text-orange-400 rounded-lg px-3 py-2 cursor-pointer flex justify-between items-center active:scale-[0.98] transition-transform"
              onClick={() => openKb('phi_dich_vu', form.phi_dich_vu, f_phi.label, 'VNĐ')}
            >
              <span>{form.phi_dich_vu ? form.phi_dich_vu.toLocaleString('vi-VN') : '0'}</span>
              <span className="text-gray-400 text-xs flex items-center gap-2">VNĐ <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded-md text-white shadow-sm">⌨ NHẬP</span></span>
            </div>
          </div>
          )}
          
          {!f_giam.hidden && (
          <div className="space-y-1">
            {!showDiscount ? (
              <button
                type="button"
                onClick={() => setShowDiscount(true)}
                className="text-green-400 text-xs font-bold uppercase hover:underline flex items-center gap-1 mt-2"
              >
                + Thêm {f_giam.label.toLowerCase()}
              </button>
            ) : (
              <>
                <label className="text-gray-300 text-xs font-bold block text-green-400 uppercase flex justify-between">
                  <span>{f_giam.label}</span>
                  <button type="button" onClick={() => { setShowDiscount(false); handleValueChange('so_tien_giam', 0); }} className="text-[10px] text-gray-500 hover:text-red-400 font-normal underline">Xóa</button>
                </label>
                <div 
                  className="w-full text-lg font-bold bg-white/5 border border-green-500/30 text-green-400 rounded-lg px-3 py-2 cursor-pointer flex justify-between items-center active:scale-[0.98] transition-transform"
                  onClick={() => openKb('so_tien_giam', form.so_tien_giam, f_giam.label, 'VNĐ')}
                >
                  <span>{form.so_tien_giam ? form.so_tien_giam.toLocaleString('vi-VN') : '0'}</span>
                  <span className="text-green-400 text-xs flex items-center gap-2">VNĐ <span className="text-[9px] bg-green-500/30 px-1.5 py-0.5 rounded-md text-white shadow-sm">⌨ NHẬP</span></span>
                </div>
              </>
            )}
          </div>
          )}
        </div>

        {!f_ck.hidden && (
        <div className="space-y-1 mt-3">
          <label className="text-gray-500 text-[10px] font-bold block uppercase tracking-wider">
            {f_ck.label}
          </label>
          <div className="flex items-center gap-2">
            <div 
              className="w-32 text-base font-bold bg-black/20 border border-white/5 text-gray-300 rounded-lg px-3 py-1.5 cursor-pointer flex justify-between items-center active:scale-[0.98] transition-transform"
              onClick={() => openKb('chiet_khau', form.chiet_khau, f_ck.label, '%')}
            >
              <span>{form.chiet_khau || '0'}</span>
              <span className="text-gray-500 text-xs flex items-center gap-1">% <span className="text-[8px] bg-white/5 px-1 py-0.5 rounded text-gray-400">⌨</span></span>
            </div>
            {/* Hiển thị tiền cụ thể ra */}
            <div className="flex-1 px-3 py-2 rounded-lg bg-black/20 border border-white/5">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">Tương đương</div>
              <div className="text-sm font-bold text-yellow-400">
                -{formatCurrency(form.so_tien_giam_ck || Math.round(((form.so_tien || 0) * (form.chiet_khau || 0)) / 100))}
              </div>
              <div className="text-[9px] text-gray-600 mt-0.5">({form.chiet_khau || 0}% × {formatCurrency(form.so_tien || 0)})</div>
            </div>
          </div>
        </div>
        )}
      </div>

      <Divider className="border-white/10 my-4" />

      {/* CỤM 3: NỘI DUNG & TRẠNG THÁI */}
      <div className="mb-6 space-y-4">
        {!f_noidung.hidden && (
        <div className="space-y-1">
          <label className="text-gray-400 text-xs font-bold block uppercase">{f_noidung.label}</label>
          <TextArea 
            rows={2} 
            className="!bg-white/5 !border-white/10 !text-white rounded-lg"
            placeholder="Nhập nội dung chuyển khoản..."
            value={form.noi_dung}
            onChange={(e) => handleValueChange('noi_dung', e.target.value)}
          />
        </div>
        )}
        {!f_trangthai.hidden && (
        <div className="space-y-1">
          <label className="text-gray-400 text-xs font-bold block mb-2 uppercase">{f_trangthai.label}</label>
          <div className="grid grid-cols-3 gap-2">
            {store.categories.filter(c => c.id_phan_loai === 'pl-1').map(s => {
              const isActive = (form.id_trang_thai || '11111111-1111-1111-1111-111111111111') === s.id_trang_thai;
              return (
                <button
                  key={s.id_trang_thai}
                  onClick={() => handleValueChange('id_trang_thai', s.id_trang_thai)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[10px] font-bold border transition-all active:scale-95 ${
                    isActive
                      ? 'bg-violet-600/20 border-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.3)] text-violet-300'
                      : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-sm mb-1">{s.icon}</span>
                  <span className="truncate w-full text-center">{s.ten_trang_thai}</span>
                </button>
              );
            })}
          </div>
        </div>
        )}
      </div>

      {/* CỤM 4: TỔNG KẾT BILL */}
      <div className="bg-gradient-to-r from-violet-900/40 to-blue-900/40 border border-violet-500/30 rounded-xl p-4 mt-6 space-y-4">
        
        {/* SỐ TIỀN GIAO DỊCH */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">SỐ TIỀN GIAO DỊCH</div>
            <div className="text-xl font-bold text-white">{formatCurrency(A - D)}</div>
          </div>
          {!f_nguon.hidden && (
            <div className="space-y-1">
              <Select
                className="w-full"
                placeholder={`Chọn ${f_nguon.label.toLowerCase()}`}
                value={form.id_pttt_nguon}
                onChange={(v) => handleValueChange('id_pttt_nguon', v)}
              >
                {store.paymethods.map(p => <Option key={p.id_pttt} value={p.id_pttt}>{p.ten_pttt}</Option>)}
              </Select>
            </div>
          )}
        </div>

        {/* PHÍ DỊCH VỤ */}
        {B > 0 && (
        <div className="pt-3 border-t border-white/10">
          <div className="flex justify-between items-end mb-2">
            <div className="text-orange-400/80 text-xs font-bold uppercase tracking-wider">
              {form.loai_cuoc_phi === 'trong' ? 'PHÍ DỊCH VỤ (TRỪ VÀO TIỀN GỬI)' : 'PHÍ DỊCH VỤ THU THÊM'}
            </div>
            <div className="text-lg font-bold text-orange-400">{formatCurrency(B)}</div>
          </div>
          {!f_pttt_phi.hidden && form.loai_cuoc_phi === 'ngoai' && (
            <div className="space-y-1">
              <Select
                className="w-full"
                placeholder={`Chọn ${f_pttt_phi.label.toLowerCase()}`}
                value={form.id_pttt_phi}
                onChange={(v) => handleValueChange('id_pttt_phi', v)}
              >
                {store.paymethods.map(p => <Option key={p.id_pttt} value={p.id_pttt}>{p.ten_pttt}</Option>)}
              </Select>
            </div>
          )}
        </div>
        )}

        {/* TIỀN THỰC CHUYỂN ĐI */}
        <div className="pt-3 border-t border-white/10">
          <div className="flex justify-between items-end mb-2">
            <div className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <RetweetOutlined className="text-blue-400"/> TIỀN THỰC CHUYỂN ĐI (ĐÍCH)
            </div>
            <div className="text-xl font-bold text-blue-400">
              {formatCurrency(thucChuyenDi)}
            </div>
          </div>
          {!f_di.hidden && (
            <div className="space-y-1">
              <Select
                className="w-full"
                placeholder={`Chọn ${f_di.label.toLowerCase()}`}
                value={form.id_pttt_di}
                onChange={(v) => handleValueChange('id_pttt_di', v)}
              >
                {store.paymethods.map(p => <Option key={p.id_pttt} value={p.id_pttt}>{p.ten_pttt}</Option>)}
              </Select>
            </div>
          )}
          
          {form.is_cuoc_trong && (
            <div className="mt-2 text-[10px] text-orange-300/80 italic text-right">
              * (Đã trừ {formatCurrency(B)} phí dịch vụ vào tiền gốc chuyển đi)
            </div>
          )}
        </div>
      </div>

      {/* POS KEYBOARD MODAL */}
      <PosAmountKeyboard
        open={kbConfig.open}
        value={kbConfig.value}
        onOk={(v) => {
          handleValueChange(kbConfig.field, v);
          setKbConfig({ ...kbConfig, open: false });
        }}
        onCancel={() => setKbConfig({ ...kbConfig, open: false })}
        title={kbConfig.title}
        unit={kbConfig.unit}
      />
    </div>
  );
}
