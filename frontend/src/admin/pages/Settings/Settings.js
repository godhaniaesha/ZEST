import React, { useState } from 'react';
import { Row, Col, Nav } from 'react-bootstrap';
import { 
  MdSettings, MdStore, MdAccessTime, MdNotifications, 
  MdSecurity, MdPayment, MdSave 
} from 'react-icons/md';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading">Settings</div>
          <div className="d-page-sub">Configure your system preferences and business details</div>
        </div>
        <button className="d-btn-gold"><MdSave /> Save All Changes</button>
      </div>

      <Row className="g-4">
        <Col xs={12} lg={3}>
          <div className="d-card p-2">
            <Nav className="flex-column d-settings-nav">
              {[
                { id: 'general', label: 'General Info', icon: <MdStore /> },
                { id: 'hours', label: 'Operating Hours', icon: <MdAccessTime /> },
                { id: 'notifications', label: 'Notifications', icon: <MdNotifications /> },
                { id: 'security', label: 'Security', icon: <MdSecurity /> },
                { id: 'payment', label: 'Payments', icon: <MdPayment /> },
              ].map((tab) => (
                <Nav.Link 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`d-settings-link ${activeTab === tab.id ? 'active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: 'var(--d-radius-sm)',
                    color: activeTab === tab.id ? 'var(--d-gold)' : 'var(--d-text-muted)',
                    background: activeTab === tab.id ? 'var(--d-primary)' : 'transparent',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    transition: 'var(--d-transition)'
                  }}
                >
                  {tab.icon} {tab.label}
                </Nav.Link>
              ))}
            </Nav>
          </div>
        </Col>

        <Col xs={12} lg={9}>
          {activeTab === 'general' && (
            <div className="d-card">
              <div className="d-section-title mb-4">Business Information</div>
              <Row className="g-3">
                {[
                  ['Café Name', 'Breva Café & Bar'],
                  ['Owner Name', 'Admin User'],
                  ['Email Address', 'hello@breva.in'],
                  ['Phone Number', '+91 98765 00000'],
                  ['GST Number', '24AAAAA0000A1Z5'],
                  ['Address', 'MG Road, Gujarat'],
                ].map(([label, val]) => (
                  <Col key={label} xs={12} md={6}>
                    <div className="mb-3">
                      <label className="d-settings-label">{label}</label>
                      <input 
                        className="d-settings-input" 
                        defaultValue={val} 
                        style={{
                          width: '100%', padding: '10px 14px',
                          border: '1.5px solid var(--d-border)', borderRadius: 'var(--d-radius-md)',
                          background: 'var(--d-bg)', fontSize: '0.9rem', outline: 'none'
                        }}
                      />
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="d-card">
              <div className="d-section-title mb-4">Operating Hours</div>
              {[
                ['Monday - Friday', '11:00 AM', '11:00 PM'],
                ['Saturday', '10:00 AM', '12:00 AM'],
                ['Sunday', '10:00 AM', '10:00 PM'],
              ].map(([day, open, close]) => (
                <div key={day} className="d-flex align-items-center gap-4 mb-4 p-3 rounded" style={{ background: 'var(--d-bg)' }}>
                  <div style={{ width: '150px', fontWeight: 700 }}>{day}</div>
                  <div className="d-flex align-items-center gap-2">
                    <input className="d-settings-input text-center" style={{ width: '100px', padding: '6px' }} defaultValue={open} />
                    <span>to</span>
                    <input className="d-settings-input text-center" style={{ width: '100px', padding: '6px' }} defaultValue={close} />
                  </div>
                  <div className="ms-auto">
                    <span className="d-chip d-chip-green">Open</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(activeTab !== 'general' && activeTab !== 'hours') && (
            <div className="d-card d-flex flex-column align-items-center justify-content-center py-5">
              <MdSettings size={48} className="text-muted mb-3" />
              <div className="d-section-title">Coming Soon</div>
              <div className="d-page-sub">This module is currently under development.</div>
            </div>
          )}
        </Col>
      </Row>

      <style>{`
        .d-settings-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--d-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }
        .d-settings-input:focus {
          border-color: var(--d-primary) !important;
          background: var(--d-white) !important;
          box-shadow: var(--d-shadow-sm);
        }
        .d-settings-link:hover {
          background: var(--d-accent-soft) !important;
          color: var(--d-primary) !important;
        }
      `}</style>
    </>
  );
}