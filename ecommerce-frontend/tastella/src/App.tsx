import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './util/ProtectedRoute'
import AdminRoute from './util/AdminRoute'
import { CartProvider } from './context/CartContext'
import Footer from './components/Footer/Footer'
import LoginPage from './pages/LoginPage/LoginPage'
import RegisterPage from './pages/RegisterPage/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage/VerifyEmailPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage/ResetPasswordPage'
import SearchPage from './pages/SearchPage/SearchPage'
import CheckoutPage from './pages/CheckoutPage/CheckoutPage'
import OrderDetailPage from './pages/OrderDetailPage/OrderDetailPage'
import OrderHistoryPage from './pages/OrderHistoryPage/OrderHistoryPage'
import AccountSettingsPage from './pages/AccountSettingsPage/AccountSettingsPage'
import AdminProductsPage from './pages/AdminProductsPage/AdminProductsPage'
import AdminAnalyticsPage from './pages/AdminAnalyticsPage/AdminAnalyticsPage'
import AdminOrdersPage from './pages/AdminOrdersPage/AdminOrdersPage'
import AdminOrderDetailPage from './pages/AdminOrderDetailPage/AdminOrderDetailPage'

function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/searchPage"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminProductsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <AdminRoute>
              <AdminAnalyticsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminOrdersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders/:id"
          element={
            <AdminRoute>
              <AdminOrderDetailPage />
            </AdminRoute>
          }
        />
      </Routes>
      <Footer />
    </CartProvider>
  )
}

export default App
