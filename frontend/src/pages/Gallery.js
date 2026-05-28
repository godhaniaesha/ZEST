import React, { useState } from 'react';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/x_pages.css';

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');

  const galleryImages = [
    {
      id: 1,
      category: 'ambiance',
      title: 'Warm Cafe Lighting',
      image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80',
      alt: 'Cafe interior with warm lighting'
    },
    {
      id: 2,
      category: 'food',
      title: 'Signature Breakfast Plate',
      image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=800&q=80',
      alt: 'Gourmet breakfast plate'
    },
    {
      id: 3,
      category: 'cocktails',
      title: 'Craft Cocktails',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561404?auto=format&fit=crop&w=800&q=80',
      alt: 'Colorful craft cocktails'
    },
    {
      id: 4,
      category: 'ambiance',
      title: 'Bar Counter Seating',
      image: 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?auto=format&fit=crop&w=800&q=80',
      alt: 'Modern bar counter with seating'
    },
    {
      id: 5,
      category: 'food',
      title: 'Dessert Showcase',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      alt: 'Decadent chocolate dessert'
    },
    {
      id: 6,
      category: 'ambiance',
      title: 'Evening Ambiance',
      image: 'https://images.unsplash.com/photo-1514432324607-2e467f4af445?auto=format&fit=crop&w=800&q=80',
      alt: 'Restaurant evening atmosphere'
    },
    {
      id: 7,
      category: 'food',
      title: 'Fresh Brunch',
      image: 'https://images.unsplash.com/photo-1557804506-669714126472?auto=format&fit=crop&w=800&q=80',
      alt: 'Avocado toast brunch plate'
    },
    {
      id: 8,
      category: 'cocktails',
      title: 'Signature Espresso Martini',
      image: 'https://images.unsplash.com/photo-1536715088601-f84fd2c72ef4?auto=format&fit=crop&w=800&q=80',
      alt: 'Espresso martini cocktail'
    },
    {
      id: 9,
      category: 'ambiance',
      title: 'Intimate Dining',
      image: 'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?auto=format&fit=crop&w=800&q=80',
      alt: 'Table setting for dining'
    },
  ];

  const categories = [
    { id: 'all', label: 'All Photos' },
    { id: 'ambiance', label: 'Ambiance' },
    { id: 'food', label: 'Food' },
    { id: 'cocktails', label: 'Cocktails' },
  ];

  const filteredImages =
    activeCategory === 'all'
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeCategory);

  const handleImageClick = (index) => {
    setSelectedImage(filteredImages[index]);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setSelectedImage(filteredImages[nextIndex]);
    setCurrentIndex(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setSelectedImage(filteredImages[prevIndex]);
    setCurrentIndex(prevIndex);
  };

  return (
    <main className="x_gallery_page">
      {/* Hero Section */}
      <section className="x_gallery_hero container">
        <div className="x_gallery_hero_content">
          <span className="x_gallery_eyebrow">
            <Search size={16} />
            Visual Story
          </span>
          <h1 className="x_gallery_headline">Moments from Zest</h1>
          <p>A glimpse into our cafe, bar, and the experiences we create every day.</p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="x_gallery_filters container">
        <div className="x_gallery_filter_buttons">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`x_gallery_filter_btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="x_gallery_grid_section container">
        <div className="x_gallery_grid">
          {filteredImages.map((image, index) => (
            <div
              key={image.id}
              className="x_gallery_item"
              onClick={() => handleImageClick(index)}
            >
              <img
                src={image.image}
                alt={image.alt}
                loading="lazy"
              />
              <div className="x_gallery_item_overlay">
                <span className="x_gallery_view_text">View</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="x_gallery_lightbox" onClick={() => setSelectedImage(null)}>
          <button
            className="x_gallery_close"
            onClick={() => setSelectedImage(null)}
            aria-label="Close lightbox"
          >
            <X size={28} />
          </button>

          <button
            className="x_gallery_nav x_gallery_nav_prev"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Previous image"
          >
            <ChevronLeft size={32} />
          </button>

          <div className="x_gallery_lightbox_content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage.image} alt={selectedImage.alt} />
            <div className="x_gallery_lightbox_info">
              <h3>{selectedImage.title}</h3>
            </div>
          </div>

          <button
            className="x_gallery_nav x_gallery_nav_next"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next image"
          >
            <ChevronRight size={32} />
          </button>

          <div className="x_gallery_lightbox_counter">
            {currentIndex + 1} / {filteredImages.length}
          </div>
        </div>
      )}
    </main>
  );
};

export default Gallery;
