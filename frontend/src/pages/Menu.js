import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import { FaArrowLeftLong, FaArrowRightLong } from 'react-icons/fa6';
import '../styles/menu_style.css';

const Menu = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const menuItems = [
    {
      id: 1,
      name: 'Mozzarella Sticks',
      category: 'appetizers',
      price: 129,
      originalPrice: 149,
      rating: 4.8,
      reviews: 20,
      description: 'Golden-fried mozzarella sticks served with warm, zesty marinara dipping sauce.',
      image: 'https://i1-e.pinimg.com/736x/af/b6/de/afb6de59cd10b1c7a31653aab893a7f2.jpg',
      features: ['Crispy exterior', 'Gooey center', 'House marinara', 'Served hot'],
    },
    {
      id: 2,
      name: 'Chocolate Lava Cake',
      category: 'desserts',
      price: 95,
      originalPrice: 120,
      rating: 4.9,
      reviews: 45,
      description: 'Decadent chocolate cake with a molten center, served with vanilla ice cream.',
      image: 'https://i.pinimg.com/736x/57/e5/4d/57e54d7e755532472a4b6e043f7e1063.jpg',
      features: ['Molten center', 'Vanilla ice cream', 'Fresh berries', 'Warm serving'],
    },
    {
      id: 3,
      name: 'Espresso Martini',
      category: 'cocktails',
      price: 185,
      originalPrice: 200,
      rating: 4.7,
      reviews: 32,
      description: 'Bold espresso blended with vodka, coffee liqueur, and a touch of cream.',
      image: 'https://i.pinimg.com/236x/f0/32/fd/f032fd4462fc1b22415b3878f2ec1009.jpg',
      features: ['Fresh espresso', 'Premium vodka', 'Silky texture', 'Coffee liqueur'],
    },
    {
      id: 4,
      name: 'Avocado Toast',
      category: 'breakfast',
      price: 145,
      originalPrice: 165,
      rating: 4.6,
      reviews: 28,
      description: 'Creamy avocado spread on sourdough toast, topped with poached egg and microgreens.',
      image: 'https://i.pinimg.com/1200x/82/5b/5f/825b5fbe4b2ee16c331b85faa4e4e96d.jpg',
      features: ['Fresh avocado', 'Poached egg', 'Sourdough', 'Microgreens'],
    },
    {
      id: 5,
      name: 'Grilled Salmon',
      category: 'mains',
      price: 320,
      originalPrice: 350,
      rating: 4.8,
      reviews: 38,
      description: 'Fresh Atlantic salmon grilled to perfection, served with seasonal vegetables.',
      image: 'https://i.pinimg.com/736x/98/ac/33/98ac33e3d8a4abc19ccc51fee76815dd.jpg',
      features: ['Wild-caught salmon', 'Seasonal veggies', 'Lemon butter sauce', 'Farm-fresh'],
    },
    {
      id: 6,
      name: 'Quinoa Buddha Bowl',
      category: 'salads',
      price: 135,
      originalPrice: 160,
      rating: 4.5,
      reviews: 22,
      description: 'Nutritious bowl with quinoa, roasted vegetables, and tahini dressing.',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=60',
      features: ['Organic quinoa', 'Tahini dressing', 'Roasted veggies', 'Vegan option'],
    },
    {
      id: 7,
      name: 'Garlic Herb Bruschetta',
      category: 'appetizers',
      price: 89,
      originalPrice: 110,
      rating: 4.7,
      reviews: 30,
      description: 'Toasted baguette topped with fresh tomatoes, garlic, and basil.',
      image: 'https://i.pinimg.com/1200x/a6/b9/48/a6b94869d38aaa95c6b3e06f0067f294.jpg',
      features: ['Crispy bread', 'Fresh basil', 'Ripe tomatoes', 'Extra virgin oil'],
    },
    {
      id: 8,
      name: 'Creamy Mushroom Pasta',
      category: 'mains',
      price: 245,
      originalPrice: 280,
      rating: 4.9,
      reviews: 51,
      description: 'Handmade pasta in a rich mushroom and cream sauce with fresh herbs.',
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=500&q=60',
      features: ['House-made pasta', 'Wild mushrooms', 'Fresh cream', 'Italian herbs'],
    },
    {
      id: 9,
      name: 'Vanilla Panna Cotta',
      category: 'desserts',
      price: 110,
      originalPrice: 135,
      rating: 4.8,
      reviews: 35,
      description: 'Silky smooth Italian custard dessert topped with fresh berries.',
      image: 'https://i.pinimg.com/1200x/65/90/55/659055b6f165eae21bc7d7ae94679079.jpg',
      features: ['Madagascar vanilla', 'Fresh berries', 'Silky texture', 'Handmade'],
    },
    {
      id: 10,
      name: 'Cold Brew Coffee',
      category: 'beverages',
      price: 65,
      originalPrice: 85,
      rating: 4.6,
      reviews: 42,
      description: 'Smooth, rich cold brew made with single-origin coffee beans.',
      image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=500&q=60',
      features: ['Single-origin', 'Cold brewed', 'Smooth taste', 'Zero acidity'],
    },
    {
      id: 11,
      name: 'Old Fashioned',
      category: 'cocktails',
      price: 195,
      originalPrice: 220,
      rating: 4.8,
      reviews: 28,
      description: 'Classic whiskey cocktail with bitters, sugar, and a twist of orange.',
      image: 'https://i.pinimg.com/736x/8b/85/e1/8b85e197acf19d09663503ad760ce36a.jpg',
      features: ['Premium whiskey', 'Aromatic bitters', 'Fresh citrus', 'Large ice'],
    },
    {
      id: 12,
      name: 'Pancakes Stack',
      category: 'breakfast',
      price: 155,
      originalPrice: 185,
      rating: 4.7,
      reviews: 39,
      description: 'Fluffy buttermilk pancakes stacked high, served with maple syrup and butter.',
      image: 'https://i.pinimg.com/736x/bd/71/aa/bd71aac12befc1d2e1280f3a37dba04b.jpg',
      features: ['Buttermilk', 'Maple syrup', 'Fresh berries', 'Whipped cream'],
    },
  ];

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'appetizers', label: 'Appetizers' },
    { id: 'salads', label: 'Salads' },
    { id: 'desserts', label: 'Desserts' },
    { id: 'mains', label: 'Main Course' },
    { id: 'beverages', label: 'Beverages' },
    { id: 'cocktails', label: 'Cocktails' },
    { id: 'breakfast', label: 'Breakfast' },
  ];

  const categoryLabelMap = categories.reduce((labels, category) => {
    labels[category.id] = category.label;
    return labels;
  }, {});

  const featuredItem = menuItems.find((item) => item.id === 8) || menuItems[0];

  const filteredItems = menuItems
    .filter((item) => activeCategory === 'all' || item.category === activeCategory)
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
      if (sortBy === 'rating') return b.rating - a.rating;
      return a.id - b.id;
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
                <strong>₹65</strong>
                <span>Starts at</span>
              </div>
            </div>
          </div>

          <div className="x_menu_hero_right">
            <div className="x_menu_simple_showcase">
              <div className="x_simple_frame">
                <div 
                  className="x_simple_main_img" 
                  style={{ 
                    backgroundImage: `url(${menuItems[7]?.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }} 
                  role="img" 
                  aria-label="Featured Dish" 
                />
                <div className="x_simple_frame_border" />
              </div>

              <div className="x_simple_label">
                <span className="x_simple_tag">Featured Choice</span>
                <h3 className="x_simple_title">{menuItems[7]?.name}</h3>
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
        {paginatedItems.length > 0 ? (
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
                      {categoryLabelMap[item.category] || item.category}
                    </div>
                  </div>

                  <div className="x_menu_card_content">
                    <h3 className="x_menu_card_title">{item.name}</h3>
                    <p className="x_menu_card_desc">{item.description}</p>

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