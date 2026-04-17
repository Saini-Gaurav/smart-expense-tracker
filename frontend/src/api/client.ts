import axios, { type InternalAxiosRequestConfig } from 'axios';

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

let accessToken = localStorage.getItem('expense_access_token') || '';

export const setAccessToken = (token: string | null | undefined): void => {
  accessToken = token || '';
  if (token) localStorage.setItem('expense_access_token', token);
  else localStorage.removeItem('expense_access_token');
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.config) return Promise.reject(error);
    const original = error.config;
    const status = error.response?.status;
    const url = String(original.url || '');
    const isCredentialAuth =
      url.includes('/auth/login') || url.includes('/auth/register');
    if (
      status === 401 &&
      !original._retry &&
      !url.includes('/auth/refresh') &&
      !isCredentialAuth
    ) {
      original._retry = true;
      const { data } = await api.post<{ token: string }>('/auth/refresh');
      setAccessToken(data.token);
      original.headers.Authorization = `Bearer ${data.token}`;
      return api(original);
    }
    return Promise.reject(error);
  }
);

export default api;
