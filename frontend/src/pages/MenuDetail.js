import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChefHat,
  Clock,
  Info,
  Leaf,
  ShieldCheck,
  Sparkles,
  Star,
  Utensils,
  Flame,
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
  }, [id]);

  if (loading) {
    return (
      <div className="menu_detail_page">
        <div className="menu_detail_inner">
          <div className="menu_detail_state">
            <div className="menu_detail_loader" />
            <p>Loading item...</p>
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

  const typeLabel = Array.isArray(item.type) && item.type.length > 0 ? item.type.join(' / ') : '';
  const isAvailable = !item.status || item.status === 'Available';

  return (
    <div className="menu_detail_page">
      <div className="menu_detail_inner">
        <button type="button" className="menu_detail_back_btn" onClick={() => navigate('/menu')}>
          <ArrowLeft size={16} />
          BACK TO MENU
        </button>

        <div className="menu_detail_grid">
          {/* ── LEFT VISUAL COLUMN ── */}
          <section className="menu_detail_visual">
            <div className="menu_detail_image_wrap">
              {item.image ? (
                <img src={item.image} alt={item.name} />
              ) : (
                <div className="menu_detail_image_fallback">
                  <ChefHat size={54} />
                </div>
              )}
            </div>

            <div className="menu_detail_visual_card">
              <div className="menu_detail_visual_card_text">
                <span className="chef_recommended_label">CHEF RECOMMENDED</span>
                <strong className="chef_recommended_name">{item.name}</strong>
                <div className="chef_recommended_meta">
                  <span>{item.category}</span>
                  <span className="meta_dot">•</span>
                  <span>{item.rating || 4.5} ★</span>
                </div>
              </div>
              <div className="menu_detail_visual_card_badge">
                <ChefHat size={24} />
              </div>
            </div>
          </section>

          {/* ── RIGHT INFO COLUMN ── */}
          <section className="menu_detail_info">
            <div className="menu_detail_category_badge">
              {item.category?.toUpperCase()}
            </div>

            <h1 className="menu_detail_title">{item.name}</h1>
            <p className="menu_detail_tagline">
              {item.description || 'Decadent chocolate cake with a molten center, served with vanilla ice cream.'}
            </p>

            <div className="menu_detail_meta_row">
              <div className="meta_pill">
                <Star size={14} fill="#C9A84C" stroke="#C9A84C" />
                <span>{item.rating || 4.5}</span>
                <span className="meta_reviews">({item.reviews || 45} reviews)</span>
              </div>
              <div className="meta_pill">
                <Clock size={14} />
                <span>{item.prepTime || '18 MIN'}</span>
              </div>
              <div className="meta_pill">
                <Flame size={14} />
                <span>{item.calories || '580 KCAL'}</span>
              </div>
            </div>

            <div className="menu_detail_dietary_row">
              <div className="meta_pill dietary_pill">
                <Leaf size={14} />
                <span>{item.dietary || 'VEGETARIAN'}</span>
              </div>
            </div>

            <div className="menu_detail_price_tag">
              <span className="currency">₹</span>
              <span className="amount">{item.price}</span>
            </div>

            <div className="menu_detail_panels">
              <div className="detail_panel_card story_panel">
                <h2 className="panel_title">THE STORY</h2>
                <p className="panel_content">
                  {item.description || 'A dark-chocolate batter enriched with single-origin Valrhona couverture, baked to yield a perfectly liquid core. Served warm directly from the oven, paired with artisan Madagascar-vanilla bean ice cream and a scattering of seasonal fresh berries.'}
                </p>
              </div>
              
              <div className="detail_panel_card highlights_panel">
                <h2 className="panel_title">HIGHLIGHTS</h2>
                <div className="highlights_grid">
                  {(item.highlights && item.highlights.length > 0 ? item.highlights : ['Molten center', 'Fresh berries', 'Vanilla ice cream', 'Warm serving']).map((h, i) => (
                    <div key={i} className="highlight_item">
                      <span className="highlight_dot">◆</span>
                      {h}
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail_panel_card freshness_panel">
                <div className="freshness_icon_wrap">
                  <Info size={18} />
                </div>
                <div className="freshness_text">
                  <h2 className="panel_title">FRESHNESS PROMISE</h2>
                  <p className="panel_content">
                    All ingredients are sourced daily from local and organic farms wherever possible. 
                    Our kitchen team prepares every dish to order so you always receive it at peak freshness.
                  </p>
                </div>
              </div>
            </div>

            <div className="menu_detail_footer_tags">
              <div className="footer_tag">MADE TO ORDER</div>
              <div className="footer_tag">FRESH INGREDIENTS</div>
              <div className="footer_tag">EST. {item.prepTime || '18 MIN'}</div>
              <div className="footer_tag">CHEF CRAFTED</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MenuDetail;