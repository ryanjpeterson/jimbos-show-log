import React from 'react';
import { Link } from 'react-router-dom';

function ConcertList({ concerts }) {
  if (!concerts || concerts.length === 0) {
    return <p className="text-center text-gray-500 mt-8">No shows found.</p>;
  }

  return (
    <div className="space-y-3 pb-12">
      {concerts.map(concert => {
        const dateObj = new Date(concert.date);
        const formattedDate = !isNaN(dateObj) 
          ? dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) 
          : 'Invalid Date';

        return (
          <Link 
            key={concert.id} 
            to={`/concerts/${concert.id}`}
            className="block bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              <div className="truncate mr-4">
                <span className="font-bold text-gray-900">{concert.artist}</span>
                <span className="hidden sm:inline text-gray-500 text-sm ml-2">- {concert.venue.name} ({concert.venue.city})</span>
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