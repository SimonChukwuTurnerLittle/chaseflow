import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('chaseflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('chaseflow_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;

/**
 * Extract a human-readable error message from an Axios error.
 * Checks both `message` and `error` fields from the API response body,
 * then falls back to the HTTP status text or a generic message.
 */
export function getErrorMessage(err) {
  const data = err?.response?.data;
  if (data) {
    if (typeof data === 'string') return data;
    if (data.message) return data.message;
    if (data.error) return data.error;
    if (data.fieldErrors) {
      const first = Object.values(data.fieldErrors)[0];
      if (first) return first;
    }
  }
  if (err?.response?.statusText) return err.response.statusText;
  if (err?.message) return err.message;
  return 'Something went wrong';
}
