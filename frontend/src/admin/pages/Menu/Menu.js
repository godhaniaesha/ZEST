import React, { useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import {
  MdAdd, MdEdit, MdDelete, MdSearch, MdFilterList,
  MdLocalCafe, MdRestaurant, MdLocalBar, MdIcecream
} from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';

const MENU_ITEMS = [
  { id: 1, name: 'Truffle Risotto', category: 'Mains', price: '680', status: 'Available', type: 'Cafe', cuisine: 'Italian', img: <MdRestaurant />, color: '#2ecc71' },
  { id: 2, name: 'Mojito Classic', category: 'Cocktails', price: '320', status: 'Available', type: 'Bar', cuisine: 'International', img: <MdLocalBar />, color: '#3498db' },
  { id: 3, name: 'Beef Tenderloin', category: 'Mains', price: '1200', status: 'Available', type: 'Cafe', cuisine: 'Continental', img: <MdRestaurant />, color: '#2ecc71' },
  { id: 4, name: 'Tiramisu', category: 'Desserts', price: '280', status: 'Sold Out', type: 'Cafe', cuisine: 'Italian', img: <MdIcecream />, color: '#e74c3c' },
  { id: 5, name: 'Espresso Martini', category: 'Cocktails', price: '380', status: 'Available', type: 'Bar', cuisine: 'International', img: <MdLocalBar />, color: '#3498db' },
  { id: 6, name: 'Caesar Salad', category: 'Starters', price: '320', status: 'Available', type: 'Cafe', cuisine: 'Continental', img: <MdRestaurant />, color: '#f39c12' },
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

export default function Menu({ userRole = 'chef' }) {
  const [items, setItems] = useState(MENU_ITEMS);
  const [active, setActive] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: 'Mains', price: '', status: 'Available', type: 'Cafe', cuisine: 'Indian' });

  // Role-based permissions
  const canAddEditDelete = userRole === 'chef' || userRole === 'manager' || userRole === 'superadmin';

  const filtered = items.filter(item => {
    const matchesCategory = active === 'All' || item.category === active;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAdd = () => {
    if (!canAddEditDelete) {
      alert('You do not have permission to add menu items.');
      return;
    }
    setCurrentItem(null);
    setFormData({ name: '', category: 'Mains', price: '', status: 'Available', type: 'Cafe', cuisine: 'Indian' });
    setShowForm(true);
  };

  const handleEdit = (item) => {
    if (!canAddEditDelete) {
      alert('You do not have permission to edit menu items.');
      return;
    }
    setCurrentItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price.replace('₹', '').replace(',', ''),
      status: item.status,
      type: item.type || 'Cafe',
      cuisine: item.cuisine || 'Indian'
    });
    setShowForm(true);
  };

  const handleDeleteClick = (item) => {
    if (!canAddEditDelete) {
      alert('You do not have permission to delete menu items.');
      return;
    }
    setCurrentItem(item);
    setShowDelete(true);
  };

  const handleSave = () => {
    if (currentItem) {
      // Edit
      setItems(items.map(i => i.id === currentItem.id ? { ...i, ...formData, price: formData.price } : i));
    } else {
      // Add
      const newId = items.length + 1;
      const categoryData = CATEGORIES.find(c => c.name === formData.category);
      const itemType = categoryData?.type || 'Cafe';
      setItems([...items, {
        id: newId,
        ...formData,
        price: formData.price,
        type: itemType,
        cuisine: formData.cuisine,
        img: itemType === 'Bar' ? <MdLocalBar /> : <MdRestaurant />,
        color: '#2ecc71'
      }]);
    }
    setShowForm(false);
  };

  const confirmDelete = () => {
    setItems(items.filter(i => i.id !== currentItem.id));
    setShowDelete(false);
  };

  const handleImport = () => {
    if (!canAddEditDelete) {
      alert('You do not have permission to import menu.');
      return;
    }
    alert('Import Menu functionality - Opens file upload modal');
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
            <button className="d-btn-outline d-hide-mobile" onClick={handleImport}>
              Import Menu
            </button>
          )}
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
            {CATEGORIES.map(c => (
              <button
                key={c.name}
                onClick={() => setActive(c.name)}
                className={`d-btn-filter ${active === c.name ? 'active' : ''}`}
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
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--d-primary)', fontFamily: 'Playfair Display' }}>
                      ₹{item.price}
                    </span>
                    <span className={`d-chip ${item.status === 'Available' ? 'd-chip-green' : 'd-chip-red'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Modals */}
      <FormModal
        show={showForm}
        onHide={() => setShowForm(false)}
        title={currentItem ? "Edit Menu Item" : "Add New Menu Item"}
        onSubmit={handleSave}
      >
        <Row className="g-3">
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-bold">Item Name</Form.Label>
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
              <Form.Label className="small fw-bold">Category</Form.Label>
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
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Price (₹)</Form.Label>
              <Form.Control
                type="number"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-bold">Status</Form.Label>
              <div className="d-flex gap-3">
                <Form.Check
                  type="radio"
                  label="Available"
                  name="status"
                  checked={formData.status === 'Available'}
                  onChange={() => setFormData({ ...formData, status: 'Available' })}
                />
                <Form.Check
                  type="radio"
                  label="Sold Out"
                  name="status"
                  checked={formData.status === 'Sold Out'}
                  onChange={() => setFormData({ ...formData, status: 'Sold Out' })}
                />
              </div>
            </Form.Group>
          </Col>
        </Row>
      </FormModal>

      <DeleteModal
        show={showDelete}
        onHide={() => setShowDelete(false)}
        onConfirm={confirmDelete}
        itemName={currentItem?.name}
      />

      <style jsx>{`
        .d-btn-filter {
          padding: 8px 16px;
          border: 1.5px solid var(--d-border);
          border-radius: var(--d-radius-md);
          background: var(--d-white);
          color: var(--d-text-muted);
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: var(--d-transition);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .d-btn-filter:hover {
          background: var(--d-accent-soft);
          border-color: var(--d-primary);
          color: var(--d-primary);
        }
        .d-btn-filter.active {
          background: var(--d-primary);
          color: var(--d-white);
          border-color: var(--d-primary);
        }
      `}</style>
    </>
  );
}
