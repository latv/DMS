import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Required to send/receive cookies
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  }
});

// Handle 401 errors gracefully (user not authenticated)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't throw for 401 errors - let components handle them
    if (error.response?.status === 401) {
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default api;