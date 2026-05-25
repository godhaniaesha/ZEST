import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import '../styles/x_pages.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const contactInfo = [
    {
      icon: <MapPin size={24} />,
      label: 'Location',
      value: '123 Cafe Street, City Center',
      subtext: 'Visit us for coffee, food & cocktails',
    },
    {
      icon: <Phone size={24} />,
      label: 'Phone',
      value: '+1 (555) 123-4567',
      subtext: 'Mon - Sun: 8am - Midnight',
    },
    {
      icon: <Mail size={24} />,
      label: 'Email',
      value: 'hello@zestcafe.com',
      subtext: 'We reply within 24 hours',
    },
    {
      icon: <Clock size={24} />,
      label: 'Hours',
      value: 'Open Daily',
      subtext: 'Morning coffee to late cocktails',
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <main className="x_contact_page">
      <div className="x_contact_glow x_contact_glow_one" />
      <div className="x_contact_glow x_contact_glow_two" />

      {/* Hero Section */}
      <section className="x_contact_hero container">
        <div className="x_contact_hero_content">
          <span className="x_contact_eyebrow">
            <Mail size={16} />
            Get in Touch
          </span>
          <h1 className="x_contact_headline">Let's connect. We'd love to hear from you.</h1>
          <p>
            Whether you have a question about reservations, events, or just want to say hello,
            reach out. We're here to make your experience exceptional.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="x_contact_info x_header_container">
        <div className="x_contact_info_grid">
          {contactInfo.map((info, idx) => (
            <div className="x_contact_info_card" key={idx}>
              <div className="x_contact_info_icon">{info.icon}</div>
              <h3>{info.label}</h3>
              <p className="x_contact_info_value">{info.value}</p>
              <p className="x_contact_info_subtext">{info.subtext}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="x_contact_main">
        <div className="x_contact_container x_header_container">
          <div className="x_contact_form_section">
            <div className="x_contact_form_header">
              <h2>Send us a message</h2>
              <p>Fill out the form below and we'll get back to you soon.</p>
            </div>

            {submitted && (
              <div className="x_contact_success">
                <CheckCircle size={24} />
                <span>Message sent successfully! We'll be in touch soon.</span>
              </div>
            )}

            <form className="x_contact_form" onSubmit={handleSubmit}>
              <div className="x_form_group">
                <label htmlFor="name" className="x_form_label">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="x_form_input"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="x_form_row">
                <div className="x_form_group">
                  <label htmlFor="email" className="x_form_label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="x_form_input"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="x_form_group">
                  <label htmlFor="phone" className="x_form_label">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="x_form_input"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="x_form_group">
                <label htmlFor="subject" className="x_form_label">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="x_form_input"
                  placeholder="How can we help?"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="x_form_group">
                <label htmlFor="message" className="x_form_label">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  className="x_form_textarea"
                  placeholder="Tell us what's on your mind..."
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="x_contact_submit">
                <Send size={18} />
                Send Message
              </button>
            </form>
          </div>

          {/* Map Section */}
          <div className="x_contact_map_section">
            <div className="x_contact_map">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.1234567890!2d-74.0060!3d40.7128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQyJzQ2LjEiTiA3NMKwMDAnMjEuNiJX!5e0!3m2!1sen!2sus!4v1234567890"
                style={{ border: 0, width: '100%', height: '100%' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Zest Cafe Location"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="x_contact_faq container">
        <div className="x_contact_faq_header">
          <h2>Frequently Asked Questions</h2>
          <p>Quick answers to common questions</p>
        </div>

        <div className="x_contact_faq_grid">
          <div className="x_contact_faq_item">
            <h4>Do you take reservations?</h4>
            <p>
              Yes! We accept reservations for groups of 4 or more. Call us or use our reservation
              system online.
            </p>
          </div>

          <div className="x_contact_faq_item">
            <h4>What's your WiFi password?</h4>
            <p>
              Free high-speed WiFi is available to all guests. Ask our staff for the password
              when you arrive.
            </p>
          </div>

          <div className="x_contact_faq_item">
            <h4>Do you host private events?</h4>
            <p>
              Absolutely! We offer private event spaces for celebrations, meetings, and more.
              Contact us for details.
            </p>
          </div>

          <div className="x_contact_faq_item">
            <h4>Are you pet friendly?</h4>
            <p>
              Our outdoor patio welcomes well-behaved pets. We even have water bowls available!
            </p>
          </div>

          <div className="x_contact_faq_item">
            <h4>Do you have parking?</h4>
            <p>
              Street parking is available nearby. Validated parking at select lots for parties of
              6+.
            </p>
          </div>

          <div className="x_contact_faq_item">
            <h4>Can I order catering?</h4>
            <p>
              Yes! We offer catering for events. Contact us 48 hours in advance for custom quotes.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ContactUs;
