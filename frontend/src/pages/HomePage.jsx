import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import ConcertGrid from '../components/ConcertGrid';
import SearchBar from '../components/SearchBar';

function HomePage() {
  const [allConcerts, setAllConcerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all concerts from the / route
    axios.get('/api/')
      .then(res => {
        setAllConcerts(res.data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  // Filtered results based on search term
  const filteredConcerts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return allConcerts;

    return allConcerts.filter(concert => {
      // Check against all fields as requested
      return (
        concert.artist.toLowerCase().includes(term) ||
        concert.venue.name.toLowerCase().includes(term) ||
        concert.venue.city.toLowerCase().includes(term) ||
        concert.eventName?.toLowerCase().includes(term) ||
        concert.notes?.toLowerCase().includes(term)
      );
    });
  }, [searchTerm, allConcerts]);

  if (loading) return <div>Loading shows...</div>;

  return (
    <div className="container mx-auto p-4">
      <SearchBar onSearch={setSearchTerm} />
      <ConcertGrid concerts={filteredConcerts} />
    </div>
  );
}

export default HomePage;