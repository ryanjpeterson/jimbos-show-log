import { Link } from 'react-router-dom';

function ConcertList({ concerts }) {
  if (!concerts || concerts.length === 0) {
    return <p className="text-center text-gray-500 mt-8">No shows found.</p>;
  }

  return (
    <div className="space-y-2">
      {concerts.map(concert => {
        const dateObj = new Date(concert.date);
        const formattedDate = !isNaN(dateObj) 
          ? dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) 
          : 'Invalid Date';

        return (
          <Link 
            key={concert.id} 
            to={`/concerts/${concert.id}`}
            className="block bg-white border border-gray-200 rounded p-3 hover:bg-gray-50 hover:border-blue-300 transition"
          >
            <div className="flex justify-between items-center">
              <div className="truncate mr-4">
                <span className="font-bold text-gray-900">{concert.artist}</span>
                {/* On mobile, maybe just show artist. On desktop, could show venue too if you wanted */}
                <span className="hidden sm:inline text-gray-500 text-sm ml-2">- {concert.venue.name}</span>
              </div>
              <div className="text-sm text-gray-600 whitespace-nowrap font-mono">
                {formattedDate}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default ConcertList;