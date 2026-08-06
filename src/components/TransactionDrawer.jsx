import React, { useState, useEffect } from 'react';
import { Drawer, Tabs, Button, Select, Input, InputNumber, Upload, message, Alert } from 'antd';
import { 
  UploadOutlined, UserOutlined, DollarOutlined, 
  QrcodeOutlined, SafetyCertificateOutlined, PrinterOutlined 
} from '@ant-design/icons';
import useAppStore from '../store/useAppStore';
import MoneyTransferForm from './MoneyTransferForm';

const { Option } = Select;

export default function TransactionDrawer({ open, onClose }) {
  const store = useAppStore();
  const [activeKey, setActiveKey] = useState('1');

  const [gdPayload, setGdPayload] = useState({});
  const [netAmount, setNetAmount] = useState(0);

  const activeFile = store.selectedServiceFile;
  const activeCust = activeFile ? store.customers.find(c => c.id_khach_hang === activeFile.id_khach_hang) : null;
  const activeHd = activeFile ? store.ma_hop_dong.find(h => h.id_ma_hop_dong === activeFile.id_ma_hop_dong) : null;

  // Tự động gán thông minh (Nội dung) khi mở drawer
  useEffect(() => {
    if (open) {
      let defaultNoiDung = '';
      if (activeFile?.noi_dung && activeFile.noi_dung.trim() !== '') {
        defaultNoiDung = activeFile.noi_dung;
      } else {
        const isChuyenKhoan = store.selectedService?.ten_danh_muc?.toLowerCase().includes('chuyển khoản') || store.selectedService?.ma_viet_tat === 'CK';
        if (isChuyenKhoan) {
          defaultNoiDung = 'Chuyển tiền';
        } else {
          const lastSameCategoryTx = store.allTransactions?.find(t => t.id_loai_dich_vu === store.selectedService?.id_loai_dich_vu && t.noi_dung);
          if (lastSameCategoryTx) {
            defaultNoiDung = lastSameCategoryTx.noi_dung;
          }
        }
      }
      setGdPayload({ noi_dung: defaultNoiDung });
    }
  }, [open]);

  // QR State (Kế thừa từ danh mục ngân hàng & hợp đồng)
  const [qrBankBin, setQrBankBin] = useState('970422');
  const [qrAccount, setQrAccount] = useState('');
  const [qrAccName, setQrAccName] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Upload/Verification
  const [receiptUrl, setReceiptUrl] = useState('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=600&q=80');

  // Signature
  const [selectedSignature, setSelectedSignature] = useState(store.signature?.id_chu_ky || undefined);

  useEffect(() => {
    if (store.signature?.id_chu_ky && !selectedSignature) {
      setSelectedSignature(store.signature.id_chu_ky);
    }
  }, [store.signature]);


  // Tự động gán thông tin tài khoản nhận từ Hợp đồng khi mở Drawer
  useEffect(() => {
    if (activeHd) {
      setQrAccount(activeHd.ma_hop_dong);
      setQrAccName(activeCust?.ho_va_ten || 'AURA CUSTOMER');
    }
  }, [activeFile, activeHd, activeCust]);

  // Cập nhật tính số tiền thực thu/di
  useEffect(() => {
    setNetAmount(parseFloat(gdPayload.so_tien_di || 0));
  }, [gdPayload]);

  // Cập nhật sinh VietQR thời gian thực
  useEffect(() => {
    if (qrAccount) {
      const amt = netAmount || 0;
      const desc = encodeURIComponent(gdPayload.noi_dung || 'AURA THANH TOAN POS');
      const name = encodeURIComponent(qrAccName.toUpperCase());
      setQrCodeUrl(`https://api.vietqr.io/image/${qrBankBin}-${qrAccount}-compact.png?amount=${amt}&addInfo=${desc}&accountName=${name}`);
    }
  }, [qrBankBin, qrAccount, qrAccName, netAmount, gdPayload]);

  const handleSubmit = async () => {
    if (!activeFile) {
      message.error('Không tìm thấy thông tin hồ sơ dịch vụ chính!');
      return;
    }

    if (!gdPayload.so_tien || gdPayload.so_tien <= 0) {
      message.error('Vui lòng nhập số tiền giao dịch hợp lệ!');
      return;
    }

    const transactionPayload = {
      ...gdPayload,
      so_tien_nhap_tay: gdPayload.so_tien || 0,
      so_tien_di: netAmount,
      noi_dung: gdPayload.noi_dung || `Thanh toán hợp đồng ${activeHd?.ma_hop_dong || ''}`,
      id_trang_thai: gdPayload.id_trang_thai || '11111111-1111-1111-1111-111111111111',
      hinh_anh_kiem_duyet: receiptUrl,
      id_chu_ky: selectedSignature
    };

    try {
      const data = await store.addTransactionDetail(transactionPayload);

      if (data) {
        message.success('🎉 Đã lập phiếu giao dịch dòng tiền chi tiết thành công!');
        onClose();
        setActiveKey('1');
        setGdPayload({});
      }
    } catch (error) {
      message.error(`Thêm giao dịch thất bại: ${error.message || 'Lỗi không xác định'}`);
    }
  };

  const handleUploadReceipt = async (info) => {
    if (info.file.status === 'done' || info.file.status === 'uploading') {
      try {
        const res = await fetch('/api/upload', { method: 'POST' });
        const data = await res.json();
        setReceiptUrl(data.url);
        message.success('Tải ảnh kiểm duyệt hóa đơn lên thành công!');
      } catch (err) {
        message.error('Không thể kết nối kho lưu trữ!');
      }
    }
  };

  return (
    <Drawer
      title={<div className="text-gray-100 font-extrabold text-lg">✨ LẬP PHIẾU DÒNG TIỀN POS CHI TIẾT</div>}
      width={600}
      onClose={onClose}
      open={open}
      className="glass-panel"
      footer={
        <div className="flex justify-end gap-3 p-3 bg-[#0d1426] border-t border-white/5">
          <Button onClick={onClose} className="border-gray-700 text-gray-300 bg-white/5 rounded-lg">Hủy bỏ</Button>
          <Button type="primary" onClick={handleSubmit} className="bg-violet-600 border-none font-bold rounded-lg px-5">Duyệt & Ghi sổ cái</Button>
        </div>
      }
    >
      <Tabs activeKey={activeKey} onChange={setActiveKey} className="w-full text-gray-200">
        
        {/* TAB 1: THÔNG TIN HỒ SƠ CHỦ THỂ */}
        <Tabs.TabPane tab={<span><UserOutlined /> Chủ hồ sơ</span>} key="1">
          <div className="space-y-4 pt-3">
            <Alert message="Dòng tiền chi tiết này sẽ tự động gắn kết và kế thừa toàn bộ hồ sơ khách hàng hiện tại." type="info" showIcon className="bg-violet-600/10 border-none text-violet-300" />
            
            {activeFile ? (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3 text-sm text-gray-300">
                <p><strong>Khách hàng chủ thể:</strong> <span className="text-white font-extrabold">{activeCust?.ho_va_ten || 'Khách lẻ'}</span></p>
                <p><strong>Số điện thoại:</strong> {activeCust?.so_dien_thoai || 'Chưa có'}</p>
                <p><strong>Địa chỉ cư trú:</strong> {activeCust?.dia_chi || 'Chưa cập nhật'}</p>
                <p><strong>Mã hợp đồng / Số TK nhận:</strong> <span className="text-red-400 font-extrabold">{activeHd?.ma_hop_dong || 'Chưa liên kết'}</span></p>
                <p><strong>Phân hệ dịch vụ:</strong> <span className="text-violet-400 font-extrabold uppercase">{store.selectedService?.ten_danh_muc}</span></p>
                <p className="border-t border-white/5 pt-2 text-xs text-gray-400">
                  <strong>Mô tả vụ việc:</strong> {activeFile.noi_dung || 'Không có mô tả'}
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">Vui lòng chọn hồ sơ dịch vụ trước.</p>
            )}
          </div>
        </Tabs.TabPane>

        {/* TAB 2: NGHIỆP VỤ TÀI CHÍNH */}
        <Tabs.TabPane tab={<span><DollarOutlined /> Dòng tiền</span>} key="2">
          <div className="pt-3 space-y-4">
            <MoneyTransferForm
              value={gdPayload}
              onChange={setGdPayload}
            />
          </div>
        </Tabs.TabPane>

        {/* TAB 3: TẠO MÃ QR */}
        <Tabs.TabPane tab={<span><QrcodeOutlined /> Mã VietQR</span>} key="3">
          <div className="pt-3 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400">Chọn Ngân hàng nhận thanh toán</label>
              <Select value={qrBankBin} onChange={setQrBankBin} className="w-full">
                {store.banks.map(b => (
                  <Option key={b.id_danh_muc_dich_vu} value={b.ma_bin}>{b.ten_viet_tat}</Option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400">Số tài khoản nhận</label>
              <Input value={qrAccount} onChange={e => setQrAccount(e.target.value)} className="bg-white/5 border-white/5 text-gray-300" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400">Tên chủ tài khoản (Không dấu)</label>
              <Input value={qrAccName} onChange={e => setQrAccName(e.target.value.toUpperCase())} className="bg-white/5 border-white/5 text-gray-300" />
            </div>

            {qrCodeUrl ? (
              <div className="flex flex-col items-center justify-center p-5 bg-white rounded-xl shadow-lg mt-4 max-w-[280px] mx-auto border border-gray-200">
                <p className="text-[10px] font-extrabold text-gray-800 mb-2 uppercase tracking-wide">QUÉT VIETQR CHUYỂN TIỀN TỰ ĐỘNG</p>
                <img src={qrCodeUrl} className="w-[180px] h-[180px] border border-gray-200 p-2 rounded-lg object-contain bg-white" alt="VietQR Realtime" />
                <p className="text-[9px] text-gray-400 mt-2 text-center font-bold">Số tiền và nội dung đã mã hóa sẵn sàng</p>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic text-center">Vui lòng điền số tài khoản để tạo VietQR.</p>
            )}
          </div>
        </Tabs.TabPane>

        {/* TAB 4: KIỂM DUYỆT HÓA ĐƠN */}
        <Tabs.TabPane tab={<span><SafetyCertificateOutlined /> Kiểm duyệt</span>} key="4">
          <div className="pt-3 space-y-4 text-center">
            <Alert message="Tải lên biên lai xác minh giao dịch (Bill chuyển khoản/biên nhận POS) để kiểm toán sau này." type="info" showIcon className="bg-violet-600/10 border-none text-violet-300" />
            
            <div className="mt-4 flex flex-col items-center gap-3">
              <Upload maxCount={1} showUploadList={false} onChange={handleUploadReceipt} customRequest={({ onSuccess }) => onSuccess("ok")}>
                <Button icon={<UploadOutlined />} className="bg-white/5 border-white/5 text-gray-300 rounded-lg hover:border-violet-500/30">Tải ảnh hóa đơn lên kho</Button>
              </Upload>

              {receiptUrl && (
                <div className="mt-3 border border-white/5 rounded-xl p-2.5 bg-gray-950 max-w-[320px] shadow-lg">
                  <p className="text-[10px] text-gray-500 font-bold mb-2 uppercase tracking-wide">Ảnh xem trước biên nhận</p>
                  <img src={receiptUrl} className="rounded-lg max-h-[190px] object-contain w-full" alt="Receipt preview" />
                </div>
              )}
            </div>
          </div>
        </Tabs.TabPane>

        {/* TAB 5: IN ẤN HÓA ĐƠN */}
        <Tabs.TabPane tab={<span><PrinterOutlined /> In Hóa Đơn</span>} key="5">
          <div className="pt-3 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400">Chọn mẫu chữ ký hiển thị ở chân trang</label>
              <Select value={selectedSignature} onChange={setSelectedSignature} className="w-full">
                <Option value={store.signature?.id_chu_ky}>{store.signature?.ten_chu_ky || 'Quản lý quầy'} - {store.signature?.ten_cua_hang}</Option>
              </Select>
            </div>

            <div className="p-4 border border-dashed border-white/10 rounded-xl bg-gray-950/70 text-gray-400 text-xs leading-relaxed space-y-1.5 shadow-inner">
              <h4 className="text-center font-extrabold text-gray-200 mb-2 uppercase tracking-wide">MẪU IN THỬ ĐẦU RA</h4>
              <p>------------------------------------------</p>
              <p className="font-extrabold text-gray-200 text-center uppercase">{store.signature.ten_cua_hang}</p>
              <p className="text-center">Đ/C: {store.signature.dia_chi}</p>
              <p className="text-center">Hotline: {store.signature.sdt1}</p>
              <p>------------------------------------------</p>
              <p>Khách hàng: {activeCust?.ho_va_ten || 'Khách lẻ'}</p>
              <p>Mã hợp đồng: {activeHd?.ma_hop_dong || '-'}</p>
              <p>Thực thu POS: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(netAmount)}</p>
              <p>Nội dung: {gdPayload.noi_dung || '[Thanh toán dịch vụ]'}</p>
              <p>------------------------------------------</p>
              <p className="text-center italic font-bold">Cảm ơn quý khách đã tin dùng!</p>
            </div>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </Drawer>
  );
}
