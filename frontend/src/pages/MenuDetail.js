import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Clock, Flame, Heart, Leaf, ShoppingBag, ShieldCheck, Star } from 'lucide-react';
import '../styles/menu_style.css';

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
    fullDescription: 'Our Mozzarella Sticks are a classic appetizer loved by all ages. Each stick is made with premium mozzarella, coated in a seasoned golden crust, and fried until crisp outside and gooey inside.\n\nThey arrive hot with house-made marinara sauce, giving every bite a bright tomato finish and a rich cheese pull.',
    image: 'https://i1-e.pinimg.com/736x/af/b6/de/afb6de59cd10b1c7a31653aab893a7f2.jpg',
    features: ['Crispy exterior', 'Gooey center', 'House marinara', 'Served hot', 'Premium cheese'],
    additionalInfo: 'Great for kids, adults, and everyone in between. Perfect addition to any table.',
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
    fullDescription: 'This signature Chocolate Lava Cake is baked for a soft edge and a warm molten center. Cut into it and the chocolate flows into a rich, glossy sauce.\n\nA scoop of vanilla ice cream balances the warmth of the cake with a cool, creamy finish.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=60',
    features: ['Molten center', 'Vanilla ice cream', 'Fresh berries', 'Warm serving', 'Baked to order'],
    additionalInfo: 'Perfect for celebrations and special moments. Best enjoyed fresh.',
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
    fullDescription: 'Our Espresso Martini blends freshly pulled espresso with premium vodka and coffee liqueur for a smooth, bold drink.\n\nIt is shaken cold for a silky texture and finished with a coffee-forward aroma.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561404?auto=format&fit=crop&w=500&q=60',
    features: ['Fresh espresso', 'Premium vodka', 'Silky texture', 'Coffee liqueur', 'Cream top'],
    additionalInfo: 'Best enjoyed immediately after preparation. Perfect for coffee lovers.',
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
    fullDescription: 'Thick-cut sourdough is toasted until crisp, then topped with fresh mashed avocado, lemon, sea salt, and a poached egg.\n\nPeppery microgreens add freshness and make this a bright, satisfying breakfast plate.',
    image: 'https://images.unsplash.com/photo-1557804506-669714126472?auto=format&fit=crop&w=500&q=60',
    features: ['Fresh avocado', 'Poached egg', 'Sourdough', 'Microgreens', 'Sea salt'],
    additionalInfo: 'A nutritious breakfast option. Vegan option available upon request.',
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
    fullDescription: 'Fresh salmon is grilled to order for a caramelized outside and a moist, tender center.\n\nIt is served with seasonal vegetables and a light lemon butter sauce that keeps the plate clean and flavorful.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=60',
    features: ['Wild-caught salmon', 'Seasonal veggies', 'Lemon butter sauce', 'Farm-fresh', 'Grilled to order'],
    additionalInfo: 'Sustainably sourced and rich in omega-3 fatty acids.',
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
    fullDescription: 'Organic quinoa forms the base of this vibrant bowl, layered with roasted vegetables and house tahini dressing.\n\nIt is hearty, colorful, and balanced for a complete plant-based meal.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=60',
    features: ['Organic quinoa', 'Tahini dressing', 'Roasted veggies', 'Vegan option', 'Gluten-free'],
    additionalInfo: 'High in fiber and nutrients. Customizable vegetable selections available.',
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
    fullDescription: 'Crisp baguette slices are rubbed with garlic and topped with ripe tomatoes, basil, and extra virgin olive oil.\n\nIt is a simple, fresh starter with classic Mediterranean flavor.',
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
    fullDescription: 'House-made pasta is tossed with golden mushrooms, fresh cream, Italian herbs, and parmesan.\n\nThe sauce is rich, earthy, and comforting, built to cling to every bite of pasta.',
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
    fullDescription: 'This chilled panna cotta is made with Madagascar vanilla for a delicate, creamy finish.\n\nFresh berries add brightness and a gentle tartness to every spoonful.',
    image: 'https://images.unsplash.com/photo-1488477181946-6e3cc3a63e0c?auto=format&fit=crop&w=500&q=60',
    features: ['Madagascar vanilla', 'Fresh berries', 'Silky texture', 'Handmade', 'Gluten-free'],
    additionalInfo: 'A refined dessert for slow, sweet endings.',
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
    fullDescription: 'Single-origin beans are steeped cold for a smooth, naturally sweet coffee with low acidity.\n\nServe it over ice with milk or enjoy it black for a clean caffeine lift.',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=500&q=60',
    features: ['Single-origin', 'Cold brewed', 'Smooth taste', 'Zero acidity', 'Sustainable'],
    additionalInfo: 'Perfect for any time of day. Vegan-friendly.',
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
    fullDescription: 'Premium whiskey is stirred with bitters and sugar for a smooth classic cocktail.\n\nA large ice cube and fresh orange twist complete the drink with aroma and balance.',
    image: 'https://images.unsplash.com/photo-1556821552-5f96b9c9d312?auto=format&fit=crop&w=500&q=60',
    features: ['Premium whiskey', 'Aromatic bitters', 'Fresh citrus', 'Large ice', 'House-made syrup'],
    additionalInfo: 'A classic cocktail for whiskey lovers. Best enjoyed slowly.',
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
    fullDescription: 'Fluffy buttermilk pancakes are cooked fresh and stacked high with butter and maple syrup.\n\nAdd berries and cream for an extra indulgent breakfast plate.',
    image: 'https://images.unsplash.com/photo-1589985643662-4b07111c3b64?auto=format&fit=crop&w=500&q=60',
    features: ['Buttermilk', 'Maple syrup', 'Fresh berries', 'Whipped cream', 'Butter included'],
    additionalInfo: 'Made fresh to order. Family-friendly. Serves 1-2 people.',
  },
];

