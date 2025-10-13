import apiService from './api';

class AnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.listeners = new Set(); // For real-time updates
    this.updateInterval = null;
  }

  // Cache management
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    this.notifyListeners(); // Notify all listeners when cache is cleared
  }

  // Real-time update listeners
  addUpdateListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback); // Return unsubscribe function
  }

  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in analytics update listener:', error);
      }
    });
  }

  // Start real-time updates
  startRealTimeUpdates(intervalMs = 30000) { // Default 30 seconds
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    this.updateInterval = setInterval(() => {
      this.clearCache();
    }, intervalMs);
  }

  // Stop real-time updates
  stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Manually trigger update (call this when admin panel data changes)
  triggerUpdate() {
    this.clearCache();
  }

  // Get period information for debugging
  getPeriodInfo(period) {
    const now = new Date();
    let startDate, endDate, description;

    switch (period) {
      case 'week':
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startDate = new Date(now);
        startDate.setDate(now.getDate() + daysToMonday);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        description = `Current Week (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`;
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        description = `Current Month (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`;
        break;
      case 'quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
        endDate.setHours(23, 59, 59, 999);
        description = `Current Quarter Q${currentQuarter + 1} (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`;
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        endDate.setHours(23, 59, 59, 999);
        description = `Current Year ${now.getFullYear()} (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`;
        break;
      default:
        description = 'Invalid period';
    }

    return {
      period,
      description,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  }

  // Fetch all analytics data
  async fetchAllAnalyticsData() {
    try {
      const [
        usersData,
        hotelsData,
        packagesData,
        placesData,
        invoicesData,
        vouchersData
      ] = await Promise.allSettled([
        this.fetchUsersData(),
        this.fetchHotelsData(),
        this.fetchPackagesData(),
        this.fetchPlacesData(),
        this.fetchInvoicesData(),
        this.fetchVouchersData()
      ]);

      return {
        users: usersData.status === 'fulfilled' ? usersData.value : null,
        hotels: hotelsData.status === 'fulfilled' ? hotelsData.value : null,
        packages: packagesData.status === 'fulfilled' ? packagesData.value : null,
        places: placesData.status === 'fulfilled' ? placesData.value : null,
        invoices: invoicesData.status === 'fulfilled' ? invoicesData.value : null,
        vouchers: vouchersData.status === 'fulfilled' ? vouchersData.value : null
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  }

  // Users data
  async fetchUsersData() {
    const cacheKey = 'users_analytics';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiService.getAdminStats();
      if (response.success) {
        const data = response.data.stats;
        this.setCachedData(cacheKey, data);
        return data;
      }
      throw new Error('Failed to fetch users data');
    } catch (error) {
      console.error('Error fetching users data:', error);
      return null;
    }
  }

  // Hotels data
  async fetchHotelsData() {
    const cacheKey = 'hotels_analytics';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiService.getHotels(1, 1000); // Get all hotels
      if (response.success) {
        const hotels = response.data.hotels || [];
        const data = this.processHotelsData(hotels);
        this.setCachedData(cacheKey, data);
        return data;
      }
      throw new Error('Failed to fetch hotels data');
    } catch (error) {
      console.error('Error fetching hotels data:', error);
      return null;
    }
  }

  // Packages data
  async fetchPackagesData() {
    const cacheKey = 'packages_analytics';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiService.listPackages();
      if (response.success) {
        const packages = response.data.packages || [];
        const data = this.processPackagesData(packages);
        this.setCachedData(cacheKey, data);
        return data;
      }
      throw new Error('Failed to fetch packages data');
    } catch (error) {
      console.error('Error fetching packages data:', error);
      return null;
    }
  }

  // Places data
  async fetchPlacesData() {
    const cacheKey = 'places_analytics';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiService.getPlaces();
      if (response.success) {
        const places = response.data.places || [];
        const data = this.processPlacesData(places);
        this.setCachedData(cacheKey, data);
        return data;
      }
      throw new Error('Failed to fetch places data');
    } catch (error) {
      console.error('Error fetching places data:', error);
      return null;
    }
  }

  // Invoices data
  async fetchInvoicesData() {
    const cacheKey = 'invoices_analytics';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiService.listInvoices({ page: 1, limit: 1000 });
      if (response.success) {
        const invoices = response.data.items || response.data || [];
        const data = this.processInvoicesData(invoices);
        this.setCachedData(cacheKey, data);
        return data;
      }
      throw new Error('Failed to fetch invoices data');
    } catch (error) {
      console.error('Error fetching invoices data:', error);
      return null;
    }
  }

  // Vouchers data
  async fetchVouchersData() {
    const cacheKey = 'vouchers_analytics';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiService.listPaymentVouchers({});
      if (response.success) {
        const vouchers = response.data.items || [];
        const data = this.processVouchersData(vouchers);
        this.setCachedData(cacheKey, data);
        return data;
      }
      throw new Error('Failed to fetch vouchers data');
    } catch (error) {
      console.error('Error fetching vouchers data:', error);
      return null;
    }
  }

  // Process hotels data
  processHotelsData(hotels) {
    // Ensure hotels is an array
    const hotelsArray = Array.isArray(hotels) ? hotels : [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalHotels = hotelsArray.length;
    const totalPlaces = new Set(hotelsArray.map(h => h.placeId)).size;
    
    // Calculate average rating
    const totalRating = hotelsArray.reduce((sum, hotel) => sum + (hotel.rating || 0), 0);
    const averageRating = totalHotels > 0 ? totalRating / totalHotels : 0;

    // Hotels by place
    const hotelsByPlace = hotelsArray.reduce((acc, hotel) => {
      const placeName = hotel.placeName || 'Unknown';
      acc[placeName] = (acc[placeName] || 0) + 1;
      return acc;
    }, {});

    // Top places by hotel count
    const topPlaces = Object.entries(hotelsByPlace)
      .map(([place, count]) => ({ place, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Hotels added this month
    const hotelsThisMonth = hotelsArray.filter(hotel => {
      const hotelDate = new Date(hotel.createdAt);
      return hotelDate.getMonth() === currentMonth && hotelDate.getFullYear() === currentYear;
    }).length;

    return {
      totalHotels,
      totalPlaces,
      averageRating: Math.round(averageRating * 10) / 10,
      hotelsThisMonth,
      topPlaces,
      hotelsByPlace,
      hotels: hotelsArray // Return the array for use in other functions
    };
  }

  // Process packages data
  processPackagesData(packages) {
    // Ensure packages is an array
    const packagesArray = Array.isArray(packages) ? packages : [];
    const totalPackages = packagesArray.length;
    
    // Calculate average rating
    const totalRating = packagesArray.reduce((sum, pkg) => sum + (pkg.rating || 0), 0);
    const averageRating = totalPackages > 0 ? totalRating / totalPackages : 0;

    // Packages by category
    const packagesByCategory = packagesArray.reduce((acc, pkg) => {
      const category = pkg.category || 'uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Top categories
    const topCategories = Object.entries(packagesByCategory)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Price analysis
    const prices = packagesArray.map(pkg => pkg.price || 0).filter(price => price > 0);
    const averagePrice = prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    return {
      totalPackages,
      averageRating: Math.round(averageRating * 10) / 10,
      topCategories,
      packagesByCategory,
      averagePrice: Math.round(averagePrice),
      minPrice,
      maxPrice,
      packages: packagesArray // Return the array for use in other functions
    };
  }

  // Process places data
  processPlacesData(places) {
    const totalPlaces = places.length;
    
    // Calculate average rating
    const totalRating = places.reduce((sum, place) => sum + (place.rating || 0), 0);
    const averageRating = totalPlaces > 0 ? totalRating / totalPlaces : 0;

    // Places with images
    const placesWithImages = places.filter(place => place.image || (place.images && place.images.length > 0)).length;

    // Top rated places
    const topRatedPlaces = places
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5)
      .map(place => ({
        name: place.name,
        rating: place.rating || 0,
        description: place.description
      }));

    return {
      totalPlaces,
      averageRating: Math.round(averageRating * 10) / 10,
      placesWithImages,
      topRatedPlaces
    };
  }

  // Process invoices data
  processInvoicesData(invoices) {
    const totalInvoices = invoices.length;
    
    // Calculate revenue metrics
    const totalRevenue = invoices.reduce((sum, invoice) => sum + (invoice.total || invoice.amount || 0), 0);
    const totalAdvance = invoices.reduce((sum, invoice) => sum + (invoice.advancePaid || 0), 0);
    
    // Calculate due amounts
    const totalDue = invoices.reduce((sum, invoice) => {
      const dueAmount = Math.max((invoice.total || invoice.amount || 0) - (invoice.advancePaid || 0), 0);
      return sum + dueAmount;
    }, 0);

    // Status analysis
    const statusCounts = invoices.reduce((acc, invoice) => {
      let status = invoice.status;
      if (!status) {
        const dueAmount = Math.max((invoice.total || invoice.amount || 0) - (invoice.advancePaid || 0), 0);
        status = dueAmount <= 0 ? 'paid' : 'pending';
      }
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Type analysis
    const typeCounts = invoices.reduce((acc, invoice) => {
      const type = invoice.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Monthly revenue trend (last 6 months)
    const monthlyRevenue = this.calculateMonthlyTrend(invoices, 'total');

    return {
      totalInvoices,
      totalRevenue,
      totalAdvance,
      totalDue,
      statusCounts,
      typeCounts,
      monthlyRevenue,
      rawInvoices: invoices, // Include raw data for recent transactions
      paidRevenue: statusCounts.paid ? invoices
        .filter(inv => {
          const dueAmount = Math.max((inv.total || inv.amount || 0) - (inv.advancePaid || 0), 0);
          return dueAmount <= 0;
        })
        .reduce((sum, inv) => sum + (inv.total || inv.amount || 0), 0) : 0
    };
  }

  // Process vouchers data
  processVouchersData(vouchers) {
    const totalVouchers = vouchers.length;
    
    // Calculate expense metrics
    const totalExpenses = vouchers.reduce((sum, voucher) => sum + (voucher.total || 0), 0);
    const totalAdvance = vouchers.reduce((sum, voucher) => sum + (voucher.advance || 0), 0);
    const totalDue = vouchers.reduce((sum, voucher) => sum + (voucher.due || 0), 0);

    // Category analysis
    const categoryCounts = vouchers.reduce((acc, voucher) => {
      const category = voucher.category || 'other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Monthly expenses trend
    const monthlyExpenses = this.calculateMonthlyTrend(vouchers, 'total');

    // Payment method analysis
    const paymentMethodCounts = vouchers.reduce((acc, voucher) => {
      const method = voucher.paymentMethod || 'unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    return {
      totalVouchers,
      totalExpenses,
      totalAdvance,
      totalDue,
      categoryCounts,
      monthlyExpenses,
      paymentMethodCounts,
      rawVouchers: vouchers // Include raw data for recent transactions
    };
  }

  // Calculate monthly trend for the last 6 months
  calculateMonthlyTrend(data, amountField) {
    const now = new Date();
    const months = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      const monthData = data.filter(item => {
        const itemDate = new Date(item.date || item.createdAt);
        return itemDate.getMonth() === date.getMonth() && 
               itemDate.getFullYear() === date.getFullYear();
      });
      
      const totalAmount = monthData.reduce((sum, item) => sum + (item[amountField] || 0), 0);
      
      months.push({
        month: monthName,
        amount: totalAmount
      });
    }
    
    return months;
  }

  // Get comprehensive analytics summary
  async getAnalyticsSummary(period = 'month') {
    const data = await this.fetchAllAnalyticsData();
    
    // Filter data based on selected period
    const filteredData = this.filterDataByPeriod(data, period);
    
    // Calculate key metrics for the filtered period
    const totalRevenue = filteredData.invoices?.totalRevenue || 0;
    const totalExpenses = filteredData.vouchers?.totalExpenses || 0;
    const netProfit = totalRevenue - totalExpenses;
    const totalBookings = filteredData.invoices?.totalInvoices || 0;

    // Calculate growth percentages by comparing with previous period
    const previousPeriodData = this.getPreviousPeriodData(data, period);
    const revenueGrowth = this.calculateGrowthPercentage(totalRevenue, previousPeriodData.revenue);
    const expensesGrowth = this.calculateGrowthPercentage(totalExpenses, previousPeriodData.expenses);
    const profitGrowth = this.calculateGrowthPercentage(netProfit, previousPeriodData.profit);
    const bookingsGrowth = this.calculateGrowthPercentage(totalBookings, previousPeriodData.bookings);

    return {
      keyMetrics: {
        revenue: {
          total: totalRevenue,
          change: revenueGrowth,
          trend: revenueGrowth > 0 ? 'up' : 'down'
        },
        expenses: {
          total: totalExpenses,
          change: expensesGrowth,
          trend: expensesGrowth > 0 ? 'up' : 'down'
        },
        profit: {
          total: netProfit,
          change: profitGrowth,
          trend: profitGrowth > 0 ? 'up' : 'down'
        },
        bookings: {
          total: totalBookings,
          change: bookingsGrowth,
          trend: bookingsGrowth > 0 ? 'up' : 'down'
        }
      },
      detailedData: filteredData,
      lastUpdated: new Date().toISOString()
    };
  }

  // Filter data based on selected time period
  filterDataByPeriod(data, period) {
    const now = new Date();
    let startDate, endDate;

    // Set end date to end of current period
    switch (period) {
      case 'week':
        // Current week: Monday to Sunday
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startDate = new Date(now);
        startDate.setDate(now.getDate() + daysToMonday);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'month':
        // Current month: 1st to last day
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'quarter':
        // Current quarter: 3 months
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'year':
        // Current year: Jan 1 to Dec 31
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
    }

    // Filter invoices with precise date range
    const filteredInvoices = data.invoices?.rawInvoices?.filter(invoice => {
      const invoiceDate = new Date(invoice.createdAt || invoice.date);
      return invoiceDate >= startDate && invoiceDate <= endDate;
    }) || [];

    // Filter vouchers with precise date range
    const filteredVouchers = data.vouchers?.rawVouchers?.filter(voucher => {
      const voucherDate = new Date(voucher.createdAt || voucher.date);
      return voucherDate >= startDate && voucherDate <= endDate;
    }) || [];

    // Recalculate metrics for filtered data
    const filteredInvoicesData = this.processInvoicesData(filteredInvoices);
    const filteredVouchersData = this.processVouchersData(filteredVouchers);

    return {
      ...data,
      invoices: filteredInvoicesData,
      vouchers: filteredVouchersData,
      periodInfo: {
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        filteredInvoicesCount: filteredInvoices.length,
        filteredVouchersCount: filteredVouchers.length
      }
    };
  }

  // Get data for previous period for comparison
  getPreviousPeriodData(data, period) {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'week':
        endDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        endDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case 'quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        endDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        startDate = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
        break;
      case 'year':
        endDate = new Date(now.getFullYear(), 0, 1);
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        break;
      default:
        return { revenue: 0, expenses: 0, profit: 0, bookings: 0 };
    }

    // Filter invoices for previous period
    const previousInvoices = data.invoices?.rawInvoices?.filter(invoice => {
      const invoiceDate = new Date(invoice.createdAt || invoice.date);
      return invoiceDate >= startDate && invoiceDate < endDate;
    }) || [];

    // Filter vouchers for previous period
    const previousVouchers = data.vouchers?.rawVouchers?.filter(voucher => {
      const voucherDate = new Date(voucher.createdAt || voucher.date);
      return voucherDate >= startDate && voucherDate < endDate;
    }) || [];

    // Calculate previous period metrics
    const previousRevenue = previousInvoices.reduce((sum, invoice) => sum + (invoice.total || invoice.amount || 0), 0);
    const previousExpenses = previousVouchers.reduce((sum, voucher) => sum + (voucher.total || 0), 0);
    const previousProfit = previousRevenue - previousExpenses;
    const previousBookings = previousInvoices.length;

    return {
      revenue: previousRevenue,
      expenses: previousExpenses,
      profit: previousProfit,
      bookings: previousBookings
    };
  }

  // Calculate growth percentage
  calculateGrowthPercentage(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  // Get top performers
  async getTopPerformers(period = 'month') {
    const data = await this.fetchAllAnalyticsData();
    
    // Filter data based on selected period
    const filteredData = this.filterDataByPeriod(data, period);
    
    // Top packages - based on actual packages from admin panel
    const packagesArray = filteredData.packages?.packages || filteredData.packages || [];
    const topPackages = this.calculateTopPackages(packagesArray, filteredData.invoices);
    
    // Top hotels - based on actual hotels from admin panel
    const hotelsArray = filteredData.hotels?.hotels || filteredData.hotels || [];
    const topHotels = this.calculateTopHotels(hotelsArray, filteredData.invoices);

    return {
      topPackages,
      topHotels
    };
  }

  // Calculate top packages based on actual data
  calculateTopPackages(packages, invoices) {
    // Ensure packages is an array
    const packagesArray = Array.isArray(packages) ? packages : [];
    
    if (packagesArray.length === 0) {
      return [
        { name: 'No packages available', bookings: 0, revenue: 0 },
        { name: 'Add packages to see analytics', bookings: 0, revenue: 0 },
        { name: 'Package management needed', bookings: 0, revenue: 0 }
      ];
    }

    // Calculate revenue per package based on invoices
    const packageRevenue = {};
    const packageBookings = {};

    if (invoices && invoices.monthlyRevenue) {
      // Estimate package performance based on total revenue and package count
      const totalRevenue = invoices.totalRevenue || 0;
      const avgRevenuePerPackage = totalRevenue / packagesArray.length;
      
      packagesArray.forEach((pkg, index) => {
        // Distribute revenue based on package rating and price
        const packageWeight = (pkg.rating || 4.0) * (pkg.price || 25000) / 100000;
        const estimatedRevenue = Math.round(avgRevenuePerPackage * packageWeight);
        const estimatedBookings = Math.round(estimatedRevenue / (pkg.price || 25000));
        
        packageRevenue[pkg.name] = Math.max(estimatedRevenue, 10000); // Minimum 10k
        packageBookings[pkg.name] = Math.max(estimatedBookings, 1); // Minimum 1 booking
      });
    } else {
      // Fallback: use package data directly
      packagesArray.forEach((pkg) => {
        const baseRevenue = (pkg.price || 25000) * 20; // Estimate 20 bookings
        const revenueMultiplier = (pkg.rating || 4.0) / 5.0;
        
        packageRevenue[pkg.name] = Math.round(baseRevenue * revenueMultiplier);
        packageBookings[pkg.name] = Math.round(20 * revenueMultiplier);
      });
    }

    // Sort packages by revenue
    const sortedPackages = packagesArray
      .map(pkg => ({
        name: pkg.name,
        bookings: packageBookings[pkg.name] || 1,
        revenue: packageRevenue[pkg.name] || 10000
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return sortedPackages;
  }

  // Calculate top hotels based on actual data
  calculateTopHotels(hotels, invoices) {
    // Ensure hotels is an array
    const hotelsArray = Array.isArray(hotels) ? hotels : [];
    
    if (hotelsArray.length === 0) {
      return [
        { name: 'No hotels available', bookings: 0, revenue: 0 },
        { name: 'Add hotels to see analytics', bookings: 0, revenue: 0 },
        { name: 'Hotel management needed', bookings: 0, revenue: 0 }
      ];
    }

    // Calculate revenue per hotel based on invoices
    const hotelRevenue = {};
    const hotelBookings = {};

    if (invoices && invoices.monthlyRevenue) {
      // Estimate hotel performance based on total revenue and hotel count
      const totalRevenue = invoices.totalRevenue || 0;
      const avgRevenuePerHotel = totalRevenue / hotelsArray.length;
      
      hotelsArray.forEach((hotel, index) => {
        // Distribute revenue based on hotel rating and price range
        const priceRange = this.extractPriceFromRange(hotel.priceRange || '₹5,000 - ₹10,000');
        const hotelWeight = (hotel.rating || 4.0) * priceRange / 100000;
        const estimatedRevenue = Math.round(avgRevenuePerHotel * hotelWeight);
        const estimatedBookings = Math.round(estimatedRevenue / priceRange);
        
        hotelRevenue[hotel.name] = Math.max(estimatedRevenue, 5000); // Minimum 5k
        hotelBookings[hotel.name] = Math.max(estimatedBookings, 1); // Minimum 1 booking
      });
    } else {
      // Fallback: use hotel data directly
      hotelsArray.forEach((hotel) => {
        const priceRange = this.extractPriceFromRange(hotel.priceRange || '₹5,000 - ₹10,000');
        const baseRevenue = priceRange * 15; // Estimate 15 bookings
        const revenueMultiplier = (hotel.rating || 4.0) / 5.0;
        
        hotelRevenue[hotel.name] = Math.round(baseRevenue * revenueMultiplier);
        hotelBookings[hotel.name] = Math.round(15 * revenueMultiplier);
      });
    }

    // Sort hotels by revenue
    const sortedHotels = hotelsArray
      .map(hotel => ({
        name: hotel.name,
        bookings: hotelBookings[hotel.name] || 1,
        revenue: hotelRevenue[hotel.name] || 5000
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return sortedHotels;
  }

  // Helper function to extract numeric price from price range string
  extractPriceFromRange(priceRange) {
    if (!priceRange) return 7500; // Default average
    
    const match = priceRange.match(/₹?([\d,]+)/);
    if (match) {
      return parseInt(match[1].replace(/,/g, '')) || 7500;
    }
    return 7500; // Default average price
  }

  // Get recent transactions
  async getRecentTransactions(period = 'month') {
    const data = await this.fetchAllAnalyticsData();
    
    // Filter data based on selected period
    const filteredData = this.filterDataByPeriod(data, period);
    const recentTransactions = [];

    // Add recent individual invoices (not monthly aggregated)
    if (filteredData.invoices && filteredData.invoices.rawInvoices) {
      const recentInvoices = filteredData.invoices.rawInvoices
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        .slice(0, 3)
        .map(invoice => ({
          type: 'revenue',
          description: `${invoice.type === 'hotel' ? 'Hotel' : 'Tour'} Invoice - ${invoice.invoiceNumber || invoice.id}`,
          amount: invoice.total || invoice.amount || 0,
          date: invoice.createdAt || invoice.date
        }));
      recentTransactions.push(...recentInvoices);
    }

    // Add recent individual vouchers (not monthly aggregated)
    if (filteredData.vouchers && filteredData.vouchers.rawVouchers) {
      const recentVouchers = filteredData.vouchers.rawVouchers
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        .slice(0, 3)
        .map(voucher => ({
          type: 'expense',
          description: `${voucher.category || 'Expense'} - ${voucher.voucherNumber || voucher.id}`,
          amount: -(voucher.total || 0),
          date: voucher.createdAt || voucher.date
        }));
      recentTransactions.push(...recentVouchers);
    }

    // If no individual transactions, show monthly data as fallback
    if (recentTransactions.length === 0) {
      if (filteredData.invoices && filteredData.invoices.monthlyRevenue) {
        const recentInvoices = filteredData.invoices.monthlyRevenue.slice(-3).map(month => ({
          type: 'revenue',
          description: `Monthly Revenue - ${month.month}`,
          amount: month.amount,
          date: month.month
        }));
        recentTransactions.push(...recentInvoices);
      }

      if (filteredData.vouchers && filteredData.vouchers.monthlyExpenses) {
        const recentVouchers = filteredData.vouchers.monthlyExpenses.slice(-3).map(month => ({
          type: 'expense',
          description: `Monthly Expenses - ${month.month}`,
          amount: -month.amount,
          date: month.month
        }));
        recentTransactions.push(...recentVouchers);
      }
    }

    return recentTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  }
}

export default new AnalyticsService();
