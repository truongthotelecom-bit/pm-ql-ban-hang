import React, { useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import { ArrowUpRight, ArrowDownRight, Users, Repeat } from 'lucide-react';
import { PlusCircleOutlined } from '@ant-design/icons';

export default function Dashboard({ onNewTransaction }) {
  const store = useAppStore();

  useEffect(() => {
    store.fetchSystemConfig();
    store.fetchCustomers();
    // Fetch all transactions to calculate stats
    store.fetchTransactions();
  }, []);

  // Tổng doanh thu thực đi từ toàn bộ dòng tiền chi tiết
  const totalRevenue = store.transactions.reduce((acc, t) => {
    return acc + parseFloat(t.so_tien_di || 0);
  }, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">📊 DASHBOARD BÁO CÁO</h1>
          <p className="text-gray-400 text-sm mt-1">Tổng quan dòng tiền và tình hình kinh doanh của hệ thống.</p>
        </div>
        <button
          onClick={onNewTransaction}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-violet-600/30 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <PlusCircleOutlined /> LẬP PHIẾU POS MỚI
        </button>
      </div>

      {/* Grid thống kê nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass-card flex items-center gap-4 border border-white/5 hover:border-violet-500/20 transition-all group hover:bg-white/5">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowUpRight size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-wide">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)}
            </h3>
            <p className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">Doanh Thu Thu POS</p>
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card flex items-center gap-4 border border-white/5 hover:border-violet-500/20 transition-all group hover:bg-white/5">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowDownRight size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-wide">0 đ</h3>
            <p className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">Phí Chi Ngoài</p>
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card flex items-center gap-4 border border-white/5 hover:border-violet-500/20 transition-all group hover:bg-white/5">
          <div className="w-12 h-12 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-wide">{store.customers.length}</h3>
            <p className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">Khách Hàng CRM</p>
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card flex items-center gap-4 border border-white/5 hover:border-violet-500/20 transition-all group hover:bg-white/5">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Repeat size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-wide">{store.transactions.length}</h3>
            <p className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">Tổng Phiếu POS</p>
          </div>
        </div>
      </div>
      
      {/* Không gian trống để sau này thêm Biểu đồ */}
      <div className="p-8 mt-4 rounded-2xl glass-panel border border-dashed border-white/10 flex flex-col items-center justify-center min-h-[300px] text-gray-500 gap-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-gray-600">Khu vực phát triển biểu đồ</p>
      </div>
    </div>
  );
}
