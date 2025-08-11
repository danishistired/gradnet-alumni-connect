import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean; // If true, requires user to be logged in
  requireGuest?: boolean; // If true, requires user to NOT be logged in
  accountType?: 'student' | 'alumni'; // Restrict to specific account type
  redirectTo?: string; // Custom redirect path
}

export const ProtectedRoute = ({ 
  children, 
  requireAuth = false,
  requireGuest = false,
  accountType,
  redirectTo
}: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log('ProtectedRoute Check:', {
    requireAuth,
    requireGuest,
    accountType,
    userExists: !!user,
    userAccountType: user?.accountType,
    currentPath: location.pathname
  });

  // If route requires authentication but user is not logged in
  if (requireAuth && !user) {
    console.log('Redirecting to login - auth required but user not logged in');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route requires guest (not logged in) but user is logged in
  if (requireGuest && user) {
    const defaultRedirect = '/feed';
    console.log('Redirecting authenticated user away from guest route to:', redirectTo || defaultRedirect);
    return <Navigate to={redirectTo || defaultRedirect} replace />;
  }

  // If route requires specific account type
  if (accountType && user && user.accountType !== accountType) {
    console.log(`Account type mismatch - required: ${accountType}, user: ${user.accountType}`);
    // Redirect to appropriate page based on user's actual account type
    const redirect = '/feed';
    return <Navigate to={redirect} replace />;
  }

  // If all checks pass, render the component
  return <>{children}</>;
};

// Convenience components for common use cases
export const AuthenticatedRoute = ({ children, accountType, redirectTo }: { 
  children: ReactNode; 
  accountType?: 'student' | 'alumni';
  redirectTo?: string;
}) => (
  <ProtectedRoute requireAuth={true} accountType={accountType} redirectTo={redirectTo}>
    {children}
  </ProtectedRoute>
);

export const GuestRoute = ({ children, redirectTo }: { 
  children: ReactNode; 
  redirectTo?: string;
}) => (
  <ProtectedRoute requireGuest={true} redirectTo={redirectTo}>
    {children}
  </ProtectedRoute>
);

export const StudentRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requireAuth={true} accountType="student">
    {children}
  </ProtectedRoute>
);

export const AlumniRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requireAuth={true} accountType="alumni">
    {children}
  </ProtectedRoute>
);

export const StudentAlumniRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is prospective student, redirect them to CU questions page
  if (user.accountType === 'prospective') {
    return <Navigate to="/cu-questions" replace />;
  }

  // If user is student or alumni, allow access
  if (user.accountType === 'student' || user.accountType === 'alumni') {
    return <>{children}</>;
  }

  // Default redirect for any other case
  return <Navigate to="/cu-questions" replace />;
};
