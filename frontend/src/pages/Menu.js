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
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=60',
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
      image: 'https://images.unsplash.com/photo-1557804506-669714126472?auto=format&fit=crop&w=500&q=60',
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
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=60',
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
      image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd87282?auto=format&fit=crop&w=500&q=60',
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
      image: 'https://images.unsplash.com/photo-1488477181946-6e3cc3a63e0c?auto=format&fit=crop&w=500&q=60',
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
      image: 'https://images.unsplash.com/photo-1556821552-5f96b9c9d312?auto=format&fit=crop&w=500&q=60',
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
      image: 'https://images.unsplash.com/photo-1589985643662-4b07111c3b64?auto=format&fit=crop&w=500&q=60',
      features: ['Buttermilk', 'Maple syrup', 'Fresh berries', 'Whipped cream'],
    },
  ];

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'appetizers', label: 'Appetizers' },
    { id: 'mains', label: 'Main Course' },
    { id: 'desserts', label: 'Desserts' },
    { id: 'beverages', label: 'Beverages' },
    { id: 'cocktails', label: 'Cocktails' },
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'salads', label: 'Salads' },
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
    .sort((firstItem, secondItem) => {
      if (sortBy === 'price-low') return firstItem.price - secondItem.price;
      if (sortBy === 'price-high') return secondItem.price - firstItem.price;
      if (sortBy === 'rating') return secondItem.rating - firstItem.rating;
      return firstItem.id - secondItem.id;
    });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCardClick = (itemId) => {
    navigate(`/menu/${itemId}`);
  };

  const handleCardKeyDown = (event, itemId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick(itemId);
    }
  };

  const resetFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setSortBy('featured');
    setCurrentPage(1);
  };

  return (
    <main className="menu_page">
      <div className="menu_container">
        <section className="menu_header">
          <div className="menu_header_copy">
            <span className="menu_eyebrow">Zest kitchen selection</span>
            <h1>Explore flavors made for the table.</h1>
            <p>
              Browse chef-loved plates, cafe classics, chilled drinks, and desserts with quick filters for every mood.
            </p>
            <div className="menu_header_stats" aria-label="Menu highlights">
              <span>{menuItems.length} dishes</span>
              <span>{categories.length - 1} categories</span>
              <span>From {'\u20B9'}65</span>
            </div>
          </div>

          <button
            type="button"
            className="menu_spotlight"
            onClick={() => handleCardClick(featuredItem.id)}
            aria-label={`View featured dish ${featuredItem.name}`}
          >
            <img src={featuredItem.image} alt={featuredItem.name} />
            <span className="menu_spotlight_badge">Chef pick</span>
            <span className="menu_spotlight_content">
              <span>{categoryLabelMap[featuredItem.category]}</span>
              <strong>{featuredItem.name}</strong>
              <small>
                {'\u20B9'}{featuredItem.price} · {featuredItem.rating} rating
              </small>
            </span>
          </button>
        </section>

        <section className="menu_control_panel">
          <div className="menu_tools" aria-label="Menu search and sorting">
            <label className="menu_search">
              <Search size={18} />
              <input
                type="search"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search dishes, drinks, desserts..."
                aria-label="Search menu items"
              />
            </label>

            <label className="menu_sort">
              <span>Sort</span>
              <select value={sortBy} onChange={handleSortChange} aria-label="Sort menu items">
                <option value="featured">Featured</option>
                <option value="rating">Top rated</option>
                <option value="price-low">Price low to high</option>
                <option value="price-high">Price high to low</option>
              </select>
            </label>
          </div>

          <section className="menu_filters" aria-label="Menu categories">
            {categories.map((category) => (
              <button
                type="button"
                key={category.id}
                className={`menu_filter_btn ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category.id)}
                aria-pressed={activeCategory === category.id}
              >
                {category.label}
              </button>
            ))}
          </section>
        </section>

        <div className="menu_results_bar">
          <span>
            Showing {paginatedItems.length} of {filteredItems.length} items
          </span>
          <strong>{categoryLabelMap[activeCategory]}</strong>
        </div>

        {paginatedItems.length > 0 ? (
          <section className="menu_grid">
            {paginatedItems.map((item) => (
              <div
                key={item.id}
                className="menu_card"
                onClick={() => handleCardClick(item.id)}
                onKeyDown={(event) => handleCardKeyDown(event, item.id)}
                role="button"
                tabIndex={0}
                aria-label={`View ${item.name}`}
              >
                <div className="menu_card_image">
                  <img src={item.image} alt={item.name} />
                  <div className="menu_card_badge">
                    {categoryLabelMap[item.category] || item.category}
                  </div>
                </div>
                <div className="menu_card_content">
                  <span className="menu_card_category">
                    {categoryLabelMap[item.category] || item.category}
                  </span>
                  <h3 className="menu_card_title">{item.name}</h3>
                  <p className="menu_card_description">{item.description}</p>
                  <div className="menu_card_footer">
                    <div className="menu_card_prices">
                      <span className="menu_card_price">{'\u20B9'}{item.price}</span>
                      {item.originalPrice && (
                        <span className="menu_card_original_price">
                          {'\u20B9'}{item.originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="menu_card_rating">
                      <Star size={16} fill="currentColor" />
                      <span>
                        {item.rating} ({item.reviews})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        ) : (
          <section className="menu_empty">
            <h2>No menu items found</h2>
            <p>Try another category or search term.</p>
            <button type="button" onClick={resetFilters}>
              Reset filters
            </button>
          </section>
        )}

        {filteredItems.length > 0 && totalPages > 1 && (
          <div className="menu_pagination">
            <button
              type="button"
              className="pagination_btn"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              aria-label="Go to first page"
            >
              <FaArrowLeftLong />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                type="button"
                key={page}
                className={`pagination_btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
                aria-label={`Go to page ${page}`}
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
              aria-label="Go to last page"
            >
              <FaArrowRightLong />
            </button>
          </div>
        )}

        {filteredItems.length > 0 && (
          <span className="pagination_info">
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>
    </main>
  );
};

export default Menu;
