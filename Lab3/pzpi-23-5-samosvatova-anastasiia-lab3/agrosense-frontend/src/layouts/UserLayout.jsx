import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut, Home, Bell, Settings, Leaf, Menu, X } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useNotificationStore from '../store/useNotificationStore';
import GlobalSocket from '../components/layout/GlobalSocket'; // НОВИЙ ІМПОРТ

const UserLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const isActive = (path) => {
    if (path === 'dashboard' && location.pathname === '/dashboard') return true;
    if (path === 'notifications' && location.pathname.includes('/notifications')) return true;
    if (path === 'settings' && location.pathname.includes('/settings')) return true;
    return false;
  };

  return (
    <div className="h-screen flex bg-[#f8fafc] w-full overflow-hidden">
      
      {/* Підключаємо невидимий компонент для WebSockets */}
      <GlobalSocket />

      {/* МОБІЛЬНИЙ HEADER */}
      <div className="xl:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-gray-600">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2 text-green-600 font-bold text-xl">
            <Leaf size={20} /> AgroSense
          </div>
        </div>
        <button 
          onClick={() => navigate('/notifications')}
          className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
        >
          <Bell size={24} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* ЗАТЕМНЕННЯ ДЛЯ МОБІЛЬНОГО МЕНЮ */}
      {isMobileMenuOpen && (
        <div 
          className="xl:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* БОКОВА ПАНЕЛЬ (Sidebar) */}
      <aside className={`fixed xl:static top-0 left-0 h-full w-72 bg-white border-r border-gray-100 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}`}>
        
        <div className="h-16 xl:h-20 flex items-center justify-between xl:justify-start gap-3 px-6 xl:px-8 border-b border-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-500/30">
              <Leaf size={24} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800">AgroSense</h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="xl:hidden p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-full">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <button 
            onClick={() => navigate('/dashboard')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium transition-all duration-200 ${
              isActive('dashboard') 
                ? 'bg-green-50 text-green-700 shadow-sm' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Home size={22} className={isActive('dashboard') ? 'text-green-500' : 'text-gray-400'} />
            {t('layout.myGreenhouses')}
          </button>
          
          <button 
            onClick={() => navigate('/notifications')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium transition-all duration-200 relative ${
              isActive('notifications') 
                ? 'bg-green-50 text-green-700 shadow-sm' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Bell size={22} className={isActive('notifications') ? 'text-green-500' : 'text-gray-400'} />
            {t('layout.notifications')}
            {unreadCount > 0 && (
              <span className="absolute right-4 flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-in zoom-in">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => navigate('/settings')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium transition-all duration-200 ${
              isActive('settings') 
                ? 'bg-green-50 text-green-700 shadow-sm' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Settings size={22} className={isActive('settings') ? 'text-green-500' : 'text-gray-400'} />
            {t('layout.settings')}
          </button>
        </nav>

        {/* Інформація про користувача */}
        <div className="p-4 mb-4 mx-4 bg-gray-50 rounded-3xl border border-gray-100 shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-lg shrink-0">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.username || t('layout.user')}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
          >
            <LogOut size={16} />
            {t('layout.logout')}
          </button>
        </div>
      </aside>

      {/* ГОЛОВНИЙ КОНТЕНТ */}
      <main className="flex-1 flex flex-col h-full overflow-hidden pt-16 xl:pt-0">
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </div>
      </main>

    </div>
  );
};

export default UserLayout;