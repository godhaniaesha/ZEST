import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid, List, X, ChevronLeft, ChevronRight,
  Maximize2
} from 'lucide-react';
// import './gallery_style.css';

/* ═══════════════════════════════════════════════════════════
   GALLERY DATA
   ═══════════════════════════════════════════════════════════ */
const galleryItems = [
  {
    id: 1,
    title: 'Creamy Mushroom Pasta',
    category: 'food',
    tag: 'Mains',
    description: 'Handmade pappardelle tossed in wild mushroom cream with truffle shavings.',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=75',
    featured: true,
  },
  {
    id: 2,
    title: 'Espresso Martini',
    category: 'drinks',
    tag: 'Cocktails',
    description: 'Bold espresso blended with premium vodka and velvety coffee liqueur.',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=75',
    featured: false,
  },
  {
    id: 3,
    title: 'Chocolate Lava Cake',
    category: 'desserts',
    tag: 'Desserts',
    description: 'Dark chocolate cake with a gloriously molten Valrhona centre.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=75',
    featured: false,
  },
  {
    id: 4,
    title: 'The Interior',
    category: 'ambiance',
    tag: 'Ambiance',
    description: 'Warm Edison lighting, dark timber, and hand-stitched leather seating.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=75',
    featured: true,
  },
  {
    id: 5,
    title: 'Grilled Salmon',
    category: 'food',
    tag: 'Mains',
    description: 'Sustainable Atlantic salmon, charred edges, lemon beurre blanc.',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=75',
    featured: false,
  },
  {
    id: 6,
    title: 'Cold Brew Coffee',
    category: 'drinks',
    tag: 'Beverages',
    description: '18-hour steep, single-origin Ethiopian beans, zero acidity.',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=75',
    featured: false,
  },
  // {
  //   id: 7,
  //   title: 'Avocado Toast',
  //   category: 'food',
  //   tag: 'Breakfast',
  //   description: 'Stone-baked sourdough, hand-mashed Hass avocado, poached egg.',
  //   image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=800&q=75',
  //   featured: false,
  // },
  {
    id: 8,
    title: 'Bar Counter',
    category: 'ambiance',
    tag: 'Ambiance',
    description: 'Marble-topped bar with a curated back-bar of rare spirits.',
    image: 'https://images.unsplash.com/photo-1538488881038-e252a119ace7?auto=format&fit=crop&w=800&q=75',
    featured: false,
  },
  {
    id: 9,
    title: 'Vanilla Panna Cotta',
    category: 'desserts',
    tag: 'Desserts',
    description: 'Madagascar Bourbon vanilla, trembling set, seasonal berry compote.',
    image: 'https://i.pinimg.com/736x/65/90/55/659055b6f165eae21bc7d7ae94679079.jpg',
    featured: false,
  },
  {
    id: 10,
    title: 'Old Fashioned',
    category: 'drinks',
    tag: 'Cocktails',
    description: 'Buffalo Trace bourbon, Demerara syrup, Angostura bitters, expressed orange.',
    image: 'https://images.unsplash.com/photo-1470338745628-171cf53de3a8?auto=format&fit=crop&w=800&q=75',
    featured: false,
  },
  {
    id: 11,
    title: 'Pancakes Stack',
    category: 'food',
    tag: 'Breakfast',
    description: 'Buttermilk pancakes, grade-A maple syrup, seasonal berries, whipped cream.',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=75',
    featured: false,
  },
  {
    id: 12,
    title: 'Dining Room',
    category: 'ambiance',
    tag: 'Ambiance',
    description: 'Sixty-cover dining room draped in soft candlelight and botanical accents.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=75',
    featured: true,
  },
];

const filterCategories = [
  { id: 'all',      label: 'All' },
  { id: 'food',     label: 'Food' },
  { id: 'drinks',   label: 'Drinks' },
  { id: 'desserts', label: 'Desserts' },
  { id: 'ambiance', label: 'Ambiance' },
];

/* ═══════════════════════════════════════════════════════════
   GALLERY COMPONENT
   ═══════════════════════════════════════════════════════════ */
