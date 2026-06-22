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
            <ArrowLeft size={14} />
            BACK TO MENU
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

              <div className="chef_recommended_overlay">
                <div className="chef_recommended_content">
                  <span className="chef_recommended_label">CHEF RECOMMENDED</span>
                  <h3 className="chef_recommended_name">{item.name}</h3>
                  <div className="chef_recommended_meta">
                    <span>{item.category}</span>
                    {item.reviews > 0 && item.rating && (
                      <>
                        <span className="meta_dot">•</span>
                    <span className="meta_rating">{item.rating} ★</span>
                      </>
                    )}
                  </div>
                </div>
                <button className="chef_recommended_icon_btn">
                  <ChefHat size={18} />
                </button>
              </div>
            </div>
          </section>

          {/* ── RIGHT INFO COLUMN ── */}
          <section className="menu_detail_info">
            <div className="menu_detail_header">
              <span className="category_pill">{item.category?.toUpperCase()}</span>
            </div>

            <h1 className="menu_detail_title">{item.name}</h1>
            <p className="short_description">
              {item.shortDescription || `Decadent ${item.name.toLowerCase()} with a premium touch, served fresh for your delight.`}
            </p>

            <div className="menu_detail_stats_row">
              {item.reviews > 0 && item.rating && (
                <div className="stat_pill_v2">
                <div className="stat_stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill={i < Math.floor(item.rating) ? "#C9A84C" : "none"} stroke="#C9A84C" />
                  ))}
                </div>
                <span className="stat_value">{item.rating}</span>
                <span className="stat_reviews">({item.reviews} reviews)</span>
              </div>
              )}
              <div className="stat_pill_v2">
                <Clock size={14} />
                <span className="stat_value">{item.prepTime || '18 MIN'}</span>
              </div>
              <div className="stat_pill_v2">
                <Flame size={14} />
                <span className="stat_value">{item.calories || '580'} KCAL</span>
              </div>
            </div>

            <div className="dietary_row">
              <div className="dietary_pill_v2">
                <Leaf size={12} />
                <span>{'VEGETARIAN'}</span>
              </div>
            </div>
          

            <div className="menu_detail_price_section">
              <span className="currency">₹</span>
              <span className="amount">{item.price}</span>
            </div>

            <div className="detail_card">
              <h4 className="detail_card_title">THE STORY</h4>
              <p className="detail_card_text">
                {item.description || 'Experience a culinary masterpiece crafted with the finest ingredients and passion. Every bite tells a story of tradition and innovation, perfected in our signature open kitchen.'}
              </p>
            </div>

            <div className="detail_card">
              <h4 className="detail_card_title">HIGHLIGHTS</h4>
              <div className="highlights_grid_v2">
                {(item.highlights && item.highlights.length > 0 ? item.highlights : ['Molten center', 'Fresh berries', 'Vanilla ice cream', 'Warm serving']).map((h, i) => (
                  <div key={i} className="highlight_item">
                    <span className="highlight_dot">•</span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="promise_card_v2">
              <div className="promise_icon_v2">
                <Info size={16} />
              </div>
              <div className="promise_content_v2">
                <h4 className="promise_title_v2">FRESHNESS PROMISE</h4>
                <p className="promise_text_v2">
                  All ingredients are sourced daily from local and organic farms wherever possible. Our kitchen team prepares every dish to order so you always receive it at peak freshness.
                </p>
              </div>
            </div>

            <div className="tag_row_v2">
              {['MADE TO ORDER', 'FRESH INGREDIENTS', 'EST. 18 MIN', 'CHEF CRAFTED'].map((tag, i) => (
                <div key={i} className="tag_pill_v2">
                  <div className="tag_dot_v2" />
                  <span>{tag}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MenuDetail;

