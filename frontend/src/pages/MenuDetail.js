import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChefHat,
  Clock,
  Info,
  Leaf,
  Star,
  Flame,
  Zap,
  CheckCircle2,
  Share2,
  Heart
} from 'lucide-react';
import { menuAPI } from '../api';
import { normalizeMenuItem } from '../utils/menuUtils';
import '../styles/menu_style.css';

const MenuDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const loadItem = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await menuAPI.getById(id);
        setItem(normalizeMenuItem(response.data));
      } catch (err) {
        setError('Menu item not found.');
      } finally {
        setLoading(false);
      }
    };

    loadItem();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="menu_detail_page">
        <div className="menu_detail_inner">
          <div className="menu_detail_state">
            <div className="menu_detail_loader" />
            <p>Crafting your dish details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="menu_detail_page">
        <div className="menu_detail_inner">
          <div className="menu_detail_state menu_detail_state_card">
            <h1>{error || 'Item not found.'}</h1>
            <p>The dish you are looking for is not available right now.</p>
            <button type="button" className="menu_detail_back_btn" onClick={() => navigate('/menu')}>
              <ArrowLeft size={16} />
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAvailable = !item.status || item.status === 'Available';

  return (
    <div className="menu_detail_page">
      <div className="menu_detail_inner">
        <div className="menu_detail_top_nav">
          <button type="button" className="menu_detail_back_btn" onClick={() => navigate('/menu')}>
            <ArrowLeft size={16} />
            BACK TO EXPLORE
          </button>
        </div>

        <div className="menu_detail_grid">
          {/* ── LEFT VISUAL COLUMN ── */}
          <section className="menu_detail_visual">
            <div className="menu_detail_image_container">
              <div className="menu_detail_image_wrap">
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <div className="menu_detail_image_fallback">
                    <ChefHat size={80} strokeWidth={1} />
                  </div>
                )}
                {!isAvailable && <div className="sold_out_overlay">SOLD OUT</div>}
              </div>

              <div className="menu_detail_visual_floating_card">
                <div className="floating_card_icon">
                  <Zap size={20} fill="var(--d-gold)" color="var(--d-gold)" />
                </div>
                <div className="floating_card_text">
                  <strong>Freshly Prepared</strong>
                  <span>Made to your order</span>
                </div>
              </div>
            </div>

            <div className="chef_note_card">
              <div className="chef_avatar">
                <ChefHat size={24} />
              </div>
              <div className="chef_note_content">
                <span className="chef_label">CHEF'S SPECIAL SELECTION</span>
                <p>"This dish represents the core of Zest—bold flavors meet artisan techniques."</p>
              </div>
            </div>
          </section>

          {/* ── RIGHT INFO COLUMN ── */}
          <section className="menu_detail_info">
            <div className="menu_detail_header">
              <span className="category_tag">{item.category?.toUpperCase()}</span>
              <div className="availability_status">
                <span className={`status_dot ${isAvailable ? 'available' : 'unavailable'}`}></span>
                {isAvailable ? 'Available Now' : 'Currently Unavailable'}
              </div>
            </div>

            <h1 className="menu_detail_title">{item.name}</h1>

            <div className="menu_detail_stats_row">
              <div className="stat_pill">
                <Star size={16} fill="#C9A84C" stroke="#C9A84C" />
                <span className="stat_value">{item.rating || 4.5}</span>
                <span className="stat_label">({item.reviews || 45} Reviews)</span>
              </div>
              <div className="stat_pill">
                <Clock size={16} />
                <span className="stat_value">{item.prepTime || '18 MIN'}</span>
              </div>
              <div className="stat_pill">
                <Flame size={16} />
                <span className="stat_value">{item.calories || '580'}</span>
                <span className="stat_label">KCAL</span>
              </div>
            </div>

            <div className="menu_detail_description_section">
              <p className="main_description">
                {item.description || 'Experience a culinary masterpiece crafted with the finest ingredients and passion. Every bite tells a story of tradition and innovation.'}
              </p>

              <div className="dietary_badges">
                <div className="dietary_badge">
                  <Leaf size={14} />
                  <span>{item.dietary || 'VEGETARIAN'}</span>
                </div>
                {item.spicy && (
                  <div className="dietary_badge spicy">
                    <Flame size={14} />
                    <span>SPICY</span>
                  </div>
                )}
              </div>
            </div>

            <div className="menu_detail_price_box">
              <div className="price_label">Premium Selection</div>
              <div className="price_value">
                <span className="currency">₹</span>
                <span className="amount">{item.price}</span>
              </div>
            </div>

            <div className="menu_detail_features">
              <h3 className="features_title">Why You'll Love It</h3>
              <div className="features_grid">
                {(item.highlights && item.highlights.length > 0 ? item.highlights : ['Artisan Ingredients', 'Chef Crafted', 'Seasonal Flavors', 'Perfectly Balanced']).map((h, i) => (
                  <div key={i} className="feature_item">
                    <CheckCircle2 size={16} className="feature_icon" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="menu_detail_promise">
              <div className="promise_icon">
                <Info size={20} />
              </div>
              <div className="promise_text">
                <h4>OUR FRESHNESS PROMISE</h4>
                <p>Sourced daily from local organic farms. Prepared to order in our signature open kitchen.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MenuDetail;