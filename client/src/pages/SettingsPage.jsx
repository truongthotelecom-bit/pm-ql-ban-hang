import React, { useState, useEffect } from 'react';
import { Input, Button, message } from 'antd';
import useAppStore from '../store/useAppStore';

export default function SettingsPage() {
  const store = useAppStore();

  const [shopName, setShopName] = useState('');
  const [sigAddress, setSigAddress] = useState('');
  const [sigPhone, setSigPhone] = useState('');
  const [sigTitle, setSigTitle] = useState('');
  const [sigZalo, setSigZalo] = useState('');

  useEffect(() => {
    store.fetchSystemConfig();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (store.signature) {
      setShopName(store.signature.ten_cua_hang || '');
      setSigAddress(store.signature.dia_chi || '');
      setSigPhone(store.signature.sdt1 || '');
      setSigTitle(store.signature.ten_chu_ky || '');
      setSigZalo(store.signature.zalo || '');
    }
  }, [store.signature]);

  const handleSaveSettings = async () => {
    try {
      await store.updateSignature({
        ten_cua_hang: shopName,
        dia_chi: sigAddress,
        sdt1: sigPhone,
        ten_chu_ky: sigTitle,
        zalo: sigZalo
      });
      message.success('Cập nhật thông tin chữ ký hóa đơn thành công!');
    } catch (error) {
      message.error('Lỗi khi lưu chữ ký: ' + error.message);
    }
  };

  return (
    <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-6 max-w-xl">
      <div>
        <h2 className="text-lg font-bold text-gray-200 border-b border-gray-800 pb-3">Cấu hình thông tin cửa hàng & Chữ ký</h2>
        <p className="text-xs text-gray-400 mt-1">Thông tin này sẽ được in ở chân trang biên nhận thanh toán POS.</p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-400">Tên thương hiệu cửa hàng *</label>
          <Input value={shopName} onChange={e => setShopName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-400">Địa chỉ kinh doanh *</label>
          <Input value={sigAddress} onChange={e => setSigAddress(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-400">Hotline bán hàng *</label>
          <Input value={sigPhone} onChange={e => setSigPhone(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-400">Đại diện ký tên in ấn *</label>
          <Input value={sigTitle} onChange={e => setSigTitle(e.target.value)} placeholder="Kế toán trưởng/Thu ngân..." />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-400">Số Zalo hỗ trợ (Tùy chọn)</label>
          <Input value={sigZalo} onChange={e => setSigZalo(e.target.value)} placeholder="Nhập số Zalo (để trống nếu không muốn in)" />
        </div>
        <Button type="primary" onClick={handleSaveSettings} className="bg-violet-600 hover:bg-violet-700 w-full mt-2 font-bold py-2 rounded-lg border-none">
          Lưu cấu hình chữ ký hóa đơn
        </Button>
      </div>
    </div>
  );
}
