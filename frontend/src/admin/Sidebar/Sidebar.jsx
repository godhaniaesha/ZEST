import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  MdDashboard, MdRestaurantMenu, MdReceiptLong, MdEventSeat,
  MdInventory2, MdPeople, MdBarChart, MdSettings, MdLogout,
  MdLocalBar, MdStar
} from 'react-icons/md';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/',           icon: <MdDashboard />,      label: 'Dashboard' },
    ]
  },
  {
    label: 'Operations',
    items: [
      { to: '/menu',       icon: <MdRestaurantMenu />, label: 'Menu',        badge: null },
      { to: '/orders',     icon: <MdReceiptLong />,    label: 'Orders',      badge: '8' },
      { to: '/reservations',icon: <MdEventSeat />,     label: 'Reservations',badge: '3' },
      { to: '/bar',        icon: <MdLocalBar />,       label: 'Bar & Drinks', badge: null },
    ]
  },
  {
    label: 'Management',
    items: [
      { to: '/inventory',  icon: <MdInventory2 />,     label: 'Inventory' },
      { to: '/staff',      icon: <MdPeople />,         label: 'Staff' },
      { to: '/reviews',    icon: <MdStar />,           label: 'Reviews' },
    ]
  },
  {
    label: 'Analytics',
    items: [
      { to: '/reports',    icon: <MdBarChart />,       label: 'Reports' },
      { to: '/settings',   icon: <MdSettings />,       label: 'Settings' },
    ]
  }
];

export default function Sidebar({ collapsed, mobileOpen, onClose }) {
  const location = useLocation();

  const sidebarClass = [
    'd-sidebar',
    collapsed ? 'd-collapsed' : '',
    mobileOpen ? 'd-mobile-open' : ''
  ].filter(Boolean).join(' ');

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`d-overlay ${mobileOpen ? 'd-visible' : ''}`}
        onClick={onClose}
      />

      <aside className={sidebarClass}>
        {/* Logo */}
        <Link to="/" className="d-sidebar-logo" style={{ textDecoration: 'none' }}>
          <div className="d-logo-icon">☕</div>
          <div className="d-logo-text">
            <div className="d-logo-name">Breva</div>
            <div className="d-logo-tagline">Café & Bar Admin</div>
          </div>
        </Link>

        {/* Nav */}
        <div className="d-sidebar-scroll">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="d-nav-group-label">{group.label}</div>
              {group.items.map((item) => {
                const isActive = item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to);

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`d-nav-item ${isActive ? 'd-active' : ''}`}
                    onClick={onClose}
                    end={item.to === '/'}
                  >
                    <span className="d-nav-icon">{item.icon}</span>
                    <span className="d-nav-label">{item.label}</span>
                    {item.badge && (
                      <span className="d-nav-badge">{item.badge}</span>
                    )}
                    <span className="d-tooltip">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="d-sidebar-footer">
          <div className="d-nav-item">
            <span className="d-nav-icon"><MdLogout /></span>
            <span className="d-nav-label">Logout</span>
            <span className="d-tooltip">Logout</span>
          </div>
        </div>
      </aside>
    </>
  );
}