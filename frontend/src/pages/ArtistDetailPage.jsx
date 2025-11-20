import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ConcertGrid from '../components/ConcertGrid';

function ArtistDetailPage() {
  const { slug } = useParams();
  const [concerts, setConcerts] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/artists/${slug}`)
      .then(res => {
        setConcerts(res.data);
        if (res.data.length > 0) setDisplayName(res.data[0].artist);
        else setDisplayName(slug.replace(/-/g, ' '));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="p-8 text-center">Loading artist history...</div>;

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
        <h1 className="text-4xl font-bold text-gray-800">{displayName}</h1>
        <div className="mt-4">
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md uppercase font-semibold">
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