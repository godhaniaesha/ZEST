import React from 'react';
import { ChefHat, Clock, Coffee, Martini, Music, Sparkles, Star, Utensils } from 'lucide-react';
import '../styles/menu_style.css';

const z_highlights = [
  {
    icon: <Coffee size={24} />,
    title: 'Morning Craft',
    text: 'Slow coffee, fresh plates, soft light, and a corner that feels made for your first pause.',
  },
  {
    icon: <Martini size={24} />,
    title: 'Night Pour',
    text: 'Balanced cocktails, chilled classics, and bar bites that keep the table talking.',
  },
  {
    icon: <Music size={24} />,
    title: 'Live Mood',
    text: 'Warm playlists, intimate lighting, and an evening rhythm that never feels rushed.',
  },
];

const z_stats = [
  { value: '08+', label: 'Years of Taste' },
  { value: '40+', label: 'Cafe & Bar Picks' },
  { value: '4.8', label: 'Guest Love' },
];

const z_rituals = [
  'House coffee',
  'Fresh brunch',
  'Craft cocktails',
  'Late plates',
];

const z_menu_moods = [
  { icon: <Coffee size={20} />, label: 'Cafe', text: 'Single-origin pours, cold brews, and easy morning plates.' },
  { icon: <Utensils size={20} />, label: 'Kitchen', text: 'Fresh brunch, loaded bites, and sharing-friendly comfort food.' },
  { icon: <Martini size={20} />, label: 'Bar', text: 'Balanced cocktails, smooth classics, and late-night signatures.' },
];

