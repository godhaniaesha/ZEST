import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

import Layout from './Layout/Layout';

import Dashboard from './pages/Dashboard/Dashboard';
import Menu from './pages/Menu/Menu';
import Orders from './pages/Orders/Orders';
import Reservations from './pages/Reservations/Reservations';
import Bar from './pages/Bar/Bar';
import Inventory from './pages/Inventory/Inventory';
import Staff from './pages/Staff/Staff';
import Reviews from './pages/Review/Reviews';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import Users from './pages/Users/Users';
import SystemLogs from './pages/SystemLogs/SystemLogs';
import POS from './pages/POS/POS';
import KitchenDisplay from './pages/KitchenDisplay/KitchenDisplay';
import Tables from './pages/Tables/Tables';
import TakeOrder from './pages/TakeOrder/TakeOrder';
import ServiceRequests from './pages/ServiceRequests/ServiceRequests';
import Profile from './pages/Profile/Profile';
import Categories from './pages/Categories/Categories';
import StaffAttendance from './pages/StaffAttendance/StaffAttendance';
import LeaveManagement from './pages/LeaveManagement/LeaveManagement';

// Wrapper component to pass userRole to pages
function PageWrapper({ Component }) {
  const { user } = useAuth();
  return <Component userRole={user?.role || 'customer'} />;
}

export default function AppRoutes() {
  const adminRoles = ['superadmin', 'manager', 'chef', 'waiter', 'cashier', 'bartender'];
  
  return (
    <Routes>
     <Route
  element={
    <ProtectedRoute allowedRoles={ADMIN_ROLES}>
      <Layout />
    </ProtectedRoute>
  }
>
        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard" element={<Dashboard />} />
        <Route path="menu" element={<Menu />} />
        <Route path="orders" element={<Orders />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="bar" element={<Bar />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="staff" element={<Staff />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="users" element={<Users />} />
        <Route path="system-logs" element={<SystemLogs />} />
        <Route path="pos" element={<POS />} />
        <Route path="kitchen-display" element={<KitchenDisplay />} />
        <Route path="tables" element={<Tables />} />
        <Route path="take-order" element={<TakeOrder />} />
        <Route path="service-requests" element={<ServiceRequests />} />
        <Route path="profile" element={<Profile />} />
        <Route path="categories" element={<Categories />} />
        <Route path="staff-attendance" element={<StaffAttendance />} />
        <Route path="leave-management" element={<LeaveManagement />} />
      </Route>

      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}