import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRoles = null }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032990] mx-auto"></div>
          <p className="mt-4 text-lg text-[#032990]">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if requiredRoles is specified
  if (requiredRoles) {
    const hasRequiredRole = Array.isArray(requiredRoles) 
      ? requiredRoles.includes(user.role)
      : user.role === requiredRoles;

    if (!hasRequiredRole) {
      // Redirect to appropriate dashboard based on user role
      const getDashboardPath = (role) => {
        switch (role) {
          case 'admin':
            return '/admin_dashboard';
          case 'database_officer':
            return '/d_o_dashboard';
          case 'coordinator':
            return '/coordinator_dashboard';
          case 'sponsor':
            return '/sponsor_dashboard';
          default:
            return '/login';
        }
      };

      return <Navigate to={getDashboardPath(user.role)} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
