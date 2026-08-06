import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import useAuthStore from '../store/useAuthStore';
import Dashboard from './Dashboard';
import ServiceMenu from './ServiceMenu';
import Transactions from './Transactions';
import { Button, Input, message, Dropdown } from 'antd';
import { HomeOutlined, ShoppingCartOutlined, SettingOutlined, UserOutlined, LogoutOutlined, ControlOutlined, AppstoreOutlined } from '@ant-design/icons';
import { Sparkles } from 'lucide-react';
import TransactionDrawer from '../components/TransactionDrawer';

export default function IndexPage() {
  const store = useAppStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Form states cho Settings
  const [shopName, setShopName] = useState('');
  const [sigAddress, setSigAddress] = useState('');
  const [sigPhone, setSigPhone] = useState('');
  const [sigTitle, setSigTitle] = useState('');

  useEffect(() => {
    store.fetchSystemConfig();
    store.fetchCustomers();
    store.fetchTransactions();
  }, []);

  // Thiết lập Form Settings
  useEffect(() => {
    if (store.signature) {
      setShopName(store.signature.ten_cua_hang || '');
      setSigAddress(store.signature.dia_chi || '');
      setSigPhone(store.signature.sdt1 || '');
      setSigTitle(store.signature.ten_chu_ky || '');
    }
  }, [store.signature]);

  const handleSaveSettings = async () => {
    await store.updateSignature({
      ten_cua_hang: shopName,
      dia_chi: sigAddress,
      sdt1: sigPhone,
      ten_chu_ky: sigTitle
    });
    message.success('Cập nhật thông tin chữ ký hóa đơn thành công!');
  };

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
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: () => logout()
    }
  ];

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
          <button
            onClick={() => store.setActiveTab('dashboard')}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${store.activeTab === 'dashboard' ? 'bg-violet-600/10 border border-violet-500/25 text-violet-400 shadow-md shadow-violet-600/5' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
          >
            <HomeOutlined style={{ fontSize: '16px' }} /> Dashboard báo cáo
          </button>
          <button
            onClick={() => store.setActiveTab('services')}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${store.activeTab === 'services' ? 'bg-violet-600/10 border border-violet-500/25 text-violet-400 shadow-md shadow-violet-600/5' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
          >
            <AppstoreOutlined style={{ fontSize: '16px' }} /> Danh mục Dịch vụ
          </button>
          <button
            onClick={() => store.setActiveTab('transactions')}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${store.activeTab === 'transactions' ? 'bg-violet-600/10 border border-violet-500/25 text-violet-400 shadow-md shadow-violet-600/5' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
          >
            <ShoppingCartOutlined style={{ fontSize: '16px' }} /> Live Feed Giao dịch
          </button>
          <button
            onClick={() => store.setActiveTab('customers')}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${store.activeTab === 'customers' ? 'bg-violet-600/10 border border-violet-500/25 text-violet-400 shadow-md shadow-violet-600/5' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
          >
            <UserOutlined style={{ fontSize: '16px' }} /> Hồ sơ Khách hàng
          </button>
          <button
            onClick={() => store.setActiveTab('settings')}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${store.activeTab === 'settings' ? 'bg-violet-600/10 border border-violet-500/25 text-violet-400 shadow-md shadow-violet-600/5' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
          >
            <SettingOutlined style={{ fontSize: '16px' }} /> Cấu hình & Chữ ký
          </button>
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
            <h2 className="text-xl font-bold text-gray-100 capitalize">Phân hệ {store.activeTab}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Hệ thống chuyển khoản chi tiết & định dạng in hóa đơn nhanh</p>
          </div>
          <div className="flex items-center gap-4">
            <Button type="primary" onClick={() => setDrawerOpen(true)} className="bg-violet-600 hover:bg-violet-700 font-semibold px-4 rounded-lg hidden sm:inline-flex border-none">
              + Tạo giao dịch
            </Button>
            
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
          {store.activeTab === 'dashboard' && <Dashboard onNewTransaction={() => setDrawerOpen(true)} />}
          {store.activeTab === 'services' && <ServiceMenu />}
          {store.activeTab === 'transactions' && <Transactions />}
          
          {store.activeTab === 'customers' && (
            <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
              <h2 className="text-lg font-bold text-gray-200 border-b border-gray-800 pb-3">Hồ sơ khách hàng CRM</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="py-3 px-4">Họ và tên</th>
                      <th className="py-3 px-4">Điện thoại</th>
                      <th className="py-3 px-4">Địa chỉ cư trú</th>
                      <th className="py-3 px-4">Giới tính</th>
                      <th className="py-3 px-4">Cấp bậc</th>
                    </tr>
                  </thead>
                  <tbody>
                    {store.customers.map(c => (
                      <tr key={c.id_khach_hang} className="border-b border-gray-800/40 hover:bg-white/5 transition-all text-gray-300">
                        <td className="py-3 px-4 font-bold">{c.ho_va_ten}</td>
                        <td className="py-3 px-4">{c.so_dien_thoai}</td>
                        <td className="py-3 px-4">{c.dia_chi || '-'}</td>
                        <td className="py-3 px-4">{c.id_gioi_tinh === 'dm-gender-male' ? 'Nam' : 'Nữ'}</td>
                        <td className="py-3 px-4 text-violet-400 font-bold">{c.id_level === 'dm-lvl-vip' ? 'VIP Vàng' : 'Thành viên'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {store.activeTab === 'settings' && (
            <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-6 max-w-xl">
              <div>
                <h2 className="text-lg font-bold text-gray-200 border-b border-gray-800 pb-3">Cấu hình thông tin cửa hàng & Chữ ký</h2>
                <p className="text-xs text-gray-400 mt-1">Thông tin này sẽ được in ở chân trang biên nhận thanh toán POS.</p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400">Tên thương hiệu cửa hàng *</label>
                  <Input value={shopName} onChange={e => setShopName(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400">Địa chỉ kinh doanh *</label>
                  <Input value={sigAddress} onChange={e => setSigAddress(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400">Hotline bán hàng *</label>
                  <Input value={sigPhone} onChange={e => setSigPhone(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400">Đại diện ký tên in ấn *</label>
                  <Input value={sigTitle} onChange={e => setSigTitle(e.target.value)} placeholder="Kế toán trưởng/Thu ngân..." />
                </div>
                <Button type="primary" onClick={handleSaveSettings} className="bg-violet-600 hover:bg-violet-700 w-full mt-2 font-bold py-2 rounded-lg border-none">
                  Lưu cấu hình chữ ký hóa đơn
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#0d1426]/95 backdrop-blur-lg border-t border-white/5 flex md:hidden justify-around items-center z-50 px-2 sm:px-4">
        <button 
          onClick={() => store.setActiveTab('dashboard')} 
          className={`flex flex-col items-center justify-center gap-1 ${store.activeTab === 'dashboard' ? 'text-violet-400' : 'text-gray-500'}`}
        >
          <HomeOutlined style={{ fontSize: '18px' }} />
          <span className="text-[9px] font-semibold">Home</span>
        </button>
        <button 
          onClick={() => store.setActiveTab('services')} 
          className={`flex flex-col items-center justify-center gap-1 ${store.activeTab === 'services' ? 'text-violet-400' : 'text-gray-500'}`}
        >
          <AppstoreOutlined style={{ fontSize: '18px' }} />
          <span className="text-[9px] font-semibold">Dịch Vụ</span>
        </button>
        <button 
          onClick={() => store.setActiveTab('transactions')} 
          className={`flex flex-col items-center justify-center gap-1 ${store.activeTab === 'transactions' ? 'text-violet-400' : 'text-gray-500'}`}
        >
          <ShoppingCartOutlined style={{ fontSize: '18px' }} />
          <span className="text-[9px] font-semibold">Feed</span>
        </button>
        <button 
          onClick={() => setDrawerOpen(true)}
          className="w-12 h-12 -mt-6 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-violet-600/40"
        >
          <span className="text-2xl font-bold">+</span>
        </button>
        <button 
          onClick={() => store.setActiveTab('customers')} 
          className={`flex flex-col items-center justify-center gap-1 ${store.activeTab === 'customers' ? 'text-violet-400' : 'text-gray-500'}`}
        >
          <UserOutlined style={{ fontSize: '20px' }} />
          <span className="text-[10px] font-semibold">Khách</span>
        </button>
        <button 
          onClick={() => store.setActiveTab('settings')} 
          className={`flex flex-col items-center justify-center gap-1 ${store.activeTab === 'settings' ? 'text-violet-400' : 'text-gray-500'}`}
        >
          <SettingOutlined style={{ fontSize: '20px' }} />
          <span className="text-[10px] font-semibold">Cài đặt</span>
        </button>
      </nav>

      <TransactionDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
