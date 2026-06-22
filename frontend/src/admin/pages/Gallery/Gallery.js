import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import {
  MdAdd, MdEdit, MdDelete, MdSearch, MdFilterList,
  MdPhotoLibrary, MdRestaurant, MdLocalBar, MdCake, MdChair, MdStar
} from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';
import { galleryAPI } from '../../../api';
import { useAuth } from '../../../contexts/AuthContext';


const CATEGORIES = [
  { name: 'All', icon: <MdFilterList /> },
  { name: 'food', icon: <MdRestaurant /> },
  { name: 'drinks', icon: <MdLocalBar /> },
  { name: 'desserts', icon: <MdCake /> },
  { name: 'ambiance', icon: <MdChair /> },
];


const FORM_SKIP_KEYS = ['_id', '__v', 'createdAt', 'updatedAt'];


const GALLERY_FORM_FIELDS = [
  { name: 'title', label: 'Title *', type: 'text', required: true, col: 12, placeholder: 'e.g. Creamy Mushroom Pasta', minLength: 3, maxLength: 100 },
  { name: 'category', label: 'Category *', type: 'select', required: true, col: 6, options: CATEGORIES.filter(c => c.name !== 'All').map(c => ({ label: c.name.charAt(0).toUpperCase() + c.name.slice(1), value: c.name })) },
  { name: 'tag', label: 'Tag *', type: 'text', required: true, col: 6, placeholder: 'e.g. Mains', minLength: 2, maxLength: 30 },
  { name: 'description', label: 'Description *', type: 'textarea', required: true, col: 12, placeholder: 'Brief description of the gallery item...', minLength: 10, maxLength: 500 },
  { name: 'image', label: 'Image *', type: 'file', col: 12, required: true },
  { name: 'featured', label: 'Featured Item', type: 'checkbox', col: 12 },
];


