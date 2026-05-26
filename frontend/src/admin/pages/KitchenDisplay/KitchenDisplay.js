import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { MdKitchen, MdTimer, MdCheckCircle } from 'react-icons/md';

export default function KitchenDisplay() {
  const KOT_ORDERS = [
    { id: '#K-501', table: 'T-4', items: ['Cappuccino x2', 'Croissant x1'], time: '5m ago', status: 'Preparing' },
    { id: '#K-502', table: 'T-7', items: ['Old Fashioned x1', 'Nachos x1'], time: '2m ago', status: 'New' },
    { id: '#K-503', table: 'Bar', items: ['Draft Beer x2'], time: 'Just now', status: 'New' },
  ];

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading">Live Orders (KOT) 👨‍🍳</div>
          <div className="d-page-sub">Kitchen Order Ticket management</div>
        </div>
        <div className="d-flex gap-2">
          <span className="d-chip d-chip-gold">5 Pending</span>
          <span className="d-chip d-chip-green">12 Completed Today</span>
        </div>
      </div>

      <Row className="g-3">
        {KOT_ORDERS.map((order, i) => (
          <Col key={i} xs={12} md={6} xl={4}>
            <div className="d-card">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{order.table}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>Order {order.id}</div>
                </div>
                <div className="d-flex flex-column align-items-end">
                  <span className={`d-chip ${order.status === 'New' ? 'd-chip-blue' : 'd-chip-gold'} mb-1`}>{order.status}</span>
                  <div style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MdTimer /> {order.time}
                  </div>
                </div>
              </div>
              <div className="py-3 border-top border-bottom mb-3">
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ fontSize: '0.9rem', marginBottom: '4px', fontWeight: 500 }}>
                    • {item}
                  </div>
                ))}
              </div>
              <button className="d-btn-gold w-100" style={{ justifyContent: 'center' }}>
                <MdCheckCircle className="me-2" /> Mark as Ready
              </button>
            </div>
          </Col>
        ))}
      </Row>
    </>
  );
}
