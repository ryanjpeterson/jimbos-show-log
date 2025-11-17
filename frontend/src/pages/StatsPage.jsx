import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Helper for the "First/Latest" show cards
function ShowCard({ title, concert }) {
  if (!concert) return null;
  const formattedDate = new Date(concert.date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="bg-white p-4 rounded-lg shadow h-full flex flex-col justify-center">
      <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">{title}</h3>
      <Link to={`/artists/${concert.artistSlug}`} className="text-xl font-bold text-blue-600 hover:underline">
        {concert.artist}
      </Link>
      <p className="text-gray-800 font-medium">{formattedDate}</p>
      <Link to={`/venues/${concert.venue.slug}`} className="text-sm text-gray-500 hover:underline mt-1">
        {concert.venue.name} ({concert.venue.city})
      </Link>
    </div>
  );
}

// New Helper: A visual bar chart row
function StatsBar({ label, count, max, href }) {
  // Calculate width percentage for the colored bar
  const percentage = Math.max((count / max) * 100, 5); // Min 5% width so it shows up

  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        {href ? (
          <Link to={href} className="font-bold text-gray-700 hover:text-blue-600">{label}</Link>
        ) : (
          <span className="font-bold text-gray-700">{label}</span>
        )}
        <span className="font-mono text-gray-500">{count}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-500 h-2.5 rounded-full" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

function StatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/stats')
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load stats", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Calculations in progress...</div>;
  if (!stats) return <div className="p-8 text-center text-red-500">Could not load stats.</div>;

  // Find the highest counts to calculate bar widths
  const maxYearCount = Math.max(...stats.showsByYear.map(y => y.count), 0);
  const maxCityCount = Math.max(...stats.showsByCity.map(c => c.count), 0);

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-3xl font-black text-center text-gray-800 mb-8">LOG STATISTICS</h1>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg text-center flex flex-col justify-center">
          <h2 className="text-sm font-bold uppercase opacity-80">Total Shows</h2>
          <p className="text-6xl font-black mt-2">{stats.totalConcerts}</p>
        </div>
        <ShowCard title="First Show" concert={stats.firstShow} />
        <ShowCard title="Latest Show" concert={stats.latestShow} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column */}
        <div className="space-y-8">
          {/* Top Artists */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <h2 className="text-xl font-bold mb-6 pb-2 border-b">Top Artists</h2>
            {stats.topArtists.map(artist => (
               <div key={artist.slug} className="flex justify-between items-center py-2 border-b last:border-0">
                 <Link to={`/artists/${artist.slug}`} className="font-medium text-gray-800 hover:text-blue-600">
                   {artist.name}
                 </Link>
                 <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                   {artist.count} shows
                 </span>
               </div>
            ))}
          </div>

          {/* Shows by City */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <h2 className="text-xl font-bold mb-6 pb-2 border-b">Top Cities</h2>
            {stats.showsByCity.map(city => (
              <StatsBar 
                key={city.city} 
                label={city.city} 
                count={city.count} 
                max={maxCityCount}
              />
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Shows by Year */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <h2 className="text-xl font-bold mb-6 pb-2 border-b">Shows per Year</h2>
            {stats.showsByYear.map(yearData => (
              <StatsBar 
                key={yearData.year} 
                label={yearData.year} 
                count={yearData.count} 
                max={maxYearCount}
              />
            ))}
          </div>

           {/* Top Venues */}
           <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <h2 className="text-xl font-bold mb-6 pb-2 border-b">Top Venues</h2>
            {stats.topVenues.map(venue => (
               <div key={venue.slug} className="flex justify-between items-center py-2 border-b last:border-0">
                 <div>
                   <Link to={`/venues/${venue.slug}`} className="font-medium text-gray-800 hover:text-blue-600 block">
                     {venue.name}
                   </Link>
                   <span className="text-xs text-gray-400">{venue.city}</span>
                 </div>
                 <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                   {venue.count} shows
                 </span>
               </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default StatsPage;