export default function GalleryManagement() {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '', category: 'food', tag: '', description: '', featured: false,
  });
  const { user } = useAuth();
  const userRole = user?.role || 'chef';


  const canAddEditDelete = userRole === 'manager' || userRole === 'superadmin';


  const loadData = async () => {
    try {
      setLoading(true);
      const response = await galleryAPI.getAll();
      const data = Array.isArray(response.data) ? response.data : [];
      setItems(data);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
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
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });


  // Separate featured and regular items
  const featuredItems = filtered.filter(item => item.featured === true || item.featured === 'true');
  const regularItems = filtered.filter(item => item.featured !== true && item.featured !== 'true');


  const handleAdd = () => {
    setCurrentItem(null);
    setFormData({
      title: '', category: 'food', tag: '', description: '', featured: false,
    });
    setShowForm(true);
  };


  const handleEdit = (item) => {
    setCurrentItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      tag: item.tag,
      description: item.description,
      image: item.image,
      featured: item.featured || false,
    });
    setShowForm(true);
  };


  const handleDeleteClick = (item) => {
    setCurrentItem(item);
    setShowDelete(true);
  };


  // In the handleSave function, around line 130

  const handleSave = async (data, fileData) => {
    try {
      // Validation
      if (!data.title || !data.title.trim()) {
        alert('Please enter a title');
        return;
      }

      // Title validation - text only, length
      if (data.title.length < 3) {
        alert('Title must be at least 3 characters long');
        return;
      }

      if (data.title.length > 100) {
        alert('Title must not exceed 100 characters');
        return;
      }

      if (!/^[a-zA-Z0-9\s\-.,'&]+$/.test(data.title)) {
        alert('Title can only contain letters, numbers, spaces, and basic punctuation');
        return;
      }

      if (!data.category) {
        alert('Please select a category');
        return;
      }

      if (!data.tag || !data.tag.trim()) {
        alert('Please enter a tag');
        return;
      }

      // Tag validation - text only, length
      if (data.tag.length < 2) {
        alert('Tag must be at least 2 characters long');
        return;
      }

      if (data.tag.length > 30) {
        alert('Tag must not exceed 30 characters');
        return;
      }

      if (!/^[a-zA-Z0-9\s\-]+$/.test(data.tag)) {
        alert('Tag can only contain letters, numbers, spaces, and hyphens');
        return;
      }

      if (!data.description || !data.description.trim()) {
        alert('Please enter a description');
        return;
      }

      // Description validation - length
      if (data.description.length < 10) {
        alert('Description must be at least 10 characters long');
        return;
      }

      if (data.description.length > 500) {
        alert('Description must not exceed 500 characters');
        return;
      }

      // Image validation for new items
      if (!currentItem && !fileData?.file) {
        alert('Please select an image');
        return;
      }

      const formDataToSend = new FormData();

      Object.keys(data).forEach(key => {
        if (FORM_SKIP_KEYS.includes(key)) return;

        const value = data[key];

        // Handle boolean values properly
        if (key === 'featured') {
          // Send as boolean, not string
          formDataToSend.append(key, value === true);
          return;
        }

        if (
          value === null ||
          value === undefined ||
          (typeof value === 'object' && !(value instanceof File))
        ) {
          return;
        }

        formDataToSend.append(key, value);
      });

      if (fileData?.file) {
        formDataToSend.append(fileData.name, fileData.file);
      }

      if (currentItem) {
        // Edit
        await galleryAPI.update(currentItem._id, formDataToSend);
        alert('Gallery item updated successfully');
      } else {
        // Add
        await galleryAPI.create(formDataToSend);
        alert('Gallery item added successfully');
      }

      await loadData();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving gallery item:', error);
      alert('Failed to save gallery item');
    }
  };

  const confirmDelete = async () => {
    try {
      await galleryAPI.delete(currentItem._id);
      alert('Gallery item deleted successfully');
      await loadData();
      setShowDelete(false);
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      alert('Failed to delete gallery item');
    }
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };


  if (loading) {
    return (
      <div className="text-center py-5">
        <div>Loading gallery...</div>
      </div>
    );
  }

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdPhotoLibrary /> Gallery Management
          </div>
          <div className="d-page-sub">Create and manage your gallery items</div>
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
            {CATEGORIES.map(c => (
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
                {c.icon} {c.name.charAt(0).toUpperCase() + c.name.slice(1)}
              </button>
            ))}
          </div>
        </Col>
        <Col xs={12} lg={4}>
          <div className="d-navbar-search-box w-100 m-0">
            <MdSearch className="d-search-icon" />
            <input
              type="text"
              placeholder="Search gallery..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Col>
      </Row>


      <div className="d-section-sub mb-3">
        {filtered.length} {filtered.length === 1 ? 'item' : 'items'} found
      </div>


      {/* Featured Items Section */}
      {featuredItems.length > 0 && (
        <>
          <div className="d-section-title mb-3 d-flex align-items-center gap-2">
            <MdStar style={{ color: '#c9a84c' }} /> Featured Items
          </div>
          <Row className="g-3 mb-5">
            {featuredItems.map(item => (
              <Col key={item._id} xs={12} sm={6} xl={4}>
                <div className="d-card h-100 position-relative" style={{ border: '1px solid #ba9c45' }}>
                  {item.image && (
                    <div style={{
                      width: '100%',
                      height: '200px',
                      borderRadius: 'var(--d-radius-md)',
                      overflow: 'hidden',
                      marginBottom: '12px'
                    }}>
                      <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="d-section-title mb-0" style={{ fontSize: '1rem' }}>{item.title}</h5>
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
                    <div className="d-page-sub mb-2">{item.category.charAt(0).toUpperCase() + item.category.slice(1)} • {item.tag}</div>
                    <div className="text-muted small mb-2" style={{ fontSize: '0.8rem' }}>{item.description}</div>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span className="badge d-chip-gold " style={{ fontSize: '0.75rem', color: '#8a6a1a' }}>Featured</span>
                      <span className="text-muted small" style={{ fontSize: '0.8rem' }}>
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </>
      )}


      {/* All Items Section */}
      {filtered.length > 0 && (
        <>
          <div className="d-section-title mb-3">All Items</div>
          <Row className="g-3">
            {filtered.map(item => (
              <Col key={item._id} xs={12} sm={6} xl={4}>
                <div className="d-card h-100 position-relative">
                  <div className="d-flex gap-3">
                    {item.image && (
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: 'var(--d-radius-md)',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}>
                        <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <h5 className="d-section-title mb-0" style={{ fontSize: '1rem' }}>{item.title}</h5>
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
                      <div className="d-page-sub mb-2">{item.category.charAt(0).toUpperCase() + item.category.slice(1)} • {item.tag}</div>
                      <div
                        className="text-muted small mb-2"
                        style={{
                          fontSize: '0.8rem',
                          wordBreak: 'break-word',
                          whiteSpace: 'normal'
                        }}
                      >
                        {item.description?.length > 70
                          ? `${item.description.slice(0, 70)}...`
                          : item.description}
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        {(item.featured === true || item.featured === 'true') && (
                          <span className="badge d-chip-gold " style={{ fontSize: '0.75rem', color: '#8a6a1a' }}>Featured</span>
                        )}
                        <span className="text-muted small" style={{ fontSize: '0.8rem' }}>
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </>
      )}


      {filtered.length === 0 && (
        <div className="text-center py-5 text-muted">
          No gallery items found
        </div>
      )}


      <FormModal
        show={showForm}
        onHide={() => setShowForm(false)}
        title={currentItem ? "Edit Gallery Item" : "Add New Gallery Item"}
        initialData={formData}
        fields={GALLERY_FORM_FIELDS}
        onSubmit={handleSave}
      />


      <DeleteModal
        show={showDelete}
        onHide={() => setShowDelete(false)}
        onDelete={confirmDelete}
        itemName={currentItem?.title}
      />
    </>
  );
}
