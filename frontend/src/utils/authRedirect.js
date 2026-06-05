export const STAFF_ROLES = ['superadmin', 'manager', 'chef', 'waiter', 'cashier', 'bartender'];

export const isStaffRole = (role) => STAFF_ROLES.includes(role);

export const getPostLoginPath = (role) =>
  isStaffRole(role) ? '/admin/dashboard' : '/';
