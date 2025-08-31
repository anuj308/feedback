import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 10000, // 10 seconds timeout
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging and adding auth
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('📤 Request config:', {
      method: config.method,
      url: config.url,
      data: config.data,
      params: config.params,
      headers: config.headers,
    });

    // Add timestamp to requests for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging and error handling
api.interceptors.response.use(
  (response) => {
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`);
    console.log('📥 Response data:', response.data);
    console.log('📊 Response status:', response.status);
    
    return response;
  },
  (error) => {
    const endTime = new Date();
    const duration = error.config?.metadata ? endTime - error.config.metadata.startTime : 'unknown';
    
    // Don't log auth check failures as errors (they're expected when not logged in)
    const isAuthCheck = error.config?.url?.includes('/user/current-user');
    const is401 = error.response?.status === 401;
    
    if (isAuthCheck && is401) {
      console.log(`🔍 Auth check: No valid session found`);
    } else {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} (${duration}ms)`);
      console.error('💥 Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          method: error.config?.method,
          url: error.config?.url,
          data: error.config?.data,
        }
      });
    }

    // Handle specific error cases
    if (error.response?.status === 401 && !isAuthCheck) {
      console.warn('🔐 Unauthorized - redirecting to login');
      // Only redirect if it's not the initial auth check
      window.location.href = '/login';
    }

    if (error.response?.status === 403) {
      console.warn('🚫 Forbidden - insufficient permissions');
    }

    if (error.response?.status >= 500) {
      console.error('🔥 Server Error - please try again later');
    }

    return Promise.reject(error);
  }
);

// Helper functions for common API patterns
export const apiHelpers = {
  // Generic GET request
  get: (url, config = {}) => {
    console.log(`📖 GET Request: ${url}`);
    return api.get(url, config);
  },

  // Generic POST request
  post: (url, data = {}, config = {}) => {
    console.log(`📝 POST Request: ${url}`, data);
    return api.post(url, data, config);
  },

  // Generic PUT request
  put: (url, data = {}, config = {}) => {
    console.log(`✏️ PUT Request: ${url}`, data);
    return api.put(url, data, config);
  },

  // Generic PATCH request
  patch: (url, data = {}, config = {}) => {
    console.log(`🔧 PATCH Request: ${url}`, data);
    return api.patch(url, data, config);
  },

  // Generic DELETE request
  delete: (url, config = {}) => {
    console.log(`🗑️ DELETE Request: ${url}`);
    return api.delete(url, config);
  },

  // Upload file with progress
  uploadFile: (url, formData, onUploadProgress = null) => {
    console.log(`📤 File Upload: ${url}`);
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`📈 Upload Progress: ${progress}%`);
          onUploadProgress(progress);
        }
      },
    });
  },
};

// API endpoints object for centralized management
export const endpoints = {
  // Auth endpoints
  auth: {
    login: '/user/login',
    register: '/user/register',
    logout: '/user/logout',
    refreshToken: '/user/refresh-token',
    currentUser: '/user/current-user',
  },

  // Form endpoints
  forms: {
    create: '/form/create',
    getAll: '/form',
    getById: (id) => `/form/f/${id}`,
    update: (id) => `/form/f/${id}`,
    delete: (id) => `/form/f/${id}`,
    rename: (id) => `/form/f/${id}`,
    getByOwner: () => `/form/o`,
    toggleResponses: (id) => `/form/admin/${id}`,
    analytics: (id) => `/form/analytics/${id}`,
    responses: (id) => `/form/responses/${id}`,
    settings: (id) => `/form/settings/${id}`,
  },

  // Store endpoints
  store: {
    submit: '/store',
    getByForm: (formId) => `/store/f/${formId}`,
    analytics: (formId) => `/store/analytics/${formId}`,
  },
};

// Export both api instance and endpoints
export { api };
export default api;
