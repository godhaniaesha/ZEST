import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Navigate } from "react-router-dom";
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
import { useAuth } from "../contexts/AuthContext";
import { reservationsAPI } from "../api";
import "../styles/profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading, logout, updateProfile, updateProfileImage, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    joinDate: "",
  });

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const mapBooking = (booking) => ({
    id: booking._id,
    date: new Date(booking.date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    time: booking.time,
    guests: booking.guests,
    status: booking.status?.toLowerCase() || "pending",
    table: `Table ${booking.tableNumber}`,
  });

  const loadBookings = useCallback(async () => {
    if (!user) return;
    try {
      setBookingsLoading(true);
      const res = await reservationsAPI.getMy();
      const next = (res.data || []).map(mapBooking);
      setBookings((prev) => {
        const prevKey = prev.map((b) => `${b.id}:${b.status}`).join("|");
        const nextKey = next.map((b) => `${b.id}:${b.status}`).join("|");
        if (prevKey === nextKey) return prev;
        return next;
      });
    } catch (error) {
      console.error("Failed to load bookings:", error);
    } finally {
      setBookingsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setUserData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      joinDate: user.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : "",
    });
    if (user.image) setAvatarPreview(user.image);
  }, [user]);

  useEffect(() => {
    if (activeTab !== "bookings" || !user) return undefined;
    loadBookings();
    const interval = setInterval(loadBookings, 20000);
    return () => clearInterval(interval);
  }, [activeTab, user, loadBookings]);

  const handleLogout = () => {
    // Show logout confirmation modal
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate("/auth");
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setAvatarPreview(null);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
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

  const handleSavePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      alert("Password updated successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowChangePassword(false);
    } catch (error) {
      alert(error.response?.data?.message || "Could not update password.");
    }
  };

  const handleUserDataChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append("name", userData.name);
        formData.append("image", avatarFile);
        await updateProfileImage(formData);
      } else {
        await updateProfile({ name: userData.name });
      }
      setIsEditing(false);
      setAvatarFile(null);
      alert("Profile updated successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Could not update profile.");
    }
  };

  const handleCancelBooking = async (id) => {
    try {
      await reservationsAPI.cancelMy(id);
      await loadBookings();
      alert("Booking cancelled successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Could not cancel booking.");
    }
  };

  if (loading) {
    return (
      <main className="x_profile_page">
        <section className="x_profile_container">
          <p>Loading profile...</p>
        </section>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <main className="x_profile_page">
      {/* Background Elements */}
      <div className="x_profile_glow" />
      
      {/* Hero Section */}
      <section className="x_profile_hero">
        <div className="x_profile_hero_content">
          <span className="x_profile_hero_label">Member Dashboard</span>
          <h1 className="x_profile_headline">Your <span>Account</span></h1>
          <p className="x_profile_hero_sub">Manage your profile, bookings, and preferences with ease.</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="x_profile_container">
        <div className="x_profile_inner_wrap">
          {/* Sidebar */}
          <aside className="x_profile_sidebar">
            <div className="x_profile_menu">
              <button
                className={`x_profile_menu_item ${activeTab === "profile" ? "x_active" : ""
                  }`}
                onClick={() => setActiveTab("profile")}
              >
                <User size={20} />
                <span>User Profile</span>
                {activeTab === "profile" && <ChevronRight size={18} />}
              </button>

              <button
                className={`x_profile_menu_item ${activeTab === "bookings" ? "x_active" : ""
                  }`}
                onClick={() => setActiveTab("bookings")}
              >
                <CalendarDays size={20} />
                <span>My Bookings</span>
                {activeTab === "bookings" && <ChevronRight size={18} />}
              </button>

              <button
                className={`x_profile_menu_item ${activeTab === "changepassword" ? "x_active" : ""
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

              {bookingsLoading && bookings.length === 0 ? (
                <p className="text-muted">Loading reservations...</p>
              ) : bookings.length > 0 ? (
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
                  <div className="x_empty_icon_wrap">
                    <CalendarDays size={64} />
                  </div>
                  <h3>No Reservations Yet</h3>
                  <p>Experience the finest dining ZEST has to offer. Start your journey by making your first reservation today.</p>
                  <button className="x_new_booking_btn">
                    Reserve a Table
                  </button>
                </div>
              )}

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
                      placeholder="current password"
                  />
                </div>

                <div className="x_change_password_grid">
                    <div className="x_change_password_group">
                      <label>New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="x_password_input"
                        placeholder="new password"
                      />
                      <p className="x_password_hint">
                        Use at least 8 characters with uppercase, lowercase,
                        and numbers
                      </p>
                    </div>

                    <div className="x_change_password_group">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="x_password_input"
                        placeholder="Confirm new password"
                      />
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
            <div className="x_modal_body">
              <div className="x_logout_modal_icon">
                <LogOut size={48} />
              </div>
              <h3>Sign Out?</h3>
              <p>
                Are you sure you want to logout? You'll need to sign in again to
                access your premium profile and reservations.
              </p>

              <div className="x_logout_modal_actions">
                <button
                  className="x_logout_modal_btn_confirm"
                  onClick={handleConfirmLogout}
                >
                  Yes, Sign Out
                </button>
                <button
                  className="x_logout_modal_btn_cancel"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Stay Logged In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
export default Profile;
