import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function ConcertCard({ concert, onConcertDeleted }) {
  const { isAuthenticated } = useAuth();
  
  const dateObj = new Date(concert.date);
  const formattedDate = !isNaN(dateObj) 
    ? dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) 
    : 'Invalid Date';

  const handleDelete = async () => {
    if (window.confirm(`Delete show for ${concert.artist}?`)) {
      try {
        await axios.delete(`/api/delete/concert/${concert.id}`);
        onConcertDeleted(concert.id);
      } catch (err) {
        console.error('Failed to delete concert', err);
        alert('Failed to delete concert.');
      }
    }
  };

  return (
    <div className="border rounded-lg shadow-md p-4 bg-white flex flex-col justify-between h-full">
      <div>
        {/* ARTIST LINK: Uses artistSlug */}
        <Link 
          to={`/artists/${concert.artistSlug}`}
          className="text-2xl font-bold text-blue-700 hover:underline block"
        >
          {concert.artist}
        </Link>

        {concert.eventName && <p className="text-lg font-semibold">{concert.eventName}</p>}
        <p className="text-gray-700">{formattedDate}</p>
        
        {/* VENUE LINK: Uses venue.slug */}
        {concert.venue && (
          <Link 
            to={`/venues/${concert.venue.slug}`} 
            className="text-gray-600 hover:text-blue-500 underline block mt-1"
          >
            {concert.venue.name} - {concert.venue.city}
          </Link>
        )}
        
        {concert.notes && <p className="text-sm mt-3 italic text-gray-500">"{concert.notes}"</p>}
      </div>

      <div className="mt-4 flex justify-between items-center pt-4 border-t">
        {concert.setlist ? (
          <a href={concert.setlist} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
            View Setlist
          </a>
        ) : (
          <span className="text-sm text-gray-400">No Setlist</span>
        )}
        
        {isAuthenticated && (
          <div className="space-x-2">
            <Link to={`/edit/concert/${concert.id}`} className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">Edit</Link>
            <button onClick={handleDelete} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ConcertGrid({ concerts }) {
  const [concertList, setConcertList] = React.useState([]);

  React.useEffect(() => {
    setConcertList(concerts);
  }, [concerts]);

  const handleConcertDeleted = (deletedId) => {
    setConcertList(currentList => currentList.filter(c => c.id !== deletedId));
  };

  if (!Array.isArray(concertList)) {
    return <div className="text-red-500 text-center p-4">Error: Data is not in the correct format.</div>;
  }

  if (concertList.length === 0) {
    return <p className="text-center text-gray-500 mt-8">No shows found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {concertList.map(concert => (
        <ConcertCard 
          key={concert.id} 
          concert={concert} 
          onConcertDeleted={handleConcertDeleted}
        />
      ))}
    </div>
  );
}

export default ConcertGrid;