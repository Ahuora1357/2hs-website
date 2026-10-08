import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import MarketingLayout from './components/marketing/MarketingLayout.jsx';
import AuthLayout from './components/auth/AuthLayout.jsx';
import AppShell from './components/layout/AppShell.jsx';

import Landing from './pages/marketing/Landing.jsx';
import About from './pages/marketing/About.jsx';
import Solutions from './pages/marketing/Solutions.jsx';
import Contact from './pages/marketing/Contact.jsx';

import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import Onboarding from './pages/Onboarding.jsx';

import Dashboard from './pages/app/Dashboard.jsx';
import Invoices from './pages/app/Invoices.jsx';
import InvoiceCreate from './pages/app/InvoiceCreate.jsx';
import InvoiceDetail from './pages/app/InvoiceDetail.jsx';
import Customers from './pages/app/Customers.jsx';
import CustomerDetail from './pages/app/CustomerDetail.jsx';
import Products from './pages/app/Products.jsx';
import Expenses from './pages/app/Expenses.jsx';
import Receipts from './pages/app/Receipts.jsx';
import Payments from './pages/app/Payments.jsx';
import Reports from './pages/app/Reports.jsx';
import BankAccounts from './pages/app/BankAccounts.jsx';
import UsersPage from './pages/app/UsersPage.jsx';
import Settings from './pages/app/Settings.jsx';
import NotFound from './pages/NotFound.jsx';

import { useAuth } from './context/AuthContext.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}

/** Route-level permission gate backed by the access matrix. */
function RequirePermission({ permission, children }) {
  const { hasPermission } = useAuth();
  if (!hasPermission(permission)) return <Navigate to="/app" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/app" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public marketing site */}
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* Authentication */}
        <Route
          element={
            <PublicOnly>
              <AuthLayout />
            </PublicOnly>
          }
        >
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Onboarding */}
        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              <Onboarding />
            </RequireAuth>
          }
        />

        {/* Application */}
        <Route
          path="/app"
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/new" element={<InvoiceCreate />} />
          <Route path="invoices/:id" element={<InvoiceDetail />} />
          <Route path="invoices/:id/edit" element={<InvoiceCreate />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="products" element={<Products />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="receipts" element={<Receipts />} />
          <Route path="payments" element={<Payments />} />
          <Route path="accounts" element={<BankAccounts />} />
          <Route path="reports" element={<Reports />} />
          <Route
            path="users"
            element={
              <RequirePermission permission="user.manage">
                <UsersPage />
              </RequirePermission>
            }
          />
          <Route
            path="settings"
            element={
              <RequirePermission permission="settings.manage">
                <Settings />
              </RequirePermission>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
