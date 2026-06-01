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
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdSettings /> Settings
          </div>
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

          {activeTab === 'notifications' && (
            <div className="d-card">
              <div className="d-section-title mb-4">Notification Preferences</div>
              <Row className="g-4">
                <Col xs={12}>
                  <div className="d-section-sub mb-3">Email Notifications</div>
                  {[
                    ['New Order Alerts', 'Receive email when new orders are placed'],
                    ['Low Stock Alerts', 'Get notified when inventory items are running low'],
                    ['Reservation Confirmations', 'Email customers for reservation confirmations'],
                    ['Daily Sales Report', 'Receive daily sales summary via email'],
                  ].map(([label, desc]) => (
                    <div key={label} className="d-flex align-items-center justify-content-between p-3 mb-3 rounded" style={{ background: 'var(--d-bg)' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{label}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>{desc}</div>
                      </div>
                      <label className="d-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="d-slider"></span>
                      </label>
                    </div>
                  ))}
                </Col>
                <Col xs={12}>
                  <div className="d-section-sub mb-3">SMS Notifications</div>
                  {[
                    ['Order Status Updates', 'Send SMS for order status changes'],
                    ['Reservation Reminders', 'Remind customers about upcoming reservations'],
                    ['Promotional Messages', 'Send promotional offers to customers'],
                  ].map(([label, desc]) => (
                    <div key={label} className="d-flex align-items-center justify-content-between p-3 mb-3 rounded" style={{ background: 'var(--d-bg)' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{label}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>{desc}</div>
                      </div>
                      <label className="d-switch">
                        <input type="checkbox" />
                        <span className="d-slider"></span>
                      </label>
                    </div>
                  ))}
                </Col>
                <Col xs={12}>
                  <div className="d-section-sub mb-3">Push Notifications</div>
                  {[
                    ['Real-time Order Alerts', 'Instant push notifications for new orders'],
                    ['Kitchen Order Updates', 'Notify kitchen staff for new KOTs'],
                    ['Table Service Requests', 'Alert waiters for customer requests'],
                  ].map(([label, desc]) => (
                    <div key={label} className="d-flex align-items-center justify-content-between p-3 mb-3 rounded" style={{ background: 'var(--d-bg)' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{label}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>{desc}</div>
                      </div>
                      <label className="d-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="d-slider"></span>
                      </label>
                    </div>
                  ))}
                </Col>
              </Row>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="d-card">
              <div className="d-section-title mb-4">Security Settings</div>
              <Row className="g-4">
                <Col xs={12}>
                  <div className="d-section-sub mb-3">Password Management</div>
                  <div className="p-md-4 p-2 rounded" style={{ background: 'var(--d-bg)' }}>
                    <div className="mb-3">
                      <label className="d-settings-label">Current Password</label>
                      <input 
                        className="d-settings-input" 
                        type="password"
                        placeholder="Enter current password"
                        style={{
                          width: '100%', padding: '10px 14px',
                          border: '1.5px solid var(--d-border)', borderRadius: 'var(--d-radius-md)',
                          background: 'var(--d-white)', fontSize: '0.9rem', outline: 'none'
                        }}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="d-settings-label">New Password</label>
                      <input 
                        className="d-settings-input" 
                        type="password"
                        placeholder="Enter new password"
                        style={{
                          width: '100%', padding: '10px 14px',
                          border: '1.5px solid var(--d-border)', borderRadius: 'var(--d-radius-md)',
                          background: 'var(--d-white)', fontSize: '0.9rem', outline: 'none'
                        }}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="d-settings-label">Confirm New Password</label>
                      <input 
                        className="d-settings-input" 
                        type="password"
                        placeholder="Confirm new password"
                        style={{
                          width: '100%', padding: '10px 14px',
                          border: '1.5px solid var(--d-border)', borderRadius: 'var(--d-radius-md)',
                          background: 'var(--d-white)', fontSize: '0.9rem', outline: 'none'
                        }}
                      />
                    </div>
                    <button className="d-btn-gold">Update Password</button>
                  </div>
                </Col>
                <Col xs={12}>
                  <div className="d-section-sub mb-3">Two-Factor Authentication</div>
                  <div className="d-flex align-items-center justify-content-between p-md-4 p-2 rounded" style={{ background: 'var(--d-bg)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>Enable 2FA</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>Add an extra layer of security to your account</div>
                    </div>
                    <label className="d-switch">
                      <input type="checkbox" />
                      <span className="d-slider"></span>
                    </label>
                  </div>
                </Col>
                <Col xs={12}>
                  <div className="d-section-sub mb-3">Session Management</div>
                  <div className="p-md-4 p-2 rounded" style={{ background: 'var(--d-bg)' }}>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <div style={{ fontWeight: 600 }}>Auto Logout After Inactivity</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>Automatically logout after period of inactivity</div>
                      </div>
                      <select 
                        className="d-settings-input"
                        style={{
                          padding: '8px 12px',
                          border: '1.5px solid var(--d-border)', borderRadius: 'var(--d-radius-md)',
                          background: 'var(--d-white)', fontSize: '0.9rem', outline: 'none'
                        }}
                      >
                        <option>15 minutes</option>
                        <option selected>30 minutes</option>
                        <option>1 hour</option>
                        <option>2 hours</option>
                      </select>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div style={{ fontWeight: 600 }}>Session Timeout</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>Maximum session duration before re-login required</div>
                      </div>
                      <select 
                        className="d-settings-input"
                        style={{
                          padding: '8px 12px',
                          border: '1.5px solid var(--d-border)', borderRadius: 'var(--d-radius-md)',
                          background: 'var(--d-white)', fontSize: '0.9rem', outline: 'none'
                        }}
                      >
                        <option>4 hours</option>
                        <option selected>8 hours</option>
                        <option>12 hours</option>
                        <option>24 hours</option>
                      </select>
                    </div>
                  </div>
                </Col>
                <Col xs={12}>
                  <div className="d-section-sub mb-3">Active Sessions</div>
                  <div className="p-md-4 p-2 rounded" style={{ background: 'var(--d-bg)' }}>
                    <div className="d-flex align-items-center justify-content-between mb-3 pb-3" style={{ borderBottom: '1px solid var(--d-border)' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>Chrome on Windows</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>Ahmedabad, Gujarat • Current session</div>
                      </div>
                      <span className="d-chip d-chip-green">Active</span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div style={{ fontWeight: 600 }}>Safari on iPhone</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>Mumbai, Maharashtra • Last active 2 hours ago</div>
                      </div>
                      <button className="d-btn-red" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Revoke</button>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="d-card">
              <div className="d-section-title mb-4">Payment Configuration</div>
              <Row className="g-4">
                <Col xs={12}>
                  <div className="d-section-sub mb-3">Payment Methods</div>
                  {[
                    ['Cash', 'Accept cash payments at counter'],
                    ['Card/POS Machine', 'Accept debit/credit cards via POS'],
                    ['UPI', 'Accept UPI payments (GPay, PhonePe, Paytm)'],
                    ['Online Payment', 'Accept payments via payment gateway'],
                  ].map(([label, desc]) => (
                    <div key={label} className="d-flex align-items-center justify-content-between p-3 mb-3 rounded" style={{ background: 'var(--d-bg)' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{label}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>{desc}</div>
                      </div>
                      <label className="d-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="d-slider"></span>
                      </label>
                    </div>
                  ))}
                </Col>
                <Col xs={12}>
                  <div className="d-section-sub mb-3">Payment Gateway Settings</div>
                  <div className="p-md-4 p-2 rounded" style={{ background: 'var(--d-bg)' }}>
                    <div className="mb-3">
                      <label className="d-settings-label">Payment Gateway</label>
                      <select 
                        className="d-settings-input"
                        style={{
                          width: '100%', padding: '10px 14px',
                          border: '1.5px solid var(--d-border)', borderRadius: 'var(--d-radius-md)',
                          background: 'var(--d-white)', fontSize: '0.9rem', outline: 'none'
                        }}
                      >
                        <option>Razorpay</option>
                        <option>Stripe</option>
                        <option>PAYU</option>
                        <option>CCAvenue</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="d-settings-label">API Key</label>
                      <input 
                        className="d-settings-input" 
                        type="password"
                        placeholder="Enter your API key"
                        style={{
                          width: '100%', padding: '10px 14px',
                          border: '1.5px solid var(--d-border)', borderRadius: 'var(--d-radius-md)',
                          background: 'var(--d-white)', fontSize: '0.9rem', outline: 'none'
                        }}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="d-settings-label">Secret Key</label>
                      <input 
                        className="d-settings-input" 
                        type="password"
                        placeholder="Enter your secret key"
                        style={{
                          width: '100%', padding: '10px 14px',
                          border: '1.5px solid var(--d-border)', borderRadius: 'var(--d-radius-md)',
                          background: 'var(--d-white)', fontSize: '0.9rem', outline: 'none'
                        }}
                      />
                    </div>
                    <button className="d-btn-gold">Save Payment Settings</button>
                  </div>
                </Col>
                <Col xs={12}>
                  <div className="d-section-sub mb-3">UPI Configuration</div>
                  <div className="p-md-4 p-2 rounded" style={{ background: 'var(--d-bg)' }}>
                    <Row className="g-3">
                      <Col xs={12} md={6}>
                        <div className="mb-3">
                          <label className="d-settings-label">UPI ID</label>
                          <input 
                            className="d-settings-input" 
                            placeholder="yourbusiness@upi"
                            style={{
                              width: '100%', padding: '10px 14px',
                              border: '1.5px solid var(--d-border)', borderRadius: 'var(--d-radius-md)',
                              background: 'var(--d-white)', fontSize: '0.9rem', outline: 'none'
                            }}
                          />
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div className="mb-3">
                          <label className="d-settings-label">Merchant Name</label>
                          <input 
                            className="d-settings-input" 
                            placeholder="Breva Café & Bar"
                            style={{
                              width: '100%', padding: '10px 14px',
                              border: '1.5px solid var(--d-border)', borderRadius: 'var(--d-radius-md)',
                              background: 'var(--d-white)', fontSize: '0.9rem', outline: 'none'
                            }}
                          />
                        </div>
                      </Col>
                    </Row>
                    <button className="d-btn-gold">Update UPI Details</button>
                  </div>
                </Col>
                <Col xs={12}>
                  <div className="d-section-sub mb-3">Tax Configuration</div>
                  <div className="p-md-4 p-2 rounded" style={{ background: 'var(--d-bg)' }}>
                    <Row className="g-3">
                      <Col xs={12} md={6}>
                        <div className="mb-3">
                          <label className="d-settings-label">CGST (%)</label>
                          <input 
                            className="d-settings-input" 
                            type="number"
                            defaultValue="2.5"
                            style={{
                              width: '100%', padding: '10px 14px',
                              border: '1.5px solid var(--d-border)', borderRadius: 'var(--d-radius-md)',
                              background: 'var(--d-white)', fontSize: '0.9rem', outline: 'none'
                            }}
                          />
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div className="mb-3">
                          <label className="d-settings-label">SGST (%)</label>
                          <input 
                            className="d-settings-input" 
                            type="number"
                            defaultValue="2.5"
                            style={{
                              width: '100%', padding: '10px 14px',
                              border: '1.5px solid var(--d-border)', borderRadius: 'var(--d-radius-md)',
                              background: 'var(--d-white)', fontSize: '0.9rem', outline: 'none'
                            }}
                          />
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div className="mb-3">
                          <label className="d-settings-label">Service Charge (%)</label>
                          <input 
                            className="d-settings-input" 
                            type="number"
                            defaultValue="5"
                            style={{
                              width: '100%', padding: '10px 14px',
                              border: '1.5px solid var(--d-border)', borderRadius: 'var(--d-radius-md)',
                              background: 'var(--d-white)', fontSize: '0.9rem', outline: 'none'
                            }}
                          />
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div className="mb-3">
                          <label className="d-settings-label">Service Tax (%)</label>
                          <input 
                            className="d-settings-input" 
                            type="number"
                            defaultValue="0"
                            style={{
                              width: '100%', padding: '10px 14px',
                              border: '1.5px solid var(--d-border)', borderRadius: 'var(--d-radius-md)',
                              background: 'var(--d-white)', fontSize: '0.9rem', outline: 'none'
                            }}
                          />
                        </div>
                      </Col>
                    </Row>
                    <button className="d-btn-gold">Save Tax Settings</button>
                  </div>
                </Col>
              </Row>
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
        .d-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 26px;
          flex-shrink: 0;
        }
        @media (max-width: 768px) {
          .d-switch {
            width: 44px;
            height: 24px;
          }
        }
        .d-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .d-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 34px;
        }
        .d-slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        @media (max-width: 768px) {
          .d-slider:before {
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
          }
        }
        input:checked + .d-slider {
          background-color: var(--d-primary);
        }
        input:checked + .d-slider:before {
          transform: translateX(24px);
        }
        @media (max-width: 768px) {
          input:checked + .d-slider:before {
            transform: translateX(20px);
          }
        }
        .d-section-sub {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--d-text-muted);
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        @media (max-width: 768px) {
          .d-section-sub {
            font-size: 0.8rem;
          }
        }
        @media (max-width: 768px) {
          .d-flex.align-items-center.justify-content-between {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .d-flex.align-items-center.justify-content-between .d-switch {
            align-self: flex-end;
          }
        }
      `}</style>
    </>
  );
}
