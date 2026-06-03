import React, { useState } from "react";
import {
  User,
  LogOut,
  CalendarDays,
  Mail,
  Phone,
  Edit,
  MapPin,
  Lock,
  ChevronRight,
  Award,
} from "lucide-react";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street, City Center",
    joinDate: "January 2024",
  });

  const [bookings, setBookings] = useState([
    {
      id: 1,
      date: "June 15, 2024",
      time: "7:00 PM",
      guests: 4,
      status: "confirmed",
      table: "Table 5",
    },
    {
      id: 2,
      date: "June 22, 2024",
      time: "8:30 PM",
      guests: 2,
      status: "confirmed",
      table: "Table 2",
    },
    {
      id: 3,
      date: "June 28, 2024",
      time: "6:00 PM",
      guests: 6,
      status: "pending",
      table: "TBD",
    },
  ]);

  const handleLogout = () => {
    // Show logout confirmation modal
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    console.log("Logging out...");
    setShowLogoutConfirm(false);
    alert("Logged out successfully!");
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setAvatarPreview(null);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };

      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSavePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    alert("Password updated successfully!");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowChangePassword(false);
  };

  const handleUserDataChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const handleCancelBooking = (id) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id ? { ...booking, status: "cancelled" } : booking,
      ),
    );
    alert("Booking cancelled successfully!");
  };

  return (
    <main className="x_profile_page">
      {/* Hero Section */}
      <section className="x_profile_hero">
        <div className="x_profile_hero_content">
          <h1>Your Account</h1>
          <p>Manage your profile, bookings, and preferences</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="x_profile_container">
        {/* Sidebar */}
        <aside className="x_profile_sidebar">
          <div className="x_profile_menu">
            <button
              className={`x_profile_menu_item ${
                activeTab === "profile" ? "x_active" : ""
              }`}
              onClick={() => setActiveTab("profile")}
            >
              <User size={20} />
              <span>User Profile</span>
              {activeTab === "profile" && <ChevronRight size={18} />}
            </button>

            <button
              className={`x_profile_menu_item ${
                activeTab === "bookings" ? "x_active" : ""
              }`}
              onClick={() => setActiveTab("bookings")}
            >
              <CalendarDays size={20} />
              <span>My Bookings</span>
              {activeTab === "bookings" && <ChevronRight size={18} />}
            </button>

            <button
              className={`x_profile_menu_item ${
                activeTab === "changepassword" ? "x_active" : ""
              }`}
              onClick={() => setActiveTab("changepassword")}
            >
              <Lock size={20} />
              <span>Change Password</span>
              {activeTab === "changepassword" && <ChevronRight size={18} />}
            </button>

            <button
              className="x_profile_menu_item x_logout_btn"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <div className="x_profile_content">
          {/* User Profile Tab */}
          {activeTab === "profile" && (
            <div className="x_profile_tab">
              <div className="x_profile_header">
                <div className="x_profile_avatar_container">
                  <div className="x_profile_avatar">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Profile Avatar" />
                    ) : (
                      <User size={40} />
                    )}
                  </div>
                  {isEditing && (
                    <label className="x_avatar_edit_label">
                      <Edit size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        style={{ display: "none" }}
                      />
                    </label>
                  )}
                </div>
                <div className="x_profile_header_info">
                  <h2>{userData.name}</h2>
                  <p>Member since {userData.joinDate}</p>
                </div>
                <button
                  className="x_profile_edit_btn"
                  onClick={handleEditToggle}
                >
                  <Edit size={18} />
                  {isEditing ? "Cancel" : "Edit Profile"}
                </button>
              </div>

              <div className="x_profile_form_section">
                {isEditing ? (
                  <>
                    <h3>Edit Your Profile</h3>
                    <form className="x_profile_form">
                      <div className="x_profile_form_group">
                        <label>Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={userData.name}
                          onChange={handleUserDataChange}
                          className="x_profile_input"
                        />
                      </div>

                      <div className="x_profile_form_row">
                        <div className="x_profile_form_group">
                          <label>Email Address</label>
                          <input
                            type="email"
                            name="email"
                            value={userData.email}
                            onChange={handleUserDataChange}
                            className="x_profile_input"
                          />
                        </div>

                        <div className="x_profile_form_group">
                          <label>Phone Number</label>
                          <input
                            type="tel"
                            name="phone"
                            value={userData.phone}
                            onChange={handleUserDataChange}
                            className="x_profile_input"
                          />
                        </div>
                      </div>

                      <div className="x_profile_form_group">
                        <label>Address</label>
                        <input
                          type="text"
                          name="address"
                          value={userData.address}
                          onChange={handleUserDataChange}
                          className="x_profile_input"
                        />
                      </div>

                      <button
                        type="button"
                        className="x_profile_save_btn"
                        onClick={handleSaveProfile}
                      >
                        Save Changes
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="x_profile_info_section">
                      <h3>Personal Information</h3>
                      <div className="x_profile_info_grid">
                        <div className="x_profile_info_card_new">
                          <div className="x_info_card_icon">
                            <Mail size={24} />
                          </div>
                          <div className="x_info_card_content">
                            <p className="x_profile_label">Email Address</p>
                            <p className="x_profile_value">{userData.email}</p>
                          </div>
                        </div>

                        <div className="x_profile_info_card_new">
                          <div className="x_info_card_icon">
                            <Phone size={24} />
                          </div>
                          <div className="x_info_card_content">
                            <p className="x_profile_label">Phone Number</p>
                            <p className="x_profile_value">{userData.phone}</p>
                          </div>
                        </div>

                        <div className="x_profile_info_card_new">
                          <div className="x_info_card_icon">
                            <MapPin size={24} />
                          </div>
                          <div className="x_info_card_content">
                            <p className="x_profile_label">Address</p>
                            <p className="x_profile_value">
                              {userData.address}
                            </p>
                          </div>
                        </div>

                        <div className="x_profile_info_card_new">
                          <div className="x_info_card_icon">
                            <Award size={24} />
                          </div>
                          <div className="x_info_card_content">
                            <p className="x_profile_label">Member Since</p>
                            <p className="x_profile_value">
                              {userData.joinDate}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="x_profile_security_section">
                      <h3>Security & Privacy</h3>
                      <div className="x_profile_actions_grid">
                        <button
                          className="x_profile_action_card"
                          onClick={() => setShowChangePassword(true)}
                        >
                          <Lock size={24} />
                          <div>
                            <h4>Change Password</h4>
                            <p>
                              Update your password to keep your account secure
                            </p>
                          </div>
                        </button>
                        <button className="x_profile_action_card">
                          <Mail size={24} />
                          <div>
                            <h4>Email Preferences</h4>
                            <p>Manage notification and email settings</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* My Bookings Tab */}
          {activeTab === "bookings" && (
            <div className="x_profile_tab">
              <div className="x_profile_tab_header">
                <h2>My Reservations</h2>
                <p>View and manage your dining reservations</p>
              </div>

              {bookings.length > 0 ? (
                <div className="x_bookings_list">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className={`x_booking_card ${booking.status}`}
                    >
                      <div className="x_booking_header">
                        <div className="x_booking_date">
                          <CalendarDays size={24} />
                          <div>
                            <p className="x_booking_date_text">
                              {booking.date}
                            </p>
                            <p className="x_booking_time">{booking.time}</p>
                          </div>
                        </div>

                        <div className="x_booking_status">
                          <span className={`x_status_badge ${booking.status}`}>
                            {booking.status.charAt(0).toUpperCase() +
                              booking.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="x_booking_details">
                        <p>
                          <strong>Guests:</strong> {booking.guests} people
                        </p>
                        <p>
                          <strong>Table:</strong> {booking.table}
                        </p>
                      </div>

                      <div className="x_booking_actions">
                        {booking.status === "pending" && (
                          <button
                            className="x_booking_cancel_btn"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="x_empty_state">
                  <CalendarDays size={48} />
                  <h3>No Reservations Yet</h3>
                  <p>Start your journey by making your first reservation</p>
                  <button className="x_new_booking_btn">
                    Make a Reservation
                  </button>
                </div>
              )}

              <div className="x_booking_security_section">
                <h3>Security & Preferences</h3>
                <div className="x_booking_actions_grid">
                  <button
                    className="x_booking_action_card"
                    onClick={() => setShowChangePassword(true)}
                  >
                    <Lock size={24} />
                    <div>
                      <h4>Change Password</h4>
                      <p>Update your password to keep your account secure</p>
                    </div>
                  </button>
                  <button className="x_booking_action_card">
                    <Mail size={24} />
                    <div>
                      <h4>Email Preferences</h4>
                      <p>Manage reservation and booking notifications</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Change Password Tab */}
          {activeTab === "changepassword" && (
            <div className="x_profile_tab">
              <div className="x_profile_tab_header">
                <h2>Change Your Password</h2>
                <p>
                  Keep your account secure by updating your password regularly
                </p>
              </div>

              <div className="x_change_password_section">
                <h3>Update Password</h3>
                <form className="x_change_password_form">
                  <div className="x_change_password_group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="x_password_input"
                      placeholder="Enter your current password"
                    />
                  </div>

                  <div></div>
                  <div className="row">
                    <div className="col-12 col-md-6 mb-3">
                      <div className="x_change_password_group">
                        <label>New Password</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="x_password_input"
                          placeholder="Enter your new password"
                        />
                        <p className="x_password_hint">
                          Use at least 8 characters with uppercase, lowercase,
                          and numbers
                        </p>
                      </div>
                    </div>

                    <div className="col-12 col-md-6 mb-3">
                      <div className="x_change_password_group">
                        <label>Confirm New Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="x_password_input"
                          placeholder="Confirm your new password"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="x_change_password_actions">
                    <button
                      type="button"
                      className="x_password_btn_reset"
                      onClick={() =>
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        })
                      }
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      className="x_password_btn_save"
                      onClick={handleSavePassword}
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div
          className="x_modal_overlay"
          onClick={() => setShowChangePassword(false)}
        >
          <div
            className="x_modal_content x_change_modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="x_modal_header">
              <h3>Change Your Password</h3>
              <button
                className="x_modal_close"
                onClick={() => setShowChangePassword(false)}
              >
                ✕
              </button>
            </div>

            <div className="x_modal_body">
              <div className="x_form_group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="x_form_input"
                  placeholder="Enter your current password"
                />
              </div>

              <div className="x_form_group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="x_form_input"
                  placeholder="Enter your new password"
                />
              </div>

              <div className="x_form_group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="x_form_input"
                  placeholder="Confirm your new password"
                />
              </div>
            </div>

            <div className="x_modal_footer">
              <button
                className="x_modal_btn_cancel"
                onClick={() => setShowChangePassword(false)}
              >
                Cancel
              </button>
              <button className="x_modal_btn_save" onClick={handleSavePassword}>
                Save Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="x_modal_overlay"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="x_modal_content x_logout_modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="x_logout_modal_icon">
              <LogOut size={48} />
            </div>
            <h3>Sign Out of Your Account?</h3>
            <p>
              Are you sure you want to logout? You'll need to sign in again to
              access your profile and bookings.
            </p>

            <div className="x_logout_modal_actions">
              <button
                className="x_logout_modal_btn_cancel"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Stay Logged In
              </button>
              <button
                className="x_logout_modal_btn_confirm"
                onClick={handleConfirmLogout}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
export default Profile;
