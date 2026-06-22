import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, ProgressBar, Form, Spinner, Alert } from 'react-bootstrap';
import {
  MdWarning, MdAdd, MdSearch, MdInventory,
  MdError, MdCheckCircle, MdEdit, MdDelete, MdHistory
} from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';
import Pagination from '../../components/Pagination';
import { inventoryAPI } from '../../../api';

const STATUS_CLASS = { Good: 'd-chip-green', Low: 'd-chip-gold', Critical: 'd-chip-red' };

const mapFromApi = (item) => ({
  id: item._id,
  name: item.name,
  category: item.category || 'General',
  unit: item.unit,
  qty: Number(item.quantity) || 0,
  min: Number(item.minQuantity) || 0,
  status: item.status,
});

const mapToApi = (item) => ({
  name: item.name,
  category: item.category || 'General',
  unit: item.unit,
  quantity: item.qty,
  minQuantity: item.min,
});

const getStatus = (qty, min) => {
  if (min <= 0) return 'Good';
  if (qty <= min / 2) return 'Critical';
  if (qty <= min) return 'Low';
  return 'Good';
};

export default function Inventory() {
  const [stockList, setStockList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: 'General', unit: 'kg', qty: '', min: '' });

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await inventoryAPI.getAll();
      const items = res.data.map(mapFromApi);
      setStockList(items);
      
      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(items.map(item => item.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const criticalCount = stockList.filter(s => s.status === 'Critical').length;
  const lowCount = stockList.filter(s => s.status === 'Low').length;

  // Filter by search term AND category
  const filtered = stockList.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(Math.ceil(filtered.length / itemsPerPage), 1);
  const currentData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAdd = () => {
    setCurrentItem(null);
    setFormData({ name: '', category: 'General', unit: 'kg', qty: '', min: '' });
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      category: item.category || 'General',
      unit: item.unit,
      qty: item.qty,
      min: item.min,
    });
    setShowForm(true);
  };

  const handleDeleteClick = (item) => {
    setCurrentItem(item);
    setShowDelete(true);
  };

  const handleSave = async () => {
    if (saving) return;

    if (!formData.name || !formData.unit || formData.qty === '' || formData.min === '') {
      alert('Please enter an item name');
      return;
    }

    const qty = parseInt(formData.qty, 10);
    const min = parseInt(formData.min, 10);

    if (isNaN(qty) || isNaN(min)) {
      alert('Quantity and Minimum Level must be valid numbers');
      return;
    }

    if (qty < 0) {
      alert('Quantity cannot be negative');
      return;
    }

    if (min <= 0) {
      alert('Minimum Level must be greater than 0');
      return;
    }

    const payload = mapToApi({ ...formData, qty, min });

    setSaving(true);
    try {
      if (currentItem) {
        const res = await inventoryAPI.update(currentItem.id, payload);
        const updated = mapFromApi(res.data);
        setStockList(stockList.map(s => (s.id === currentItem.id ? updated : s)));
        alert('Stock updated successfully');
      } else {
        const res = await inventoryAPI.create(payload);
        const created = mapFromApi(res.data);
        setStockList([...stockList, created]);
        alert('Stock added successfully');
      }
      setShowForm(false);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to save inventory item';
      alert(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await inventoryAPI.delete(currentItem.id);
      setStockList(stockList.filter(s => s.id !== currentItem.id));
      alert('Stock deleted successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete inventory item');
    } finally {
      setShowDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdInventory /> Stock & Inventory
          </div>
          <div className="d-page-sub">Monitor supplies for your kitchen and bar</div>
        </div>
        <div className="d-flex gap-2">
          <button className="d-btn-gold" onClick={handleAdd}><MdAdd /> Add Stock</button>
        </div>
      </div>

      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

   <Row className="g-3 mb-4">
  {[
    {
      label: 'Total Items',
      value: stockList.length,
      icon: <MdInventory />,
      color: 'd-gold'
    },
    {
      label: 'Low Stock',
      value: lowCount,
      icon: <MdWarning />,
      color: 'd-gold'
    },
    {
      label: 'Critical',
      value: criticalCount,
      icon: <MdError />,
      color: 'd-red'
    },
    {
      label: 'In Stock',
      value: stockList.length - criticalCount - lowCount,
      icon: <MdCheckCircle />,
      color: 'd-green'
    }
  ].map((s, i) => (
    <Col key={i} xs={12} sm={6} xl={3}>
      <div className="d-stat-card">
        <div
          className={`d-stat-icon ${s.color}`}
          style={{ width: '42px', height: '42px', fontSize: '1.1rem' }}
        >
          {s.icon}
        </div>
        <div>
          <div className="d-stat-value" style={{ fontSize: '1.4rem' }}>
            {s.value}
          </div>
          <div className="d-stat-label">{s.label}</div>
        </div>
      </div>
    </Col>
  ))}
</Row>

      <div className="d-card mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div className="d-navbar-search-box m-0" style={{ width: '300px' }}>
            <MdSearch className="d-search-icon" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => { 
                setSearchTerm(e.target.value); 
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="d-flex gap-2">
            <Form.Select 
              value={selectedCategory} 
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '200px', padding: '6px 14px', fontSize: '0.9rem' }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Form.Select>
          </div>
        </div>

        <div className="d-table-wrap">
          <table className="d-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Stock Level</th>
                <th>Min. Level</th>
                <th>Status</th>
                <th style={{ width: '120px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">No inventory items found</td>
                </tr>
              ) : currentData.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.name}</strong></td>
                  <td style={{ color: 'var(--d-text-muted)', fontSize: '0.85rem' }}>{s.category}</td>
                  <td style={{ color: 'var(--d-text-muted)', fontSize: '0.85rem' }}>{s.unit}</td>
                  <td>
                    <div className="d-flex align-items-center gap-3" style={{ minWidth: '150px' }}>
                      <ProgressBar
                        now={s.min > 0 ? Math.min((s.qty / (s.min * 2)) * 100, 100) : 100}
                        variant={s.status === 'Good' ? 'success' : s.status === 'Low' ? 'warning' : 'danger'}
                        style={{ height: '6px', flexGrow: 1 }}
                      />
                      <strong style={{ minWidth: '30px', textAlign: 'right' }}>{s.qty}</strong>
                    </div>
                  </td>
                  <td style={{ color: 'var(--d-text-muted)' }}>{s.min} {s.unit}</td>
                  <td><span className={`d-chip ${STATUS_CLASS[s.status]}`}>{s.status}</span></td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="d-navbar-icon-btn" onClick={() => handleEdit(s)}><MdEdit /></button>
                      <button className="d-navbar-icon-btn text-danger" onClick={() => handleDeleteClick(s)}><MdDelete /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4">
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      <FormModal
        show={showForm}
        onHide={() => setShowForm(false)}
        title={currentItem ? "Update Stock" : "Add New Stock"}
        onSubmit={handleSave}
      >
        <Row className="g-3">
          <Col xs={12} md={8}>
            <Form.Group>
              <Form.Label className="small fw-bold">Item Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Arborio Rice"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={4}>
            <Form.Group>
              <Form.Label className="small fw-bold">Unit *</Form.Label>
              <Form.Control
                type="text"
                placeholder="kg, L, btl, etc."
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Category</Form.Label>
              <Form.Control
                type="text"
                placeholder="Kitchen, Bar, etc."
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Current Quantity *</Form.Label>
              <Form.Control
                type="number"
                value={formData.qty}
                onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                isInvalid={formData.qty !== '' && parseInt(formData.qty, 10) < 0}
                required
              />
              <Form.Control.Feedback type="invalid">
                Quantity cannot be negative
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Minimum Level (Alert) *</Form.Label>
              <Form.Control
                type="number"
                value={formData.min}
                onChange={(e) => setFormData({ ...formData, min: e.target.value })}
                isInvalid={formData.min !== '' && parseInt(formData.min, 10) <= 0}
                required
              />
              <Form.Control.Feedback type="invalid">
                Minimum Level must be greater than 0
              </Form.Control.Feedback>
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