import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import {
  MdLocalBar, MdAdd, MdSearch, MdFilterList,
  MdWineBar, MdSportsBar, MdWineBar as MdWine, MdEdit, MdDelete
} from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal.jsx';
import FormModal from '../../components/FormModal.jsx';
import { menuAPI } from '../../../api';
import { useAuth } from '../../../contexts/AuthContext';

const CATEGORIES = ['All', 'Cocktail', 'Beer', 'Wine', 'Spirits'];
const FORM_SKIP_KEYS = ['_id', '__v', 'createdAt', 'updatedAt', 'type'];

const itemHasType = (item, target) => {
  const types = Array.isArray(item?.type) ? item.type : item?.type ? [item.type] : [];
  return types.includes(target);
};

export default function Bar() {
  const [drinks, setDrinks] = useState([]);
  const [active, setActive] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const { user } = useAuth();
  const userRole = user?.role || 'chef';

  const canAddEditDelete = userRole === 'chef' || userRole === 'manager' || userRole === 'superadmin' || userRole === 'bartender';

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await menuAPI.getAll();
      const data = Array.isArray(response.data) ? response.data : [];
      setDrinks(data.filter(i => itemHasType(i, 'Bar')));
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
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (FORM_SKIP_KEYS.includes(key)) return;
        const value = formData[key];
        if (value === null || value === undefined || typeof value === 'object') return;
        data.append(key, value);
      });
      data.append('type', 'Bar');
      if (!currentItem) {
        data.append('color', '#2ecc71');
      }
      
      if (fileData && fileData.file) {
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
      console.error(error);
    }
  };

  const confirmDelete = async () => {
    try {
      await menuAPI.delete(currentItem._id);
      loadData();
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

  const formFields = [
    { name: 'name', label: 'Drink Name', type: 'text', required: true, col: 12 },
    { name: 'category', label: 'Category', type: 'select', required: true, col: 6, options: CATEGORIES.filter(c => c !== 'All').map(c => ({ label: c, value: c })) },
    { name: 'cuisine', label: 'Cuisine', type: 'text', required: true, col: 6 },
    { name: 'price', label: 'Price (₹)', type: 'number', required: true, col: 6 },
    { name: 'status', label: 'Status', type: 'select', required: true, col: 6, options: [{ label: 'Available', value: 'Available' }, { label: 'Sold Out', value: 'Sold Out' }] },
    { name: 'img', label: 'Drink Image', type: 'file', col: 12 },
  ];

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
            {CATEGORIES.map(c => (
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
                    background: `${d.color}15`,
                    color: d.color,
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
                  <div className="d-page-sub mb-2">{d.category}</div>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--d-primary)', fontFamily: 'Playfair Display' }}>
                      ₹{d.price}
                    </span>
                    <span className={`d-chip ${d.status === 'Available' ? 'd-chip-green' : 'd-chip-red'}`}>
                      {d.status}
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
        onSave={handleSave}
        title={currentItem ? "Edit Drink" : "Add New Drink"}
        initialData={currentItem || {}}
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
