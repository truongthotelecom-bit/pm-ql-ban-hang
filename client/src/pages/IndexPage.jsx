import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet, NavLink } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import useAuthStore from '../store/useAuthStore';
import { Dropdown } from 'antd';
import { AppstoreOutlined, CalendarOutlined, TeamOutlined, FileProtectOutlined, UserOutlined, SettingOutlined, LogoutOutlined, ControlOutlined, HomeOutlined } from '@ant-design/icons';
import { Sparkles, ChevronRight, ChevronDown } from 'lucide-react';
import TransactionDrawer from '../components/TransactionDrawer';
import ServiceMenu from './ServiceMenu';
import Transactions from './Transactions';

export default function IndexPage() {
  const store = useAppStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(null);

  useEffect(() => {
    store.fetchSystemConfig();
    store.fetchCustomers();
    store.fetchTransactions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const userMenuItems = [
    ...(user?.dm_nhom_quyen?.is_admin ? [
      {
        key: 'admin',
        icon: <ControlOutlined />,
        label: 'Trang Quản Trị',
        onClick: () => navigate('/admin')
      },
      { type: 'divider' }
    ] : []),
    ...(user?.dm_nhom_quyen?.ma_quyen === 'CHU_DIEM_BAN' ? [
      {
        key: 'staff',
        icon: <TeamOutlined />,
        label: 'Quản lý Nhân Viên',
        onClick: () => navigate('/nhan-vien')
      },
      { type: 'divider' }
    ] : []),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: () => logout()
    }
  ];

  const getPageTitle = () => {
    if (location.pathname === '/') return store.selectedService ? store.selectedService.ten_danh_muc : 'Danh mục dịch vụ';
    if (location.pathname.startsWith('/lich-su')) return 'Lịch sử';
    if (location.pathname.startsWith('/khach-hang')) return 'Khách hàng';
    if (location.pathname.startsWith('/hop-dong')) return 'Hợp đồng';
    if (location.pathname.startsWith('/nhan-vien')) return 'Nhân viên';
    if (location.pathname.startsWith('/cai-dat')) return 'Cài đặt';
    return '';
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-violet-600/10 border border-violet-500/25 text-violet-400 shadow-md shadow-violet-600/5'
        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-1 ${isActive ? 'text-violet-400' : 'text-gray-500'}`;

  // Automatically expand group if a service is selected
  useEffect(() => {
    if (store.selectedService && !expandedGroup) {
      setExpandedGroup(store.selectedService.id_nhom);
    }
  }, [store.selectedService]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#080c14] text-gray-100">
      
      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className="w-64 bg-[#0d1426]/95 backdrop-blur-md border-r border-white/5 p-6 hidden md:flex flex-col gap-6 fixed top-0 bottom-0 left-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-600/35 flex-shrink-0">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg leading-tight tracking-wider bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">AURA FINTECH</h2>
            <p className="text-[10px] text-gray-500 font-semibold uppercase">Enterprise CRM</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5 flex-grow overflow-y-auto scrollbar-thin pr-2 -mr-2">
          
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2 px-2 mt-2">Hệ sinh thái dịch vụ</div>
          
          {store.menuGroups.map(group => {
            const groupServices = store.services.filter(s => s.id_nhom === group.id_nhom || s.id_nhom_dich_vu === group.id_nhom);
            if (groupServices.length === 0) return null;
            const isExpanded = expandedGroup === group.id_nhom;
            
            return (
              <div key={group.id_nhom} className="flex flex-col">
                <div 
                  onClick={() => setExpandedGroup(isExpanded ? null : group.id_nhom)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-gray-300 hover:bg-white/5 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <AppstoreOutlined className={isExpanded ? "text-violet-400" : "text-gray-500"} />
                    <span className={`font-bold uppercase text-xs tracking-wide ${isExpanded ? 'text-violet-300' : ''}`}>{group.ten_nhom}</span>
                  </div>
                  {isExpanded ? <ChevronDown size={14} className="text-violet-400" /> : <ChevronRight size={14} className="text-gray-600" />}
                </div>
                
                {isExpanded && (
                  <div className="flex flex-col gap-1 py-1 mt-1 border-l-2 border-white/5 ml-4 pl-3">
                    {groupServices.map(svc => {
                      const isSelected = store.selectedService?.id_loai_dich_vu === svc.id_loai_dich_vu && location.pathname === '/';
                      return (
                        <div 
                          key={svc.id_loai_dich_vu}
                          onClick={() => { store.selectService(svc); navigate('/'); }}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all truncate ${
                            isSelected 
                              ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30 shadow-sm' 
                              : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                          }`}
                        >
                          {svc.ten_danh_muc}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <div className="my-3 border-t border-white/5"></div>
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2 px-2">Quản trị hệ thống</div>

          <NavLink to="/lich-su" className={navLinkClass}>
            <CalendarOutlined style={{ fontSize: '16px' }} /> Lịch sử Giao dịch
          </NavLink>
          <NavLink to="/khach-hang" className={navLinkClass}>
            <UserOutlined style={{ fontSize: '16px' }} /> Hồ sơ Khách hàng
          </NavLink>
          <NavLink to="/hop-dong" className={navLinkClass}>
            <FileProtectOutlined style={{ fontSize: '16px' }} /> Quản lý Hợp đồng
          </NavLink>
          {user?.dm_nhom_quyen?.ma_quyen === 'CHU_DIEM_BAN' && (
            <NavLink to="/nhan-vien" className={navLinkClass}>
              <TeamOutlined style={{ fontSize: '16px' }} /> Quản lý Nhân viên
            </NavLink>
          )}
          <NavLink to="/cai-dat" className={navLinkClass}>
            <SettingOutlined style={{ fontSize: '16px' }} /> Cấu hình & Chữ ký
          </NavLink>
        </nav>

        <div className="border-t border-white/5 pt-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${store.dbOnline ? 'bg-green-500 shadow-md shadow-green-500/50 animate-pulse' : 'bg-orange-500'}`} />
            <span className="text-gray-400 font-medium">{store.dbOnline ? 'Supabase Online' : 'Mock DB Active'}</span>
          </div>
          <p className="text-[10px] text-gray-600">© 2026 Aura Fintech v1.1</p>
        </div>
      </aside>

      {/* CONTENT WRAPPER */}
      <main className="flex-1 md:ml-64 p-4 sm:p-8 pb-24 md:pb-8 flex flex-col gap-6">
        
        {/* HEADER */}
        <header className="hidden md:flex justify-between items-center bg-[#0d1426]/40 backdrop-blur border border-white/5 rounded-2xl p-4 sm:px-6 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-gray-100 capitalize">Phân hệ {getPageTitle()}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Hệ thống chuyển khoản chi tiết & định dạng in hóa đơn nhanh</p>
          </div>
          <div className="flex items-center gap-4">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <div className="w-10 h-10 rounded-full border border-violet-500/20 p-0.5 cursor-pointer hover:border-violet-500/60 transition-all group relative">
                <img src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=7c3aed&color=fff`} className="w-full h-full object-cover rounded-full" alt="User avatar" />
                <div className="absolute inset-0 rounded-full ring-2 ring-violet-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </Dropdown>
          </div>
        </header>

        {/* TAB CONTENTS */}
        <div className="flex-grow">
          {location.pathname === '/' ? (
            store.selectedService ? <Transactions key={store.selectedService.id_loai_dich_vu} /> : <ServiceMenu />
          ) : (
            <Outlet context={{ setDrawerOpen }} />
          )}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#0d1426]/95 backdrop-blur-lg border-t border-white/5 flex md:hidden justify-around items-center z-50 px-2 sm:px-4">
        <NavLink 
          to="/" 
          end 
          onClick={(e) => {
            if (location.pathname === '/' && store.selectedService) {
              e.preventDefault();
              store.selectService(null);
            }
          }}
          className={mobileNavLinkClass}
        >
          <HomeOutlined style={{ fontSize: '20px' }} />
          <span className="text-[10px] font-semibold">Trang chủ</span>
        </NavLink>
        
        <NavLink to="/hop-dong" className={mobileNavLinkClass}>
          <FileProtectOutlined style={{ fontSize: '20px' }} />
          <span className="text-[10px] font-semibold">Hợp đồng</span>
        </NavLink>
        
        <NavLink to="/khach-hang" className={mobileNavLinkClass}>
          <UserOutlined style={{ fontSize: '20px' }} />
          <span className="text-[10px] font-semibold">Khách</span>
        </NavLink>

        <NavLink to="/lich-su" className={mobileNavLinkClass}>
          <CalendarOutlined style={{ fontSize: '20px' }} />
          <span className="text-[10px] font-semibold">Lịch sử</span>
        </NavLink>
      </nav>

      <TransactionDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
