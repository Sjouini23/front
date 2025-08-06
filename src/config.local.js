// config.local.js - Environment-aware API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const config = {
  API_BASE_URL: API_BASE_URL,
  API_ENDPOINTS: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    VERIFY: `${API_BASE_URL}/api/auth/verify`, 
    WASHES: `${API_BASE_URL}/api/washes`,
    UPLOAD: `${API_BASE_URL}/api/upload`,
    HEALTH: `${API_BASE_URL}/api/health`,
    STATS: `${API_BASE_URL}/api/stats`,
    ANALYTICS: `${API_BASE_URL}/api/analytics`,
    INSIGHTS: `${API_BASE_URL}/api/insights`
  }
};

console.log('🔗 API Configuration:', config.API_BASE_URL);

export default config;