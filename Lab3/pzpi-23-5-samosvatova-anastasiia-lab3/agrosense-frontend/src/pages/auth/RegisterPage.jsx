import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { User, Mail, Lock, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, verifyEmail, isLoading } = useAuthStore();

  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [verificationCode, setVerificationCode] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Паролі не співпадають!');
      return;
    }

    try {
      await register(formData.username, formData.email, formData.password);
      toast.success('Реєстрація успішна! Перевірте пошту.');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    try {
      await verifyEmail(formData.email, verificationCode);
      toast.success('Пошту успішно підтверджено!');
    
      navigate('/auth/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Невірний код');
    }
  };

  // Крок 1: Форма реєстрації
  if (step === 1) {
    return (
      <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-in fade-in duration-300">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Створити акаунт</h2>
          <p className="text-sm text-gray-500">Приєднуйтесь до AgroSense</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Ім'я користувача</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 block w-full pl-11 p-3.5 outline-none transition-all"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">{t('auth.email')}</label>
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
              className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 block w-full pl-11 p-3.5 outline-none transition-all"
              placeholder="user@agrosense.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">{t('auth.password')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 block w-full pl-9 p-3.5 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Підтвердіть пароль</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 block w-full pl-9 p-3.5 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="group w-full flex justify-center items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl py-3.5 mt-6 transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/50 disabled:opacity-70"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              {t('auth.register')}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <div className="text-center text-sm font-medium text-gray-500 mt-6 pt-6 border-t border-gray-100">
          {t('auth.haveAccount')}{' '}
          <Link to="/auth/login" className="text-green-600 hover:text-green-700 hover:underline transition-colors">
            {t('auth.login')}
          </Link>
        </div>
      </form>
    );
  }
  return (
    <form onSubmit={handleVerifySubmit} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
          <Mail size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Перевірте пошту</h2>
        <p className="text-sm text-gray-500 mt-2">
          Ми надіслали код підтвердження на адресу<br/>
          <span className="font-semibold text-gray-900">{formData.email}</span>
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-center text-gray-700 mb-2">
          Код підтвердження
        </label>
        <div className="relative max-w-xs mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <KeyRound className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
            className="bg-gray-50 border border-gray-200 text-gray-900 text-center text-xl tracking-[0.5em] font-bold rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 block w-full pl-11 p-4 outline-none transition-all"
            placeholder="000000"
            maxLength={6}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || verificationCode.length < 4}
        className="group w-full max-w-xs mx-auto flex justify-center items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl py-3.5 mt-6 transition-all shadow-lg shadow-green-500/30 disabled:opacity-70"
      >
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Підтвердити'}
      </button>

      <div className="text-center mt-6">
        <button 
          type="button"
          onClick={() => setStep(1)}
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          Повернутися назад
        </button>
      </div>
    </form>
  );
};

export default RegisterPage;