import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { isStaffRole } from '../utils/authRedirect';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-shell d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={isStaffRole(user.role) ? '/admin/dashboard' : '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
