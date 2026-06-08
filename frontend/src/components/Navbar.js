import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/x_style.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when offcanvas is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!profileOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') setProfileOpen(false);
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [profileOpen]);

  const toggleOffcanvas = () => setIsOpen(prev => !prev);
  const closeOffcanvas = () => setIsOpen(false);

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/aboutus' },
    { label: 'Menu', to: '/menu' },
    { label: 'Gallery', to: '/gallery' },
    { label: 'Contact', to: '/contactus' },
  ];

  const offcanvasLinks = [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/aboutus' },
    { label: 'Menu', to: '/menu' },
    { label: 'Gallery', to: '/gallery' },
    { label: 'Contact', to: '/contactus' },
    { label: user ? 'My Reservations' : 'Reservations', to: '/reservations' },
    ...(user ? [{ label: 'Profile', to: '/profile' }] : [{ label: 'Sign In', to: '/auth' }]),
  ];

  const userInitials = user?.name
    ? user.name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    : 'U';

  const displayName = user?.name?.trim() || 'Account';
  const firstName = displayName.split(/\s+/)[0];
  const memberTier = user?.role === 'customer' ? 'ZEST Member' : user?.role || 'Member';

  const renderAvatar = (className) =>
    user?.image ? (
      <img src={user.image} alt={displayName} className={`${className} x_has_image`} />
    ) : (
      <span className={className}>{userInitials}</span>
    );

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    closeOffcanvas();
    navigate('/auth');
  };

  return (
    <>
      <nav className={`x_navbar x_navbar-dark${scrolled ? ' x_scrolled' : ''}`}>
        <div className="x_navbar-container">

          {/* Logo */}
          <div className="x_navbar-logo">
            <Link to="/" className="x_logo-link" onClick={closeOffcanvas}>
              <div className="x_logo-wordmark">
                <span className="x_logo-text">ZÉST</span>
              </div>
              <span className="x_logo-tagline">Cafe &amp; Bar</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <ul className="x_navbar-menu">
            {navLinks.map((link) => (
              <li className="x_navbar-item" key={link.to}>
                <Link
                  to={link.to}
                  className={`x_navbar-link${location.pathname === link.to ? ' active' : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right: Reservation + Hamburger */}
          <div className="x_navbar-right">
            {loading ? (
              <span className="x_navbar_auth_loading" aria-label="Loading account" />
            ) : user ? (
              <div ref={dropdownRef} className={`x_navbar_dropdown_wrap${profileOpen ? ' x_open' : ''}`}>
                <button
                  type="button"
                  className="x_navbar_dropdown_trigger"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                  aria-label={`${displayName} account menu`}
                >
                  {renderAvatar('x_navbar_profile_icon')}
                  <span className="x_navbar_user_name">{firstName}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                <div className={`x_navbar_dropdown${profileOpen ? ' x_show' : ''}`} role="menu">
                  <div className="x_navbar_dropdown_header">
                    {renderAvatar('x_navbar_dropdown_avatar')}
                    <div className="x_navbar_dropdown_meta">
                      <span className="x_navbar_dropdown_name">{displayName}</span>
                      <span className="x_navbar_dropdown_email">{user.email}</span>
                      <span className="x_navbar_dropdown_tier">{memberTier}</span>
                    </div>
                  </div>
                  <div className="x_navbar_dropdown_divider" />
                  <Link to="/profile" className="x_navbar_dropdown_item" role="menuitem" onClick={() => setProfileOpen(false)}>
                    <span className="x_navbar_dropdown_item_dot" />
                    My Profile
                  </Link>
                  <Link to="/reservations" className="x_navbar_dropdown_item" role="menuitem" onClick={() => setProfileOpen(false)}>
                    <span className="x_navbar_dropdown_item_dot" />
                    My Reservations
                  </Link>
                  <div className="x_navbar_dropdown_divider" />
                  <button type="button" className="x_navbar_dropdown_item logout" role="menuitem" onClick={handleLogout}>
                    <span className="x_navbar_dropdown_item_dot" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/auth" className="x_navbar_action_icon x_reservation-btn" onClick={closeOffcanvas}>
                Sign In
              </Link>
            )}

            <Link to="/reservations" className="x_reservation-btn">
              Reserve a Table
            </Link>
            <button
              className={`x_hamburger${isOpen ? ' x_active' : ''}`}
              onClick={toggleOffcanvas}
              aria-label="Toggle navigation menu"
              aria-expanded={isOpen}
            >
              <span className="x_hamburger-line"></span>
              <span className="x_hamburger-line"></span>
              <span className="x_hamburger-line"></span>
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile Offcanvas */}
      <aside
        className={`x_offcanvas${isOpen ? ' x_show' : ''}`}
        aria-hidden={!isOpen}
        role="dialog"
        aria-label="Navigation menu"
      >
        <div className="x_offcanvas-header">
          <div className="x_offcanvas-brand">
            <h5 className="x_offcanvas-title">ZÉST</h5>
            <span className="x_offcanvas-subtitle">Cafe &amp; Bar</span>
          </div>
          <button
            className="x_offcanvas-close"
            onClick={closeOffcanvas}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className="x_offcanvas-body">
          {user && (
            <div className="x_offcanvas_user">
              {renderAvatar('x_offcanvas_user_avatar')}
              <div className="x_offcanvas_user_meta">
                <span className="x_offcanvas_user_name">{displayName}</span>
                <span className="x_offcanvas_user_email">{user.email}</span>
                <span className="x_offcanvas_user_tier">{memberTier}</span>
              </div>
            </div>
          )}

          <ul className="x_offcanvas-menu">
            {offcanvasLinks.map((link) => (
              <li className="x_offcanvas-item" key={link.to + link.label}>
                <Link
                  to={link.to}
                  className="x_offcanvas-link"
                  onClick={closeOffcanvas}
                >
                  {link.label}
                  <span className="x_offcanvas-link-arrow">›</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="x_offcanvas-footer">
            {user ? (
              <button type="button" className="x_offcanvas_logout" onClick={handleLogout}>
                Sign Out
              </button>
            ) : null}
            <Link
              to="/reservations"
              className="x_offcanvas-reservation"
              onClick={closeOffcanvas}
            >
              Reserve a Table
            </Link>
            <div className="x_offcanvas-social">
              <a href="#" aria-label="Instagram">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
              </a>
              <a href="#" aria-label="Facebook">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#" aria-label="Twitter">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </aside>
      {/* Overlay */}
      {isOpen && (
        <div
          className="x_offcanvas-overlay"
          onClick={closeOffcanvas}
          aria-hidden="true"
        />
      )}
    </>
  );
}