import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
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
  const activeHd = activeFile ? (store.ma_hop_dong.find(h => h.id_ma_hop_dong === activeFile.id_ma_hop_dong) || activeFile.ma_hop_dong) : null;
  const activeBank = activeHd ? store.banks.find(b => b.id_danh_muc_dich_vu === activeHd.id_danh_muc_dich_vu) : null;

  // Tự động gán thông minh (Nội dung + Loại phí) khi mở drawer
  useEffect(() => {
    if (!open) return;

    let defaultNoiDung = '';
    if (activeFile?.noi_dung && activeFile.noi_dung.trim() !== '') {
      defaultNoiDung = activeFile.noi_dung;
    } else {
      const isChuyenKhoan = store.selectedService?.ten_danh_muc?.toLowerCase().includes('chuyển khoản') || store.selectedService?.ma_viet_tat === 'CK';
      if (isChuyenKhoan) {
        defaultNoiDung = 'Chuyển tiền';
      } else {
        const getLoaiDichVuId = (tx) => {
          const file = store.allServiceFiles?.find(f => f.id_ho_so_dich_vu === tx.id_ho_so_dich_vu);
          const hd = store.ma_hop_dong?.find(h => h.id_ma_hop_dong === file?.id_ma_hop_dong);
          const dm = store.banks?.find(b => b.id_danh_muc_dich_vu === hd?.id_danh_muc_dich_vu);
          return dm?.id_loai_dich_vu;
        };
        const lastSameCategoryTx = store.allTransactions?.find(t => getLoaiDichVuId(t) === store.selectedService?.id_loai_dich_vu && t.noi_dung);
        if (lastSameCategoryTx) {
          defaultNoiDung = lastSameCategoryTx.noi_dung;
        }
      }
    }

    // Query Supabase lấy dữ liệu kế thừa
    const fetchInheritedData = async () => {
      const basePayload = { noi_dung: defaultNoiDung };
      
      const idHoSo = activeFile?.id_ho_so_dich_vu || '00000000-0000-0000-0000-000000000000';
      const idDanhMuc = activeBank?.id_danh_muc_dich_vu;
      const idLoaiDV = activeBank?.id_loai_dich_vu;

      let inheritedLoaiCuoc = undefined;
      let inheritedIsCuocTrong = false;
      let inheritedPtttNguon = undefined;
      let inheritedPtttDi = undefined;
      let inheritedPtttPhi = undefined;
      let inheritedChietKhau = 0;

      // KẾ THỪA PHÍ TRONG/NGOÀI VÀ PTTT: CHỈ Ưu tiên 1 (Cùng hồ sơ)
      if (activeFile?.id_ho_so_dich_vu) {
        const { data } = await supabase
          .from('chi_tiet_giao_dich')
          .select('*')
          .eq('id_ho_so_dich_vu', activeFile.id_ho_so_dich_vu)
          .order('thoi_gian_giao_dich', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (data) {
          const isMienPhi = !data.phi_dich_vu || Number(data.phi_dich_vu) === 0;
          inheritedLoaiCuoc = isMienPhi ? 'mien_phi' : (data.is_cuoc_trong ? 'trong' : 'ngoai');
          inheritedIsCuocTrong = data.is_cuoc_trong || false;
          inheritedPtttNguon = data.id_pttt_nguon;
          inheritedPtttDi = data.id_pttt_di;
          inheritedPtttPhi = data.id_pttt_phi;
          
          if (data.chiet_khau && Number(data.chiet_khau) > 0) {
            inheritedChietKhau = Number(data.chiet_khau);
          }
        }
      }

      // KẾ THỪA CHIẾT KHẤU: Ưu tiên 2 (Cùng danh mục) nếu Ưu tiên 1 không có chiết khấu
      if (inheritedChietKhau === 0 && idDanhMuc) {
        const { data: dmTxs } = await supabase.rpc('get_last_tx_by_danh_muc', {
          p_id_danh_muc_dich_vu: idDanhMuc,
          p_id_ho_so_dich_vu: idHoSo
        });
        if (dmTxs && dmTxs.length > 0 && dmTxs[0].chiet_khau && Number(dmTxs[0].chiet_khau) > 0) {
          inheritedChietKhau = Number(dmTxs[0].chiet_khau);
        }
      }

      // KẾ THỪA CHIẾT KHẤU: Ưu tiên 3 (Cùng loại dịch vụ) nếu Ưu tiên 2 không có chiết khấu
      if (inheritedChietKhau === 0 && idLoaiDV) {
        const { data: loaiTxs } = await supabase.rpc('get_last_tx_by_loai', {
          p_id_loai_dich_vu: idLoaiDV,
          p_id_ho_so_dich_vu: idHoSo
        });
        if (loaiTxs && loaiTxs.length > 0 && loaiTxs[0].chiet_khau && Number(loaiTxs[0].chiet_khau) > 0) {
          inheritedChietKhau = Number(loaiTxs[0].chiet_khau);
        }
      }

      // SET PAYLOAD
      if (inheritedLoaiCuoc || inheritedChietKhau > 0) {
        setGdPayload({
          noi_dung: defaultNoiDung,
          loai_cuoc_phi: inheritedLoaiCuoc || 'mien_phi', // Mặc định nếu không có giao dịch cũ
          is_cuoc_trong: inheritedIsCuocTrong,
          chiet_khau: inheritedChietKhau,
          id_pttt_nguon: inheritedPtttNguon,
          id_pttt_di: inheritedPtttDi,
          id_pttt_phi: inheritedPtttPhi,
        });
      } else {
        setGdPayload(basePayload);
      }
    };

    fetchInheritedData();
  }, [open, activeFile?.id_ho_so_dich_vu]);

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

    if (!gdPayload.so_tien_yeu_cau || gdPayload.so_tien_yeu_cau <= 0) {
      message.error('Vui lòng nhập số tiền giao dịch hợp lệ!');
      return;
    }

    const transactionPayload = {
      ...gdPayload,
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
      title={<div className="text-gray-100 font-extrabold text-lg uppercase">✨ DỊCH VỤ {store.selectedService?.ten_danh_muc || 'CHUYỂN TIỀN'}</div>}
      width={600}
      onClose={onClose}
      open={open}
      destroyOnClose={true}
      className="glass-panel"
      classNames={{ body: '!px-2 sm:!px-6 !py-4' }}
      footer={
        <div className="flex justify-end gap-3 p-3 bg-[#0d1426] border-t border-white/5">
          <Button onClick={onClose} className="border-gray-700 text-gray-300 bg-white/5 rounded-lg">Hủy bỏ</Button>
          <Button type="primary" onClick={handleSubmit} className="bg-violet-600 border-none font-bold rounded-lg px-5">TẠO GIAO DỊCH</Button>
        </div>
      }
    >
      <Tabs 
        activeKey={activeKey} 
        onChange={setActiveKey} 
        className="w-full text-gray-200"
        items={[
          {
            key: '1',
            label: <span><DollarOutlined /> Tạo giao dịch</span>,
            children: (
              <div className="pt-3 space-y-4">
                <MoneyTransferForm
                  value={gdPayload}
                  onChange={setGdPayload}
                />
              </div>
            )
          },
          {
            key: '2',
            label: <span><UserOutlined /> Thông tin giao dịch</span>,
            children: (
              <div className="space-y-4 pt-3">
                <Alert message="Dòng tiền chi tiết này sẽ tự động gắn kết và kế thừa toàn bộ hồ sơ khách hàng hiện tại." type="info" showIcon className="bg-violet-600/10 border-none text-violet-300" />
                
                {activeFile ? (
                  <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-5 text-sm text-gray-300">
                    <h3 className="text-violet-400 font-extrabold uppercase text-base text-center border-b border-white/5 pb-2">
                      DỊCH VỤ {store.selectedService?.ten_danh_muc || 'KHÔNG RÕ'}
                    </h3>

                    <div className="space-y-2">
                      <h4 className="font-bold text-gray-400">1. THÔNG TIN KHÁCH HÀNG</h4>
                      <p className="pl-4"><strong>Khách hàng:</strong> <span className="text-white font-extrabold">{activeCust?.ho_va_ten || 'Khách lẻ'}</span></p>
                      <p className="pl-4"><strong>Số điện thoại:</strong> {activeCust?.so_dien_thoai || 'Chưa có'}</p>
                      <p className="pl-4"><strong>Địa chỉ cư trú:</strong> {activeCust?.dia_chi || 'Chưa cập nhật'}</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-gray-400">2. THÔNG TIN NGƯỜI NHẬN</h4>
                      <p className="pl-4"><strong>Số TK nhận:</strong> <span className="text-red-400 font-extrabold">{activeHd?.ma_hop_dong || 'Chưa liên kết'}</span></p>
                      <p className="pl-4"><strong>CHỦ TK:</strong> <span className="text-white">{activeHd?.chu_hop_dong || '—'}</span></p>
                      <p className="pl-4"><strong>NGÂN HÀNG:</strong> <span className="text-white">
                        {activeBank ? `${activeBank.ten_viet_tat} - ${activeBank.ten_dich_vu}` : '—'}
                      </span></p>
                    </div>

                    <div className="pt-2 border-t border-white/5">
                      <p className="text-yellow-400 font-bold">NỘI DUNG GIAO DỊCH: <span className="text-white font-normal uppercase">{activeFile.noi_dung || 'KHÔNG CÓ MÔ TẢ'}</span></p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">Vui lòng chọn hồ sơ dịch vụ trước.</p>
                )}
              </div>
            )
          }
        ]}
      />
    </Drawer>
  );
}
