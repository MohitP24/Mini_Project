import axios from 'axios';

export const forensicsClient = axios.create({
  baseURL: '/api/forensics',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const adminClient = axios.create({
  baseURL: '/api/admin',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for logging or auth if needed in future
const setupInterceptors = (client: any) => {
  client.interceptors.response.use(
    (response: any) => response.data,
    (error: any) => {
      console.error('API Error:', error.response?.data || error.message);
      return Promise.reject(error);
    }
  );
};

setupInterceptors(forensicsClient);
setupInterceptors(adminClient);
