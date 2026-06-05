import React, { useState, useEffect } from 'react';
import { Row, Col, ProgressBar, Form } from 'react-bootstrap';
import {
  MdWarning, MdAdd, MdSearch, MdInventory,
  MdError, MdCheckCircle, MdEdit, MdDelete, MdHistory
} from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';
import Pagination from '../../components/Pagination';
import { inventoryAPI } from '../../../api';

const STATUS_CLASS = {
  'In Stock': 'd-chip-green',
  'Low Stock': 'd-chip-gold',
  'Out of Stock': 'd-chip-red',
  Good: 'd-chip-green',
  Low: 'd-chip-gold',
  Critical: 'd-chip-red',
};

export default function Inventory() {
  const [stockList, setStockList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'General',
    unit: 'kg',
    quantity: '',
    status: 'In Stock',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await inventoryAPI.getAll();
      setStockList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setStockList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const criticalCount = stockList.filter((s) => s.status === 'Out of Stock' || s.status === 'Critical').length;
  const lowCount = stockList.filter((s) => s.status === 'Low Stock' || s.status === 'Low').length;

  const filtered = stockList.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAdd = () => {
    setCurrentItem(null);
    setFormData({ name: '', category: 'General', unit: 'kg', quantity: '', status: 'In Stock' });
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      category: item.category || 'General',
      unit: item.unit,
      quantity: item.quantity,
      status: item.status,
    });
    setShowForm(true);
  };

  const handleDeleteClick = (item) => {
    setCurrentItem(item);
    setShowDelete(true);
  };

  const handleSave = async () => {
    if (!formData.name || formData.quantity === '') {
      alert('Please fill in all required fields');
      return;
    }

    const payload = {
      name: formData.name,
      category: formData.category,
      unit: formData.unit,
      quantity: parseInt(formData.quantity, 10),
      status: formData.status,
    };

    try {
      if (currentItem?._id) {
        await inventoryAPI.update(currentItem._id, payload);
      } else {
        await inventoryAPI.create(payload);
      }
      await loadData();
      setShowForm(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Could not save inventory item.');
    }
  };

  const confirmDelete = async () => {
    try {
      await inventoryAPI.delete(currentItem._id);
      await loadData();
      setShowDelete(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Could not delete inventory item.');
    }
  };

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
          <button className="d-btn-outline d-hide-mobile"><MdHistory /> View Logs</button>
          <button className="d-btn-gold" onClick={handleAdd}><MdAdd /> Add Stock</button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        {[
          { label: 'Total Items', value: stockList.length, icon: <MdInventory />, color: 'd-gold' },
          { label: 'Low Stock', value: lowCount, icon: <MdWarning />, color: 'd-gold' },
          { label: 'Critical', value: criticalCount, icon: <MdError />, color: 'd-red' },
          { label: 'In Stock', value: stockList.length - criticalCount - lowCount, icon: <MdCheckCircle />, color: 'd-green' }
        ].map((s, i) => (
          <Col key={i} xs={12} sm={6} xl={3}>
            <div className="d-stat-card">
              <div className={`d-stat-icon ${s.color}`} style={{ width: '42px', height: '42px', fontSize: '1.1rem' }}>
                {s.icon}
              </div>
              <div>
                <div className="d-stat-value" style={{ fontSize: '1.4rem' }}>{s.value}</div>
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
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="d-flex gap-2">
            <button className="d-btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>Filter by Category</button>
          </div>
        </div>

        <div className="d-table-wrap">
          <table className="d-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Quantity</th>
                <th>Status</th>
                <th style={{ width: '120px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6">Loading inventory...</td></tr>
              ) : currentData.map((s) => (
                <tr key={s._id}>
                  <td><strong>{s.name}</strong></td>
                  <td style={{ color: 'var(--d-text-muted)', fontSize: '0.85rem' }}>{s.category}</td>
                  <td style={{ color: 'var(--d-text-muted)', fontSize: '0.85rem' }}>{s.unit}</td>
                  <td>
                    <div className="d-flex align-items-center gap-3" style={{ minWidth: '120px' }}>
                      <ProgressBar
                        now={Math.min((s.quantity / 20) * 100, 100)}
                        variant={s.status === 'In Stock' ? 'success' : s.status === 'Low Stock' ? 'warning' : 'danger'}
                        style={{ height: '6px', flexGrow: 1 }}
                      />
                      <strong style={{ minWidth: '30px', textAlign: 'right' }}>{s.quantity}</strong>
                    </div>
                  </td>
                  <td><span className={`d-chip ${STATUS_CLASS[s.status] || 'd-chip-gold'}`}>{s.status}</span></td>
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

      {/* Modals */}
      <FormModal
        show={showForm}
        onHide={() => setShowForm(false)}
        title={currentItem ? "Update Stock" : "Add New Stock"}
        onSubmit={handleSave}
      >
        <Row className="g-3">
          <Col xs={12} md={8}>
            <Form.Group>
              <Form.Label className="small fw-bold">Item Name</Form.Label>
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
              <Form.Label className="small fw-bold">Unit</Form.Label>
              <Form.Control
                type="text"
                placeholder="kg, L, btl, etc."
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={4}>
            <Form.Group>
              <Form.Label className="small fw-bold">Category</Form.Label>
              <Form.Control
                type="text"
                placeholder="General, Bar, Kitchen..."
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Current Quantity</Form.Label>
              <Form.Control
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Status</Form.Label>
              <Form.Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </Form.Select>
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
