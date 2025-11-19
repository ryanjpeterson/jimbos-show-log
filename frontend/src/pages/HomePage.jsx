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
    // 1. Outer Container: Fixed height (Viewport - Navbar)
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white">
      
      {/* 2. Fixed Header: Search & Controls */}
      <div className="bg-white p-4 z-20 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 items-center w-full">
          
          {/* Search Bar */}
          <div className="flex-grow w-full">
            <SearchBar onSearch={setSearchTerm} />
          </div>

          {/* Controls Group */}
          <div className="flex items-center space-x-3 flex-shrink-0 h-[46px] w-full sm:w-auto justify-between sm:justify-end">
            
            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`lg:hidden px-4 h-full rounded border font-bold transition flex items-center gap-2 ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-100 border-gray-200 text-gray-600'}`}
            >
              <span>Filter</span>
              <span className="text-xs">{showFilters ? '▲' : '▼'}</span>
            </button>

            {/* View Toggles */}
            <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg h-full">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 h-full rounded transition flex items-center justify-center ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Grid View"
              >
                {/* Grid Icon (4 squares) */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 h-full rounded transition flex items-center justify-center ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="List View"
              >
                {/* List Icon (Lines) */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Main Content Body (Flex Container for Sidebar + Results) */}
      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full relative">
        
        {/* SIDEBAR (Filters) - Removed border-r */}
        <aside className={`
          flex-shrink-0 w-full lg:w-64 bg-white overflow-y-auto z-10
          ${showFilters ? 'block absolute inset-x-0 top-0 bottom-auto max-h-[50vh] shadow-xl lg:static lg:max-h-full lg:shadow-none' : 'hidden lg:block'}
        `}>
          <div className="p-4 space-y-6">
             <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <span>⚡</span> Filters
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Year</label>
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full p-2 border rounded bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
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
                  className="w-full p-2 border rounded bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
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

        {/* MAIN RESULTS (Scrollable) - Removed bg-gray-50 */}
        <main className="flex-1 overflow-y-auto p-4 scroll-smooth bg-white">
          <div className="mb-4 text-gray-400 text-xs font-medium uppercase tracking-wide sticky top-0 bg-white py-2 z-0">
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