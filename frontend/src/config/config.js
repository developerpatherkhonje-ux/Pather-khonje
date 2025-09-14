// Frontend configuration
const getApiBaseUrl = () => {
  // Check if we're running in development
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  }
  
  // Check if we're on the custom domain
  if (window.location.hostname === 'www.patherkhonje.com' || window.location.hostname === 'patherkhonje.com') {
    return 'https://pather-khonje.onrender.com/api';
  }
  
  // Default to Vercel environment
  return import.meta.env.VITE_API_URL || 'https://pather-khonje.onrender.com/api';
};

export const config = {
  // API Configuration
  API_BASE_URL: getApiBaseUrl(),
  
  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Pather Khonje',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // WhatsApp Configuration
  WHATSAPP_NUMBER: '+917439857694',
  
  // Company Information
  COMPANY: {
    name: 'Pather Khonje',
    email: 'info@patherkhonje.com',
    phone: '+91 7439857694',
    address: '64/2/12, Biren Roy Road (East), Behala Chowrasta, Kolkata - 700008'
  },
  
  // Environment
  NODE_ENV: import.meta.env.MODE || 'development',
  IS_PRODUCTION: import.meta.env.MODE === 'production',
  
  // Current domain info
  CURRENT_DOMAIN: window.location.hostname,
  IS_CUSTOM_DOMAIN: window.location.hostname === 'www.patherkhonje.com' || window.location.hostname === 'patherkhonje.com'
};

// Validate configuration
if (!config.API_BASE_URL) {
  console.error('❌ API_BASE_URL is not configured');
}

export default config;




