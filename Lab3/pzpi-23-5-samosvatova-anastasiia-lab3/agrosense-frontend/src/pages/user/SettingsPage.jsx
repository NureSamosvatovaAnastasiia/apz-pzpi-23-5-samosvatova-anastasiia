import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Settings, User, Globe, Moon, Sun, Check, ArrowLeft, Edit2, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, updateProfile, isLoading } = useAuthStore();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editUsername, setEditUsername] = useState(user?.username || '');

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    toast.success(t('settings.saved'));
  };

  const handleProfileSave = async () => {
    if (!editUsername.trim()) {
      toast.error(t('common.error'));
      return;
    }
    try {
      await updateProfile({ username: editUsername });
      toast.success(t('settings.profileUpdated'));
      setIsEditingProfile(false);
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Шапка */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/dashboard')}
          className="xl:hidden p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            {t('settings.title')} <Settings className="text-gray-400" size={28} />
          </h1>
          <p className="text-sm text-gray-500 mt-1">{t('settings.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
      
        <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <User size={24} />
            </div>
            <div className="flex-1 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">{t('settings.profile')}</h2>
              {!isEditingProfile ? (
                <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Edit2 size={16} /> <span className="hidden sm:inline">{t('common.edit')}</span>
                </button>
              ) : (
                <button 
                  onClick={() => { setIsEditingProfile(false); setEditUsername(user?.username || ''); }}
                  className="flex items-center gap-1 text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={16} /> <span className="hidden sm:inline">{t('common.cancel')}</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1 ml-1">{t('settings.username')}</label>
              {isEditingProfile ? (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-green-500 w-full p-3.5 outline-none font-medium"
                  />
                  <button 
                    onClick={handleProfileSave}
                    disabled={isLoading}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 rounded-xl font-bold shadow-sm shadow-green-500/30 transition-colors disabled:opacity-70 flex items-center justify-center min-w-[100px] shrink-0"
                  >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : t('common.save')}
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl w-full p-3.5 font-medium">
                  {user?.username || 'Username'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1 ml-1">{t('settings.email')}</label>
              <div className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl w-full p-3.5 font-medium text-gray-500 cursor-not-allowed">
                {user?.email || 'email@example.com'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1 ml-1">{t('settings.role')}</label>
              <div className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl w-full p-3.5 font-medium uppercase text-gray-500 cursor-not-allowed">
                {user?.role || 'USER'}
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-8">
          
       
          <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Globe size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{t('settings.language')}</h2>
                <p className="text-xs text-gray-500 font-medium">{t('settings.selectLanguage')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => changeLanguage('uk')}
                className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                  i18n.language === 'uk' 
                    ? 'border-green-500 bg-green-50/50' 
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <span className="text-3xl mb-2">🇺🇦</span>
                <span className={`font-bold ${i18n.language === 'uk' ? 'text-green-700' : 'text-gray-700'}`}>Українська</span>
                {i18n.language === 'uk' && <div className="absolute top-3 right-3 text-green-500"><Check size={18} /></div>}
              </button>

              <button 
                onClick={() => changeLanguage('en')}
                className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                  i18n.language === 'en' || i18n.language?.startsWith('en')
                    ? 'border-green-500 bg-green-50/50' 
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <span className="text-3xl mb-2">🇬🇧</span>
                <span className={`font-bold ${i18n.language?.startsWith('en') ? 'text-green-700' : 'text-gray-700'}`}>English</span>
                {(i18n.language === 'en' || i18n.language?.startsWith('en')) && <div className="absolute top-3 right-3 text-green-500"><Check size={18} /></div>}
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;