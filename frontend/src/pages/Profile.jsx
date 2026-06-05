import React, { useState, useEffect } from "react";
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
  Star,
  ShieldCheck,
  Clock,
  Settings,
  CreditCard,
  Camera,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import "../styles/profile.css";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
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
    tier: "Gold Member",
    points: 1250,
    bookingsCount: 12,
    preferences: {
      newsletter: true,
      notifications: false,
      tableLocation: "Window",
      dietary: "None"
    }
  });

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-out-cubic",
    });
  }, []);

  const handlePreferenceChange = (key) => {
    setUserData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: !prev.preferences[key]
      }
    }));
  };

  const [bookings, setBookings] = useState([
    {
      id: 1,
      date: "June 15, 2024",
      time: "7:00 PM",
      guests: 4,
      status: "confirmed",
      table: "Table 5",
      type: "Dinner"
    },
    {
      id: 2,
      date: "June 22, 2024",
      time: "8:30 PM",
      guests: 2,
      status: "confirmed",
      table: "Table 2",
      type: "Late Night"
    },
    {
      id: 3,
      date: "June 28, 2024",
      time: "6:00 PM",
      guests: 6,
      status: "pending",
      table: "TBD",
      type: "Private Dining"
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
      <section className="x_profile_hero" data-aos="fade-down">
        <div className="x_profile_hero_content">
          <div className="x_badge_container" data-aos="zoom-in" data-aos-delay="200">
            <span className="x_profile_hero_label">Exclusive Access</span>
            <div className="x_tier_badge">
              <Star size={14} fill="currentColor" />
              <span>{userData.tier}</span>
            </div>
          </div>
          <h1 className="x_profile_headline">
            Welcome back, <br />
            <span>{userData.name.split(' ')[0]}</span>
          </h1>
          <p className="x_profile_hero_sub">Elevate your dining experience with your personalized premium dashboard.</p>
        </div>
      </section>

      {/* Quick Stats / Info Bar */}
      <section className="x_profile_stats_bar" data-aos="fade-up" data-aos-delay="400">
        <div className="x_stat_item">
          <div className="x_stat_icon"><Award size={24} /></div>
          <div className="x_stat_info">
            <span className="x_stat_label">Member Since</span>
            <span className="x_stat_value">{userData.joinDate}</span>
          </div>
        </div>
        <div className="x_stat_divider"></div>
        <div className="x_stat_item">
          <div className="x_stat_icon"><ShieldCheck size={24} /></div>
          <div className="x_stat_info">
            <span className="x_stat_label">Reward Points</span>
            <span className="x_stat_value">{userData.points} pts</span>
          </div>
        </div>
        <div className="x_stat_divider"></div>
        <div className="x_stat_item">
          <div className="x_stat_icon"><Clock size={24} /></div>
          <div className="x_stat_info">
            <span className="x_stat_label">Total Bookings</span>
            <span className="x_stat_value">{userData.bookingsCount}</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="x_profile_container">
        <div className="x_profile_inner_wrap">
          {/* Sidebar */}
          <aside className="x_profile_sidebar" data-aos="fade-right" data-aos-delay="600">
            <div className="x_profile_menu">
              <button
                className={`x_profile_menu_item ${activeTab === "profile" ? "x_active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <div className="x_menu_icon_wrap"><User size={20} /></div>
                <span>Account Details</span>
                <ChevronRight className="x_arrow" size={18} />
              </button>

              <button
                className={`x_profile_menu_item ${activeTab === "bookings" ? "x_active" : ""}`}
                onClick={() => setActiveTab("bookings")}
              >
                <div className="x_menu_icon_wrap"><CalendarDays size={20} /></div>
                <span>Reservations</span>
                <ChevronRight className="x_arrow" size={18} />
              </button>

              <button
                className={`x_profile_menu_item ${activeTab === "changepassword" ? "x_active" : ""}`}
                onClick={() => setActiveTab("changepassword")}
              >
                <div className="x_menu_icon_wrap"><Lock size={20} /></div>
                <span>Security</span>
                <ChevronRight className="x_arrow" size={18} />
              </button>

              <button
                className={`x_profile_menu_item ${activeTab === "settings" ? "x_active" : ""}`}
                onClick={() => setActiveTab("settings")}
              >
                <div className="x_menu_icon_wrap"><Settings size={20} /></div>
                <span>Preferences</span>
                <ChevronRight className="x_arrow" size={18} />
              </button>

              <div className="x_menu_separator"></div>

              <button
                className="x_profile_menu_item x_logout_btn"
                onClick={handleLogout}
              >
                <div className="x_menu_icon_wrap"><LogOut size={20} /></div>
                <span>Sign Out</span>
              </button>
            </div>

            {/* <div className="x_sidebar_promo">
              <div className="x_promo_content">
                <Star size={32} className="x_promo_icon" />
                <h4>Premium Perks</h4>
                <p>Unlock 15% off on your next private dining booking.</p>
                <button className="x_promo_btn">Claim Now</button>
              </div>
            </div> */}
          </aside>

          {/* Content Area */}
          <div className="x_profile_content" data-aos="fade-left" data-aos-delay="800">
            {/* User Profile Tab */}
            {activeTab === "profile" && (
              <div className="x_profile_tab">
                <div className="x_tab_header_premium">
                  <div className="x_profile_avatar_wrapper">
                    <div className="x_avatar_main">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Profile" />
                      ) : (
                        <User size={48} />
                      )}
                      <div className="x_avatar_status_dot"></div>
                    </div>
                    {isEditing && (
                      <label className="x_avatar_upload_btn">
                        <Camera size={16} />
                        <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
                      </label>
                    )}
                  </div>
                  
                  <div className="x_header_text_group">
                    <h2>{userData.name}</h2>
                    <div className="x_user_meta">
                      <span className="x_meta_item"><Mail size={14} /> {userData.email}</span>
                      <span className="x_meta_divider"></span>
                      <span className="x_meta_item"><Award size={14} /> {userData.tier}</span>
                    </div>
                  </div>

                  <button className={`x_edit_action_btn ${isEditing ? 'x_cancel' : ''}`} onClick={handleEditToggle}>
                    {isEditing ? <Lock size={18} /> : <Edit size={18} />}
                    <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
                  </button>
                </div>

                <div className="x_profile_body_content">
                  {isEditing ? (
                    <div className="x_form_container_premium" data-aos="fade-up">
                      <h3 className="x_section_title">Modify Your Details</h3>
                      <form className="x_premium_form">
                        <div className="x_input_group_premium">
                          <label>Full Name</label>
                          <div className="x_input_wrapper">
                            <User size={18} className="x_input_icon" />
                            <input type="text" name="name" value={userData.name} onChange={handleUserDataChange} placeholder="Enter your full name" />
                          </div>
                        </div>

                        <div className="x_input_row_premium">
                          <div className="x_input_group_premium">
                            <label>Email Address</label>
                            <div className="x_input_wrapper">
                              <Mail size={18} className="x_input_icon" />
                              <input type="email" name="email" value={userData.email} onChange={handleUserDataChange} placeholder="your@email.com" />
                            </div>
                          </div>
                          <div className="x_input_group_premium">
                            <label>Phone Number</label>
                            <div className="x_input_wrapper">
                              <Phone size={18} className="x_input_icon" />
                              <input type="tel" name="phone" value={userData.phone} onChange={handleUserDataChange} placeholder="+1 (555) 000-0000" />
                            </div>
                          </div>
                        </div>

                        <div className="x_input_group_premium">
                          <label>Delivery Address</label>
                          <div className="x_input_wrapper">
                            <MapPin size={18} className="x_input_icon" />
                            <input type="text" name="address" value={userData.address} onChange={handleUserDataChange} placeholder="Street address, city, state" />
                          </div>
                        </div>

                        <div className="x_form_actions_premium">
                          <button type="button" className="x_btn_primary_premium" onClick={handleSaveProfile}>
                            Save Changes
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="x_info_grid_premium">
                      <div className="x_info_card_premium" data-aos="fade-up" data-aos-delay="100">
                        <div className="x_card_icon_premium"><Mail size={22} /></div>
                        <div className="x_card_data">
                          <span className="x_card_label">Email Address</span>
                          <span className="x_card_value">{userData.email}</span>
                        </div>
                      </div>
                      <div className="x_info_card_premium" data-aos="fade-up" data-aos-delay="200">
                        <div className="x_card_icon_premium"><Phone size={22} /></div>
                        <div className="x_card_data">
                          <span className="x_card_label">Phone Number</span>
                          <span className="x_card_value">{userData.phone}</span>
                        </div>
                      </div>
                      <div className="x_info_card_premium" data-aos="fade-up" data-aos-delay="300">
                        <div className="x_card_icon_premium"><MapPin size={22} /></div>
                        <div className="x_card_data">
                          <span className="x_card_label">Current Address</span>
                          <span className="x_card_value">{userData.address}</span>
                        </div>
                      </div>
                      <div className="x_info_card_premium" data-aos="fade-up" data-aos-delay="400">
                        <div className="x_card_icon_premium"><CreditCard size={22} /></div>
                        <div className="x_card_data">
                          <span className="x_card_label">Membership Tier</span>
                          <span className="x_card_value">{userData.tier}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === "settings" && (
              <div className="x_profile_tab">
                <div className="x_tab_header_simple">
                  <h2>Preferences</h2>
                  <p>Customize your experience with ZEST.</p>
                </div>
                
                <div className="x_preferences_container_premium" data-aos="fade-up">
                  <div className="x_pref_group_premium">
                    <h3 className="x_section_title">Communications</h3>
                    <div className="x_pref_item_premium">
                      <div className="x_pref_info">
                        <h4>Newsletter</h4>
                        <p>Receive updates about new seasonal menus and events.</p>
                      </div>
                      <button 
                        className={`x_pref_toggle ${userData.preferences.newsletter ? 'x_active' : ''}`}
                        onClick={() => handlePreferenceChange('newsletter')}
                      >
                        <div className="x_toggle_dot"></div>
                      </button>
                    </div>
                    
                    <div className="x_pref_item_premium">
                      <div className="x_pref_info">
                        <h4>Booking Notifications</h4>
                        <p>Get instant alerts for your table reservations.</p>
                      </div>
                      <button 
                        className={`x_pref_toggle ${userData.preferences.notifications ? 'x_active' : ''}`}
                        onClick={() => handlePreferenceChange('notifications')}
                      >
                        <div className="x_toggle_dot"></div>
                      </button>
                    </div>
                  </div>

                  <div className="x_pref_group_premium">
                    <h3 className="x_section_title">Dining Preferences</h3>
                    <div className="x_input_group_premium">
                      <label>Preferred Table Location</label>
                      <div className="x_input_wrapper">
                        <MapPin size={18} className="x_input_icon" />
                        <select 
                          className="x_premium_select"
                          value={userData.preferences.tableLocation}
                          onChange={(e) => setUserData({...userData, preferences: {...userData.preferences, tableLocation: e.target.value}})}
                        >
                          <option value="Window">Window View</option>
                          <option value="Booth">Private Booth</option>
                          <option value="Outdoor">Outdoor Terrace</option>
                          <option value="Bar">Near the Bar</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* My Bookings Tab */}
            {activeTab === "bookings" && (
              <div className="x_profile_tab">
                <div className="x_tab_header_simple">
                  <h2>Your Reservations</h2>
                  <p>Experience the finest dining curated just for you.</p>
                </div>

                {bookings.length > 0 ? (
                  <div className="x_bookings_container_premium">
                    {bookings.map((booking, index) => (
                      <div 
                        key={booking.id} 
                        className={`x_reservation_card ${booking.status}`}
                        data-aos="fade-up"
                        data-aos-delay={index * 100}
                      >
                        <div className="x_res_top">
                          <div className="x_res_type_badge">{booking.type}</div>
                          <div className={`x_res_status_tag ${booking.status}`}>{booking.status}</div>
                        </div>
                        <div className="x_res_main">
                          <div className="x_res_date_box">
                            <span className="x_res_month">{booking.date.split(' ')[0].substring(0,3)}</span>
                            <span className="x_res_day">{booking.date.split(' ')[1].replace(',','')}</span>
                          </div>
                          <div className="x_res_info">
                            <h4>{booking.table}</h4>
                            <div className="x_res_meta_row">
                              <span><Clock size={14} /> {booking.time}</span>
                              <span className="x_res_dot"></span>
                              <span><User size={14} /> {booking.guests} Guests</span>
                            </div>
                          </div>
                        </div>
                        <div className="x_res_footer">
                          {booking.status === "pending" ? (
                            <button className="x_res_cancel_link" onClick={() => handleCancelBooking(booking.id)}>
                              Cancel Reservation
                            </button>
                          ) : (
                            <span className="x_res_confirmed_msg">Reservation Confirmed</span>
                          )}
                          <button className="x_res_details_btn">View Details</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="x_empty_premium" data-aos="zoom-in">
                    <div className="x_empty_art">
                      <CalendarDays size={80} />
                    </div>
                    <h3>No Active Reservations</h3>
                    <p>It seems you haven't booked a table yet. Join us for an unforgettable culinary journey.</p>
                    <button className="x_btn_primary_premium">Book A Table Now</button>
                  </div>
                )}
              </div>
            )}

            {/* Change Password Tab */}
            {activeTab === "changepassword" && (
              <div className="x_profile_tab">
                <div className="x_tab_header_simple">
                  <h2>Security Settings</h2>
                  <p>Protect your account with a strong password.</p>
                </div>

                <div className="x_security_container_premium" data-aos="fade-up">
                  <form className="x_premium_form">
                    <div className="x_input_group_premium">
                      <label>Current Password</label>
                      <div className="x_input_wrapper">
                        <Lock size={18} className="x_input_icon" />
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="x_input_row_premium">
                      <div className="x_input_group_premium">
                        <label>New Password</label>
                        <div className="x_input_wrapper">
                          <ShieldCheck size={18} className="x_input_icon" />
                          <input
                            type="password"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            placeholder="New password"
                          />
                        </div>
                      </div>
                      <div className="x_input_group_premium">
                        <label>Confirm Password</label>
                        <div className="x_input_wrapper">
                          <ShieldCheck size={18} className="x_input_icon" />
                          <input
                            type="password"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            placeholder="Confirm password"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="x_form_actions_premium">
                      <button type="button" className="x_btn_secondary_premium" onClick={() => setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })}>
                        Reset Fields
                      </button>
                      <button type="button" className="x_btn_primary_premium" onClick={handleSavePassword}>
                        Update Security
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="x_premium_modal_overlay">
          <div className="x_premium_modal_box" data-aos="zoom-in" data-aos-duration="400">
            <div className="x_modal_icon_premium x_logout_icon">
              <LogOut size={40} />
            </div>
            <h3>Confirm Sign Out</h3>
            <p>Are you sure you want to end your current session?</p>
            <div className="x_modal_actions_premium">
              <button className="x_btn_cancel_premium" onClick={() => setShowLogoutConfirm(false)}>Stay Here</button>
              <button className="x_btn_confirm_premium" onClick={handleConfirmLogout}>Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Profile;
