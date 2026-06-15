import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";
import { Phone, Mail, MapPin } from "lucide-react";
import "../styles/x_style.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Menu", to: "/menu" },
    { label: "Contact", to: "/contactus" },
    { label: "Reservations", to: "/reservations" },
    { label: "Blog", to: "/blog" },
    { label: "Services", to: "/services" },
    { label: "FAQ", to: "/faq" },
  ];

  const hours = [
    { label: "Morning Cafe", time: "7:00 AM – 12:00 PM" },
    { label: "Lunch & Brunch", time: "12:00 PM – 3:00 PM" },
    { label: "Dinner Service", time: "5:00 PM – 10:00 PM" },
    { label: "Evening Bar", time: "9:00 PM – Midnight" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms & Conditions", to: "/termss" },
  ];

  return (
    <footer className="x_footer">

      {/* Ornamental top strip */}
      <div className="x_footer_ornament">
        <div className="x_footer_ornament_line" />
        <div className="x_footer_ornament_icon">
          <span className="x_footer_ornament_diamond">◆</span>
          <span>Est. 2024</span>
          <span className="x_footer_ornament_diamond">◆</span>
        </div>
        <div className="x_footer_ornament_line right" />
      </div>

      {/* Main Grid */}
      <div className="x_footer_container">

        {/* Column 1 — Brand */}
        <div className="x_footer_section">
          <div className="x_footer_logo">
            <span className="x_footer_logo_text">ZÉST</span>
            <span className="x_footer_logo_sub">Cafe &amp; Bar </span>
          </div>
          <p>
            Where every cup tells a story and every evening becomes a memory.
            Premium coffee, handcrafted cocktails, and a dining experience beyond the ordinary.
          </p>
          <div className="x_footer_socials">
            <div className="x_footer_socials">
              <a
                href="https://www.facebook.com/yourpage"
                target="_blank"
                rel="noopener noreferrer"
                className="x_footer_social_link"
                aria-label="Facebook"
              >
                <FaFacebookF size={14} />
              </a>

              <a
                href="https://www.instagram.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="x_footer_social_link"
                aria-label="Instagram"
              >
                <FaInstagram size={14} />
              </a>

              <a
                href="https://twitter.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="x_footer_social_link"
                aria-label="Twitter"
              >
                <FaTwitter size={14} />
              </a>

              <a
                href="https://www.linkedin.com/in/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="x_footer_social_link"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Column 2 — Quick Links */}
        <div className="x_footer_section">
          <div className="x_footer_section_heading">
            <h3>Navigate</h3>
            <span className="x_footer_heading_accent" />
          </div>
          {quickLinks.map((link, idx) => (
            <Link key={idx} to={link.to} className="x_footer_link">
              <span className="x_footer_link_dot" />
              {link.label}
            </Link>
          ))}
        </div>

        {/* Column 3 — Contact */}
        <div className="x_footer_section">
          <div className="x_footer_section_heading">
            <h3>Find Us</h3>
            <span className="x_footer_heading_accent" />
          </div>

          <a
            href="tel:+911234567890"
            className="x_footer_contact_item"
            aria-label="Call us"
          >
            <div className="x_footer_contact_icon">
              <Phone size={13} />
            </div>
            <div className="x_footer_contact_text">
              <span className="x_footer_contact_label">Phone</span>
              <span className="x_footer_contact_value">+91 12345 67890</span>
            </div>
          </a>

          <a
            href="mailto:support@zestcafe.com?subject=Inquiry%20from%20Website"
            className="x_footer_contact_item"
            aria-label="Email us"
          >
            <div className="x_footer_contact_icon">
              <Mail size={13} />
            </div>
            <div className="x_footer_contact_text">
              <span className="x_footer_contact_label">Email</span>
              <span className="x_footer_contact_value">support@zestcafe.com</span>
            </div>
          </a>
          <a href="#location" className="x_footer_contact_item">
            <a
              href="https://maps.google.com/?q=Ahmedabad,Gujarat,India"
              target="_blank"
              rel="noopener noreferrer"
              className="x_footer_contact_link"
            >
              <div className="x_footer_contact_icon">
                <MapPin size={13} />
              </div>

              <div className="x_footer_contact_text">
                <span className="x_footer_contact_label">Location</span>
                <span className="x_footer_contact_value">
                  Ahmedabad, Gujarat, India
                </span>
              </div>
            </a>
          </a>
        </div>

        {/* Column 4 — Hours */}
        <div className="x_footer_section">
          <div className="x_footer_section_heading">
            <h3>Hours</h3>
            <span className="x_footer_heading_accent" />
          </div>
          {hours.map((item, idx) => (
            <div key={idx} className="x_footer_hours_item">
              <span className="x_footer_hours_label">{item.label}</span>
              <span className="x_footer_hours_time">{item.time}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Ornamental divider */}
      <div className="x_footer_divider">
        <div className="x_footer_divider_inner">
          <div className="x_footer_divider_diamond" />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="x_footer_bottom">
        <p>© {currentYear} <span>Zest Cafe &amp; Bar</span>. All rights reserved.</p>
        <nav className="x_footer_bottom_links" aria-label="Legal links">
          {legalLinks.map((link, idx) => (
            <Link key={idx} to={link.to} className="x_footer_bottom_link">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

    </footer>
  );
}