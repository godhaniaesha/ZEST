import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Award,
  CalendarDays,
  Camera,
  ChevronRight,
  Clock,
  CreditCard,
  Edit,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  User,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { ordersAPI, ratingsAPI, reservationsAPI } from "../api";
import { useAuth } from "../contexts/AuthContext";
import "../styles/profile.css";
import { MdOutlineCancel } from "react-icons/md";
import RatingModal from "./RatingModal";

const RATING_CANCEL_SNOOZE_MS = 60000;

const defaultPreferences = {
  newsletter: true,
  notifications: true,
  tableLocation: "Window",
};

const formatDate = (date, options) => {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-US", options);
};

const formatOrderDate = (date) =>
  formatDate(date, { month: "short", day: "numeric", year: "numeric" }) || "—";

const StarRating = ({ value = 0, onRate, disabled = false, size = 18 }) => (
  <div className="x_star_rating">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`x_star_btn ${star <= value ? "x_star_filled" : ""}`}
        disabled={disabled}
        onClick={() => !disabled && onRate?.(star)}
        aria-label={`Rate ${star} stars`}
      >
        <Star size={size} fill={star <= value ? "currentColor" : "none"} />
      </button>
    ))}
  </div>
);

const mapBooking = (booking) => {
  const reservationDate = new Date(booking.date || booking.createdAt);

  const status = booking.status?.toLowerCase() || "pending";

  // Handle table display with status
  let tableDisplay = "Table Pending";
  let tableStatus = "";

  if (booking.table) {
    const tableNumber = booking.table.number || booking.table.tableNumber;
    const tableStatusValue = booking.table.status || "";

    tableDisplay = `Table ${tableNumber}`;
    tableStatus = tableStatusValue;
  }

  return {
    id: booking._id,

    date: reservationDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),

    month: reservationDate.toLocaleString("en-US", {
      month: "short",
    }),

    day: reservationDate.getDate(),

    time:
      booking.time ||
      reservationDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),

    guests: booking.guests || 1,

    status,

    table: tableDisplay,

    tableStatus,

    type:
      status === "completed"
        ? "Completed Dining"
        : status === "confirmed"
        ? "Confirmed Dining"
        : "Dining Reservation",
  };
};

const getBookingFooterMessage = (status) => {
  if (status === "completed") return "Reservation Completed";
  if (status === "cancelled") return "Reservation Cancelled";
  if (status === "reserved" || status === "confirmed") return "Reservation Confirmed";
  return null;
};

