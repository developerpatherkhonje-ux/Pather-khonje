import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, MapPin, Package, IndianRupee, Star, AlertCircle, Hotel, FileText, Receipt } from 'lucide-react';
import apiService from '../../services/api';
import analyticsService from '../../services/analyticsService';
import { formatDisplayDate } from '../../utils/dateUtils';

function DashboardHome() {
  const [stats, setStats] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time updates
    const unsubscribe = analyticsService.addUpdateListener(() => {
      fetchDashboardData();
    });
    
    // Start automatic updates every 30 seconds
    analyticsService.startRealTimeUpdates(30000);
    
    // Cleanup on unmount
    return () => {
      unsubscribe();
      analyticsService.stopRealTimeUpdates();
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel
      const [statsResponse, analyticsData] = await Promise.all([
        apiService.getAdminStats(),
        analyticsService.fetchAllAnalyticsData()
      ]);
      
      // Process admin stats
      if (statsResponse.success) {
        const backendStats = statsResponse.data.stats;
        
        // Transform backend stats to frontend format
        const transformedStats = [
          {
            label: 'Total Users',
            value: String(backendStats.users?.total || 0),
            change: `+${backendStats.users?.recentRegistrations || 0}`,
            trend: 'up',
            icon: Users,
            color: 'bg-blue-500'
          },
          {
            label: 'Active Users',
            value: String(backendStats.users?.activeUsers || 0),
            change: `${Math.round(((backendStats.users?.activeUsers || 0) / (backendStats.users?.total || 1)) * 100)}%`,
            trend: 'up',
            icon: Users,
            color: 'bg-green-500'
          },
          {
            label: 'Admin Users',
            value: String(backendStats.users?.byRole?.admin || 0),
            change: `+${backendStats.users?.byRole?.manager || 0}`,
            trend: 'up',
            icon: Star,
            color: 'bg-purple-500'
          },
          {
            label: 'Security Score',
            value: `${Math.round(backendStats.security?.successRate || 0)}%`,
            change: `${backendStats.security?.failedLogins || 0} failed`,
            trend: (backendStats.security?.failedLogins || 0) > 5 ? 'down' : 'up',
            icon: AlertCircle,
            color: 'bg-yellow-500'
          }
        ];
        
        // Debug: Log the transformed stats to identify any objects
        console.log('Transformed stats:', transformedStats);
        
        // Ensure all values are strings
        const safeStats = transformedStats.map(stat => ({
          ...stat,
          value: typeof stat.value === 'string' ? stat.value : String(stat.value || '0')
        }));
        
        setStats(safeStats);
      }

      // Process recent bookings from real invoice data
      const recentInvoices = analyticsData.invoices?.rawInvoices || [];
      const recentBookingsData = recentInvoices
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        .slice(0, 5)
        .map(invoice => {
          // Handle customer data - it might be an object or string
          let customerName = 'Unknown Customer';
          if (typeof invoice.customer === 'string') {
            customerName = invoice.customer;
          } else if (typeof invoice.customer === 'object' && invoice.customer !== null) {
            customerName = invoice.customer.name || invoice.customer.customerName || 'Unknown Customer';
          } else if (invoice.customerName) {
            customerName = invoice.customerName;
          }

          return {
            id: invoice.invoiceNumber || invoice.id,
            customer: customerName,
            type: invoice.type === 'hotel' ? 'Hotel Booking' : 'Tour Package',
            amount: `₹${(invoice.total || invoice.amount || 0).toLocaleString()}`,
            status: invoice.status || 'Confirmed',
            date: formatDisplayDate(invoice.createdAt || invoice.date)
          };
        });

      setRecentBookings(recentBookingsData);

      // Generate dynamic tasks based on admin panel data
      const dynamicTasks = [];
      
      // Check for pending invoices
      const pendingInvoices = recentInvoices.filter(inv => inv.status === 'pending' || inv.status === 'Pending');
      if (pendingInvoices.length > 0) {
        dynamicTasks.push({
          task: `Review ${pendingInvoices.length} pending invoice${pendingInvoices.length > 1 ? 's' : ''}`,
          priority: 'high',
          dueDate: 'Today'
        });
      }

      // Check for recent vouchers that need attention
      const recentVouchers = analyticsData.vouchers?.rawVouchers || [];
      const highAmountVouchers = recentVouchers.filter(v => (v.total || 0) > 50000);
      if (highAmountVouchers.length > 0) {
        dynamicTasks.push({
          task: `Review ${highAmountVouchers.length} high-value payment voucher${highAmountVouchers.length > 1 ? 's' : ''}`,
          priority: 'medium',
          dueDate: 'Today'
        });
      }

      // Check for packages without recent bookings
      const packages = analyticsData.packages?.packages || [];
      const inactivePackages = packages.filter(pkg => {
        const packageInvoices = recentInvoices.filter(inv => 
          inv.packageId === pkg.id || inv.packageName === pkg.name
        );
        return packageInvoices.length === 0;
      });
      
      if (inactivePackages.length > 0) {
        dynamicTasks.push({
          task: `Review ${inactivePackages.length} inactive package${inactivePackages.length > 1 ? 's' : ''}`,
          priority: 'low',
          dueDate: 'This week'
        });
      }

      // Add default tasks if no dynamic tasks
      if (dynamicTasks.length === 0) {
        dynamicTasks.push(
          {
            task: 'Review system performance metrics',
            priority: 'medium',
            dueDate: 'Today'
          },
          {
            task: 'Check recent user registrations',
            priority: 'low',
            dueDate: 'Tomorrow'
          }
        );
      }

      setUpcomingTasks(dynamicTasks.slice(0, 3)); // Show max 3 tasks

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      
      // Fallback to default stats if API fails
      const fallbackStats = [
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
      ];
      
      // Ensure all fallback values are strings
      const safeFallbackStats = fallbackStats.map(stat => ({
        ...stat,
        value: String(stat.value)
      }));
      
      setStats(safeFallbackStats);

      // Fallback recent bookings
      setRecentBookings([]);
      setUpcomingTasks([
        {
          task: 'System maintenance required',
          priority: 'high',
          dueDate: 'Today'
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
        {stats.map((stat, index) => {
          // Debug: Log each stat to identify problematic objects
          if (typeof stat.value === 'object') {
            console.error('Found object in stat.value:', stat, 'at index:', index);
          }
          return (
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
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {typeof stat.value === 'string' ? stat.value : 
               typeof stat.value === 'object' ? JSON.stringify(stat.value) : 
               String(stat.value || '0')}
            </h3>
            <p className="text-gray-600">{stat.label}</p>
          </motion.div>
          );
        })}
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
                  <h3 className="font-semibold text-gray-900">
                    {typeof booking.customer === 'string' ? booking.customer : 'Unknown Customer'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {typeof booking.type === 'string' ? booking.type : 'Booking'} • 
                    {typeof booking.date === 'string' ? booking.date : 'Unknown Date'}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID: {typeof booking.id === 'string' ? booking.id : 'Unknown'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {typeof booking.amount === 'string' ? booking.amount : '₹0'}
                  </p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    (typeof booking.status === 'string' && booking.status === 'Confirmed')
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {typeof booking.status === 'string' ? booking.status : 'Unknown'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => window.location.href = '/dashboard/invoices'}
            className="w-full mt-4 text-sky-600 hover:text-sky-700 font-medium py-2"
          >
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
          <button 
            onClick={() => window.location.href = '/dashboard/vouchers'}
            className="w-full mt-4 text-sky-600 hover:text-sky-700 font-medium py-2"
          >
            Manage Tasks +
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
            { 
              name: 'New Hotel Booking', 
              color: 'bg-blue-500', 
              icon: Hotel,
              action: () => window.location.href = '/dashboard/invoices/hotel'
            },
            { 
              name: 'New Tour Package', 
              color: 'bg-green-500', 
              icon: Package,
              action: () => window.location.href = '/dashboard/invoices/tour'
            },
            { 
              name: 'Add New Place', 
              color: 'bg-purple-500', 
              icon: MapPin,
              action: () => window.location.href = '/dashboard/places'
            },
            { 
              name: 'View Analytics', 
              color: 'bg-orange-500', 
              icon: FileText,
              action: () => window.location.href = '/dashboard/analytics'
            }
          ].map((action) => (
            <button
              key={action.name}
              onClick={action.action}
              className={`${action.color} text-white p-4 rounded-xl hover:opacity-90 transition-all duration-300 text-center`}
            >
              <action.icon className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">{action.name}</p>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default DashboardHome;