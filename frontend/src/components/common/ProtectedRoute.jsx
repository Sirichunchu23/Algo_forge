import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function ProtectedRoute({ children, role }) {
  const { user, token } = useAuthStore();
  if (!user || !token) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/problems'} replace />;
  }
  return children;
}
