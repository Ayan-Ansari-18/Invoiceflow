import { Navigate } from 'react-router-dom';
import api from '../../services/api';

const AdminGuard = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');

  if (!adminToken) {
    return <Navigate to="/super-admin-secret-dashboard/login" replace />;
  }

  // Set the authorization header specifically for this admin page to use the admin token
  api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;

  return children;
};

export default AdminGuard;
