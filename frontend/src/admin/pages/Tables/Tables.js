import React, { useState } from 'react';
import { Row, Col, Form, Badge } from 'react-bootstrap';
import { 
  MdTableRestaurant, MdFiberManualRecord, MdPeople, 
  MdAdd, MdEdit, MdDelete, MdSearch, MdFilterList
} from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';

const INITIAL_TABLES = [
  { id: 'T-1', name: 'Table 1', capacity: 2, type: 'Cafe', status: 'Occupied', location: 'Indoor' },
  { id: 'T-2', name: 'Table 2', capacity: 4, type: 'Cafe', status: 'Free', location: 'Indoor' },
  { id: 'T-3', name: 'Table 3', capacity: 2, type: 'Cafe', status: 'Reserved', location: 'Outdoor' },
  { id: 'T-4', name: 'Table 4', capacity: 6, type: 'Cafe', status: 'Occupied', location: 'Indoor' },
  { id: 'T-5', name: 'Table 5', capacity: 4, type: 'Cafe', status: 'Free', location: 'Indoor' },
  { id: 'T-6', name: 'Table 6', capacity: 2, type: 'Cafe', status: 'Free', location: 'Outdoor' },
  { id: 'T-7', name: 'Table 7', capacity: 4, type: 'Cafe', status: 'Occupied', location: 'Indoor' },
  { id: 'T-8', name: 'Table 8', capacity: 4, type: 'Cafe', status: 'Reserved', location: 'Outdoor' },
  { id: 'B-1', name: 'Bar Seat 1', capacity: 1, type: 'Bar', status: 'Occupied', location: 'Bar Counter' },
  { id: 'B-2', name: 'Bar Seat 2', capacity: 1, type: 'Bar', status: 'Free', location: 'Bar Counter' },
];

const TABLE_TYPES = ['All', 'Cafe', 'Bar'];
const LOCATIONS = ['Indoor', 'Outdoor', 'Bar Counter'];
const STATUSES = ['All', 'Free', 'Occupied', 'Reserved'];

