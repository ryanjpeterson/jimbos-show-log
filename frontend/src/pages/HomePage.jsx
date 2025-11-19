import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import ConcertGrid from '../components/ConcertGrid';
import ConcertList from '../components/ConcertList';
import SearchBar from '../components/SearchBar';

function HomePage() {
  const [allConcerts, setAllConcerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // View State
  const [viewMode, setViewMode] = useState('grid');
  
  // Mobile Filter Toggle State
  const [showFilters, setShowFilters] = useState(false);

  // Filter States
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');

  useEffect(() => {
    axios.get('/api/')
      .then(res => {
        setAllConcerts(res.data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  // Extract Options
  const filterOptions = useMemo(() => {
    const years = new Set();
    const cities = new Set();

    allConcerts.forEach(concert => {
      const date = new Date(concert.date);
      if (!isNaN(date)) years.add(date.getFullYear());
      if (concert.venue?.city) cities.add(concert.venue.city);
    });

    return {
      years: Array.from(years).sort((a, b) => b - a),
      cities: Array.from(cities).sort()
    };
  }, [allConcerts]);

  // Filtering Logic
  const filteredConcerts = useMemo(() => {
    return allConcerts.filter(concert => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term || (
        concert.artist.toLowerCase().includes(term) ||
        concert.venue.name.toLowerCase().includes(term) ||
        concert.venue.city.toLowerCase().includes(term) ||
        concert.eventName?.toLowerCase().includes(term) ||
        concert.notes?.toLowerCase().includes(term)
      );

      const concertYear = new Date(concert.date).getFullYear();
      const matchesYear = selectedYear === 'All' || concertYear === parseInt(selectedYear);
      const matchesCity = selectedCity === 'All' || concert.venue.city === selectedCity;

      return matchesSearch && matchesYear && matchesCity;
    });
  }, [searchTerm, selectedYear, selectedCity, allConcerts]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading log...</div>;

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      
      {/* MAIN LAYOUT CONTAINER */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* --- LEFT SIDEBAR: FILTERS --- */}
        {/* Mobile Toggle Button */}
        <div className="lg:hidden mb-4">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded border border-gray-200 flex justify-between items-center hover:bg-gray-200 transition"
          >
            <span>⚡ Filters {(selectedYear !== 'All' || selectedCity !== 'All') ? '(Active)' : ''}</span>
            <span>{showFilters ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* Sidebar Content (Hidden on mobile unless toggled, always visible on LG) */}
        <aside className={`w-full lg:w-64 flex-shrink-0 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 sticky top-24">
            <h2 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2 hidden lg:flex">
              <span>⚡</span> Filters
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Year</label>
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full p-2 border rounded bg-gray-50 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="All">All Years</option>
                  {filterOptions.years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">City</label>
                <select 
                  value={selectedCity} 
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full p-2 border rounded bg-gray-50 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="All">All Cities</option>
                  {filterOptions.cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {(selectedYear !== 'All' || selectedCity !== 'All') && (
                <button 
                  onClick={() => { setSelectedYear('All'); setSelectedCity('All'); }}
                  className="w-full text-center text-red-500 hover:text-red-700 text-sm font-semibold py-2 border border-red-100 rounded hover:bg-red-50 transition"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* --- RIGHT CONTENT: SEARCH & RESULTS --- */}
        <main className="flex-1 min-w-0"> 
          {/* min-w-0 prevents flex item from overflowing */}
          
          {/* Header Row: Search + View Toggles */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center">
            {/* Search Bar: Grows to fill space */}
            <div className="flex-grow w-full">
              <SearchBar onSearch={setSearchTerm} />
            </div>

            {/* View Toggles: Fixed width, no shrink */}
            <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg self-end sm:self-auto flex-shrink-0">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Grid View"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="List View"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
          </div>

          {/* Results Area */}
          <div className="mb-4 text-gray-400 text-xs font-medium uppercase tracking-wide">
            Showing {filteredConcerts.length} concerts
          </div>

          {viewMode === 'grid' ? (
            <ConcertGrid concerts={filteredConcerts} />
          ) : (
            <ConcertList concerts={filteredConcerts} />
          )}

        </main>
      </div>
    </div>
  );
}

export default HomePage;