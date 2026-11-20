import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Bell,
  Settings,
  X
} from 'lucide-react';

/**
 * Sidebar Component
 * Desktop sidebar with navigation links
 * Includes keyboard navigation and focus management
 */
function Sidebar({ isOpen, onClose }) {
  const navItems = [
    {
      to: '/dashboard',
      icon: LayoutDashboard,
      label: 'Overview',
      badge: null
    },
    {
      to: '/referrals',
      icon: Users,
      label: 'My Referrals',
      badge: null
    },
    {
      to: '/reminders',
      icon: Bell,
      label: 'Reminders',
      badge: null
    },
    {
      to: '/settings',
      icon: Settings,
      label: 'Settings',
      badge: null
    }
  ];

  // Handle Escape key to close sidebar on mobile
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && window.innerWidth < 1024) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Trap focus inside sidebar when open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      const sidebar = document.querySelector('[data-sidebar]');
      if (!sidebar) return;

      const focusableElements = sidebar.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTab = (e) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      sidebar.addEventListener('keydown', handleTab);
      firstElement?.focus();

      return () => {
        sidebar.removeEventListener('keydown', handleTab);
      };
    }
  }, [isOpen]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        data-sidebar
        className={`
          fixed lg:relative top-0 left-0 z-40 h-screen lg:h-auto w-64 bg-[#000000] border-r border-[#282828]
          transform transition-transform duration-200 ease-in-out shadow-xl lg:shadow-none
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo + Close Button - Mobile only */}
          <div className="flex items-center justify-between h-14 px-6 border-b border-[#282828] lg:hidden">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <span className="text-lg font-semibold text-white tracking-tight">
                ReferralSaathi
              </span>
            </div>

            {/* Close button - Mobile only */}
            <button
              onClick={onClose}
              className="p-2 text-gray-300 hover:text-white hover:bg-[#282828] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#000000]"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Logo - Desktop only */}
          <div className="hidden lg:flex items-center h-14 px-6 border-b border-[#282828]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <span className="text-lg font-semibold text-white tracking-tight">
                ReferralSaathi
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto" role="menu">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  // Close sidebar on mobile after navigation
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'nav-link-active' : ''}`
                }
                role="menuitem"
              >
                {({ isActive }) => (
                  <>
                    <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="badge badge-primary" aria-label={`${item.badge} notifications`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[#282828]">
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-5 border border-green-500/20">
              <p className="text-sm font-semibold text-white mb-1.5 tracking-tight">
                Need Help?
              </p>
              <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                Check out our documentation and guides
              </p>
              <a
                href="#"
                className="text-sm font-semibold text-green-500 hover:text-green-400 transition-colors inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#000000] rounded"
                tabIndex={0}
              >
                View Documentation →
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
