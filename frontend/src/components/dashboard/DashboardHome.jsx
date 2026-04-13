import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, MapPin, Package, Star, AlertCircle, Hotel, FileText, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import analyticsService from '../../services/analyticsService';
import { formatDisplayDate } from '../../utils/dateUtils';

function DashboardHome() {
  const [stats, setStats] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
            color: 'bg-blue-50 text-blue-600',
            iconBg: 'bg-blue-600 text-white'
          },
          {
            label: 'Active Users',
            value: String(backendStats.users?.activeUsers || 0),
            change: `${Math.round(((backendStats.users?.activeUsers || 0) / (backendStats.users?.total || 1)) * 100)}%`,
            trend: 'up',
            icon: Users,
            color: 'bg-green-50 text-green-600',
            iconBg: 'bg-green-600 text-white'
          },
          {
            label: 'Admin Users',
            value: String(backendStats.users?.byRole?.admin || 0),
            change: `+${backendStats.users?.byRole?.manager || 0}`,
            trend: 'up',
            icon: Star,
            color: 'bg-purple-50 text-purple-600',
            iconBg: 'bg-purple-600 text-white'
          },
          {
            label: 'Security Score',
            value: `${Math.round(backendStats.security?.successRate || 0)}%`,
            change: `${backendStats.security?.failedLogins || 0} failed`,
            trend: (backendStats.security?.failedLogins || 0) > 5 ? 'down' : 'up',
            icon: AlertCircle,
            color: 'bg-orange-50 text-orange-600',
            iconBg: 'bg-orange-500 text-white'
          }
        ];
        
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
        .slice(0, 6) // Extended to 6 to fit the new layout better
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

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      
      // Fallback to default stats if API fails
      const fallbackStats = [
        { label: 'Total Users', value: '0', change: '+0%', trend: 'up', icon: Users, color: 'bg-blue-50 text-blue-600', iconBg: 'bg-blue-600 text-white' },
        { label: 'Active Users', value: '0', change: '0%', trend: 'up', icon: Users, color: 'bg-green-50 text-green-600', iconBg: 'bg-green-600 text-white' },
        { label: 'Admin Users', value: '0', change: '+0', trend: 'up', icon: Star, color: 'bg-purple-50 text-purple-600', iconBg: 'bg-purple-600 text-white' },
        { label: 'Security Score', value: '0%', change: '0 failed', trend: 'up', icon: AlertCircle, color: 'bg-orange-50 text-orange-600', iconBg: 'bg-orange-500 text-white' }
      ];
      
      const safeFallbackStats = fallbackStats.map(stat => ({
        ...stat,
        value: String(stat.value)
      }));
      
      setStats(safeFallbackStats);
      setRecentBookings([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-midnight-ocean to-deep-steel-blue text-white rounded-2xl p-8 shadow-lg">
          <h1 className="text-3xl font-serif mb-2">Corporate Overview</h1>
          <p className="text-white/80 font-light">Syncing with secure servers...</p>
        </div>
        
        {/* Loading skeleton for stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="w-20 h-8 bg-gray-200 rounded mb-2"></div>
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-midnight-ocean to-deep-steel-blue text-white rounded-2xl p-8 shadow-lg"
      >
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-serif mb-2">Corporate Overview</h1>
            <p className="text-white/80 font-light">Here's what's happening with your travel business today.</p>
            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} className="text-red-200"/>
                <p className="text-red-100 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className={`flex items-center px-2 py-1 rounded-md text-xs font-semibold ${stat.color}`}>
                {stat.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                {stat.change}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {typeof stat.value === 'string' ? stat.value : String(stat.value || '0')}
            </h3>
            <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
          </motion.div>
          );
        })}
      </div>

      {/* Layout Grid: Quick Actions & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Actions (1/3 width) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100"
        >
          <h2 className="text-xl font-serif text-midnight-ocean mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Hotel Invoice', color: 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-600 hover:text-white', icon: Hotel, action: () => navigate('/dashboard/invoices/hotel') },
              { name: 'Tour Invoice', color: 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-600 hover:text-white', icon: Package, action: () => navigate('/dashboard/invoices/tour') },
              { name: 'Payment Voucher', color: 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-600 hover:text-white', icon: Receipt, action: () => navigate('/dashboard/vouchers/Payment') },
              { name: 'Add Place', color: 'bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-500 hover:text-white', icon: MapPin, action: () => navigate('/dashboard/places') },
              { name: 'Enquiries', color: 'bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-500 hover:text-white', icon: FileText, action: () => navigate('/dashboard/enquiries') },
              { name: 'Analytics', color: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-700 hover:text-white', icon: TrendingUp, action: () => navigate('/dashboard/analytics') }
            ].map((action) => (
              <button
                key={action.name}
                onClick={action.action}
                className={`border p-4 rounded-xl transition-all duration-300 text-center flex flex-col items-center justify-center gap-3 group ${action.color}`}
              >
                <action.icon size={24} className="transition-transform group-hover:scale-110" />
                <span className="text-[10px] font-bold uppercase tracking-widest leading-tight">{action.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Recent Bookings Table (2/3 width) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-xl font-serif text-midnight-ocean">Recent Invoices Generated</h2>
            <button 
              onClick={() => navigate('/dashboard/invoices')}
              className="text-xs font-bold text-sky-600 hover:text-sky-800 uppercase tracking-widest transition-colors"
            >
              View All →
            </button>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-gray-400 text-[10px] uppercase tracking-widest">
                  <th className="p-4 font-semibold">Client</th>
                  <th className="p-4 font-semibold">Type</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => navigate('/dashboard/invoices')}>
                      <td className="p-4">
                        <div className="font-medium text-midnight-ocean">{booking.customer}</div>
                        <div className="text-xs text-gray-400">{booking.id}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                          typeof booking.type === 'string' && booking.type.includes('Hotel') ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {typeof booking.type === 'string' ? booking.type : 'Booking'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">{typeof booking.date === 'string' ? booking.date : 'Unknown Date'}</td>
                      <td className="p-4 font-semibold text-midnight-ocean text-right">{typeof booking.amount === 'string' ? booking.amount : '₹0'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-gray-500">
                      <Receipt className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                      <p>No recent invoices found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default DashboardHome;