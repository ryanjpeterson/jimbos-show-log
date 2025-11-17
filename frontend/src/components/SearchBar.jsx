import React, { useState } from 'react';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  // Use a timeout to "debounce" the input
  // This avoids re-filtering on every single keystroke
  let searchTimeout;
  
  const handleChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Clear the existing timeout
    clearTimeout(searchTimeout);
    
    // Set a new timeout to call onSearch after 300ms
    searchTimeout = setTimeout(() => {
      onSearch(newQuery);
    }, 300);
  };

  return (
    <div className="mb-6">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search by artist, venue, city, event, or notes..."
        className="w-full p-3 text-lg border rounded-md shadow-sm"
      />
    </div>
  );
}

export default SearchBar;