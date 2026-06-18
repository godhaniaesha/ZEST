import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Users,
  Wifi,
  Car,
  ArrowUpRight,
  CheckCircle,
  MessageCircle
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
      icon: <MapPin size={28} />,
      label: 'Location',
      value: '123 Cafe Street, City Center',
      subtext: 'Visit us for coffee, food & cocktails',
    },
    {
      icon: <Phone size={28} />,
      label: 'Phone',
      value: '+1 (555) 123-4567',
      subtext: 'Mon - Sun: 8am - Midnight',
    },
    {
      icon: <Mail size={28} />,
      label: 'Email',
      value: 'hello@zestcafe.com',
      subtext: 'We reply within 24 hours',
    },
    {
      icon: <Clock size={28} />,
      label: 'Hours',
      value: 'Open Daily',
      subtext: 'Morning coffee to late cocktails',
    },
  ];

  const quickNotes = [
    { icon: <Users size={20} />, text: 'Reservations for groups of 4+' },
    { icon: <Wifi size={20} />, text: 'Walk-ins welcome all day' },
    { icon: <MessageCircle size={20} />, text: 'Event replies within 24 hours' },
  ];

  const faqs = [
    {
      icon: <Users size={24} />,
      question: 'Do you host private events?',
      answer: 'Yes. We can shape the space for celebrations, team dinners, tastings, and compact launch nights.',
    },
    {
      icon: <Wifi size={24} />,
      question: 'Can I work from the cafe?',
      answer: 'Absolutely. Daytime seating is laptop friendly, with fast WiFi and enough coffee to keep ideas moving.',
    },
    {
      icon: <Car size={24} />,
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
    <div className="x_contact_page">
      <div className="x_contact_inner">
        {/* Hero Section */}
        <section className="x_contact_hero">
          <div className="x_contact_hero_left">
            <div className="x_contact_hero_label">
              <span className="x_contact_hero_label_line"></span>
              <span className="x_contact_hero_label_text">Get In Touch</span>
            </div>
            <h1 className="x_contact_headline">
              Let's create <em>something</em>
              <br />
              beautiful together
            </h1>
            <p className="x_contact_hero_sub">
              Whether you have a question, want to book an event, or just want to say hello—
              we'd love to hear from you. Send us a message and we'll get back soon.
            </p>
            <div className="x_contact_stats" aria-label="Contact stats">
              <div className="x_contact_stats_item">
                <strong>24/7</strong>
                <span>Support</span>
              </div>
              <div className="x_contact_stats_item">
                <strong>1hr</strong>
                <span>Response</span>
              </div>
              <div className="x_contact_stats_item">
                <strong>500+</strong>
                <span>Events</span>
              </div>
            </div>
          </div>
          <div className="x_contact_hero_right">
            <div className="x_contact_hero_image_container">
              <div 
                className="x_contact_hero_image" 
                style={{ 
                  backgroundImage: 'url("https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=75")',
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center' 
                }} 
                role="img" 
                aria-label="Zest Cafe" 
              />
              <div className="x_contact_hero_badge">
                <div className="x_badge_text">
                  <span className="x_badge_label">Visit Us</span>
                  <h3 className="x_badge_title">Open Daily</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Head */}
        <div className="x_gallery_section_head">
          <div className="x_gallery_section_title_group">
            <span className="x_gallery_section_num">01</span>
            <h2 className="x_gallery_section_title">
              Our <em>Contact</em> Info
            </h2>
          </div>
        </div>

        {/* Contact Info Grid */}
        <section className="x_contact_info">
          <div className="x_contact_info_strip">
            {contactInfo.map((info, idx) => (
              <div className="x_contact_info_card" key={idx}>
                <div className="x_contact_info_icon">{info.icon}</div>
                <div className="x_contact_info_text">
                  <h3>{info.label}</h3>
                  <p className="x_contact_info_value">{info.value}</p>
                  <p className="x_contact_info_subtext">{info.subtext}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Main Contact Section */}
        <section className="x_contact_main">
          <div className="x_contact_container">
            {/* Contact Form */}
            <div className="x_contact_form_section">
              <div className="x_contact_form_header">
                <span className="x_contact_form_label">Send a Message</span>
                <h2>Tell us what you're planning</h2>
                <p>Share the essentials and our team will respond with the right next step.</p>
              </div>

              {submitted && (
                <div className="x_contact_success">
                  <CheckCircle size={28} />
                  <div>
                    <h4>Message Sent!</h4>
                    <p>We'll be in touch soon.</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="x_contact_error">
                  <span role="img" aria-label="error">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <form className="x_contact_form" onSubmit={handleSubmit}>
                <div className="x_form_group">
                  <label htmlFor="name" className="x_form_label">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="x_form_input"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="x_form_row">
                  <div className="x_form_group">
                    <label htmlFor="email" className="x_form_label">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="x_form_input"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="x_form_group">
                    <label htmlFor="phone" className="x_form_label">
                      Phone <span className="x_form_optional">(Optional)</span>
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
                  <label htmlFor="subject" className="x_form_label">Subject</label>
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
                  <label htmlFor="message" className="x_form_label">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    className="x_form_textarea"
                    placeholder="Tell us what's on your mind..."
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <button type="submit" className="x_contact_submit" disabled={loading}>
                  {loading ? (
                    <span className="x_contact_loading">Sending...</span>
                  ) : (
                    <>
                      Send Message
                      <Send size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Side Panel */}
            <aside className="x_contact_side_panel">
              <div className="x_contact_side_header">
                <h3>Quick Notes</h3>
                <p>Things you might want to know</p>
              </div>
              <div className="x_contact_quick_notes">
                {quickNotes.map((note, idx) => (
                  <div className="x_contact_quick_note" key={idx}>
                    <div className="x_contact_quick_note_icon">{note.icon}</div>
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
              <a 
                href="https://maps.google.com" 
                target="_blank" 
                rel="noreferrer" 
                className="x_contact_direction"
              >
                Get Directions
                <ArrowUpRight size={18} />
              </a>
            </aside>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="x_contact_faq">
          <div className="x_gallery_section_head p-0">
            <div className="x_gallery_section_title_group">
              <span className="x_gallery_section_num">02</span>
              <h2 className="x_gallery_section_title">
                Frequently <em>Asked</em>
              </h2>
            </div>
          </div>
          <div className="x_contact_faq_grid">
            {faqs.map((item, idx) => (
              <article className="x_contact_faq_item" key={idx}>
                <div className="x_contact_faq_icon">{item.icon}</div>
                <h4>{item.question}</h4>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactUs;
