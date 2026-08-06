import React, { useState, useEffect } from 'react';
import { Input, InputNumber, Select, Switch, Button, Divider, Alert } from 'antd';
import { SwapOutlined, CheckCircleOutlined, DollarOutlined, RetweetOutlined } from '@ant-design/icons';
import useAppStore from '../store/useAppStore';

const { Option } = Select;
const { TextArea } = Input;

export default function MoneyTransferForm({ value, onChange }) {
  const store = useAppStore();
  const activeFile = store.selectedServiceFile;
  const activeContract = store.ma_hop_dong.find(h => h.id_ma_hop_dong === activeFile?.id_ma_hop_dong);

  const form = value || {
    so_tien: 0,
    id_pttt_nguon: undefined,
    id_pttt_di: undefined,
    is_cuoc_trong: false,
    phi_dich_vu: 0,
    chiet_khau: 0,
    so_tien_giam: 0,
    noi_dung: ''
  };

  const setForm = (newFormOrCallback) => {
    const newForm = typeof newFormOrCallback === 'function' ? newFormOrCallback(form) : newFormOrCallback;
    
    // Auto calculate so_tien_di
    const amt = newForm.so_tien || 0;
    const fee = newForm.phi_dich_vu || 0;
    const isTrong = newForm.is_cuoc_trong;
    newForm.so_tien_di = isTrong ? (amt - fee) : amt;
    newForm.toggle_so_tien_giam = newForm.so_tien_giam > 0;
    
    onChange(newForm);
  };

  useEffect(() => {
    if (activeFile && activeContract && Object.keys(value || {}).length <= 1) {
      resolveFeeSchedule(form.so_tien);
    }
  }, [activeFile?.id_loai_hop_dong, activeContract?.id_danh_muc_dich_vu]);

  const resolveFeeSchedule = (amount) => {
    // 1. Tìm biểu phí phù hợp nhất
    const id_loai_dich_vu = activeFile?.id_loai_dich_vu;
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

      setForm(prev => ({ ...prev, phi_dich_vu: newPhi, chiet_khau: newCk }));
    }
  };

  const handleValueChange = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
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

  // Bỏ useEffect cũ để tránh infinite loop

  return (
    <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      {/* CỤM 1: NGUỒN TIỀN & ĐÍCH ĐẾN */}
      <div className="mb-6 space-y-4">
        <h4 className="text-violet-400 font-extrabold text-xs tracking-wider uppercase flex items-center gap-2 mb-3">
          <SwapOutlined /> 1. Luồng Giao Dịch
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-gray-400 text-xs font-bold block">Hình thức KHÁCH ĐƯA TIỀN</label>
            <Select
              className="w-full"
              placeholder="Chọn hình thức (Nguồn)"
              value={form.id_pttt_nguon}
              onChange={(v) => handleValueChange('id_pttt_nguon', v)}
            >
              {store.paymethods.map(p => <Option key={p.id_pttt} value={p.id_pttt}>{p.ten_pttt}</Option>)}
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-gray-400 text-xs font-bold block">Hình thức CHUYỂN TIỀN ĐI</label>
            <Select
              className="w-full"
              placeholder="Chọn hình thức (Đích)"
              value={form.id_pttt_di}
              onChange={(v) => handleValueChange('id_pttt_di', v)}
            >
              {store.paymethods.map(p => <Option key={p.id_pttt} value={p.id_pttt}>{p.ten_pttt}</Option>)}
            </Select>
          </div>
        </div>
        
        <div className="space-y-1 mt-4">
          <label className="text-white text-xs font-bold block">SỐ TIỀN GIAO DỊCH (GỐC) <span className="text-red-500">*</span></label>
          <InputNumber
            className="w-full text-lg font-bold !bg-white/5 !border-violet-500/30 !text-white"
            size="large"
            value={form.so_tien}
            onChange={(v) => handleValueChange('so_tien', v)}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
            addonAfter="VNĐ"
            min={0}
          />
        </div>
      </div>

      <Divider className="border-white/10 my-4" />

      {/* CỤM 2: PHÍ & ƯU ĐÃI */}
      <div className="mb-6 space-y-4">
        <h4 className="text-orange-400 font-extrabold text-xs tracking-wider uppercase flex items-center gap-2 mb-3">
          <DollarOutlined /> 2. Cước Phí & Ưu Đãi
        </h4>
        <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-4 flex items-center justify-between">
          <div>
            <div className="text-white font-bold text-sm">Chế độ Cước Trong</div>
            <div className="text-orange-200/60 text-xs">Phí dịch vụ sẽ được TRỪ TRỰC TIẾP vào số tiền chuyển đi. Khách chỉ cần đưa đúng số chẵn.</div>
          </div>
          <Switch 
            checked={form.is_cuoc_trong} 
            onChange={(v) => handleValueChange('is_cuoc_trong', v)} 
            checkedChildren="BẬT" 
            unCheckedChildren="TẮT"
            className={form.is_cuoc_trong ? 'bg-orange-500' : 'bg-gray-600'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-gray-300 text-xs font-bold block">Phí Dịch Vụ (Thu Khách)</label>
            <InputNumber
              className="w-full !bg-white/5 !border-white/10 !text-orange-400 font-bold"
              value={form.phi_dich_vu}
              onChange={(v) => handleValueChange('phi_dich_vu', v)}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              addonAfter="VNĐ"
              min={0}
            />
          </div>
          <div className="space-y-1">
            <label className="text-gray-300 text-xs font-bold block text-green-400">Giảm giá Trực tiếp (Bớt cho khách)</label>
            <InputNumber
              className="w-full !bg-white/5 !border-green-500/30 !text-green-400 font-bold"
              value={form.so_tien_giam}
              onChange={(v) => handleValueChange('so_tien_giam', v)}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              addonAfter="VNĐ"
              min={0}
            />
          </div>
        </div>

        <div className="space-y-1 mt-3">
          <label className="text-gray-500 text-[10px] font-bold block uppercase tracking-wider">Chiết khấu Kế toán Nội bộ (Không trừ vào tiền khách)</label>
          <InputNumber
            className="w-full !bg-black/20 !border-white/5 !text-gray-400"
            value={form.chiet_khau}
            onChange={(v) => handleValueChange('chiet_khau', v)}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            addonAfter="VNĐ"
            min={0}
          />
        </div>
      </div>

      <Divider className="border-white/10 my-4" />

      {/* CỤM 3: NỘI DUNG */}
      <div className="mb-6 space-y-1">
        <label className="text-gray-400 text-xs font-bold block">Nội dung chuyển khoản / Ghi chú</label>
        <TextArea 
          rows={2} 
          className="!bg-white/5 !border-white/10 !text-white rounded-lg"
          placeholder="Nhập nội dung chuyển khoản..."
          value={form.noi_dung}
          onChange={(e) => handleValueChange('noi_dung', e.target.value)}
        />
      </div>

      {/* CỤM 4: TỔNG KẾT BILL */}
      <div className="bg-gradient-to-r from-violet-900/40 to-blue-900/40 border border-violet-500/30 rounded-xl p-4 mt-6">
        <div className="flex justify-between items-end mb-2">
          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">TỔNG KHÁCH CẦN THANH TOÁN</div>
          <div className="text-2xl font-black text-white">{formatCurrency(tongThuKhach)}</div>
        </div>
        <div className="flex justify-between items-end">
          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            <RetweetOutlined className="text-violet-400"/> TIỀN THỰC CHUYỂN ĐI (ĐÍCH)
          </div>
          <div className="text-xl font-bold text-violet-400">{formatCurrency(thucChuyenDi)}</div>
        </div>
        {form.is_cuoc_trong && (
          <div className="mt-3 text-[10px] text-orange-300/80 italic text-right">
            * (Đã trừ {formatCurrency(B)} phí dịch vụ vào tiền gốc chuyển đi)
          </div>
        )}
      </div>

    </div>
  );
}
