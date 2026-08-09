import React, { useState, useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import useAuthStore from '../store/useAuthStore';
import { Button, Tag, message, Modal, Input, Select, Radio, Badge } from 'antd';
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
  PhoneOutlined
} from '@ant-design/icons';
import TransactionDrawer from '../components/TransactionDrawer';
import SearchableDropdown from '../components/SearchableDropdown';
import { adminCategoriesConfig } from '../config/adminConfig';
import { FixedSizeList as List } from 'react-window';

const { Option } = Select;

export default function Transactions() {
  const store = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustId, setFilterCustId] = useState(undefined);
  const [filterCategoryId, setFilterCategoryId] = useState(undefined);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
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

  // Mobile: bottom sheet action picker
  const [mobileActionFile, setMobileActionFile] = useState(null); // file được tap trên mobile
  const [showMobileAction, setShowMobileAction] = useState(false);
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
    cccd: '',
    email: '',
    id_gioi_tinh: 'b0000004-0000-0000-0000-000000000001',
    id_level: 'b0000003-0000-0000-0000-000000000002'
  });

  // Edit Customer Form State
  const [editCustPayload, setEditCustPayload] = useState({});

  const currentUser = useAuthStore(state => state.user);

  useEffect(() => {
    store.fetchCustomers();
    if (store.selectedService) {
      store.fetchServiceFiles(store.selectedService.id_loai_dich_vu);
    } else {
      store.fetchSystemConfig();
    }
  }, [store.selectedService]);

  // Bộ lọc danh sách hồ sơ dịch vụ
  const filteredFiles = store.serviceFiles.filter(file => {
    const cust = store.customers.find(c => c.id_khach_hang === file.id_khach_hang);
    const contract = store.ma_hop_dong.find(h => h.id_ma_hop_dong === file.id_ma_hop_dong);
    
    // Lọc theo Khách hàng
    if (filterCustId && file.id_khach_hang !== filterCustId) return false;

    // Lọc theo Danh mục dịch vụ (qua Mã hợp đồng)
    if (filterCategoryId && contract?.id_danh_muc_dich_vu !== filterCategoryId) return false;

    // Lọc theo Tìm kiếm Text
    const searchStr = `${cust?.ho_va_ten || ''} ${cust?.so_dien_thoai || ''} ${contract?.ma_hop_dong || ''} ${file.noi_dung || ''}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  // Tính toán thời gian giao dịch cuối cùng và sắp xếp
  const sortedFiles = [...filteredFiles].map(file => {
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

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    message.success('📋 Đã sao chép vào clipboard!');
  };

  const getStatusTag = (statusId) => {
    const status = store.categories.find(c => c.id_danh_muc === statusId);
    const colors = {
      'dm-1': 'success',    // Thành công
      'dm-2': 'warning',    // Chờ duyệt
      'dm-3': 'error',      // Thất bại
      'dm-4': 'processing'  // Đang xử lý
    };
    return (
      <Tag color={colors[statusId] || 'default'} className="font-extrabold uppercase px-2.5 py-0.5 rounded border-none">
        {status?.ten_danh_muc || 'Không rõ'}
      </Tag>
    );
  };

  // Tạo nhanh Mã hợp đồng inline
  const handleCreateContractInline = async () => {
    if (!newContractPayload.ma_hop_dong) {
      message.error('Vui lòng nhập mã số hợp đồng!');
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
      setNewCustPayload({ ho_va_ten: '', so_dien_thoai: '', dia_chi: '', cccd: '', email: '', id_gioi_tinh: 'b0000004-0000-0000-0000-000000000001', id_level: 'b0000003-0000-0000-0000-000000000002' });
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
      setNewCustPayload({ ho_va_ten: '', so_dien_thoai: '', dia_chi: '', cccd: '', email: '', id_gioi_tinh: 'b0000004-0000-0000-0000-000000000001', id_level: 'b0000003-0000-0000-0000-000000000002' });
    } else {
      message.error('Không thể lưu khách! Kiểm tra Console (F12) để xem lỗi chi tiết.');
    }
  };

  const handleEditCreateContractInline = async () => {
    if (!newContractPayload.ma_hop_dong) {
      message.error('Vui lòng nhập mã số hợp đồng!');
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
    
    const data = await store.updateServiceFile(activeFile.id_ho_so_dich_vu, editFilePayload);
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
    const activeHd = store.ma_hop_dong.find(h => h.id_ma_hop_dong === activeFile?.id_ma_hop_dong);
    if (!activeHd) return;
    
    const data = await store.updateContract(activeHd.id_ma_hop_dong, editContractPayload);
    if (data) {
      message.success('Đã cập nhật mã hợp đồng thành công!');
      setShowEditContractModal(false);
    }
  };

  const openEditContractModal = () => {
    const activeFile = store.selectedServiceFile;
    const activeHd = store.ma_hop_dong.find(h => h.id_ma_hop_dong === activeFile?.id_ma_hop_dong);
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

      <div class="section-title">⌨ THÔNG TIN CHI TIỬT</div>
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
        ${createPane('Liên 1: Giao khách hàng')}
        ${createPane('Liên 2: Cửa hàng lưu')}
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
      const hd = store.ma_hop_dong.find(h => h.id_ma_hop_dong === f.id_ma_hop_dong);
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
  const activeHd = store.ma_hop_dong.find(h => h.id_ma_hop_dong === activeFile?.id_ma_hop_dong);
  const activeBank = store.banks.find(b => b.id_danh_muc_dich_vu === activeHd?.id_danh_muc_dich_vu);
  const activeDetail = store.selectedDetail;

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
    // b0000001-0000-0000-0000-000000000001 = Thành công, 003 = Thất bại/Hủy
    const isCompletedOrCanceled = activeDetail.id_trang_thai === 'b0000001-0000-0000-0000-000000000001' || activeDetail.id_trang_thai === 'b0000001-0000-0000-0000-000000000003';
    return activeDetail.id_tai_khoan_tao === currentUser?.id_tai_khoan && !isCompletedOrCanceled;
  };

  const handleCancelTransaction = async () => {
    if (!activeDetail) return;
    Modal.confirm({
      title: 'Xác nhận Hủy Giao Dịch?',
      content: 'Bạn có chắc chắn muốn chuyển trạng thái giao dịch này thành THẤT BẠI/HỦY?',
      okText: 'Hủy Giao Dịch',
      okType: 'danger',
      cancelText: 'Đóng',
      onOk: async () => {
        try {
          const { error } = await store.supabase
            .from('chi_tiet_giao_dich')
            .update({ id_trang_thai: 'b0000001-0000-0000-0000-000000000003' }) // ID Thất bại/Hủy
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

  // Link VietQR động cho dòng tiền đang chọn
  const activeQrUrl = activeDetail && activeHd
    ? `https://api.vietqr.io/image/970422-${activeHd.ma_hop_dong}-compact.png?amount=${activeDetail.so_tien_di}&addInfo=${encodeURIComponent(activeDetail.noi_dung)}&accountName=${encodeURIComponent(activeCust?.ho_va_ten || 'AURA CUSTOMER')}`
    : '';

  return (
    <div className="flex flex-col xl:flex-row gap-5 min-h-[650px] animate-fadeIn">
      
      {/* ============================================================
         CỘT 1 (BÊN TRÁI): DANH SÁCH HỒ SƠ DỊCH VỤ (CASE MANAGEMENT)
         ============================================================ */}
      <div className="w-full xl:w-[32%] p-4 rounded-2xl bg-[#0d1426]/70 border border-white/5 flex flex-col gap-4 shadow-xl backdrop-blur-md">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            {store.selectedService?.icon?.startsWith('http') 
              ? <img src={store.selectedService.icon} alt="icon" className="h-6 w-6 object-contain" />
              : <span className="text-lg">{store.selectedService?.icon || '📁'}</span>
            }
            <span className="font-extrabold text-white text-xs tracking-wider uppercase">{store.selectedService?.ten_danh_muc || 'TẤT CẢ DỊCH VỤ'} - DANH SÁCH HỒ SƠ</span>
          </div>
          <div className="flex gap-1.5">
            <Button size="small" icon={<ReloadOutlined />} onClick={() => store.fetchServiceFiles(store.selectedService?.id_loai_dich_vu || null)} className="bg-white/5 text-gray-300 border-none hover:text-violet-400" />
            <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => setShowNewFileModal(true)} className="bg-violet-600 border-none font-bold rounded" />
          </div>
        </div>

        {/* Bộ lọc nâng cao */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input 
              prefix={<SearchOutlined className="text-gray-500" />} 
              placeholder="Tìm hợp đồng, tên, SĐT khách..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-white/5 border-white/5 text-gray-300 rounded-xl py-2 hover:border-violet-500/30 focus:border-violet-500 flex-1"
            />
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
        <div className="w-full">
          {sortedFiles.length === 0 ? (
            <div className="p-8 text-center text-gray-500 border border-dashed border-white/5 rounded-xl text-xs">
              Chưa có hồ sơ dịch vụ nào được lập cho phân hệ này.
            </div>
          ) : (
            <List
              className="scrollbar-thin"
              height={500}
              itemCount={sortedFiles.length}
              itemSize={120}
              width="100%"
            >
                  {({ index, style }) => {
                    const file = sortedFiles[index];
                    const cust = store.customers.find(c => c.id_khach_hang === file.id_khach_hang);
                    const hd = store.ma_hop_dong.find(h => h.id_ma_hop_dong === file.id_ma_hop_dong);
                    const bank = store.banks.find(b => b.id_danh_muc_dich_vu === hd?.id_danh_muc_dich_vu);
                    const isSelected = store.selectedServiceFile?.id_ho_so_dich_vu === file.id_ho_so_dich_vu;
                    
                    return (
                      <div style={{ ...style, paddingBottom: '12px' }}>
                        <div 
                          onClick={() => {
                            if (window.innerWidth < 1280) {
                              // Mobile: hien bottom sheet
                              setMobileActionFile(file);
                              setShowMobileAction(true);
                            } else {
                              // Desktop: chon file binh thuong
                              store.selectServiceFile(file);
                            }
                          }}
                          className={`h-full px-3.5 py-3 rounded-xl border transition-all cursor-pointer hover:scale-[1.01] overflow-hidden ${isSelected ? 'bg-violet-600/10 border-violet-500/50 shadow-lg shadow-violet-600/5' : 'bg-[#131c33]/40 border-white/5 hover:border-white/10'}`}
                        >
                          {/* Dòng trên cùng: Ngày GD cuối (trái) & Ngày tạo (phải) */}
                          <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-white/5 text-[9px] font-medium">
                            <span className="text-violet-400/80">
                              {file._lastTxDate 
                                ? `GD cuối: ${file._lastTxDate.toLocaleDateString('vi-VN')} ${file._lastTxDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                                : `GD cuối: ${file.ngay_tao ? new Date(file.ngay_tao).toLocaleDateString('vi-VN') : '—'}`}
                            </span>
                            <span className="text-gray-500">
                              Ngày tạo: {file.ngay_tao ? new Date(file.ngay_tao).toLocaleDateString('vi-VN') : '—'}
                            </span>
                          </div>

                          {/* Dòng giữa: Logo + Thông tin chia 2 bên */}
                          <div className="flex items-center gap-3">
                            {/* Logo dịch vụ */}
                            <div className="flex-shrink-0 w-10 h-10 bg-white/5 rounded-xl border border-white/10 p-1 flex items-center justify-center overflow-hidden">
                              {bank?.logo ? (
                                <img src={bank.logo} alt={bank.ten_viet_tat} className="w-full h-full object-contain" />
                              ) : (
                                <span className="text-lg">{store.selectedService?.icon || '📁'}</span>
                              )}
                            </div>

                            {/* Thông tin chia 2 cột: Trái & Phải */}
                            <div className="flex flex-1 justify-between items-start min-w-0 gap-2">
                              {/* TRÁI: Mã HĐ (dòng 1) + Chủ HĐ (dòng 2) */}
                              <div className="flex flex-col min-w-0">
                                <h4 className="font-extrabold text-sm text-red-400 leading-tight uppercase tracking-wide truncate">
                                  {hd?.ma_hop_dong || 'CHƯA CÓ HĐ'}
                                </h4>
                                <span className="text-[11px] text-gray-300 font-semibold truncate mt-0.5">
                                  {hd?.chu_hop_dong || '—'}
                                </span>
                              </div>

                              {/* PHẢI: Tên người TT (dòng 1) + SĐT (dòng 2) */}
                              <div className="flex flex-col items-end flex-shrink-0 text-right">
                                <span className="text-[11px] text-gray-200 font-bold truncate max-w-[110px]">
                                  {cust?.ho_va_ten || 'Khách lẻ'}
                                </span>
                                {cust?.so_dien_thoai ? (
                                  <span className="text-[10px] text-violet-400/80 font-semibold mt-0.5">
                                    {cust.so_dien_thoai}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-gray-600 mt-0.5">—</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Nội dung mặc định (nếu có) */}
                          {file.noi_dung && (
                            <div className="mt-2 flex items-center gap-1.5">
                              <span className="text-[10px] text-gray-400/80 font-medium italic truncate">
                                📝 {file.noi_dung}
                              </span>
                            </div>
                          )}

                          {/* Dòng dưới đã được chuyển lên trên cùng */}
                        </div>
                      </div>
                    );
                  }}
            </List>
          )}
        </div>
      </div>

      {/* ============================================================
         CỘT 2 + 3: Chi TIET - an tren mobile, hien tren desktop
         ============================================================ */}
      <div className={`${showMobileDetail ? 'fixed inset-0 z-[100] bg-[#0d1426] flex flex-col gap-4 p-4 overflow-y-auto animate-in slide-in-from-bottom' : 'hidden'} xl:contents`}>
        
        {/* Nút đóng trên Mobile */}
        <div className="xl:hidden flex justify-between items-center mb-2">
          <span className="font-extrabold text-white text-lg">CHI TIẾT HỒ SƠ</span>
          <button 
            onClick={() => setShowMobileDetail(false)}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold active:scale-95"
          >
            ✕
          </button>
        </div>

      <div className="w-full xl:w-[40%] p-4 rounded-2xl bg-[#0d1426]/70 border border-white/5 flex flex-col gap-4 shadow-xl backdrop-blur-md justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="font-extrabold text-white text-xs tracking-wider uppercase">THÔNG TIN HỒ SƠ</span>
            {activeFile && (
              <Button 
                type="primary" 
                size="small"
                icon={<PlusOutlined />} 
                onClick={() => setDrawerOpen(true)} 
                className="bg-violet-600 border-none font-bold rounded"
              >
                Tạo giao dịch
              </Button>
            )}
          </div>

          {activeFile ? (
            <div className="space-y-4">
              {/* Card thông tin khách hàng & Hợp đồng (Chia 2/3 và 1/3) */}
              <div className="p-4 rounded-xl bg-[#131c33]/50 border border-white/5 relative overflow-hidden flex flex-col gap-3">
                <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/5 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex justify-between items-stretch gap-4">
                  {/* Phần ưu tiên (2/3): Logo, Mã HĐ, Tên Chủ HĐ */}
                  <div className="flex flex-1 items-center gap-3.5">
                    <div className="w-14 h-14 bg-white/5 rounded-xl border border-white/10 p-1 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {activeBank?.logo ? (
                        <img src={activeBank.logo} alt="logo" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-2xl">{store.selectedService?.icon || '📁'}</span>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-red-500 font-black text-lg tracking-wide uppercase truncate">
                        {activeHd?.ma_hop_dong || 'CHƯA CÓ HỢP ĐỒNG'}
                      </span>
                      {activeHd?.chu_hop_dong && (
                        <span className="text-gray-300 font-bold text-sm truncate mt-0.5">
                          {activeHd.chu_hop_dong}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-500 font-semibold mt-1 truncate">
                        {activeBank?.ten_dich_vu || store.selectedService?.ten_danh_muc || 'Chưa phân loại'}
                      </span>
                    </div>
                  </div>

                  {/* Phần 1/3: Khách hàng (Người thanh toán) */}
                  <div className="w-1/3 flex flex-col items-end text-right border-l border-white/5 pl-4 justify-center">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="flex flex-col items-end min-w-0">
                        <span className="text-gray-200 font-bold text-xs truncate max-w-[120px]">
                          {activeCust?.ho_va_ten || 'Khách lẻ'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1 mt-0.5">
                          {activeCust?.so_dien_thoai || 'Chưa cung cấp SĐT'}
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 border border-violet-500/20 p-0.5 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg">
                        {activeCust?.ho_va_ten?.[0] || 'K'}
                      </div>
                    </div>
                    <Tag color="purple" className="border-none font-extrabold text-[9px] px-1.5 py-0.5 rounded m-0 mt-0.5">
                      {activeCust?.id_level === 'dm-lvl-vip' ? 'VIP Vàng' : 'Thành viên'}
                    </Tag>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 flex gap-2 justify-end mt-1">
                  <Button 
                    size="small" 
                    icon={<EditOutlined />} 
                    onClick={openEditFileModal}
                    disabled={!canEditFile()}
                    title={!canEditFile() ? 'Bạn chỉ có thể sửa hồ sơ do mình tạo' : ''}
                    className="bg-white/5 border-none text-gray-300 text-[10px] h-7 px-3 rounded-lg hover:text-violet-400 disabled:opacity-30 disabled:hover:text-gray-300"
                  >
                    Sửa hồ sơ
                  </Button>
                  <Button 
                    size="small" 
                    icon={<EditOutlined />} 
                    onClick={() => openEditCustModal(activeCust)}
                    disabled={!canEditFile()}
                    className="bg-white/5 border-none text-gray-300 text-[10px] h-7 px-3 rounded-lg hover:text-violet-400 disabled:opacity-30"
                  >
                    Sửa khách
                  </Button>
                  <Button 
                    size="small" 
                    icon={<EditOutlined />} 
                    onClick={openEditContractModal}
                    disabled={!canEditFile()}
                    className="bg-white/5 border-none text-gray-300 text-[10px] h-7 px-3 rounded-lg hover:text-violet-400 disabled:opacity-30"
                  >
                    Sửa HĐ
                  </Button>
                  <Button 
                    size="small" 
                    icon={<HistoryOutlined />} 
                    onClick={() => setShowCustHistoryModal(true)}
                    className="bg-white/5 border-none text-gray-300 text-[10px] h-7 px-3 rounded-lg hover:text-violet-400"
                  >
                    Lịch sử khách
                  </Button>
                </div>
              </div>

              {/* Danh sách Dòng tiền chi tiết */}
              <div className="space-y-2">
                <span className="font-extrabold text-gray-400 text-[10px] tracking-wider uppercase block">Các dòng tiền chi tiết phát sinh</span>
                
                <div className="space-y-2.5 overflow-y-auto max-h-[290px] pr-1 scrollbar-thin">
                  {store.transactionDetails.length === 0 ? (
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
                          
                          <div className="text-right">
                            <span className="text-sm font-extrabold text-violet-400 block">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(detail.so_tien_di)}
                            </span>
                            <span className="block mt-1">{getStatusTag(detail.id_trang_thai)}</span>
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
        </div>
      </div>
      </div>

      {/* ============================================================
         CỘT 3 (BÊN PHẢI): BẢNG TỔNG CỘNG, VIETQR & IN ẤN NHANH
         ============================================================ */}
      <div className={`${showMobileTxDetail ? 'fixed inset-0 z-[110] bg-[#0d1426] flex flex-col gap-4 p-4 overflow-y-auto animate-in slide-in-from-bottom' : 'hidden'} xl:contents`}>
        
        {/* Nút đóng trên Mobile cho Cột 3 */}
        <div className="xl:hidden flex justify-between items-center mb-2">
          <span className="font-extrabold text-white text-lg">CHI TIẾT GIAO DỊCH</span>
          <button 
            onClick={() => setShowMobileTxDetail(false)}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold active:scale-95"
          >
            ✕
          </button>
        </div>

      <div className="w-full xl:w-[28%] p-4 rounded-2xl bg-[#0d1426]/70 border border-white/5 flex flex-col gap-4 shadow-xl backdrop-blur-md justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="font-extrabold text-white text-xs tracking-wider uppercase">CHI TIẾT GIAO DỊCH</span>
          </div>

          {activeDetail ? (
            <div className="space-y-4">
              {/* Thao tác In & QR & Hủy */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <button 
                  onClick={() => setShowQrModal(true)}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-violet-500/40 hover:bg-[#131b33]/40 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-violet-600/10 text-violet-400 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-all"><QrcodeOutlined /></div>
                  <span className="text-[9px] text-gray-400 font-extrabold leading-tight uppercase">TẠO QR</span>
                </button>
                <button 
                  onClick={handlePrintInvoice}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-violet-500/40 hover:bg-[#131b33]/40 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-violet-600/10 text-violet-400 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-all"><PrinterOutlined /></div>
                  <span className="text-[9px] text-gray-400 font-extrabold leading-tight uppercase">IN HÓA ĐƠN</span>
                </button>
                <button 
                  onClick={() => {
                    setEditDetailPayload(activeDetail);
                    setShowEditDetailModal(true);
                  }}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-blue-500/40 hover:bg-blue-500/10 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-400 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-all"><EditOutlined /></div>
                  <span className="text-[9px] text-gray-400 font-extrabold leading-tight uppercase">SỬA GD</span>
                </button>
                <button 
                  onClick={handleCancelTransaction}
                  disabled={!canCancelTransaction()}
                  title={!canCancelTransaction() ? 'Bạn không thể hủy GD này' : ''}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-red-500/40 hover:bg-red-500/10 transition-all group disabled:opacity-30 disabled:hover:bg-white/[0.02] disabled:hover:border-white/5"
                >
                  <div className="w-8 h-8 rounded-full bg-red-600/10 text-red-400 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-all">✖</div>
                  <span className="text-[9px] text-gray-400 font-extrabold leading-tight uppercase">HỦY GD</span>
                </button>
              </div>

              {/* Bảng tính toán tiền chi tiết */}
              <div className="p-4 rounded-xl bg-gray-950/80 border border-white/5 space-y-2.5">
                <div className="flex justify-between text-xs text-gray-400 font-bold">
                  <span>LOẠI HÌNH:</span>
                  <span className="text-gray-200 uppercase">{store.selectedService?.ten_danh_muc || 'KHÁC'}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-300">
                  <span>MỆNH GIÁ GD:</span>
                  <span className="text-white font-extrabold text-sm">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activeDetail.so_tien)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>PHÍ DỊCH VỤ:</span>
                  <span className="text-orange-400 font-semibold">+{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activeDetail.phi_dich_vu)}</span>
                </div>
                {parseFloat(activeDetail.chiet_khau) > 0 && (
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>CHIẾT KHẤU ({activeDetail.chiet_khau}%):</span>
                    <span className="text-green-400 font-semibold">-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activeDetail.so_tien_giam)}</span>
                  </div>
                )}
                <div className="border-t border-white/5 my-2 pt-2 flex justify-between text-sm font-extrabold text-violet-400">
                  <span>THỰC THU POS:</span>
                  <span className="text-base">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activeDetail.so_tien_di)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold mt-2 border-t border-dashed border-white/5 pt-2">
                  <span>TRẠNG THÁI GD:</span>
                  <span>{getStatusTag(activeDetail.id_trang_thai)}</span>
                </div>
              </div>

              {/* VietQR Live Preview */}
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
        </div>
      </div>
      {/* Dong wrapper cot 3 cho desktop */}
      </div>

      {/* ============================================================
         MOBILE BOTTOM SHEET: Chon hanh dong
         ============================================================ */}
      {showMobileAction && mobileActionFile && (() => {
        const mFile = mobileActionFile;
        const mHd = store.ma_hop_dong.find(h => h.id_ma_hop_dong === mFile.id_ma_hop_dong);
        const mCust = store.customers.find(c => c.id_khach_hang === mFile.id_khach_hang);
        const mBank = store.banks.find(b => b.id_danh_muc_dich_vu === mHd?.id_danh_muc_dich_vu);
        return (
          <div
            className="fixed inset-0 z-50 xl:hidden"
            onClick={() => setShowMobileAction(false)}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            {/* Sheet */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-[#0d1426] border-t border-white/10 rounded-t-3xl p-5 animate-in slide-in-from-bottom duration-300"
              onClick={e => e.stopPropagation()}
            >
              {/* Handle bar */}
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />

              {/* Thong tin hop dong */}
              <div className="flex items-center gap-3 mb-6 p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="w-11 h-11 bg-white/5 rounded-xl border border-white/10 p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {mBank?.logo
                    ? <img src={mBank.logo} alt={mBank.ten_viet_tat} className="w-full h-full object-contain" />
                    : <span className="text-xl">{store.selectedService?.icon || '📁'}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-sm text-red-400 uppercase truncate">{mHd?.ma_hop_dong || 'CHUA CO HD'}</h4>
                  <p className="text-xs text-gray-400 truncate">{mCust?.ho_va_ten || 'Khach le'} {mCust?.so_dien_thoai ? `- ${mCust.so_dien_thoai}` : ''}</p>
                </div>
              </div>

              {/* 2 nut hanh dong */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    store.selectServiceFile(mFile);
                    setShowMobileAction(false);
                    setDrawerOpen(true);
                  }}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-violet-600/10 border border-violet-500/30 active:scale-95 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-violet-600/20 flex items-center justify-center text-2xl">💳</div>
                  <span className="text-xs font-bold text-violet-300">Them giao dich</span>
                  <span className="text-[10px] text-gray-500 text-center">Lap phieu POS moi</span>
                </button>

                <button
                  onClick={() => {
                    store.selectServiceFile(mFile);
                    setShowMobileAction(false);
                    setShowMobileDetail(true);
                  }}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 active:scale-95 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl">📋</div>
                  <span className="text-xs font-bold text-gray-200">Xem hồ sơ</span>
                  <span className="text-[10px] text-gray-500 text-center">Ho so & dong tien</span>
                </button>
              </div>

              <button
                onClick={() => setShowMobileAction(false)}
                className="mt-4 w-full py-3 rounded-2xl bg-white/5 text-gray-400 text-sm font-semibold active:scale-95 transition-all"
              >
                Dong
              </button>
            </div>
          </div>
        );
      })()}

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

            {addNewContractInline ? (
              <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-2.5">
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
                <Select
                  placeholder="Chọn danh mục dịch vụ..."
                  className="w-full"
                  showSearch
                  optionFilterProp="children"
                  value={newContractPayload.id_danh_muc_dich_vu}
                  onChange={v => setNewContractPayload({ ...newContractPayload, id_danh_muc_dich_vu: v })}
                >
                  {store.banks
                    .filter(b => store.selectedService ? b.id_loai_dich_vu === store.selectedService.id_loai_dich_vu : true)
                    .map(b => (
                      <Option key={b.id_danh_muc_dich_vu} value={b.id_danh_muc_dich_vu}>
                        {b.ten_viet_tat ? `${b.ten_viet_tat} - ${b.ten_dich_vu}` : b.ten_dich_vu}
                      </Option>
                    ))
                  }
                </Select>
                <Input 
                  placeholder="Ghi chú thêm" 
                  value={newContractPayload.ghi_chu} 
                  onChange={e => setNewContractPayload({ ...newContractPayload, ghi_chu: e.target.value })}
                  className="bg-white/5 border-white/5 text-gray-300"
                />
                <div className="flex gap-2">
                  <Button type="default" size="small" onClick={() => setAddNewContractInline(false)} className="bg-white/5 text-gray-300 border-white/10 w-1/3 rounded">
                    Hủy
                  </Button>
                  <Button type="primary" size="small" onClick={handleCreateContractInline} className="bg-violet-600 border-none font-bold flex-1 rounded">
                    Lưu & Áp dụng
                  </Button>
                </div>
              </div>
            ) : (
              <SearchableDropdown
                placeholder="Chọn hợp đồng..."
                className="w-full"
                value={newFilePayload.id_ma_hop_dong || undefined}
                onChange={v => setNewFilePayload({ ...newFilePayload, id_ma_hop_dong: v })}
                options={store.ma_hop_dong.filter(h => !store.selectedService || h.id_loai_dich_vu === store.selectedService.id_loai_dich_vu || !h.id_loai_dich_vu).map(h => {
                  const bank = store.banks?.find(b => b.id_danh_muc_dich_vu === h.id_danh_muc_dich_vu);
                  const prefix = bank?.ten_viet_tat ? `${bank.ten_viet_tat} - ` : '';
                  return {
                    ...h,
                    displayLabel: `${prefix}${h.ma_hop_dong}`
                  };
                })}
                labelKey="displayLabel"
                valueKey="id_ma_hop_dong"
                subLabelKey="chu_hop_dong"
                onAddNew={() => setAddNewContractInline(true)}
                addNewText="+ Thêm hợp đồng mới"
              />
            )}
          </div>

          {/* PHẦN 2: KHÁCH HÀNG */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-400">2. CHỌN KHÁCH HÀNG CRM *</label>
            </div>

            {addNewCustInline ? (
              <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-2.5">
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
                  value={newCustPayload.cccd} 
                  onChange={e => setNewCustPayload({ ...newCustPayload, cccd: e.target.value })}
                  className="bg-white/5 border-white/5 text-gray-300"
                />
                <Input 
                  placeholder="Địa chỉ cư trú" 
                  value={newCustPayload.dia_chi} 
                  onChange={e => setNewCustPayload({ ...newCustPayload, dia_chi: e.target.value })}
                  className="bg-white/5 border-white/5 text-gray-300"
                />
                <div className="flex gap-2">
                  <Button type="default" size="small" onClick={() => setAddNewCustInline(false)} className="bg-white/5 text-gray-300 border-white/10 w-1/3 rounded">
                    Hủy
                  </Button>
                  <Button type="primary" size="small" onClick={handleCreateCustInline} className="bg-violet-600 border-none font-bold flex-1 rounded">
                    Lưu & Áp dụng
                  </Button>
                </div>
              </div>
            ) : (
              <SearchableDropdown
                placeholder="Chọn khách hàng từ CRM..."
                className="w-full"
                value={newFilePayload.id_khach_hang || undefined}
                onChange={v => setNewFilePayload({ ...newFilePayload, id_khach_hang: v })}
                options={store.customers}
                labelKey="ho_va_ten"
                valueKey="id_khach_hang"
                subLabelKey="so_dien_thoai"
                onAddNew={() => setAddNewCustInline(true)}
                addNewText="+ Tạo mới khách hàng"
              />
            )}
          </div>

          {/* PHẦN 2.5: LOẠI HỢP ĐỒNG */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400">CHỌN LOẠI HỢP ĐỒNG *</label>
            <Select
              placeholder="Chọn phân loại hợp đồng (VIP, Tiêu chuẩn...)"
              className="w-full"
              value={newFilePayload.id_loai_hop_dong || undefined}
              onChange={v => setNewFilePayload({ ...newFilePayload, id_loai_hop_dong: v })}
            >
              {store.loaiHopDongs?.map(l => (
                <Option key={l.id_loai_hop_dong} value={l.id_loai_hop_dong}>{l.ten_loai}</Option>
              ))}
            </Select>
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
                {editCustPayload.avatar_url ? (
                  <img
                    src={editCustPayload.avatar_url}
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
                  value={editCustPayload.avatar_url || ''}
                  onChange={e => setEditCustPayload({ ...editCustPayload, avatar_url: e.target.value })}
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
                      const reader = new FileReader();
                      reader.onloadend = () => setEditCustPayload({ ...editCustPayload, avatar_url: reader.result });
                      reader.readAsDataURL(f);
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
            <Input value={editCustPayload.cccd || ''} onChange={e => setEditCustPayload({ ...editCustPayload, cccd: e.target.value })} className="bg-white/5 border-white/5 text-gray-300" />
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
                  <p><strong>Số CCCD:</strong> {activeCust.cccd || 'Chưa cập nhật'}</p>
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
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-400">Khách Hàng</label>
              {editAddNewCustInline && (
                <Button type="link" size="small" onClick={() => setEditAddNewCustInline(false)} className="text-violet-400 hover:text-violet-300 font-bold p-0 text-xs">
                  Chọn khách có sẵn
                </Button>
              )}
            </div>
            {editAddNewCustInline ? (
              <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-2.5">
                <Input placeholder="Họ & Tên khách hàng *" value={newCustPayload.ho_va_ten} onChange={e => setNewCustPayload({ ...newCustPayload, ho_va_ten: e.target.value })} className="bg-white/5 border-white/5 text-gray-300" />
                <Input placeholder="Số điện thoại di động (Tuỳ chọn)" value={newCustPayload.so_dien_thoai} onChange={e => setNewCustPayload({ ...newCustPayload, so_dien_thoai: e.target.value })} className="bg-white/5 border-white/5 text-gray-300" />
                <Input placeholder="Số căn cước công dân (CCCD)" value={newCustPayload.cccd} onChange={e => setNewCustPayload({ ...newCustPayload, cccd: e.target.value })} className="bg-white/5 border-white/5 text-gray-300" />
                <Input placeholder="Địa chỉ cư trú" value={newCustPayload.dia_chi} onChange={e => setNewCustPayload({ ...newCustPayload, dia_chi: e.target.value })} className="bg-white/5 border-white/5 text-gray-300" />
                <Button type="primary" size="small" onClick={handleEditCreateCustInline} className="bg-violet-600 border-none font-bold w-full rounded">
                  Lưu & Áp dụng
                </Button>
              </div>
            ) : (
              <SearchableDropdown
                className="w-full"
                options={store.customers || []}
                value={editFilePayload.id_khach_hang || undefined}
                onChange={v => setEditFilePayload({...editFilePayload, id_khach_hang: v})}
                placeholder="Chọn khách hàng"
                labelKey="ho_va_ten"
                valueKey="id_khach_hang"
                subLabelKey="so_dien_thoai"
                onAddNew={() => setEditAddNewCustInline(true)}
                addNewText="Tạo Khách Hàng Mới"
              />
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-400">Mã Số Hợp Đồng</label>
              {editAddNewContractInline && (
                <Button type="link" size="small" onClick={() => setEditAddNewContractInline(false)} className="text-violet-400 hover:text-violet-300 font-bold p-0 text-xs">
                  Chọn mã có sẵn
                </Button>
              )}
            </div>
            {editAddNewContractInline ? (
              <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-2.5">
                <Input placeholder="Mã số hợp đồng (ví dụ: AURA-2026-X)" value={newContractPayload.ma_hop_dong} onChange={e => setNewContractPayload({ ...newContractPayload, ma_hop_dong: e.target.value })} className="bg-white/5 border-white/5 text-gray-300" />
                <Input placeholder="Họ tên chủ hợp đồng" value={newContractPayload.chu_hop_dong} onChange={e => setNewContractPayload({ ...newContractPayload, chu_hop_dong: e.target.value })} className="bg-white/5 border-white/5 text-gray-300" />
                <Select placeholder="Chọn danh mục dịch vụ..." className="w-full" showSearch optionFilterProp="children" value={newContractPayload.id_danh_muc_dich_vu} onChange={v => setNewContractPayload({ ...newContractPayload, id_danh_muc_dich_vu: v })}>
                  {store.banks.filter(b => store.selectedService ? b.id_loai_dich_vu === store.selectedService.id_loai_dich_vu : true).map(b => (
                    <Option key={b.id_danh_muc_dich_vu} value={b.id_danh_muc_dich_vu}>{b.ten_viet_tat ? `${b.ten_viet_tat} - ${b.ten_dich_vu}` : b.ten_dich_vu}</Option>
                  ))}
                </Select>
                <Input placeholder="Ghi chú thêm" value={newContractPayload.ghi_chu} onChange={e => setNewContractPayload({ ...newContractPayload, ghi_chu: e.target.value })} className="bg-white/5 border-white/5 text-gray-300" />
                <Button type="primary" size="small" onClick={handleEditCreateContractInline} className="bg-violet-600 border-none font-bold w-full rounded">
                  Lưu & Áp dụng
                </Button>
              </div>
            ) : (
              <SearchableDropdown
                className="w-full"
                options={store.ma_hop_dong || []}
                value={editFilePayload.id_ma_hop_dong || undefined}
                onChange={v => setEditFilePayload({...editFilePayload, id_ma_hop_dong: v})}
                placeholder="Chọn mã số hợp đồng"
                labelKey="ma_hop_dong"
                valueKey="id_ma_hop_dong"
                subLabelKey="chu_hop_dong"
                onAddNew={() => setEditAddNewContractInline(true)}
                addNewText="Tạo Hợp Đồng Mới"
              />
            )}
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
            <Select
              className="w-full"
              value={editFilePayload.id_loai_hop_dong || undefined}
              onChange={v => setEditFilePayload({...editFilePayload, id_loai_hop_dong: v})}
              placeholder="Chọn phân loại hợp đồng"
            >
              {store.loaiHopDongs?.map(l => (
                <Option key={l.id_loai_hop_dong} value={l.id_loai_hop_dong}>{l.ten_loai}</Option>
              ))}
            </Select>
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
            <Select
              className="w-full"
              showSearch
              optionFilterProp="children"
              value={editContractPayload.id_danh_muc_dich_vu || undefined}
              onChange={v => setEditContractPayload({...editContractPayload, id_danh_muc_dich_vu: v})}
              placeholder="Chọn ngân hàng / nhà mạng"
            >
              {store.banks?.map(b => (
                <Option key={b.id_danh_muc_dich_vu} value={b.id_danh_muc_dich_vu}>
                  {b.ten_viet_tat ? `${b.ten_viet_tat} - ${b.ten_dich_vu}` : b.ten_dich_vu}
                </Option>
              ))}
            </Select>
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

      <TransactionDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
