import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm">
          <h3 className="text-slate-400 text-sm font-medium">Tổng danh mục</h3>
          <p className="text-3xl font-bold text-white mt-2">124</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm">
          <h3 className="text-slate-400 text-sm font-medium">Tài khoản User</h3>
          <p className="text-3xl font-bold text-white mt-2">8</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm">
          <h3 className="text-slate-400 text-sm font-medium">Trạng thái</h3>
          <p className="text-3xl font-bold text-emerald-400 mt-2">Online</p>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 text-white">Chào mừng đến với trang Quản trị</h2>
        <p className="text-slate-400 leading-relaxed">
          Tại đây bạn có thể quản lý các bảng danh mục (phương thức thanh toán, trạng thái giao dịch, nhóm menu, dịch vụ...), 
          quản lý tài khoản người dùng và thiết lập các thông số hệ thống.
          <br /><br />
          Sử dụng thanh menu bên trái để điều hướng đến các tính năng tương ứng.
        </p>
      </div>
    </div>
  );
}
