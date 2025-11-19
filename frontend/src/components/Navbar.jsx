import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-black tracking-tight flex items-center gap-2 hover:text-gray-200 transition">
          <span>🎸</span> Jimbo's Show Log
        </Link>
        
        <div className="flex items-center space-x-6 text-sm font-medium">
          <Link to="/" className="hover:text-blue-300 transition">Home</Link>
          <Link to="/stats" className="hover:text-blue-300 transition">Stats</Link>
          
          {/* Auth Indicator & Links */}
          {isAuthenticated ? (
            <>
              <div className="h-4 w-px bg-gray-600 mx-2"></div> {/* Divider */}
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
              <div className="h-4 w-px bg-gray-600 mx-2"></div> {/* Divider */}
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
    </nav>
  );
}

export default Navbar;