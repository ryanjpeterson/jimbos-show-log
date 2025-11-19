import { useState, useRef } from 'react';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  
  // Use a ref to store the timeout ID so it persists across renders
  const searchTimeout = useRef(null);
  
  const handleChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Clear the existing timeout using the ref's current value
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    // Set a new timeout and store the ID in the ref
    searchTimeout.current = setTimeout(() => {
      onSearch(newQuery);
    }, 300);
  };

  return (
    <div className="w-full">
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