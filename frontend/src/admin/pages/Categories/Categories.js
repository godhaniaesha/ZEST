import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Tab, Tabs } from 'react-bootstrap';
import { MdAdd, MdEdit, MdDelete, MdRestaurantMenu, MdLocalBar, MdLocalDining, MdFastfood, MdRestaurant } from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';
import { categoriesAPI, cuisinesAPI } from '../../../api';
import { useAuth } from '../../../contexts/AuthContext';

const EMPTY_CATEGORY = { name: '', type: 'Cafe', description: '' };

export default function Categories() {
  const [menuCategories, setMenuCategories] = useState([]);
  const [barCategories, setBarCategories] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const userRole = user?.role || 'chef';
  const [activeTab, setActiveTab] = useState(userRole === 'bartender' ? 'bar' : 'menu');

  // Role-based permissions
  const canAddEditDelete = userRole === 'chef' || userRole === 'manager' || userRole === 'superadmin' || userRole === 'bartender';
  const canSeeMenu = userRole === 'chef' || userRole === 'manager' || userRole === 'superadmin';
  const canSeeBar = userRole === 'bartender' || userRole === 'manager' || userRole === 'superadmin';
  const canSeeCuisine = userRole === 'chef' || userRole === 'manager' || userRole === 'superadmin';

  // Modal States
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formType, setFormType] = useState(null);
  const [formData, setFormData] = useState(EMPTY_CATEGORY);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, cuiRes] = await Promise.all([
        categoriesAPI.getAll(),
        cuisinesAPI.getAll()
      ]);
      
      const allCats = catRes.data || [];
      setMenuCategories(allCats.filter(c => c.type === 'Cafe'));
      setBarCategories(allCats.filter(c => c.type === 'Bar'));
      setCuisines(cuiRes.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = (type) => {
    if (!canAddEditDelete) {
      alert('You do not have permission to add.');
      return;
    }
    setFormType(type);
    setCurrentItem(null);
    setFormData({ name: '', type: type === 'bar' ? 'Bar' : 'Cafe', description: '' });
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const handleEdit = (item, type) => {
    if (!canAddEditDelete) {
      alert('You do not have permission to edit.');
      return;
    }
    setFormType(type);
    setCurrentItem(item);
    setFormData({ name: item.name, type: item.type, description: item.description || '' });
    setImageFile(null);
    setImagePreview(item.img || null);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert('Please fill in the name');
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description || '');
    if (imageFile) {
      data.append('img', imageFile);
    }

    try {
      if (formType === 'cuisine') {
        if (currentItem) {
          await cuisinesAPI.update(currentItem._id, data);
        } else {
          await cuisinesAPI.create(data);
        }
      } else {
        const type = formType === 'bar' ? 'Bar' : 'Cafe';
        data.append('type', type);
        if (currentItem) {
          await categoriesAPI.update(currentItem._id, data);
        } else {
          await categoriesAPI.create(data);
        }
      }
      await loadData();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save');
    }
  };

  const confirmDelete = async () => {
    try {
      if (formType === 'cuisine') {
        await cuisinesAPI.delete(currentItem._id);
      } else {
        await categoriesAPI.delete(currentItem._id);
      }
      await loadData();
      setShowDelete(false);
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete');
    }
  };

  // Helper to get color based on type
  const getCategoryColor = (type) => {
    return type === 'Bar' ? '#3498db' : '#2ecc71';
  };

  const getIcon = (cat) => {
    if (formType === 'cuisine') return <MdRestaurant />;
    return cat.type === 'Bar' ? <MdLocalBar /> : <MdRestaurant />;
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
          {canSeeMenu && (
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
                  <Col key={cat._id} xs={12} sm={6} md={4} lg={3}>
                    <div className="d-category-card h-100">
                      <div className="d-flex align-items-center gap-3">
                        <div className="d-category-icon" style={{ background: `${getCategoryColor(cat.type)}15`, color: getCategoryColor(cat.type) }}>
                        {cat.img ? <img src={cat.img} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} /> : <MdRestaurant />}
                      </div>
                      <div className="flex-grow-1">
                        <h5 className="d-section-title mb-0">{cat.name}</h5>
                        <div className="d-page-sub">Type: {cat.type}</div>
                      </div>
                    </div>
                    {cat.description && <div className="mt-2 small text-muted">{cat.description}</div>}
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
          )}

          {canSeeBar && (
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
                  <Col key={cat._id} xs={12} sm={6} md={4} lg={3}>
                    <div className="d-category-card h-100">
                      <div className="d-flex align-items-center gap-3">
                        <div className="d-category-icon" style={{ background: `${getCategoryColor(cat.type)}15`, color: getCategoryColor(cat.type) }}>
                        {cat.img ? <img src={cat.img} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} /> : <MdLocalBar />}
                      </div>
                      <div className="flex-grow-1">
                        <h5 className="d-section-title mb-0">{cat.name}</h5>
                        <div className="d-page-sub">Type: {cat.type}</div>
                      </div>
                    </div>
                    {cat.description && <div className="mt-2 small text-muted">{cat.description}</div>}
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
          )}

          {canSeeCuisine && (
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
                  <Col key={cuisine._id} xs={12} sm={6} md={4} lg={3}>
                    <div className="d-category-card h-100">
                      <div className="d-flex align-items-center gap-3">
                        <div className="d-category-icon" style={{ background: '#f39c1215', color: '#f39c12' }}>
                        {cuisine.img ? <img src={cuisine.img} alt={cuisine.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} /> : <MdRestaurant />}
                      </div>
                      <div className="flex-grow-1">
                        <h5 className="d-section-title mb-0">{cuisine.name}</h5>
                        <div className="d-page-sub">Cuisine</div>
                      </div>
                    </div>
                    {cuisine.description && <div className="mt-2 small text-muted">{cuisine.description}</div>}
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
          )}
        </Tabs>
      </div>

      <FormModal
        show={showForm}
        onHide={() => setShowForm(false)}
        title={currentItem ? "Edit Item" : (formType === 'menu' ? "Add Menu Category" : formType === 'bar' ? "Add Bar Category" : "Add Cuisine")}
        onSubmit={handleSave}
      >
        <Form.Group className="mb-3">
          <Form.Label className="small fw-bold">Name *</Form.Label>
          <Form.Control
            type="text"
            placeholder={formType === 'menu' ? "e.g. Appetizers" : formType === 'bar' ? "e.g. Mocktails" : "e.g. Thai"}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label className="small fw-bold">Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter description..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </Form.Group>
        <Form.Group className="mb-3">
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
