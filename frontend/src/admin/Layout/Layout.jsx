import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Navbar from '../Navbar/Navbar';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = () => window.innerWidth < 992;

  const handleToggle = () => {
    if (isMobile()) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  };

  const handleClose = () => setMobileOpen(false);

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 992) setMobileOpen(false);
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
      />

      <div className={mainClass}>
        <Navbar
          collapsed={collapsed}
          sidebarOpen={isMobile() ? mobileOpen : !collapsed}
          onToggleSidebar={handleToggle}
        />

        <main className="d-page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}