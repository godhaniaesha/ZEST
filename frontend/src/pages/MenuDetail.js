import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Clock,
  Flame,
  Leaf,
  ChefHat,
  Info,
} from 'lucide-react';
import '../styles/menu_style.css';

/* ── Shared menu data (move to a shared file/context in a real project) ── */
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
    longDescription:
      'Our house-made mozzarella sticks are hand-breaded each morning using a signature seasoned crumb blend, then fried to order in premium oil for that perfect shatter on the outside and a gloriously molten, stretchy interior. Served piping hot alongside our slow-cooked tomato-basil marinara.',
    image: 'https://i1-e.pinimg.com/736x/af/b6/de/afb6de59cd10b1c7a31653aab893a7f2.jpg',
    features: ['Crispy exterior', 'Gooey center', 'House marinara', 'Served hot'],
    prepTime: '12 min',
    calories: '420 kcal',
    dietary: 'Vegetarian',
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
    longDescription:
      'A dark-chocolate batter enriched with single-origin Valrhona couverture, baked to yield a perfectly liquid core. Served warm directly from the oven, paired with artisan Madagascar-vanilla bean ice cream and a scattering of seasonal fresh berries.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=60',
    features: ['Molten center', 'Vanilla ice cream', 'Fresh berries', 'Warm serving'],
    prepTime: '18 min',
    calories: '580 kcal',
    dietary: 'Vegetarian',
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
    longDescription:
      'A perfectly balanced marriage of a freshly pulled double espresso shot, premium small-batch vodka, Kahlúa coffee liqueur, and just a whisper of cold cream. Shaken hard over ice to build a luxurious velvety foam, then strained into a chilled coupe. Three espresso beans placed on top by tradition.',
    image: 'https://i.pinimg.com/236x/f0/32/fd/f032fd4462fc1b22415b3878f2ec1009.jpg',
    features: ['Fresh espresso', 'Premium vodka', 'Silky texture', 'Coffee liqueur'],
    prepTime: '5 min',
    calories: '210 kcal',
    dietary: 'Contains alcohol',
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
    longDescription:
      'Stone-baked sourdough, toasted golden, spread generously with hand-mashed Hass avocado seasoned with flaked sea salt, cracked black pepper, and a bright hit of lemon zest. Crowned with a perfectly poached free-range egg and a tangle of peppery house-grown microgreens.',
    image: 'https://images.unsplash.com/photo-1557804506-669714126472?auto=format&fit=crop&w=500&q=60',
    features: ['Fresh avocado', 'Poached egg', 'Sourdough', 'Microgreens'],
    prepTime: '10 min',
    calories: '390 kcal',
    dietary: 'Vegetarian',
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
    longDescription:
      'A generous skin-on Atlantic salmon fillet sourced from sustainable fisheries, marinated in lemon, dill, and garlic, then grilled on a cast-iron grill to achieve perfectly charred edges and a flaky, pink interior. Served with a rotating selection of seasonal farm vegetables and a drizzle of citrus beurre blanc.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=60',
    features: ['Wild-caught salmon', 'Seasonal veggies', 'Lemon butter sauce', 'Farm-fresh'],
    prepTime: '22 min',
    calories: '520 kcal',
    dietary: 'Gluten-free',
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
    longDescription:
      'Fluffy tri-colour quinoa forms the base, layered with slow-roasted sweet potato, charred broccolini, pickled red cabbage, crispy chickpeas, fresh avocado, and a silky house tahini-lemon dressing. Finished with toasted sesame seeds and a drizzle of chilli oil.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=60',
    features: ['Organic quinoa', 'Tahini dressing', 'Roasted veggies', 'Vegan option'],
    prepTime: '15 min',
    calories: '460 kcal',
    dietary: 'Vegan',
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
    longDescription:
      'Sliced sourdough baguette drizzled with extra-virgin olive oil and toasted until deeply golden, then rubbed with a fresh garlic clove. Topped generously with vine-ripened tomatoes, torn fresh basil, and a shower of shaved Parmigiano-Reggiano. A timeless Italian classic executed with care.',
    image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd87282?auto=format&fit=crop&w=500&q=60',
    features: ['Crispy bread', 'Fresh basil', 'Ripe tomatoes', 'Extra virgin oil'],
    prepTime: '8 min',
    calories: '280 kcal',
    dietary: 'Vegetarian',
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
    longDescription:
      'Fresh pappardelle made in-house each morning from 00 flour and free-range eggs, tossed in a deeply umami sauce built on a medley of sautéed wild mushrooms — porcini, shiitake, and chanterelle — deglazed with white wine, finished with double cream and fresh thyme. Topped with shaved truffle and aged Pecorino.',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=500&q=60',
    features: ['House-made pasta', 'Wild mushrooms', 'Fresh cream', 'Italian herbs'],
    prepTime: '20 min',
    calories: '640 kcal',
    dietary: 'Vegetarian',
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
    longDescription:
      'Set overnight with Madagascar Bourbon vanilla beans, our panna cotta achieves a trembling, barely-there set that melts the moment it touches the tongue. Unmoulded tableside and crowned with a vibrant compote of seasonal berries and a dusting of freeze-dried raspberry powder.',
    image: 'https://images.unsplash.com/photo-1488477181946-6e3cc3a63e0c?auto=format&fit=crop&w=500&q=60',
    features: ['Madagascar vanilla', 'Fresh berries', 'Silky texture', 'Handmade'],
    prepTime: 'Ready to serve',
    calories: '310 kcal',
    dietary: 'Vegetarian',
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
    longDescription:
      'Coarsely ground single-origin Ethiopian Yirgacheffe beans steeped in filtered water for 18 hours at a controlled low temperature, yielding a concentrate with natural sweetness, chocolate notes, and virtually zero bitterness. Served over a single large ice cube with optional oat milk.',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=500&q=60',
    features: ['Single-origin', 'Cold brewed', 'Smooth taste', 'Zero acidity'],
    prepTime: 'Ready to serve',
    calories: '15 kcal',
    dietary: 'Vegan',
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
    longDescription:
      'A venerable American classic. Buffalo Trace Kentucky straight bourbon whiskey, a house-made Demerara sugar syrup, and two dashes each of Angostura and orange bitters. Stirred over ice to achieve perfect dilution and temperature, strained over a hand-cut 2-inch crystal ice block, and finished with an expressed orange peel.',
    image: 'https://images.unsplash.com/photo-1556821552-5f96b9c9d312?auto=format&fit=crop&w=500&q=60',
    features: ['Premium whiskey', 'Aromatic bitters', 'Fresh citrus', 'Large ice'],
    prepTime: '6 min',
    calories: '195 kcal',
    dietary: 'Contains alcohol',
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
    longDescription:
      'A stack of four cloud-like buttermilk pancakes made with a touch of vanilla and a whisper of cinnamon. Served with grade-A dark amber maple syrup, a curl of cultured butter, a tumble of seasonal berries, and a cloud of freshly whipped cream. The definitive weekend breakfast.',
    image: 'https://images.unsplash.com/photo-1589985643662-4b07111c3b64?auto=format&fit=crop&w=500&q=60',
    features: ['Buttermilk', 'Maple syrup', 'Fresh berries', 'Whipped cream'],
    prepTime: '16 min',
    calories: '590 kcal',
    dietary: 'Vegetarian',
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

