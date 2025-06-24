import axios from 'axios';

// Create axios instance with optimized defaults
const apiClient = axios.create({
  timeout: 15000, // 15 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for optimization
apiClient.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching issues
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (error.response?.status >= 500) {
      console.error('Server error:', error.response.status);
    }
    return Promise.reject(error);
  }
);

export default apiClient; 