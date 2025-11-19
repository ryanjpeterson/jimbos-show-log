import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ConcertGrid from '../components/ConcertGrid';
import { useAuth } from '../context/AuthContext';   // Add useAuth

function VenueDetailPage() {
  // Matches the :slug parameter in App.jsx
  const { slug } = useParams();
  const { isAuthenticated } = useAuth()
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch by slug
    axios.get(`/api/venues/${slug}`)
      .then(res => {
        setVenue(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="p-8 text-center">Loading venue history...</div>;
  if (!venue) return <div className="p-8 text-center text-red-500">Venue not found.</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="bg-gray-100 p-6 rounded-lg shadow-sm mb-8">
        <h1 className="text-4xl font-bold text-gray-800">{venue.name}</h1>
        <h2 className="text-xl text-gray-600 mt-2">{venue.city}</h2>
        
        {/* Display Address if available */}
        {venue.address && (
          <p className="text-gray-600 mt-1">{venue.address}</p>
        )}

        {isAuthenticated && (
          <Link 
            to={`/edit/venue/${venue.id}`}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded shadow-sm text-sm font-bold mt-4 inline-block"
          >
            Edit Venue
          </Link>
        )}

        <div className="text-sm text-gray-500 mt-4">
          Lat: {venue.latitude} / Long: {venue.longitude}
        </div>
        
        <div className="mt-4">
            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold mr-2 px-2.5 py-0.5 rounded">
                Total Shows: {venue.concerts ? venue.concerts.length : 0}
            </span>
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-4 border-b pb-2">Concert History</h3>
      
      {/* Pass the venue's concerts to the grid */}
      {venue.concerts && venue.concerts.length > 0 ? (
        // We map over concerts to ensure they have the parent venue object attached
        // This ensures the "Venue" link in the grid card works correctly
        <ConcertGrid 
          concerts={venue.concerts.map(c => ({ ...c, venue: venue }))} 
        />
      ) : (
         <p className="text-gray-500">No shows recorded at this venue yet.</p>
      )}
    </div>
  );
}

export default VenueDetailPage;