import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const AuthGuard = ({ children, requireAdmin = false }) => {
  const { session, user, isLoading, initAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) {
      initAuth();
    }
  }, [isLoading, initAuth]);

  if (isLoading || (session && !user)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#080c14]">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-violet-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400">Đang tải dữ liệu người dùng...</p>
      </div>
    );
  }

  // Not logged in
  if (!session && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Active check
  if (user && user.is_active === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#080c14] p-6 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-2">Tài Khoản Bị Khoá</h1>
        <p className="text-slate-400">Tài khoản của bạn đã bị vô hiệu hoá. Vui lòng liên hệ Admin.</p>
        <button 
          onClick={() => useAuthStore.getState().logout()}
          className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          Đăng Xuất
        </button>
      </div>
    );
  }

  // Admin Check
  if (requireAdmin && !user?.dm_nhom_quyen?.is_admin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AuthGuard;