const categoryLabels = {
  appetizers: 'Appetizers',
  mains: 'Main Course',
  desserts: 'Desserts',
  beverages: 'Beverages',
  cocktails: 'Cocktails',
  breakfast: 'Breakfast',
  salads: 'Salads',
};

const MenuDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const item = menuItems.find((menuItem) => menuItem.id === Number(id));

  if (!item) {
    return (
      <main className="menu_detail_page">
        <div className="menu_detail_container">
          <section className="menu_detail_not_found">
            <h1>Menu item not found</h1>
            <button type="button" onClick={() => navigate('/menu')}>
              Back to Menu
            </button>
          </section>
        </div>
      </main>
    );
  }

  const saving = item.originalPrice ? item.originalPrice - item.price : 0;

  const handleQuantityChange = (event) => {
    const value = Number(event.target.value);
    if (value > 0) setQuantity(value);
  };

  const handleAddToCart = () => {
    alert(`${item.name} x${quantity} added to cart!`);
  };

  return (
    <main className="menu_detail_page">
      <div className="menu_detail_container">
        <button type="button" className="menu_detail_back" onClick={() => navigate('/menu')}>
          <ChevronLeft size={18} />
          <span>Back to Menu</span>
        </button>

        <div className="menu_detail_content">
          <div className="menu_detail_grid">
            <div className="menu_detail_visual">
              <div className="menu_detail_image">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="menu_detail_visual_card">
                <span>Chef note</span>
                <strong>Made after you order</strong>
                <small>Best served hot from the kitchen.</small>
              </div>
            </div>

            <div className="menu_detail_info">
              <div className="menu_detail_topline">
                <span className="menu_detail_category">
                  {categoryLabels[item.category] || item.category}
                </span>
                {/* {saving > 0 && (
                  <span className="menu_detail_save">Save {'\u20B9'}{saving}</span>
                )} */}
              </div>

              <h1>{item.name}</h1>
              <p className="menu_detail_short">{item.description}</p>

              <div className="menu_detail_meta">
                <div className="menu_detail_rating">
                  <div className="menu_detail_stars">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        size={18}
                        fill={index < Math.floor(item.rating) ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  <span>
                    {item.rating} ({item.reviews} reviews)
                  </span>
                </div>
                <div className="menu_detail_chip">
                  <Clock size={17} />
                  <span>15-20 min</span>
                </div>
                <div className="menu_detail_chip">
                  <Flame size={17} />
                  <span>Kitchen fresh</span>
                </div>
              </div>

              <div className="menu_detail_price">
                <div className="menu_detail_price_main">{'\u20B9'}{item.price}</div>
                {item.originalPrice && (
                  <div className="menu_detail_price_original">{'\u20B9'}{item.originalPrice}</div>
                )}
              </div>

              {/* <div className="menu_detail_order_card">
                <div className="menu_detail_quantity">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    aria-label="Quantity"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button type="button" className="menu_detail_add_btn" onClick={handleAddToCart}>
                  <ShoppingBag size={18} />
                  Add to Cart
                </button>

                <button
                  type="button"
                  className="menu_detail_wishlist_btn"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                  {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                </button>
              </div> */}

              <div className="menu_detail_panels">
                <section className="menu_detail_story">
                  <h2>Dish Story</h2>
                  <p className="menu_detail_description">{item.fullDescription}</p>
                </section>

                <section className="menu_detail_features">
                  <h3>What's Inside</h3>
                  <ul>
                    {item.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </section>
              </div>

              <div className="menu_detail_info_box">
                <ShieldCheck size={20} />
                <div>
                  <h4>Important Information</h4>
                  <p>{item.additionalInfo}</p>
                </div>
              </div>

              <div className="menu_detail_service">
                <span>
                  <Leaf size={17} />
                  Customizable
                </span>
                <span>
                  <Clock size={17} />
                  Same-day kitchen prep
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MenuDetail;
