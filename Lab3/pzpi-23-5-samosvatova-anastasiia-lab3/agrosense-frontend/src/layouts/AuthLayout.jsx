import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Leaf } from 'lucide-react';

const AuthLayout = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-green-600/10 rounded-full blur-3xl"></div>

     
      <div className="absolute top-6 right-6 z-20">
        <div className="flex bg-white/80 backdrop-blur-md rounded-full p-1 shadow-sm border border-gray-100">
          <button 
            onClick={() => changeLanguage('uk')}
            className={`px-5 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ${
              i18n.language === 'uk' || !i18n.language?.startsWith('en')
                ? 'bg-green-500 text-white shadow-md' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Укр
          </button>
          <button 
            onClick={() => changeLanguage('en')}
            className={`px-5 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ${
              i18n.language?.startsWith('en')
                ? 'bg-green-500 text-white shadow-md' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Eng
          </button>
        </div>
      </div>

    
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-8 sm:p-10 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
     
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-green-500/30 mb-4 transform -rotate-6">
            <Leaf size={36} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">AgroSense</h1>
          <p className="text-gray-500 mt-2 font-medium">Smart Greenhouse System</p>
        </div>

        <Outlet />
        
      </div>
      
      <div className="absolute bottom-6 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} AgroSense. Всі права захищені.
      </div>
    </div>
  );
};

export default AuthLayout;