import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreatePage() {
  const [type, setType] = useState('concert');
  const [venues, setVenues] = useState([]);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

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
      const payload = { ...formData };

      // 1. CONCERT CLEANUP
      if (type === 'concert') {
        payload.type = payload.type || 'concert';
        if (payload.venueId) payload.venueId = parseInt(payload.venueId);
        // No gallery/image fields sent on create
      }

      // 2. VENUE CLEANUP
      if (type === 'venue') {
        payload.latitude = payload.latitude ? parseFloat(payload.latitude) : 0.0;
        payload.longitude = payload.longitude ? parseFloat(payload.longitude) : 0.0;

        if (!payload.name) {
          alert("Venue name is required");
          return;
        }
        // Remove unnecessary fields
        delete payload.artist;
        delete payload.date;
        delete payload.venueId;
        delete payload.type;
        delete payload.eventName;
        delete payload.setlist;
        delete payload.notes;
      }

      // 3. Send Request
      const res = await axios.post(`/api/create/${type}`, payload);
      
      // 4. Smart Redirect
      if (type === 'concert') {
          // Redirect to Edit Page to allow image uploads immediately
          navigate(`/edit/concert/${res.data.id}`);
      } else {
          navigate('/');
      }

    } catch (err) {
      console.error('Failed to create entry', err);
      const message = err.response?.data?.message || err.message;
      alert(`Error: ${message}`);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">Log New Entry</h2>
        
        <div className="flex space-x-6 border-b pb-4">
          <label className="flex items-center cursor-pointer">
            <input type="radio" name="type" value="concert" checked={type === 'concert'} onChange={() => setType('concert')} className="mr-2 h-5 w-5 text-blue-600" /> 
            <span className="text-lg font-medium">Concert</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input type="radio" name="type" value="venue" checked={type === 'venue'} onChange={() => setType('venue')} className="mr-2 h-5 w-5 text-blue-600" /> 
            <span className="text-lg font-medium">Venue</span>
          </label>
        </div>

        {type === 'concert' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="artist" onChange={handleChange} placeholder="Artist Name *" className="border border-gray-300 p-3 rounded-lg w-full" required />
              <input name="date" type="date" onChange={handleChange} className="border border-gray-300 p-3 rounded-lg w-full" required />
            </div>
            
            <select name="venueId" onChange={handleChange} className="border border-gray-300 p-3 rounded-lg w-full" required>
              <option value="">Select Venue *</option>
              {venues.map(v => <option key={v.id} value={v.id}>{v.name} ({v.city})</option>)}
            </select>
            
            <input name="eventName" onChange={handleChange} placeholder="Tour / Event Name (Optional)" className="border border-gray-300 p-3 rounded-lg w-full" />
            
            {/* MEDIA PLACEHOLDER - Explains the workflow */}
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 border-dashed text-center">
              <div className="text-3xl mb-2">📸</div>
              <h3 className="font-bold text-gray-700 mb-1">Media Uploads</h3>
              <p className="text-sm text-gray-500 mb-4">
                To ensure correct file naming and folder structure, please save the concert details first.
              </p>
              <div className="text-xs font-semibold text-blue-600 bg-blue-50 inline-block px-3 py-1 rounded-full">
                Uploads unlock after saving
              </div>
            </div>

            <input name="setlist" onChange={handleChange} placeholder="Setlist.fm Link" className="border border-gray-300 p-3 rounded-lg w-full" />
            <textarea name="notes" onChange={handleChange} placeholder="Notes / Memories..." className="border border-gray-300 p-3 rounded-lg w-full h-32" />
          </div>
        )}

        {type === 'venue' && (
          <div className="space-y-4">
              <input name="name" onChange={handleChange} placeholder="Venue Name *" className="border border-gray-300 p-3 rounded-lg w-full" required />
              <input name="city" onChange={handleChange} placeholder="City *" className="border border-gray-300 p-3 rounded-lg w-full" required />
              <input name="address" onChange={handleChange} placeholder="Address (Optional)" className="border border-gray-300 p-3 rounded-lg w-full" />
              
              <div className="grid grid-cols-2 gap-4">
                  <input name="latitude" type="number" step="any" onChange={handleChange} placeholder="Lat *" className="border border-gray-300 p-3 rounded-lg w-full" required />
                  <input name="longitude" type="number" step="any" onChange={handleChange} placeholder="Long *" className="border border-gray-300 p-3 rounded-lg w-full" required />
              </div>
          </div>
        )}

        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-blue-700 transition flex justify-center items-center gap-2">
          {type === 'concert' ? 'Save & Add Images' : 'Save Venue'}
          {type === 'concert' && <span>→</span>}
        </button>
      </form>
    </div>
  );
}

export default CreatePage;