import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const authAttempt = url.includes('/auth/login') || url.includes('/auth/register');
    if (error.response?.status === 401 && !authAttempt) {
      localStorage.removeItem('crm_token');
      const path = window.location.pathname;
      if (!path.startsWith('/login') && !path.startsWith('/register')) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error, fallback = 'The request could not be completed. Try again.') {
  return error?.response?.data?.message || fallback;
}

export async function fetchAll(path, params = {}) {
  const limit = params.limit || 50;
  let page = 1;
  let pages = 1;
  const rows = [];
  while (page <= pages && page < 20) {
    const { data } = await api.get(path, { params: { ...params, page, limit } });
    rows.push(...(data.data || []));
    pages = data.pages || 1;
    page += 1;
  }
  return rows;
}

export default api;
