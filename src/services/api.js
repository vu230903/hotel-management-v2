import axios from 'axios';

// Cấu hình API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Tạo axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  oauth: (oauthData) => api.post('/auth/oauth', oauthData),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  logout: () => api.post('/auth/logout'),
};

// Users API
export const usersAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  updateUserRole: (id, roleData) => api.put(`/users/${id}/role`, roleData),
  updateUserStatus: (id, statusData) => api.put(`/users/${id}/status`, statusData),
  banUser: (id, banData) => api.put(`/users/${id}/ban`, banData),
  unbanUser: (id) => api.put(`/users/${id}/unban`),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Rooms API
export const roomsAPI = {
  getRooms: (params) => api.get('/rooms', { params }),
  getRoom: (id) => api.get(`/rooms/${id}`),
  createRoom: (data) => api.post('/rooms', data),
  updateRoom: (id, data) => api.put(`/rooms/${id}`, data),
  updateRoomStatus: (id, statusData) => api.put(`/rooms/${id}/status`, statusData),
  updateCleaningStatus: (id, cleaningData) => api.put(`/rooms/${id}/cleaning-status`, cleaningData),
  deleteRoom: (id) => api.delete(`/rooms/${id}`),
};

// Bookings API
export const bookingsAPI = {
  getBookings: (params) => api.get('/bookings', { params }),
  getBooking: (id) => api.get(`/bookings/${id}`),
  createBooking: (data) => api.post('/bookings', data),
  updateBookingStatus: (id, statusData) => api.put(`/bookings/${id}/status`, statusData),
  checkIn: (id, checkInData) => api.put(`/bookings/${id}/check-in`, checkInData),
  checkOut: (id, checkOutData) => api.put(`/bookings/${id}/check-out`, checkOutData),
  cancelBooking: (id) => api.put(`/bookings/${id}/cancel`),
  deleteBooking: (id) => api.delete(`/bookings/${id}`),
  updatePaymentStatus: (id, status) => api.put(`/bookings/${id}/payment-status`, { status }),
};

// Services API
export const servicesAPI = {
  getCustomerServices: (params = {}) => api.get('/services/customer', { params }),
  getServices: (params) => api.get('/services', { params }),
  getService: (id) => api.get(`/services/${id}`),
  createService: (data) => api.post('/services', data),
  updateService: (id, data) => api.put(`/services/${id}`, data),
  updateServiceStatus: (id, statusData) => api.put(`/services/${id}/status`, statusData),
  updateServiceStatistics: (id, statsData) => api.put(`/services/${id}/statistics`, statsData),
  getServiceCategories: () => api.get('/services/categories/list'),
  deleteService: (id) => api.delete(`/services/${id}`),
};

// Service Orders API
export const serviceOrdersAPI = {
  getServiceOrders: (params) => api.get('/service-orders', { params }),
  getServiceOrder: (id) => api.get(`/service-orders/${id}`),
  createServiceOrder: (data) => api.post('/service-orders', data),
  updateServiceOrderStatus: (id, statusData) => api.put(`/service-orders/${id}/status`, statusData),
  updateServiceOrderPayment: (id, paymentData) => api.put(`/service-orders/${id}/payment`, paymentData),
  cancelServiceOrder: (id) => api.delete(`/service-orders/${id}`),
};

// Reviews API
export const reviewsAPI = {
  getReviews: (params = {}) => api.get('/reviews', { params }),
  getCustomerReviews: (params = {}) => api.get('/reviews/customer', { params }),
  getBookingsForReview: () => api.get('/reviews/bookings-for-review'),
  createReview: (reviewData) => api.post('/reviews', reviewData),
  markHelpful: (id) => api.put(`/reviews/${id}/helpful`),
  unmarkHelpful: (id) => api.put(`/reviews/${id}/unhelpful`),
  updateReviewStatus: (id, statusData) => api.put(`/reviews/${id}/status`, statusData),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

export default api;
