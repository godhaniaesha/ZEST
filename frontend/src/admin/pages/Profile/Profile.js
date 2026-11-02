import React, { useState, useEffect, useRef } from 'react';
import { Row, Col } from 'react-bootstrap';
import { 
  MdPerson, MdEmail, MdPhone, MdLocationOn, 
  MdEdit, MdSave, MdLock, MdVisibility, MdVisibilityOff,
  MdCameraAlt, MdVerified, MdRefresh
} from 'react-icons/md';
import { authAPI, usersAPI } from '../../../api';
import { useAuth } from '../../../contexts/AuthContext';

export default function Profile() {
  const { syncUser } = useAuth();
  const profileFormRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [profileData, setProfileData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    role: '',
    address: '',
    image: '',
    createdAt: ''
  });

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    image: null,
    imagePreview: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getMe();
      const user = response.data;
      const userData = {
        id: user._id,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || '',
        address: user.address || '',
        image: user.image || '',
        createdAt: user.createdAt
      };
      setProfileData(userData);
      setEditForm({
        name: userData.name,
        email: userData.email,
        phone: userData.phone.replace(/\D/g, '').slice(0, 10),
        address: userData.address,
        image: null,
        imagePreview: userData.image
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      alert('Could not load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value;
    setEditForm(prev => ({ ...prev, [name]: nextValue }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      // Entering edit mode - sync editForm with latest profileData
      setEditForm({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone.replace(/\D/g, '').slice(0, 10),
        address: profileData.address,
        image: null,
        imagePreview: profileData.image
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (!profileFormRef.current?.reportValidity()) return;

    if (!profileData.id) {
      console.error('Save failed: profileData.id is missing', profileData);
      alert('Error: User ID not found. Please refresh the page.');
      return;
    }

    try {
      setSaving(true);
      console.log('--- STARTING PROFILE UPDATE ---');
      console.log('User ID:', profileData.id);
      
      const formData = new FormData();
      formData.append('name', editForm.name.trim());
      formData.append('email', editForm.email.trim());
      formData.append('phone', editForm.phone);
      formData.append('address', editForm.address.trim());
      
      if (editForm.image) {
        formData.append('image', editForm.image);
        console.log('Image file selected:', editForm.image.name);
      } else {
        console.log('No new image file selected');
      }

      // Debugging: Log all FormData entries
      for (let pair of formData.entries()) {
        console.log(`FormData: ${pair[0]} = ${pair[1]}`);
      }

      const response = await usersAPI.update(profileData.id, formData);
      console.log('Server response received:', response.status, response.data);
      
      alert('Profile updated successfully!');
      
      const updatedUser = response.data;
      syncUser(updatedUser);
      setProfileData({
        ...profileData,
        name: updatedUser.name || '',
        email: updatedUser.email || '',
        phone: updatedUser.phone || '',
        address: updatedUser.address || '',
        image: updatedUser.image || '',
      });
      setIsEditing(false);
      console.log('--- PROFILE UPDATE SUCCESS ---');
    } catch (error) {
      console.error('--- PROFILE UPDATE FAILED ---');
      console.error('Full error object:', error);
      const errorMsg = error.response?.data?.message || error.message;
      alert('Could not update profile: ' + errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert('Please fill in all password fields.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      alert('New password must be at least 8 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      alert('New password must be different from the current password.');
      return;
    }

    try {
      setPasswordSaving(true);
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password updated successfully.');
    } catch (error) {
      console.error('Could not update password:', error);
      alert(error.response?.data?.message || 'Could not update password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="text-center">
          <MdRefresh className="spinner-border text-primary" style={{ animation: 'spin 2s linear infinite', fontSize: '2rem' }} />
          <p className="mt-2">Loading Profile...</p>
        </div>
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="admin-profile-page">
      <div className="d-page-header">
        <div>
          <div className="d-page-heading">My Profile</div>
          <div className="d-page-sub">Manage your personal information and account settings</div>
        </div>
        <button 
          type="button"
          className={isEditing ? 'd-btn-gold' : 'd-btn-outline'} 
          onClick={isEditing ? handleSave : handleEditToggle}
          disabled={saving}
        >
          {saving ? 'Saving...' : (isEditing ? <><MdSave /> Save Changes</> : <><MdEdit /> Edit Profile</>)}
        </button>
      </div>

      <Row className="g-4">
        <Col xs={12} lg={4}>
          <div className="d-card p-4">
            <div className="text-center mb-4">
              <div className="position-relative mx-auto mb-3" style={{ width: '120px', height: '120px' }}>
                {editForm.imagePreview || profileData.image ? (
                  <img 
                    src={editForm.imagePreview || profileData.image} 
                    alt="Profile" 
                    className="rounded-circle" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', border: '3px solid var(--d-gold)' }}
                  />
                ) : (
                  <div className="d-avatar" style={{ width: '100%', height: '100%', fontSize: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--d-primary)', color: 'white' }}>
                    {profileData.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {isEditing && (
                  <label className="position-absolute bottom-0 end-0 bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', border: '2px solid white' }}>
                    <MdCameraAlt style={{ color: 'white', fontSize: '1rem' }} />
                    <input 
                      type="file" 
                      className="d-none" 
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
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
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{profileData.phone || 'Not provided'}</div>
              </div>
              <div className="mb-3 p-3 rounded" style={{ background: 'var(--d-bg)' }}>
                <div className="d-flex align-items-center gap-2 mb-2" style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <MdLocationOn /> Address
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{profileData.address || 'Not provided'}</div>
              </div>
              <div className="p-3 rounded" style={{ background: 'var(--d-bg)' }}>
                <div className="d-flex align-items-center gap-2 mb-2" style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <MdPerson /> Joined
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{new Date(profileData.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>
          </div>
        </Col>

        <Col xs={12} lg={8}>
          <div className="d-card mb-4">
            <div className="d-section-title mb-4">Modify Your Details</div>
            <form
              ref={profileFormRef}
              id="profile-edit-form"
              onSubmit={(event) => {
                event.preventDefault();
                if (isEditing) handleSave();
              }}
            >
              <Row className="g-3">
              <Col xs={12} md={6}>
                <div className="mb-3">
                  <label className="d-settings-label" htmlFor="profile-name">Full Name *</label>
                  <input 
                    className="d-settings-input" 
                    id="profile-name"
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required={isEditing}
                    minLength={2}
                    maxLength={80}
                    pattern=".*\S.*"
                    autoComplete="name"
                    title="Enter a name between 2 and 80 characters."
                    placeholder="Enter full name"
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
                  <label className="d-settings-label" htmlFor="profile-email">Email Address *</label>
                  <input 
                    className="d-settings-input" 
                    id="profile-email"
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                    onBlur={() => setEditForm((prev) => ({ ...prev, email: prev.email.trim() }))}
                    disabled={!isEditing}
                    required={isEditing}
                    maxLength={254}
                    autoComplete="email"
                    placeholder="Enter email address"
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
                  <label className="d-settings-label" htmlFor="profile-phone">Phone Number *</label>
                  <input 
                    className="d-settings-input" 
                    id="profile-phone"
                    type="tel"
                    inputMode="numeric"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required={isEditing}
                    pattern="[0-9]{10}"
                    maxLength={10}
                    autoComplete="tel-national"
                    title="Enter exactly 10 digits."
                    placeholder="10-digit phone number"
                    style={{
                      width: '100%', padding: '10px 14px',
                      border: '1.5px solid var(--d-border)', borderRadius: 'var(--d-radius-md)',
                      background: isEditing ? 'var(--d-white)' : 'var(--d-bg)',
                      fontSize: '0.9rem', outline: 'none'
                    }}
                  />
                  {isEditing && (
                    <small className="text-muted">Enter exactly 10 digits (numbers only).</small>
                  )}
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div className="mb-3">
                  <label className="d-settings-label" htmlFor="profile-role">Role</label>
                  <input 
                    className="d-settings-input" 
                    id="profile-role"
                    value={profileData.role}
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
                  <label className="d-settings-label" htmlFor="profile-address">Current Address</label>
                  <textarea 
                    className="d-settings-input" 
                    id="profile-address"
                    rows={3}
                    name="address"
                    value={editForm.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    maxLength={250}
                    placeholder="Enter your current address"
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
            </form>
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
                      value={passwordForm.currentPassword}
                      onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
                      placeholder="Enter current password"
                      style={{
                        width: '100%', padding: '10px 14px',
                        border: '1.5px solid var(--d-border)', borderRadius: 'var(--d-radius-md)',
                        background: 'var(--d-white)', fontSize: '0.9rem', outline: 'none'
                      }}
                    />
                    <button 
                      type="button"
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
                    value={passwordForm.newPassword}
                    onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
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
                    value={passwordForm.confirmPassword}
                    onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
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
                <button
                  type="button"
                  className="d-btn-gold"
                  onClick={handleChangePassword}
                  disabled={passwordSaving}
                >
                  <MdLock /> {passwordSaving ? 'Updating...' : 'Update Password'}
                </button>
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
    </div>
  );
}
