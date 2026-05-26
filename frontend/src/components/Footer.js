import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";

import { Phone, Mail, MapPin } from "lucide-react";
import "../styles/x_style.css";
import s1 from "../img/shape1.png";
import s2 from "../img/shape2.png";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Home", href: "/home" },
    { label: "Menu", href: "/menu" },
    { label: "About Us", href: "/aboutus" },
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contactus" },
    { label: "Reservations", href: "/reservations" },
    { label: "Profile", href: "/profile" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms" },
  ];

  return (
    <footer className="x_footer">
      {/* Background Shapes */}
      {/* <div className="x_footer_shape x_footer_shape1">
        <img src={s1} alt="Decorative Shape" />
      </div>
      <div className="x_footer_shape x_footer_shape2">
        <img src={s2} alt="Decorative Shape" />
      </div> */}

      <div className="x_footer_container">
        {/* Brand Section */}
        <div className="x_footer_section">
          <div className="x_footer_logo">
            <span className="x_footer_logo_text">ZÉST</span>
          </div>

          <p>
            Zest Cafe & Bar — Your perfect place for premium coffee,
            handcrafted cocktails, delicious meals, and unforgettable moments.
          </p>

          <div className="x_footer_socials">
            <a
              href="#"
              className="x_footer_social_link"
              aria-label="Facebook"
            >
              <FaFacebookF size={16} />
            </a>

            <a
              href="#"
              className="x_footer_social_link"
              aria-label="Instagram"
            >
              <FaInstagram size={16} />
            </a>

            <a
              href="#"
              className="x_footer_social_link"
              aria-label="Twitter"
            >
              <FaTwitter size={16} />
            </a>

            <a
              href="#"
              className="x_footer_social_link"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn size={16} />
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

        {/* Contact Info */}
        <div className="x_footer_section">
          <h3>Contact Us</h3>

          <a href="tel:+911234567890">
            <Phone size={16} />
            +91 12345 67890
          </a>

          <a href="mailto:support@zestcafe.com">
            <Mail size={16} />
            support@zestcafe.com
          </a>

          <a href="#location">
            <MapPin size={16} />
            Ahmedabad, Gujarat, India
          </a>

          <p className="x_footer_timing">
            Open Daily : 8:00 AM - 12:00 AM
          </p>
        </div>

        {/* Hours */}
        <div className="x_footer_section">
          <h3>Hours of Operation</h3>

          <p>
            <strong>Morning Cafe</strong>
            <br />
            7:00 AM - 12:00 PM
          </p>

          <p>
            <strong>Lunch & Brunch</strong>
            <br />
            12:00 PM - 3:00 PM
          </p>

          <p>
            <strong>Dinner Service</strong>
            <br />
            5:00 PM - 10:00 PM
          </p>

          <p>
            <strong>Evening Bar</strong>
            <br />
            9:00 PM - Midnight
          </p>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="x_footer_bottom">
        <p>© {currentYear} Zest Cafe & Bar. All rights reserved.</p>

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