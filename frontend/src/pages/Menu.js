import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import { FaArrowLeftLong, FaArrowRightLong } from 'react-icons/fa6';
import { menuAPI } from '../api';
import { normalizeMenuItem, buildCategoryFilters } from '../utils/menuUtils';
import '../styles/menu_style.css';

const Menu = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const loadMenu = async () => {
      console.log('[Menu Page] Fetching from GET /api/menu (MongoDB zest-cafe)...');
      try {
        setLoading(true);
        const response = await menuAPI.getAll({ status: 'Available' });
        const data = Array.isArray(response.data) ? response.data : [];
        console.log('[Menu Page] Received menu items:', data.length, data);
        setMenuItems(data.map(normalizeMenuItem));
      } catch (error) {
        console.error('[Menu Page] API failed:', error.response?.data || error.message);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };
    loadMenu();
  }, []);

  const categories = useMemo(() => buildCategoryFilters(menuItems), [menuItems]);

  const categoryLabelMap = categories.reduce((labels, category) => {
    labels[category.id] = category.label;
    return labels;
  }, {});

  const featuredItem = menuItems[0];

  const filteredItems = menuItems
    .filter((item) => {
      if (activeCategory === 'all') return true;
      const selected = categories.find((cat) => cat.id === activeCategory);
      return selected?.value ? item.category === selected.value : item.categoryKey === activeCategory;
    })
    .filter((item) => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;
      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        (categoryLabelMap[item.category] || item.category).toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return String(a.name).localeCompare(String(b.name));
    });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  /* ── Handlers ── */
  const handleCategoryChange = (id) => { setActiveCategory(id); setCurrentPage(1); };
  const handleSearchChange = (e) => { setSearchQuery(e.target.value); setCurrentPage(1); };
  const handleSortChange = (e) => { setSortBy(e.target.value); setCurrentPage(1); };
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const handleCardClick = (id) => navigate(`/menu/${id}`);
  const handleCardKeyDown = (e, id) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(id); }
  };
  const resetFilters = () => {
    setActiveCategory('all'); setSearchQuery(''); setSortBy('featured'); setCurrentPage(1);
  };

  return (
    <div className="x_menu_page">
      <div className="x_menu_inner">

        {/* ══════════════════ HERO HEADER ══════════════════ */}
        <section className="x_menu_hero">
          <div className="x_menu_hero_left">
            <div className="x_menu_hero_label">
              <span className="x_menu_hero_label_line" />
              <span className="x_menu_hero_label_text">Zest Kitchen &amp; Bar</span>
            </div>

            <h1 className="x_menu_headline">
              Savour <em>flavours</em><br />
              Crafted to Delight.
            </h1>

            <p className="x_menu_hero_sub">
              Browse chef-loved plates, cafe classics, craft cocktails, and
              desserts — with quick filters for every mood and occasion.
            </p>

            <div className="x_menu_stats" aria-label="Menu highlights">
              <div className="x_menu_stats_item">
                <strong>{menuItems.length}</strong>
                <span>Dishes</span>
              </div>
              <div className="x_menu_stats_item">
                <strong>{categories.length - 1}</strong>
                <span>Categories</span>
              </div>
              <div className="x_menu_stats_item">
                <strong>{menuItems.length ? `₹${Math.min(...menuItems.map((i) => i.price))}` : '—'}</strong>
                <span>Starts at</span>
              </div>
            </div>
          </div>

          <div className="x_menu_hero_right">
            <div className="x_menu_simple_showcase">
              <div className="x_simple_frame">
                <img src={featuredItem?.image} alt="Featured Dish" className="x_simple_main_img" />
                <div className="x_simple_frame_border" />
              </div>

              <div className="x_simple_label">
                <span className="x_simple_tag">Featured Choice</span>
                <h3 className="x_simple_title">{featuredItem?.name || 'Chef Special'}</h3>
              </div>
            </div>
          </div>
        </section>

        {/* ══ SECTION HEAD ══ */}
        <div className="x_gallery_section_head">
          <div className="x_gallery_section_title_group">
            <span className="x_gallery_section_num">01</span>
            <h2 className="x_gallery_section_title">
              Our <em>Culinary</em> Menu
            </h2>
          </div>
        </div>

        {/* ══════════════════ CONTROL PANEL ══════════════════ */}
        <section className="x_menu_controls_section">
          <div className="x_menu_top_controls">
            <div className="x_menu_search_wrap">
              <Search size={18} />
              <input
                type="search"
                className="x_menu_search_input"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search dishes, drinks, desserts…"
                aria-label="Search menu items"
              />
            </div>

            <div className="x_menu_sort_wrap">
              <span className="x_menu_sort_label">Sort By</span>
              <select 
                className="x_menu_sort_select"
                value={sortBy} 
                onChange={handleSortChange} 
                aria-label="Sort menu items"
              >
                <option value="featured">Featured</option>
                <option value="rating">Top Rated</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
              </select>
            </div>
          </div>

          <div className="x_menu_filters_bar">
            <div className="x_menu_filter_buttons" role="group" aria-label="Menu categories">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  className={`x_menu_filter_btn${activeCategory === cat.id ? ' active' : ''}`}
                  onClick={() => handleCategoryChange(cat.id)}
                  aria-pressed={activeCategory === cat.id}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Results bar ── */}
        <div className="x_menu_results_info">
          <span className="x_menu_results_count">Showing {paginatedItems.length} of {filteredItems.length} items</span>
          <strong className="x_menu_active_cat">{categoryLabelMap[activeCategory]}</strong>
        </div>

        {/* ══════════════════ GRID ══════════════════ */}
        {loading ? (
          <section className="x_menu_empty">
            <h2>Loading menu...</h2>
          </section>
        ) : paginatedItems.length > 0 ? (
          <section className="x_menu_grid" aria-label="Menu items">
            {paginatedItems.map((item) => {
              return (
                <article
                  key={item.id}
                  className="x_menu_card"
                  onClick={() => handleCardClick(item.id)}
                  onKeyDown={(e) => handleCardKeyDown(e, item.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${item.name}`}
                >
                  <div className="x_menu_card_img_wrap">
                    <img src={item.image} alt={item.name} loading="lazy" />
                    <div className="x_menu_card_badge">
                      {item.category}
                    </div>
                  </div>

                  <div className="x_menu_card_content">
                    <h3 className="x_menu_card_title">{item.name}</h3>
                    {/* <p className="x_menu_card_desc">{item.description}</p> */}

                    <div className="x_menu_card_footer">
                      <div className="x_menu_.card_price_group">
                        <span className="x_menu_card_price">₹{item.price}</span>
                        {item.originalPrice && (
                          <span className="x_menu_card_orig_price">₹{item.originalPrice}</span>
                        )}
                      </div>
                      <div className="x_menu_card_rating">
                        <Star size={14} fill="currentColor" />
                        <span>{item.rating} ({item.reviews})</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <section className="x_menu_empty">
            <span className="x_menu_empty_icon" aria-hidden="true">🍽</span>
            <h2>No items found</h2>
            <p>Try a different category or search term.</p>
            <button type="button" className="x_menu_reset_btn" onClick={resetFilters}>Reset Filters</button>
          </section>
        )}

        {/* ══════════════════ PAGINATION ══════════════════ */}
        {filteredItems.length > 0 && totalPages > 1 && (
          <nav className="menu_pagination" aria-label="Page navigation">
            <button
              type="button"
              className="pagination_btn"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              aria-label="First page"
            >
              <FaArrowLeftLong size={13} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                type="button"
                key={page}
                className={`pagination_btn${currentPage === page ? ' active' : ''}`}
                onClick={() => handlePageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              className="pagination_btn"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Last page"
            >
              <FaArrowRightLong size={13} />
            </button>
          </nav>
        )}

        {filteredItems.length > 0 && (
          <span className="pagination_info">
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>
    </div>
  );
};

export default Menu;