export default function Tables({ userRole = 'waiter' }) {
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [activeType, setActiveType] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentTable, setCurrentTable] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    capacity: 2, 
    type: 'Cafe', 
    status: 'Free', 
    location: 'Indoor' 
  });

  // Role-based permissions
  const canAddEditDelete = userRole === 'manager' || userRole === 'superadmin';

  const filtered = tables.filter(table => {
    const matchesType = activeType === 'All' || table.type === activeType;
    const matchesStatus = activeStatus === 'All' || table.status === activeStatus;
    const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         table.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const handleAdd = () => {
    if (!canAddEditDelete) {
      alert('You do not have permission to add tables.');
      return;
    }
    setCurrentTable(null);
    setFormData({ name: '', capacity: 2, type: 'Cafe', status: 'Free', location: 'Indoor' });
    setShowForm(true);
  };

  const handleEdit = (table) => {
    if (!canAddEditDelete) {
      alert('You do not have permission to edit tables.');
      return;
    }
    setCurrentTable(table);
    setFormData({ 
      name: table.name, 
      capacity: table.capacity, 
      type: table.type, 
      status: table.status, 
      location: table.location 
    });
    setShowForm(true);
  };

  const handleDeleteClick = (table) => {
    if (!canAddEditDelete) {
      alert('You do not have permission to delete tables.');
      return;
    }
    setCurrentTable(table);
    setShowDelete(true);
  };

  const handleSave = () => {
    if (currentTable) {
      // Edit
      setTables(tables.map(t => t.id === currentTable.id ? { ...t, ...formData } : t));
    } else {
      // Add
      const prefix = formData.type === 'Bar' ? 'B' : 'T';
      const maxId = tables.filter(t => t.type === formData.type).length + 1;
      const newId = `${prefix}-${maxId}`;
      setTables([...tables, { id: newId, ...formData }]);
    }
    setShowForm(false);
  };

  const confirmDelete = () => {
    setTables(tables.filter(t => t.id !== currentTable.id));
    setShowDelete(false);
  };

  const handleQuickReserve = () => {
    if (!canAddEditDelete) {
      alert('You do not have permission to reserve tables.');
      return;
    }
    alert('Quick Reserve functionality - Opens reservation modal');
  };

  const handleTableClick = (table) => {
    alert(`Table: ${table.name}\nStatus: ${table.status}\nCapacity: ${table.capacity}\nLocation: ${table.location}`);
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

      {/* Filters */}
      <Row className="g-3 mb-4">
        <Col xs={12} md={6}>
          <div className="d-flex gap-2 flex-wrap">
            {TABLE_TYPES.map(type => (
              <button 
                key={type}
                onClick={() => setActiveType(type)}
                className={`d-btn-filter ${activeType === type ? 'active' : ''}`}
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
                className={`d-btn-filter ${activeStatus === status ? 'active' : ''}`}
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
        <Col xs={12} md={6} className="d-flex justify-content-end">
          {canAddEditDelete && (
            <button className="d-btn-outline" onClick={handleQuickReserve}>
              <MdFilterList /> Quick Reserve
            </button>
          )}
        </Col>
      </Row>

      {/* Tables Grid */}
      <div className="d-card">
        <div className="d-section-title">Floor Plan Overview</div>
        <div className="d-section-sub">
          {filtered.length} {filtered.length === 1 ? 'table' : 'tables'} found
        </div>
        
        {filtered.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <MdTableRestaurant fontSize="3rem" />
            <p className="mt-3">No tables found matching your criteria</p>
          </div>
        ) : (
          <div className="d-table-status-grid mt-4">
            {filtered.map((table) => (
              <div 
                key={table.id} 
                className="d-table-box"
                style={{
                  borderColor: getStatusColor(table.status),
                  background: getStatusBg(table.status)
                }}
                onClick={() => handleTableClick(table)}
              >
                <div className="d-table-header">
                  <div className="d-table-id">{table.id}</div>
                  {canAddEditDelete && (
                    <div className="d-table-actions">
                      <button 
                        className="d-table-action-btn"
                        onClick={(e) => { e.stopPropagation(); handleEdit(table); }}
                      >
                        <MdEdit fontSize="0.9rem" />
                      </button>
                      <button 
                        className="d-table-action-btn text-danger"
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(table); }}
                      >
                        <MdDelete fontSize="0.9rem" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="d-table-name">{table.name}</div>
                <div className="d-table-details">
                  <div className="d-table-detail-item">
                    <MdPeople /> {table.capacity}
                  </div>
                  <div className="d-table-detail-item">
                    {table.type}
                  </div>
                </div>
                <div className="d-table-status-text" style={{ color: getStatusColor(table.status) }}>
                  {table.status}
                </div>
                <div className="d-table-location">{table.location}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <FormModal 
        show={showForm} 
        onHide={() => setShowForm(false)} 
        title={currentTable ? "Edit Table" : "Add New Table"}
        onSubmit={handleSave}
      >
        <Row className="g-3">
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-bold">Table Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="e.g. Table 1"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Capacity</Form.Label>
              <Form.Control 
                type="number" 
                min="1"
                max="20"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Type</Form.Label>
              <Form.Select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="Cafe">Cafe</option>
                <option value="Bar">Bar</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Location</Form.Label>
              <Form.Select 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              >
                {LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Status</Form.Label>
              <Form.Select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Free">Free</option>
                <option value="Occupied">Occupied</option>
                <option value="Reserved">Reserved</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </FormModal>

      {/* Delete Modal */}
      <DeleteModal 
        show={showDelete} 
        onHide={() => setShowDelete(false)} 
        onConfirm={confirmDelete}
        itemName={currentTable?.name}
      />

      <style jsx>{`
        .d-table-status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 20px;
        }
        .d-table-box {
          border-radius: var(--d-radius-md);
          padding: 20px;
          text-align: center;
          border: 2px solid var(--d-border);
          transition: var(--d-transition);
          cursor: pointer;
          position: relative;
          background: var(--d-bg);
        }
        .d-table-box:hover {
          transform: translateY(-4px);
          box-shadow: var(--d-shadow-md);
        }
        .d-table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .d-table-id {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--d-primary);
        }
        .d-table-actions {
          display: flex;
          gap: 4px;
        }
        .d-table-action-btn {
          width: 28px;
          height: 28px;
          border: none;
          background: var(--d-white);
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--d-transition);
        }
        .d-table-action-btn:hover {
          background: var(--d-accent-soft);
        }
        .d-table-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--d-text-muted);
          margin-bottom: 12px;
        }
        .d-table-details {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .d-table-detail-item {
          font-size: 0.8rem;
          color: var(--d-text-muted);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .d-table-status-text {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .d-table-location {
          font-size: 0.7rem;
          color: var(--d-text-light);
          font-weight: 600;
        }
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
        @media (max-width: 768px) {
          .d-table-status-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          }
          .d-table-id {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </>
  );
}
