import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Clock,
  ChefHat,
  Info,
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
          <p>Loading item...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="menu_detail_page">
        <div className="menu_detail_inner">
          <p>{error || 'Item not found.'}</p>
          <button type="button" className="menu_detail_back_btn" onClick={() => navigate('/menu')}>
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="menu_detail_page">
      <div className="menu_detail_inner">
        <button type="button" className="menu_detail_back_btn" onClick={() => navigate('/menu')}>
          <ArrowLeft size={16} />
          Back to Menu
        </button>

        <div className="menu_detail_grid">
          <div className="menu_detail_visual">
            <div className="menu_detail_image_wrap">
              <img src={item.image} alt={item.name} />
            </div>

            <div className="menu_detail_visual_card">
              <div className="menu_detail_visual_card_text">
                <span>Chef Recommended</span>
                <strong>{item.name}</strong>
                <small>{item.category}{item.cuisine ? ` · ${item.cuisine}` : ''}</small>
              </div>
              <div className="menu_detail_visual_card_badge">
                <ChefHat size={22} />
              </div>
            </div>
          </div>

          <div className="menu_detail_info">
            <div className="menu_detail_topline">
              <span className="menu_detail_category">{item.category}</span>
              {item.status && <span className="menu_detail_status">{item.status}</span>}
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
              {Array.isArray(item.type) && item.type.length > 0 && (
                <div className="menu_detail_chip">
                  <Clock size={13} />
                  {item.type.join(' · ')}
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

            <div className="menu_detail_panels">
              <div className="menu_detail_story">
                <h2>About this dish</h2>
                <p className="menu_detail_description">{item.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuDetail;
