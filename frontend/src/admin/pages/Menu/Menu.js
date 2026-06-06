import React, { useState, useEffect } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import {
  MdAdd, MdEdit, MdDelete, MdSearch, MdFilterList,
  MdRestaurant, MdIcecream,
} from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';
import { menuAPI } from '../../../api';
import { useAuth } from '../../../contexts/AuthContext';

const FORM_SKIP_KEYS = ['_id', '__v', 'createdAt', 'updatedAt', 'type'];

const itemHasType = (item, target) => {
  const types = Array.isArray(item?.type) ? item.type : item?.type ? [item.type] : [];
  return types.includes(target);
};

const getCategoryIcon = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('dessert')) return <MdIcecream />;
  if (n.includes('starter')) return <MdRestaurant />;
  return <MdRestaurant />;
};

export default function Menu() {
  const [items, setItems] = useState([]);
  const [cafeCategories, setCafeCategories] = useState([]);
  const [cafeCuisines, setCafeCuisines] = useState([]);
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

  const canAddEditDelete = userRole === 'chef' || userRole === 'manager' || userRole === 'superadmin';

  const defaultCategory = cafeCategories[0]?.name || '';
  const defaultCuisine = cafeCuisines[0]?.name || '';
  const filterButtons = [
    { name: 'All', icon: <MdFilterList /> },
    ...cafeCategories.map((c) => ({ name: c.name, icon: getCategoryIcon(c.name) })),
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const [menuRes, catRes, cuisineRes] = await Promise.all([
        menuAPI.getAll(),
        menuAPI.getCategories({ type: 'Cafe' }),
        menuAPI.getCuisines({ type: 'Cafe' }),
      ]);
      const data = Array.isArray(menuRes.data) ? menuRes.data : [];
      setItems(data.filter((i) => itemHasType(i, 'Cafe')));
      setCafeCategories(Array.isArray(catRes.data) ? catRes.data : []);
      setCafeCuisines(Array.isArray(cuisineRes.data) ? cuisineRes.data : []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setItems([]);
      setCafeCategories([]);
      setCafeCuisines([]);
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

  const handleAdd = () => {
    setCurrentItem(null);
    setFormData({
      name: '', category: defaultCategory, price: '', status: 'Available', type: 'Cafe',
      cuisine: defaultCuisine, description: '', prepTime: 15, ingredients: '',
    });
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
      cuisine: item.cuisine || defaultCuisine,
      description: item.description || '',
      prepTime: item.prepTime || 15,
      ingredients: item.ingredients || ''
    });
    setImageFile(null);
    setImagePreview(typeof item.img === 'string' && item.img ? item.img : null);
    setShowForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDeleteClick = (item) => {
    setCurrentItem(item);
    setShowDelete(true);
  };

  const handleSave = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    try {
      if (!formData.name || !formData.price || !formData.category) {
        alert('Please fill in all required fields (Name, Price, Category)');
        return;
      }

      if (parseFloat(formData.price) <= 0) {
        alert('Price must be greater than 0');
        return;
      }

      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (FORM_SKIP_KEYS.includes(key)) return;
        const value = formData[key];
        if (value === null || value === undefined || typeof value === 'object') return;
        data.append(key, value);
      });

      data.append('type', 'Cafe');
      if (!currentItem) {
        data.append('color', '#2ecc71');
      }
      if (imageFile) {
        data.append('img', imageFile);
      }

      if (currentItem) {
        await menuAPI.update(currentItem._id, data);
      } else {
        await menuAPI.create(data);
      }

      await loadData();
      setShowForm(false);
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert(error.response?.data?.message || 'Failed to save menu item');
    }
  };

  const confirmDelete = async () => {
    try {
      await menuAPI.delete(currentItem._id);
      loadData();
      setShowDelete(false);
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

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
            {filterButtons.map(c => (
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
                {item.img && typeof item.img === 'string' ? (
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: 'var(--d-radius-md)',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
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
                  <MdRestaurant />
                </div>
                )}
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
                  <div className="d-page-sub mb-2">{item.category} • {item.cuisine}</div>
                  {item.description && <div className="text-muted small mb-2" style={{ fontSize: '0.8rem' }}>{item.description}</div>}
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
        onHide={() => {
          setShowForm(false);
          setImageFile(null);
          setImagePreview(null);
        }}
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
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Category *</Form.Label>
              <Form.Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value, type: 'Cafe' })}
                disabled={cafeCategories.length === 0}
              >
                {cafeCategories.length === 0 ? (
                  <option value="">No cafe categories — add in Categories page</option>
                ) : (
                  cafeCategories.map((c) => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))
                )}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Cuisine</Form.Label>
              <Form.Select
                value={formData.cuisine}
                onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                disabled={cafeCuisines.length === 0}
              >
                {cafeCuisines.length === 0 ? (
                  <option value="">No cafe cuisines — add in Categories page</option>
                ) : (
                  cafeCuisines.map((c) => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))
                )}
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
              <Form.Label className="small fw-bold">Item Image (uploads to AWS)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }}
                  />
                </div>
              )}
              <Form.Text className="text-muted">JPG, PNG — max 5MB. Stored on AWS S3 when configured.</Form.Text>
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
