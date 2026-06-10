import React, { useState } from 'react';
import {
  CalendarDays,
  Car,
  CheckCircle,
  Clock,
  Coffee,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Users,
  Wifi,
} from 'lucide-react';
import { contactAPI } from '../api';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const quickNotes = [
    { icon: <CalendarDays size={18} />, text: 'Reservations for groups of 4+' },
    { icon: <Coffee size={18} />, text: 'Walk-ins welcome all day' },
    { icon: <MessageCircle size={18} />, text: 'Event replies within 24 hours' },
  ];

  const faqs = [
    {
      icon: <Users size={20} />,
      question: 'Do you host private events?',
      answer: 'Yes. We can shape the space for celebrations, team dinners, tastings, and compact launch nights.',
    },
    {
      icon: <Wifi size={20} />,
      question: 'Can I work from the cafe?',
      answer: 'Absolutely. Daytime seating is laptop friendly, with fast WiFi and enough coffee to keep ideas moving.',
    },
    {
      icon: <Car size={20} />,
      question: 'Is parking available?',
      answer: 'Street parking is available nearby, and our team can point you toward the easiest lots when you arrive.',
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await contactAPI.submit(formData);
      if (response.data.success) {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="x_contact_page">
      {/* <div className="x_contact_glow x_contact_glow_one" />
      <div className="x_contact_glow x_contact_glow_two" /> */}

      <section className="x_contact_hero container">
        <div className="x_contact_hero_shell">
          <div className="x_contact_hero_content">
            <span className="x_contact_eyebrow">
              <Mail size={16} />
              Talk to Zest
            </span>
            <h1 className="x_contact_headline">Coffee questions, dinner plans, late-night ideas.</h1>
            <p>
              Send us the details and we will help with reservations, private events, catering,
              and anything else your table needs.
            </p>
            <div className="x_contact_hero_actions">
              <a href="tel:+15551234567" className="x_contact_action x_contact_action_primary">
                <Phone size={18} />
                Call now
              </a>
              <a href="mailto:hello@zestcafe.com" className="x_contact_action">
                <Mail size={18} />
                Email us
              </a>
            </div>
          </div>

          <aside className="x_contact_visit_card" aria-label="Visit Zest">
            <div className="x_contact_visit_photo" />
            <div className="x_contact_open_badge">
              <Clock size={16} />
              Open daily
            </div>
            <h2>Drop by from first pour to final toast.</h2>
            <div className="x_contact_visit_rows">
              <span>8:00 AM</span>
              <strong>Cafe opens</strong>
              <span>12:00 AM</span>
              <strong>Bar closes</strong>
            </div>
          </aside>
        </div>
      </section>

      <section className="x_contact_info container">
        <div className="x_contact_info_strip">
          {contactInfo.map((info, idx) => (
            <div className="x_contact_info_card" key={idx}>
              <div className="x_contact_info_icon">{info.icon}</div>
              <div>
                <h3>{info.label}</h3>
                <p className="x_contact_info_value">{info.value}</p>
                <p className="x_contact_info_subtext">{info.subtext}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="x_contact_main">
        <div className="x_contact_container container">
          <div className="x_contact_form_section">
            <div className="x_contact_form_header">
              <span>Message board</span>
              <h2>Tell us what you are planning.</h2>
              <p>Share the essentials and our team will respond with the right next step.</p>
            </div>

            {submitted && (
              <div className="x_contact_success">
                <CheckCircle size={24} />
                <span>Message sent successfully! We'll be in touch soon.</span>
              </div>
            )}

            {error && (
              <div className="x_contact_error" style={{ color: '#e74c3c', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span role="img" aria-label="error">⚠️</span>
                <span>{error}</span>
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
                  disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>

              <button type="submit" className="x_contact_submit" disabled={loading}>
                {loading ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send size={18} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          <aside className="x_contact_side_panel">
            <div className="x_contact_quick_notes">
              {quickNotes.map((note) => (
                <div className="x_contact_quick_note" key={note.text}>
                  {note.icon}
                  <span>{note.text}</span>
                </div>
              ))}
            </div>
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
            {/* <a className="x_contact_direction" href="https://maps.google.com" target="_blank" rel="noreferrer">
              <Navigation size={18} />
              Open directions
            </a> */}
          </aside>
        </div>
      </section>

      <section className="x_contact_faq container">
        <div className="x_contact_faq_header">
          <span className="x_contact_eyebrow">Good to know</span>
          <h4>Before you stop by</h4>
        </div>

        <div className="x_contact_faq_grid">
          {faqs.map((item) => (
            <article className="x_contact_faq_item" key={item.question}>
              <div className="x_contact_faq_icon">{item.icon}</div>
              <h4>{item.question}</h4>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default ContactUs;
