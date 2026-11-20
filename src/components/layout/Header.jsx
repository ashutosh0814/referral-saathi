import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, User, LogOut, Settings as SettingsIcon, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Header Component
 * Shows logo, notifications, user profile with dropdown
 * Includes improved mobile positioning and keyboard navigation
 */
function Header({ onMenuClick }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/auth');
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  // Handle Escape key to close menu
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showUserMenu) {
        setShowUserMenu(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showUserMenu]);

  // Focus trap for dropdown menu
  useEffect(() => {
    if (showUserMenu && menuRef.current) {
      const focusableElements = menuRef.current.querySelectorAll(
        'button:not([disabled])'
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

      menuRef.current.addEventListener('keydown', handleTab);
      firstElement?.focus();

      return () => {
        menuRef.current?.removeEventListener('keydown', handleTab);
      };
    }
  }, [showUserMenu]);

  return (
    <header className="bg-[#000000] border-b border-[#282828] z-30 shadow-sm flex-shrink-0">
      <div className="flex items-center justify-between h-12 sm:h-14 px-3 sm:px-4 lg:px-8">
        {/* Left: Mobile menu button only */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-300 hover:text-white hover:bg-[#282828] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#000000]"
            aria-label="Open menu"
            aria-expanded="false"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo - Show only on mobile */}
          <div className="flex items-center gap-2 sm:gap-3 lg:hidden">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-white"
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
            <span className="text-base sm:text-lg font-semibold text-white tracking-tight">
              ReferralSaathi
            </span>
          </div>
        </div>

        {/* Right: Notifications + User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications */}
          <button
            className="relative p-1.5 sm:p-2 text-gray-300 hover:text-white hover:bg-[#282828] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#000000]"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" aria-hidden="true"></span>
            <span className="sr-only">You have unread notifications</span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 sm:pr-3 hover:bg-[#282828] rounded-lg transition-colors border border-transparent hover:border-[#3e3e3e] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#000000]"
              aria-label="User menu"
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <div className="hidden md:block text-right">
                <p className="text-xs sm:text-sm font-medium text-white tracking-tight">
                  {user?.displayName || 'Guest User'}
                </p>
                <p className="text-xs text-gray-300 truncate max-w-[150px]">
                  {user?.email || 'guest@example.com'}
                </p>
              </div>
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full ring-2 ring-gray-200"
                />
              ) : (
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm shadow-sm">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'G'}
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                {/* Backdrop for mobile */}
                <div
                  className="fixed inset-0 z-10 lg:hidden"
                  onClick={() => setShowUserMenu(false)}
                  aria-hidden="true"
                />

                {/* Menu */}
                <div
                  ref={menuRef}
                  className="absolute right-0 mt-2 w-52 sm:w-60 bg-[#1a1a1a] rounded-xl shadow-xl border border-[#282828] py-1 sm:py-1.5 z-20 animate-slide-in-down"
                  role="menu"
                  aria-orientation="vertical"
                >
                  {/* User Info - Mobile only */}
                  <div className="md:hidden px-3 sm:px-4 py-2 sm:py-3 border-b border-[#282828]">
                    <p className="text-xs sm:text-sm font-medium text-white break-words">
                      {user?.displayName || 'Guest User'}
                    </p>
                    <p className="text-xs text-gray-300 mt-0.5 break-words">
                      {user?.email || 'guest@example.com'}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-200 hover:bg-[#282828] transition-colors font-medium text-left focus:outline-none focus:bg-[#282828]"
                    role="menuitem"
                  >
                    <SettingsIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                    Settings
                  </button>
                  <div className="my-0.5 sm:my-1 border-t border-[#282828]" role="separator"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-red-400 hover:bg-red-500/10 transition-colors font-medium text-left focus:outline-none focus:bg-red-500/20"
                    role="menuitem"
                  >
                    <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
