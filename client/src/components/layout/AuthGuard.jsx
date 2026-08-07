import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const AuthGuard = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default AuthGuard;
