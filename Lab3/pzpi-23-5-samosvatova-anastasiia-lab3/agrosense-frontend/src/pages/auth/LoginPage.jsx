import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(formData.email, formData.password);
      toast.success('Успішний вхід!');
      
      if (user.role === 'admin' || user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('common.error'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
          {t('auth.email')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 block w-full pl-11 p-3.5 transition-all outline-none"
            placeholder="admin@agrosense.com"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5 ml-1 pr-1">
          <label className="block text-sm font-semibold text-gray-700">
            {t('auth.password')}
          </label>
          <a href="#" className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors">
           {t('auth.forgotPassword')}
          </a>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 block w-full pl-11 p-3.5 transition-all outline-none"
            placeholder="••••••••"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="group w-full flex justify-center items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl py-3.5 mt-4 transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/50 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 hover:-translate-y-0.5"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            {t('auth.login')}
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      <div className="text-center text-sm font-medium text-gray-500 mt-6 pt-6 border-t border-gray-100">
        {t('auth.noAccount')}{' '}
        <Link to="/auth/register" className="text-green-600 hover:text-green-700 hover:underline transition-colors">
          {t('auth.register')}
        </Link>
      </div>
    </form>
  );
};

export default LoginPage;