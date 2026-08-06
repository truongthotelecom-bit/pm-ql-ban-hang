export const adminCategoriesConfig = [
  {
    title: 'Trạng thái giao dịch',
    tableName: 'dm_trang_thai_giao_dich',
    group: 'Giao dịch & Thanh toán',
    primaryKey: 'id_trang_thai',
    columns: [
      { key: 'ten_trang_thai', label: 'Tên trạng thái', type: 'text', required: true },
      { key: 'icon', label: 'Biểu tượng/Emoji', type: 'text' },
      { key: 'ghi_chu', label: 'Ghi chú', type: 'text' }
    ]
  },
  {
    title: 'Phương thức thanh toán',
    tableName: 'dm_phuong_thuc_thanh_toan',
    group: 'Giao dịch & Thanh toán',
    primaryKey: 'id_pttt',
    columns: [
      { key: 'ten_pttt', label: 'Tên phương thức', type: 'text', required: true },
      { key: 'icon', label: 'Biểu tượng/Emoji', type: 'text' },
      { key: 'ghi_chu', label: 'Ghi chú', type: 'text' }
    ]
  },
  {
    title: 'Hạng khách hàng',
    tableName: 'dm_hang_khach_hang',
    group: 'Khách hàng',
    primaryKey: 'id_hang',
    columns: [
      { key: 'ten_hang', label: 'Tên hạng', type: 'text', required: true },
      { key: 'icon', label: 'Biểu tượng/Emoji', type: 'text' },
      { key: 'ghi_chu', label: 'Ghi chú', type: 'text' }
    ]
  },
  {
    title: 'Loại GD Thu Chi',
    tableName: 'dm_loai_gd_thu_chi',
    group: 'Giao dịch & Thanh toán',
    primaryKey: 'id_loai_gd',
    columns: [
      { key: 'ten_loai', label: 'Tên loại GD', type: 'text', required: true },
      { key: 'icon', label: 'Biểu tượng/Emoji', type: 'text' },
      { key: 'ghi_chu', label: 'Ghi chú', type: 'text' }
    ]
  },
  {
    title: 'Nhóm Menu',
    tableName: 'sys_nhom_menu',
    group: 'Hệ thống Dịch vụ',
    primaryKey: 'id_nhom',
    columns: [
      { key: 'ten_nhom', label: 'Tên nhóm', type: 'text', required: true },
      { key: 'index', label: 'Thứ tự', type: 'number' },
      { key: 'ghi_chu', label: 'Ghi chú', type: 'text' }
    ]
  },
  {
    title: 'Loại dịch vụ',
    tableName: 'sys_loai_dich_vu',
    group: 'Hệ thống Dịch vụ',
    primaryKey: 'id_loai_dich_vu',
    columns: [
      { key: 'ten_danh_muc', label: 'Tên loại dịch vụ', type: 'text', required: true },
      { key: 'ma_viet_tat', label: 'Mã viết tắt', type: 'text' },
      { key: 'icon', label: 'Biểu tượng/Emoji', type: 'text' },
      { key: 'id_nhom', label: 'Nhóm Menu', type: 'lookup', lookup: { table: 'sys_nhom_menu', labelField: 'ten_nhom', valueField: 'id_nhom' } },
      { key: 'ghi_chu', label: 'Ghi chú', type: 'text' }
    ]
  },
  {
    title: 'Ngân hàng / Máy POS',
    tableName: 'sys_danh_muc_dich_vu',
    group: 'Hệ thống Dịch vụ',
    primaryKey: 'id_danh_muc_dich_vu',
    columns: [
      { key: 'ten_dich_vu', label: 'Tên dịch vụ/Ngân hàng', type: 'text', required: true },
      { key: 'ten_viet_tat', label: 'Viết tắt', type: 'text' },
      { key: 'ma_bin', label: 'Mã BIN', type: 'text' },
      { key: 'logo', label: 'Link Logo', type: 'text' },
      { key: 'id_loai_dich_vu', label: 'Loại dịch vụ', type: 'lookup', lookup: { table: 'sys_loai_dich_vu', labelField: 'ten_danh_muc', valueField: 'id_loai_dich_vu' } },
      { key: 'ghi_chu', label: 'Ghi chú', type: 'text' }
    ]
  },
  {
    title: 'Khách hàng',
    tableName: 'khach_hang',
    group: 'Khách hàng',
    primaryKey: 'id_khach_hang',
    columns: [
      { key: 'ho_va_ten', label: 'Họ và tên', type: 'text', required: true },
      { key: 'so_dien_thoai', label: 'Số điện thoại', type: 'text', required: true },
      { key: 'ghi_chu', label: 'Ghi chú', type: 'text' }
    ]
  },
  {
    title: 'Mã hợp đồng / Thẻ',
    tableName: 'ma_hop_dong',
    group: 'Hồ sơ',
    primaryKey: 'id_ma_hop_dong',
    columns: [
      { key: 'ma_hop_dong', label: 'Mã HĐ/Thẻ', type: 'text', required: true },
      { key: 'chu_hop_dong', label: 'Tên chủ thẻ/HĐ', type: 'text' },
      { key: 'id_loai_dich_vu', label: 'Loại dịch vụ', type: 'lookup', lookup: { table: 'sys_loai_dich_vu', labelField: 'ten_danh_muc', valueField: 'id_loai_dich_vu' } },
      { key: 'id_danh_muc_dich_vu', label: 'Ngân hàng/POS', type: 'lookup', lookup: { table: 'sys_danh_muc_dich_vu', labelField: 'ten_dich_vu', valueField: 'id_danh_muc_dich_vu' } },
      { key: 'ghi_chu', label: 'Ghi chú', type: 'text' }
    ]
  },
  {
    title: 'Hồ sơ dịch vụ (Giao dịch)',
    tableName: 'ho_so_dich_vu',
    group: 'Hồ sơ',
    primaryKey: 'id_ho_so_dich_vu',
    columns: [
      { key: 'noi_dung', label: 'Nội dung hồ sơ', type: 'text', required: true },
      { key: 'id_khach_hang', label: 'Khách Hàng', type: 'lookup', lookup: { table: 'khach_hang', labelField: 'ho_va_ten', valueField: 'id_khach_hang' } },
      { key: 'id_ma_hop_dong', label: 'Mã Hợp Đồng', type: 'lookup', lookup: { table: 'ma_hop_dong', labelField: 'ma_hop_dong', valueField: 'id_ma_hop_dong' } },
      { key: 'ghi_chu', label: 'Ghi chú', type: 'text' }
    ]
  }
];
