import React from 'react';
import { ChefHat, Clock, Coffee, Martini, Music, Sparkles, Star, Utensils } from 'lucide-react';

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
    <main className="z_about_page">
      <div className="z_about_glow z_about_glow_one" />
      <div className="z_about_glow z_about_glow_two" />

      <section className="z_about_hero">
        <div className="z_about_hero_row row align-items-center">
          <div className="z_about_hero_content col-lg-7">
            <span className="z_about_eyebrow">
              <Sparkles size={16} />
              Cafe by day. Bar by night.
            </span>
            <h1 className="z_about_headline">One place, two moods, every hour full of flavor.</h1>
            <p>
              Zest blends the comfort of a modern cafe with the energy of a polished bar. Come for
              coffee, stay for food, and return when the lights turn low.
            </p>
            <div className="z_about_hero_actions">
              <a href="#z_about_story" className="z_about_btn z_about_btn_primary">
                Our Story
              </a>
              <a href="#z_about_experience" className="z_about_btn z_about_btn_secondary">
                Explore Vibe
              </a>
            </div>

            <div className="z_about_rituals" aria-label="Cafe and bar specialties">
              {z_rituals.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>

          <div className="z_about_visual col-lg-5" aria-label="Cafe and bar atmosphere">
            <div className="z_about_main_photo">
              <img
                src="https://i1-e.pinimg.com/736x/af/b6/de/afb6de59cd10b1c7a31653aab893a7f2.jpg"
                alt="Warm cafe and bar counter with drinks"
              />
            </div>
            <div className="z_about_float_photo">
              <img
                src="https://i1-e.pinimg.com/736x/3a/7f/cd/3a7fcd007c8a913e5c6545671d3c9844.jpg"
                alt="Cafe bar seating with warm lights"
              />
            </div>
            <div className="z_about_badge">
              <Star size={18} />
              <span>Crafted daily</span>
            </div>
            <div className="z_about_orbit z_about_orbit_cafe">
              <Coffee size={20} />
            </div>
            <div className="z_about_orbit z_about_orbit_bar">
              <Martini size={20} />
            </div>
          </div>
        </div>
      </section>

      <section className="z_about_stats" aria-label="Zest quick facts">
        <div className="z_about_stats_row row">
          {z_stats.map((item) => (
            <div className="z_about_stat col-md-4" key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="z_about_story" id="z_about_story">
        <div className="z_about_story_row row align-items-center">
          <div className="z_about_story_media_col col-lg-5">
            <div className="z_about_story_media">
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80"
                alt="Chef preparing food in a warm restaurant kitchen"
              />
              <div className="z_about_story_tag">
                <ChefHat size={18} />
                <span>Fresh kitchen</span>
              </div>
            </div>
          </div>
          <div className="z_about_story_content col-lg-7">
            <span className="z_about_eyebrow">About Zest</span>
            <h2>A place that changes beautifully with the hour.</h2>
            <p>
              We started Zest with one simple idea: your favorite cafe and your favorite bar should
              feel like the same welcoming place. In the morning, it smells like coffee and fresh
              food. By evening, the lights get warmer, the bar wakes up, and the room becomes
              perfect for shared plates and crafted drinks.
            </p>
            <p>
              Every detail, from the menu to the music, is chosen to make guests feel comfortable,
              cared for, and ready to enjoy the moment.
            </p>
            <div className="z_about_timing">
              <Clock size={20} />
              <span>Open daily for coffee, dining, cocktails, and late conversations.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="z_about_experience" id="z_about_experience">
        <div className="z_about_section_head">
          <span className="z_about_eyebrow">The Experience</span>
          <h2>Made for brunch plans, date nights, and everything between.</h2>
        </div>

        <div className="z_about_cards">
          <div className="z_about_cards_row row">
            {z_highlights.map((item) => (
              <div className="z_about_card_wrap col-md-6 col-lg-4" key={item.title}>
                <article className="z_about_card">
                  <div className="z_about_card_icon">{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="z_about_menu_mood">
        <div className="z_about_menu_row row align-items-center">
          <div className="z_about_menu_content col-lg-5">
            {/* <div className="z_about_menu_icon">
              <Utensils size={28} />
              <Flame size={22} />
            </div> */}
            <span className="z_about_eyebrow">Signature Menu</span>
            <h2>Food, coffee, and cocktails with one clear personality.</h2>
            <p>
              Our menu balances comforting cafe favorites with bar bites, bold flavors, fresh
              ingredients, and drinks that feel special without feeling complicated.
            </p>
            <a href="#z_about_experience" className="z_about_btn z_about_btn_primary">
              View Highlights
            </a>
          </div>

          <div className="z_about_menu_showcase col-lg-7">
            {z_menu_moods.map((item) => (
              <article className="z_about_menu_tile" key={item.label}>
                <div className="z_about_menu_tile_icon">{item.icon}</div>
                <div>
                  <h3>{item.label}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutUs;
