import React, { useState } from 'react';
import useAppStore from '../store/useAppStore';
import { MoreOutlined } from '@ant-design/icons';
import { ArrowLeft, Layers } from 'lucide-react';

export default function ServiceMenu() {
  const store = useAppStore();
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // Định nghĩa màu gradient cho các nhóm dịch vụ (Ánh xạ theo UUID)
  const getGradient = (groupId) => {
    const gradients = {
      'c0000001-0000-0000-0000-000000000001': 'from-orange-500 to-amber-600',    // THU HỘ
      'c0000001-0000-0000-0000-000000000002': 'from-blue-500 to-indigo-600',      // CHUYỂN TIỀN
      'c0000001-0000-0000-0000-000000000003': 'from-red-500 to-rose-600',        // CƯỚC VIỄN THÔNG
      'c0000001-0000-0000-0000-000000000004': 'from-teal-500 to-cyan-600',        // NẠP RÚT DÒNG TIỀN
      'c0000001-0000-0000-0000-000000000005': 'from-purple-500 to-fuchsia-600',  // KHÁCH HÀNG
      'c0000001-0000-0000-0000-000000000006': 'from-emerald-500 to-teal-600',    // DỊCH VỤ KHÁC
      'c0000001-0000-0000-0000-000000000007': 'from-cyan-500 to-blue-600'        // QUẢN LÝ DỮ LIỆU
    };
    return gradients[groupId] || 'from-violet-500 to-indigo-600';
  };

  // UI: Hiển thị lưới các Nhóm Dịch Vụ
  const renderGroups = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {store.menuGroups.map(group => {
          const count = store.services.filter(s => s.id_nhom === group.id_nhom || s.id_nhom_dich_vu === group.id_nhom).length;
          
          return (
            <div
              key={group.id_nhom}
              onClick={() => setSelectedGroupId(group.id_nhom)}
              className="p-5 rounded-2xl bg-[#0d1426]/60 backdrop-blur-md border border-white/5 hover:border-violet-500/40 hover:bg-[#131b33]/80 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 text-center group hover:scale-[1.02] active:scale-95 shadow-lg shadow-black/20"
            >
              <div className={`w-14 h-14 rounded-full bg-gradient-to-tr ${getGradient(group.id_nhom)} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Layers size={24} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-200 tracking-wide uppercase">{group.ten_nhom}</h3>
                <span className="text-[10px] text-gray-500 font-semibold bg-white/5 px-2 py-0.5 rounded-full mt-1.5 inline-block">{count} dịch vụ</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // UI: Hiển thị danh sách dịch vụ thuộc một Nhóm đã chọn
  const renderServices = () => {
    const selectedGroup = store.menuGroups.find(g => g.id_nhom === selectedGroupId);
    const groupServices = store.services.filter(s => s.id_nhom === selectedGroupId || s.id_nhom_dich_vu === selectedGroupId);

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
        <button
          onClick={() => setSelectedGroupId(null)}
          className="flex items-center gap-2 text-gray-400 hover:text-white bg-[#0d1426]/60 backdrop-blur-md border border-white/5 hover:bg-white/10 px-4 py-3.5 rounded-xl text-sm font-bold transition-all w-full sm:w-auto justify-center hover:scale-[1.02] active:scale-95"
        >
          <ArrowLeft size={20} /> QUAY LẠI {selectedGroup?.ten_nhom ? `- ${selectedGroup.ten_nhom}` : ''}
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
          {groupServices.map(service => (
            <div 
              key={service.id_loai_dich_vu} 
              onClick={() => store.selectService(service)}
              className="p-4 rounded-xl bg-[#0d1426]/80 backdrop-blur-md border border-gray-800 hover:border-violet-500/50 hover:bg-[#131b33] transition-all flex items-center justify-between cursor-pointer group hover:scale-[1.02] active:scale-95 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${getGradient(selectedGroupId)} flex items-center justify-center text-xl shadow-md group-hover:rotate-3 transition-transform duration-300`}>
                  {service.icon || '💼'}
                </div>
                <div>
                  <span className="font-bold text-xs text-gray-200 tracking-wide uppercase block">{service.ten_danh_muc}</span>
                  <span className="text-[10px] text-violet-400/80 font-bold tracking-wider">{service.ma_viet_tat}</span>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  store.selectService(service);
                }} 
                className="text-gray-500 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all active:scale-95"
              >
                <MoreOutlined />
              </button>
            </div>
          ))}
          {groupServices.length === 0 && (
            <div className="col-span-full p-8 text-center text-gray-500 border border-dashed border-gray-700 rounded-xl bg-[#0d1426]/40 backdrop-blur-sm">
              Chưa có dịch vụ nào trong nhóm này.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Banner của Menu Dịch vụ */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10">
        <h1 className="text-xl font-bold text-white tracking-wide">💼 DANH MỤC DỊCH VỤ DỰ ÁN</h1>
        <p className="text-gray-400 text-sm mt-1">Chọn một phân hệ dịch vụ bất kỳ bên dưới để quản lý hồ sơ và thanh toán tự động.</p>
      </div>

      {/* Hiển thị Lưới dựa vào State */}
      <div className="pt-2">
        {!selectedGroupId ? renderGroups() : renderServices()}
      </div>
    </div>
  );
}
