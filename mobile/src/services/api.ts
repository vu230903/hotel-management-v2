import axios from 'axios';

// API Base URL - same as web app
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from AsyncStorage
    const token = require('@react-native-async-storage/async-storage').default.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      require('@react-native-async-storage/async-storage').default.removeItem('token');
      require('@react-native-async-storage/async-storage').default.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  changePassword: (passwordData: any) => api.post('/auth/change-password', passwordData),
  logout: () => api.post('/auth/logout'),
};

// Rooms API
export const roomsAPI = {
  getRooms: (params?: any) => api.get('/rooms', { params }),
  getRoom: (id: string) => api.get(`/rooms/${id}`),
  createRoom: (data: any) => api.post('/rooms', data),
  updateRoom: (id: string, data: any) => api.put(`/rooms/${id}`, data),
  updateRoomStatus: (id: string, statusData: any) => api.put(`/rooms/${id}/status`, statusData),
  updateCleaningStatus: (id: string, cleaningData: any) => api.put(`/rooms/${id}/cleaning-status`, cleaningData),
  deleteRoom: (id: string) => api.delete(`/rooms/${id}`),
};

// Bookings API
export const bookingsAPI = {
  getBookings: (params?: any) => api.get('/bookings', { params }),
  getBooking: (id: string) => api.get(`/bookings/${id}`),
  createBooking: (data: any) => api.post('/bookings', data),
  updateBookingStatus: (id: string, statusData: any) => api.put(`/bookings/${id}/status`, statusData),
  checkIn: (id: string, checkInData: any) => api.put(`/bookings/${id}/check-in`, checkInData),
  checkOut: (id: string, checkOutData: any) => api.put(`/bookings/${id}/check-out`, checkOutData),
  cancelBooking: (id: string) => api.put(`/bookings/${id}/cancel`),
  deleteBooking: (id: string) => api.delete(`/bookings/${id}`),
  updatePaymentStatus: (id: string, status: string) => api.put(`/bookings/${id}/payment-status`, { status }),
};

// Cleaning API
export const cleaningAPI = {
  getRoomsNeedingCleaning: () => api.get('/rooms?status=needs_cleaning'),
  updateCleaningStatus: (roomId: string, status: string) =>
    api.put(`/rooms/${roomId}/cleaning-status`, { status }),
  getCleaningTasks: () => api.get('/rooms?cleaningStatus=dirty'),
};

export default api;
