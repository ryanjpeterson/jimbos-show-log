import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false); // Close menu on logout
    navigate('/login');
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-gray-800 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* SITE TITLE (Left) - Removed Emoji, reduced weight */}
        <Link 
          to="/" 
          className="text-xl font-bold tracking-tight hover:text-gray-200 transition"
          onClick={closeMenu}
        >
          Jimbo's Show Log
        </Link>
        
        {/* MOBILE MENU BUTTON (Visible only on small screens) */}
        <button 
          className="md:hidden p-2 rounded focus:outline-none focus:bg-gray-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {/* Hamburger Icon */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* DESKTOP MENU (Hidden on mobile, visible on md+) */}
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link to="/stats" className="hover:text-blue-300 transition">Stats</Link>
          
          {/* Auth Indicator & Links */}
          {isAuthenticated ? (
            <>
              <div className="h-4 w-px bg-gray-600 mx-2"></div>
              <Link to="/create" className="hover:text-green-400 transition">Create</Link>
              <Link to="/admin" className="hover:text-purple-400 transition">Admin</Link>
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-1 text-red-400 hover:text-red-300 transition ml-2"
                title="Logout"
              >
                <span>🔓</span> Logout
              </button>
            </>
          ) : (
            <>
              <div className="h-4 w-px bg-gray-600 mx-2"></div>
              <Link 
                to="/login" 
                className="flex items-center gap-1 text-gray-400 hover:text-white transition"
                title="Admin Login"
              >
                <span>🔒</span> Login
              </Link>
            </>
          )}
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN (Visible only when isMenuOpen is true) */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 px-4 pt-2 pb-4 space-y-2 border-t border-gray-700 shadow-lg">
          <Link 
            to="/stats" 
            className="block py-2 hover:text-blue-300 transition border-b border-gray-700"
            onClick={closeMenu}
          >
            Stats
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link 
                to="/create" 
                className="block py-2 hover:text-green-400 transition border-b border-gray-700"
                onClick={closeMenu}
              >
                Create Entry
              </Link>
              <Link 
                to="/admin" 
                className="block py-2 hover:text-purple-400 transition border-b border-gray-700"
                onClick={closeMenu}
              >
                Admin Dashboard
              </Link>
              <button 
                onClick={handleLogout} 
                className="w-full text-left py-2 flex items-center gap-2 text-red-400 hover:text-red-300 transition"
              >
                <span>🔓</span> Logout
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className="block py-2 flex items-center gap-2 text-gray-400 hover:text-white transition"
              onClick={closeMenu}
            >
              <span>🔒</span> Admin Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;