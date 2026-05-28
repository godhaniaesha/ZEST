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

    </main>
  );
}