const AboutUs = () => {
  return (
    <div className="x_menu_page" style={{ paddingBottom: '100px' }}>
      <div className="x_menu_inner">
        
        {/* HERO SECTION */}
        <section className="x_menu_hero">
          <div className="x_menu_hero_left">
            <div className="x_menu_hero_label">
              <span className="x_menu_hero_label_line"></span>
              <span className="x_menu_hero_label_text">
                <Sparkles size={14} style={{ marginRight: '8px' }} />
                Cafe by day. Bar by night.
              </span>
            </div>

            <h1 className="x_menu_headline">
              One place, two <em>moods</em>, every hour full of <em>flavor</em>.
            </h1>

            <p className="x_menu_hero_sub">
              Zest blends the comfort of a modern cafe with the energy of a polished bar. Come for coffee, stay for food, and return when the lights turn low.
            </p>

            <div className="x_menu_stats" aria-label="Cafe and bar specialties" style={{ marginTop: '32px' }}>
              {z_rituals.map((item) => (
                <div className="x_menu_stats_item" key={item} style={{ flex: '0 0 auto', paddingRight: '0' }}>
                  <strong style={{ fontSize: '1.1rem', letterSpacing: '0.05em' }}>{item}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="x_menu_hero_right">
            <div className="x_menu_simple_showcase">
              <div className="x_simple_frame">
                <div 
                  className="x_simple_main_img" 
                  style={{ 
                    backgroundImage: 'url(https://i1-e.pinimg.com/736x/af/b6/de/afb6de59cd10b1c7a31653aab893a7f2.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }} 
                  role="img" 
                  aria-label="Warm cafe and bar counter" 
                />
                <div className="x_simple_frame_border"></div>
              </div>

              <div className="x_simple_label" style={{ bottom: '10px', right: '10px' }}>
                <span className="x_simple_tag">
                  <Star size={14} style={{ marginRight: '4px' }} />
                  Crafted daily
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="x_menu_controls_section" style={{ padding: '40px 0', borderTop: '1px solid var(--d-gold-light)', borderBottom: '1px solid var(--d-gold-light)', marginTop: '60px', background: 'var(--d-bg-card)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', textAlign: 'center' }}>
            {z_stats.map((item) => (
              <div key={item.label}>
                <strong style={{ 
                  fontFamily: '"Playfair Display", serif', 
                  fontSize: '2.4rem', 
                  fontWeight: '700', 
                  color: 'var(--d-gold)', 
                  display: 'block', 
                  lineHeight: '1' 
                }}>
                  {item.value}
                </strong>
                <span style={{ 
                  fontFamily: '"Playfair Display", serif', 
                  fontSize: '0.85rem', 
                  fontWeight: '500', 
                  letterSpacing: '0.15em', 
                  textTransform: 'uppercase', 
                  color: 'var(--d-text-muted)' 
                }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* OUR STORY SECTION */}
        <div className="x_gallery_section_head" style={{ marginTop: '70px' }}>
          <div className="x_gallery_section_title_group">
            <span className="x_gallery_section_num">01</span>
            <h2 className="x_gallery_section_title">
              Our <em>Story</em>
            </h2>
          </div>
        </div>

        <section style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1.2fr', 
          gap: '60px', 
          alignItems: 'center',
          marginTop: '40px',
          marginBottom: '80px'
        }}>
          <div style={{ position: 'relative' }}>
            <div style={{ 
              position: 'relative', 
              width: '100%', 
              aspectRatio: '1', 
              borderRadius: '4px', 
              overflow: 'visible' 
            }}>
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80"
                alt="Chef preparing food"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
              />
              <div style={{ 
                position: 'absolute', 
                bottom: '-20px', 
                right: '-20px', 
                background: 'var(--d-primary)', 
                padding: '16px 22px', 
                borderRadius: '4px', 
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <ChefHat size={18} style={{ color: 'var(--d-gold-light)' }} />
                <span style={{ 
                  fontFamily: '"Playfair Display", serif', 
                  fontSize: '0.85rem', 
                  fontWeight: '700', 
                  letterSpacing: '0.15em', 
                  textTransform: 'uppercase', 
                  color: 'var(--d-gold-light)' 
                }}>
                  Fresh kitchen
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="x_menu_hero_label" style={{ marginBottom: '16px' }}>
              <span className="x_menu_hero_label_line"></span>
              <span className="x_menu_hero_label_text">About Zest</span>
            </div>
            
            <h2 style={{ 
              fontFamily: '"Playfair Display", serif', 
              fontSize: '2.2rem', 
              fontWeight: '700', 
              color: 'var(--d-primary-dark)', 
              marginBottom: '20px', 
              lineHeight: '1.2' 
            }}>
              A place that changes beautifully with the hour.
            </h2>
            
            <p style={{ 
              fontFamily: '"Playfair Display", serif', 
              fontSize: '1.05rem', 
              color: 'var(--d-text-muted)', 
              lineHeight: '1.75', 
              marginBottom: '16px' 
            }}>
              We started Zest with one simple idea: your favorite cafe and your favorite bar should feel like the same welcoming place. In the morning, it smells like coffee and fresh food. By evening, the lights get warmer, the bar wakes up, and the room becomes perfect for shared plates and crafted drinks.
            </p>
            
            <p style={{ 
              fontFamily: '"Playfair Display", serif', 
              fontSize: '1.05rem', 
              color: 'var(--d-text-muted)', 
              lineHeight: '1.75', 
              marginBottom: '24px' 
            }}>
              Every detail, from the menu to the music, is chosen to make guests feel comfortable, cared for, and ready to enjoy the moment.
            </p>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '14px 20px', 
              background: 'var(--d-bg-card)', 
              borderRadius: '4px', 
              border: '1px solid var(--d-gold-light)' 
            }}>
              <Clock size={20} style={{ color: 'var(--d-gold-dark)' }} />
              <span style={{ 
                fontFamily: '"Playfair Display", serif', 
                fontSize: '0.95rem', 
                color: 'var(--d-text-muted)' 
              }}>
                Open daily for coffee, dining, cocktails, and late conversations.
              </span>
            </div>
          </div>
        </section>

        {/* EXPERIENCE SECTION */}
        <div className="x_gallery_section_head">
          <div className="x_gallery_section_title_group">
            <span className="x_gallery_section_num">02</span>
            <h2 className="x_gallery_section_title">
              The <em>Experience</em>
            </h2>
          </div>
        </div>

        <div className="x_gallery_section_head" style={{ paddingTop: '0', marginBottom: '32px' }}>
          <p style={{ 
            fontFamily: '"Playfair Display", serif', 
            fontSize: '1.05rem', 
            color: 'var(--d-text-muted)', 
            maxWidth: '520px',
            marginBottom: '0',
            fontStyle: 'italic' 
          }}>
            Made for brunch plans, date nights, and everything between.
          </p>
        </div>

        <section style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '24px', 
          marginTop: '10px',
          marginBottom: '80px'
        }}>
          {z_highlights.map((item) => (
            <div key={item.title} style={{ 
              background: 'var(--d-bg-card)', 
              border: '1px solid var(--d-border)', 
              borderRadius: '4px',
              padding: '32px 28px',
              transition: 'var(--d-transition)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(22, 48, 43, 0.08)';
              e.currentTarget.style.borderColor = 'var(--d-gold-light)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'var(--d-border)';
            }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "12px" }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '4px', 
                  background: 'rgba(201, 168, 76, 0.12)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'var(--d-gold-dark)' 
                }}>
                  {item.icon}
                </div>
                <h3 style={{ 
                  fontFamily: '"Playfair Display", serif', 
                  fontSize: '1.4rem', 
                  fontWeight: '700', 
                  color: 'var(--d-primary-dark)', 
                  margin: '0' 
                }}>
                  {item.title}
                </h3>
              </div>
              <p style={{ 
                fontFamily: '"Playfair Display", serif', 
                fontSize: '0.95rem', 
                color: 'var(--d-text-muted)', 
                lineHeight: '1.65', 
                margin: '0' 
              }}>
                {item.text}
              </p>
            </div>
          ))}
        </section>

        {/* MENU MOODS SECTION */}
        <div className="x_gallery_section_head">
          <div className="x_gallery_section_title_group">
            <span className="x_gallery_section_num">03</span>
            <h2 className="x_gallery_section_title">
              Signature <em>Menu</em>
            </h2>
          </div>
        </div>

        <section style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1.4fr', 
          gap: '60px', 
          alignItems: 'center',
          marginTop: '40px',
          marginBottom: '40px'
        }}>
          <div>
            <div className="x_menu_hero_label" style={{ marginBottom: '16px' }}>
              <span className="x_menu_hero_label_line"></span>
              <span className="x_menu_hero_label_text">Signature Menu</span>
            </div>
            
            <h2 style={{ 
              fontFamily: '"Playfair Display", serif', 
              fontSize: '2.2rem', 
              fontWeight: '700', 
              color: 'var(--d-primary-dark)', 
              marginBottom: '20px', 
              lineHeight: '1.2' 
            }}>
              Food, coffee, and cocktails with one clear personality.
            </h2>
            
            <p style={{ 
              fontFamily: '"Playfair Display", serif', 
              fontSize: '1.05rem', 
              color: 'var(--d-text-muted)', 
              lineHeight: '1.75', 
              marginBottom: '32px' 
            }}>
              Our menu balances comforting cafe favorites with bar bites, bold flavors, fresh ingredients, and drinks that feel special without feeling complicated.
            </p>
          </div>

          <div>
            {z_menu_moods.map((item) => (
              <div key={item.label} style={{ 
                background: 'var(--d-bg-card)', 
                border: '1px solid var(--d-border)', 
                borderRadius: '4px',
                padding: '24px 28px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                transition: 'var(--d-transition)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--d-gold-light)';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--d-border)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
              >
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '4px', 
                  background: 'rgba(201, 168, 76, 0.12)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'var(--d-gold-dark)', 
                  flexShrink: '0' 
                }}>
                  {item.icon}
                </div>
                <div>
                  <h3 style={{ 
                    fontFamily: '"Playfair Display", serif', 
                    fontSize: '1.4rem', 
                    fontWeight: '700', 
                    color: 'var(--d-primary-dark)', 
                    margin: '0 0 6px 0' 
                  }}>
                    {item.label}
                  </h3>
                  <p style={{ 
                    fontFamily: '"Playfair Display", serif', 
                    fontSize: '0.95rem', 
                    color: 'var(--d-text-muted)', 
                    lineHeight: '1.6', 
                    margin: '0' 
                  }}>
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Add animations */}
      <style jsx>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideRight {
          from { opacity: 0; transform: translateX(28px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes simpleFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .x_gallery_section_head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 50px 0 36px;
        }
        .x_gallery_section_title_group {
          display: flex;
          align-items: flex-end;
          gap: 16px;
        }
        .x_gallery_section_num {
          font-family: "Playfair Display", serif;
          font-size: 2.4rem;
          font-weight: 700;
          color: var(--d-gold);
          line-height: 0.8;
        }
        .x_gallery_section_title {
          font-family: "Playfair Display", serif;
          font-size: 2rem;
          font-weight: 700;
          color: var(--d-primary-dark);
          line-height: 1.1;
          margin: 0;
        }
        .x_gallery_section_title em {
          font-style: italic;
          background: linear-gradient(120deg, var(--d-gold-dark), var(--d-gold-light), var(--d-gold), var(--d-gold-light));
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 6s linear infinite;
          padding-left: 4px;
        }
        @media (max-width: 1024px) {
          .x_menu_hero { grid-template-columns: 1fr; text-align: center; }
          .x_menu_hero_left { align-items: center; }
          .x_menu_hero_sub { margin: 0 auto; }
          section[style*="gridTemplateColumns"] { grid-template-columns: 1fr !important; }
          section[style*="gridTemplateColumns"] > div:first-child { max-width: 500px; margin: 0 auto; }
        }
        @media (max-width: 768px) {
          .x_menu_inner { padding: 0 20px; }
          .x_menu_headline { font-size: 2.6rem; }
          .x_gallery_section_num { font-size: 1.8rem; }
          .x_gallery_section_title { font-size: 1.7rem !important; }
        }
      `}</style>
    </div>
  );
};

export default AboutUs;
