import React from 'react';
import { Row, Col } from 'react-bootstrap';

export default function Settings() {
  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading">Settings</div>
          <div className="d-page-sub">System preferences and configurations</div>
        </div>
        <button className="d-btn-gold">Save Changes</button>
      </div>

      <Row className="g-3">
        {[
          { title: 'Café Details', fields: [['Café Name', 'Breva Café & Bar'], ['Address', 'MG Road, Ahmedabad'], ['Phone', '+91 98765 00000'], ['Email', 'hello@breva.in']] },
          { title: 'Operating Hours', fields: [['Mon - Fri', '11:00 AM – 11:00 PM'], ['Saturday', '10:00 AM – 12:00 AM'], ['Sunday', '10:00 AM – 10:00 PM'], ['Holiday Hours', 'Varies']] },
        ].map(({ title, fields }) => (
          <Col key={title} xs={12} lg={6}>
            <div className="d-card">
              <div className="d-section-title" style={{ marginBottom: 16 }}>{title}</div>
              {fields.map(([label, val]) => (
                <div key={label} style={{ marginBottom: 14 }}>
                  <label style={{ fontFamily: 'Lato,sans-serif', fontSize: '0.75rem', fontWeight: 700, color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 4 }}>{label}</label>
                  <input defaultValue={val} style={{
                    width: '100%', padding: '9px 12px',
                    border: '1.5px solid var(--d-border)', borderRadius: 'var(--d-radius-sm)',
                    fontFamily: 'Lato,sans-serif', fontSize: '0.88rem',
                    color: 'var(--d-text)', background: 'var(--d-bg)',
                    outline: 'none', transition: 'var(--d-transition)'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--d-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--d-border)'}
                  />
                </div>
              ))}
            </div>
          </Col>
        ))}
      </Row>
    </>
  );
}