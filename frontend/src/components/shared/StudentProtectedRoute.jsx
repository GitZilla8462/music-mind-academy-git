// Protected Route for Student-only pages
// src/components/shared/StudentProtectedRoute.jsx
// Supports both Google auth and PIN-based auth

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useStudentAuth } from '../../context/StudentAuthContext';

const StudentProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, pinSession } = useStudentAuth();
  const [checking, setChecking] = useState(true);

  // Give a brief moment for PIN session to load from localStorage
  useEffect(() => {
    const timer = setTimeout(() => setChecking(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Check both Google auth and PIN session
  const hasAccess = isAuthenticated || !!pinSession;

  if (!hasAccess) {
    return <Navigate to="/student-login" replace />;
  }

  return children;
};

export default StudentProtectedRoute;
