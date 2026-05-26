import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Heart, ChevronLeft } from 'lucide-react';
import '../styles/menu_style.css';

const MenuDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Menu items data (same as Menu.js)
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
      fullDescription: 'Our Mozzarella Sticks are a classic appetizer loved by all ages—crispy on the outside and irresistibly gooey on the inside. Each stick is made with premium mozzarella cheese, carefully breaded in a seasoned golden crust, then fried to a perfect crunch. The exterior delivers a satisfying crisp with every bite, while the interior melts into a warm, stretchy cheese experience.\n\nWe serve our mozzarella sticks hot and fresh, paired with a rich, house-made marinara sauce for dipping. The tangy tomato flavors balance the creamy cheese, creating a delightful harmony of taste and texture in every mouthful. Whether you\'re starting off a meal or sharing with friends, this appetizer never fails to satisfy.',
      image: 'https://i1-e.pinimg.com/736x/af/b6/de/afb6de59cd10b1c7a31653aab893a7f2.jpg',
      features: ['Crispy exterior', 'Gooey center', 'House marinara', 'Served hot', 'Premium cheese'],
      additionalInfo: 'Great for kids, adults, and everyone in between. Perfect addition to any table. Pairs beautifully with cold beverages.',
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
      fullDescription: 'Indulge in our signature Chocolate Lava Cake—a decadent dessert that promises a moment of pure bliss. This elegantly plated chocolate cake features a carefully crafted molten chocolate center that flows beautifully when you cut into it.\n\nEach cake is baked to order, ensuring that the chocolate center remains perfectly warm and silky. Served alongside a generous scoop of premium vanilla ice cream, the contrast between the warm cake and cold cream creates a textural symphony on your palate.',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=60',
      features: ['Molten center', 'Vanilla ice cream', 'Fresh berries', 'Warm serving', 'Baked to order'],
      additionalInfo: '30 days easy returns. Order yours before 2:30pm for same day dispatch. Perfect for celebrations and special moments.',
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
      fullDescription: 'Wake up your evening with our expertly crafted Espresso Martini. This cocktail brings together the best of two worlds: the rich, bold flavor of freshly pulled espresso and the smoothness of premium spirits.\n\nOur bartenders pull a fresh shot of espresso right into a shaker with premium vodka, coffee liqueur, and just a touch of cream. The result is a sophisticated, velvety cocktail with a gorgeous crema top that captures the essence of coffee without being overwhelming.',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561404?auto=format&fit=crop&w=500&q=60',
      features: ['Fresh espresso', 'Premium vodka', 'Silky texture', 'Coffee liqueur', 'Cream top'],
      additionalInfo: 'Best enjoyed immediately after preparation. Perfect for coffee lovers and cocktail enthusiasts alike.',
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
      fullDescription: 'Start your day right with our beautifully composed Avocado Toast. We begin with thick-cut, perfectly toasted sourdough bread—crusty on the outside and warm on the inside. The canvas is then spread with creamy, ripe avocado that we mash fresh to order with just a hint of lemon and sea salt.\n\nTopping the avocado is a perfectly poached egg with a runny yolk that cascades over the toast when you cut into it. Fresh microgreens add a peppery note and visual appeal, making this not just delicious but Instagram-worthy too.',
      image: 'https://images.unsplash.com/photo-1557804506-669714126472?auto=format&fit=crop&w=500&q=60',
      features: ['Fresh avocado', 'Poached egg', 'Sourdough', 'Microgreens', 'Sea salt'],
      additionalInfo: 'A nutritious and satisfying breakfast option. Vegan option available upon request.',
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
      fullDescription: 'Savor our premium Grilled Salmon—a main course that celebrates the natural flavors of high-quality fish. We source wild-caught Atlantic salmon and grill it to order, achieving a perfectly caramelized exterior while keeping the inside moist and tender.\n\nThe salmon is served with a selection of fresh, seasonal vegetables, grilled to enhance their natural sweetness. A light lemon butter sauce ties everything together, adding richness without overpowering the delicate fish.',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=60',
      features: ['Wild-caught salmon', 'Seasonal veggies', 'Lemon butter sauce', 'Farm-fresh', 'Grilled to order'],
      additionalInfo: 'Sustainably sourced. Rich in omega-3 fatty acids. Perfect for health-conscious diners.',
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
      fullDescription: 'Nourish your body and soul with our vibrant Quinoa Buddha Bowl. This wholesome dish is built on a foundation of fluffy, protein-rich organic quinoa. The bowl is then artfully arranged with roasted seasonal vegetables—each cooked to maintain its texture and natural flavors.\n\nEverything is brought together with our house-made tahini dressing, which adds a nutty, creamy element to the bowl. It\'s a complete meal that\'s as satisfying as it is nutritious, perfect for vegans and vegetarians looking for a complete protein source.',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=60',
      features: ['Organic quinoa', 'Tahini dressing', 'Roasted veggies', 'Vegan option', 'Gluten-free'],
      additionalInfo: 'Complete plant-based protein. High in fiber and nutrients. Customizable vegetable selections available.',
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
      fullDescription: 'Experience the simple elegance of our Garlic Herb Bruschetta. We start with fresh baguette slices that are toasted until crispy on the outside while maintaining a slight tenderness within. The bread is then rubbed with fresh garlic, infusing it with aromatic flavor.\n\nThe topping is a vibrant mixture of ripe, fresh tomatoes, fragrant basil, and extra virgin olive oil. Each piece is a burst of Mediterranean flavors—the sweetness of tomato, the freshness of basil, and the richness of quality oil create a harmonious balance.',
      image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd87282?auto=format&fit=crop&w=500&q=60',
      features: ['Crispy bread', 'Fresh basil', 'Ripe tomatoes', 'Extra virgin oil', 'Garlic rubbed'],
      additionalInfo: 'Best served fresh. A classic Italian appetizer. Perfect for sharing.',
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
      fullDescription: 'Indulge in our luxurious Creamy Mushroom Pasta—a dish that showcases our commitment to handmade quality and fresh ingredients. The pasta is made fresh daily in our kitchen, rolled to the perfect thickness, and cut into beautiful shapes that cradle the creamy sauce.\n\nThe sauce is a masterpiece of flavor: wild mushrooms, sautéed until golden and flavorful, are combined with a velvety cream base infused with Italian herbs. Fresh parmesan cheese is generously scattered on top, adding umami depth to every bite.',
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=500&q=60',
      features: ['House-made pasta', 'Wild mushrooms', 'Fresh cream', 'Italian herbs', 'Parmesan'],
      additionalInfo: 'A vegetarian delight. Rich and comforting. Perfect for cozy dinners.',
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
      fullDescription: 'Discover the elegance of our Vanilla Panna Cotta—an Italian dessert that\'s deceptively simple yet incredibly refined. This silky-smooth custard is made with Madagascar vanilla, known for its rich, complex flavor profile. The texture is so delicate it melts on your tongue like a cloud.\n\nServed chilled and topped with a selection of fresh berries, the tartness of the berries provides a perfect counterpoint to the creamy sweetness of the panna cotta. Each spoonful is a moment of pure indulgence.',
      image: 'https://images.unsplash.com/photo-1488477181946-6e3cc3a63e0c?auto=format&fit=crop&w=500&q=60',
      features: ['Madagascar vanilla', 'Fresh berries', 'Silky texture', 'Handmade', 'Gluten-free'],
      additionalInfo: '30 days easy returns. Order yours before 2:30pm for same day dispatch.',
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
      fullDescription: 'Start your morning or power through your afternoon with our Cold Brew Coffee. Made using only the finest single-origin coffee beans, sourced directly from farmers who share our commitment to quality.\n\nThe beans are steeped in cold water for 18-24 hours, a process that extracts the coffee\'s rich flavors while minimizing acidity. The result is a smooth, naturally sweet coffee that\'s perfect over ice with a splash of milk, or enjoyed straight for those who appreciate bold, complex flavors.',
      image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=500&q=60',
      features: ['Single-origin', 'Cold brewed', 'Smooth taste', 'Zero acidity', 'Sustainable'],
      additionalInfo: 'Perfect for any time of day. Contains more caffeine than regular coffee. Vegan-friendly.',
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
      fullDescription: 'Timeless, refined, and perfect for the discerning drinker—our Old Fashioned is a masterclass in classic cocktail making. We use premium whiskey as the foundation, combined with aromatic bitters and a touch of sugar to create a beautifully balanced drink.\n\nA large ice cube keeps the drink cold without diluting it too quickly, allowing you to savor every sip. The garnish of a fresh orange twist adds a citrus aroma and subtle flavor that complements the whiskey perfectly.',
      image: 'https://images.unsplash.com/photo-1556821552-5f96b9c9d312?auto=format&fit=crop&w=500&q=60',
      features: ['Premium whiskey', 'Aromatic bitters', 'Fresh citrus', 'Large ice', 'House-made syrup'],
      additionalInfo: 'A classic cocktail for whiskey lovers. Best enjoyed slowly. Perfect for celebrations.',
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
      fullDescription: 'Wake up to a stack of our fluffy Buttermilk Pancakes—a breakfast favorite that brings comfort and joy to your plate. Each pancake is made from scratch with real buttermilk, creating a tender crumb with a slight tang that balances the sweetness perfectly.\n\nServed warm and stacked high, they\'re topped with a generous pad of butter that melts into every layer. Real maple syrup drizzled over the top adds natural sweetness and maple flavor. Fresh berries and whipped cream are available upon request for an extra touch of indulgence.',
      image: 'https://images.unsplash.com/photo-1589985643662-4b07111c3b64?auto=format&fit=crop&w=500&q=60',
      features: ['Buttermilk', 'Maple syrup', 'Fresh berries', 'Whipped cream', 'Butter included'],
      additionalInfo: 'Made fresh to order. Perfect for special occasions. Family-friendly. Serves 1-2 people.',
    },
  ];

  const item = menuItems.find((i) => i.id === parseInt(id));

  if (!item) {
    return (
      <main className="menu_detail_page">
        <div className="menu_detail_container">
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h1 style={{ color: '#16302B' }}>Menu item not found</h1>
            <button
              onClick={() => navigate('/menu')}
              style={{
                marginTop: '20px',
                padding: '10px 24px',
                background: '#16302B',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Back to Menu
            </button>
          </div>
        </div>
      </main>
    );
  }

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) setQuantity(value);
  };

  const handleAddToCart = () => {
    alert(`${item.name} x${quantity} added to cart!`);
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  return (
    <main className="menu_detail_page">
      <div className="menu_detail_container">
        {/* Back Button */}
        <button
          className="menu_detail_back"
          onClick={() => navigate('/menu')}
        >
          <ChevronLeft size={18} />
          <span>Back to Menu</span>
        </button>

        {/* Detail Content */}
        <div className="menu_detail_content">
          <div className="menu_detail_grid">
            {/* Image Section */}
            <div className="menu_detail_image">
              <img src={item.image} alt={item.name} />
            </div>

            {/* Info Section */}
            <div className="menu_detail_info">
              <span className="menu_detail_category">{item.category}</span>
              <h1>{item.name}</h1>

              {/* Rating */}
              <div className="menu_detail_rating">
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      fill={i < Math.floor(item.rating) ? '#C9A84C' : '#e2e0da'}
                      color={i < Math.floor(item.rating) ? '#C9A84C' : '#e2e0da'}
                    />
                  ))}
                </div>
                <span style={{ color: '#6b7280' }}>
                  {item.rating} ({item.reviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="menu_detail_price">
                <div className="menu_detail_price_main">₹{item.price}</div>
                {item.originalPrice && (
                  <div className="menu_detail_price_original">₹{item.originalPrice}</div>
                )}
              </div>

              {/* Description */}
              <p className="menu_detail_description">{item.fullDescription}</p>

              {/* Features */}
              <div className="menu_detail_features">
                <h3>What's Inside</h3>
                <ul>
                  {item.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="menu_detail_actions">
                <div className="menu_detail_quantity">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                  />
                  <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
                <button className="menu_detail_add_btn" onClick={handleAddToCart}>
                  Add to Cart
                </button>
                <button
                  className="menu_detail_wishlist_btn"
                  onClick={handleWishlist}
                >
                  <Heart
                    size={18}
                    fill={isWishlisted ? 'currentColor' : 'none'}
                    color={isWishlisted ? '#C9A84C' : '#a8893a'}
                  />
                  {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                </button>
              </div>

              {/* Info Box */}
              <div className="menu_detail_info_box">
                <h4>Important Information</h4>
                <p>{item.additionalInfo}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MenuDetail;
