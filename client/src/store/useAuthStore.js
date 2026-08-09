import { create } from 'zustand';
import { supabase } from '../config/supabase';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const savedUrl = localStorage.getItem('supabase_url');
const savedKey = localStorage.getItem('supabase_key');

export const useAuthStore = create((set, get) => ({
  isConfigured: !!((envUrl && envKey) || (savedUrl && savedKey)),

  user: null, 
  session: null, 
  permissions: [], 
  isLoading: true, 
  authSubscription: null,
  
  initAuth: async () => {
    try {
      if (!supabase) {
        // --- MOCK MODE: Khôi phục phiên giả lập từ localStorage ---
        const mockSession = localStorage.getItem('mock_session');
        if (mockSession) {
          const user = JSON.parse(mockSession);
          set({ 
            session: { access_token: 'mock-token', user: { id: user.id_tai_khoan } }, 
            user: user,
            permissions: [],
            isLoading: false
          });
        } else {
          set({ isLoading: false });
        }
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        await get().fetchUserProfile(session.user.id);
        set({ session });
      } else {
        set({ user: null, permissions: [], session: null });
      }

      const currentSub = get().authSubscription;
      if (currentSub) {
        currentSub.unsubscribe();
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        set({ session: currentSession });
        if (currentSession && event === 'SIGNED_IN') {
          await get().fetchUserProfile(currentSession.user.id);
        } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          set({ user: null, permissions: [], session: null });
        }
      });
      
      set({ authSubscription: subscription });
    } catch (error) {
      console.error('Lỗi khởi tạo Auth:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    if (!supabase) {
      // --- MOCK LOGIN ---
      if (email === 'admin' && password === 'admin') {
        const mockAdmin = {
          id_tai_khoan: 'mock-admin-id',
          username: 'admin',
          ho_ten: 'Quản trị viên (Mock)',
          dm_nhom_quyen: { is_admin: true }
        };
        localStorage.setItem('mock_session', JSON.stringify(mockAdmin));
        set({ 
          session: { access_token: 'mock-token', user: { id: 'mock-admin-id' } }, 
          user: mockAdmin
        });
        return { user: { id: 'mock-admin-id' } };
      } else if (email === 'staff' && password === 'staff') {
        const mockStaff = {
          id_tai_khoan: 'mock-staff-id',
          username: 'staff',
          ho_ten: 'Nhân viên (Mock)',
          dm_nhom_quyen: { is_admin: false }
        };
        localStorage.setItem('mock_session', JSON.stringify(mockStaff));
        set({ 
          session: { access_token: 'mock-token', user: { id: 'mock-staff-id' } }, 
          user: mockStaff
        });
        return { user: { id: 'mock-staff-id' } };
      }
      throw new Error("Tài khoản giả lập không đúng (Hãy thử admin/admin hoặc staff/staff)");
    }
    
    // Nếu nhập username thay vì email, tự động thêm đuôi giả (có thể thay đổi tùy hệ thống)
    let loginEmail = email;
    if (!email.includes('@')) {
      loginEmail = `${email}@auracrm.com`; // Ví dụ
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  logout: async () => {
    if (!supabase) {
      // --- MOCK LOGOUT ---
      localStorage.removeItem('mock_session');
      set({ user: null, permissions: [], session: null });
      return;
    }

    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Lỗi Supabase signOut:', err);
      }
    }
    set({ user: null, permissions: [], session: null });
  },

  fetchUserProfile: async (userId) => {
    if (!supabase) return;
    try {
      const { data: profile, error: profileErr } = await supabase
        .from('tai_khoan_nguoi_dung')
        .select(`
          *,
          dm_nhom_quyen (ma_quyen, ten_nhom_quyen, is_admin)
        `)
        .eq('id_tai_khoan', userId)
        .single();
        
      if (profileErr && profileErr.code !== 'PGRST116') {
        throw profileErr; // PGRST116 is not found, means user exists in Auth but not in public table yet
      }

      if (profile) {
        if (profile.is_active === false) {
          set({ user: null, permissions: [], session: null, isLoading: false });
          await supabase.auth.signOut();
          alert('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
          return;
        }

        let perms = [];
        if (!profile.dm_nhom_quyen?.is_admin) {
          const { data: permData, error: permErr } = await supabase
            .from('phan_quyen_chuc_nang')
            .select(`
              can_view, can_add, can_edit, can_delete,
              dm_chuc_nang (ma_chuc_nang, module)
            `)
            .eq('id_nhom_quyen', profile.id_nhom_quyen);
            
          if (permErr) throw permErr;
          perms = permData || [];
        }

        set({ 
          user: profile, 
          permissions: perms,
          isLoading: false
        });
      } else {
        // Fallback user if public table profile is missing
        set({
           user: { id_tai_khoan: userId, username: 'Unknown User' },
           permissions: [],
           isLoading: false
        });
      }
    } catch (error) {
      console.error('Lỗi lấy Profile:', error);
    }
  },

  hasPermission: (moduleCode, actionType = 'can_view') => {
    const state = get();
    if (!state.user) return false;
    if (state.user.dm_nhom_quyen?.is_admin) return true;
    const perm = state.permissions.find(p => p.dm_chuc_nang?.ma_chuc_nang === moduleCode);
    return perm ? !!perm[actionType] : false;
  }
}));

export default useAuthStore;
