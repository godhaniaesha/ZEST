import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

let authCheckComplete = false;
let isRedirecting401 = false;

export const setAuthCheckComplete = (value) => {
  authCheckComplete = value;
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = undefined;
    }

    const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
    console.log(`[API →] ${config.method?.toUpperCase()} ${fullUrl}`, {
      params: config.params,
      hasBody: Boolean(config.data),
      source: config.meta?.source || 'unknown',
    });

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    const fullUrl = `${response.config.baseURL || ''}${response.config.url || ''}`;
    const count = Array.isArray(response.data) ? response.data.length : undefined;
    console.log(`[API ✓] ${response.config.method?.toUpperCase()} ${fullUrl}`, {
      status: response.status,
      count,
      data: count !== undefined ? `${count} records` : response.data,
      source: response.config.meta?.source,
    });
    return response;
  },
  (error) => {
    const config = error.config || {};
    const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
    console.error(`[API ✗] ${config.method?.toUpperCase()} ${fullUrl}`, {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      source: config.meta?.source,
    });

    const isAuthEndpoint =
      config.url?.includes('/auth/login') || config.url?.includes('/auth/register');
    const isPublicEndpoint =
      config.url?.includes('/menu') ||
      config.url?.includes('/reservations/public') ||
      config.url?.includes('/tables/public');

    if (
      error.response?.status === 401 &&
      authCheckComplete &&
      !isAuthEndpoint &&
      !isPublicEndpoint &&
      !isRedirecting401 &&
      window.location.pathname.startsWith('/admin')
    ) {
      localStorage.removeItem('token');
      isRedirecting401 = true;
      window.location.assign('/auth');
    }

    return Promise.reject(error);
  }
);

const withSource = (source, config = {}) => ({ ...config, meta: { source } });

export const authAPI = {
  getMe: () => api.get('/auth/me', withSource('AuthContext.getMe')),
  updateProfile: (data) => api.put('/auth/profile', data, withSource('Profile.update')),
  updateProfileImage: (formData) => api.put('/auth/profile', formData, withSource('Profile.updateImage')),
  changePassword: (data) => api.put('/auth/password', data, withSource('Profile.changePassword')),
};

export const menuAPI = {
  getAll: (params) => api.get('/menu', withSource('Menu.getAll', { params })),
  getById: (id) => api.get(`/menu/${id}`, withSource('MenuDetail.getById')),
  create: (data) => api.post('/menu', data, withSource('AdminMenu.create')),
  update: (id, data) => api.put(`/menu/${id}`, data, withSource('AdminMenu.update')),
  delete: (id) => api.delete(`/menu/${id}`, withSource('AdminMenu.delete')),
  getCategories: (params) => api.get('/menu/categories', withSource('Categories.getAll', { params })),
  createCategory: (data) => api.post('/menu/categories', data, withSource('Categories.create')),
  updateCategory: (id, data) => api.put(`/menu/categories/${id}`, data, withSource('Categories.update')),
  deleteCategory: (id) => api.delete(`/menu/categories/${id}`, withSource('Categories.delete')),
  getCuisines: (params) => api.get('/menu/cuisines', withSource('Cuisines.getAll', { params })),
  createCuisine: (data) => api.post('/menu/cuisines', data, withSource('Cuisines.create')),
  updateCuisine: (id, data) => api.put(`/menu/cuisines/${id}`, data, withSource('Cuisines.update')),
  deleteCuisine: (id) => api.delete(`/menu/cuisines/${id}`, withSource('Cuisines.delete')),
};

export const ordersAPI = {
  getAll: () => api.get('/orders', withSource('Orders.getAll')),
  create: (data) => api.post('/orders', data, withSource('Orders.create')),
  update: (id, data) => api.put(`/orders/${id}`, data, withSource('Orders.update')),
  delete: (id) => api.delete(`/orders/${id}`, withSource('Orders.delete')),
};

export const tablesAPI = {
  getPublic: () => api.get('/tables/public', withSource('Reservation.getTables')),
  getAll: () => api.get('/tables', withSource('AdminTables.getAll')),
  create: (data) => api.post('/tables', data, withSource('AdminTables.create')),
  update: (id, data) => api.put(`/tables/${id}`, data, withSource('AdminTables.update')),
  delete: (id) => api.delete(`/tables/${id}`, withSource('AdminTables.delete')),
};

export const staffAPI = {
  getAll: () => api.get('/staff', withSource('Staff.getAll')),
  create: (data) => api.post('/staff', data, withSource('Staff.create')),
  update: (id, data) => api.put(`/staff/${id}`, data, withSource('Staff.update')),
  delete: (id) => api.delete(`/staff/${id}`, withSource('Staff.delete')),
};

export const inventoryAPI = {
  getAll: () => api.get('/inventory', withSource('Inventory.getAll')),
  create: (data) => api.post('/inventory', data, withSource('Inventory.create')),
  update: (id, data) => api.put(`/inventory/${id}`, data, withSource('Inventory.update')),
  delete: (id) => api.delete(`/inventory/${id}`, withSource('Inventory.delete')),
};

export const reservationsAPI = {
  getAll: (params) => api.get('/reservations', withSource('Reservations.getAll', { params })),
  getConfirmed: () => api.get('/reservations/confirmed', withSource('TakeOrder.getConfirmed')),
  getMy: () => api.get('/reservations/my', withSource('Profile.getMyBookings')),
  createPublic: (data) => api.post('/reservations/public', data, withSource('Reservation.create')),
  create: (data) => api.post('/reservations', data, withSource('Reservations.create')),
  update: (id, data) => api.put(`/reservations/${id}`, data, withSource('Reservations.update')),
  updateStatus: (id, status) =>
    api.patch(`/reservations/${id}/status`, { status }, withSource('Reservations.updateStatus')),
  cancelMy: (id) => api.put(`/reservations/my/${id}/cancel`, withSource('Profile.cancelBooking')),
  delete: (id) => api.delete(`/reservations/${id}`, withSource('Reservations.delete')),
};

export const usersAPI = {
  getAll: () => api.get('/users', withSource('Users.getAll')),
  create: (data) => api.post('/users', data, withSource('Users.create')),
  update: (id, data) => api.put(`/users/${id}`, data, withSource('Users.update')),
  delete: (id) => api.delete(`/users/${id}`, withSource('Users.delete')),
};
