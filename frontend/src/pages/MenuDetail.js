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
          Back to Menu
        </button>

        <div className="menu_detail_grid">
          <section className="menu_detail_visual" aria-label={`${item.name} preview`}>
            <div className="menu_detail_image_wrap">
              {item.image ? (
                <img src={item.image} alt={item.name} />
              ) : (
                <div className="menu_detail_image_fallback">
                  <ChefHat size={54} />
                </div>
              )}
              <span className="menu_detail_image_badge">
                <Sparkles size={14} />
                Signature
              </span>
            </div>

            <div className="menu_detail_visual_card">
              <div className="menu_detail_visual_card_text">
                <span>Chef Recommended</span>
                <strong>{item.name}</strong>
                <small>{item.category}{item.cuisine ? ` / ${item.cuisine}` : ''}</small>
              </div>
              <div className="menu_detail_visual_card_badge">
                <ChefHat size={22} />
              </div>
            </div>
          </section>

          <section className="menu_detail_info">
            <div className="menu_detail_topline">
              <span className="menu_detail_category">{item.category}</span>
              {item.status && (
                <span className={`menu_detail_status ${isAvailable ? 'available' : 'sold_out'}`}>
                  {item.status}
                </span>
              )}
            </div>

            <h1>{item.name}</h1>
            <p className="menu_detail_short">{item.description}</p>

            <div className="menu_detail_meta">
              {item.cuisine && (
                <div className="menu_detail_chip">
                  <Info size={13} />
                  {item.cuisine}
                </div>
              )}
              {typeLabel && (
                <div className="menu_detail_chip">
                  <Clock size={13} />
                  {typeLabel}
                </div>
              )}
              {item.rating && (
                <div className="menu_detail_rating">
                  <Star size={14} fill="currentColor" />
                  <span>{item.rating}</span>
                </div>
              )}
            </div>

            <div className="menu_detail_price">
              <span className="menu_detail_price_main">₹{item.price}</span>
            </div>

            <div className="menu_detail_service" aria-label="Dish highlights">
              <span><Utensils size={13} /> Freshly prepared</span>
              <span><Leaf size={13} /> Seasonal ingredients</span>
              <span><ShieldCheck size={13} /> Quality checked</span>
            </div>

            <div className="menu_detail_panels">
              <div className="menu_detail_story">
                <h2>About this dish</h2>
                <p className="menu_detail_description">{item.description}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MenuDetail;