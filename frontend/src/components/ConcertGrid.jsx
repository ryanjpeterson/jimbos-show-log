import { Link } from 'react-router-dom';
// Removed useAuth and axios as they are no longer needed here for actions

function ConcertCard({ concert }) { // Removed onConcertDeleted prop
  
  const dateObj = new Date(concert.date);
  const formattedDate = !isNaN(dateObj) 
    ? dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) 
    : 'Invalid Date';

  return (
    <div className="border rounded-lg shadow-md bg-white flex flex-col justify-between h-full overflow-hidden hover:shadow-xl transition duration-300 group relative">
        
        {/* MAIN LINK: Wraps image and content */}
        <Link to={`/concerts/${concert.id}`} className="block flex-grow">
            {/* IMAGE HERO */}
            <div className="h-48 bg-gray-200 relative overflow-hidden">
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
            </div>

            <div className="p-4 pb-0">
            <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 truncate">
                {concert.artist}
                </h3>
                {/* Use a div/p with consistent height or class to prevent layout shift if needed */}
                {concert.eventName ? (
                    <p className="text-sm font-semibold text-blue-500 truncate">{concert.eventName}</p>
                ) : (
                    <p className="text-sm font-semibold text-transparent select-none">&nbsp;</p>
                )}
                
                <p className="text-gray-600 text-sm mt-1 truncate">
                {concert.venue.name}
                </p>
            </div>
            </div>
        </Link>

        {/* FOOTER - Just City Info now */}
        <div className="p-4 mt-auto border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold truncate max-w-full">
                {concert.venue.city}
            </span>
            {/* Buttons removed from here */}
        </div>
    </div>
  );
}

function ConcertGrid({ concerts }) {
  if (!Array.isArray(concerts)) return null;
  if (concerts.length === 0) return <p className="text-center text-gray-500 mt-8">No shows found.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {concerts.map(concert => (
        <ConcertCard 
          key={concert.id} 
          concert={concert} 
          // No longer passing onConcertDeleted
        />
      ))}
    </div>
  );
}

export default ConcertGrid;