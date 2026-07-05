import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const res = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token, refresh_token } = res.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Domain-specific API wrappers — plug your real endpoints in here
// ---------------------------------------------------------------------------

export const documentApi = {
  getAll: () => api.get('/api/documents'),
  getById: (id) => api.get(`/api/documents/${id}`),
  upload: (formData) =>
    api.post('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  startAiScan: (id) => api.post(`/api/documents/${id}/analyze/ai`),
  startPlagiarismScan: (id) => api.post(`/api/documents/${id}/analyze/plagiarism`),
  downloadReport: (id) =>
    api.get(`/api/documents/${id}/download-report`, { responseType: 'blob' }),
  saveGrade: (id, payload) => api.post(`/api/documents/${id}/grade`, payload),
};

export const dashboardApi = {
  getStats: () => api.get('/api/dashboard'),
};

export default api;
