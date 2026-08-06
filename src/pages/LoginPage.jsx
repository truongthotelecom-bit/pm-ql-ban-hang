import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { Lock, User, Sparkles } from 'lucide-react';
import { message } from 'antd';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, session } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const redirectUrl = location.state?.from?.pathname || '/';

  React.useEffect(() => {
    if (session) {
      navigate(redirectUrl, { replace: true });
    }
  }, [session, navigate, redirectUrl]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!username || !password) {
        throw new Error("Vui lòng nhập tài khoản và mật khẩu");
      }
      
      await login(username, password);
      message.success('Đăng nhập thành công!');
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      console.error(err);
      if (err.message.includes('Invalid login credentials')) {
        message.error('Tài khoản hoặc mật khẩu không chính xác.');
      } else {
        message.error(err.message || 'Lỗi đăng nhập, vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center bg-[#080c14] px-6 py-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="w-full max-w-sm mx-auto relative z-10 glass-panel border border-white/5 p-8 rounded-3xl shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-600/35 mb-6">
            <Sparkles size={36} className="text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 tracking-wide">AURA FINTECH</h2>
          <p className="text-slate-400 mt-2 font-medium">Hệ thống quản trị & vận hành</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-violet-400 transition-colors">
                <User size={20} />
              </div>
              <input
                type="text"
                required
                className="w-full bg-[#0d1426] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all text-base"
                placeholder="Tên đăng nhập / Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-violet-400 transition-colors">
                <Lock size={20} />
              </div>
              <input
                type="password"
                required
                className="w-full bg-[#0d1426] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all text-base"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-violet-600/20 text-base font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#080c14] focus:ring-violet-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'ĐĂNG NHẬP'
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-xs text-slate-500 font-medium">
            © 2026 Aura Enterprise CRM v1.1
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
