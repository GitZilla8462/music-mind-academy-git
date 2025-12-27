// Protected Route component for Firebase-authenticated users
// src/components/FirebaseProtectedRoute.jsx

import { Navigate, useLocation } from 'react-router-dom';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';

const FirebaseProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useFirebaseAuth();
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to landing page if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default FirebaseProtectedRoute;
