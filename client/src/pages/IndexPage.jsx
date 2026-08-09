import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet, NavLink } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import useAuthStore from '../store/useAuthStore';
import { Dropdown } from 'antd';
import { HomeOutlined, ShoppingCartOutlined, SettingOutlined, UserOutlined, LogoutOutlined, ControlOutlined, AppstoreOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';
import { Sparkles } from 'lucide-react';
import TransactionDrawer from '../components/TransactionDrawer';

export default function IndexPage() {
  const store = useAppStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    if (location.pathname === '/') return 'Dashboard';
    if (location.pathname.startsWith('/dich-vu')) return 'Dịch vụ';
    if (location.pathname.startsWith('/giao-dich')) return 'Giao dịch';
    if (location.pathname.startsWith('/lich-su')) return 'Lịch sử';
    if (location.pathname.startsWith('/khach-hang')) return 'Khách hàng';
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

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#080c14] text-gray-100">
      
      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className="w-64 bg-[#0d1426]/95 backdrop-blur-md border-r border-white/5 p-6 hidden md:flex flex-col gap-8 fixed top-0 bottom-0 left-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-600/35">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg leading-tight tracking-wider bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">AURA FINTECH</h2>
            <p className="text-[10px] text-gray-500 font-semibold uppercase">Enterprise CRM</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5 flex-grow">
          <NavLink to="/" end className={navLinkClass}>
            <HomeOutlined style={{ fontSize: '16px' }} /> Dashboard báo cáo
          </NavLink>
          <NavLink to="/dich-vu" className={navLinkClass}>
            <AppstoreOutlined style={{ fontSize: '16px' }} /> Danh mục Dịch vụ
          </NavLink>
          <NavLink to="/giao-dich" className={navLinkClass}>
            <ShoppingCartOutlined style={{ fontSize: '16px' }} /> Live Feed Giao dịch
          </NavLink>
          <NavLink to="/lich-su" className={navLinkClass}>
            <CalendarOutlined style={{ fontSize: '16px' }} /> Lịch sử Giao dịch
          </NavLink>
          <NavLink to="/khach-hang" className={navLinkClass}>
            <UserOutlined style={{ fontSize: '16px' }} /> Hồ sơ Khách hàng
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
        <header className="flex justify-between items-center bg-[#0d1426]/40 backdrop-blur border border-white/5 rounded-2xl p-4 sm:px-6">
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

        {/* TAB CONTENTS (RENDER VIA REACT ROUTER OUTLET) */}
        <div className="flex-grow">
          <Outlet context={{ setDrawerOpen }} />
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#0d1426]/95 backdrop-blur-lg border-t border-white/5 flex md:hidden justify-around items-center z-50 px-2 sm:px-4">
        <NavLink to="/" end className={mobileNavLinkClass}>
          <HomeOutlined style={{ fontSize: '18px' }} />
          <span className="text-[9px] font-semibold">Home</span>
        </NavLink>
        <NavLink to="/dich-vu" className={mobileNavLinkClass}>
          <AppstoreOutlined style={{ fontSize: '18px' }} />
          <span className="text-[9px] font-semibold">Dịch Vụ</span>
        </NavLink>
        <NavLink to="/giao-dich" className={mobileNavLinkClass}>
          <ShoppingCartOutlined style={{ fontSize: '18px' }} />
          <span className="text-[9px] font-semibold">Feed</span>
        </NavLink>
        <button 
          onClick={() => setDrawerOpen(true)}
          className="w-12 h-12 -mt-6 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-violet-600/40"
        >
          <span className="text-2xl font-bold">+</span>
        </button>
        <NavLink to="/khach-hang" className={mobileNavLinkClass}>
          <UserOutlined style={{ fontSize: '20px' }} />
          <span className="text-[10px] font-semibold">Khách</span>
        </NavLink>
        <NavLink to="/cai-dat" className={mobileNavLinkClass}>
          <SettingOutlined style={{ fontSize: '20px' }} />
          <span className="text-[10px] font-semibold">Cài đặt</span>
        </NavLink>
      </nav>

      <TransactionDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
