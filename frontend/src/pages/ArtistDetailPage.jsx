import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ConcertGrid from '../components/ConcertGrid';

function ArtistDetailPage() {
  // Matches the :slug parameter in App.jsx
  const { slug } = useParams(); 
  const [concerts, setConcerts] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch by artist slug
    axios.get(`/api/artists/${slug}`)
      .then(res => {
        setConcerts(res.data);
        
        // LOGIC: Determine what name to display on the page title.
        // The slug is "nine-inch-nails", but we want "Nine Inch Nails".
        // We grab the 'artist' string from the first concert found.
        if (res.data.length > 0) {
          setDisplayName(res.data[0].artist);
        } else {
          // Fallback: if no concerts found, just remove hyphens from slug
          setDisplayName(slug.replace(/-/g, ' '));
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="p-8 text-center">Loading artist history...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-sm mb-8">
        <h1 className="text-4xl font-bold capitalize">{displayName}</h1>
        <div className="mt-4">
            <span className="inline-block bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
                Total Shows Seen: {concerts.length}
            </span>
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-4 border-b pb-2">Concert History</h3>
      
      {concerts.length > 0 ? (
        <ConcertGrid concerts={concerts} />
      ) : (
        <p className="text-gray-500">No shows found for this artist.</p>
      )}
    </div>
  );
}

export default ArtistDetailPage;