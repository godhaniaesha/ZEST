import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { MdLocalAtm, MdReceipt, MdShoppingCart, MdPayment } from 'react-icons/md';

export default function POS() {
  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading">POS & Billing 💳</div>
          <div className="d-page-sub">Point of Sale terminal for Breva Café & Bar</div>
        </div>
        <div className="d-flex gap-2">
          <button className="d-btn-outline">Today's Sales</button>
          <button className="d-btn-gold">Open Cash Drawer</button>
        </div>
      </div>

      <Row className="g-3">
        <Col xs={12} lg={8}>
          <div className="d-card" style={{ minHeight: '400px' }}>
            <div className="d-section-title">Active Cart</div>
            <div className="d-flex flex-column align-items-center justify-content-center h-100 mt-5" style={{ color: 'var(--d-text-muted)' }}>
              <MdShoppingCart size={48} className="mb-3" />
              <p>Cart is empty. Select items to start billing.</p>
            </div>
          </div>
        </Col>
        <Col xs={12} lg={4}>
          <div className="d-card h-100">
            <div className="d-section-title">Payment Summary</div>
            <div className="mt-4">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>₹0.00</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax (GST 5%)</span>
                <span>₹0.00</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-4">
                <strong style={{ fontSize: '1.2rem' }}>Total</strong>
                <strong style={{ fontSize: '1.2rem', color: 'var(--d-gold)' }}>₹0.00</strong>
              </div>
              <button className="d-btn-gold w-100" style={{ justifyContent: 'center' }} disabled>
                <MdPayment className="me-2" /> Proceed to Pay
              </button>
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
}
