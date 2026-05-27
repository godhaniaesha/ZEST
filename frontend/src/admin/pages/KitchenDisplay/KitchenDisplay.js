import React from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import { MdKitchen, MdTimer, MdCheckCircle, MdWarning } from 'react-icons/md';

const KOT_ORDERS = [
  { id: '#K-102', table: 'Table 4', items: ['Cappuccino x2', 'Butter Croissant x1'], time: '5m', status: 'Preparing', type: 'Cafe' },
  { id: '#K-103', table: 'Table 7', items: ['Old Fashioned x1', 'Classic Mojito x1'], time: '2m', status: 'New', type: 'Bar' },
  { id: '#K-104', table: 'Bar Counter', items: ['Draft Beer x2'], time: '8m', status: 'Delayed', type: 'Bar' },
  { id: '#K-105', table: 'Table 2', items: ['Truffle Risotto x1', 'Caesar Salad x1'], time: '12m', status: 'Preparing', type: 'Kitchen' },
];

export default function KitchenDisplay() {
  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading">Live Orders (KOT) 👨‍🍳</div>
          <div className="d-page-sub">Kitchen Order Ticket management and tracking</div>
        </div>
        <div className="d-flex gap-2">
          <Badge bg="danger" className="p-2 px-3">3 High Priority</Badge>
          <Badge bg="warning" text="dark" className="p-2 px-3">5 Pending</Badge>
        </div>
      </div>

      <Row className="g-4">
        {KOT_ORDERS.map((order, i) => (
          <Col key={i} xs={12} md={6} xl={4}>
            <div className={`d-card h-100 ${order.status === 'Delayed' ? 'border-danger' : ''}`}>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold" style={{ fontSize: '1.1rem' }}>{order.table}</span>
                    <Badge bg={order.type === 'Cafe' ? 'success' : order.type === 'Bar' ? 'info' : 'primary'} style={{ fontSize: '0.6rem' }}>
                      {order.type}
                    </Badge>
                  </div>
                  <div className="text-muted small">{order.id}</div>
                </div>
                <div className="text-end">
                  <div className="d-flex align-items-center gap-1 text-muted small mb-1">
                    <MdTimer /> {order.time}
                  </div>
                  <span className={`d-chip ${
                    order.status === 'New' ? 'd-chip-blue' : 
                    order.status === 'Preparing' ? 'd-chip-gold' : 
                    'd-chip-red'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="d-kot-items mb-4 py-3 border-top border-bottom">
                {order.items.map((item, idx) => (
                  <div key={idx} className="d-flex align-items-center gap-2 mb-2">
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--d-gold)' }}></div>
                    <div className="fw-bold" style={{ fontSize: '0.95rem' }}>{item}</div>
                  </div>
                ))}
              </div>

              <div className="d-flex gap-2 mt-auto">
                {order.status === 'Delayed' && (
                  <button className="d-btn-outline border-danger text-danger flex-grow-1" style={{ padding: '8px' }}>
                    <MdWarning /> Alert
                  </button>
                )}
                <button className="d-btn-gold flex-grow-2 w-100" style={{ justifyContent: 'center' }}>
                  <MdCheckCircle className="me-2" /> Mark Ready
                </button>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <style jsx>{`
        .border-danger { border-color: var(--d-danger) !important; }
        .d-kot-items { min-height: 100px; }
      `}</style>
    </>
  );
}
