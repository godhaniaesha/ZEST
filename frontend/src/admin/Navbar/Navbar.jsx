import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { MdNotifications, MdSearch, MdFullscreen, MdPerson, MdSettings, MdLogout } from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';

const PAGE_TITLES = {
  '/':             { title: 'Dashboard',    sub: 'Welcome back, Admin' },
  '/menu':         { title: 'Menu',         sub: 'Manage your food & drinks' },
  '/orders':       { title: 'Orders',       sub: 'Live order tracking' },
  '/reservations': { title: 'Reservations', sub: 'Table bookings & walk-ins' },
  '/bar':          { title: 'Bar & Drinks', sub: 'Cocktails, spirits & more' },
  '/inventory':    { title: 'Inventory',    sub: 'Stock & supply management' },
  '/staff':        { title: 'Staff',        sub: 'Team management' },
  '/reviews':      { title: 'Reviews',      sub: 'Guest feedback & ratings' },
  '/reports':      { title: 'Reports',      sub: 'Analytics & insights' },
  '/settings':     { title: 'Settings',     sub: 'System preferences' },
};

const ROLE_LABELS = {
  'superadmin': 'Super Admin',
  'manager': 'Manager',
  'chef': 'Chef',
  'waiter': 'Waiter',
  'cashier': 'Cashier',
  'bartender': 'Bartender',
  'customer': 'Customer'
};

export default function Navbar({ collapsed, sidebarOpen, onToggleSidebar, userRole }) {
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const meta = PAGE_TITLES[location.pathname] || { title: 'Page', sub: '' };

  const navbarClass = [
    'd-navbar',
    collapsed ? 'd-sidebar-collapsed' : ''
  ].filter(Boolean).join(' ');

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/auth');
  };

  return (
    <header className={navbarClass}>
      {/* Left */}
      <div className="d-navbar-left">
        <button
          className={'d-hamburger-btn ' + (sidebarOpen ? 'd-ham-open' : '')}
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <span className="d-ham-icon">
            <span className="d-ham-line" />
            <span className="d-ham-line" />
            <span className="d-ham-line" />
          </span>
        </button>

        <div className="d-breadcrumb-wrap d-hide-mobile">
          <Link to="/" className="d-breadcrumb-label">Breva Admin</Link>
          <span className="d-page-title">{meta.title}</span>
        </div>

        {/* Search Bar */}
        <div className="d-navbar-search-box">
          <MdSearch className="d-search-icon" />
          <input
            type="text"
            placeholder="Search anything..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      {/* Right */}
      <div className="d-navbar-right">
        <button 
          className="d-navbar-icon-btn d-hide-mobile" 
          aria-label="Fullscreen"
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }}
        >
          <MdFullscreen />
        </button>

        <div className="d-profile-container">
          <button 
            className="d-navbar-icon-btn" 
            aria-label="Notifications"
            onClick={() => setNotificationOpen(!notificationOpen)}
          >
            <MdNotifications />
            <span className="d-badge-dot" />
          </button>

          {notificationOpen && (
            <div className="d-profile-dropdown" style={{ width: '280px' }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--d-border)', marginBottom: '8px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--d-primary)' }}>Notifications</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>You have 3 new notifications</div>
              </div>
              <button className="d-dropdown-item" onClick={() => setNotificationOpen(false)}>
                <MdNotifications /> New order received
              </button>
              <button className="d-dropdown-item" onClick={() => setNotificationOpen(false)}>
                <MdNotifications /> Table reservation confirmed
              </button>
              <button className="d-dropdown-item" onClick={() => setNotificationOpen(false)}>
                <MdNotifications /> Low stock alert: Coffee beans
              </button>
              <div className="d-dropdown-divider" />
              <button className="d-dropdown-item" onClick={() => setNotificationOpen(false)}>
                View all notifications
              </button>
            </div>
          )}
        </div>

        <div className="d-divider-v" />

        <div className="d-profile-container">
          <div
            className="d-avatar-wrap"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="d-avatar">{getInitials(user?.name)}</div>
            <div className="d-avatar-info">
              <span className="d-avatar-name">{user?.name || 'Admin User'}</span>
              <span className="d-avatar-role">{ROLE_LABELS[userRole] || 'Super Admin'}</span>
            </div>
          </div>

          {profileOpen && (
            <div className="d-profile-dropdown">
              <Link to="/admin/profile" className="d-dropdown-item" onClick={() => setProfileOpen(false)}>
                <MdPerson /> Profile
              </Link>
              <Link to="/admin/settings" className="d-dropdown-item" onClick={() => setProfileOpen(false)}>
                <MdSettings /> Settings
              </Link>
              <div className="d-dropdown-divider" />
              <button className="d-dropdown-item logout" onClick={handleLogout}>
                <MdLogout /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
