import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

/**
 * Main Application Layout
 * Combines Header, Sidebar, MobileNav, and page content
 */
function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col">
      {/* Header - Full width at top */}
      <Header onMenuClick={handleMenuClick} />

      {/* Main container with Sidebar and Content side by side */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

        {/* Main Content Area */}
        <main className="flex-1 pb-16 lg:pb-0 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}

export default AppLayout;
