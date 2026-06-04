import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import {
  MdAdd, MdEdit, MdDelete, MdSearch, MdFilterList,
  MdLocalCafe, MdRestaurant, MdLocalBar, MdIcecream
} from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal.jsx';
import FormModal from '../../components/FormModal.jsx';
import { menuAPI } from '../../../api';
import { useAuth } from '../../../contexts/AuthContext';

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
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setShowForm(true);
  };

  const handleDeleteClick = (item) => {
    setCurrentItem(item);
    setShowDelete(true);
  };

  const handleSave = async (formData, fileData) => {
    try {
      const categoryData = CATEGORIES.find(c => c.name === formData.category);
      const itemType = categoryData?.type || 'Cafe';

      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (FORM_SKIP_KEYS.includes(key)) return;
        const value = formData[key];
        if (value === null || value === undefined || typeof value === 'object') return;
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
        await menuAPI.update(currentItem._id, data);
      } else {
        await menuAPI.create(data);
      }
      loadData();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving menu item:', error);
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
        {loading ? (
          <Col className="text-center py-5">Loading menu items...</Col>
        ) : (
          filtered.map(item => (
            <Col key={item._id} xs={12} sm={6} xl={4}>
              <div className="d-card h-100 position-relative">
                <div className="d-flex gap-3">
                  {item.img ? (
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
          ))
        )}
      </Row>

      <FormModal
        show={showForm}
        onHide={() => setShowForm(false)}
        title={currentItem ? "Edit Menu Item" : "Add New Menu Item"}
        initialData={currentItem}
        onSave={handleSave}
        fields={formFields}
      />

      <DeleteModal
        show={showDelete}
        onHide={() => setShowDelete(false)}
        onDelete={confirmDelete}
        itemName={currentItem?.name}
      />
    </>
  );
}
