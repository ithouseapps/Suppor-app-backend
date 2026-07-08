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
  async (err) => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/token/refresh/`, { refresh: refreshToken });
          localStorage.setItem('access', res.data.access);
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // refresh failed
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
export const createBooking = (data) => api.post('/bookings/create/', data);
export const confirmBooking = (id) => api.post(`/bookings/${id}/confirm/`);
export const cancelBooking = (id) => api.post(`/bookings/${id}/cancel/`);

export const getLessons = (params) => api.get('/lessons/', { params });
export const startLesson = (data) => api.post('/lessons/start/', data);
export const endLesson = (data) => api.post('/lessons/end/', data);

export const getDashboardStats = () => api.get('/dashboard/stats/');
export const getDashboardSupports = () => api.get('/dashboard/supports/');
export const getDashboardRooms = () => api.get('/dashboard/rooms/');

export const getSupportProfile = () => api.get('/support/profile/');
export const getStudentStatus = () => api.get('/support/students/');
export const getStudentSupports = () => api.get('/student/supports/');
export const getAvailableSlots = (supportId, date) =>
  api.get(`/supports/${supportId}/slots/`, { params: { date } });

export const getSupportSchedules = () => api.get('/student/supports/schedules/');
export const rateLesson = (data) => api.post('/lessons/rate/', data);
export const banSupport = (id, data) => api.post(`/supports/${id}/ban/`, data);
export const unbanSupport = (id) => api.post(`/supports/${id}/unban/`);
export const getSupportDelays = () => api.get('/admin/delays/');
export const generateSecretId = (studentId) => api.post(`/students/${studentId}/generate-secret/`);
export const getAdminSupportProfile = (supportId) => api.get(`/admin/supports/${supportId}/profile/`);

export const updateProfile = (data) => api.patch('/users/me/', data);

export default api;
