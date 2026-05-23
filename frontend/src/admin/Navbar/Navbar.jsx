import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MdNotifications, MdSearch, MdFullscreen, MdPerson, MdSettings, MdLogout } from 'react-icons/md';

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

export default function Navbar({ collapsed, sidebarOpen, onToggleSidebar }) {
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const meta = PAGE_TITLES[location.pathname] || { title: 'Page', sub: '' };

  const navbarClass = [
    'd-navbar',
    collapsed ? 'd-sidebar-collapsed' : ''
  ].filter(Boolean).join(' ');

  return (
    <header className={navbarClass}>
      {/* Left */}
      <div className="d-navbar-left">
        <button
          className={`d-hamburger-btn ${sidebarOpen ? 'd-ham-open' : ''}`}
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
        <button className="d-navbar-icon-btn d-hide-mobile" aria-label="Fullscreen">
          <MdFullscreen />
        </button>

        <button className="d-navbar-icon-btn" aria-label="Notifications">
          <MdNotifications />
          <span className="d-badge-dot" />
        </button>

        <div className="d-divider-v" />

        <div className="d-profile-container">
          <div
            className="d-avatar-wrap"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="d-avatar">AD</div>
            <div className="d-avatar-info">
              <span className="d-avatar-name">Admin User</span>
              <span className="d-avatar-role">Super Admin</span>
            </div>
          </div>

          {profileOpen && (
            <div className="d-profile-dropdown">
              <Link to="/profile" className="d-dropdown-item" onClick={() => setProfileOpen(false)}>
                <MdPerson /> Profile
              </Link>
              <Link to="/settings" className="d-dropdown-item" onClick={() => setProfileOpen(false)}>
                <MdSettings /> Settings
              </Link>
              <div className="d-dropdown-divider" />
              <button className="d-dropdown-item logout" onClick={() => { setProfileOpen(false); /* logout logic */ }}>
                <MdLogout /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}