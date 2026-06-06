import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  MdDashboard, MdRestaurantMenu, MdReceiptLong, MdEventSeat,
  MdInventory2, MdPeople, MdBarChart, MdSettings, MdLogout,
  MdLocalBar, MdStar, MdKitchen, MdCountertops, MdTableRestaurant,
  MdLocalAtm, MdAdminPanelSettings, MdHistory, MdNotificationsActive,
  MdLocalDining, MdAccessTime, MdEvent
} from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';

const ADMIN_BASE = '/admin';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      {
        to: `${ADMIN_BASE}/dashboard`,
        icon: <MdDashboard />,
        label: 'Dashboard',
        roles: ['superadmin', 'manager', 'chef', 'waiter', 'cashier', 'bartender'],
      },
    ],
  },
  {
    label: 'Super Admin',
    items: [
      { to: `${ADMIN_BASE}/users`, icon: <MdAdminPanelSettings />, label: 'User Management', roles: ['superadmin'] },
      { to: `${ADMIN_BASE}/system-logs`, icon: <MdHistory />, label: 'System Logs', roles: ['superadmin'] },
      { to: `${ADMIN_BASE}/settings`, icon: <MdSettings />, label: 'Global Settings', roles: ['superadmin'] },
    ],
  },
  {
    label: 'Management (Manager)',
    items: [
      { to: `${ADMIN_BASE}/pos`, icon: <MdLocalAtm />, label: 'POS & Billing', roles: ['manager', 'superadmin', 'cashier'] },
      { to: `${ADMIN_BASE}/orders`, icon: <MdReceiptLong />, label: 'Orders', badge: '8', roles: ['manager', 'superadmin', 'cashier', 'waiter', 'chef', 'bartender'] },
      { to: `${ADMIN_BASE}/reservations`, icon: <MdEventSeat />, label: 'Reservations', badge: '3', roles: ['manager', 'superadmin', 'waiter'] },
      { to: `${ADMIN_BASE}/staff`, icon: <MdPeople />, label: 'Staff', roles: ['manager', 'superadmin'] },
      { to: `${ADMIN_BASE}/staff-attendance`, icon: <MdAccessTime />, label: 'Attendance', roles: ['manager', 'superadmin'] },
      { to: `${ADMIN_BASE}/leave-management`, icon: <MdEvent />, label: 'Leave Management', badge: '2', roles: ['manager', 'superadmin'] },
      { to: `${ADMIN_BASE}/reports`, icon: <MdBarChart />, label: 'Reports & Analytics', roles: ['manager', 'superadmin'] },
    ],
  },
  {
    label: 'Kitchen (Chef)',
    items: [
      { to: `${ADMIN_BASE}/kitchen-display`, icon: <MdKitchen />, label: 'Live Orders (KOT)', badge: '5', roles: ['chef', 'manager', 'superadmin'] },
      { to: `${ADMIN_BASE}/menu`, icon: <MdRestaurantMenu />, label: 'Menu Items', roles: ['chef', 'manager', 'superadmin'] },
      { to: `${ADMIN_BASE}/bar`, icon: <MdLocalBar />, label: 'Bar & Drinks', roles: ['chef', 'manager', 'superadmin', 'bartender'] },
      { to: `${ADMIN_BASE}/categories`, icon: <MdLocalDining />, label: 'Categories & Cuisines', roles: ['chef', 'manager', 'superadmin'] },
      { to: `${ADMIN_BASE}/inventory`, icon: <MdInventory2 />, label: 'Kitchen Stock', roles: ['chef', 'manager', 'superadmin'] },
    ],
  },
  {
    label: 'Service (Waiter)',
    items: [
      { to: `${ADMIN_BASE}/tables`, icon: <MdTableRestaurant />, label: 'Table Status', roles: ['waiter', 'manager', 'superadmin'] },
      { to: `${ADMIN_BASE}/take-order`, icon: <MdCountertops />, label: 'Take New Order', roles: ['waiter', 'manager', 'superadmin'] },
      { to: `${ADMIN_BASE}/service-requests`, icon: <MdNotificationsActive />, label: 'Customer Requests', badge: '2', roles: ['waiter', 'manager', 'superadmin'] },
    ],
  },
  {
    label: 'Feedbacks',
    items: [
      { to: `${ADMIN_BASE}/reviews`, icon: <MdStar />, label: 'Reviews & Ratings', roles: ['manager', 'superadmin'] },
    ],
  },
];

export default function Sidebar({ collapsed, mobileOpen, onClose, currentUserRole = 'superadmin' }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/auth');
  };

  const sidebarClass = [
    'd-sidebar',
    collapsed ? 'd-collapsed' : '',
    mobileOpen ? 'd-mobile-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <div
        className={`d-overlay ${mobileOpen ? 'd-visible' : ''}`}
        onClick={onClose}
        role="presentation"
      />

      <aside className={sidebarClass}>
        <Link to="/admin/dashboard" className="d-sidebar-logo" style={{ textDecoration: 'none' }} onClick={onClose}>
          <div className="d-logo-icon">☕</div>
          <div className="d-logo-text">
            <div className="d-logo-name">Zest</div>
            <div className="d-logo-tagline">Café & Bar Admin</div>
          </div>
        </Link>

        <div className="d-sidebar-scroll">
          {NAV_GROUPS.map((group) => {
            const allowedItems = group.items.filter((item) =>
              item.roles ? item.roles.includes(currentUserRole) : true
            );

            if (allowedItems.length === 0) return null;

            return (
              <div key={group.label} className="d-nav-group-wrapper">
                <div className="d-nav-group-label">{group.label}</div>
                {allowedItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === `${ADMIN_BASE}/dashboard`}
                      className={({ isActive }) => `d-nav-item ${isActive ? 'd-active' : ''}`}
                      onClick={onClose}
                    >
                      <span className="d-nav-icon">{item.icon}</span>
                      <span className="d-nav-label">{item.label}</span>
                      {item.badge && <span className="d-nav-badge">{item.badge}</span>}
                      <span className="d-tooltip">{item.label}</span>
                    </NavLink>
                  ))}
              </div>
            );
          })}
        </div>

        <div className="d-sidebar-footer">
          <div className="d-nav-item" onClick={handleLogout} style={{ cursor: 'pointer' }}>
            <span className="d-nav-icon"><MdLogout /></span>
            <span className="d-nav-label">Logout</span>
            <span className="d-tooltip">Logout</span>
          </div>
        </div>
      </aside>
    </>
  );
}
