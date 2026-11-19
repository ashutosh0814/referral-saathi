import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Bell,
  Settings
} from 'lucide-react';

/**
 * Mobile Navigation Component
 * Bottom navigation bar for mobile devices
 */
function MobileNav() {
  const navItems = [
    {
      to: '/dashboard',
      icon: LayoutDashboard,
      label: 'Overview'
    },
    {
      to: '/referrals',
      icon: Users,
      label: 'Referrals'
    },
    {
      to: '/reminders',
      icon: Bell,
      label: 'Reminders',
      hasBadge: true
    },
    {
      to: '/settings',
      icon: Settings,
      label: 'Settings'
    }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors relative ${
                isActive
                  ? 'text-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <item.icon className="w-5 h-5" />
                  {item.hasBadge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-indigo-600 rounded-b-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default MobileNav;
