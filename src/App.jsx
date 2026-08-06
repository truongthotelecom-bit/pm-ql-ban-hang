import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import AuthGuard from './components/AuthGuard';
import IndexPage from './pages/IndexPage';
import LoginPage from './pages/LoginPage';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCategoryPage from './pages/admin/AdminCategoryPage';
// Import các trang Admin khác sau này...

export default function App() {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    // Khởi tạo Auth State khi load ứng dụng
    initAuth();
  }, [initAuth]);

  return (
    <Router>
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
        />

        {/* Protected Route cho Admin (Chỉ Admin mới vào được) */}
        <Route 
          path="/admin" 
          element={
            <AuthGuard requireAdmin={true}>
              <AdminLayout />
            </AuthGuard>
          }
        >
          {/* Outlet của AdminLayout */}
          <Route index element={<AdminDashboard />} />
          <Route path="danh-muc" element={<AdminCategoryPage />} />
          <Route path="tai-khoan" element={<div className="p-4 text-white">Quản lý Tài khoản (Đang xây dựng)</div>} />
          <Route path="cai-dat" element={<div className="p-4 text-white">Cài đặt hệ thống (Đang xây dựng)</div>} />
        </Route>
      </Routes>
    </Router>
  );
}
