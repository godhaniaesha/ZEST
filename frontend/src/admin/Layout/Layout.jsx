import React, { useState, useEffect } from 'react';
import { Outlet, useOutletContext, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Navbar from '../Navbar/Navbar';
import { useAuth } from '../../contexts/AuthContext';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 992);
  const { user, loading } = useAuth();
  const userRole = user?.role;
  const location = useLocation();

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

  if (loading) {
    return <div className="d-shell d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>Loading...</div>;
  }

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
        />

        <main className="d-page-body">
          <Outlet context={{ userRole }} />
        </main>
      </div>
    </div>
  );
}

// Hook to use the outlet context in child components
export function useUserRole() {
  return useOutletContext();
}
