import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Form, Tab, Tabs } from 'react-bootstrap';
import {
  MdAdd, MdEdit, MdDelete, MdRestaurantMenu, MdLocalBar,
  MdLocalDining, MdFastfood, MdRestaurant,
} from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';
import { menuAPI } from '../../../api';

const EMPTY_CATEGORY = { name: '', type: 'Cafe', img: '' };
const EMPTY_CUISINE = { name: '', type: 'Cafe', img: '' };

const getCategoryIcon = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('dessert')) return <MdLocalDining />;
  if (n.includes('starter')) return <MdFastfood />;
  if (['cocktail', 'beer', 'wine', 'spirit'].some((k) => n.includes(k))) return <MdLocalBar />;
  return <MdRestaurant />;
};

export default function Categories({ userRole = 'chef' }) {
  const [menuCategories, setMenuCategories] = useState([]);
  const [barCategories, setBarCategories] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menu');

  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formType, setFormType] = useState(null);
  const [formData, setFormData] = useState(EMPTY_CATEGORY);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const canAddEditDelete =
    userRole === 'chef' || userRole === 'manager' || userRole === 'superadmin';

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [cafeCatRes, barCatRes, cuisineRes] = await Promise.all([
        menuAPI.getCategories({ type: 'Cafe' }),
        menuAPI.getCategories({ type: 'Bar' }),
        menuAPI.getCuisines(),
      ]);
      setMenuCategories(Array.isArray(cafeCatRes.data) ? cafeCatRes.data : []);
      setBarCategories(Array.isArray(barCatRes.data) ? barCatRes.data : []);
      setCuisines(Array.isArray(cuisineRes.data) ? cuisineRes.data : []);
    } catch (err) {
      console.error('Error loading categories/cuisines:', err);
      setMenuCategories([]);
      setBarCategories([]);
      setCuisines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetImageState = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAdd = (type) => {
    if (!canAddEditDelete) {
      alert('You do not have permission to add.');
      return;
    }
    setFormType(type);
    setCurrentItem(null);
    resetImageState();
    if (type === 'cuisine') {
      setFormData({ ...EMPTY_CUISINE, type: 'Cafe' });
    } else {
      setFormData({ ...EMPTY_CATEGORY, type: type === 'bar' ? 'Bar' : 'Cafe' });
    }
    setShowForm(true);
  };

  const handleEdit = (item, type) => {
    if (!canAddEditDelete) {
      alert('You do not have permission to edit.');
      return;
    }
    setFormType(type);
    setCurrentItem(item);
    setFormData({ name: item.name, type: item.type, img: item.img || '' });
    resetImageState();
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

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      alert('Please fill in the name');
      return;
    }

    const data = new FormData();
    data.append('name', formData.name.trim());
    data.append('type', formData.type);
    if (imageFile) data.append('img', imageFile);

    try {
      const isCuisine = formType === 'cuisine';
      if (currentItem) {
        if (isCuisine) await menuAPI.updateCuisine(currentItem._id, data);
        else await menuAPI.updateCategory(currentItem._id, data);
      } else if (isCuisine) {
        await menuAPI.createCuisine(data);
      } else {
        await menuAPI.createCategory(data);
      }
      await loadData();
      setShowForm(false);
      resetImageState();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save');
    }
  };

  const confirmDelete = async () => {
    try {
      if (formType === 'cuisine') {
        await menuAPI.deleteCuisine(currentItem._id);
      } else {
        await menuAPI.deleteCategory(currentItem._id);
      }
      await loadData();
      setShowDelete(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const getCategoryColor = (type) => (type === 'Bar' ? '#3498db' : '#2ecc71');

  const renderCategoryCard = (cat, typeKey) => (
    <Col key={cat._id} xs={12} sm={6} md={4} lg={3}>
      <div className="d-category-card h-100">
        <div className="d-flex align-items-center gap-3">
          {cat.img ? (
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 'var(--d-radius-md)',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <img src={cat.img} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div
              className="d-category-icon"
              style={{
                background: `${getCategoryColor(cat.type)}15`,
                color: getCategoryColor(cat.type),
              }}
            >
              {getCategoryIcon(cat.name)}
            </div>
          )}
          <div className="flex-grow-1">
            <h5 className="d-section-title mb-0">{cat.name}</h5>
            <div className="d-page-sub">Type: {cat.type}</div>
          </div>
        </div>
        {canAddEditDelete && (
          <div className="d-flex gap-1 mt-3 pt-3 border-top border-light">
            <button className="d-navbar-icon-btn flex-grow-1" type="button" onClick={() => handleEdit(cat, typeKey)}>
              <MdEdit /> Edit
            </button>
            <button
              className="d-navbar-icon-btn text-danger flex-grow-1"
              type="button"
              onClick={() => handleDeleteClick(cat, typeKey)}
            >
              <MdDelete /> Delete
            </button>
          </div>
        )}
      </div>
    </Col>
  );

  const renderCuisineCard = (cuisine) => (
    <Col key={cuisine._id} xs={12} sm={6} md={4} lg={3}>
      <div className="d-category-card h-100">
        <div className="d-flex align-items-center gap-3">
          {cuisine.img ? (
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 'var(--d-radius-md)',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <img src={cuisine.img} alt={cuisine.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div className="d-category-icon" style={{ background: '#f39c1215', color: '#f39c12' }}>
              <MdRestaurant />
            </div>
          )}
          <div className="flex-grow-1">
            <h5 className="d-section-title mb-0">{cuisine.name}</h5>
            <div className="d-page-sub">Type: {cuisine.type}</div>
          </div>
        </div>
        {canAddEditDelete && (
          <div className="d-flex gap-1 mt-3 pt-3 border-top border-light">
            <button className="d-navbar-icon-btn flex-grow-1" type="button" onClick={() => handleEdit(cuisine, 'cuisine')}>
              <MdEdit /> Edit
            </button>
            <button
              className="d-navbar-icon-btn text-danger flex-grow-1"
              type="button"
              onClick={() => handleDeleteClick(cuisine, 'cuisine')}
            >
              <MdDelete /> Delete
            </button>
          </div>
        )}
      </div>
    </Col>
  );

  const formTitle = currentItem
    ? 'Edit Item'
    : formType === 'menu'
      ? 'Add Menu Category'
      : formType === 'bar'
        ? 'Add Bar Category'
        : 'Add Cuisine';

  if (loading) return <div>Loading categories & cuisines...</div>;

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdLocalDining /> Categories & Cuisines
          </div>
          <div className="d-page-sub">Manage menu categories, bar categories, and cuisines</div>
        </div>
      </div>

      <div className="d-custom-tabs">
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          <Tab eventKey="menu" title={<><MdRestaurantMenu /> Menu Categories</>}>
            <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
              <div className="d-section-sub">{menuCategories.length} cafe categories</div>
              {canAddEditDelete && (
                <button type="button" className="d-btn-gold" onClick={() => handleAdd('menu')}>
                  <MdAdd /> Add Menu Category
                </button>
              )}
            </div>
            <Row className="g-4">{menuCategories.map((cat) => renderCategoryCard(cat, 'menu'))}</Row>
          </Tab>

          <Tab eventKey="bar" title={<><MdLocalBar /> Bar Categories</>}>
            <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
              <div className="d-section-sub">{barCategories.length} bar categories</div>
              {canAddEditDelete && (
                <button type="button" className="d-btn-gold" onClick={() => handleAdd('bar')}>
                  <MdAdd /> Add Bar Category
                </button>
              )}
            </div>
            <Row className="g-4">{barCategories.map((cat) => renderCategoryCard(cat, 'bar'))}</Row>
          </Tab>

          <Tab eventKey="cuisine" title={<><MdLocalDining /> Cuisines</>}>
            <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
              <div className="d-section-sub">{cuisines.length} cuisines</div>
              {canAddEditDelete && (
                <button type="button" className="d-btn-gold" onClick={() => handleAdd('cuisine')}>
                  <MdAdd /> Add Cuisine
                </button>
              )}
            </div>
            <Row className="g-4">{cuisines.map(renderCuisineCard)}</Row>
          </Tab>
        </Tabs>
      </div>

      <FormModal show={showForm} onHide={() => setShowForm(false)} title={formTitle} onSubmit={handleSave}>
        <Row className="g-3">
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-bold">Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder={formType === 'cuisine' ? 'e.g. Thai' : 'e.g. Appetizers'}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Type *</Form.Label>
              <Form.Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                disabled={formType === 'menu' || formType === 'bar'}
              >
                <option value="Cafe">Cafe</option>
                <option value="Bar">Bar</option>
              </Form.Select>
              {(formType === 'menu' || formType === 'bar') && (
                <Form.Text className="text-muted">Set by tab (Cafe or Bar)</Form.Text>
              )}
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-bold">Image</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                  />
                </div>
              )}
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
    </>
  );
}
