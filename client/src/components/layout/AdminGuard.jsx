import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const AdminGuard = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-dim)' }}>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminGuard;
