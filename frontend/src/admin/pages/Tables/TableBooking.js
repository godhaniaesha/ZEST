import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import {
  MdTableRestaurant, MdFiberManualRecord, MdPeople,
  MdCalendarToday, MdViewList, MdGridView, MdArrowBack
} from 'react-icons/md';
import { tablesAPI } from '../../../api';

export default function TableBooking() {
  const [tables, setTables] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await tablesAPI.getAvailability(selectedDate);
      setTables(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching table availability:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const isTimeReserved = (reservations, checkTime) => {
    if (!reservations || reservations.length === 0) return false;
    
    const checkDate = new Date(checkTime);
    
    for (const res of reservations) {
      if (!res.startTime || !res.endTime) continue;
      
      const start = new Date(res.startTime);
      const end = new Date(res.endTime);
      
      // Check if checkTime falls within the reservation window
      if (checkDate >= start && checkDate <= end) {
        return true;
      }
    }
    return false;
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

  const handleTableClick = (table) => {
    setSelectedTable(table);
    setViewMode('list');
  };

  const handleBackToGrid = () => {
    setSelectedTable(null);
    setViewMode('grid');
  };

  // Generate time slots from 10 AM to 10 PM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 10; hour <= 22; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const date = new Date(selectedDate);
        date.setHours(hour, min, 0, 0);
        slots.push(date.toISOString());
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdTableRestaurant /> Table Booking View
          </div>
          <div className="d-page-sub">View table availability and reservations by date</div>
        </div>
        <div className="d-flex gap-3 align-items-center flex-wrap">
          <div className="d-flex gap-2 align-items-center">
            <MdCalendarToday />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1.5px solid var(--d-border)',
                borderRadius: 'var(--d-radius-md)',
                fontSize: '0.9rem'
              }}
            />
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '8px 16px',
                border: '1.5px solid var(--d-border)',
                borderRadius: 'var(--d-radius-md)',
                background: viewMode === 'grid' ? 'var(--d-primary)' : 'var(--d-white)',
                color: viewMode === 'grid' ? 'var(--d-white)' : 'var(--d-text-muted)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <MdGridView /> Grid View
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px 16px',
                border: '1.5px solid var(--d-border)',
                borderRadius: 'var(--d-radius-md)',
                background: viewMode === 'list' ? 'var(--d-primary)' : 'var(--d-white)',
                color: viewMode === 'list' ? 'var(--d-white)' : 'var(--d-text-muted)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <MdViewList /> List View
            </button>
          </div>
        </div>
      </div>

      <div className="d-flex gap-3 align-items-center mb-4">
        <div className="d-flex align-items-center gap-2 small fw-bold">
          <MdFiberManualRecord style={{ color: 'var(--d-success)' }} /> Free
        </div>
        <div className="d-flex align-items-center gap-2 small fw-bold">
          <MdFiberManualRecord style={{ color: 'var(--d-info)' }} /> Reserved
        </div>
        <div className="d-flex align-items-center gap-2 small fw-bold">
          <MdFiberManualRecord style={{ color: 'var(--d-danger)' }} /> Occupied
        </div>
      </div>

      {viewMode === 'grid' && (
        <div className="d-card">
          <div className="d-section-title">Table Availability - {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div className="d-section-sub">
            {loading ? 'Loading...' : `${tables.length} tables`}
          </div>

          {loading ? (
            <div className="text-center py-5 text-muted">Loading tables...</div>
          ) : tables.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <MdTableRestaurant fontSize="3rem" />
              <p className="mt-3">No tables found</p>
            </div>
          ) : (
            <div className="d-table-status-grid mt-4" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              {tables.map((table) => (
                <Card
                  key={table._id}
                  onClick={() => handleTableClick(table)}
                  style={{
                    border: `2px solid ${getStatusColor(table.status)}`,
                    borderRadius: 'var(--d-radius-md)',
                    cursor: 'pointer',
                    background: getStatusBg(table.status),
                    transition: 'var(--d-transition)'
                  }}
                  className="table-card"
                >
                  <Card.Body>
                    <div style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      color: 'var(--d-primary)',
                      marginBottom: '8px'
                    }}>
                      {table.displayId || (table.type === 'Bar' ? 'B-' : 'C-') + String(table.number).padStart(2, '0')}
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        fontSize: '0.8rem',
                        color: 'var(--d-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <MdPeople /> {table.capacity}
                      </div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: 'var(--d-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {table.type}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '8px',
                      color: getStatusColor(table.status)
                    }}>
                      {table.status}
                    </div>
                    <div style={{
                      fontSize: '0.7rem',
                      color: 'var(--d-text-light)',
                      fontWeight: 600
                    }}>
                      {table.location}
                    </div>
                    {table.reservations && table.reservations.length > 0 && (
                      <div style={{
                        marginTop: '12px',
                        paddingTop: '12px',
                        borderTop: '1px solid var(--d-border)',
                        fontSize: '0.75rem'
                      }}>
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>Reservations:</div>
                        {table.reservations.slice(0, 2).map((res, idx) => (
                          <div key={idx} style={{ color: 'var(--d-text-muted)' }}>
                            {res.time} - {res.customerName}
                          </div>
                        ))}
                        {table.reservations.length > 2 && (
                          <div style={{ color: 'var(--d-primary)', fontWeight: 600 }}>
                            +{table.reservations.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="d-card">
          <div className="d-page-heading d-flex align-items-center gap-2 mb-3">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleBackToGrid}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <MdArrowBack /> Back to Grid
            </Button>
            {selectedTable && (
              <span>
                {selectedTable.displayId || (selectedTable.type === 'Bar' ? 'B-' : 'C-') + String(selectedTable.number).padStart(2, '0')} - 
                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            )}
          </div>

          {selectedTable ? (
            <>
              <div className="mb-4">
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '12px'
                }}>
                  {timeSlots.map((slot, idx) => {
                    const isReserved = isTimeReserved(selectedTable.reservations, slot);
                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '12px',
                          border: '2px solid',
                          borderColor: isReserved ? 'var(--d-info)' : 'var(--d-success)',
                          borderRadius: 'var(--d-radius-md)',
                          background: isReserved ? 'rgba(52,152,219,0.1)' : 'rgba(46,204,113,0.1)',
                          textAlign: 'center',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          color: isReserved ? 'var(--d-info)' : 'var(--d-success)'
                        }}
                      >
                        {formatTime(slot)}
                        {isReserved && (
                          <div style={{ fontSize: '0.7rem', marginTop: '4px' }}>Reserved</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedTable.reservations && selectedTable.reservations.length > 0 && (
                <div>
                  <div className="d-section-title mb-3">Reservation Details</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {selectedTable.reservations.map((res, idx) => (
                      <Card key={idx} style={{ border: '1px solid var(--d-border)' }}>
                        <Card.Body>
                          <Row>
                            <Col md={3}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Time</div>
                              <div style={{ fontWeight: 600 }}>{res.time}</div>
                            </Col>
                            <Col md={3}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Customer</div>
                              <div style={{ fontWeight: 600 }}>{res.customerName}</div>
                            </Col>
                            <Col md={3}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Window</div>
                              <div style={{ fontSize: '0.85rem' }}>
                                {formatTime(res.startTime)} - {formatTime(res.endTime)}
                              </div>
                            </Col>
                            <Col md={3}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Status</div>
                              <div style={{
                                fontWeight: 600,
                                color: res.status === 'Confirmed' ? 'var(--d-success)' : 'var(--d-info)'
                              }}>
                                {res.status}
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {(!selectedTable.reservations || selectedTable.reservations.length === 0) && (
                <div className="text-center py-5 text-muted">
                  No reservations for this table on selected date
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-5 text-muted">
              Select a table from grid view to see detailed reservations
            </div>
          )}
        </div>
      )}
    </>
  );
}
