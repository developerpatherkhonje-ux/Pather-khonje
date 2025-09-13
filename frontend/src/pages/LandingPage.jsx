import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plane, Shield, Users, Globe } from 'lucide-react';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center px-6"
      >
        {/* Logo and Title */}
        <div className="mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center mb-6"
          >
            <img src="/logo/Pather Khonje Logo.png" alt="Pather Khonje Logo" className="h-20 w-auto" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-4"
          >
            Pather Khonje
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 mb-8"
          >
            A tour that never seen before
          </motion.p>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <Shield className="h-12 w-12 text-sky-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Access</h3>
            <p className="text-gray-600">Protected staff portal with secure authentication</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <Users className="h-12 w-12 text-sky-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
            <p className="text-gray-600">Complete user profiles and role management</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <Globe className="h-12 w-12 text-sky-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Travel Platform</h3>
            <p className="text-gray-600">Comprehensive travel management system</p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/login"
            className="bg-sky-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-sky-700 transition-all duration-300 hover:transform hover:scale-105 shadow-lg"
          >
            Staff Login
          </Link>
          
          <Link
            to="/signup"
            className="bg-white text-sky-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg border-2 border-sky-600"
          >
            Create Account
          </Link>
        </motion.div>

        {/* Demo Credentials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-200"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Demo Credentials</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Email:</strong> admin@patherkhonje.com</p>
            <p><strong>Password:</strong> admin123</p>
            <p className="text-blue-600 mt-2">Use these credentials to access the admin dashboard</p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 text-gray-500 text-sm"
        >
          <p>© 2025 Pather Khonje. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default LandingPage;



