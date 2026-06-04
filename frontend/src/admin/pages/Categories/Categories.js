import React, { useState } from 'react';
import { Row, Col, Form, Tab, Tabs } from 'react-bootstrap';
import { MdAdd, MdEdit, MdDelete, MdRestaurantMenu, MdLocalBar, MdLocalDining, MdFastfood, MdRestaurant } from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';

// Initial Data
const INITIAL_MENU_CATEGORIES = [
  { id: 1, name: 'Starters', type: 'Cafe', icon: <MdFastfood /> },
  { id: 2, name: 'Mains', type: 'Cafe', icon: <MdRestaurant /> },
  { id: 3, name: 'Desserts', type: 'Cafe', icon: <MdLocalDining /> },
];

const INITIAL_BAR_CATEGORIES = [
  { id: 1, name: 'Cocktail', type: 'Bar', icon: <MdLocalBar /> },
  { id: 2, name: 'Beer', type: 'Bar', icon: <MdLocalBar /> },
  { id: 3, name: 'Wine', type: 'Bar', icon: <MdLocalBar /> },
  { id: 4, name: 'Spirits', type: 'Bar', icon: <MdLocalBar /> },
];

const INITIAL_CUISINES = [
  { id: 1, name: 'Indian', icon: <MdRestaurant /> },
  { id: 2, name: 'Italian', icon: <MdRestaurant /> },
  { id: 3, name: 'Continental', icon: <MdRestaurant /> },
  { id: 4, name: 'Chinese', icon: <MdRestaurant /> },
  { id: 5, name: 'Mexican', icon: <MdRestaurant /> },
  { id: 6, name: 'International', icon: <MdRestaurant /> },
  { id: 7, name: 'Gujarati', icon: <MdRestaurant /> },
  { id: 8, name: 'Punjabi', icon: <MdRestaurant /> },
  { id: 9, name: 'South Indian', icon: <MdRestaurant /> },
];