const Gallery = () => {
  const [activeFilter, setActiveFilter]   = useState('all');
  const [viewMode, setViewMode]           = useState('grid');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const filtered = activeFilter === 'all'
    ? galleryItems
    : galleryItems.filter((i) => i.category === activeFilter);

  const openLightbox  = (idx) => setLightboxIndex(idx);
  const closeLightbox = ()    => setLightboxIndex(null);
  const prevItem = () => setLightboxIndex((i) => (i - 1 + filtered.length) % filtered.length);
  const nextItem = () => setLightboxIndex((i) => (i + 1) % filtered.length);

  const handleKey = useCallback((e) => {
    if (lightboxIndex === null) return;
    if (e.key === 'ArrowLeft')  prevItem();
    if (e.key === 'ArrowRight') nextItem();
    if (e.key === 'Escape')     closeLightbox();
  }, [lightboxIndex, filtered.length]); // eslint-disable-line

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxIndex]);

  const handleFilterChange = (id) => {
    setActiveFilter(id);
    if (lightboxIndex !== null) closeLightbox();
  };

  const activeLightboxItem = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  return (
    <div className="x_gallery_page">
      <div className="x_gallery_inner">

        {/* ══ HERO ══ */}
        <section className="x_gallery_hero p-0">
          <div className="x_gallery_hero_orb x_gallery_hero_orb_2" />

          <div className="x_gallery_hero_left">
            <div className="x_gallery_hero_label">
              <span className="x_gallery_hero_label_line" />
              <span className="x_gallery_hero_label_text">Curated Collection</span>
            </div>

            <h1 className="x_gallery_headline">
              A feast for<br /><em>the eyes.</em>
            </h1>

            <p className="x_gallery_hero_sub">
              Explore our curated gallery — dishes crafted with care, drinks
              mixed with precision, and spaces designed for the art of dining.
            </p>

            <div className="x_gallery_stats" aria-label="Gallery stats">
              <div className="x_gallery_stats_item">
                <strong>{galleryItems.length}</strong>
                <span>Photos</span>
              </div>
              <div className="x_gallery_stats_item">
                <strong>{filterCategories.length - 1}</strong>
                <span>Sections</span>
              </div>
              <div className="x_gallery_stats_item">
                <strong>{galleryItems.filter((i) => i.featured).length}</strong>
                <span>Featured</span>
              </div>
            </div>
          </div>

          <div className="x_gallery_hero_right">
            <div className="x_gallery_hero_image_grid">
              <div className="x_gallery_hero_img">
                <img src="https://i.pinimg.com/736x/d3/05/07/d3050746a7e1965c5a438ab15a3078e8.jpg" alt="Kitchen" />
              </div>
              <div className="x_gallery_hero_img">
                <img src="https://i.pinimg.com/736x/69/65/c6/6965c665a5ace34c69bdd6224d8ca9f1.jpg" alt="Ambiance" />
              </div>
              <div className="x_gallery_hero_img">
                <img src="https://i.pinimg.com/736x/25/f2/4f/25f24f220b44e23f3718eb6c6e04102a.jpg" alt="Food" />
              </div>
            </div>
          </div>
        </section>

        {/* ══ SECTION HEAD ══ */}
        <div className="x_gallery_section_head">
          <div className="x_gallery_section_title_group">
            <span className="x_gallery_section_num">01</span>
            <h2 className="x_gallery_section_title">
              Our <em>Visual</em> Story
            </h2>
          </div>
        </div>

        {/* ══ FILTERS ══ */}
        <div className="x_gallery_filters">
          <div className="x_gallery_filter_buttons" role="group" aria-label="Filter by category">
            {filterCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`x_gallery_filter_btn${activeFilter === cat.id ? ' active' : ''}`}
                onClick={() => handleFilterChange(cat.id)}
                aria-pressed={activeFilter === cat.id}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="x_gallery_view_toggle" role="group" aria-label="View mode">
            <button
              type="button"
              className={`x_gallery_view_btn${viewMode === 'grid' ? ' active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view" aria-pressed={viewMode === 'grid'} title="Grid view"
            >
              <Grid size={15} />
            </button>
            <button
              type="button"
              className={`x_gallery_view_btn${viewMode === 'list' ? ' active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view" aria-pressed={viewMode === 'list'} title="List view"
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Results bar */}
        <div className="x_gallery_results_bar">
          <span>
            {filtered.length} {filtered.length === 1 ? 'photo' : 'photos'} shown
          </span>
          <strong>
            {filterCategories.find((c) => c.id === activeFilter)?.label}
          </strong>
        </div>

        {/* ══ GRID ══ */}
        <section className="x_gallery_grid_section" aria-label="Gallery images">
          {filtered.length > 0 ? (
            <div className={`x_gallery_grid view_${viewMode}`}>
              {filtered.map((item, idx) => (
                <article
                  key={item.id}
                  className={`x_gallery_item${item.featured && viewMode === 'grid' ? ' featured' : ''}`}
                  onClick={() => openLightbox(idx)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(idx); } }}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${item.title}`}
                >
                  <div className="x_gallery_item_image_wrap">
                    <img src={item.image} alt={item.title} loading="lazy" />
                  </div>

                  <div className="x_gallery_item_badge">{item.tag}</div>

                  <div className="x_gallery_item_overlay" aria-hidden="true">
                    <div className="x_gallery_overlay_title">{item.title}</div>
                    <div className="x_gallery_view_text">
                      <Maximize2 size={12} />
                      View Photo
                    </div>
                  </div>

                  <div className="x_gallery_item_info">
                    <span className="x_gallery_item_info_cat">{item.tag}</span>
                    <h3 className="x_gallery_item_info_title">{item.title}</h3>
                    <p className="x_gallery_item_info_desc">{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="x_gallery_empty">
              <span className="x_gallery_empty_icon" aria-hidden="true">📷</span>
              <h2>No photos found</h2>
              <p>Try a different category filter.</p>
              <button type="button" onClick={() => setActiveFilter('all')}>
                View All Photos
              </button>
            </div>
          )}
        </section>

        {/* ══ LIGHTBOX ══ */}
        {activeLightboxItem && (
          <div
            className="x_gallery_lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`Viewing ${activeLightboxItem.title}`}
            onClick={(e) => { if (e.target === e.currentTarget) closeLightbox(); }}
          >
            <button type="button" className="x_gallery_close" onClick={closeLightbox} aria-label="Close lightbox">
              <X size={18} />
            </button>

            <button
              type="button" className="x_gallery_nav x_gallery_nav_prev"
              onClick={prevItem} aria-label="Previous photo"
              disabled={filtered.length <= 1}
            >
              <ChevronLeft size={22} />
            </button>

            <div className="x_gallery_lightbox_content">
              <div className="x_gallery_lightbox_image_wrap">
                <img
                  src={activeLightboxItem.image}
                  alt={activeLightboxItem.title}
                  key={activeLightboxItem.id}
                />
              </div>
              <div className="x_gallery_lightbox_info">
                <div className="x_gallery_lightbox_info_left">
                  <span className="x_gallery_lightbox_info_cat">{activeLightboxItem.tag}</span>
                  <h3>{activeLightboxItem.title}</h3>
                </div>
              </div>
            </div>

            <button
              type="button" className="x_gallery_nav x_gallery_nav_next"
              onClick={nextItem} aria-label="Next photo"
              disabled={filtered.length <= 1}
            >
              <ChevronRight size={22} />
            </button>

            <div className="x_gallery_lightbox_counter" aria-live="polite">
              {lightboxIndex + 1} / {filtered.length}
            </div>

            <div className="x_gallery_lightbox_hint" aria-hidden="true">
              <span>
                <span className="x_gallery_key">←</span>
                <span className="x_gallery_key">→</span>
                Navigate
              </span>
              <span>
                <span className="x_gallery_key">Esc</span>
                Close
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Gallery;