import React, { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { 
  MdPerson, MdEmail, MdPhone, MdLocationOn, 
  MdEdit, MdSave, MdLock, MdVisibility, MdVisibilityOff,
  MdCameraAlt, MdVerified
} from 'react-icons/md';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  const [profileData, setProfileData] = useState({
    name: 'Admin User',
    email: 'admin@breva.in',
    phone: '+91 98765 00000',
    role: 'Super Admin',
    address: 'MG Road, Gujarat, India',
    joinDate: 'January 15, 2024'
  });

  const handleSave = () => {
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading">My Profile</div>
          <div className="d-page-sub">Manage your personal information and account settings</div>
        </div>
        <button 
          className={isEditing ? 'd-btn-gold' : 'd-btn-outline'} 
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
        >
          {isEditing ? <><MdSave /> Save Changes</> : <><MdEdit /> Edit Profile</>}
        </button>
      </div>

      <Row className="g-4">
        <Col xs={12} lg={4}>
          <div className="d-card p-4">
            <div className="text-center mb-4">
              <div className="position-relative mx-auto mb-3" style={{ width: '120px', height: '120px' }}>
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Profile" 
                    className="rounded-circle" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="d-avatar" style={{ width: '100%', height: '100%', fontSize: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    AU
                  </div>
                )}
                <label className="position-absolute bottom-0 end-0 bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                  <MdCameraAlt style={{ color: 'white', fontSize: '1rem' }} />
                  <input 
                    type="file" 
                    className="d-none" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setAvatarPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
              </div>
              <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{profileData.name}</div>
                <MdVerified style={{ color: 'var(--d-primary)', fontSize: '1.1rem' }} />
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--d-text-muted)' }}>{profileData.role}</div>
              <div className="mt-3">
                <span className="d-chip d-chip-green">Active</span>
              </div>
            </div>
            
            <div className="d-dropdown-divider my-4"></div>
            
            <div className="mb-4">
              <div className="d-section-sub mb-3">Quick Info</div>
              <div className="mb-3 p-3 rounded" style={{ background: 'var(--d-bg)' }}>
                <div className="d-flex align-items-center gap-2 mb-2" style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <MdEmail /> Email
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{profileData.email}</div>
              </div>
              <div className="mb-3 p-3 rounded" style={{ background: 'var(--d-bg)' }}>
                <div className="d-flex align-items-center gap-2 mb-2" style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <MdPhone /> Phone
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{profileData.phone}</div>
              </div>
              <div className="mb-3 p-3 rounded" style={{ background: 'var(--d-bg)' }}>
                <div className="d-flex align-items-center gap-2 mb-2" style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <MdLocationOn /> Address
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{profileData.address}</div>
              </div>
              <div className="p-3 rounded" style={{ background: 'var(--d-bg)' }}>
                <div className="d-flex align-items-center gap-2 mb-2" style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <MdPerson /> Joined
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{profileData.joinDate}</div>
              </div>
            </div>
          </div>
        </Col>

        <Col xs={12} lg={8}>
          <div className="d-card mb-4">
            <div className="d-section-title mb-4">Personal Information</div>
            <Row className="g-3">
              <Col xs={12} md={6}>
                <div className="mb-3">
                  <label className="d-settings-label">Full Name</label>
                  <input 
                    className="d-settings-input" 
                    defaultValue={profileData.name}
                    disabled={!isEditing}
                    style={{
                      width: '100%', padding: '10px 14px',
                      border: '1.5px solid var(--d-border)', borderRadius: 'var(--d-radius-md)',
                      background: isEditing ? 'var(--d-white)' : 'var(--d-bg)',
                      fontSize: '0.9rem', outline: 'none'
                    }}
                  />
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div className="mb-3">
                  <label className="d-settings-label">Email Address</label>
                  <input 
                    className="d-settings-input" 
                    type="email"
                    defaultValue={profileData.email}
                    disabled={!isEditing}
                    style={{
                      width: '100%', padding: '10px 14px',
                      border: '1.5px solid var(--d-border)', borderRadius: 'var(--d-radius-md)',
                      background: isEditing ? 'var(--d-white)' : 'var(--d-bg)',
                      fontSize: '0.9rem', outline: 'none'
                    }}
                  />
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div className="mb-3">
                  <label className="d-settings-label">Phone Number</label>
                  <input 
                    className="d-settings-input" 
                    defaultValue={profileData.phone}
                    disabled={!isEditing}
                    style={{
                      width: '100%', padding: '10px 14px',
                      border: '1.5px solid var(--d-border)', borderRadius: 'var(--d-radius-md)',
                      background: isEditing ? 'var(--d-white)' : 'var(--d-bg)',
                      fontSize: '0.9rem', outline: 'none'
                    }}
                  />
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div className="mb-3">
                  <label className="d-settings-label">Role</label>
                  <input 
                    className="d-settings-input" 
                    defaultValue={profileData.role}
                    disabled
                    style={{
                      width: '100%', padding: '10px 14px',
                      border: '1.5px solid var(--d-border)', borderRadius: 'var(--d-radius-md)',
                      background: 'var(--d-bg)',
                      fontSize: '0.9rem', outline: 'none'
                    }}
                  />
                </div>
              </Col>
              <Col xs={12}>
                <div className="mb-3">
                  <label className="d-settings-label">Address</label>
                  <textarea 
                    className="d-settings-input" 
                    rows={3}
                    defaultValue={profileData.address}
                    disabled={!isEditing}
                    style={{
                      width: '100%', padding: '10px 14px',
                      border: '1.5px solid var(--d-border)', borderRadius: 'var(--d-radius-md)',
                      background: isEditing ? 'var(--d-white)' : 'var(--d-bg)',
                      fontSize: '0.9rem', outline: 'none', resize: 'none'
                    }}
                  />
                </div>
              </Col>
            </Row>
          </div>

          <div className="d-card">
            <div className="d-section-title mb-4">Change Password</div>
            <Row className="g-3">
              <Col xs={12} md={6}>
                <div className="mb-3">
                  <label className="d-settings-label">Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      className="d-settings-input" 
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter current password"
                      style={{
                        width: '100%', padding: '10px 14px',
                        border: '1.5px solid var(--d-border)', borderRadius: 'var(--d-radius-md)',
                        background: 'var(--d-white)', fontSize: '0.9rem', outline: 'none'
                      }}
                    />
                    <button 
                      style={{
                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--d-text-muted)'
                      }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                    </button>
                  </div>
                </div>
              </Col>
              <Col xs={12} md={6}>
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
              </Col>
              <Col xs={12} md={6}>
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
              </Col>
              <Col xs={12}>
                <button className="d-btn-gold"><MdLock /> Update Password</button>
              </Col>
            </Row>
          </div>
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
        .d-section-sub {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--d-text-muted);
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .position-relative {
          position: relative;
        }
        .position-absolute {
          position: absolute;
        }
        .bottom-0 {
          bottom: 0;
        }
        .end-0 {
          right: 0;
        }
        .bg-primary {
          background-color: var(--d-primary);
        }
        .rounded-circle {
          border-radius: 50%;
        }
        .d-none {
          display: none;
        }
        .mx-auto {
          margin-left: auto;
          margin-right: auto;
        }
      `}</style>
    </>
  );
}
