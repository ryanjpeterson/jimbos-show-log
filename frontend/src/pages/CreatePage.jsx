import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreatePage() {
  const [type, setType] = useState('concert');
  const [venues, setVenues] = useState([]);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  // Fetch all venues for the dropdown
  useEffect(() => {
    axios.get('/api/venues')
      .then(res => setVenues(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 1. Clone the form data so we don't mess up the state
      const payload = { ...formData };

      // 2. CONCERT SPECIFIC CLEANUP
      if (type === 'concert') {
        payload.type = payload.type || 'concert'; // Default to concert
        // Ensure we aren't sending a nested venue object if it exists
        if (payload.venue) delete payload.venue;
        // Ensure venueId is a number
        if (payload.venueId) payload.venueId = parseInt(payload.venueId);
      }

      // 3. VENUE SPECIFIC CLEANUP (Fixes your 500 Error)
      if (type === 'venue') {
        // Convert text inputs to actual numbers
        // If the user left them blank, default to 0 to prevent crashes
        payload.latitude = payload.latitude ? parseFloat(payload.latitude) : 0;
        payload.longitude = payload.longitude ? parseFloat(payload.longitude) : 0;

        // Ensure name exists for the slug generator
        if (!payload.name) {
          alert("Venue name is required");
          return;
        }
      }

      // 4. Send the request
      await axios.post(`/api/create/${type}`, payload);
      
      // 5. Redirect on success
      navigate('/');

    } catch (err) {
      console.error('Failed to create entry', err);
      // Display the error message from the backend if available
      const message = err.response?.data?.message || err.message;
      alert(`Error: ${message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-bold">Create New Entry</h2>
      <div>
        <label>
          <input
            type="radio"
            name="type"
            value="concert"
            checked={type === 'concert'}
            onChange={() => setType('concert')}
          /> Concert
        </label>
        <label className="ml-4">
          <input
            type="radio"
            name="type"
            value="venue"
            checked={type === 'venue'}
            onChange={() => setType('venue')}
          /> Venue
        </label>
      </div>

      {/* --- CONCERT FORM --- */}
      {type === 'concert' && (
        <div className="space-y-2 p-4 border rounded">
          <h3 className="text-xl">New Concert</h3>
          <input name="artist" onChange={handleChange} placeholder="Artist (Required)" required />
          <input name="date" type="date" onChange={handleChange} required />
          {/* This is the searchable dropdown for venues */}
          <select name="venueId" onChange={handleChange} required>
            <option value="">Select a venue...</option>
            {venues.map(venue => (
              <option key={venue.id} value={venue.id}>
                {venue.name} ({venue.city})
              </option>
            ))}
          </select>
          <select name="type" onChange={handleChange} defaultValue="concert">
             <option value="concert">Concert</option>
             <option value="festival">Festival</option>
          </select>
          <input name="eventName" onChange={handleChange} placeholder="Event Name (Optional)" />
          <input name="setlist" onChange={handleChange} placeholder="Setlist.fm Link (Optional)" />
          <textarea name="notes" onChange={handleChange} placeholder="Notes (Optional)" />
        </div>
      )}

      {/* --- VENUE FORM --- */}
      {type === 'venue' && (
        <div className="space-y-2 p-4 border rounded">
          <h3 className="text-xl">New Venue</h3>
          <input name="name" onChange={handleChange} placeholder="Venue Name (Required)" required />
          <input name="city" onChange={handleChange} placeholder="City (Required)" required />
          <input name="latitude" type="number" step="0.000001" onChange={handleChange} placeholder="Latitude (Required)" required />
          <input name="longitude" type="number" step="0.000001" onChange={handleChange} placeholder="Longitude (Required)" required />
        </div>
      )}

      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Save Entry
      </button>
    </form>
  );
}

export default CreatePage;