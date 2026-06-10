import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const withSource = (_source, config = {}) => config;

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
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
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
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', withSource('Attendance.getAll', { params })),
  getByStaff: (staffId) => api.get(`/attendance/staff/${staffId}`, withSource('Attendance.getByStaff')),
  create: (data) => api.post('/attendance', data, withSource('Attendance.create')),
  update: (id, data) => api.put(`/attendance/${id}`, data, withSource('Attendance.update')),
  delete: (id) => api.delete(`/attendance/${id}`, withSource('Attendance.delete')),
  markPresent: (staffId) => api.post(`/attendance/mark-present`, { staffId }, withSource('Attendance.markPresent')),
  markAbsent: (staffId) => api.post(`/attendance/mark-absent`, { staffId }, withSource('Attendance.markAbsent')),
};

export const leaveAPI = {
  getAll: (params) => api.get('/leaves', withSource('Leaves.getAll', { params })),
  getByStaff: (staffId) => api.get(`/leaves/staff/${staffId}`, withSource('Leaves.getByStaff')),
  getMyLeaves: () => api.get('/leaves/my', withSource('Leaves.getMyLeaves')),
  create: (data) => api.post('/leaves', data, withSource('Leaves.create')),
  update: (id, data) => api.put(`/leaves/${id}`, data, withSource('Leaves.update')),
  delete: (id) => api.delete(`/leaves/${id}`, withSource('Leaves.delete')),
  approve: (id) => api.patch(`/leaves/${id}/approve`, {}, withSource('Leaves.approve')),
  reject: (id, reason) => api.patch(`/leaves/${id}/reject`, { reason }, withSource('Leaves.reject')),
};

export const contactAPI = {
  submit: (data) => api.post('/contacts', data),
  getAll: () => api.get('/contacts'),
};
