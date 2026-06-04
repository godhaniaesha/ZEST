import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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

// Wrapper component to pass userRole to pages
function PageWrapper({ Component }) {
  const { user } = useAuth();
  return <Component userRole={user?.role || 'customer'} />;
}

export default function AppRoutes() {
  const adminRoles = ['superadmin', 'manager', 'chef', 'waiter', 'cashier', 'bartender'];
  
  return (
    <ProtectedRoute allowedRoles={adminRoles}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PageWrapper Component={Dashboard} />} />
          <Route path="menu" element={<PageWrapper Component={Menu} />} />
          <Route path="orders" element={<PageWrapper Component={Orders} />} />
          <Route path="reservations" element={<PageWrapper Component={Reservations} />} />
          <Route path="bar" element={<PageWrapper Component={Bar} />} />
          <Route path="inventory" element={<PageWrapper Component={Inventory} />} />
          <Route path="staff" element={<PageWrapper Component={Staff} />} />
          <Route path="reviews" element={<PageWrapper Component={Reviews} />} />
          <Route path="reports" element={<PageWrapper Component={Reports} />} />
          <Route path="settings" element={<PageWrapper Component={Settings} />} />
          <Route path="users" element={<PageWrapper Component={Users} />} />
          <Route path="system-logs" element={<PageWrapper Component={SystemLogs} />} />
          <Route path="pos" element={<PageWrapper Component={POS} />} />
          <Route path="kitchen-display" element={<PageWrapper Component={KitchenDisplay} />} />
          <Route path="tables" element={<PageWrapper Component={Tables} />} />
          <Route path="take-order" element={<PageWrapper Component={TakeOrder} />} />
          <Route path="service-requests" element={<PageWrapper Component={ServiceRequests} />} />
          <Route path="profile" element={<PageWrapper Component={Profile} />} />
        </Route>
      </Routes>
    </ProtectedRoute>
  );
}