export default function Categories({ userRole = 'chef' }) {
  const [menuCategories, setMenuCategories] = useState(INITIAL_MENU_CATEGORIES);
  const [barCategories, setBarCategories] = useState(INITIAL_BAR_CATEGORIES);
  const [cuisines, setCuisines] = useState(INITIAL_CUISINES);
  const [activeTab, setActiveTab] = useState('menu');

  // Modal States
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formType, setFormType] = useState(null); // 'menu', 'bar', 'cuisine'
  const [formData, setFormData] = useState({ name: '' });

  // Role-based permissions
  const canAddEditDelete = userRole === 'chef' || userRole === 'manager' || userRole === 'superadmin';

  const handleAdd = (type) => {
    if (!canAddEditDelete) {
      alert('You do not have permission to add.');
      return;
    }
    setFormType(type);
    setCurrentItem(null);
    setFormData({ name: '' });
    setShowForm(true);
  };

  const handleEdit = (item, type) => {
    if (!canAddEditDelete) {
      alert('You do not have permission to edit.');
      return;
    }
    setFormType(type);
    setCurrentItem(item);
    setFormData({ name: item.name });
    setShowForm(true);
  };

  const handleDeleteClick = (item, type) => {
    if (!canAddEditDelete) {
      alert('You do not have permission to delete.');
      return;
    }
    setFormType(type);
    setCurrentItem(item);
    setShowDelete(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      alert('Please fill in the name');
      return;
    }

    const defaultIcon = formType === 'bar' ? <MdLocalBar /> : <MdRestaurant />;

    if (formType === 'menu') {
      if (currentItem) {
        setMenuCategories(menuCategories.map(c => c.id === currentItem.id ? { ...c, ...formData } : c));
      } else {
        const newId = menuCategories.length + 1;
        setMenuCategories([...menuCategories, { id: newId, name: formData.name, type: 'Cafe', icon: <MdRestaurant /> }]);
      }
    } else if (formType === 'bar') {
      if (currentItem) {
        setBarCategories(barCategories.map(c => c.id === currentItem.id ? { ...c, ...formData } : c));
      } else {
        const newId = barCategories.length + 1;
        setBarCategories([...barCategories, { id: newId, name: formData.name, type: 'Bar', icon: <MdLocalBar /> }]);
      }
    } else if (formType === 'cuisine') {
      if (currentItem) {
        setCuisines(cuisines.map(c => c.id === currentItem.id ? { ...c, ...formData } : c));
      } else {
        const newId = cuisines.length + 1;
        setCuisines([...cuisines, { id: newId, name: formData.name, icon: <MdRestaurant /> }]);
      }
    }

    setShowForm(false);
  };

  const confirmDelete = () => {
    if (formType === 'menu') {
      setMenuCategories(menuCategories.filter(c => c.id !== currentItem.id));
    } else if (formType === 'bar') {
      setBarCategories(barCategories.filter(c => c.id !== currentItem.id));
    } else if (formType === 'cuisine') {
      setCuisines(cuisines.filter(c => c.id !== currentItem.id));
    }
    setShowDelete(false);
  };

  // Helper to get color based on type
  const getCategoryColor = (type) => {
    return type === 'Bar' ? '#3498db' : '#2ecc71';
  };

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdLocalDining /> Categories & Cuisines
          </div>
          <div className="d-page-sub">Manage your menu categories, bar categories, and cuisines</div>
        </div>
      </div>

      <div className="d-custom-tabs">
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
        >
          <Tab eventKey="menu" title={<><MdRestaurantMenu /> Menu Categories</>}>
            <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
              <div className="d-section-sub">{menuCategories.length} menu categories</div>
              {canAddEditDelete && (
                <button className="d-btn-gold" onClick={() => handleAdd('menu')}>
                  <MdAdd /> Add Menu Category
                </button>
              )}
            </div>
            <Row className="g-4">
              {menuCategories.map((cat) => (
                <Col key={cat.id} xs={12} sm={6} md={4} lg={3}>
                  <div className="d-category-card h-100">
                    <div className="d-flex align-items-center gap-3">
                      <div className="d-category-icon" style={{ background: `${getCategoryColor(cat.type)}15`, color: getCategoryColor(cat.type) }}>
                        {cat.icon || <MdRestaurant />}
                      </div>
                      <div className="flex-grow-1">
                        <h5 className="d-section-title mb-0">{cat.name}</h5>
                        <div className="d-page-sub">Type: {cat.type}</div>
                      </div>
                    </div>
                    {canAddEditDelete && (
                      <div className="d-flex gap-1 mt-3 pt-3 border-top border-light">
                        <button
                          className="d-navbar-icon-btn flex-grow-1"
                          onClick={() => handleEdit(cat, 'menu')}
                        >
                          <MdEdit /> Edit
                        </button>
                        <button
                          className="d-navbar-icon-btn text-danger flex-grow-1"
                          onClick={() => handleDeleteClick(cat, 'menu')}
                        >
                          <MdDelete /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </Col>
              ))}
            </Row>
          </Tab>

          <Tab eventKey="bar" title={<><MdLocalBar /> Bar Categories</>}>
            <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
              <div className="d-section-sub">{barCategories.length} bar categories</div>
              {canAddEditDelete && (
                <button className="d-btn-gold" onClick={() => handleAdd('bar')}>
                  <MdAdd /> Add Bar Category
                </button>
              )}
            </div>
            <Row className="g-4">
              {barCategories.map((cat) => (
                <Col key={cat.id} xs={12} sm={6} md={4} lg={3}>
                  <div className="d-category-card h-100">
                    <div className="d-flex align-items-center gap-3">
                      <div className="d-category-icon" style={{ background: `${getCategoryColor(cat.type)}15`, color: getCategoryColor(cat.type) }}>
                        {cat.icon || <MdLocalBar />}
                      </div>
                      <div className="flex-grow-1">
                        <h5 className="d-section-title mb-0">{cat.name}</h5>
                        <div className="d-page-sub">Type: {cat.type}</div>
                      </div>
                    </div>
                    {canAddEditDelete && (
                      <div className="d-flex gap-1 mt-3 pt-3 border-top border-light">
                        <button
                          className="d-navbar-icon-btn flex-grow-1"
                          onClick={() => handleEdit(cat, 'bar')}
                        >
                          <MdEdit /> Edit
                        </button>
                        <button
                          className="d-navbar-icon-btn text-danger flex-grow-1"
                          onClick={() => handleDeleteClick(cat, 'bar')}
                        >
                          <MdDelete /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </Col>
              ))}
            </Row>
          </Tab>

          <Tab eventKey="cuisine" title={<><MdLocalDining /> Cuisines</>}>
            <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
              <div className="d-section-sub">{cuisines.length} cuisines</div>
              {canAddEditDelete && (
                <button className="d-btn-gold" onClick={() => handleAdd('cuisine')}>
                  <MdAdd /> Add Cuisine
                </button>
              )}
            </div>
            <Row className="g-4">
              {cuisines.map((cuisine) => (
                <Col key={cuisine.id} xs={12} sm={6} md={4} lg={3}>
                  <div className="d-category-card h-100">
                    <div className="d-flex align-items-center gap-3">
                      <div className="d-category-icon" style={{ background: '#f39c1215', color: '#f39c12' }}>
                        {cuisine.icon || <MdRestaurant />}
                      </div>
                      <div className="flex-grow-1">
                        <h5 className="d-section-title mb-0">{cuisine.name}</h5>
                        <div className="d-page-sub">Cuisine</div>
                      </div>
                    </div>
                    {canAddEditDelete && (
                      <div className="d-flex gap-1 mt-3 pt-3 border-top border-light">
                        <button
                          className="d-navbar-icon-btn flex-grow-1"
                          onClick={() => handleEdit(cuisine, 'cuisine')}
                        >
                          <MdEdit /> Edit
                        </button>
                        <button
                          className="d-navbar-icon-btn text-danger flex-grow-1"
                          onClick={() => handleDeleteClick(cuisine, 'cuisine')}
                        >
                          <MdDelete /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </Col>
              ))}
            </Row>
          </Tab>
        </Tabs>
      </div>

      {/* Modals */}
      <FormModal
        show={showForm}
        onHide={() => setShowForm(false)}
        title={currentItem ? "Edit Item" : (formType === 'menu' ? "Add Menu Category" : formType === 'bar' ? "Add Bar Category" : "Add Cuisine")}
        onSubmit={handleSave}
      >
        <Form.Group>
          <Form.Label className="small fw-bold">Name *</Form.Label>
          <Form.Control
            type="text"
            placeholder={formType === 'menu' ? "e.g. Appetizers" : formType === 'bar' ? "e.g. Mocktails" : "e.g. Thai"}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </Form.Group>
      </FormModal>

      <DeleteModal
        show={showDelete}
        onHide={() => setShowDelete(false)}
        onConfirm={confirmDelete}
        itemName={currentItem?.name}
      />
    </>
  );
}
