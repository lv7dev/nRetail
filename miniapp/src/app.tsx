// Order matters: zaloBootstrap seeds localStorage before i18n reads it.
// Do NOT move '@/i18n' above '@/zaloBootstrap'.
import '@/zaloBootstrap';
import '@/i18n';
// CSS reset (normalize browser defaults before any framework styles)
import '@/css/reset.css';
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
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Router
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AppLayout from '@/components/AppLayout';
import AuthLayout from '@/components/AuthLayout';

// Guards
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import OutletGuard from '@/components/shared/OutletGuard';
import AuthProvider from '@/components/AuthProvider';
import { ThemeProvider } from '@/components/ThemeProvider';

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
import OutletListPage from '@/pages/outlets';
import OutletDetailPage from '@/pages/outlet-detail';
import AccountPage from '@/pages/account';

// Expose app configuration
import appConfig from '../app-config.json';

if (!window.APP_CONFIG) {
  window.APP_CONFIG = appConfig as any;
}

const queryClient = new QueryClient();

const basename = window.APP_ID ? `/zapps/${window.APP_ID}` : '/';

const root = createRoot(document.getElementById('app')!);
root.render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <BrowserRouter basename={basename}>
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
            {/* Outlet picker — authenticated but no outlet gate */}
            <Route element={<ProtectedRoute />}>
              <Route path="/outlets" element={<OutletListPage />} />
            </Route>
            {/* App routes — requires auth + outlet */}
            <Route element={<ProtectedRoute />}>
              <Route element={<OutletGuard />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/outlet-detail" element={<OutletDetailPage />} />
                  <Route path="/account" element={<AccountPage />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>,
);
