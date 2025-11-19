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
    // No need for e.preventDefault() here if the button is not inside a Link
    if (window.confirm(`Delete show for ${concert.artist}?`)) {
      try {
        await axios.delete(`/api/delete/concert/${concert.id}`);
        onConcertDeleted(concert.id);
      } catch (err) {
        console.log(err);
        alert('Failed to delete concert.');
      }
    }
  };

  return (
    <div className="border rounded-lg shadow-md bg-white flex flex-col justify-between h-full overflow-hidden hover:shadow-xl transition duration-300 group">
      
      {/* IMAGE HERO - Make this clickable */}
      <Link to={`/concerts/${concert.id}`} className="block h-48 bg-gray-200 relative overflow-hidden">
        {concert.imageUrl ? (
          <img 
            src={concert.imageUrl} 
            alt={concert.artist} 
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No Image
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
           {formattedDate}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <div>
          {/* TITLE - Make this clickable */}
          <h3 className="text-xl font-bold text-gray-900 truncate">
            <Link to={`/concerts/${concert.id}`} className="group-hover:text-blue-600">
              {concert.artist}
            </Link>
          </h3>
          {concert.eventName && <p className="text-sm font-semibold text-blue-500">{concert.eventName}</p>}
          
          <p className="text-gray-600 text-sm mt-1">
            {concert.venue.name}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
           <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
             {concert.venue.city}
           </span>
           
           {/* Admin Actions - Now safe because they are not inside the main Link */}
           {isAuthenticated && (
             <div className="flex space-x-2">
                <Link to={`/edit/concert/${concert.id}`} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200">Edit</Link>
                <button onClick={handleDelete} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">Delete</button>
             </div>
           )}
        </div>
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

  if (!Array.isArray(concertList)) return null;
  if (concertList.length === 0) return <p className="text-center text-gray-500 mt-8">No shows found.</p>;

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