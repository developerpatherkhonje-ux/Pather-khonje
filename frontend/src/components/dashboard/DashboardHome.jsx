import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, MapPin, Package, IndianRupee, Star, AlertCircle } from 'lucide-react';
import apiService from '../../services/api';

function DashboardHome() {
  const [stats, setStats] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch admin stats from backend
      const statsResponse = await apiService.getAdminStats();
      
      if (statsResponse.success) {
        const backendStats = statsResponse.data.stats;
        
        // Transform backend stats to frontend format
        const transformedStats = [
          {
            label: 'Total Users',
            value: backendStats.users.total.toString(),
            change: `+${backendStats.users.recentRegistrations}`,
            trend: 'up',
            icon: Users,
            color: 'bg-blue-500'
          },
          {
            label: 'Active Users',
            value: backendStats.users.activeUsers.toString(),
            change: `${Math.round((backendStats.users.activeUsers / backendStats.users.total) * 100)}%`,
            trend: 'up',
            icon: Users,
            color: 'bg-green-500'
          },
          {
            label: 'Admin Users',
            value: backendStats.users.byRole.admin.toString(),
            change: `+${backendStats.users.byRole.manager}`,
            trend: 'up',
            icon: Star,
            color: 'bg-purple-500'
          },
          {
            label: 'Security Score',
            value: `${Math.round(backendStats.security.successRate)}%`,
            change: `${backendStats.security.failedLogins} failed`,
            trend: backendStats.security.failedLogins > 5 ? 'down' : 'up',
            icon: AlertCircle,
            color: 'bg-yellow-500'
          }
        ];
        
        setStats(transformedStats);
      }

      // For now, keep mock data for bookings and tasks
      // TODO: Replace with actual API calls when booking/task endpoints are available
      setRecentBookings([
        {
          id: 'HTL001',
          customer: 'Rajesh Kumar',
          type: 'Hotel Booking',
          amount: '₹25,000',
          status: 'Confirmed',
          date: '2025-01-15'
        },
        {
          id: 'TUR002',
          customer: 'Priya Sharma',
          type: 'Tour Package',
          amount: '₹45,000',
          status: 'Pending',
          date: '2025-01-14'
        },
        {
          id: 'HTL003',
          customer: 'Amit Singh',
          type: 'Hotel Booking',
          amount: '₹18,000',
          status: 'Confirmed',
          date: '2025-01-13'
        }
      ]);

      setUpcomingTasks([
        {
          task: 'Review pending user registrations',
          priority: 'high',
          dueDate: 'Today'
        },
        {
          task: 'Check security audit logs',
          priority: 'medium',
          dueDate: 'Tomorrow'
        },
        {
          task: 'Update system configurations',
          priority: 'low',
          dueDate: 'Jan 20'
        }
      ]);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      
      // Fallback to default stats if API fails
      setStats([
        {
          label: 'Total Users',
          value: '0',
          change: '+0%',
          trend: 'up',
          icon: Users,
          color: 'bg-blue-500'
        },
        {
          label: 'Active Users',
          value: '0',
          change: '0%',
          trend: 'up',
          icon: Users,
          color: 'bg-green-500'
        },
        {
          label: 'Admin Users',
          value: '0',
          change: '+0',
          trend: 'up',
          icon: Star,
          color: 'bg-purple-500'
        },
        {
          label: 'Security Score',
          value: '0%',
          change: '0 failed',
          trend: 'up',
          icon: AlertCircle,
          color: 'bg-yellow-500'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-sky-100">Loading dashboard data...</p>
        </div>
        
        {/* Loading skeleton for stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                <div className="w-16 h-4 bg-gray-300 rounded"></div>
              </div>
              <div className="w-20 h-8 bg-gray-300 rounded mb-2"></div>
              <div className="w-24 h-4 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-2xl p-8"
      >
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
            <p className="text-sky-100">Here's what's happening with your travel business today.</p>
            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-100 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className={`flex items-center text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className="h-4 w-4 mr-1" />
                {stat.change}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-600">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Bookings</h2>
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">{booking.customer}</h3>
                  <p className="text-sm text-gray-600">{booking.type} • {booking.date}</p>
                  <p className="text-xs text-gray-500">ID: {booking.id}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{booking.amount}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'Confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-sky-600 hover:text-sky-700 font-medium py-2">
            View All Bookings →
          </button>
        </motion.div>

        {/* Tasks & Reminders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Tasks</h2>
          <div className="space-y-4">
            {upcomingTasks.map((task, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full mt-2 ${
                  task.priority === 'high' ? 'bg-red-500' :
                  task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{task.task}</p>
                  <p className="text-sm text-gray-600">Due: {task.dueDate}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-sky-600 hover:text-sky-700 font-medium py-2">
            Add New Task +
          </button>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'New Hotel Booking', color: 'bg-blue-500', icon: '🏨' },
            { name: 'New Tour Package', color: 'bg-green-500', icon: '🎒' },
            { name: 'Add New Place', color: 'bg-purple-500', icon: '📍' },
            { name: 'Generate Report', color: 'bg-orange-500', icon: '📊' }
          ].map((action) => (
            <button
              key={action.name}
              className={`${action.color} text-white p-4 rounded-xl hover:opacity-90 transition-all duration-300 text-center`}
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <p className="text-sm font-medium">{action.name}</p>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default DashboardHome;