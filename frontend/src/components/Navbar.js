import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/x_style.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

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
    { label: 'Reservations', to: '/reservations' },
  ];

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
          <ul className="x_offcanvas-menu">
            {offcanvasLinks.map((link) => (
              <li className="x_offcanvas-item" key={link.to}>
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
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                </svg>
              </a>
              <a href="#" aria-label="Facebook">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href="#" aria-label="Twitter">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
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