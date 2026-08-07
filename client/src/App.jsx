import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';

import AuthGuard from './components/layout/AuthGuard';
import OnboardingGuard from './components/layout/OnboardingGuard';
import AdminGuard from './components/layout/AdminGuard';
import useAuthStore from './store/authStore';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import InvoiceListPage from './pages/InvoiceListPage';
import InvoiceFormPage from './pages/InvoiceFormPage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import ClientsPage from './pages/ClientsPage';
import ProfilePage from './pages/ProfilePage';
import EmailCampaignsPage from './pages/EmailCampaignsPage';
import BrandingPage from './pages/BrandingPage';
import ClientGroupsPage from './pages/ClientGroupsPage';
import OnboardingPage from './pages/OnboardingPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

const App = () => {
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    initAuth(); // Restore token from localStorage on mount
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Protected & Onboarding */}
          <Route path="/onboarding" element={<AuthGuard><OnboardingPage /></AuthGuard>} />

          {/* Fully Protected (Requires Onboarding) */}
          <Route path="/dashboard" element={<OnboardingGuard><DashboardPage /></OnboardingGuard>} />
          <Route path="/invoices" element={<OnboardingGuard><InvoiceListPage /></OnboardingGuard>} />
          <Route path="/invoices/new" element={<OnboardingGuard><InvoiceFormPage /></OnboardingGuard>} />
          <Route path="/invoices/:id" element={<OnboardingGuard><InvoiceDetailPage /></OnboardingGuard>} />
          <Route path="/invoices/:id/edit" element={<OnboardingGuard><InvoiceFormPage /></OnboardingGuard>} />
          <Route path="/clients" element={<OnboardingGuard><ClientsPage /></OnboardingGuard>} />
          
          {/* Profile page can be accessed even if onboarding is not technically "complete", but we'll wrap it just in case, wait no, let's keep it wrapped so they are forced to use the focused onboarding page first. */}
          <Route path="/profile" element={<OnboardingGuard><ProfilePage /></OnboardingGuard>} />
          
          <Route path="/email" element={<OnboardingGuard><EmailCampaignsPage /></OnboardingGuard>} />
          <Route path="/branding" element={<OnboardingGuard><BrandingPage /></OnboardingGuard>} />
          <Route path="/client-groups" element={<OnboardingGuard><ClientGroupsPage /></OnboardingGuard>} />
          {/* Hidden Admin Route */}
          <Route path="/super-admin-secret-dashboard/login" element={<AdminLogin />} />
          <Route path="/super-admin-secret-dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(12, 12, 14, 0.8)',
            backdropFilter: 'blur(16px)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            fontSize: 14,
            boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
