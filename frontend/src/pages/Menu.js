import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import '../styles/menu_style.css';
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";

const Menu = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const menu_filters = [
    "All Items",
    "Coffee & Tea",
    "Cocktails",
    "Mocktails",
    "Breakfast",
    "Fast Food",
    "Main Course",
    "Desserts",
  ];

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
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561404?auto=format&fit=crop&w=500&q=60',
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

  // Filter items
  const filteredItems =
    activeCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle card click
  const handleCardClick = (itemId) => {
    navigate(`/menu/${itemId}`);
  };

  return (
    <main className="menu_page">
      <div className="menu_container">
        {/* Header */}
        <section className="menu_header">
          <h1>Our Menu</h1>
          <p>Discover our carefully curated selection of cafe favorites, gourmet dishes, and signature cocktails.</p>
        </section>

        {/* Filters */}
        <section className="menu_filters">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`menu_filter_btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.label}
            </button>
          ))}
        </section>

        {/* Menu Grid */}
        <section className="menu_grid">
          {paginatedItems.map((item) => (
            <div
              key={item.id}
              className="menu_card"
              onClick={() => handleCardClick(item.id)}
            >
              <div className="menu_card_image">
                <img src={item.image} alt={item.name} />
                <div className="menu_card_badge">New</div>
              </div>
              <div className="menu_card_content">
                <span className="menu_card_category">{item.category}</span>
                <h3 className="menu_card_title">{item.name}</h3>
                <p className="menu_card_description">{item.description}</p>
                <div className="menu_card_footer">
                  <div className="menu_card_price">₹{item.price}</div>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="menu_pagination">
            <button
              className="pagination_btn"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              <FaArrowLeftLong />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination_btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="pagination_btn"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <FaArrowRightLong />
            </button>

          </div>
        )}
        <span className="pagination_info">
          Page {currentPage} of {totalPages}
        </span>
      </div>
    </main>
  );
};

export default Menu;
