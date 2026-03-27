import '@/i18n';
// ZaUI stylesheet
import 'zmp-ui/zaui.css';
// Tailwind stylesheet
import '@/css/tailwind.css';
// Your stylesheet
import '@/css/app.css';

// React core
import { createRoot } from 'react-dom/client';

// React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Router
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AppLayout from '@/components/AppLayout';
import AuthLayout from '@/components/AuthLayout';

// Guards
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import AuthProvider from '@/components/AuthProvider';

// Auth pages
import LoginPage from '@/pages/auth/login';
import RegisterPage from '@/pages/auth/register';
import RegisterCompletePage from '@/pages/auth/register/complete';
import ForgotPasswordPage from '@/pages/auth/forgot-password';
import OtpPage from '@/pages/auth/otp';
import NewPasswordPage from '@/pages/auth/new-password';

// App pages
import HomePage from '@/pages/home';
import ProductsPage from '@/pages/products';
import CartPage from '@/pages/cart';
import OrdersPage from '@/pages/orders';
import ProfilePage from '@/pages/profile';

// Expose app configuration
import appConfig from '../app-config.json';

if (!window.APP_CONFIG) {
  window.APP_CONFIG = appConfig as any;
}

const queryClient = new QueryClient();

const root = createRoot(document.getElementById('app')!);
root.render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register/complete" element={<RegisterCompletePage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/otp" element={<OtpPage />} />
            <Route path="/new-password" element={<NewPasswordPage />} />
          </Route>
          {/* Protected app routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>,
);
