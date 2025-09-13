const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Convert relative media paths to absolute URLs against the API origin
  toAbsoluteUrl(path) {
    if (!path || typeof path !== 'string') return path;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/uploads') || path.startsWith('/api/upload/gridfs')) {
      try {
        const origin = new URL(this.baseURL).origin; // e.g., http://localhost:5000
        return `${origin}${path}`;
      } catch {
        return path;
      }
    }
    return path;
  }

  // Get auth token from localStorage
  getToken() {
    return localStorage.getItem('token');
  }

  // Get headers with auth token
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    // Start with default headers incl. Authorization
    const baseHeaders = this.getHeaders(options.includeAuth !== false);
    const config = {
      ...options,
      headers: {
        ...baseHeaders,
        ...(options.headers || {})
      }
    };

    // Remove Content-Type header for file uploads to let browser set boundary
    if (options.headers && Object.prototype.hasOwnProperty.call(options.headers, 'Content-Type') && options.headers['Content-Type'] === undefined) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      
      // Handle network errors
      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/auth';
          throw new Error('Session expired. Please login again.');
        }
        
        // Handle rate limiting
        if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        }
        
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request error:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your connection.');
      }
      
      throw error;
    }
  }

  // GET request
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'GET',
      ...options,
    });
  }

  // POST request
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // PUT request
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // DELETE request
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  // Auth specific methods
  async login(email, password) {
    return this.post('/auth/login', { email, password }, { includeAuth: false });
  }

  async register(userData) {
    return this.post('/auth/register', userData, { includeAuth: false });
  }

  async getProfile() {
    return this.get('/auth/me');
  }

  async updateProfile(userData) {
    return this.put('/auth/profile', userData);
  }

  async updatePassword(currentPassword, newPassword) {
    return this.put('/auth/password', { currentPassword, newPassword });
  }

  async logout() {
    return this.post('/auth/logout');
  }

  async verifyToken() {
    return this.post('/auth/verify-token');
  }

  // Admin specific methods
  async getUsers(page = 1, limit = 10, search = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    return this.get(`/admin/users?${params}`);
  }

  async getUserById(userId) {
    return this.get(`/admin/users/${userId}`);
  }

  async updateUser(userId, userData) {
    return this.put(`/admin/users/${userId}`, userData);
  }

  async deleteUser(userId) {
    return this.delete(`/admin/users/${userId}`);
  }

  async getAdminStats() {
    return this.get('/admin/stats');
  }

  async getAdminAuditLogs(page = 1, limit = 50, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    return this.get(`/admin/audit?${params}`);
  }

  async getAdminSecurityEvents(hours = 24) {
    return this.get(`/admin/security?hours=${hours}`);
  }

  // Places API
  async getPlaces() {
    return this.get('/places', { includeAuth: false });
  }

  async getPlaceById(placeId) {
    return this.get(`/places/${placeId}`, { includeAuth: false });
  }

  async getPlaceHotels(placeId) {
    return this.get(`/places/${placeId}/hotels`, { includeAuth: false });
  }

  async createPlace(placeData) {
    return this.post('/places', placeData);
  }

  async updatePlace(placeId, placeData) {
    return this.put(`/places/${placeId}`, placeData);
  }

  async deletePlace(placeId) {
    return this.delete(`/places/${placeId}`);
  }

  async getPlaceStats() {
    return this.get('/places/admin/stats');
  }

  // Hotels API
  async getHotels(page = 1, limit = 10) {
    return this.get(`/hotels?page=${page}&limit=${limit}`, { includeAuth: false });
  }

  async getHotelById(hotelId) {
    return this.get(`/hotels/${hotelId}`, { includeAuth: false });
  }

  async getHotelsByPlace(placeId) {
    return this.get(`/hotels/place/${placeId}`, { includeAuth: false });
  }

  async createHotel(hotelData) {
    return this.post('/hotels', hotelData);
  }

  async updateHotel(hotelId, hotelData) {
    return this.put(`/hotels/${hotelId}`, hotelData);
  }

  async deleteHotel(hotelId) {
    return this.delete(`/hotels/${hotelId}`);
  }

  async getHotelStats() {
    return this.get('/hotels/admin/stats');
  }

  // Upload API
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
      // Primary: disk storage endpoint
      return await this.request('/upload/image', {
        method: 'POST',
        body: formData,
        includeAuth: true,
        headers: { 'Content-Type': undefined }
      });
    } catch (e) {
      // Fallback: GridFS upload via raw stream
      const url = `${this.baseURL}/upload/gridfs`;
      const token = this.getToken();
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          'x-filename': file.name,
          'Content-Type': file.type || 'application/octet-stream'
        },
        body: file
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'GridFS upload failed');
      }
      const data = await response.json();
      // Normalize to same shape as disk upload
      return {
        success: true,
        message: 'Uploaded via GridFS',
        data: {
          url: data.data.url,
          relativeUrl: data.data.url
        }
      };
    }
  }

  async uploadImages(files) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    return this.request('/upload/images', {
      method: 'POST',
      body: formData,
      includeAuth: true,
      headers: {
        // Don't set Content-Type, let browser set it with boundary
        'Content-Type': undefined
      }
    });
  }

  // Upload single hotel image
  async uploadHotelImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    try {
      return await this.request('/upload/hotels/image', {
        method: 'POST',
        body: formData,
        includeAuth: true,
        headers: { 'Content-Type': undefined }
      });
    } catch (e) {
      // Fallback to GridFS
      const url = `${this.baseURL}/upload/gridfs`;
      const token = this.getToken();
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          'x-filename': file.name,
          'Content-Type': file.type || 'application/octet-stream'
        },
        body: file
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'GridFS upload failed');
      }
      const data = await response.json();
      return { success: true, message: 'Uploaded via GridFS', data: { url: data.data.url, relativeUrl: data.data.url } };
    }
  }

  // Upload multiple hotel images
  async uploadHotelImages(files) {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    try {
      return await this.request('/upload/hotels/images', {
        method: 'POST',
        body: formData,
        includeAuth: true,
        headers: { 'Content-Type': undefined }
      });
    } catch (e) {
      // Fallback to uploading one by one via GridFS
      const results = [];
      for (const file of files) {
        const r = await this.uploadHotelImage(file);
        results.push({ url: r.data.url, relativeUrl: r.data.relativeUrl || r.data.url });
      }
      return { success: true, data: { files: results } };
    }
  }

  // Health check
  async healthCheck() {
    return this.get('/health', { includeAuth: false });
  }

  // Packages API
  async listPackages() {
    return this.get('/packages', { includeAuth: false });
  }
  async createPackage(pkg) {
    return this.post('/packages', pkg);
  }
  async updatePackage(id, pkg) {
    return this.put(`/packages/${id}`, pkg);
  }
  async deletePackage(id) {
    return this.delete(`/packages/${id}`);
  }

  async uploadPackageImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    return this.request('/upload/packages/image', {
      method: 'POST',
      body: formData,
      includeAuth: true,
      headers: { 'Content-Type': undefined }
    });
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;




