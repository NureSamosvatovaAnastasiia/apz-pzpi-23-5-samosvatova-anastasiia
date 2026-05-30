import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AuthLayout from '../layouts/AuthLayout';
import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';

import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

import UserDashboard from '../pages/user/Dashboard';
import GreenhouseDetails from '../pages/user/GreenhouseDetails';
import NotificationsPage from '../pages/user/NotificationsPage';
import SettingsPage from '../pages/user/SettingsPage'; 

import AdminDashboard from '../pages/admin/AdminDashboard';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route index element={<Navigate to="/auth/login" replace />} />
        </Route>

        <Route path="/" element={<ProtectedRoute />}>
          <Route element={<UserLayout />}>
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="dashboard/greenhouse/:id" element={<GreenhouseDetails />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            
            <Route index element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Route>

        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
            <div className="text-center">
              <h1 className="text-6xl font-extrabold text-green-500 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-8 font-medium">Сторінку не знайдено</p>
              <a href="/" className="px-8 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/30">
                Повернутися на головну
              </a>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;