import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

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

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="menu" element={<Menu />} />
        <Route path="orders" element={<Orders />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="bar" element={<Bar />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="staff" element={<Staff />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}