import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Jimbo's Show Log
        </Link>
        
        <div className="space-x-4">
          <Link to="/" className="hover:text-gray-300">Home</Link>
          <Link to="/stats" className="hover:text-gray-300">Stats</Link>
          
          {/* Conditional links based on auth state */}
          {isAuthenticated ? (
            <>
              <Link to="/create" className="hover:text-gray-300">Create New</Link>
              <button onClick={handleLogout} className="hover:text-gray-300">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="hover:text-gray-300">Admin Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;