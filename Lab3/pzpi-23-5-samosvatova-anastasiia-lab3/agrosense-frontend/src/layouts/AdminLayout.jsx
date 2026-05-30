import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import { LogOut, LayoutDashboard, Users, Database, ShieldAlert, Download, FileText, Sprout, Settings } from 'lucide-react';

const AdminLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const activeTab = searchParams.get('tab') || 'overview';

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const changeTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100 font-sans">
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shadow-2xl z-20 shrink-0">
        <div className="h-20 flex items-center justify-center border-b border-slate-800 px-4 shrink-0 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 border border-red-500/20">
              <ShieldAlert size={22} />
            </div>
            <h1 className="text-xl font-bold tracking-wide text-white">Agro<span className="text-red-500">Admin</span></h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <button 
            onClick={() => changeTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'overview' ? 'text-red-400 bg-red-500/10 border border-red-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard size={20} />
            {t('admin.overview')}
          </button>

          <button 
            onClick={() => changeTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'users' ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Users size={20} />
            {t('admin.users')}
          </button>

          <button 
            onClick={() => changeTab('greenhouses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'greenhouses' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Database size={20} />
            {t('admin.greenhouses')}
          </button>

          <button 
            onClick={() => changeTab('crops')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'crops' ? 'text-green-400 bg-green-500/10 border border-green-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Sprout size={20} />
            {t('admin.cropsTab')}
          </button>

          <button 
            onClick={() => changeTab('logs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'logs' ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <FileText size={20} />
            {t('admin.logs')}
          </button>

          <button 
            onClick={() => changeTab('backup')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'backup' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Download size={20} />
            {t('admin.backup')}
          </button>

          <div className="pt-4 mt-4 border-t border-slate-800">
            <button 
              onClick={() => changeTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'settings' ? 'text-slate-200 bg-slate-800/80 border border-slate-700' : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
              }`}
            >
              <Settings size={20} />
              {t('layout.settings')}
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0 bg-slate-950/50">
          <div className="mb-4 px-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-200 truncate">{user?.username || 'Superuser'}</p>
              <p className="text-xs text-slate-500 font-medium">System Admin</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-red-400 border border-red-900/50 rounded-xl hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={16} />
            {t('auth.logout', 'Вийти')}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden flex flex-col bg-slate-900">
        <header className="h-20 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between px-8 backdrop-blur-md shrink-0 z-10">
          <h2 className="text-xl font-bold text-slate-100 tracking-wide">{t('admin.dashboard')} <span className="text-slate-500 ml-2 font-medium text-sm">v1.0</span></h2>
          <div className="flex items-center gap-4">
             <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> {t('admin.systemOk')}
             </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;