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
  historyTransactions: [],
  historyFiles: [],
  isLoadingDetails: false,
  isHistoryLoading: false,

  // Setters
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedServiceFile: (file) => set({ selectedServiceFile: file }),
  setSelectedDetail: (detail) => set({ selectedDetail: detail }),

  // Flag: đã khởi động hệ thống chưa
  isBootstrapped: false,
  isBootstrapping: true,
  
  refetchTrigger: 0,
  triggerRefetch: () => set(state => ({ refetchTrigger: state.refetchTrigger + 1 })),

  // Actions
  fetchSystemConfig: async () => {
    // Chỉ fetch 1 lần trong suốt phiên làm việc
    // Chỉ bỏ qua nếu đã bootstrap thành công. Cho phép retry khi db offline.
    if (get().isBootstrapped && get().dbOnline) return;
    set({ isBootstrapping: true });
    try {
      // Hàm helper để fetch đệ quy toàn bộ dữ liệu (bỏ qua giới hạn 1000 dòng)
      const fetchAllRecords = async (query) => {
        let allData = [];
        let from = 0;
        const step = 1000;
        let hasMore = true;
        while (hasMore) {
          const { data, error } = await query.range(from, from + step - 1);
          if (error || !data || data.length === 0) {
            hasMore = false;
          } else {
            allData = [...allData, ...data];
            from += step;
            if (data.length < step) hasMore = false;
          }
        }
        return { data: allData };
      };

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
        fetchAllRecords(supabase.from('ma_hop_dong').select('*').order('ngay_tao', { ascending: false })),
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
        isBootstrapped: true,
        isBootstrapping: false
      });

      if (resLdv?.length > 0 && !get().selectedService) {
        const defaultSvc = resLdv.find(s => s.ma_viet_tat === 'CK') || resLdv[0];
        set({ selectedService: defaultSvc });
      }
    } catch (err) {
      console.error('Lỗi khi nạp cấu hình hệ thống:', err);
      set({ dbOnline: false, isBootstrapping: false });
    }
  },

  // Khách hàng CRM
  fetchCustomers: async () => {
    try {
      const fetchAllRecords = async (query) => {
        let allData = [];
        let from = 0;
        const step = 1000;
        let hasMore = true;
        while (hasMore) {
          const { data, error } = await query.range(from, from + step - 1);
          if (error || !data || data.length === 0) {
            hasMore = false;
          } else {
            allData = [...allData, ...data];
            from += step;
            if (data.length < step) hasMore = false;
          }
        }
        return { data: allData, error: null };
      };

      const user = useAuthStore.getState().user;
      let query = supabase.from('khach_hang').select('*').order('ngay_tao', { ascending: false });
      if (user?.id_diem_ban) {
        query = query.or(`id_diem_ban.eq.${user.id_diem_ban},id_diem_ban.is.null`);
      }
      const { data, error } = await fetchAllRecords(query);
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

  fetchContracts: async () => {
    try {
      const user = useAuthStore.getState().user;
      let query = supabase.from('ma_hop_dong').select('*').order('ngay_tao', { ascending: false });
      if (user?.id_diem_ban) {
        query = query.eq('id_diem_ban', user.id_diem_ban);
      }
      
      // Use the generic pagination fetcher pattern from fetchSystemConfig or just basic fetch if less than 1000
      const { data, error } = await query;
      if (!error) {
        set({ ma_hop_dong: data || [] });
      }
    } catch (err) {
      console.error('Lỗi tải hợp đồng:', err);
    }
  },

  addContract: async (contract) => {
    try {
      const clean = Object.fromEntries(
        Object.entries(contract).filter(([, v]) => v !== '' && v !== undefined && v !== null)
      );
      
      const user = useAuthStore.getState().user;
      if (user?.id_diem_ban) clean.id_diem_ban = user.id_diem_ban;
      if (user?.id_tai_khoan) clean.id_tai_khoan_tao = user.id_tai_khoan;

      const { data, error } = await supabase.from('ma_hop_dong').insert([clean]).select().single();
      if (!error && data) {
        set(state => ({ ma_hop_dong: [data, ...state.ma_hop_dong] }));
        return data;
      }
    } catch (err) {
      console.error('Lỗi thêm hợp đồng:', err);
    }
  },

  deleteContract: async (contractId) => {
    try {
      const { error } = await supabase.from('ma_hop_dong').delete().eq('id_ma_hop_dong', contractId);
      if (!error) {
        set(state => ({
          ma_hop_dong: state.ma_hop_dong.filter(c => c.id_ma_hop_dong !== contractId)
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Lỗi xóa hợp đồng:', err);
      return false;
    }
  },


  // Chọn dịch vụ
  selectService: (service) => {
    set({ selectedService: service, activeTab: 'transactions' });
  },

  hasMoreServiceFiles: false,
  isLoadingFiles: false,

  // Lấy hồ sơ dịch vụ
  fetchServiceFiles: async (serviceId = null, searchTerm = '', page = 1, pageSize = 40, isAppend = false) => {
    // Khi tải trang mới (không phải cuộn thêm): bật cả 3 cột loading cùng lúc
    if (!isAppend) set({ isLoadingFiles: true, isLoadingDetails: true });
    try {
      const user = useAuthStore.getState().user;
      
      let filesQuery = supabase.from('vw_ho_so_dich_vu_v2')
        .select('*', { count: 'exact' })
        .order('ngay_sua', { ascending: false });

      if (user?.id_diem_ban) {
        filesQuery = filesQuery.eq('id_diem_ban', user.id_diem_ban);
      }

      if (serviceId) {
        filesQuery = filesQuery.eq('id_loai_dich_vu', serviceId);
      }

      if (searchTerm) {
        filesQuery = filesQuery.ilike('search_text', `%${searchTerm.toLowerCase()}%`);
      }

      // Pagination
      const offset = (page - 1) * pageSize;
      filesQuery = filesQuery.range(offset, offset + pageSize - 1);

      const { data: flatData, count, error } = await filesQuery;
      
      if (error) throw error;

      // Chuyển flatData thành dạng nested object mà Transactions.jsx đang dùng
      const filesData = (flatData || []).map(row => ({
        ...row,
        ma_hop_dong: {
          id_ma_hop_dong: row.id_ma_hop_dong,
          ma_hop_dong: row.ma_hop_dong_str,
          chu_hop_dong: row.chu_hop_dong,
          id_danh_muc_dich_vu: row.id_danh_muc_dich_vu,
          sys_danh_muc_dich_vu: {
            id_loai_dich_vu: row.id_loai_dich_vu
          }
        }
      }));

      // Chỉ fetch transaction của những hồ sơ trên trang hiện tại để chống lag
      const fileIds = filesData.map(f => f.id_ho_so_dich_vu);
      let txQuery = supabase.from('chi_tiet_giao_dich')
        .select('*')
        .in('id_ho_so_dich_vu', fileIds.length > 0 ? fileIds : ['00000000-0000-0000-0000-000000000000'])
        .order('thoi_gian_giao_dich', { ascending: false });

      if (user?.id_diem_ban) {
        txQuery = txQuery.or(`id_diem_ban.eq.${user.id_diem_ban},id_diem_ban.is.null`);
      }
      
      const { data: allTxData } = await txQuery;

      set((state) => {
        const newFiles = isAppend 
          ? filesData.filter(newItem => !state.serviceFiles.some(oldItem => oldItem.id_ho_so_dich_vu === newItem.id_ho_so_dich_vu))
          : filesData;
        
        const newTxs = isAppend
          ? (allTxData || []).filter(newTx => !state.allTransactions.some(oldTx => oldTx.id_chi_tiet_giao_dich === newTx.id_chi_tiet_giao_dich))
          : (allTxData || []);

        return { 
          serviceFiles: isAppend ? [...state.serviceFiles, ...newFiles] : newFiles, 
          totalServiceFiles: count,
          hasMoreServiceFiles: (offset + pageSize) < count,
          allTransactions: isAppend ? [...state.allTransactions, ...newTxs] : newTxs,
          isLoadingFiles: false
        };
      });

      if (filesData.length > 0) {
        if (!isAppend) {
          const firstFile = filesData[0];
          set({ selectedServiceFile: firstFile });
          await get().fetchTransactionDetails(firstFile.id_ho_so_dich_vu);
        }
      } else if (!isAppend) {
        set({ selectedServiceFile: null, selectedDetail: null, transactionDetails: [], isLoadingDetails: false });
      }
    } catch (err) {
      console.error('Lỗi lấy hồ sơ dịch vụ:', err);
      set({ hasMoreServiceFiles: false, isLoadingFiles: false, isLoadingDetails: false });
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
    set({ isLoadingDetails: true });
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
        ledger: ledgerData || [],
        isLoadingDetails: false
      });

      if (details?.length > 0) {
        set({ selectedDetail: details[0] });
      } else {
        set({ selectedDetail: null });
      }
    } catch (err) {
      console.error('Lỗi tải chi tiết giao dịch:', err);
      set({ isLoadingDetails: false });
    }
  },

  // Thêm giao dịch chi tiết
  fetchHistoryTransactions: async (fromDate, toDate) => {
    set({ isHistoryLoading: true });
    try {
      const user = useAuthStore.getState().user;
      
      let txQuery = supabase.from('chi_tiet_giao_dich').select('*').order('thoi_gian_giao_dich', { ascending: false });
      
      if (user?.id_diem_ban) {
        txQuery = txQuery.or(`id_diem_ban.eq.${user.id_diem_ban},id_diem_ban.is.null`);
      }
      
      if (fromDate && toDate) {
        txQuery = txQuery.gte('thoi_gian_giao_dich', fromDate.toISOString()).lte('thoi_gian_giao_dich', toDate.toISOString());
      }
      
      const { data: txs, error: txError } = await txQuery;
      if (txError) throw txError;
      
      const fileIds = [...new Set((txs || []).map(t => t.id_ho_so_dich_vu).filter(Boolean))];
      
      let files = [];
      if (fileIds.length > 0) {
        // Chia nhỏ array nếu quá lớn (thường 1 ngày thì không quá giới hạn IN của Supabase)
        const { data: filesData, error: filesError } = await supabase.from('vw_ho_so_dich_vu_v2').select('*').in('id_ho_so_dich_vu', fileIds);
        if (!filesError) {
          files = (filesData || []).map(row => ({
            ...row,
            ma_hop_dong: {
              id_ma_hop_dong: row.id_ma_hop_dong,
              ma_hop_dong: row.ma_hop_dong_str,
              chu_hop_dong: row.chu_hop_dong,
              id_danh_muc_dich_vu: row.id_danh_muc_dich_vu,
              sys_danh_muc_dich_vu: {
                id_loai_dich_vu: row.id_loai_dich_vu
              }
            }
          }));
        }
      }
      
      set({ historyTransactions: txs || [], historyFiles: files });
    } catch(err) {
      console.error('Lỗi fetchHistoryTransactions:', err);
    } finally {
      set({ isHistoryLoading: false });
    }
  },

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

      // Lọc bỏ các trường UI không có trong database schema (loai_cuoc_phi, so_tien_giam_ck)
      const { loai_cuoc_phi, so_tien_giam_ck, ...cleanPayload } = detailPayload;

      const currentUser = useAuthStore.getState().user;

      const fullPayload = {
        ...cleanPayload,
        id_chi_tiet_giao_dich: generatedId,
        id_ho_so_dich_vu: activeFile.id_ho_so_dich_vu,
        thoi_gian_giao_dich: new Date().toISOString(),
        id_diem_ban: detailPayload.id_diem_ban || currentUser?.id_diem_ban || null,
        id_tai_khoan_tao: detailPayload.id_tai_khoan_tao || currentUser?.id_tai_khoan || null
      };

      const { data, error } = await supabase.from('chi_tiet_giao_dich').insert([fullPayload]).select().single();

      if (!error) {
        await get().fetchTransactionDetails(activeFile.id_ho_so_dich_vu);
        await get().fetchCustomers();
        // Gọi trigger để component Transactions.jsx tự động fetch lại đúng với searchTerm và pagination hiện tại
        get().triggerRefetch();
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