const categoryLabelMap = categories.reduce((acc, c) => { acc[c.id] = c.label; return acc; }, {});

/* ── Star renderer ── */
const Stars = ({ rating }) =>
  Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      size={14}
      fill={i < Math.floor(rating) ? 'currentColor' : 'none'}
      strokeWidth={1.5}
    />
  ));

/* ═══════════════════════════════════════════════════════════
   MENU DETAIL PAGE
   ═══════════════════════════════════════════════════════════ */
const MenuDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const item = menuItems.find((m) => m.id === parseInt(id, 10));

  if (!item) {
    return (
      <div className="menu_detail_page">
        <div className="menu_detail_container">
          <div className="menu_detail_not_found">
            <span style={{ fontSize: 56, opacity: 0.25, display: 'block', marginBottom: 20 }}>🍽</span>
            <h1>Dish Not Found</h1>
            <p>This item may have been removed from our menu.</p>
            <button type="button" onClick={() => navigate('/menu')}>
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  const savePercent =
    item.originalPrice
      ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
      : 0;

  return (
    <div className="menu_detail_page">
      <div className="menu_detail_container">

        {/* ── Back ── */}
        <button
          type="button"
          className="menu_detail_back"
          onClick={() => navigate('/menu')}
          aria-label="Back to menu"
        >
          <ArrowLeft size={14} />
          Back to Menu
        </button>

        {/* ══════════ MAIN GRID ══════════ */}
        <div className="menu_detail_grid">

          {/* ─── LEFT: Visual column ─── */}
          <div className="menu_detail_visual">
            <div className="menu_detail_image">
              <img src={item.image} alt={item.name} />
            </div>

            {/* Info card */}
            <div className="menu_detail_visual_card">
              <div className="menu_detail_visual_card_text">
                <span>Chef Recommended</span>
                <strong>{item.name}</strong>
                <small>
                  {categoryLabelMap[item.category]} &nbsp;·&nbsp; {item.rating} ★
                </small>
              </div>
              <div className="menu_detail_visual_card_badge">
                <ChefHat size={22} />
              </div>
            </div>
          </div>

          {/* ─── RIGHT: Info column ─── */}
          <div className="menu_detail_info">

            {/* Topline */}
            <div className="menu_detail_topline">
              <span className="menu_detail_category">
                {categoryLabelMap[item.category]}
              </span>
            </div>

            <h1>{item.name}</h1>
            <p className="menu_detail_short">{item.description}</p>

            {/* Meta chips */}
            <div className="menu_detail_meta">
              <div className="menu_detail_rating">
                <div className="menu_detail_stars">
                  <Stars rating={item.rating} />
                </div>
                <span>{item.rating}</span>
                <span style={{ fontSize: 12, color: 'var(--d-text-light)', fontFamily: 'DM Sans' }}>
                  ({item.reviews} reviews)
                </span>
              </div>

              <div className="menu_detail_chip">
                <Clock size={13} />
                {item.prepTime}
              </div>

              <div className="menu_detail_chip">
                <Flame size={13} />
                {item.calories}
              </div>

              <div className="menu_detail_chip">
                <Leaf size={13} />
                {item.dietary}
              </div>
            </div>

            {/* Price */}
            <div className="menu_detail_price">
              <span className="menu_detail_price_main">₹{item.price}</span>

            </div>

            {/* Panels */}
            <div className="menu_detail_panels">
              <div className="menu_detail_story">
                <h2>The Story</h2>
                <p className="menu_detail_description">{item.longDescription}</p>
              </div>

              <div className="menu_detail_features">
                <h3>Highlights</h3>
                <ul>
                  {item.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Info box */}
            <div className="menu_detail_info_box">
              <Info size={18} />
              <div>
                <h4>Freshness Promise</h4>
                <p>
                  All ingredients are sourced daily from local and organic farms wherever possible.
                  Our kitchen team prepares every dish to order so you always receive it at peak freshness.
                </p>
              </div>
            </div>

            {/* Service badges */}
            <div className="menu_detail_service">
              <span><Flame size={13} /> Made to Order</span>
              <span><Leaf size={13} /> Fresh Ingredients</span>
              <span><Clock size={13} /> Est. {item.prepTime}</span>
              <span><ChefHat size={13} /> Chef Crafted</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuDetail;