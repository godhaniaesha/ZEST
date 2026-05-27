import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Coffee, Martini, Flame, Clock, Users, Star } from 'lucide-react';
import '../styles/x_home.css';
import '../styles/x_style.css';
import s1 from '../img/slide-1.jpg';
import s2 from '../img/slide-2.jpg';
// import s3 from '../assets/hero3.jpg';

const heroSlides = [
  {
    id: 1,
    image: 'https://madebydesignesia.com/themes/baresto/03_images/slider/slide-1.jpg',
    title: 'Experience Flavorful Creations',
    subtitle: 'Savor Perfection',
    description: 'Where artistry meets expertise to create a symphony of flavor.',
    cta: 'Explore Menu',
  },
  {
    id: 2,
    image: 'https://madebydesignesia.com/themes/baresto/03_images/slider/slide-2.jpg',
    title: 'Where Flavor Meets Elegance',
    subtitle: 'Flavors to Satisfy',
    description: 'Prepare your palate for an unforgettable dining experience.',
    cta: 'View Brunch',
  },
  {
    id: 3,
    image: 'https://cuisina.themerex.net/wp-content/uploads/2025/10/custom-img-73-copyright.jpg',
    title: 'Night Elegance',
    subtitle: 'Cocktails That Tell Stories',
    description: 'Experience our expertly crafted cocktails in a vibrant atmosphere.',
    cta: 'Reserve Table',
  },
];

const x_featured = [
  {
    icon: <Coffee size={32} />,
    title: 'Morning Ritual',
    desc: 'Single-origin espresso, cold brews, and fresh pastries.',
    highlight: 'Cafe',
  },
  {
    icon: <Flame size={32} />,
    title: 'Kitchen Fresh',
    desc: 'Farm-to-table brunch, bold flavors, sharing plates.',
    highlight: 'Kitchen',
  },
  {
    icon: <Martini size={32} />,
    title: 'Evening Pour',
    desc: 'Craft cocktails, smooth classics, curated spirits.',
    highlight: 'Bar',
  },
];

const x_testimonials = [
  {
    quote: 'The coffee here is nothing short of perfection. Rich, smooth, and aromatic - it\'s my morning sanctuary.',
    author: 'Sarah Mitchell',
    role: 'Coffee Enthusiast',
    rating: 5,
  },
  {
    quote: 'The cocktails are expertly crafted. Every visit feels like discovering something new and exciting.',
    author: 'James Chen',
    role: 'Mixology Lover',
    rating: 5,
  },
  {
    quote: 'The brunch menu is incredible - fresh ingredients, creative dishes, and impeccable service.',
    author: 'Emma Rodriguez',
    role: 'Food Blogger',
    rating: 5,
  },
];

const x_stats = [
  { number: '8+', label: 'Years Perfecting Taste' },
  { number: '40+', label: 'Signature Items' },
  { number: '4.8★', label: 'Guest Rating' },
];

const x_partners = [
  { id: 1, name: 'Jack Daniels', image: 'https://oldstory.ancorathemes.com/wp-content/uploads/2021/12/partner-logo-2.png' },
  { id: 2, name: 'Windsor', image: 'https://oldstory.ancorathemes.com/wp-content/uploads/2021/12/partner-logo-3.png' },
  { id: 3, name: 'Jameson', image: 'https://oldstory.ancorathemes.com/wp-content/uploads/2021/12/partner-logo-4.png' },
  { id: 4, name: 'Irish', image: 'https://oldstory.ancorathemes.com/wp-content/uploads/2021/12/partner-logo-5.png' },
  { id: 5, name: 'Glenfiddich', image: 'https://oldstory.ancorathemes.com/wp-content/uploads/2021/12/partner-logo-6.png' },
  { id: 6, name: 'Canadian Club', image: 'https://oldstory.ancorathemes.com/wp-content/uploads/2021/12/partner-logo-7.png' },
  { id: 7, name: 'Ghost', image: 'https://oldstory.ancorathemes.com/wp-content/uploads/2021/12/partner-logo-8.png' },
  { id: 8, name: 'Whiskey Pete\'s', image: 'https://oldstory.ancorathemes.com/wp-content/uploads/2021/12/partner-logo-1.png' },
];

const x_chef_recommends = [
  {
    id: 1,
    name: 'Rusty\'s Burger',
    category: 'FOOD',
    image: 'https://duruthemes.com/demo/html/candore/demo1/img/chef/hamburger.jpg',
    isNew: true,
  },
  {
    id: 2,
    name: 'Waldorf Salad',
    category: 'SALAD',
    image: 'http://duruthemes.com/demo/html/candore/demo1/img/chef/salad.jpg',
    isNew: false,
  },
  {
    id: 3,
    name: 'Corvo Dal 1824',
    category: 'WINE',
    image: 'https://duruthemes.com/demo/html/candore/demo1/img/chef/wine.jpg',
    isNew: false,
  },
];

