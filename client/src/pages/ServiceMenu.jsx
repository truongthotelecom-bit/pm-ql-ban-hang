import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import { MoreOutlined } from '@ant-design/icons';
import { ArrowLeft, Layers, RefreshCw, WifiOff, Search, History } from 'lucide-react';

export default function ServiceMenu() {
  const store = useAppStore();
  const navigate = useNavigate();
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelectService = async (service) => {
    await store.selectService(service);
    navigate('/');
  };

  const handleRetry = async () => {
    setRetrying(true);
    await store.fetchSystemConfig();
    setRetrying(false);
  };

  // Định nghĩa màu gradient cho các nhóm dịch vụ (Ánh xạ theo UUID)
  const getGradient = (groupId) => {
    const gradients = {
      'c0000001-0000-0000-0000-000000000001': 'from-orange-500 to-amber-600',
      'c0000001-0000-0000-0000-000000000002': 'from-blue-500 to-indigo-600',
      'c0000001-0000-0000-0000-000000000003': 'from-red-500 to-rose-600',
      'c0000001-0000-0000-0000-000000000004': 'from-teal-500 to-cyan-600',
      'c0000001-0000-0000-0000-000000000005': 'from-purple-500 to-fuchsia-600',
      'c0000001-0000-0000-0000-000000000006': 'from-emerald-500 to-teal-600',
      'c0000001-0000-0000-0000-000000000007': 'from-cyan-500 to-blue-600'
    };
    return gradients[groupId] || 'from-violet-500 to-indigo-600';
  };

  // UI: Hiển thị lưới các Nhóm Dịch Vụ
  const renderGroups = () => {
    // Đang tải hệ thống (lúc mới F5) -> Hiện spinner xoay xoay
    if (store.isBootstrapping) {
      return (
        <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-violet-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 animate-spin"></div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-200 mb-1">Đang tải danh mục...</h3>
            <p className="text-sm text-gray-500 max-w-xs">Hệ thống đang đồng bộ dữ liệu, vui lòng đợi.</p>
          </div>
        </div>
      );
    }

    // Offline / chưa có data → hiện nút retry (Sau khi loading xong mà dbOnline false)
    if (!store.dbOnline || store.menuGroups.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
            <WifiOff size={36} className="text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-200 mb-1">Mất kết nối máy chủ</h3>
            <p className="text-sm text-gray-500 max-w-xs">Không thể tải danh mục dịch vụ. Vui lòng kiểm tra mạng hoặc thử lại.</p>
          </div>
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-violet-600/30"
          >
            <RefreshCw size={16} className={retrying ? 'animate-spin' : ''} />
            {retrying ? 'Đang kết nối lại...' : 'Thử lại kết nối'}
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {store.menuGroups.map(group => {
          const count = store.services.filter(s => s.id_nhom === group.id_nhom || s.id_nhom_dich_vu === group.id_nhom).length;
          return (
            <div
              key={group.id_nhom}
              onClick={() => setSelectedGroupId(group.id_nhom)}
              className="p-3 md:p-5 rounded-2xl bg-[#0d1426]/60 backdrop-blur-md border border-white/5 hover:border-violet-500/40 hover:bg-[#131b33]/80 transition-all cursor-pointer flex flex-col items-center justify-start gap-2 text-center group hover:scale-[1.02] active:scale-95 shadow-lg shadow-black/20"
            >
              <div className={`w-10 h-10 md:w-14 md:h-14 shrink-0 rounded-full bg-gradient-to-tr ${getGradient(group.id_nhom)} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Layers className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="flex flex-col flex-1 items-center justify-between">
                <h3 className="font-bold text-[10px] md:text-sm text-gray-200 tracking-wide uppercase line-clamp-2 leading-tight">{group.ten_nhom}</h3>
                <span className="text-[9px] md:text-[10px] text-gray-500 font-semibold bg-white/5 px-2 py-0.5 rounded-full mt-1.5 inline-block shrink-0">{count} DV</span>
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
              onClick={() => handleSelectService(service)}
              className="p-4 rounded-xl bg-[#0d1426]/80 backdrop-blur-md border border-gray-800 hover:border-violet-500/50 hover:bg-[#131b33] transition-all flex items-center justify-between cursor-pointer group hover:scale-[1.02] active:scale-95 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${getGradient(selectedGroupId)} flex items-center justify-center text-xl shadow-md group-hover:rotate-3 transition-transform duration-300 overflow-hidden`}>
                  {service.icon?.startsWith('http')
                    ? <img src={service.icon} alt="icon" className="w-8 h-8 object-contain drop-shadow-md" />
                    : (service.icon || '💼')}
                </div>
                <div>
                  <span className="font-bold text-xs text-gray-200 tracking-wide uppercase block">{service.ten_danh_muc}</span>
                  <span className="text-[10px] text-violet-400/80 font-bold tracking-wider">{service.ma_viet_tat}</span>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleSelectService(service); }}
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

  const renderSearchResults = () => {
    const filtered = store.services.filter(s => 
      (s.ten_danh_muc || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (s.ma_viet_tat || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
          {filtered.map(service => (
            <div
              key={service.id_loai_dich_vu}
              onClick={() => handleSelectService(service)}
              className="p-4 rounded-xl bg-[#0d1426]/80 backdrop-blur-md border border-gray-800 hover:border-violet-500/50 hover:bg-[#131b33] transition-all flex items-center justify-between cursor-pointer group hover:scale-[1.02] active:scale-95 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${getGradient(service.id_nhom || service.id_nhom_dich_vu)} flex items-center justify-center text-xl shadow-md group-hover:rotate-3 transition-transform duration-300 overflow-hidden`}>
                  {service.icon?.startsWith('http')
                    ? <img src={service.icon} alt="icon" className="w-8 h-8 object-contain drop-shadow-md" />
                    : (service.icon || '💼')}
                </div>
                <div>
                  <span className="font-bold text-xs text-gray-200 tracking-wide uppercase block">{service.ten_danh_muc}</span>
                  <span className="text-[10px] text-violet-400/80 font-bold tracking-wider">{service.ma_viet_tat}</span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full p-8 text-center text-gray-500 border border-dashed border-gray-700 rounded-xl bg-[#0d1426]/40 backdrop-blur-sm">
              Không tìm thấy dịch vụ nào phù hợp.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRecentServices = () => {
    if (!store.recentServices || store.recentServices.length === 0) return null;
    
    return (
      <div className="space-y-3 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <h2 className="text-[11px] md:text-xs font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider"><History size={14} /> DÙNG GẦN ĐÂY</h2>
        <div className="grid grid-cols-4 gap-2 md:gap-4">
          {store.recentServices.map(service => (
            <div
              key={service.id_loai_dich_vu}
              onClick={() => handleSelectService(service)}
              className="p-2 md:p-3 rounded-2xl bg-[#0d1426]/60 backdrop-blur-md border border-white/5 hover:border-violet-500/40 hover:bg-[#131b33]/80 transition-all cursor-pointer flex flex-col items-center justify-start gap-1 md:gap-2 text-center group hover:scale-[1.02] active:scale-95 shadow-lg shadow-black/20"
            >
              <div className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-xl bg-gradient-to-tr ${getGradient(service.id_nhom || service.id_nhom_dich_vu)} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 overflow-hidden`}>
                {service.icon?.startsWith('http')
                  ? <img src={service.icon} alt="icon" className="w-6 h-6 object-contain drop-shadow-md" />
                  : <span className="text-xl md:text-2xl">{service.icon || '💼'}</span>}
              </div>
              <div className="flex flex-col flex-1 items-center justify-start w-full">
                <h3 className="font-bold text-[9px] md:text-xs text-gray-200 tracking-wide uppercase line-clamp-2 leading-tight w-full">{service.ten_danh_muc}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={20} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-4 py-3.5 border border-white/10 rounded-2xl leading-5 bg-[#0d1426]/80 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 sm:text-sm transition-all shadow-lg backdrop-blur-md"
          placeholder="Tìm kiếm dịch vụ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Hiển thị Lưới dựa vào State */}
      <div className="pt-2">
        {searchTerm ? (
          renderSearchResults()
        ) : !selectedGroupId ? (
          <>
            {renderRecentServices()}
            <div className="space-y-3">
              <h2 className="text-[11px] md:text-xs font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider"><Layers size={14} /> TẤT CẢ DANH MỤC</h2>
              {renderGroups()}
            </div>
          </>
        ) : (
          renderServices()
        )}
      </div>
    </div>
  );
}
