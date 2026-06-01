import React, { useState, useEffect } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Navbar from '../Navbar/Navbar';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 992);
  const [userRole, setUserRole] = useState('superadmin'); // Default to superadmin for demo

  const handleToggle = () => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  };

  const handleClose = () => setMobileOpen(false);

  // Handle window resize
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const mainClass = [
    'd-main-content',
    collapsed ? 'd-sidebar-collapsed' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className="d-shell">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onClose={handleClose}
        currentUserRole={userRole}
      />

      <div className={mainClass}>
        <Navbar
          collapsed={collapsed}
          sidebarOpen={isMobile ? mobileOpen : !collapsed}
          onToggleSidebar={handleToggle}
          userRole={userRole}
          setUserRole={setUserRole}
        />

        <main className="d-page-body">
          <Outlet context={{ userRole, setUserRole }} />
        </main>
      </div>
    </div>
  );
}

// Hook to use the outlet context in child components
export function useUserRole() {
  return useOutletContext();
}
