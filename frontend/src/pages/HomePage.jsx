import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import ConcertGrid from '../components/ConcertGrid';
import ConcertList from '../components/ConcertList';
import SearchBar from '../components/SearchBar';

function HomePage() {
  const [allConcerts, setAllConcerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');

  useEffect(() => {
    axios.get('/api/').then(res => { setAllConcerts(res.data); setLoading(false); }).catch(err => console.error(err));
  }, []);

  const filterOptions = useMemo(() => {
    const years = new Set(), cities = new Set();
    allConcerts.forEach(concert => {
      const date = new Date(concert.date);
      if (!isNaN(date)) years.add(date.getFullYear());
      if (concert.venue?.city) cities.add(concert.venue.city);
    });
    return { years: Array.from(years).sort((a, b) => b - a), cities: Array.from(cities).sort() };
  }, [allConcerts]);

  const filteredConcerts = useMemo(() => {
    return allConcerts.filter(concert => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term || (
        concert.artist.toLowerCase().includes(term) || concert.venue.name.toLowerCase().includes(term) ||
        concert.venue.city.toLowerCase().includes(term) || concert.eventName?.toLowerCase().includes(term) ||
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
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white overflow-hidden">
      
      {/* 2. Fixed Header: Search & Controls */}
      <div className="bg-white border-b border-gray-100 p-4 z-20 flex-shrink-0 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 items-center w-full">
          
          <div className="flex-grow w-full"><SearchBar onSearch={setSearchTerm} /></div>
          
          <div className="flex items-center space-x-3 flex-shrink-0 h-[46px] w-full sm:w-auto justify-between sm:justify-end">
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`lg:hidden px-4 h-full rounded border border-gray-200 font-bold transition flex items-center gap-2 ${showFilters ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <span>Filter</span>
              <span className="text-xs">{showFilters ? '▲' : '▼'}</span>
            </button>

            <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg h-full">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 h-full rounded transition flex items-center justify-center ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Grid View"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 h-full rounded transition flex items-center justify-center ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="List View"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Content Body (Flex Container for Sidebar + Results) */}
      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full relative">
        
        {/* SIDEBAR (Filters) */}
        <aside className={`
          flex-shrink-0 w-full lg:w-64 bg-white z-10 transition-all duration-300 ease-in-out
          ${showFilters ? 'absolute inset-0 lg:static' : 'hidden lg:block'}
          lg:border-r lg:border-gray-100 overflow-y-auto
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
                  className="w-full p-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                >
                  <option value="All">All Years</option>{filterOptions.years.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">City</label>
                <select 
                  value={selectedCity} 
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                >
                  <option value="All">All Cities</option>{filterOptions.cities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>

              {(selectedYear !== 'All' || selectedCity !== 'All') && (
                <button 
                  onClick={() => { setSelectedYear('All'); setSelectedCity('All'); }}
                  className="w-full text-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md uppercase font-semibold hover:bg-gray-200 transition"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* MAIN RESULTS (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-4 scroll-smooth bg-white relative">
          {/* Count Badge - Sticky within the scroll area */}
          <div className="mb-4 sticky top-0 bg-white/95 backdrop-blur-sm py-2 z-10 border-b border-gray-100">
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">Showing {filteredConcerts.length} concerts</span>
          </div>

          {viewMode === 'grid' ? <ConcertGrid concerts={filteredConcerts} /> : <ConcertList concerts={filteredConcerts} />}
        </main>

      </div>
    </div>
  );
}

export default HomePage;