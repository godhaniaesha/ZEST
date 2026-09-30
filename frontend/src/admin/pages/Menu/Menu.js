import React, { useState, useEffect } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import {
  MdAdd, MdEdit, MdDelete, MdSearch, MdFilterList,
  MdLocalCafe, MdRestaurant, MdLocalBar, MdIcecream
} from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';
import { menuAPI, categoriesAPI, cuisinesAPI } from '../../../api';
import { useAuth } from '../../../contexts/AuthContext';

const FORM_SKIP_KEYS = ['_id', '__v', 'createdAt', 'updatedAt', 'type'];

const itemHasType = (item, target) => {
  const types = Array.isArray(item?.type) ? item.type : item?.type ? [item.type] : [];
  return types.includes(target);
};

export default function Menu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [active, setActive] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '', category: '', price: '', status: 'Available', type: 'Cafe',
    cuisine: '', description: '', prepTime: 15, ingredients: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { user } = useAuth();
  const userRole = user?.role || 'chef';

  const canAddEditDelete = userRole === 'manager' || userRole === 'superadmin';

  const loadData = async () => {
    try {
      setLoading(true);
      const [menuRes, catRes, cuiRes] = await Promise.all([
        menuAPI.getAll(),
        categoriesAPI.getAll(),
        cuisinesAPI.getAll()
      ]);

      const data = Array.isArray(menuRes.data) ? menuRes.data : [];
      setItems(data.filter(i => itemHasType(i, 'Cafe')));

      const allCats = catRes.data || [];
      setCategories([{ name: 'All', icon: <MdFilterList /> }, ...allCats.filter(c => c.type === 'Cafe').map(c => ({ name: c.name, icon: <MdRestaurant />, type: 'Cafe' }))]);
      setCuisines((cuiRes.data || []).map(c => c.name));
    } catch (error) {
      console.error('Error fetching data:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = items.filter(item => {
    const matchesCategory = active === 'All' || item.category === active;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAdd = () => {
    setCurrentItem(null);
    setFormData({ name: '', category: categories[1]?.name || '', price: '', status: 'Available', type: 'Cafe', cuisine: cuisines[0] || '', description: '', prepTime: 15, ingredients: '' });
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: String(item.price).replace('₹', '').replace(',', ''),
      status: item.status,
      type: item.type || 'Cafe',
      cuisine: item.cuisine || '',
      description: item.description || '',
      prepTime: item.prepTime || 15,
      ingredients: item.ingredients || ''
    });
    setImageFile(null);
    setImagePreview(item.img || null);
    setShowForm(true);
  };

  const handleDeleteClick = (item) => {
    setCurrentItem(item);
    setShowDelete(true);
  };

  const handleSave = async () => {
    try {
      // Name validation
      if (!formData.name || !formData.name.trim()) {
        alert('Please enter an item name');
        return;
      }

      if (formData.name.length < 3) {
        alert('Item name must be at least 3 characters long');
        return;
      }

      if (formData.name.length > 100) {
        alert('Item name must not exceed 100 characters');
        return;
      }

      if (!/^[a-zA-Z0-9\s\-.,'&]+$/.test(formData.name)) {
        alert('Item name can only contain letters, numbers, spaces, and basic punctuation');
        return;
      }

      // Category validation
      if (!formData.category) {
        alert('Please select a category');
        return;
      }

      // Price validation
      if (!formData.price || formData.price === '') {
        alert('Please enter a price');
        return;
      }

      const price = parseFloat(formData.price);

      if (isNaN(price)) {
        alert('Price must be a valid number');
        return;
      }

      if (price <= 0) {
        alert('Price must be greater than 0');
        return;
      }

      if (price > 999999) {
        alert('Price must not exceed 999,999');
        return;
      }

      if (!/^\d+(\.\d{1,2})?$/.test(formData.price.toString())) {
        alert('Price can have at most 2 decimal places');
        return;
      }

      // Prep time validation
      if (formData.prepTime && formData.prepTime !== '') {
        const prepTime = parseInt(formData.prepTime, 10);

        if (isNaN(prepTime)) {
          alert('Prep time must be a valid number');
          return;
        }

        if (prepTime < 0) {
          alert('Prep time cannot be negative');
          return;
        }

        if (prepTime > 180) {
          alert('Prep time must not exceed 180 minutes');
          return;
        }
      }

      // Description validation (if provided)
      if (formData.description && formData.description.trim()) {
        if (formData.description.length > 500) {
          alert('Description must not exceed 500 characters');
          return;
        }
      }

      // Ingredients validation (if provided)
      if (formData.ingredients && formData.ingredients.trim()) {
        if (formData.ingredients.length > 1000) {
          alert('Ingredients must not exceed 1000 characters');
          return;
        }
      }

      const categoryData = categories.find(
        c => c.name === formData.category
      );
      const itemType = categoryData?.type || 'Cafe';

      const data = new FormData();

      Object.keys(formData).forEach(key => {
        if (FORM_SKIP_KEYS.includes(key)) return;

        const value = formData[key];

        if (
          value === null ||
          value === undefined ||
          typeof value === 'object'
        ) {
          return;
        }

        data.append(key, value);
      });

      data.append('type', itemType);

      if (!currentItem) {
        data.append('color', '#2ecc71');
      }

      if (imageFile) {
        data.append('img', imageFile);
      }

      if (currentItem) {
        // Edit
        await menuAPI.update(currentItem._id, data);
      } else {
        // Add
        await menuAPI.create(data);
      }

      await loadData();
      setShowForm(false);
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Failed to save menu item');
    }
  };

  const confirmDelete = async () => {
    try {
      await menuAPI.delete(currentItem._id);
      await loadData();
      setShowDelete(false);
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  };

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdRestaurant /> Menu Management
          </div>
          <div className="d-page-sub">Create and manage your culinary offerings</div>
        </div>
        <div className="d-flex gap-2">
          {canAddEditDelete && (
            <button className="d-btn-gold" onClick={handleAdd}>
              <MdAdd /> Add New Item
            </button>
          )}
        </div>
      </div>

      <Row className="g-3 mb-4">
        <Col xs={12} lg={8}>
          <div className="d-flex gap-2 flex-wrap">
            {categories.map(c => (
              <button
                key={c.name}
                onClick={() => setActive(c.name)}
                style={{
                  padding: '8px 16px',
                  border: '1.5px solid var(--d-border)',
                  borderRadius: 'var(--d-radius-md)',
                  background: active === c.name ? 'var(--d-primary)' : 'var(--d-white)',
                  color: active === c.name ? 'var(--d-white)' : 'var(--d-text-muted)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'var(--d-transition)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {c.icon} {c.name}
              </button>
            ))}
          </div>
        </Col>
        <Col xs={12} lg={4}>
          <div className="d-navbar-search-box w-100 m-0">
            <MdSearch className="d-search-icon" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Col>
      </Row>

      <div className="d-section-sub mb-3">
        {filtered.length} {filtered.length === 1 ? 'item' : 'items'} found
      </div>

      <Row className="g-3">
        {filtered.map(item => (
          <Col key={item._id} xs={12} sm={6} xl={4}>
            <div className="d-card h-100 position-relative">
              <div className="d-flex gap-3">
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: 'var(--d-radius-md)',
                  background: `${item.color || '#2ecc71'}15`,
                  color: item.color || '#2ecc71',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}>
                  {item.img ? <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--d-radius-md)' }} /> : <MdRestaurant />}
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <h5 className="d-section-title mb-0" style={{ fontSize: '1rem' }}>{item.name}</h5>
                    {canAddEditDelete && (
                      <div className="d-flex gap-1">
                        <button
                          className="d-navbar-icon-btn"
                          onClick={() => handleEdit(item)}
                          style={{ width: '28px', height: '28px', fontSize: '1rem' }}
                        >
                          <MdEdit />
                        </button>
                        <button
                          className="d-navbar-icon-btn text-danger"
                          onClick={() => handleDeleteClick(item)}
                          style={{ width: '28px', height: '28px', fontSize: '1rem' }}
                        >
                          <MdDelete />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="d-page-sub mb-2">{item.category} {item.cuisine ? `• ${item.cuisine}` : ''}</div>
                  {item.description && (
                    <div
                      className="text-muted small mb-2"
                      style={{
                        fontSize: "0.8rem",
                        wordBreak: "break-word",
                        whiteSpace: "normal",
                      }}
                    >
                      {item.description.length > 70
                        ? `${item.description.slice(0, 70)}...`
                        : item.description}
                    </div>
                  )}
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--d-primary)', fontFamily: 'Playfair Display' }}>
                        ₹{item.price}
                      </span>
                      {item.prepTime && (
                        <span className="text-muted small ml-2" style={{ fontSize: '0.8rem' }}>
                          • {item.prepTime} mins
                        </span>
                      )}
                    </div>
                    <span className={`d-chip ${item.status === 'Available' ? 'd-chip-green' : 'd-chip-red'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        ))
        }
      </Row>

      <FormModal
        show={showForm}
        onHide={() => setShowForm(false)}
        title={currentItem ? "Edit Menu Item" : "Add New Menu Item"}
        onSubmit={handleSave}
      >
        <Row className="g-3">
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-bold">Item Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Truffle Risotto"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                minLength={3}
                maxLength={100}
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Category *</Form.Label>
              <Form.Select
                value={formData.category}
                onChange={(e) => {
                  const categoryData = categories.find(c => c.name === e.target.value);
                  setFormData({
                    ...formData,
                    category: e.target.value,
                    type: categoryData?.type || 'Cafe'
                  });
                }}
              >
                <option value="">Select Category</option>
                {categories.filter(c => c.name !== 'All').map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Cuisine</Form.Label>
              <Form.Select
                value={formData.cuisine}
                onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
              >
                <option value="">Select Cuisine</option>
                {cuisines.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12} md={4}>
            <Form.Group>
              <Form.Label className="small fw-bold">Price (₹) *</Form.Label>
              <Form.Control
                type="number"
                placeholder="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                min={0}
                max={999999}
                step="0.01"
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={4}>
            <Form.Group>
              <Form.Label className="small fw-bold">Prep Time (mins)</Form.Label>
              <Form.Control
                type="number"
                placeholder="15"
                value={formData.prepTime}
                onChange={(e) => setFormData({ ...formData, prepTime: parseInt(e.target.value) || 15 })}
                min={0}
                max={180}
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={4}>
            <Form.Group>
              <Form.Label className="small fw-bold">Status</Form.Label>
              <Form.Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Available">Available</option>
                <option value="Sold Out">Sold Out</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-bold">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Brief description of the item..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                maxLength={500}
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
                onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                maxLength={1000}
              />
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-bold">Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                </div>
              )}
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
