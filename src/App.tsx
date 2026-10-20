import { ConfigProvider } from 'antd';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './features/auth/contexts/AuthContext';
import { CustomerRoute } from './features/auth/components/CustomerRoute';
import { AdminRoute } from './features/auth/components/AdminRoute';
import { CartProvider } from './features/cart/contexts/CartContext';
import { ThemeProvider, useColors, useTheme, buildAntdTheme } from './lib/theme';

// Pages
import { HomePage } from './features/landing/pages/HomePage';
import { CataloguePage } from './features/catalogue/pages/CataloguePage';
import { ProductDetailPage } from './features/catalogue/pages/ProductDetailPage';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage';
import { CartPage } from './features/cart/components/CartPage';
import { CheckoutPage } from './features/checkout/pages/CheckoutPage';
import { CheckoutCompletePage } from './features/checkout/pages/CheckoutCompletePage';
import { QuoteRequestPage } from './features/quotes/pages/QuoteRequestPage';
import { AccountPage } from './features/account/pages/AccountPage';
import { DashboardPage } from './features/admin/dashboard/DashboardPage';
import { AdminOrdersPage } from './features/admin/orders/AdminOrdersPage';
import { AdminQuotesPage } from './features/admin/quotes/AdminQuotesPage';
import { AdminCataloguePage } from './features/admin/catalogue/AdminCataloguePage';
import { AdminCustomersPage } from './features/admin/customers/AdminCustomersPage';

function AppShell() {
  const colors = useColors();
  const { isDark } = useTheme();

  return (
    <ConfigProvider theme={buildAntdTheme(colors, isDark)}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/catalogue" element={<CataloguePage />} />
              <Route path="/catalogue/:id" element={<ProductDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/cart" element={<CartPage />} />

              {/* Customer-protected routes */}
              <Route path="/checkout" element={<CustomerRoute><CheckoutPage /></CustomerRoute>} />
              <Route path="/checkout/complete" element={<CustomerRoute><CheckoutCompletePage /></CustomerRoute>} />
              <Route path="/quotes/new" element={<CustomerRoute><QuoteRequestPage /></CustomerRoute>} />
              <Route path="/account" element={<CustomerRoute><AccountPage /></CustomerRoute>} />
              <Route path="/account/quotes" element={<CustomerRoute><AccountPage /></CustomerRoute>} />

              {/* Admin-protected routes */}
              <Route path="/admin" element={<AdminRoute><DashboardPage /></AdminRoute>} />
              <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
              <Route path="/admin/quotes" element={<AdminRoute><AdminQuotesPage /></AdminRoute>} />
              <Route path="/admin/catalogue" element={<AdminRoute><AdminCataloguePage /></AdminRoute>} />
              <Route path="/admin/customers" element={<AdminRoute><AdminCustomersPage /></AdminRoute>} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}

export default App;
