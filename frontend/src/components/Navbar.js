import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/x_style.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOffcanvas = () => {
    setIsOpen(!isOpen);
  };

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Dark Navbar */}
      <nav className="x_navbar x_navbar-dark">
        <div className="x_navbar-container">
          {/* Logo */}
          <div className="x_navbar-logo">
            <Link to="/" className="x_logo-link">
              {/* <span className="x_logo-crown">👑</span> */}
              <span className="x_logo-text">ZÉST</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <ul className="x_navbar-menu">
            <li className="x_navbar-item">
              <Link to="/" className="x_navbar-link">
                Home
              </Link>
            </li>
            <li className="x_navbar-item">
              <Link to="/about" className="x_navbar-link">
                About
              </Link>
            </li>
            <li className="x_navbar-item">
              <Link to="/menu" className="x_navbar-link">
                Menu
              </Link>
            </li>
            <li className="x_navbar-item">
              <Link to="/gallery" className="x_navbar-link">
                Gallery
              </Link>
            </li>
            <li className="x_navbar-item">
              <Link to="/blog" className="x_navbar-link">
                Blog
              </Link>
            </li>
            <li className="x_navbar-item">
              <Link to="/shop" className="x_navbar-link">
                Shop
              </Link>
            </li>
          </ul>

          {/* Reservation Button and Hamburger */}
          <div className="x_navbar-right">
            <button className="x_reservation-btn">Reservation</button>
            <button
              className={`x_hamburger ${isOpen ? 'x_active' : ''}`}
              onClick={toggleOffcanvas}
            >
              <span className="x_hamburger-line"></span>
              <span className="x_hamburger-line"></span>
              <span className="x_hamburger-line"></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Offcanvas */}
      <div className={`x_offcanvas ${isOpen ? 'x_show' : ''}`}>
        <div className="x_offcanvas-header">
          <h5 className="x_offcanvas-title">Menu</h5>
          <button
            className="x_offcanvas-close"
            onClick={toggleOffcanvas}
          >
            ✕
          </button>
        </div>
        <div className="x_offcanvas-body">
          <ul className="x_offcanvas-menu">
            <li>
              <Link
                to="/"
                className="x_offcanvas-link"
                onClick={handleNavClick}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="x_offcanvas-link"
                onClick={handleNavClick}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/menu"
                className="x_offcanvas-link"
                onClick={handleNavClick}
              >
                Menu
              </Link>
            </li>
            <li>
              <Link
                to="/gallery"
                className="x_offcanvas-link"
                onClick={handleNavClick}
              >
                Gallery
              </Link>
            </li>
            <li>
              <Link
                to="/blog"
                className="x_offcanvas-link"
                onClick={handleNavClick}
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                to="/shop"
                className="x_offcanvas-link"
                onClick={handleNavClick}
              >
                Shop
              </Link>
            </li>
          </ul>
          <button
            className="x_offcanvas-reservation"
            onClick={handleNavClick}
          >
            Reservation
          </button>
        </div>
      </div>

      {/* Offcanvas Overlay */}
      {isOpen && (
        <div className="x_offcanvas-overlay" onClick={toggleOffcanvas}></div>
      )}
    </>
  );
}

