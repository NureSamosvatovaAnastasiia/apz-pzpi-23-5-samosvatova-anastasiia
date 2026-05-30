import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Bell, Info, AlertTriangle, AlertCircle, Check, ArrowLeft, Leaf, Home, Settings, LogOut
} from 'lucide-react';
import useNotificationStore from '../../store/useNotificationStore';
import useAuthStore from '../../store/useAuthStore';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const { notifications, isLoading, fetchNotifications, markAsRead, unreadCount } = useNotificationStore();
  const { user, logout } = useAuthStore();
  
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' };
      case 'WARNING':
        return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' };
      case 'INFO':
      default:
        return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--:--';
    const d = new Date(dateString);
    const locale = i18n.language === 'en' ? 'en-US' : 'uk-UA';
    return d.toLocaleString(locale, { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc] w-full">
      
     

        

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
            
         
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => navigate('/dashboard')}
                className="xl:hidden p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-600 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  {t('notifications.title')} <Bell className="text-gray-400" size={28} />
                </h1>
                <p className="text-sm text-gray-500 mt-1">{t('notifications.subtitle')}</p>
              </div>
            </div>

            {/* Фільтри */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex gap-2 w-fit">
              <button 
                onClick={() => setFilter('all')}
                className={`px-5 py-2 rounded-xl font-medium text-sm transition-all ${filter === 'all' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t('notifications.all')}
              </button>
              <button 
                onClick={() => setFilter('unread')}
                className={`px-5 py-2 rounded-xl font-medium text-sm transition-all ${filter === 'unread' ? 'bg-green-50 text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t('notifications.unread')}
              </button>
            </div>

            <div className="space-y-4">
              {isLoading && notifications.length === 0 ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-10 h-10 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">{t('notifications.empty')}</h3>
                  <p className="text-gray-500 text-sm mt-1">{t('notifications.emptyDesc')}</p>
                </div>
              ) : (
                filteredNotifications.map(notification => {
                  const style = getSeverityStyle(notification.severity);
                  const Icon = style.icon;
                  
                  return (
                    <div 
                      key={notification.id} 
                      className={`relative p-5 rounded-2xl border transition-all duration-300 ${notification.isRead ? 'bg-white border-gray-100 opacity-70 hover:opacity-100' : `${style.bg} ${style.border} shadow-sm`}`}
                    >
                      <div className="flex gap-4 items-start">
                       
                        <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center ${notification.isRead ? 'bg-gray-100 text-gray-400' : `bg-white ${style.color} shadow-sm`}`}>
                          <Icon size={24} />
                        </div>
                        
                       
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-bold ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                                {notification.severity === 'CRITICAL' ? t('notifications.critical') : notification.severity === 'WARNING' ? t('notifications.warning') : t('notifications.info')}
                              </span>
                              {notification.greenhouseName && (
                                <span className="flex items-center gap-1 text-xs font-medium bg-white/60 border border-black/5 px-2 py-0.5 rounded-md text-gray-600">
                                  <Leaf size={12} className="text-green-500" /> {notification.greenhouseName}
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-medium text-gray-400 whitespace-nowrap ml-4">
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>
                          
                          <p className={`text-sm mt-1 ${notification.isRead ? 'text-gray-500' : 'text-gray-700 font-medium'}`}>
                            {notification.message}
                          </p>
                        </div>

                        
                        {!notification.isRead && (
                          <button 
                            onClick={() => markAsRead(notification.id)}
                            className="shrink-0 p-2 text-green-600 hover:bg-green-100/50 bg-white rounded-full shadow-sm border border-green-100 transition-colors tooltip-trigger ml-2"
                            title={t('notifications.markAsRead')}
                          >
                            <Check size={18} strokeWidth={3} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotificationsPage;