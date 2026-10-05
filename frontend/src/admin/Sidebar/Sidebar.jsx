import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdRestaurantMenu,
  MdReceiptLong,
  MdEventSeat,
  MdInventory2,
  MdPeople,
  MdBarChart,
  MdSettings,
  MdLogout,
  MdLocalBar,
  MdStar,
  MdKitchen,
  MdCountertops,
  MdTableRestaurant,
  MdLocalAtm,
  MdAdminPanelSettings,
  MdHistory,
  MdNotificationsActive,
  MdLocalDining,
  MdAccessTime,
  MdEvent,
  MdArticle,
  MdPhotoLibrary,
} from "react-icons/md";
import LogoutConfirmModal from "../../components/LogoutConfirmModal";
import { useAuth } from "../../contexts/AuthContext";

const ADMIN_BASE = "/admin";

// Available Roles in your system:
// 'superadmin', 'manager', 'chef', 'waiter'

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      {
        to: "/admin/dashboard",
        icon: <MdDashboard />,
        label: "Dashboard",
        roles: ["superadmin", "manager", "chef", "waiter", "cashier"], // Accessible by everyone
      },
    ],
  },
  {
    label: "Super Admin",
    items: [
      {
        to: "/admin/users",
        icon: <MdAdminPanelSettings />,
        label: "User Management",
        roles: ["superadmin"],
      },
      // { to: '/admin/system-logs', icon: <MdHistory />, label: 'System Logs', roles: ['superadmin'] },
      // { to: '/admin/settings', icon: <MdSettings />, label: 'Global Settings', roles: ['superadmin'] }
    ],
  },
  {
    label: "Management",
    items: [
      {
        to: `/admin/pos`,
        icon: <MdLocalAtm />,
        label: "POS & Billing",
        roles: ["manager", "superadmin", "cashier"],
      },
      {
        to: `/admin/orders`,
        icon: <MdReceiptLong />,
        label: "Orders",
        badge: "8",
        roles: ["manager", "superadmin", "cashier", "waiter", "chef"],
      },
      {
        to: `/admin/reservations`,
        icon: <MdEventSeat />,
        label: "Reservations",
        badge: "3",
        roles: ["manager", "superadmin", "waiter"],
      },
      {
        to: `/admin/staff`,
        icon: <MdPeople />,
        label: "Staff",
        roles: ["manager", "superadmin"],
      },
      {
        to: `/admin/staff-attendance`,
        icon: <MdAccessTime />,
        label: "Attendance",
        roles: ["manager", "superadmin", "chef", "waiter", "cashier"],
      },
      {
        to: `/admin/leave-management`,
        icon: <MdEvent />,
        label: "Leave Management",
        badge: "2",
        roles: ["manager", "superadmin", "chef", "waiter", "cashier"],
      },
      {
        to: `/admin/reports`,
        icon: <MdBarChart />,
        label: "Reports & Analytics",
        roles: ["manager", "superadmin"],
      },
      {
        to: `/admin/blog`,
        icon: <MdArticle />,
        label: "Blog Management",
        roles: ["manager", "superadmin"],
      },
      {
        to: `/admin/gallery`,
        icon: <MdPhotoLibrary />,
        label: "Gallery Management",
        roles: ["manager", "superadmin"],
      },
    ],
  },
  {
    label: "Kitchen & Bar",
    items: [
      {
        to: "/admin/kitchen-display",
        icon: <MdKitchen />,
        label: "Live Orders (KOT)",
        badge: "5",
        roles: ["chef", "manager", "superadmin"],
      },
      {
        to: "/admin/menu",
        icon: <MdRestaurantMenu />,
        label: "Menu Items",
        badge: null,
        roles: ["chef", "manager", "superadmin"],
      },
      {
        to: "/admin/bar",
        icon: <MdLocalBar />,
        label: "Bar & Drinks",
        badge: null,
        roles: ["manager", "superadmin"],
      },
      {
        to: "/admin/categories",
        icon: <MdLocalDining />,
        label: "Categories & Cuisines",
        badge: null,
        roles: ["chef", "manager", "superadmin"],
      },
      {
        to: "/admin/inventory",
        icon: <MdInventory2 />,
        label: "Inventory Stock",
        roles: ["chef", "manager", "superadmin"],
      },
    ],
  },
  {
    label: "Service",
    items: [
      {
        to: "/admin/tables",
        icon: <MdTableRestaurant />,
        label: "Table Status",
        roles: ["waiter", "manager", "superadmin"],
      },
      {
        to: "/admin/take-order",
        icon: <MdCountertops />,
        label: "Take New Order",
        roles: ["waiter", "manager", "superadmin"],
      },
      {
        to: "/admin/service-requests",
        icon: <MdNotificationsActive />,
        label: "Customer Requests",
        badge: "2",
        roles: ["manager", "superadmin"],
      },
    ],
  },
  {
    label: "Feedbacks",
    items: [
      {
        to: "/admin/reviews",
        icon: <MdStar />,
        label: "Reviews & Ratings",
        roles: ["manager", "superadmin"],
      },
    ],
  },
];

export default function Sidebar({ collapsed, mobileOpen, onClose }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const currentUserRole = user?.role || "customer";

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    onClose();
    navigate("/auth");
  };

  const sidebarClass = [
    "d-sidebar",
    collapsed ? "d-collapsed" : "",
    mobileOpen ? "d-mobile-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`d-overlay ${mobileOpen ? "d-visible" : ""}`}
        onClick={onClose}
      />

      <aside className={sidebarClass}>
        {/* Logo */}
        <Link
          to="/"
          className="d-sidebar-logo"
          style={{ textDecoration: "none" }}
        >
          <div className="d-logo-icon">☕</div>
          <div className="d-logo-text">
            <div className="d-logo-name">Zest</div>
            <div className="d-logo-tagline">Café & Bar Admin</div>
          </div>
        </Link>

        {/* Nav */}
        <div className="d-sidebar-scroll">
          {NAV_GROUPS.map((group) => {
            // 1. Filter out items that the current user shouldn't see
            const allowedItems = group.items.filter((item) =>
              item.roles ? item.roles.includes(currentUserRole) : true,
            );

            // 2. If no items are allowed in this group, ignore/skip rendering the entire group header
            if (allowedItems.length === 0) return null;

            return (
              <div key={group.label} className="d-nav-group-wrapper">
                <div className="d-nav-group-label">{group.label}</div>
                {allowedItems.map((item) => {
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) => `d-nav-item ${isActive ? "d-active" : ""}`}
                      end
                    >
                      <span className="d-nav-icon">{item.icon}</span>
                      <span className="d-nav-label">{item.label}</span>
                      <span className="d-tooltip">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="d-sidebar-footer">
          <div
            className="d-nav-item"
            onClick={() => setShowLogoutConfirm(true)}
            style={{ cursor: "pointer" }}
          >
            <span className="d-nav-icon">
              <MdLogout />
            </span>
            <span className="d-nav-label">Logout</span>
            <span className="d-tooltip">Logout</span>
          </div>
        </div>
      </aside>
      <LogoutConfirmModal
        show={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}
