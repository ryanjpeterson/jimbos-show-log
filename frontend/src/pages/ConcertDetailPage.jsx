import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUtils';

function ConcertDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    axios.get(`/api/concerts/${id}`).then(res => { setConcert(res.data); setLoading(false); }).catch(err => { console.log(err); setLoading(false)});
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Delete show for ${concert.artist}?`)) {
      try { await axios.delete(`/api/delete/concert/${concert.id}`); navigate('/'); } catch { alert('Failed to delete concert.'); }
    }
  };

  if (loading) return <div className="p-8 text-center">Loading concert details...</div>;
  if (!concert) return <div className="p-8 text-center text-red-500">Concert not found.</div>;

  const formattedDate = new Date(concert.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="relative h-96 rounded-xl overflow-hidden shadow-xl bg-gray-100">
          {concert.imageUrl ? <img src={getImageUrl(concert.imageUrl)} alt={concert.artist} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No Main Image</div>}
        </div>
        <div className="flex flex-col justify-center space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md uppercase font-semibold">{concert.type}</span>
            {isAuthenticated && (
                <div className="flex space-x-3">
                    <Link to={`/edit/concert/${concert.id}`} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md uppercase font-semibold hover:bg-gray-200 transition">Edit</Link>
                    <button onClick={handleDelete} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md uppercase font-semibold hover:bg-red-50 hover:text-red-600 transition">Delete</button>
                </div>
            )}
          </div>
          <h1 className="text-5xl font-black text-gray-900 leading-tight"><Link to={`/artists/${concert.artistSlug}`} className="hover:text-blue-600">{concert.artist}</Link></h1>
          <div className="text-xl text-gray-600">{concert.eventName && <span className="font-semibold">{concert.eventName} • </span>}<span>{formattedDate}</span></div>
          <div className="text-lg text-gray-500"><Link to={`/venues/${concert.venue.slug}`} className="hover:underline hover:text-blue-500">{concert.venue.name}</Link><span className="block text-sm text-gray-400">{concert.venue.city}</span></div>
          {concert.setlist && <a href={concert.setlist} target="_blank" rel="noreferrer" className="inline-block bg-gray-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700 transition w-fit mt-4 shadow-md">View Setlist on Setlist.fm</a>}
        </div>
      </div>
      {concert.notes && <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-12"><h3 className="text-xl font-bold mb-4 text-gray-800">My Notes</h3><p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{concert.notes}</p></div>}
      {concert.gallery && concert.gallery.length > 0 && (
        <div className="mb-12"><h3 className="text-2xl font-bold mb-6 text-gray-800">Gallery</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{concert.gallery.map((img, idx) => <div key={idx} className="h-48 rounded-lg overflow-hidden cursor-pointer shadow hover:opacity-90 transition" onClick={() => setSelectedImage(img)}><img src={getImageUrl(img)} alt={`Gallery ${idx}`} className="w-full h-full object-cover" /></div>)}</div></div>
      )}
      {concert.relatedConcerts?.length > 0 && (
        <div className="mt-16 pt-8 border-t border-gray-200"><h3 className="text-2xl font-bold mb-6 text-gray-800">Also played at {concert.venue.name} on this day</h3><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">{concert.relatedConcerts.map(related => <Link key={related.id} to={`/concerts/${related.id}`} className="block p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition"><div className="flex items-center justify-between"><span className="font-bold text-lg text-gray-900 truncate">{related.artist}</span><span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md uppercase font-semibold">{related.type}</span></div><div className="text-sm text-blue-500 mt-2 font-medium">View Details &rarr;</div></Link>)}</div></div>
      )}
      {selectedImage && <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}><img src={getImageUrl(selectedImage)} alt="Full size" className="max-h-full max-w-full rounded shadow-2xl" /><button className="absolute top-4 right-4 text-white text-4xl">&times;</button></div>}
    </div>
  );
}
export default ConcertDetailPage;