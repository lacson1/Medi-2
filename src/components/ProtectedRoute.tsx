import { useEffect, useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoading } from '@/components/Loading';
import { PermissionManager, ROUTE_PERMISSIONS } from '@/utils/permissionMatrix.jsx';
import { Shield, AlertCircle } from 'lucide-react';

// Protected Route Component with Role-Based Access Control
export default function ProtectedRoute({
  requiredPermissions = [],
  requiredRoles = [],
  children,
  route
}) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const [customRoles, setCustomRoles] = useState([]);
  const [permissionManager, setPermissionManager] = useState(null);

  // Initialize permission manager with mock roles
  useEffect(() => {
    if (user) {
      // Use mock roles for now
      const mockRoles = [
        { id: 'admin', name: 'Administrator', permissions: ['full_system_access'] },
        { id: 'doctor', name: 'Doctor', permissions: ['patient_access', 'appointment_access'] },
        { id: 'nurse', name: 'Nurse', permissions: ['patient_access'] }
      ];
      setCustomRoles(mockRoles);
      setPermissionManager(new PermissionManager(user, mockRoles));
    }
  }, [user]);

  // Check if we're returning from login with a token in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('access_token');

    if (token) {
      // Save token to localStorage for mock authentication
      localStorage.setItem('auth_token', token);

      // Clean up URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('access_token');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [location.search]);

  // Show loading spinner while checking authentication
  if (loading) {
    return <PageLoading />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check route-specific permissions
  if (route && ROUTE_PERMISSIONS[route]) {
    const routePermissions = ROUTE_PERMISSIONS[route];

    // Check required permissions
    if (routePermissions.permissions && routePermissions.permissions.length > 0) {
      const hasPermission = routePermissions.permissions.some(permission =>
        user.permissions?.includes(permission)
      );

      if (!hasPermission) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Access Denied
              </h2>
              <p className="text-gray-600 mb-4">
                You don't have permission to access this page.
              </p>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Go Back
              </button>
            </div>
          </div>
        );
      }
    }

    // Check required roles
    if (routePermissions.roles && routePermissions.roles.length > 0) {
      const hasRole = routePermissions.roles.includes(user.role);

      if (!hasRole) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Access Denied
              </h2>
              <p className="text-gray-600 mb-4">
                You don't have the required role to access this page.
              </p>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Go Back
              </button>
            </div>
          </div>
        );
      }
    }
  }

  // Check additional required permissions/roles passed as props
  if (requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.some(permission =>
      user.permissions?.includes(permission)
    );

    if (!hasPermission) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  if (requiredRoles.length > 0) {
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4">
              You don't have the required role to access this page.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  // Render the protected content
  return children ? children : <Outlet />;
}