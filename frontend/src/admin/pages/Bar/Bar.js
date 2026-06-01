import React, { useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { 
  MdLocalBar, MdAdd, MdSearch, MdFilterList, 
  MdWineBar, MdSportsBar, MdWineBar as MdWine, MdEdit, MdDelete 
} from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';

const DRINKS = [
  { id: 1, name: 'Classic Mojito',     cat: 'Cocktail', price: '320', available: true,  img: <MdLocalBar />, color: '#2ecc71' },
  { id: 2, name: 'Old Fashioned',      cat: 'Cocktail', price: '480', available: true,  img: <MdLocalBar />, color: '#f39c12' },
  { id: 3, name: 'Kingfisher Draught', cat: 'Beer',     price: '180', available: true,  img: <MdSportsBar />, color: '#3498db' },
  { id: 4, name: 'House Red Wine',     cat: 'Wine',     price: '420', available: true,  img: <MdWine />, color: '#e74c3c' },
  { id: 5, name: 'Espresso Martini',   cat: 'Cocktail', price: '380', available: false, img: <MdLocalBar />, color: '#9b59b6' },
  { id: 6, name: 'Whiskey Sour',       cat: 'Cocktail', price: '440', available: true,  img: <MdLocalBar />, color: '#e67e22' },
];

const CATEGORIES = ['All', 'Cocktail', 'Beer', 'Wine', 'Spirits'];

export default function Bar({ userRole = 'chef' }) {
  const [drinks, setDrinks] = useState(DRINKS);
  const [active, setActive] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', cat: 'Cocktail', price: '', available: true });

  // Role-based permissions
  const canAddEditDelete = userRole === 'chef' || userRole === 'manager' || userRole === 'superadmin';

  const filtered = drinks.filter(d => {
    const matchesCat = active === 'All' || d.cat === active;
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAdd = () => {
    if (!canAddEditDelete) {
      alert('You do not have permission to add drinks.');
      return;
    }
    setCurrentItem(null);
    setFormData({ name: '', cat: 'Cocktail', price: '', available: true });
    setShowForm(true);
  };

  const handleEdit = (item) => {
    if (!canAddEditDelete) {
      alert('You do not have permission to edit drinks.');
      return;
    }
    setCurrentItem(item);
    setFormData({ name: item.name, cat: item.cat, price: item.price.replace('₹', ''), available: item.available });
    setShowForm(true);
  };

  const handleDeleteClick = (item) => {
    if (!canAddEditDelete) {
      alert('You do not have permission to delete drinks.');
      return;
    }
    setCurrentItem(item);
    setShowDelete(true);
  };

  const handleSave = () => {
    if (currentItem) {
      setDrinks(drinks.map(d => d.id === currentItem.id ? { ...d, ...formData } : d));
    } else {
      const newId = drinks.length + 1;
      setDrinks([...drinks, { id: newId, ...formData, img: <MdLocalBar />, color: '#2ecc71' }]);
    }
    setShowForm(false);
  };

  const confirmDelete = () => {
    setDrinks(drinks.filter(d => d.id !== currentItem.id));
    setShowDelete(false);
  };

  const handleStockInventory = () => {
    if (!canAddEditDelete) {
      alert('You do not have permission to manage inventory.');
      return;
    }
    alert('Stock Inventory functionality - Opens inventory management modal');
  };

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
            <button className="d-btn-outline d-hide-mobile" onClick={handleStockInventory}>
              Stock Inventory
            </button>
          )}
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
                className={`d-btn-filter ${active === c ? 'active' : ''}`}
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
          <Col key={i} xs={12} sm={6} xl={4}>
            <div className="d-card h-100">
              <div className="d-flex gap-3">
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
                  {d.img}
                </div>
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
                  <div className="d-page-sub mb-2">{d.cat}</div>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--d-primary)', fontFamily: 'Playfair Display' }}>
                      ₹{d.price}
                    </span>
                    <span className={`d-chip ${d.available ? 'd-chip-green' : 'd-chip-red'}`}>
                      {d.available ? 'In Stock' : 'Out of Stock'}
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
        title={currentItem ? "Edit Drink" : "Add New Drink"}
        onSubmit={handleSave}
      >
        <Row className="g-3">
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-bold">Drink Name</Form.Label>
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
              <Form.Label className="small fw-bold">Category</Form.Label>
              <Form.Select 
                value={formData.cat}
                onChange={(e) => setFormData({...formData, cat: e.target.value})}
              >
                {CATEGORIES.filter(c => c !== 'All').map(c => (
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
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-bold">Availability</Form.Label>
              <div className="d-flex gap-3">
                <Form.Check 
                  type="radio" 
                  label="In Stock" 
                  name="available" 
                  checked={formData.available === true}
                  onChange={() => setFormData({...formData, available: true})}
                />
                <Form.Check 
                  type="radio" 
                  label="Out of Stock" 
                  name="available" 
                  checked={formData.available === false}
                  onChange={() => setFormData({...formData, available: false})}
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
