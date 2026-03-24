import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import BottomNav from '@/components/shared/BottomNav';
import HomePage from '@/pages/home';
import ProductsPage from '@/pages/products';
import CartPage from '@/pages/cart';
import OrdersPage from '@/pages/orders';
import ProfilePage from '@/pages/profile';

const Layout = () => {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <div className="page-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
};

export default Layout;
