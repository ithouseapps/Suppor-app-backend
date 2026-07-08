import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? '/api' : 'https://suppor-app-backend-production.up.railway.app/api');
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem('refresh');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/token/refresh/`, { refresh: refreshToken });
          const newAccess = res.data.access;
          localStorage.setItem('access', newAccess);
          processQueue(null, newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
        }
      }
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const login = (username, password) =>
  api.post('/login/', { username, password }).then((r) => {
    localStorage.setItem('access', r.data.access);
    localStorage.setItem('refresh', r.data.refresh);
    localStorage.setItem('user', JSON.stringify(r.data.user));
    return r.data;
  });

export const me = () => api.get('/me/');
export const getUsers = (params) => api.get('/users/', { params });
export const createUser = (data) => api.post('/users/', data);
export const updateUser = (id, data) => api.patch(`/users/${id}/`, data);
export const deleteUser = (id) => api.delete(`/users/${id}/`);

export const getRooms = () => api.get('/rooms/');
export const createRoom = (data) => api.post('/rooms/', data);
export const updateRoom = (id, data) => api.patch(`/rooms/${id}/`, data);
export const deleteRoom = (id) => api.delete(`/rooms/${id}/`);

export const getSubjects = () => api.get('/subjects/');
export const createSubject = (data) => api.post('/subjects/', data);
export const updateSubject = (id, data) => api.patch(`/subjects/${id}/`, data);
export const deleteSubject = (id) => api.delete(`/subjects/${id}/`);

export const getSupports = () => api.get('/supports/');
export const createSupport = (data) => api.post('/supports/', data);
export const updateSupport = (id, data) => api.patch(`/supports/${id}/`, data);
export const deleteSupport = (id) => api.delete(`/supports/${id}/`);

export const getSchedules = () => api.get('/schedules/');
export const createSchedule = (data) => api.post('/schedules/', data);
export const deleteSchedule = (id) => api.delete(`/schedules/${id}/`);

export const getBookings = (params) => api.get('/bookings/', { params });
export const getLessons = (params) => api.get('/lessons/', { params });

export const getDashboardStats = () => api.get('/dashboard/stats/');
export const getDashboardSupports = () => api.get('/dashboard/supports/');
export const getDashboardRooms = () => api.get('/dashboard/rooms/');

export const banSupport = (id, data) => api.post(`/supports/${id}/ban/`, data);
export const unbanSupport = (id) => api.post(`/supports/${id}/unban/`);
export const getSupportDelays = () => api.get('/admin/delays/');
export const updateProfile = (data) => api.patch('/users/me/', data);
export const generateSecretId = (studentId) => api.post(`/students/${studentId}/generate-secret/`);
export const getSupportProfile = (supportId) => api.get(`/admin/supports/${supportId}/profile/`);

export const downloadMonthlyExcel = (year, month) =>
  api.get('/admin/excel/monthly/', { params: { year, month }, responseType: 'blob' }).then((r) => {
    const disposition = r.headers['content-disposition'];
    const filename = disposition ? disposition.split('filename=')[1]?.replace(/['"]/g, '') : `monthly_report_${year}_${String(month).padStart(2, '0')}.xlsx`;
    const url = window.URL.createObjectURL(new Blob([r.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
  });

export const getBotConfig = () => api.get('/admin/bot-config/');
export const updateBotConfig = (data) => api.put('/admin/bot-config/', data);

export default api;
