import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CreatePage from './pages/CreatePage';
import EditPage from './pages/EditPage';
import VenueDetailPage from './pages/VenueDetailPage';
import ArtistDetailPage from './pages/ArtistDetailPage';
import StatsPage from './pages/StatsPage';
import AdminDashboard from './pages/AdminDashboard';
import ConcertDetailPage from './pages/ConcertDetailPage'; // Import New Page

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/venues/:slug" element={<VenueDetailPage />} />
          <Route path="/artists/:slug" element={<ArtistDetailPage />} />
          
          {/* NEW: Concert Detail Page */}
          <Route path="/concerts/:id" element={<ConcertDetailPage />} />

          {/* --- Protected Routes --- */}
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><CreatePage /></ProtectedRoute>} />
          <Route path="/edit/:type/:id" element={<ProtectedRoute><EditPage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;