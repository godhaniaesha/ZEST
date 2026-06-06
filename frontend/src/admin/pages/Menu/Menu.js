import React, { useState, useEffect } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import {
  MdAdd, MdEdit, MdDelete, MdSearch, MdFilterList,
  MdLocalCafe, MdRestaurant, MdLocalBar, MdIcecream
} from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';
import { menuAPI } from '../../../api';
import { useAuth } from '../../../contexts/AuthContext';

const MENU_ITEMS = [
  { id: 1, name: 'Truffle Risotto', category: 'Mains', price: '680', status: 'Available', type: 'Cafe', cuisine: 'Italian', img: <MdRestaurant />, color: '#2ecc71', description: 'Creamy arborio rice with fresh truffle oil and parmesan', prepTime: 25, ingredients: 'Arborio rice, truffle oil, parmesan, vegetable broth, mushrooms' },
  { id: 2, name: 'Mojito Classic', category: 'Cocktails', price: '320', status: 'Available', type: 'Bar', cuisine: 'International', img: <MdLocalBar />, color: '#3498db', description: 'Fresh mint, lime, rum, and soda water - the perfect summer drink', prepTime: 5, ingredients: 'White rum, mint leaves, lime, sugar, soda water' },
  { id: 3, name: 'Beef Tenderloin', category: 'Mains', price: '1200', status: 'Available', type: 'Cafe', cuisine: 'Continental', img: <MdRestaurant />, color: '#2ecc71', description: 'Premium tenderloin with red wine reduction and roasted vegetables', prepTime: 35, ingredients: 'Beef tenderloin, red wine, garlic, rosemary, seasonal vegetables' },
  { id: 4, name: 'Tiramisu', category: 'Desserts', price: '280', status: 'Sold Out', type: 'Cafe', cuisine: 'Italian', img: <MdIcecream />, color: '#e74c3c', description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone', prepTime: 20, ingredients: 'Ladyfingers, espresso, mascarpone, eggs, cocoa powder' },
  { id: 5, name: 'Espresso Martini', category: 'Cocktails', price: '380', status: 'Available', type: 'Bar', cuisine: 'International', img: <MdLocalBar />, color: '#3498db', description: 'Vodka, coffee liqueur, and freshly brewed espresso', prepTime: 7, ingredients: 'Vodka, Kahlua, espresso, simple syrup' },
  { id: 6, name: 'Caesar Salad', category: 'Starters', price: '320', status: 'Available', type: 'Cafe', cuisine: 'Continental', img: <MdRestaurant />, color: '#f39c12', description: 'Romaine lettuce with caesar dressing, parmesan, and croutons', prepTime: 10, ingredients: 'Romaine lettuce, caesar dressing, parmesan, croutons, lemon' },
];

const CATEGORIES = [
  { name: 'All', icon: <MdFilterList /> },
  { name: 'Starters', icon: <MdRestaurant />, type: 'Cafe' },
  { name: 'Mains', icon: <MdRestaurant />, type: 'Cafe' },
  { name: 'Desserts', icon: <MdIcecream />, type: 'Cafe' },
  { name: 'Cocktails', icon: <MdLocalBar />, type: 'Bar' },
  { name: 'Beer', icon: <MdLocalBar />, type: 'Bar' },
  { name: 'Wine', icon: <MdLocalBar />, type: 'Bar' },
  { name: 'Spirits', icon: <MdLocalBar />, type: 'Bar' },
];

const FORM_SKIP_KEYS = ['_id', '__v', 'createdAt', 'updatedAt', 'type'];

const itemHasType = (item, target) => {
  const types = Array.isArray(item?.type) ? item.type : item?.type ? [item.type] : [];
  return types.includes(target);
};

const CUISINES = [
  'Italian',
  'Continental',
  'Indian',
  'Chinese',
  'Mexican',
  'International',
  'Gujarati',
  'Punjabi',
  'South Indian',
];

export default function Menu() {
  const [items, setItems] = useState([]);
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

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await menuAPI.getAll();
      const data = Array.isArray(response.data) ? response.data : [];
      setItems(data.filter(i => itemHasType(i, 'Cafe')));
    } catch (error) {
      console.error('Error fetching menu items:', error);
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

  const handleAdd = () => {
    setCurrentItem(null);
    setFormData({ name: '', category: 'Starters', price: '', status: 'Available', type: 'Cafe', cuisine: 'Indian', description: '', prepTime: 15, ingredients: '' });
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price.replace('₹', '').replace(',', ''),
      status: item.status,
      type: item.type || 'Cafe',
      cuisine: item.cuisine || 'Indian',
      description: item.description || '',
      prepTime: item.prepTime || 15,
      ingredients: item.ingredients || ''
    });
    setShowForm(true);
  };

  const handleDeleteClick = (item) => {
    setCurrentItem(item);
    setShowDelete(true);
  };

  const handleSave = async (_, fileData) => {
    try {
      // Validation
      if (!formData.name || !formData.price || !formData.category) {
        alert('Please fill in all required fields (Name, Price, Category)');
        return;
      }

      if (parseFloat(formData.price) <= 0) {
        alert('Price must be greater than 0');
        return;
      }

      const categoryData = CATEGORIES.find(
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

      if (fileData?.file) {
        data.append(fileData.name, fileData.file);
      }

      if (currentItem) {
        // Edit
        await menuAPI.update(currentItem._id, data);

        setItems(
          items.map(i =>
            i.id === currentItem.id
              ? { ...i, ...formData, price: formData.price }
              : i
          )
        );
      } else {
        // Add
        await menuAPI.create(data);
      }

      await loadData();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Failed to save menu item');
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

  const formFields = [
    { name: 'name', label: 'Item Name', type: 'text', required: true, col: 12 },
    { name: 'category', label: 'Category', type: 'select', required: true, col: 6, options: CATEGORIES.filter(c => c.name !== 'All' && c.type === 'Cafe').map(c => ({ label: c.name, value: c.name })) },
    { name: 'cuisine', label: 'Cuisine', type: 'select', required: true, col: 6, options: CUISINES.map(c => ({ label: c, value: c })) },
    { name: 'price', label: 'Price (₹)', type: 'number', required: true, col: 6 },
    { name: 'status', label: 'Status', type: 'select', required: true, col: 6, options: [{ label: 'Available', value: 'Available' }, { label: 'Sold Out', value: 'Sold Out' }] },
    { name: 'img', label: 'Item Image', type: 'file', col: 12 },
  ];

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
            {CATEGORIES.filter(c => c.name === 'All' || c.type === 'Cafe').map(c => (
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
          <Col key={item.id} xs={12} sm={6} xl={4}>
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
                  {item.img || <MdRestaurant />}
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
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Category *</Form.Label>
              <Form.Select
                value={formData.category}
                onChange={(e) => {
                  const categoryData = CATEGORIES.find(c => c.name === e.target.value);
                  setFormData({
                    ...formData,
                    category: e.target.value,
                    type: categoryData?.type || 'Cafe'
                  });
                }}
              >
                {CATEGORIES.filter(c => c.name !== 'All').map(c => (
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
                {CUISINES.map(c => (
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
