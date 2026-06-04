import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import {
  MdTableRestaurant, MdFiberManualRecord, MdPeople,
  MdAdd, MdEdit, MdDelete, MdSearch, MdFilterList
} from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';
import { tablesAPI } from '../../../api';
import { useAuth } from '../../../contexts/AuthContext';

const TABLE_TYPES = ['All', 'Cafe', 'Bar'];
const LOCATIONS = ['Indoor', 'Outdoor', 'Bar Counter'];
const STATUSES = ['All', 'Free', 'Occupied', 'Reserved'];

export default function Tables() {
  const [tables, setTables] = useState([]);
  const [activeType, setActiveType] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const { user } = useAuth();
  const userRole = user?.role || 'waiter';

  const canAddEditDelete = userRole === 'manager' || userRole === 'superadmin';

  const loadData = async () => {
    try {
      const response = await tablesAPI.getAll();
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = tables.filter(table => {
    const matchesType = activeType === 'All' || table.type === activeType;
    const matchesStatus = activeStatus === 'All' || table.status === activeStatus;
    const matchesSearch = table.number.toString().includes(searchTerm.toLowerCase()) ||
                         table.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const handleAdd = () => {
    setCurrentItem(null);
    setShowForm(true);
  };

  const handleEdit = (table) => {
    setCurrentItem(table);
    setShowForm(true);
  };

  const handleDeleteClick = (table) => {
    setCurrentItem(table);
    setShowDelete(true);
  };

  const handleSave = async (formData) => {
    if (!formData.number || !formData.capacity || !formData.type || !formData.location || !formData.status) {
      alert('Please fill in all required fields');
      return;
    }
    if (parseInt(formData.capacity) <= 0 || parseInt(formData.capacity) > 50) {
      alert('Capacity must be between 1 and 50');
      return;
    }
    try {
      if (currentItem) {
        await tablesAPI.update(currentItem._id, formData);
      } else {
        await tablesAPI.create(formData);
      }
      await loadData();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving table:', error);
      alert('Failed to save table');
    }
  };

  const confirmDelete = async () => {
    try {
      await tablesAPI.delete(currentItem._id);
      loadData();
      setShowDelete(false);
    } catch (error) {
      console.error('Error deleting table:', error);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Free': return 'var(--d-success)';
      case 'Occupied': return 'var(--d-danger)';
      case 'Reserved': return 'var(--d-info)';
      default: return 'var(--d-text-muted)';
    }
  };

  const getStatusBg = (status) => {
    switch(status) {
      case 'Free': return 'rgba(46,204,113,0.1)';
      case 'Occupied': return 'rgba(231,76,60,0.1)';
      case 'Reserved': return 'rgba(52,152,219,0.1)';
      default: return 'var(--d-bg)';
    }
  };

  const formFields = [
    { name: 'number', label: 'Table Number', type: 'number', required: true, col: 6 },
    { name: 'capacity', label: 'Capacity', type: 'number', required: true, col: 6, min: 1, max: 20 },
    { name: 'type', label: 'Type', type: 'select', required: true, col: 6, options: TABLE_TYPES.filter(c => c !== 'All').map(c => ({ label: c, value: c })) },
    { name: 'location', label: 'Location', type: 'select', required: true, col: 6, options: LOCATIONS.map(c => ({ label: c, value: c })) },
    { name: 'status', label: 'Status', type: 'select', required: true, col: 12, options: STATUSES.filter(c => c !== 'All').map(c => ({ label: c, value: c })) },
  ];

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdTableRestaurant /> Table Management
          </div>
          <div className="d-page-sub">Manage restaurant tables and seating arrangements</div>
        </div>
        <div className="d-flex gap-3 align-items-center flex-wrap">
          <div className="d-flex gap-3">
            <div className="d-flex align-items-center gap-2 small fw-bold">
              <MdFiberManualRecord style={{ color: 'var(--d-success)' }} /> Free
            </div>
            <div className="d-flex align-items-center gap-2 small fw-bold">
              <MdFiberManualRecord style={{ color: 'var(--d-danger)' }} /> Occupied
            </div>
            <div className="d-flex align-items-center gap-2 small fw-bold">
              <MdFiberManualRecord style={{ color: 'var(--d-info)' }} /> Reserved
            </div>
          </div>
          {canAddEditDelete && (
            <button className="d-btn-gold" onClick={handleAdd}>
              <MdAdd /> Add New Table
            </button>
          )}
        </div>
      </div>

      <Row className="g-3 mb-4">
        <Col xs={12} md={6}>
          <div className="d-flex gap-2 flex-wrap">
            {TABLE_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                style={{
                  padding: '8px 16px',
                  border: '1.5px solid var(--d-border)',
                  borderRadius: 'var(--d-radius-md)',
                  background: activeType === type ? 'var(--d-primary)' : 'var(--d-white)',
                  color: activeType === type ? 'var(--d-white)' : 'var(--d-text-muted)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'var(--d-transition)'
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="d-flex gap-2 flex-wrap">
            {STATUSES.map(status => (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                style={{
                  padding: '8px 16px',
                  border: '1.5px solid var(--d-border)',
                  borderRadius: 'var(--d-radius-md)',
                  background: activeStatus === status ? 'var(--d-primary)' : 'var(--d-white)',
                  color: activeStatus === status ? 'var(--d-white)' : 'var(--d-text-muted)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'var(--d-transition)'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col xs={12} md={6}>
          <div className="d-navbar-search-box w-100 m-0">
            <MdSearch className="d-search-icon" />
            <input
              type="text"
              placeholder="Search tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Col>
      </Row>

      <div className="d-card">
        <div className="d-section-title">Floor Plan Overview</div>
        <div className="d-section-sub">
          {loading ? 'Loading...' : `${filtered.length} ${filtered.length === 1 ? 'table' : 'tables'} found`}
        </div>

        {loading ? (
          <div className="text-center py-5 text-muted">Loading tables...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <MdTableRestaurant fontSize="3rem" />
            <p className="mt-3">No tables found matching your criteria</p>
          </div>
        ) : (
          <div className="d-table-status-grid mt-4" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '20px'
          }}>
            {filtered.map((table) => (
              <div
                key={table._id}
                className="d-table-box"
                style={{
                  border: `2px solid ${getStatusColor(table.status)}`,
                  borderRadius: 'var(--d-radius-md)',
                  padding: '20px',
                  textAlign: 'center',
                  transition: 'var(--d-transition)',
                  cursor: 'pointer',
                  position: 'relative',
                  background: getStatusBg(table.status)
                }}
              >
                <div className="d-table-header" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <div className="d-table-id" style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    color: 'var(--d-primary)'
                  }}>{table.displayId || (table.type === 'Bar' ? 'B-' : 'C-') + String(table.number).padStart(2, '0')}</div>
                  {canAddEditDelete && (
                    <div className="d-table-actions" style={{
                      display: 'flex',
                      gap: '4px'
                    }}>
                      <button
                        className="d-table-action-btn"
                        onClick={() => handleEdit(table)}
                        style={{
                          width: '28px',
                          height: '28px',
                          border: 'none',
                          background: 'var(--d-white)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'var(--d-transition)'
                        }}
                      >
                        <MdEdit fontSize="0.9rem" />
                      </button>
                      <button
                        className="d-table-action-btn text-danger"
                        onClick={() => handleDeleteClick(table)}
                        style={{
                          width: '28px',
                          height: '28px',
                          border: 'none',
                          background: 'var(--d-white)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'var(--d-transition)'
                        }}
                      >
                        <MdDelete fontSize="0.9rem" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="d-table-details" style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <div className="d-table-detail-item" style={{
                    fontSize: '0.8rem',
                    color: 'var(--d-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <MdPeople /> {table.capacity}
                  </div>
                  <div className="d-table-detail-item" style={{
                    fontSize: '0.8rem',
                    color: 'var(--d-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {table.type}
                  </div>
                </div>
                <div className="d-table-status-text" style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                  color: getStatusColor(table.status)
                }}>
                  {table.status}
                </div>
                <div className="d-table-location" style={{
                  fontSize: '0.7rem',
                  color: 'var(--d-text-light)',
                  fontWeight: 600
                }}>{table.location}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FormModal
        show={showForm}
        onHide={() => setShowForm(false)}
        onSave={handleSave}
        title={currentItem ? "Edit Table" : "Add New Table"}
        initialData={currentItem || {}}
        fields={formFields}
      />

      <DeleteModal
        show={showDelete}
        onHide={() => setShowDelete(false)}
        onDelete={confirmDelete}
        itemName={`Table ${currentItem?.number}`}
      />
    </>
  );
}
