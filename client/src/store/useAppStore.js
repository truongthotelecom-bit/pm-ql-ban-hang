import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import useAuthStore from './useAuthStore';

const useAppStore = create((set, get) => ({
  classifications: [],
  categories: [],
  menuGroups: [],
  menus: [],
  columnsConfig: [],
  signature: {},
  banks: [],
  customers: [],
  transactions: [],
  ledger: [],
  activeTab: 'services',
  paymethods: [],
  ma_hop_dong: [],
  dbOnline: false,
  
  // Danh mục mới
  loaiHopDongs: [],
  bieuPhis: [],

  // --- SCHEMA V2 STATES ---
  services: [],
  selectedService: null,
  serviceFiles: [],
  selectedServiceFile: null,
  transactionDetails: [],
  selectedDetail: null,
  allTransactions: [],
  allServiceFiles: [],

  // Setters
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedServiceFile: (file) => set({ selectedServiceFile: file }),
  setSelectedDetail: (detail) => set({ selectedDetail: detail }),

  // Flag: đã khởi động hệ thống chưa
  isBootstrapped: false,
  // Actions
  fetchSystemConfig: async () => {
    // Chỉ fetch 1 lần trong suốt phiên làm việc
    if (get().isBootstrapped) return;
    try {
      const [
        { data: resTrangThai },
        { data: resPtThanhToan },
        { data: resNm },
        { data: resM },
        { data: resCol },
        { data: resSig },
        { data: resBanks },
        { data: resHd },
        { data: resLdv },
        { data: resLhd },
        { data: resBp },
        { data: resDanhSachCot }
      ] = await Promise.all([
        supabase.from('dm_trang_thai_giao_dich').select('*'),
        supabase.from('dm_phuong_thuc_thanh_toan').select('*'),
        supabase.from('sys_nhom_menu').select('*').order('index'),
        supabase.from('sys_menu').select('*').order('index'),
        supabase.from('sys_ql_cot_du_lieu').select('*'),
        supabase.from('sys_quan_ly_chu_ky').select('*').limit(1),
        supabase.from('sys_danh_muc_dich_vu').select('*'),
        supabase.from('ma_hop_dong').select('*'),
        supabase.from('sys_loai_dich_vu').select('*').order('ngay_tao'),
        supabase.from('dm_loai_hop_dong').select('*'),
        supabase.from('dm_bieu_phi').select('*'),
        supabase.from('sys_danh_sach_cot').select('*')
      ]);

      const mappedCategories = [
        ...(resTrangThai || []).map(s => ({
          ...s,
          id_danh_muc: s.id_trang_thai,
          ten_danh_muc: s.ten_trang_thai,
          id_phan_loai: 'pl-1'
        })),
        ...(resPtThanhToan || []).map(p => ({
          ...p,
          id_danh_muc: p.id_pttt,
          ten_danh_muc: p.ten_pttt,
          id_phan_loai: 'pl-2'
        }))
      ];

      set({
        classifications: [],
        categories: mappedCategories,
        menuGroups: resNm || [],
        menus: resM || [],
        columnsConfig: resCol || [],
        signature: resSig?.[0] || {},
        banks: resBanks || [],
        paymethods: resPtThanhToan || [],
        ma_hop_dong: resHd || [],
        services: resLdv || [],
        loaiHopDongs: resLhd || [],
        bieuPhis: resBp || [],
        danhSachCot: resDanhSachCot || [],
        dbOnline: true,
        isBootstrapped: true
      });

      if (resLdv?.length > 0 && !get().selectedService) {
        const defaultSvc = resLdv.find(s => s.ma_viet_tat === 'CK') || resLdv[0];
        set({ selectedService: defaultSvc });
      }
    } catch (err) {
      console.error('Lỗi khi nạp cấu hình hệ thống:', err);
      set({ dbOnline: false });
    }
  },

  // Khách hàng CRM
  fetchCustomers: async () => {
    try {
      const user = useAuthStore.getState().user;
      let query = supabase.from('khach_hang').select('*').order('ngay_tao', { ascending: false });
      if (user?.id_diem_ban) {
        query = query.or(`id_diem_ban.eq.${user.id_diem_ban},id_diem_ban.is.null`);
      }
      const { data, error } = await query;
      if (!error) set({ customers: data || [] });
    } catch (err) {
      console.error('Lỗi tải khách hàng:', err);
    }
  },

  addCustomer: async (customer) => {
    try {
      // Loại bỏ các trường rỗng để tránh lỗi DB
      const clean = Object.fromEntries(
        Object.entries(customer).filter(([, v]) => v !== '' && v !== undefined && v !== null)
      );
      // Sử dụng chuẩn quốc tế UUID v4 cho mã khách hàng
      clean.id_khach_hang = crypto.randomUUID();

      const user = useAuthStore.getState().user;
      if (user?.id_diem_ban) {
        clean.id_diem_ban = user.id_diem_ban;
      }

      const { data, error } = await supabase.from('khach_hang').insert([clean]).select().single();
      if (error) {
        console.error('Lỗi thêm khách hàng:', error);
        return null;
      }
      if (data) {
        set(state => ({ customers: [data, ...state.customers] }));
        return data;
      }
    } catch (err) {
      console.error('Lỗi thêm khách hàng (exception):', err);
    }
  },

  updateCustomer: async (custId, customer) => {
    try {
      const { data, error } = await supabase
        .from('khach_hang')
        .update(customer)
        .eq('id_khach_hang', custId)
        .select()
        .single();
      if (!error && data) {
        set(state => ({
          customers: state.customers.map(c => c.id_khach_hang === custId ? data : c)
        }));
        return data;
      }
    } catch (err) {
      console.error(err);
    }
  },

  updateContract: async (contractId, contract) => {
    try {
      const { data, error } = await supabase
        .from('ma_hop_dong')
        .update(contract)
        .eq('id_ma_hop_dong', contractId)
        .select()
        .single();
      if (!error && data) {
        set(state => ({
          ma_hop_dong: state.ma_hop_dong.map(c => c.id_ma_hop_dong === contractId ? data : c)
        }));
        return data;
      }
    } catch (err) {
      console.error(err);
    }
  },

  // Chọn dịch vụ
  selectService: async (service) => {
    set({ selectedService: service, activeTab: 'transactions' });
    await get().fetchServiceFiles(service ? service.id_loai_dich_vu : null);
  },

  // Lấy hồ sơ dịch vụ
  fetchServiceFiles: async (serviceId) => {
    try {
      const user = useAuthStore.getState().user;
      let filesQuery = supabase.from('ho_so_dich_vu')
        .select(`*, ma_hop_dong ( id_danh_muc_dich_vu, sys_danh_muc_dich_vu ( id_loai_dich_vu ) )`)
        .order('ngay_tao', { ascending: false });
      let txQuery = supabase.from('chi_tiet_giao_dich')
        .select('*')
        .order('thoi_gian_giao_dich', { ascending: false });

      if (user?.id_diem_ban) {
        filesQuery = filesQuery.or(`id_diem_ban.eq.${user.id_diem_ban},id_diem_ban.is.null`);
        txQuery = txQuery.or(`id_diem_ban.eq.${user.id_diem_ban},id_diem_ban.is.null`);
      }

      const [{ data: filesData }, { data: allTxData }] = await Promise.all([
        filesQuery,
        txQuery
      ]);

      const filtered = serviceId
        ? (filesData || []).filter(f => f.ma_hop_dong?.sys_danh_muc_dich_vu?.id_loai_dich_vu === serviceId)
        : (filesData || []);

      set({ serviceFiles: filtered, allServiceFiles: filesData || [], allTransactions: allTxData || [] });

      if (filtered.length > 0) {
        const firstFile = filtered[0];
        set({ selectedServiceFile: firstFile });
        await get().fetchTransactionDetails(firstFile.id_ho_so_dich_vu);
      } else {
        set({ selectedServiceFile: null, transactionDetails: [], selectedDetail: null });
      }
    } catch (err) {
      console.error('Lỗi tải hồ sơ dịch vụ:', err);
    }
  },

  selectServiceFile: async (file) => {
    set({ selectedServiceFile: file });
    await get().fetchTransactionDetails(file.id_ho_so_dich_vu);
  },

  // Lập hồ sơ dịch vụ mới
  createServiceFile: async (payload) => {
    try {
      const activeSvc = get().selectedService;
      if (!activeSvc) return;

      const fullPayload = { ...payload };
      const user = useAuthStore.getState().user;
      if (user?.id_diem_ban) {
        fullPayload.id_diem_ban = user.id_diem_ban;
      }
      if (user?.id_tai_khoan) {
        fullPayload.id_tai_khoan_tao = user.id_tai_khoan;
      }
      Object.keys(fullPayload).forEach(key => {
        if (fullPayload[key] === '') fullPayload[key] = null;
      });
      const { data, error } = await supabase.from('ho_so_dich_vu').insert([fullPayload]).select().single();

      if (!error && data) {
        await get().fetchServiceFiles(activeSvc.id_loai_dich_vu);
        set({ selectedServiceFile: data });
        await get().fetchTransactionDetails(data.id_ho_so_dich_vu);
        return data;
      }
    } catch (err) {
      console.error('Lỗi tạo hồ sơ dịch vụ:', err);
    }
  },

  // Cập nhật hồ sơ dịch vụ
  updateServiceFile: async (fileId, payload) => {
    try {
      const fullPayload = { ...payload };
      Object.keys(fullPayload).forEach(key => {
        if (fullPayload[key] === '') fullPayload[key] = null;
      });

      const { data, error } = await supabase
        .from('ho_so_dich_vu')
        .update(fullPayload)
        .eq('id_ho_so_dich_vu', fileId)
        .select()
        .single();

      if (!error && data) {
        const activeSvc = get().selectedService;
        if (activeSvc) await get().fetchServiceFiles(activeSvc.id_loai_dich_vu);
        
        // Cập nhật lại file đang select nếu đang mở
        if (get().selectedServiceFile?.id_ho_so_dich_vu === fileId) {
          set({ selectedServiceFile: data });
        }
        return data;
      }
    } catch (err) {
      console.error('Lỗi cập nhật hồ sơ dịch vụ:', err);
    }
  },

  // Lấy chi tiết giao dịch của hồ sơ
  fetchTransactionDetails: async (fileId) => {
    try {
      const user = useAuthStore.getState().user;
      let ledgerQuery = supabase.from('lich_su_thu_chi').select('*').order('ngay_tao', { ascending: false });
      if (user?.id_diem_ban) {
        ledgerQuery = ledgerQuery.eq('id_diem_ban', user.id_diem_ban);
      }

      const [{ data: details }, { data: ledgerData }] = await Promise.all([
        fileId 
          ? supabase.from('chi_tiet_giao_dich').select('*').eq('id_ho_so_dich_vu', fileId).order('thoi_gian_giao_dich', { ascending: false })
          : Promise.resolve({ data: [] }),
        ledgerQuery
      ]);

      set({
        transactionDetails: details || [],
        transactions: details || [],
        ledger: ledgerData || []
      });

      if (details?.length > 0) {
        set({ selectedDetail: details[0] });
      } else {
        set({ selectedDetail: null });
      }
    } catch (err) {
      console.error('Lỗi tải chi tiết giao dịch:', err);
    }
  },

  // Thêm giao dịch chi tiết
  addTransactionDetail: async (detailPayload) => {
    try {
      const activeFile = get().selectedServiceFile;
      const activeSvc = get().selectedService;
      if (!activeFile || !activeSvc) return;

      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const rand8 = Math.random().toString(36).substring(2, 10).toUpperCase().padEnd(8, '0');
      const generatedId = `${yyyy}-${mm}-${dd}-${rand8}`;

      const fullPayload = {
        ...detailPayload,
        id_chi_tiet_giao_dich: generatedId,
        id_ho_so_dich_vu: activeFile.id_ho_so_dich_vu,
        thoi_gian_giao_dich: new Date().toISOString(),
        id_diem_ban: detailPayload.id_diem_ban || get().user?.id_diem_ban || null,
        id_tai_khoan_tao: detailPayload.id_tai_khoan_tao || get().user?.id_tai_khoan || null
      };

      const { data, error } = await supabase.from('chi_tiet_giao_dich').insert([fullPayload]).select().single();

      if (!error) {
        await get().fetchTransactionDetails(activeFile.id_ho_so_dich_vu);
        await get().fetchCustomers();
        return data;
      } else {
        console.error('Lỗi Supabase khi thêm giao dịch:', error);
        throw error;
      }
    } catch (err) {
      console.error('Lỗi thêm giao dịch chi tiết:', err);
    }
  },

  updateTransactionStatus: async (ckctId, statusId) => {
    try {
      await supabase
        .from('chi_tiet_giao_dich')
        .update({ id_trang_thai: statusId })
        .eq('id_chi_tiet_giao_dich', ckctId);

      if (get().selectedServiceFile) {
        await get().fetchTransactionDetails(get().selectedServiceFile.id_ho_so_dich_vu);
      }
    } catch (err) {
      console.error(err);
    }
  },

  // Thêm mã hợp đồng mới
  addContract: async (contractPayload) => {
    try {
      const fullPayload = {
        ...contractPayload,
        id_diem_ban: contractPayload.id_diem_ban || get().user?.id_diem_ban || null
      };

      const { data, error } = await supabase.from('ma_hop_dong').insert([fullPayload]).select().single();
      if (!error && data) {
        set(state => ({ ma_hop_dong: [...state.ma_hop_dong, data] }));
        return data;
      }
    } catch (err) {
      console.error('Lỗi thêm mã hợp đồng:', err);
    }
  },

  // Cập nhật chữ ký
  updateSignature: async (sigData) => {
    try {
      const id = get().signature.id_chu_ky || 'sig-1';
      const { data } = await supabase
        .from('quan_ly_chu_ky')
        .upsert({ ...sigData, id_chu_ky: id })
        .select()
        .single();
      if (data) set({ signature: data });
    } catch (err) {
      console.error(err);
    }
  },

  // Legacy methods
  fetchTransactions: async () => {
    await get().fetchTransactionDetails(get().selectedServiceFile?.id_ho_so_dich_vu);
  },

  reorderMenuGroups: (startIndex, endIndex) => {
    const list = [...get().menuGroups];
    const [removed] = list.splice(startIndex, 1);
    list.splice(endIndex, 0, removed);
    set({ menuGroups: list });
  }
}));

export default useAppStore;
