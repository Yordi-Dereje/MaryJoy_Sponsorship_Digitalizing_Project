// src/hooks/useRoleNavigation.js
import { useNavigate } from 'react-router-dom';

export const useRoleNavigation = () => {
  const navigate = useNavigate();

  const getDashboardPath = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    switch (user.role) {
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

  const navigateToDashboard = () => {
    navigate(getDashboardPath());
  };

  const navigateTo = (path) => {
    navigate(path);
  };

  return {
    navigateToDashboard,
    navigateTo,
    getDashboardPath
  };
};
