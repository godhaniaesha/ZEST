import React, { useState, useEffect } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import {
  MdLocalBar, MdAdd, MdSearch, MdFilterList,
  MdWineBar, MdSportsBar, MdWineBar as MdWine, MdEdit, MdDelete
} from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';
import { menuAPI, categoriesAPI } from '../../../api';
import { useAuth } from '../../../contexts/AuthContext';

const FORM_SKIP_KEYS = ['_id', '__v', 'createdAt', 'updatedAt', 'type'];

const itemHasType = (item, target) => {
  const types = Array.isArray(item?.type) ? item.type : item?.type ? [item.type] : [];
  return types.includes(target);
};

export default function Bar() {
  const [drinks, setDrinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '', category: '', cuisine: 'International', price: '', available: true,
    description: '', ingredients: '', alcoholContent: '', prepTime: 5,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { user } = useAuth();
  const userRole = user?.role || 'bartender';

  const canAddEditDelete = userRole === 'chef' || userRole === 'manager' || userRole === 'superadmin' || userRole === 'bartender';

  const loadData = async () => {
    try {
      setLoading(true);
      const [menuRes, catRes] = await Promise.all([
        menuAPI.getAll(),
        categoriesAPI.getAll()
      ]);
      
      const data = Array.isArray(menuRes.data) ? menuRes.data : [];
      setDrinks(data.filter(i => itemHasType(i, 'Bar')));
      
      const allCats = catRes.data || [];
      setCategories(['All', ...allCats.filter(c => c.type === 'Bar').map(c => c.name)]);
    } catch (error) {
      console.error(error);
      setDrinks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = drinks.filter(item => {
    const matchesCategory = active === 'All' || item.category === active;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAdd = () => {
    setCurrentItem(null);
    setFormData({ name: '', category: categories[1] || '', price: '', available: true, description: '', ingredients: '', alcoholContent: '', prepTime: 5 });
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: String(item.price).replace('₹', ''),
      available: item.status === 'Available',
      description: item.description || '',
      ingredients: item.ingredients || '',
      alcoholContent: item.alcoholContent || '',
      prepTime: item.prepTime || 5
    });
    setShowForm(true);
  };

  const handleDeleteClick = (item) => {
    setCurrentItem(item);
    setShowDelete(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      alert('Please fill in all required fields (Name, Price, Category)');
      return;
    }
    if (parseFloat(formData.price) <= 0) {
      alert('Price must be greater than 0');
      return;
    }
    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('price', formData.price);
    data.append('status', formData.available ? 'Available' : 'Sold Out');
    data.append('type', 'Bar');
    data.append('cuisine', 'International');
    data.append('description', formData.description || '');
    data.append('ingredients', formData.ingredients || '');
    data.append('alcoholContent', formData.alcoholContent || '');
    data.append('prepTime', formData.prepTime || 5);

    try {
      if (currentItem) {
        await menuAPI.update(currentItem._id, data);
      } else {
        data.append('color', '#2ecc71');
        await menuAPI.create(data);
      }
      await loadData();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving drink:', error);
      alert('Failed to save drink');
    }
  };

  const confirmDelete = async () => {
    try {
      await menuAPI.delete(currentItem._id);
      await loadData();
      setShowDelete(false);
    } catch (error) {
      console.error(error);
    }
  };

  const getIcon = (cat) => {
    switch (cat) {
      case 'Beer':
        return <MdSportsBar />;
      case 'Wine':
        return <MdWine />;
      case 'Cocktail':
      default:
        return <MdLocalBar />;
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdLocalBar /> Bar & Beverage Management
          </div>
          <div className="d-page-sub">Curate your premium spirits and cocktail collection</div>
        </div>
        <div className="d-flex gap-2">
          {canAddEditDelete && (
            <button className="d-btn-gold" onClick={handleAdd}>
              <MdAdd /> Add New Drink
            </button>
          )}
        </div>
      </div>

      <Row className="g-3 mb-4">
        <Col xs={12} lg={8}>
          <div className="d-flex gap-2 flex-wrap">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setActive(c)}
                style={{
                  padding: '8px 16px',
                  border: '1.5px solid var(--d-border)',
                  borderRadius: 'var(--d-radius-md)',
                  background: active === c ? 'var(--d-primary)' : 'var(--d-white)',
                  color: active === c ? 'var(--d-white)' : 'var(--d-text-muted)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'var(--d-transition)'
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </Col>
        <Col xs={12} lg={4}>
          <div className="d-navbar-search-box w-100 m-0">
            <MdSearch className="d-search-icon" />
            <input
              type="text"
              placeholder="Search spirits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Col>
      </Row>

      <div className="d-section-sub mb-3">
        {filtered.length} {filtered.length === 1 ? 'drink' : 'drinks'} found
      </div>

      <Row className="g-3">
        {filtered.map((d, i) => (
          <Col key={d._id} xs={12} sm={6} xl={4}>
            <div className="d-card h-100">
              <div className="d-flex gap-3">
                {d.img ? (
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: 'var(--d-radius-md)',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    <img src={d.img} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: 'var(--d-radius-md)',
                    background: `${d.color || '#3498db'}15`,
                    color: d.color || '#3498db',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    flexShrink: 0
                  }}>
                    {getIcon(d.category)}
                  </div>
                )}
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <h5 className="d-section-title mb-0" style={{ fontSize: '1rem' }}>{d.name}</h5>
                    {canAddEditDelete && (
                      <div className="d-flex gap-1">
                        <button
                          className="d-navbar-icon-btn"
                          onClick={() => handleEdit(d)}
                          style={{ width: '28px', height: '28px', fontSize: '1rem' }}
                        >
                          <MdEdit />
                        </button>
                        <button
                          className="d-navbar-icon-btn text-danger"
                          onClick={() => handleDeleteClick(d)}
                          style={{ width: '28px', height: '28px', fontSize: '1rem' }}
                        >
                          <MdDelete />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="d-page-sub mb-1">{d.category}{d.alcoholContent && <span className="ml-2" style={{ fontSize: '0.8rem' }}>• {d.alcoholContent}</span>}</div>
                  {d.description && <div className="text-muted small mb-2" style={{ fontSize: '0.8rem' }}>{d.description}</div>}
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--d-primary)', fontFamily: 'Playfair Display' }}>
                        ₹{d.price}
                      </span>
                      {d.prepTime && (
                        <span className="text-muted small ml-2" style={{ fontSize: '0.8rem' }}>
                          • {d.prepTime} mins
                        </span>
                      )}
                    </div>
                    <span className={`d-chip ${d.status === 'Available' ? 'd-chip-green' : 'd-chip-red'}`}>
                      {d.status === 'Available' ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <FormModal
        show={showForm}
        onHide={() => setShowForm(false)}
        title={currentItem ? "Edit Drink" : "Add New Drink"}
        onSubmit={handleSave}
      >
        <Row className="g-3">
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-bold">Drink Name *</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="e.g. Classic Mojito"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Category *</Form.Label>
              <Form.Select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="">Select Category</option>
                {categories.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Price (₹) *</Form.Label>
              <Form.Control 
                type="number" 
                placeholder="0"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={4}>
            <Form.Group>
              <Form.Label className="small fw-bold">Alcohol Content</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="e.g. 12%"
                value={formData.alcoholContent}
                onChange={(e) => setFormData({...formData, alcoholContent: e.target.value})}
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={4}>
            <Form.Group>
              <Form.Label className="small fw-bold">Prep Time (mins)</Form.Label>
              <Form.Control 
                type="number" 
                placeholder="5"
                value={formData.prepTime}
                onChange={(e) => setFormData({...formData, prepTime: parseInt(e.target.value) || 5})}
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={4}>
            <Form.Group>
              <Form.Label className="small fw-bold">Availability</Form.Label>
              <Form.Select 
                value={formData.available ? 'In Stock' : 'Out of Stock'}
                onChange={(e) => setFormData({...formData, available: e.target.value === 'In Stock'})}
              >
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-bold">Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2}
                placeholder="Brief description of the drink..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-bold">Ingredients</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2}
                placeholder="List of ingredients..."
                value={formData.ingredients}
                onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
              />
            </Form.Group>
          </Col>
        </Row>
      </FormModal>

      <DeleteModal
        show={showDelete}
        onHide={() => setShowDelete(false)}
        onDelete={confirmDelete}
        itemName={currentItem?.name}
      />
    </>
  );
}
