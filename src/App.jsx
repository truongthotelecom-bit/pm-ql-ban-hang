import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import AuthGuard from './components/AuthGuard';
import IndexPage from './pages/IndexPage';
import LoginPage from './pages/LoginPage';

// Admin pages (lazy)
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminCategoryPage = lazy(() => import('./pages/admin/AdminCategoryPage'));
const AdminStores = lazy(() => import('./pages/admin/AdminStores'));

// Main pages (lazy)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ServiceMenu = lazy(() => import('./pages/ServiceMenu'));
const Transactions = lazy(() => import('./pages/Transactions'));
const TransactionHistory = lazy(() => import('./pages/TransactionHistory'));
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const StaffManagement = lazy(() => import('./pages/StaffManagement'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm font-medium animate-pulse">Đang tải...</p>
      </div>
    </div>
  );
}

export default function App() {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Route cho Index (Nhân viên & Admin đều vào được) */}
          <Route 
            path="/" 
            element={
              <AuthGuard>
                <IndexPage />
              </AuthGuard>
            } 
          >
            <Route index element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
            <Route path="dich-vu" element={<Suspense fallback={<PageLoader />}><ServiceMenu /></Suspense>} />
            <Route path="giao-dich" element={<Suspense fallback={<PageLoader />}><Transactions /></Suspense>} />
            <Route path="lich-su" element={<Suspense fallback={<PageLoader />}><TransactionHistory /></Suspense>} />
            <Route path="khach-hang" element={<Suspense fallback={<PageLoader />}><CustomersPage /></Suspense>} />
            <Route path="cai-dat" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
            <Route path="nhan-vien" element={<Suspense fallback={<PageLoader />}><StaffManagement /></Suspense>} />
          </Route>

          {/* Protected Route cho Admin (Chỉ Admin mới vào được) */}
          <Route 
            path="/admin" 
            element={
              <AuthGuard requireAdmin={true}>
                <Suspense fallback={<PageLoader />}><AdminLayout /></Suspense>
              </AuthGuard>
            }
          >
            <Route index element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
            <Route path="danh-muc" element={<Navigate to="/admin/danh-muc/dm_trang_thai_giao_dich" replace />} />
            <Route path="danh-muc/:tableName" element={<Suspense fallback={<PageLoader />}><AdminCategoryPage /></Suspense>} />
            <Route path="diem-ban" element={<Suspense fallback={<PageLoader />}><AdminStores /></Suspense>} />
            <Route path="tai-khoan" element={<div className="p-4 text-white">Quản lý Tài khoản (Đang xây dựng)</div>} />
            <Route path="cai-dat" element={<div className="p-4 text-white">Cài đặt hệ thống (Đang xây dựng)</div>} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}
