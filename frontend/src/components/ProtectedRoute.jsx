import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mb-4"></div>
          <p className="text-gray-600">Loading<span className="loading-dots"></span></p>
        </motion.div>
      </div>
    );
  }

  // Only admins should access admin-gated routes. Non-admins/public go to website.
  if (!user && requireAdmin) {
    return <Navigate to="/auth" replace />;
  }
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/website" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;