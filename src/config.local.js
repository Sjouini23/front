// config.local.js - Environment-aware API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
                     process.env.REACT_APP_API_URL || 
                     "http://localhost:3001";

const config = {
  API_BASE_URL: API_BASE_URL,
  API_ENDPOINTS: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    VERIFY: `${API_BASE_URL}/api/auth/verify`,
    WASHES: `${API_BASE_URL}/api/washes`,
    HEALTH: `${API_BASE_URL}/api/health`
  }
};

export default config;