const notifyCompletedReservationForRating = (reservations = []) => {
  const completedUnratedReservation = reservations.find(
    (reservation) => reservation.status === "Completed" && !reservation.rated,
  );

  if (!completedUnratedReservation) return;

  window.dispatchEvent(
    new CustomEvent("reservation-rating:completed", {
      detail: { reservationId: completedUnratedReservation._id },
    }),
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const {
    user,
    loading,
    logout,
    updateProfile,
    updateProfileImage,
    changePassword,
  } = useAuth();

  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ratingSubmitting, setRatingSubmitting] = useState(null);
  const [ratingReservation, setRatingReservation] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const ratingSnoozeUntilRef = useRef(0);
  const ratingReopenTimerRef = useRef(null);
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
    tier: "ZEST Member",
    preferences: defaultPreferences,
  });

  const firstName = useMemo(
    () => userData.name.trim().split(/\s+/)[0] || "Guest",
    [userData.name]
  );

  const rewardPoints = bookings.length * 100;

  const openCompletedReservationRating = useCallback((reservations = []) => {
    const completedUnratedReservation = reservations.find(
      (reservation) => reservation.status === "Completed" && !reservation.rated,
    );

    setRatingReservation(completedUnratedReservation || null);

    if (
      completedUnratedReservation &&
      Date.now() >= ratingSnoozeUntilRef.current
    ) {
      setShowRatingModal(true);
    }
  }, []);

  const loadBookings = useCallback(async () => {
    try {
      setBookingsLoading(true);

      const res = await reservationsAPI.getMy();

      console.log("Reservations:", res.data);

      const reservations = res.data || [];
      setBookings(reservations.map(mapBooking));
      notifyCompletedReservationForRating(reservations);
      openCompletedReservationRating(reservations);
    } catch (error) {
      console.error(error);
    } finally {
      setBookingsLoading(false);
    }
  }, [openCompletedReservationRating]);

  const loadOrders = useCallback(async () => {
    if (!user) return;
    try {
      setOrdersLoading(true);
      const res = await ordersAPI.getMy();
      setOrders(res.data || []);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  }, [user]);

  const handleRateItem = async (orderId, item, rating) => {
    const key = `${orderId}-${item._id}`;
    try {
      setRatingSubmitting(key);
      await ratingsAPI.submit({
        orderId,
        itemId: item._id,
        menuItemId: item.menuItemId,
        rating,
      });
      setOrders((prev) =>
        prev.map((order) => {
          if (order._id !== orderId) return order;
          return {
            ...order,
            items: order.items.map((orderItem) =>
              orderItem._id === item._id
                ? { ...orderItem, userRating: { rating, itemName: item.name } }
                : orderItem
            ),
          };
        })
      );
    } catch (error) {
      alert(error.response?.data?.message || "Could not submit rating.");
    } finally {
      setRatingSubmitting(null);
    }
  };

  const handleReservationRatingClose = () => {
    setShowRatingModal(false);

    if (!ratingReservation) return;

    ratingSnoozeUntilRef.current = Date.now() + RATING_CANCEL_SNOOZE_MS;
    clearTimeout(ratingReopenTimerRef.current);
    ratingReopenTimerRef.current = setTimeout(() => {
      setShowRatingModal(true);
    }, RATING_CANCEL_SNOOZE_MS);
  };

  const handleReservationRatingSubmit = async ({ rating, review }) => {
    if (!ratingReservation?._id) return;

    try {
      await ratingsAPI.submitReservation({
        reservationId: ratingReservation._id,
        rating,
        review,
      });
    } catch (error) {
      if (error.response?.status !== 409) {
        throw error;
      }
    } finally {
      setRatingReservation(null);
      setShowRatingModal(false);
      clearTimeout(ratingReopenTimerRef.current);
      loadBookings();
    }
  };

  useEffect(() => {
    AOS.init({
      duration: 700,
      once: true,
      easing: "ease-out-cubic",
    });
  }, []);

  useEffect(() => {
    return () => clearTimeout(ratingReopenTimerRef.current);
  }, []);

  useEffect(() => {
    if (!user) return;
    setUserData((prev) => ({
      ...prev,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      joinDate:
        formatDate(user.createdAt, { month: "long", year: "numeric" }) ||
        "Recently",
      tier: user.role === "customer" ? "ZEST Member" : user.role || "ZEST Member",
    }));
    setAvatarPreview(user.image || null);
    setAvatarFile(null);
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;
    loadBookings();
    if (activeTab !== "bookings") return undefined;

    const interval = setInterval(loadBookings, 20000);
    return () => clearInterval(interval);
  }, [activeTab, user, loadBookings]);

  // Load bookings immediately when user logs in
  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user, loadBookings]);

  useEffect(() => {
    if (!user) return undefined;
    if (activeTab !== "orders") return undefined;
    loadOrders();
    const interval = setInterval(loadOrders, 20000);
    return () => clearInterval(interval);
  }, [activeTab, user, loadOrders]);

  const handleLogout = () => setShowLogoutConfirm(true);

  const handleConfirmLogout = () => {
    logout();
  };

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
    setAvatarFile(null);
    setAvatarPreview(user?.image || null);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSavePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      alert("Please enter current and new password.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      alert("Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      alert(error.response?.data?.message || "Could not update password.");
    }
  };

  const handleUserDataChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = (key) => {
    setUserData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: !prev.preferences[key],
      },
    }));
  };

  const handleSaveProfile = async () => {
    try {
      if (!userData.name.trim()) {
        alert("Name is required.");
        return;
      }

      if (avatarFile) {
        const formData = new FormData();
        formData.append("name", userData.name.trim());
        formData.append("phone", userData.phone);
        formData.append("address", userData.address);
        formData.append("image", avatarFile);
        await updateProfileImage(formData);
      } else {
        await updateProfile({
          name: userData.name.trim(),
          phone: userData.phone,
          address: userData.address
        });
      }

      setIsEditing(false);
      setAvatarFile(null);
      alert("Profile updated successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Could not update profile.");
    }
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
            <span>{firstName}</span>
          </h1>
          <p className="x_profile_hero_sub">
            Manage your ZEST account, reservations, and security from one polished dashboard.
          </p>
        </div>
      </section>

      <section className="x_profile_stats_bar" data-aos="fade-up" data-aos-delay="400">
        <div className="x_stat_item">
          <div className="x_stat_icon"><Award size={24} /></div>
          <div className="x_stat_info">
            <span className="x_stat_label">Member Since</span>
            <span className="x_stat_value">{userData.joinDate}</span>
          </div>
        </div>
        <div className="x_stat_divider" />
        <div className="x_stat_item">
          <div className="x_stat_icon"><ShieldCheck size={24} /></div>
          <div className="x_stat_info">
            <span className="x_stat_label">Reward Points</span>
            <span className="x_stat_value">{rewardPoints} pts</span>
          </div>
        </div>
        <div className="x_stat_divider" />
        <div className="x_stat_item">
          <div className="x_stat_icon"><Clock size={24} /></div>
          <div className="x_stat_info">
            <span className="x_stat_label">Total Bookings</span>
            <span className="x_stat_value">{bookings.length}</span>
          </div>
        </div>
      </section>

      <section className="x_profile_container">
        <div className="x_profile_inner_wrap">
          <aside className="x_profile_sidebar" data-aos="fade-right" data-aos-delay="600">
            <div className="x_profile_menu">
              <button className={`x_profile_menu_item ${activeTab === "profile" ? "x_active" : ""}`} onClick={() => setActiveTab("profile")}>
                <div className="x_menu_icon_wrap"><User size={20} /></div>
                <span>Account Details</span>
                <ChevronRight className="x_arrow" size={18} />
              </button>
              <button className={`x_profile_menu_item ${activeTab === "bookings" ? "x_active" : ""}`} onClick={() => setActiveTab("bookings")}>
                <div className="x_menu_icon_wrap"><CalendarDays size={20} /></div>
                <span>Reservations</span>
                <ChevronRight className="x_arrow" size={18} />
              </button>
              <button className={`x_profile_menu_item ${activeTab === "orders" ? "x_active" : ""}`} onClick={() => setActiveTab("orders")}>
                <div className="x_menu_icon_wrap"><ShoppingBag size={20} /></div>
                <span>My Orders</span>
                <ChevronRight className="x_arrow" size={18} />
              </button>
              <button className={`x_profile_menu_item ${activeTab === "changepassword" ? "x_active" : ""}`} onClick={() => setActiveTab("changepassword")}>
                <div className="x_menu_icon_wrap"><Lock size={20} /></div>
                <span>Security</span>
                <ChevronRight className="x_arrow" size={18} />
              </button>
              {/* <button className={`x_profile_menu_item ${activeTab === "settings" ? "x_active" : ""}`} onClick={() => setActiveTab("settings")}>
                <div className="x_menu_icon_wrap"><Settings size={20} /></div>
                <span>Preferences</span>
                <ChevronRight className="x_arrow" size={18} />
              </button> */}
              <div className="x_menu_separator" />
              <button className="x_profile_menu_item x_logout_btn" onClick={handleLogout}>
                <div className="x_menu_icon_wrap"><LogOut size={20} /></div>
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          <div className="x_profile_content" data-aos="fade-left" data-aos-delay="800">
            {activeTab === "profile" && (
              <div className="x_profile_tab">
                <div className="x_tab_header_premium">
                  <div className="x_profile_avatar_wrapper">
                    <div className="x_avatar_main">
                      {avatarPreview ? <img src={avatarPreview} alt="Profile" /> : <User size={48} />}
                      <div className="x_avatar_status_dot" />
                    </div>
                    {isEditing && (
                      <label className="x_avatar_upload_btn">
                        <Camera size={16} />
                        <input type="file" accept="image/*" onChange={handleAvatarChange} />
                      </label>
                    )}
                  </div>

                  <div className="x_header_text_group">
                    <h2>{userData.name}</h2>
                    <div className="x_user_meta">
                      <span className="x_meta_item"><Mail size={14} /> {userData.email}</span>
                      <span className="x_meta_divider" />
                      <span className="x_meta_item"><Award size={14} /> {userData.tier}</span>
                    </div>
                  </div>

                  <button className={`x_edit_action_btn ${isEditing ? "x_cancel" : ""}`} onClick={handleEditToggle}>
                    {isEditing ? <MdOutlineCancel size={18} /> : <Edit size={18} />}
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
                        <div className="x_input_group_premium">
                          <label>Email Address</label>
                          <div className="x_input_wrapper">
                            <Mail size={18} className="x_input_icon" />
                            <input type="email" value={userData.email} disabled />
                          </div>
                        </div>
                        <div className="x_input_group_premium">
                          <label>Phone Number</label>
                          <div className="x_input_wrapper">
                            <Phone size={18} className="x_input_icon" />
                            <input type="text" name="phone" value={userData.phone} onChange={handleUserDataChange} placeholder="Enter phone number" />
                          </div>
                        </div>
                        <div className="x_input_group_premium">
                          <label>Current Address</label>
                          <div className="x_input_wrapper">
                            <MapPin size={18} className="x_input_icon" />
                            <textarea name="address" value={userData.address} onChange={handleUserDataChange} placeholder="Enter your current address" rows={3} />
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
                          <span className="x_card_value">{userData.phone || "Not added"}</span>
                        </div>
                      </div>
                      <div className="x_info_card_premium" data-aos="fade-up" data-aos-delay="300">
                        <div className="x_card_icon_premium"><MapPin size={22} /></div>
                        <div className="x_card_data">
                          <span className="x_card_label">Current Address</span>
                          <span className="x_card_value">{userData.address || "Not added"}</span>
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

            {/* {activeTab === "settings" && (
              <div className="x_profile_tab">
                <div className="x_tab_header_simple">
                  <h2>Preferences</h2>
                  <p>Customize your ZEST experience on this device.</p>
                </div>
                <div className="x_preferences_container_premium" data-aos="fade-up">
                  <div className="x_pref_group_premium">
                    <h3 className="x_section_title">Communications</h3>
                    <div className="x_pref_item_premium">
                      <div className="x_pref_info">
                        <h4>Newsletter</h4>
                        <p>Receive updates about new seasonal menus and events.</p>
                      </div>
                      <button className={`x_pref_toggle ${userData.preferences.newsletter ? "x_active" : ""}`} onClick={() => handlePreferenceChange("newsletter")} aria-label="Toggle newsletter">
                        <div className="x_toggle_dot" />
                      </button>
                    </div>
                    <div className="x_pref_item_premium">
                      <div className="x_pref_info">
                        <h4>Booking Notifications</h4>
                        <p>Get instant alerts for your table reservations.</p>
                      </div>
                      <button className={`x_pref_toggle ${userData.preferences.notifications ? "x_active" : ""}`} onClick={() => handlePreferenceChange("notifications")} aria-label="Toggle booking notifications">
                        <div className="x_toggle_dot" />
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
                          onChange={(e) =>
                            setUserData((prev) => ({
                              ...prev,
                              preferences: {
                                ...prev.preferences,
                                tableLocation: e.target.value,
                              },
                            }))
                          }
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
            )} */}

            {activeTab === "bookings" && (
              <div className="x_profile_tab">
                <div className="x_tab_header_simple">
                  <h2>Your Reservations</h2>
                  <p>View and manage your dining reservations.</p>
                </div>

                {bookingsLoading && bookings.length === 0 ? (
                  <div className="x_empty_premium">
                    <div className="x_empty_art"><CalendarDays size={80} /></div>
                    <h3>Loading Reservations</h3>
                    <p>Please wait while we fetch your latest bookings.</p>
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="x_bookings_container_premium">
                    {bookings.map((booking, index) => (
                      <div key={booking.id} className={`x_reservation_card ${booking.status}`} data-aos="fade-up" data-aos-delay={index * 100}>
                        <div className="x_res_top">
                          <div className="x_res_type_badge">{booking.type}</div>
                          <div className={`x_res_status_tag ${booking.status}`}>{booking.status}</div>
                        </div>
                        <div className="x_res_main">
                          <div className="x_res_date_box">
                            <span className="x_res_month">{booking.month}</span>
                            <span className="x_res_day">{booking.day}</span>
                          </div>
                          <div className="x_res_info">
                            <h4>{booking.table}</h4>
                            <div className="x_res_meta_row">
                              <span><Clock size={14} /> {booking.time}</span>
                              <span className="x_res_dot" />
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
                            <span className="x_res_confirmed_msg">
                              {getBookingFooterMessage(booking.status)}
                            </span>
                          )}
                          <span className="x_res_details_btn">{booking.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="x_empty_premium" data-aos="zoom-in">
                    <div className="x_empty_art"><CalendarDays size={80} /></div>
                    <h3>No Active Reservations</h3>
                    <p>You have not booked a table yet. Reserve your next ZEST dining experience anytime.</p>
                    <button className="x_btn_primary_premium" onClick={() => navigate("/reservations")}>
                      Book A Table Now
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "orders" && (
              <div className="x_profile_tab">
                <div className="x_tab_header_simple">
                  <h2>My Orders</h2>
                  <p>View your past orders and rate the dishes you enjoyed.</p>
                </div>

                {ordersLoading && orders.length === 0 ? (
                  <div className="x_empty_premium">
                    <div className="x_empty_art"><ShoppingBag size={80} /></div>
                    <h3>Loading Orders</h3>
                    <p>Please wait while we fetch your order history.</p>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="x_orders_container_premium">
                    {orders.map((order, index) => (
                      <div key={order._id} className="x_order_card" data-aos="fade-up" data-aos-delay={index * 100}>
                        <div className="x_order_header">
                          <div>
                            <span className="x_order_id">{order.id}</span>
                            <h4 className="x_order_table">{order.table}</h4>
                          </div>
                          <div className="x_order_meta">
                            <span className={`x_res_status_tag ${order.status?.toLowerCase()}`}>
                              {order.status}
                            </span>
                            <span className="x_order_date">{formatOrderDate(order.createdAt)}</span>
                          </div>
                        </div>

                        <div className="x_order_items">
                          {order.items?.map((item) => {
                            const canRate = item.status === "Served";
                            const existingRating = item.userRating?.rating || 0;
                            const isSubmitting = ratingSubmitting === `${order._id}-${item._id}`;

                            return (
                              <div key={item._id} className="x_order_item_row">
                                <div className="x_order_item_info">
                                  <span className="x_order_item_name">{item.name}</span>
                                  <span className="x_order_item_qty">x{item.qty}</span>
                                  <span className={`x_order_item_status ${item.status?.toLowerCase()}`}>
                                    {item.status}
                                  </span>
                                </div>
                                <div className="x_order_item_price">₹{item.price * item.qty}</div>
                                <div className="x_order_item_rating">
                                  {canRate ? (
                                    existingRating > 0 ? (
                                      <div className="x_rated_badge">
                                        <StarRating value={existingRating} disabled size={16} />
                                        <span>Rated</span>
                                      </div>
                                    ) : (
                                      <div className="x_rate_prompt">
                                        <span>Rate this dish</span>
                                        <StarRating
                                          value={0}
                                          disabled={isSubmitting}
                                          onRate={(rating) => handleRateItem(order._id, item, rating)}
                                          size={16}
                                        />
                                      </div>
                                    )
                                  ) : (
                                    <span className="x_rate_unavailable">
                                      {item.status === "Cancelled" ? "Cancelled" : "Rate after served"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="x_order_footer">
                          <span className="x_order_type">{order.type}</span>
                          <span className="x_order_total">Total: ₹{order.amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="x_empty_premium" data-aos="zoom-in">
                    <div className="x_empty_art"><ShoppingBag size={80} /></div>
                    <h3>No Orders Yet</h3>
                    <p>Your dining orders will appear here once you visit ZEST.</p>
                    <button className="x_btn_primary_premium" onClick={() => navigate("/menu")}>
                      Explore Menu
                    </button>
                  </div>
                )}
              </div>
            )}

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
                        <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} placeholder="Current password" />
                      </div>
                    </div>
                    <div className="x_input_row_premium">
                      <div className="x_input_group_premium">
                        <label>New Password</label>
                        <div className="x_input_wrapper">
                          <ShieldCheck size={18} className="x_input_icon" />
                          <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder="New password" />
                        </div>
                      </div>
                      <div className="x_input_group_premium">
                        <label>Confirm Password</label>
                        <div className="x_input_wrapper">
                          <ShieldCheck size={18} className="x_input_icon" />
                          <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} placeholder="Confirm password" />
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

      {showLogoutConfirm && (
        <div className="x_premium_modal_overlay">
          <div className="x_premium_modal_box" data-aos="zoom-in" data-aos-duration="400">
            <div className="x_modal_icon_premium x_logout_icon"><LogOut size={40} /></div>
            <h3>Confirm Sign Out</h3>
            <p>Are you sure you want to end your current session?</p>
            <div className="x_modal_actions_premium">
              <button className="x_btn_cancel_premium" onClick={() => setShowLogoutConfirm(false)}>Stay Here</button>
              <button className="x_btn_confirm_premium" onClick={handleConfirmLogout}>Sign Out</button>
            </div>
          </div>
        </div>
      )}

      <RatingModal
        isOpen={showRatingModal}
        onClose={handleReservationRatingClose}
        onSubmit={handleReservationRatingSubmit}
        cafeOrBarName="ZEST Cafe & Bar"
        reservation={ratingReservation}
      />
    </main>
  );
};

export default Profile;