const x_cocktail_features = [
  { icon: '📋', title: 'Extensive Menu', desc: 'A carefully curated selection of classic and signature cocktails.' },
  { icon: '🍹', title: 'Special Cocktails', desc: 'Seasonal specials and mixologist creations.' },
];

const x_whiskey_gallery = [
  { id: 1, image: 'https://oldstory.ancorathemes.com/wp-content/uploads/2021/12/image8-home2.jpg', alt: 'Bar ambiance' },
  { id: 2, image: 'https://oldstory.ancorathemes.com/wp-content/uploads/2021/12/image9-home2.jpg', alt: 'Whiskey bottles' },
  { id: 3, image: 'https://oldstory.ancorathemes.com/wp-content/uploads/2021/12/image10-home2.jpg', alt: 'Barrel storage' },
  { id: 4, image: 'https://oldstory.ancorathemes.com/wp-content/uploads/2021/12/image11-home2.jpg', alt: 'Cocktail glass' },
  { id: 5, image: 'https://oldstory.ancorathemes.com/wp-content/uploads/2021/12/image12-home2.jpg', alt: 'Bar seating' },
  { id: 6, image: 'https://oldstory.ancorathemes.com/wp-content/uploads/2021/12/image13-home2.jpg', alt: 'Whiskey tasting' },
  { id: 7, image: 'https://oldstory.ancorathemes.com/wp-content/uploads/2021/12/image12-home2.jpg', alt: 'Bartender at work' },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <main className="x_home_page">
      {/* HERO SLIDER */}
      <section className="x_hero_slider">
        <div className="x_hero_slides_container">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`x_hero_slide ${index === currentSlide ? 'x_active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="x_hero_overlay" />
              <div className="x_hero_content">
                <span className="x_hero_subtitle">{slide.subtitle}</span>
                <h1 className="x_hero_title">{slide.title}</h1>
                <p className="x_hero_description">{slide.description}</p>
                <a href="/menu" className="x_hero_btn">
                  {slide.cta}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Slider Controls */}
        <button className="x_slider_btn x_slider_prev" onClick={prevSlide} aria-label="Previous slide">
          <ChevronLeft size={32} />  
        </button>
        <button className="x_slider_btn x_slider_next" onClick={nextSlide} aria-label="Next slide">
          <ChevronRight size={32} />
        </button>

        {/* Slider Dots */}
        <div className="x_slider_dots">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`x_dot ${index === currentSlide ? 'x_active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="x_stats_section">
        <div className="x_stats_container">
          {x_stats.map((stat, idx) => (
            <div key={idx} className="x_stat_item">
              <div className="x_stat_number">{stat.number}</div>
              <div className="x_stat_label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED SECTIONS */}
      <section className="x_featured_section">
        <div className="x_featured_header">
          <h2>What Makes Zest Special</h2>
          <p>Three distinct experiences, one welcoming space</p>
        </div>

        <div className="x_featured_grid">
          {x_featured.map((item, idx) => (
            <article key={idx} className="x_featured_card">
              <div className="x_featured_icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <span className="x_featured_badge">{item.highlight}</span>
            </article>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="x_cta_section">
        <div className="x_cta_content">
          <h2>Ready for Your Next Experience?</h2>
          <p>Reserve your table, explore our menu, or just stop by for your morning ritual.</p>
          <div className="x_cta_buttons">
            <a href="/menu" className="x_cta_btn x_cta_primary">
              View Menu
            </a>
            <a href="/contactus" className="x_cta_btn x_cta_secondary">
              Make Reservation
            </a>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="x_testimonials_section">
        <div className="x_testimonials_header">
          <h2>Guest Favorites</h2>
          <p>What our community loves about Zest</p>
        </div>

        <div className="x_testimonials_grid">
          {x_testimonials.map((testimonial, idx) => (
            <article key={idx} className="x_testimonial_card">
              <div className="x_testimonial_stars">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="var(--d-gold)" color="var(--d-gold)" />
                ))}
              </div>
              <p className="x_testimonial_quote">"{testimonial.quote}"</p>
              <div className="x_testimonial_author">
                <strong>{testimonial.author}</strong>
                <span>{testimonial.role}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* AMBIANCE */}
      <section className="x_ambiance_section">
        <div className="x_ambiance_row">
          <div className="x_ambiance_content">
            <h2>Experience the Atmosphere</h2>
            <p>
              From morning's serene coffee ritual to night's vibrant cocktail energy, Zest transforms throughout
              the day. Every detail—lighting, music, ambiance—is curated to make you feel at home.
            </p>
            <ul className="x_ambiance_list">
              <li>
                <Clock size={20} />
                <span>Open 7am - 11pm Daily</span>
              </li>
              <li>
                <Users size={20} />
                <span>Perfect for Singles to Groups</span>
              </li>
              <li>
                <Star size={20} />
                <span>Consistently Excellent Service</span>
              </li>
            </ul>
          </div>
          <div className="x_ambiance_images">
            <img
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80"
              alt="Cafe ambiance"
              className="x_ambiance_img"
            />
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="x_partners_section">
        <div className="x_partners_header">
          <span className="x_partners_eyebrow">WE COOPERATE</span>
          <h2>Check Our <br></br>Best Clients & Partners</h2>
        </div>

        <div className="x_partners_grid">
          {x_partners.map((partner) => (
            <div key={partner.id} className="x_partner_logo">

              <img
                src={partner.image}
                alt={partner.name}
                className="x_partner_img"
              />

            </div>
          ))}
        </div>
      </section>

      {/* ABOUT US */}
      <section className="x_aboutus_section">
        <div className="x_aboutus_container">
          <div className="x_aboutus_content">
            <span className="x_aboutus_eyebrow">CANDORE RESTAURANT</span>
            <h2>Few Words About Us</h2>
            <p>
              Zest blends the comfort of a modern cafe with the energy of a polished bar. We believe that your
              favorite cafe and your favorite bar should feel like the same welcoming place where quality, care,
              and taste come together.
            </p>
            <p>
              From morning coffee rituals to evening cocktails, every moment is designed to be memorable. Our team
              is dedicated to creating experiences that linger in your memory.
            </p>
            <div className="x_aboutus_contact">
              <span className="x_aboutus_label">RESERVATION</span>
              <h3>855 100 4444</h3>
            </div>
          </div>
          <div className="x_aboutus_images">
            <img
              src="https://duruthemes.com/demo/html/candore/demo3/img/about2.jpg"
              alt="Delicious food"
              className="x_aboutus_img x_aboutus_img_main"
            />
            <img
              src="https://duruthemes.com/demo/html/candore/demo3/img/about.jpg"
              alt="Chef preparing food"
              className="x_aboutus_img x_aboutus_img_secondary"
            />
          </div>
        </div>
      </section>

      {/* CHEF RECOMMENDS */}
      <section className="x_chef_section">
        <div className="x_chef_header">
          <span className="x_chef_eyebrow">SHOULD TO TRY</span>
          <h2>Chef Recommends</h2>
          {/* <div className="x_chef_icon">🧑‍🍳</div> */}
        </div>
        <div className="x_chef_grid">
          {x_chef_recommends.map((dish) => (
            <article key={dish.id} className="x_chef_card">
              <div className="x_chef_card_image">
                <img src={dish.image} alt={dish.name} />
                {dish.isNew && <span className="x_chef_badge">NEW</span>}
              </div>
              <div className="x_chef_card_content">
                <span className="x_chef_category">{dish.category}</span>
                <h3>{dish.name}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* COCKTAILS */}
      <section className="x_cocktail_section">
        <div className="x_cocktail_container">
          <div className="x_cocktail_images">
            <div className="x_cocktail_img_stack">
              <img
                src="https://oldstory.ancorathemes.com/wp-content/uploads/2021/12/image4-home3.jpg"
                alt="Bartender"
                className="x_cocktail_img x_cocktail_img_2"
              />
              <img
                src="https://oldstory.ancorathemes.com/wp-content/uploads/2021/12/image3-home3.jpg"
                alt="Barrels"
                className="x_cocktail_img x_cocktail_img_1"
              />
            </div>
          </div>
          <div className="x_cocktail_content">
            <span className="x_cocktail_eyebrow">FOOD & DRINK</span>
            <h2>Enjoy Authentic Cocktails</h2>
            <p>
              Our mixologists craft each cocktail with precision and passion, blending premium spirits with
              artisanal ingredients. Every sip tells a story of craftsmanship and flavor.
            </p>
            <div className="x_cocktail_features">
              {x_cocktail_features.map((feature, idx) => (
                <div key={idx} className="x_cocktail_feature">
                  <span className="x_feature_icon">{feature.icon}</span>
                  <div>
                    <h4>{feature.title}</h4>
                    <p>{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHISKEY LOVERS */}
      <section className="x_whiskey_section">
        <div className="x_whiskey_content">
          <div className="x_whiskey_header">
            <span className="x_whiskey_eyebrow">WHISKEY LOVERS</span>
            <h2>We are a Special Place to Rest & Unwind</h2>
          </div>
          <div className="x_whiskey_text">
            <p>
              Zest is more than just a cafe and bar—it's a sanctuary for those who appreciate the finer things
              in life. Whether you're seeking a quiet moment with a perfect cup of coffee or a vibrant evening
              with friends, we create the perfect ambiance.
            </p>
            <p>
              Our carefully selected collection of spirits, craft cocktails, and signature dishes ensure every
              visit is special. Come unwind with us.
            </p>
            <a href="/menu" className="x_whiskey_read_more">
              Read More
            </a>
          </div>
        </div>
        <div className="x_whiskey_gallery">
          {x_whiskey_gallery.map((item) => (
            <div key={item.id} className={`x_whiskey_gallery_item x_gallery_item_${item.id}`}>
              <img src={item.image} alt={item.alt} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
