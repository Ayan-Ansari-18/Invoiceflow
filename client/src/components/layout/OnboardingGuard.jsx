import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const OnboardingGuard = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const isOnboardingComplete = Boolean(
    user?.businessName && 
    user?.businessAddress && 
    user?.businessPhone
  );

  if (!isOnboardingComplete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (isOnboardingComplete && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default OnboardingGuard;
