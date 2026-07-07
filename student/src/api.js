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

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
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
export const getStudentSupports = () => api.get('/student/supports/');
export const getAvailableSlots = (supportId, date) =>
  api.get(`/supports/${supportId}/slots/`, { params: { date } });
export const createBooking = (data) => api.post('/bookings/create/', data);
export const getBookings = (params) => api.get('/bookings/', { params });
export const getLessons = (params) => api.get('/lessons/', { params });
export const getSubjects = () => api.get('/subjects/');
export const getSupportSchedules = () => api.get('/student/supports/schedules/');
export const rateLesson = (data) => api.post('/lessons/rate/', data);
export const register = (data) => api.post('/users/', data);
export const getStudentProfile = () => api.get('/student/profile/');
export const updateProfile = (data) => api.patch('/users/me/', data);

export default api;
