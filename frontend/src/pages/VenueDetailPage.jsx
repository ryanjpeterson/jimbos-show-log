import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ConcertGrid from '../components/ConcertGrid';
import { useAuth } from '../context/AuthContext';

function VenueDetailPage() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/venues/${slug}`).then(res => { setVenue(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="p-8 text-center">Loading venue...</div>;
  if (!venue) return <div className="p-8 text-center text-red-500">Venue not found.</div>;

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
        <h1 className="text-4xl font-bold text-gray-800">{venue.name}</h1>
        <h2 className="text-xl text-gray-600 mt-2">{venue.city}</h2>
        {venue.address && <p className="text-gray-600 mt-1">{venue.address}</p>}
        
        <div className="flex items-center space-x-4 mt-4">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md uppercase font-semibold">
                Total Shows: {venue.concerts ? venue.concerts.length : 0}
            </span>
            {isAuthenticated && <Link to={`/edit/venue/${venue.id}`} className="text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-md uppercase font-semibold hover:bg-gray-200 transition">Edit Venue</Link>}
        </div>
        
        <div className="text-sm text-gray-500 mt-4">Lat: {venue.latitude} / Long: {venue.longitude}</div>
      </div>
      
      <h3 className="text-2xl font-bold mb-4 border-b pb-2">Concert History</h3>
      {venue.concerts?.length > 0 ? <ConcertGrid concerts={venue.concerts.map(c => ({ ...c, venue: venue }))} /> : <p className="text-gray-500">No shows recorded.</p>}
    </div>
  );
}
export default VenueDetailPage;