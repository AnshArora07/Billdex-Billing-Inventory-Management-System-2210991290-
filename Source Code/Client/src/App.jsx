import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { isLoggedIn } from './utils/auth'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import LoginPage    from './pages/LoginPage'
import SignupPage   from './pages/SignupPage'
import AboutPage    from './pages/AboutPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import BillingPage  from './pages/BillingPage'
import SalesPage    from './pages/SalesPage'
import ProfilePage  from './pages/ProfilePage'

function DocumentTitleManager() {
  const location = useLocation()

  useEffect(() => {
    const titles = {
      '/login': 'Login | Billdex',
      '/about': 'About Billdex | Billdex',
      '/signup': 'Sign Up | Billdex',
      '/dashboard': 'Dashboard | Billdex',
      '/products': 'Products | Billdex',
      '/billing': 'Billing | Billdex',
      '/sales': 'Sales | Billdex',
      '/profile': 'Profile | Billdex',
    }

    document.title = titles[location.pathname] || 'Billdex | Billing and Inventory Management System'
  }, [location.pathname])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <DocumentTitleManager />
      <Routes>
        {/* Public routes */}
        <Route path="/about"  element={<AboutPage />} />
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected routes — redirect to /login if no token */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/products"  element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
        <Route path="/billing"   element={<ProtectedRoute><BillingPage /></ProtectedRoute>} />
        <Route path="/sales"     element={<ProtectedRoute><SalesPage /></ProtectedRoute>} />
        <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* Default redirect */}
        {/* Default redirect — go to dashboard if logged in, else to login */}
        <Route path="/" element={isLoggedIn() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login"     replace />} />
      </Routes>
    </BrowserRouter>
  )
}
