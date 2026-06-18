import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);

    // If data is FormData, let axios set the Content-Type automatically by deleting the manual Content-Type
    if (config.data instanceof FormData) {
      if (config.headers['Content-Type']) {
        delete config.headers['Content-Type'];
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error(`[API Error] ${error.response?.status} ${error.config?.url}`, error.response?.data);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export const menuAPI = {
  getAll: () => api.get('/menu'),
  getById: (id) => api.get(`/menu/${id}`),
  create: (data) => api.post('/menu', data, {
    headers: {
      // Don't set Content-Type, let axios handle it for FormData
    }
  }),
  update: (id, data) => api.put(`/menu/${id}`, data, {
    headers: {
      // Don't set Content-Type, let axios handle it for FormData
    }
  }),
  delete: (id) => api.delete(`/menu/${id}`),
};

export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getMy: () => api.get('/orders/my'),
  getByReservationId: (reservationId) => api.get(`/orders/reservation/${reservationId}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
  updateItemStatus: (orderId, itemId, data) => api.patch(`/orders/${orderId}/items/${itemId}/status`, data),
};

export const ratingsAPI = {
  getMy: () => api.get('/ratings/my'),
  getAll: () => api.get('/ratings'),
  submit: (data) => api.post('/ratings', data),
};

export const tablesAPI = {
  getAll: () => api.get('/tables'),
  create: (data) => api.post('/tables', data),
  update: (id, data) => api.put(`/tables/${id}`, data),
  delete: (id) => api.delete(`/tables/${id}`),
};

export const staffAPI = {
  getAll: () => api.get('/staff'),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
};

export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
};

export const reservationsAPI = {
  getAll: () => api.get('/reservations'),
  getMy: () => api.get('/reservations/my'),
  create: (data) => api.post('/reservations', data),
  update: (id, data) => api.put(`/reservations/${id}`, data),
  delete: (id) => api.delete(`/reservations/${id}`),
  updateStatus: (id, status) =>  api.patch(`/reservations/${id}/status`, { status,}),
};

export const paymentAPI = {
  getConfig: () => api.get('/payment/config'),
  createAdvanceIntent: (data) => api.post('/payment/reservation-advance-intent', data),
  completeAdvancePayment: (data) => api.post('/payment/reservation-advance-complete', data),
  createBillIntent: (data) => api.post('/payment/bill-intent', data),
  completeBill: (data) => api.post('/payment/bill/complete', data),
  createPaymentIntent: (data) => api.post('/payment/create-payment-intent', data),
};

export const publicTablesAPI = {
  getCafeTables: () => axios.get(`${API_BASE_URL}/tables/public`),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const cuisinesAPI = {
  getAll: () => api.get('/cuisines'),
  create: (data) => api.post('/cuisines', data),
  update: (id, data) => api.put(`/cuisines/${id}`, data),
  delete: (id) => api.delete(`/cuisines/${id}`),
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  getStaff: () => api.get('/users', { params: { staffOnly: true } }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  createStaff: (data) => api.post('/users/staff', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  updateStaff: (id, data) => api.put(`/users/staff/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  deleteStaff: (id) => api.delete(`/users/staff/${id}`),
};

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  getById: (id) => api.get(`/attendance/${id}`),
  create: (data) => api.post('/attendance', data),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`),
  markPresent: (staffId, date, checkIn) => api.post(`/attendance/mark-present/${staffId}`, { date, checkIn }),
  markAbsent: (staffId, date) => api.post(`/attendance/mark-absent/${staffId}`, { date }),
  getStats: (params) => api.get('/attendance/stats/summary', { params }),
  checkLeave: (staffId, date) => api.get(`/attendance/check-leave/${staffId}`, { params: { date } }),
  autoMarkLeave: (staffId, date) => api.post(`/attendance/auto-mark-leave/${staffId}`, { date }),
};

export const leaveAPI = {
  getAll: (params) => api.get('/leave', { params }),
  getById: (id) => api.get(`/leave/${id}`),
  create: (data) => api.post('/leave', data),
  update: (id, data) => api.put(`/leave/${id}`, data),
  delete: (id) => api.delete(`/leave/${id}`),
  approve: (id) => api.post(`/leave/approve/${id}`),
  reject: (id, rejectionReason) => api.post(`/leave/reject/${id}`, { rejectionReason }),
  getStats: () => api.get('/leave/stats/summary'),
  getStaffBalance: (staffId) => api.get(`/leave/staff/${staffId}/balance`),
};

export const contactAPI = {
  submit: (data) => api.post('/contacts', data),
  getAll: () => api.get('/contacts'),
};

export const blogAPI = {
  getAll: () => api.get('/blog'),
  getById: (id) => api.get(`/blog/${id}`),
  create: (data) => api.post('/blog', data, {
    headers: {
      // Don't set Content-Type, let axios handle it for FormData
    }
  }),
  update: (id, data) => api.put(`/blog/${id}`, data, {
    headers: {
      // Don't set Content-Type, let axios handle it for FormData
    }
  }),
  delete: (id) => api.delete(`/blog/${id}`),
};

export const galleryAPI = {
  getAll: () => api.get('/gallery'),
  getById: (id) => api.get(`/gallery/${id}`),
  create: (data) => api.post('/gallery', data, {
    headers: {
      // Don't set Content-Type, let axios handle it for FormData
    }
  }),
  update: (id, data) => api.put(`/gallery/${id}`, data, {
    headers: {
      // Don't set Content-Type, let axios handle it for FormData
    }
  }),
  delete: (id) => api.delete(`/gallery/${id}`),
};
