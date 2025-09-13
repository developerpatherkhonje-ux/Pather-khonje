import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, IndianRupee, Users, Package, Hotel, Calendar, BarChart3 } from 'lucide-react';

function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Mock data - in real app, this would come from API
  const stats = {
    revenue: {
      total: 845000,
      change: 18,
      trend: 'up'
    },
    expenses: {
      total: 245000,
      change: 12,
      trend: 'up'
    },
    profit: {
      total: 600000,
      change: 22,
      trend: 'up'
    },
    bookings: {
      total: 156,
      change: 8,
      trend: 'up'
    }
  };

  const monthlyData = [
    { month: 'Jan', revenue: 450000, expenses: 120000, profit: 330000, bookings: 45 },
    { month: 'Feb', revenue: 520000, expenses: 140000, profit: 380000, bookings: 52 },
    { month: 'Mar', revenue: 680000, expenses: 180000, profit: 500000, bookings: 68 },
    { month: 'Apr', revenue: 750000, expenses: 200000, profit: 550000, bookings: 75 },
    { month: 'May', revenue: 845000, expenses: 245000, profit: 600000, bookings: 85 },
    { month: 'Jun', revenue: 920000, expenses: 260000, profit: 660000, bookings: 92 }
  ];

  const topPackages = [
    { name: 'Himalayan Adventure', bookings: 25, revenue: 625000 },
    { name: 'Royal Rajasthan', bookings: 18, revenue: 630000 },
    { name: 'Goa Beach Paradise', bookings: 32, revenue: 576000 },
    { name: 'Kashmir Valley', bookings: 15, revenue: 450000 },
    { name: 'Kerala Backwaters', bookings: 22, revenue: 484000 }
  ];

  const topHotels = [
    { name: 'The Grand Mountain Resort', bookings: 28, revenue: 420000 },
    { name: 'Heritage Palace Hotel', bookings: 22, revenue: 550000 },
    { name: 'Beach Resort Goa', bookings: 35, revenue: 525000 },
    { name: 'Valley View Hotel', bookings: 18, revenue: 324000 },
    { name: 'Backwater Resort', bookings: 25, revenue: 375000 }
  ];

  const recentTransactions = [
    { type: 'revenue', description: 'Hotel Booking - HTL045', amount: 25000, date: '2025-01-15' },
    { type: 'expense', description: 'Hotel Advance - Mountain Resort', amount: -15000, date: '2025-01-15' },
    { type: 'revenue', description: 'Tour Package - TUR023', amount: 45000, date: '2025-01-14' },
    { type: 'expense', description: 'Transport - Bus Rental', amount: -8000, date: '2025-01-14' },
    { type: 'revenue', description: 'Hotel Booking - HTL046', amount: 18000, date: '2025-01-13' }
  ];

  const StatCard = ({ title, value, change, trend, icon: Icon, color }) => (
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
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
          {change}%
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">
        {typeof value === 'number' && value > 1000 ? `₹${value.toLocaleString()}` : value}
      </h3>
      <p className="text-gray-600">{title}</p>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <div className="flex space-x-2">
          {['week', 'month', 'quarter', 'year'].map((period) => (
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={stats.revenue.total}
          change={stats.revenue.change}
          trend={stats.revenue.trend}
          icon={IndianRupee}
          color="bg-green-500"
        />
        <StatCard
          title="Total Expenses"
          value={stats.expenses.total}
          change={stats.expenses.change}
          trend={stats.expenses.trend}
          icon={TrendingDown}
          color="bg-red-500"
        />
        <StatCard
          title="Net Profit"
          value={stats.profit.total}
          change={stats.profit.change}
          trend={stats.profit.trend}
          icon={TrendingUp}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Bookings"
          value={stats.bookings.total}
          change={stats.bookings.change}
          trend={stats.bookings.trend}
          icon={Package}
          color="bg-purple-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Trend</h2>
          <div className="space-y-4">
            {monthlyData.slice(-6).map((data) => (
              <div key={data.month} className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">{data.month}</span>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(data.revenue / 1000000) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-20 text-right">
                    ₹{(data.revenue / 1000).toFixed(0)}K
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
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Profit vs Expenses</h2>
          <div className="space-y-4">
            {monthlyData.slice(-6).map((data) => (
              <div key={data.month} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">{data.month}</span>
                  <div className="flex space-x-4">
                    <span className="text-blue-600">₹{(data.profit / 1000).toFixed(0)}K</span>
                    <span className="text-red-600">₹{(data.expenses / 1000).toFixed(0)}K</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(data.profit / (data.profit + data.expenses)) * 100}%` }}
                    />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(data.expenses / (data.profit + data.expenses)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
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

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Packages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Package className="h-5 w-5 mr-2 text-green-600" />
            Top Performing Packages
          </h2>
          <div className="space-y-4">
            {topPackages.map((pkg, index) => (
              <div key={pkg.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                  <p className="text-sm text-gray-600">{pkg.bookings} bookings</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">₹{pkg.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">#{index + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Hotels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Hotel className="h-5 w-5 mr-2 text-blue-600" />
            Top Performing Hotels
          </h2>
          <div className="space-y-4">
            {topHotels.map((hotel, index) => (
              <div key={hotel.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">{hotel.name}</h3>
                  <p className="text-sm text-gray-600">{hotel.bookings} bookings</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">₹{hotel.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">#{index + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
          Recent Transactions
        </h2>
        <div className="space-y-3">
          {recentTransactions.map((transaction, index) => (
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
                {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-2">Profit Margin</h3>
          <p className="text-3xl font-bold mb-1">71%</p>
          <p className="text-green-100">Excellent performance</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-2">Average Booking Value</h3>
          <p className="text-3xl font-bold mb-1">₹28,500</p>
          <p className="text-blue-100">+15% from last month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-2">Customer Satisfaction</h3>
          <p className="text-3xl font-bold mb-1">4.8/5</p>
          <p className="text-purple-100">Based on 142 reviews</p>
        </motion.div>
      </div>
    </div>
  );
}

export default Analytics;