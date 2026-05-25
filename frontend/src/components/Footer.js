import React from 'react';
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn
} from "react-icons/fa";
import '../styles/x_style.css';
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'Home', href: '/home' },
    { label: 'Menu', href: '/menu' },
    { label: 'About Us', href: '/aboutus' },
    { label: 'Services', href: '/services' },
    { label: 'Contact', href: '/contactus' },
    { label: 'Reservations', href: '/reservations' },
    { label: 'Profile', href: '/profile' },
  ];

  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms & Conditions', href: '/terms' },
  ];

  return (
    <footer className="x_footer">
      <div className="x_footer_container">
        {/* Brand Section */}
        <div className="x_footer_section">
          <div className="x_footer_logo">
            {/* <span className="x_footer_crown">👑</span> */}
            <span className="x_footer_logo_text">ZEST</span>
          </div>
          <p>
            Zest Cafe & Bar - Where morning coffee meets midnight cocktails. Your destination for exceptional food, drinks, and moments that matter.
          </p>
          <div className="x_footer_socials">
            <a href="#" className="x_footer_social_link" title="Facebook" aria-label="Follow us on Facebook">
              <FaFacebookF className='icon' size={18} />
            </a>
            <a href="#" className="x_footer_social_link" title="Instagram" aria-label="Follow us on Instagram">
              <FaInstagram className='icon' size={18} />
            </a>
            <a href="#" className="x_footer_social_link" title="Twitter" aria-label="Follow us on Twitter">
              <FaTwitter className='icon' size={18} />
            </a>
            <a href="#" className="x_footer_social_link" title="LinkedIn" aria-label="Follow us on LinkedIn">
              <FaLinkedinIn className='icon' size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="x_footer_section">
          <h3>Quick Links</h3>
          {quickLinks.map((link, idx) => (
            <a key={idx} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>

        {/* Contact Information */}
        <div className="x_footer_section">
          <h3>Contact Us</h3>
          <a href="tel:+15551234567">
            <Phone size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            +1 (555) 123-4567
          </a>
          <a href="mailto:hello@zestcafe.com">
            <Mail size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            hello@zestcafe.com
          </a>
          <a href="#location">
            <MapPin size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            123 Cafe Street, City Center
          </a>
          <p style={{ marginTop: '16px', fontSize: '14px', fontWeight: '600' }}>
            Mon - Sun: 8am - Midnight
          </p>
        </div>

        {/* Opening Hours */}
        <div className="x_footer_section">
          <h3>Hours of Operation</h3>
          <p style={{ marginBottom: '16px' }}>
            <strong>Morning Cafe</strong><br />
            7:00 AM - 12:00 PM
          </p>
          <p style={{ marginBottom: '16px' }}>
            <strong>Lunch & Brunch</strong><br />
            12:00 PM - 3:00 PM
          </p>
          <p style={{ marginBottom: '16px' }}>
            <strong>Dinner Service</strong><br />
            5:00 PM - 10:00 PM
          </p>
          <p>
            <strong>Evening Bar</strong><br />
            9:00 PM - Midnight
          </p>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="x_footer_bottom">
        <p>&copy; {currentYear} Zest Cafe & Bar. All rights reserved.</p>
        <nav className="x_footer_bottom_links">
          {legalLinks.map((link, idx) => (
            <a key={idx} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
