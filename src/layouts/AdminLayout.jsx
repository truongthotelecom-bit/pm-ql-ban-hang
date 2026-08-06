import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { HomeOutlined, SettingOutlined, UsergroupAddOutlined, AppstoreOutlined, LogoutOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import { Database } from 'lucide-react';
import { adminCategoriesConfig } from '../config/adminConfig';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  const [expandedNav, setExpandedNav] = useState({ '/admin/danh-muc': true });

  const toggleNav = (path) => {
    setExpandedNav(prev => ({ ...prev, [path]: !prev[path] }));
  };

  // Nhóm các danh mục theo cấp 2
  const categoryGroups = adminCategoriesConfig.reduce((acc, config) => {
    const group = config.group || 'Khác';
    if (!acc[group]) acc[group] = [];
    acc[group].push(config);
    return acc;
  }, {});

  const navItems = [
    { path: '/admin', label: 'Tổng quan', icon: <AppstoreOutlined /> },
    { 
      path: '/admin/danh-muc', 
      label: 'Quản lý Danh mục', 
      icon: <Database size={16} />,
      childrenGroups: categoryGroups
    },
    { path: '/admin/tai-khoan', label: 'Quản lý Tài khoản', icon: <UsergroupAddOutlined /> },
    { path: '/admin/cai-dat', label: 'Cài đặt hệ thống', icon: <SettingOutlined /> },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex text-gray-200">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
            ADMIN PANEL
          </h1>
          <p className="text-xs text-slate-500 mt-1">Hệ thống quản trị Aura</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              const isExpanded = expandedNav[item.path];

              return (
                <li key={item.path}>
                  {item.childrenGroups ? (
                    <div>
                      <div 
                        onClick={() => toggleNav(item.path)}
                        className={`flex items-center justify-between cursor-pointer px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive 
                            ? 'bg-blue-600/10 text-blue-400' 
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          {item.label}
                        </div>
                        {isExpanded ? <DownOutlined className="text-[10px]" /> : <RightOutlined className="text-[10px]" />}
                      </div>
                      
                      {isExpanded && (
                        <div className="ml-7 mt-2 space-y-3 mb-2">
                          {Object.entries(item.childrenGroups).map(([groupName, configs]) => (
                            <div key={groupName}>
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-2">{groupName}</div>
                              <ul className="space-y-1 border-l border-slate-700/50 ml-1.5 pl-2">
                                {configs.map(config => {
                                  const subPath = `/admin/danh-muc/${config.tableName}`;
                                  const isSubActive = location.pathname === subPath;
                                  return (
                                    <li key={config.tableName}>
                                      <Link
                                        to={subPath}
                                        className={`block px-3 py-1.5 rounded-lg text-xs transition-colors ${
                                          isSubActive ? 'bg-blue-600/20 text-blue-400 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                        }`}
                                      >
                                        {config.title}
                                      </Link>
                                    </li>
                                  )
                                })}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-blue-600/10 text-blue-400' 
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
              <span className="font-bold text-blue-400">{user?.username?.charAt(0)?.toUpperCase() || 'A'}</span>
            </div>
            <div>
              <p className="text-sm font-semibold">{user?.username}</p>
              <p className="text-xs text-emerald-500">Quản trị viên</p>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors mb-2"
          >
            <HomeOutlined />
            Quay lại CRM
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-900/40 rounded-lg transition-colors"
          >
            <LogoutOutlined />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-slate-100">
            {navItems.find(i => location.pathname === i.path || (i.path !== '/admin' && location.pathname.startsWith(i.path)))?.label || 'Quản trị'}
          </h2>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
