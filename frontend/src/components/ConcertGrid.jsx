import React from 'react';
import { Link } from 'react-router-dom';

function ConcertCard({ concert }) {  
  const dateObj = new Date(concert.date);
  const formattedDate = !isNaN(dateObj) 
    ? dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) 
    : 'Invalid Date';

  return (
    // Changed border class to shadow-sm and removed border-gray-X to make it softer
    // Added 'hover:shadow-md' for a nice interaction effect
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-full overflow-hidden hover:shadow-md transition-shadow duration-300 group relative">
        
        {/* MAIN LINK */}
        <Link to={`/concerts/${concert.id}`} className="block flex-grow">
            {/* IMAGE HERO */}
            <div className="h-48 bg-gray-50 relative overflow-hidden">
            {concert.imageUrl ? (
                <img 
                src={concert.imageUrl} 
                alt={concert.artist} 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm font-medium">
                No Image
                </div>
            )}
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-2 py-1 rounded shadow-sm">
                {formattedDate}
            </div>
            </div>

            <div className="p-5 pb-0">
            <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 truncate transition-colors">
                {concert.artist}
                </h3>
                
                {/* Event Name */}
                {concert.eventName ? (
                    <p className="text-sm font-semibold text-blue-500 truncate mt-1">{concert.eventName}</p>
                ) : (
                    <p className="text-sm font-semibold text-transparent select-none mt-1">&nbsp;</p>
                )}
                
                <p className="text-gray-500 text-sm mt-2 truncate font-medium">
                {concert.venue.name}
                </p>
            </div>
            </div>
        </Link>

        {/* FOOTER */}
        <div className="p-5 mt-auto flex justify-between items-center">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold truncate max-w-[60%]">
                {concert.venue.city}
            </span>
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
  if (concertList.length === 0) return <p className="text-center text-gray-500 mt-12">No shows found.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
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