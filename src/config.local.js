// config.local.js - Frontend API Configuration
// This should match your backend server port (default: 3001)

const API_BASE_URL = "http://localhost:3001/api";

export default API_BASE_URL;

// Alternative configuration for different environments:
/*
const config = {
  development: {
    API_BASE_URL: "http://localhost:3001/api",
    UPLOAD_URL: "http://localhost:3001/uploads"
  },
  production: {
    API_BASE_URL: "https://your-domain.com/api",
    UPLOAD_URL: "https://your-domain.com/uploads"
  }
};

const environment = process.env.NODE_ENV || 'development';
export default config[environment];
*/