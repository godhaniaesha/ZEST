import React, { useState } from 'react';
import {
  Coffee,
  Wine,
  Utensils,
  Users,
  Zap,
  Music,
  Heart,
  Award,
  Clock,
  MapPin,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import '../styles/x_pages.css';

const Services = () => {
  const [activeTab, setActiveTab] = useState('all');

  const services = [
    {
      id: 'cafe',
      category: 'cafe',
      icon: <Coffee size={28} />,
      title: 'Morning Cafe',
      description: 'Slow-crafted coffee, fresh pastries, and breakfast plates in a warm, welcoming atmosphere.',
      features: ['Single-origin pour overs', 'Seasonal pastries', 'Fresh juice & smoothies', 'Breakfast boards'],
      time: '7am - 12pm',
    },
    {
      id: 'brunch',
      category: 'dining',
      icon: <Utensils size={28} />,
      title: 'Brunch & Lunch',
      description: 'Fresh, creative plates with locally-sourced ingredients. Perfect for brunch dates and leisurely lunches.',
      features: ['Loaded toast boards', 'Fresh salads', 'House-made pasta', 'Shareable bites'],
      time: '10am - 3pm',
    },
    {
      id: 'dinner',
      category: 'dining',
      icon: <TrendingUp size={28} />,
      title: 'Dinner Service',
      description: 'Thoughtfully prepared dishes with seasonal ingredients and bold flavors for an elevated dinner experience.',
      features: ['Signature mains', 'Fresh seafood', 'Seasonal vegetables', 'Chef specials'],
      time: '5pm - 10pm',
    },
    {
      id: 'cocktails',
      category: 'bar',
      icon: <Wine size={28} />,
      title: 'Craft Cocktails',
      description: 'Balanced, carefully crafted cocktails made with premium spirits and fresh ingredients.',
      features: ['House cocktails', 'Classic drinks', 'Wine selection', 'Spirits curated'],
      time: '12pm - Midnight',
    },
    {
      id: 'latenight',
      category: 'bar',
      icon: <Music size={28} />,
      title: 'Late Night Bar',
      description: 'Smooth vibes, great company, and carefully selected drinks to keep the evening going.',
      features: ['Small plates', 'Signature drinks', 'Live playlists', 'Social atmosphere'],
      time: '9pm - Midnight',
    },
    {
      id: 'events',
      category: 'events',
      icon: <Users size={28} />,
      title: 'Private Events',
      description: 'Host your celebration, meeting, or gathering in our elegant private spaces.',
      features: ['Customizable menus', 'Event planning', 'Private spaces', 'Full bar service'],
      time: 'By appointment',
    },
  ];

  const whyChoose = [
    {
      icon: <Award size={24} />,
      title: 'Carefully Crafted',
      text: 'Every detail from food to atmosphere is chosen with intention and care.',
    },
    {
      icon: <Clock size={24} />,
      title: 'Perfect Timing',
      text: 'Open from morning coffee through late cocktails, always ready for you.',
    },
    {
      icon: <Sparkles size={24} />,
      title: 'Premium Quality',
      text: 'We source only the finest ingredients and spirits for your experience.',
    }
    
  ];

  const filteredServices =
    activeTab === 'all' ? services : services.filter((s) => s.category === activeTab);

  return (
    <main className="x_services_page">
      <div className="x_services_glow x_services_glow_one" />
      {/* <div className="x_services_glow x_services_glow_two" /> */}

      {/* Hero Section */}
      <section className="x_services_hero container">
        <div className="x_services_hero_content">
          <span className="x_services_eyebrow">
            <Sparkles size={16} />
            Our Services
          </span>
          <h1 className="x_services_headline">
            Everything you need, from morning to midnight.
          </h1>
          <p>
            Zest is more than a cafe or a bar—it's a complete experience. Coffee, cocktails,
            cuisine, and care in one welcoming space.
          </p>
        </div>
      </section>

      {/* Service Filters */}
      <section className="x_services_filters container">
        <div className="x_services_filter_tabs">
          <button
            className={`x_filter_tab ${activeTab === 'all' ? 'x_active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Services
          </button>
          <button
            className={`x_filter_tab ${activeTab === 'cafe' ? 'x_active' : ''}`}
            onClick={() => setActiveTab('cafe')}
          >
            Cafe
          </button>
          <button
            className={`x_filter_tab ${activeTab === 'dining' ? 'x_active' : ''}`}
            onClick={() => setActiveTab('dining')}
          >
            Dining
          </button>
          <button
            className={`x_filter_tab ${activeTab === 'bar' ? 'x_active' : ''}`}
            onClick={() => setActiveTab('bar')}
          >
            Bar
          </button>
          <button
            className={`x_filter_tab ${activeTab === 'events' ? 'x_active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            Events
          </button>
        </div>
      </section>

      {/* Services Grid */}
      <section className="x_services_grid_section container">
        <div className="x_services_grid">
          {filteredServices.map((service) => (
            <div className="x_service_card" key={service.id}>
              <div className="x_service_icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p className="x_service_description">{service.description}</p>

              <div className="x_service_features">
                <p className="x_service_features_label">Featured:</p>
                <ul>
                  {service.features.map((feature, idx) => (
                    <li key={idx}>
                      <span className="x_feature_dot" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="x_service_time">
                <Clock size={16} />
                <span>{service.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="x_services_why">
        <div className="x_services_why_header container">
          <h2>Why Choose Zest</h2>
          <p>Excellence in every cup, every plate, every moment.</p>
        </div>

        <div className="x_services_why_grid container">
          {whyChoose.map((item, idx) => (
            <div className="x_services_why_card" key={idx}>
              <div className="x_services_why_icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Availability Section */}
      <section className="x_services_availability container">
        <div className="x_availability_header">
          <h2>Always Open, Always Ready</h2>
          <p>Find the perfect time for your visit</p>
        </div>

        <div className="x_availability_hours">
          <div className="x_availability_item">
            <div className="x_availability_time">7am - 12pm</div>
            <div className="x_availability_service">
              <Coffee size={20} />
              <span>Morning Cafe</span>
            </div>
          </div>

          <div className="x_availability_divider" />

          <div className="x_availability_item">
            <div className="x_availability_time">12pm - 5pm</div>
            <div className="x_availability_service">
              <Utensils size={20} />
              <span>Lunch & Brunch</span>
            </div>
          </div>

          <div className="x_availability_divider" />

          <div className="x_availability_item">
            <div className="x_availability_time">5pm - 10pm</div>
            <div className="x_availability_service">
              <TrendingUp size={20} />
              <span>Dinner</span>
            </div>
          </div>

          <div className="x_availability_divider" />

          <div className="x_availability_item">
            <div className="x_availability_time">9pm - Midnight</div>
            <div className="x_availability_service">
              <Wine size={20} />
              <span>Evening Bar</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="x_services_cta">
        <div className="x_services_cta_content container">
          <h2>Ready to experience Zest?</h2>
          <p>Make a reservation, order catering, or plan your event with us.</p>
          <div className="x_services_cta_buttons">
            <a href="/reservations" className="x_services_cta_btn x_services_cta_primary">
              Make Reservation
            </a>
            <a href="/contactus" className="x_services_cta_btn x_services_cta_secondary">
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Services;
