import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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
export const getUsers = (params) => api.get('/users/', { params });
export const getSupports = () => api.get('/supports/');
export const getSubjects = () => api.get('/subjects/');
export const getBookings = (params) => api.get('/bookings/', { params });
export const confirmBooking = (id) => api.post(`/bookings/${id}/confirm/`);
export const getLessons = (params) => api.get('/lessons/', { params });
export const startLesson = (data) => api.post('/lessons/start/', data);
export const endLesson = (data) => api.post('/lessons/end/', data);
export const getSupportProfile = () => api.get('/support/profile/');
export const getStudentStatus = () => api.get('/support/students/');
export const getSchedules = () => api.get('/schedules/');
export const createSchedule = (data) => api.post('/schedules/', data);
export const deleteSchedule = (id) => api.delete(`/schedules/${id}/`);
export const cancelBooking = (id) => api.post(`/bookings/${id}/cancel/`);
export const updateProfile = (data) => api.patch('/users/me/', data);

export default api;
