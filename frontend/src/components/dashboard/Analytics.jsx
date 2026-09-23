import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, IndianRupee, Users, Package, Hotel, Calendar, BarChart3, AlertCircle } from 'lucide-react';
import analyticsService from '../../services/analyticsService';

function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const result = await analyticsService.getAnalyticsData(selectedPeriod);
      const metrics = result.metrics || {};
      const monthlyData = result.monthlyData?.length
        ? result.monthlyData
        : [{
            month: 'Current',
            revenue: metrics.revenue?.total || 0,
            expenses: metrics.expenses?.total || 0,
            profit: metrics.profit?.total || 0,
            bookings: metrics.bookings?.total || 0
          }];

      setData({
        stats: {
          revenue: {
            total: metrics.revenue?.total || 0,
            change: metrics.revenue?.change || 0,
            trend: (metrics.revenue?.change || 0) >= 0 ? 'up' : 'down'
          },
          expenses: {
            total: metrics.expenses?.total || 0,
            change: metrics.expenses?.change || 0,
            trend: (metrics.expenses?.change || 0) <= 0 ? 'down' : 'up'
          },
          profit: {
            total: metrics.profit?.total || 0,
            change: metrics.profit?.change || 0,
            trend: (metrics.profit?.change || 0) >= 0 ? 'up' : 'down'
          },
          bookings: {
            total: metrics.bookings?.total || 0,
            change: metrics.bookings?.change || 0,
            trend: (metrics.bookings?.change || 0) >= 0 ? 'up' : 'down'
          }
        },
        monthlyData,
        recentTransactions: (result.recentTransactions || []).map(t => ({
          ...t,
          date: new Date(t.date).toLocaleDateString('en-IN')
        })),
        topPackages: result.topPackages || [],
        topHotels: result.topHotels || [],
        margin: metrics.profit?.margin || 0,
        avgBooking: metrics.bookings?.averageValue || 0,
        receivable: metrics.revenue?.receivable || 0,
        expenseDue: metrics.expenses?.due || 0,
        lastUpdated: result.lastUpdated
      });
      setError(null);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Could not load live analytics. Please check backend/API connection.');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, trend, icon: Icon, color, lowerIsGood = false }) => {
    const positiveState = lowerIsGood ? change <= 0 : change >= 0;
    const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;

    return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className={`flex items-center text-sm font-medium ${
          positiveState ? 'text-green-600' : 'text-red-600'
        }`}>
          <TrendIcon className="h-4 w-4 mr-1" />
          {Math.abs(change)}%
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">
        {typeof value === 'number' && value > 1000 ? `₹${value.toLocaleString('en-IN')}` : value}
      </h3>
      <p className="text-gray-600">{title}</p>
    </motion.div>
    );
  };

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-midnight-ocean"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          {error && <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1"/>{error}</p>}
          {data?.lastUpdated && !error && (
            <p className="text-gray-500 text-sm mt-1">Last updated {new Date(data.lastUpdated).toLocaleString('en-IN')}</p>
          )}
        </div>
        <div className="flex space-x-2">
          {['week', 'month', 'year', 'all'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-sky-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={data.stats.revenue.total}
            change={data.stats.revenue.change}
            trend={data.stats.revenue.trend}
            icon={IndianRupee}
            color="bg-green-500"
          />
          <StatCard
            title="Total Expenses"
            value={data.stats.expenses.total}
            change={data.stats.expenses.change}
            trend={data.stats.expenses.trend}
            icon={TrendingDown}
            color="bg-red-500"
            lowerIsGood
          />
          <StatCard
            title="Net Profit"
            value={data.stats.profit.total}
            change={data.stats.profit.change}
            trend={data.stats.profit.trend}
            icon={TrendingUp}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Bookings"
            value={data.stats.bookings.total}
            change={data.stats.bookings.change}
            trend={data.stats.bookings.trend}
            icon={Package}
            color="bg-purple-500"
          />
        </div>
      )}

      {/* Charts Section */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Trend</h2>
            <div className="space-y-4">
              {data.monthlyData.map((d) => (
                <div key={d.month} className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium w-16 truncate">{d.month}</span>
                  <div className="flex items-center space-x-4 flex-1 ml-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((d.revenue / (Math.max(...data.monthlyData.map(x => x.revenue)) || 1)) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-24 text-right">
                      ₹{(d.revenue / 1000).toFixed(0)}K
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Profit vs Expenses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Profit vs Expenses</h2>
            <div className="space-y-4">
              {data.monthlyData.map((d) => {
                const total = Math.max(Math.abs(d.profit) + Math.abs(d.expenses), 1);
                return (
                  <div key={d.month} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">{d.month}</span>
                      <div className="flex space-x-4">
                        <span className="text-blue-600">₹{(d.profit / 1000).toFixed(0)}K</span>
                        <span className="text-red-600">₹{(d.expenses / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max((Math.max(d.profit, 0) / total) * 100, 0)}%` }}
                        />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max((Math.abs(d.expenses) / total) * 100, 0)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center space-x-6 mt-4 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Profit</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Expenses</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Package className="h-5 w-5 mr-2 text-green-600" />
            Top Performing Packages
          </h2>
          <div className="space-y-4">
            {(data?.topPackages || []).length > 0 ? data.topPackages.map((pkg, index) => (
              <div key={pkg.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                  <p className="text-sm text-gray-600">{pkg.bookings} bookings</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">₹{pkg.revenue.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-500">#{index + 1}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-6 text-gray-500">No tour invoice data for this period.</div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Hotel className="h-5 w-5 mr-2 text-blue-600" />
            Top Performing Hotels
          </h2>
          <div className="space-y-4">
            {(data?.topHotels || []).length > 0 ? data.topHotels.map((hotel, index) => (
              <div key={hotel.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">{hotel.name}</h3>
                  <p className="text-sm text-gray-600">{hotel.bookings} bookings</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">₹{hotel.revenue.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-500">#{index + 1}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-6 text-gray-500">No hotel invoice data for this period.</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions & Summary */}
      {data && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
              Recent Transactions
            </h2>
            <div className="space-y-3">
              {data.recentTransactions.length > 0 ? (
                data.recentTransactions.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        transaction.type === 'revenue' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {transaction.date}
                        </div>
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">No recent transactions found for this period.</div>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-2">Profit Margin</h3>
              <p className="text-3xl font-bold mb-1">{data.margin}%</p>
              <p className="text-green-100">{data.margin > 20 ? 'Excellent performance' : 'Needs attention'}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-2">Average Booking Value</h3>
              <p className="text-3xl font-bold mb-1">₹{data.avgBooking.toLocaleString('en-IN')}</p>
              <p className="text-blue-100">Across all packages & hotels</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-2">Pending Balances</h3>
              <p className="text-3xl font-bold mb-1">₹{(data.receivable + data.expenseDue).toLocaleString('en-IN')}</p>
              <p className="text-purple-100">Receivable + expense due</p>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}

export default Analytics;
