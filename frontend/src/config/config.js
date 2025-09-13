// Frontend configuration
export const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_URL || '/api',
  
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
  IS_PRODUCTION: import.meta.env.MODE === 'production'
};

// Validate configuration
if (!config.API_BASE_URL) {
  console.error('❌ API_BASE_URL is not configured');
}

export default config;




