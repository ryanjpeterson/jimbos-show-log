import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function ConcertDetailPage() {
  const { id } = useParams();
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    axios.get(`/api/concerts/${id}`)
      .then(res => {
        setConcert(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading concert details...</div>;
  if (!concert) return <div className="p-8 text-center text-red-500">Concert not found.</div>;

  const dateObj = new Date(concert.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      {/* Header Section with Main Image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="relative h-96 rounded-xl overflow-hidden shadow-xl bg-gray-100">
          {concert.imageUrl ? (
            <img 
              src={concert.imageUrl} 
              alt={concert.artist} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Main Image
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center space-y-4">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full w-fit uppercase tracking-wide">
            {concert.type}
          </span>
          <h1 className="text-5xl font-black text-gray-900 leading-tight">
            <Link to={`/artists/${concert.artistSlug}`} className="hover:text-blue-600">
              {concert.artist}
            </Link>
          </h1>
          <div className="text-xl text-gray-600">
             {concert.eventName && <span className="font-semibold">{concert.eventName}</span>}
             {concert.eventName && <span className="mx-2">•</span>}
             <span>{formattedDate}</span>
          </div>
          <div className="text-lg text-gray-500">
            <Link to={`/venues/${concert.venue.slug}`} className="hover:underline hover:text-blue-500">
              {concert.venue.name}
            </Link>
            <span className="block text-sm text-gray-400">{concert.venue.city}</span>
          </div>

          {concert.setlist && (
            <a 
              href={concert.setlist} 
              target="_blank" 
              rel="noreferrer"
              className="inline-block bg-gray-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700 transition w-fit mt-4"
            >
              View Setlist on Setlist.fm
            </a>
          )}
        </div>
      </div>

      {/* Notes Section */}
      {concert.notes && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-12">
          <h3 className="text-xl font-bold mb-4 text-gray-800">My Notes</h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{concert.notes}</p>
        </div>
      )}

      {/* Gallery Section */}
      {concert.gallery && concert.gallery.length > 0 && (
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">Gallery</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {concert.gallery.map((img, idx) => (
              <div 
                key={idx} 
                className="h-48 rounded-lg overflow-hidden cursor-pointer shadow hover:opacity-90 transition"
                onClick={() => setSelectedImage(img)}
              >
                <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img src={selectedImage} alt="Full size" className="max-h-full max-w-full rounded shadow-2xl" />
          <button className="absolute top-4 right-4 text-white text-4xl">&times;</button>
        </div>
      )}
    </div>
  );
}

export default ConcertDetailPage;