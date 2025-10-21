import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import FistBumpIcon from './FistBumpIcon';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(to bottom, rgba(245, 245, 245, 0.5) 1px, transparent 1px), linear-gradient(to right, rgba(245, 245, 245, 0.5) 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      backgroundColor: '#fafaf9'
    }}>
      <header className="bg-white shadow-sm border-b border-gray-200" role="banner">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Logo */}
            <Link to="/" className="flex items-center hover:opacity-80 transition" aria-label="Home - Goals">
              <FistBumpIcon size={62} className="text-gray-800" />
            </Link>

            {/* Center: Navigation */}
            <nav className="flex gap-1" role="navigation" aria-label="Main navigation">
              <Link
                to="/"
                className={`px-6 py-2 font-medium transition min-h-[44px] flex items-center ${
                  location.pathname === '/'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                role="tab"
                aria-selected={location.pathname === '/'}
                aria-label="Goals"
              >
                <span>Goals</span>
              </Link>
              <Link
                to="/habits"
                className={`px-6 py-2 font-medium transition min-h-[44px] flex items-center ${
                  location.pathname === '/habits'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                role="tab"
                aria-selected={location.pathname === '/habits'}
                aria-label="Habits"
              >
                <span>Habits</span>
              </Link>
              <Link
                to="/partner"
                className={`px-6 py-2 font-medium transition min-h-[44px] flex items-center ${
                  location.pathname === '/partner'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                role="tab"
                aria-selected={location.pathname === '/partner'}
                aria-label="Partner"
              >
                <span>Partner</span>
              </Link>
            </nav>

            {/* Right: User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold hover:bg-indigo-700 transition"
                aria-label={`User menu for ${user?.name}`}
              >
                {user?.name?.[0]?.toUpperCase()}
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    aria-label="Logout"
                  >
                    <LogOut size={16} aria-hidden="true" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8" role="main">
        {children}
      </main>
    </div>
  );
};

export default Layout;