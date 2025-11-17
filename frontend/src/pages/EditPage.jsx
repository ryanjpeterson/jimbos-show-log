import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function EditPage() {
  const { type, id } = useParams(); // Grab parameters from URL
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({});
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. If editing a concert, we need the list of venues for the dropdown
        if (type === 'concert') {
          const venueRes = await axios.get('/api/venues');
          setVenues(venueRes.data);
        }

        // 2. Fetch the existing data for the item we are editing
        // If concert, use /api/concerts/:id
        // If venue, use the new /api/venues/id/:id route
        const endpoint = type === 'concert' 
          ? `/api/concerts/${id}` 
          : `/api/venues/id/${id}`;
          
        const res = await axios.get(endpoint);
        
        // 3. Format the data for the form
        let data = res.data;
        
        // Special handling for Dates to make them work with <input type="date">
        if (type === 'concert' && data.date) {
          data.date = new Date(data.date).toISOString().split('T')[0];
        }
        
        setFormData(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load data", err);
        setError("Failed to load data. Item might not exist.");
        setLoading(false);
      }
    };

    fetchData();
  }, [type, id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Create a copy of the form data so we don't mutate state
      const payload = { ...formData };

      // 2. CLEANUP: Remove the nested 'venue' object.
      // The backend only wants 'venueId', not the whole venue object.
      if (payload.venue) {
        delete payload.venue;
      }

      // 3. Ensure venueId is an integer (if it exists)
      if (payload.venueId) {
        payload.venueId = parseInt(payload.venueId);
      }

      // 4. Ensure 'type' is set (default to 'concert' if missing)
      payload.type = payload.type || 'concert';

      // 5. Send the clean payload
      await axios.put(`/api/edit/${type}/${id}`, payload);
      
      // Success!
      navigate('/'); 
    } catch (err) {
      console.error("Update failed", err);
      // Check if the backend sent a specific error message
      const message = err.response?.data?.message || "Failed to update entry.";
      alert(message);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-bold capitalize">Edit {type}</h2>

      {/* --- CONCERT FORM --- */}
      {type === 'concert' && (
        <div className="space-y-2 p-4 border rounded bg-white shadow">
          <div>
            <label className="block text-sm font-bold">Artist</label>
            <input name="artist" value={formData.artist || ''} onChange={handleChange} className="w-full border p-2 rounded" required />
          </div>
          
          <div>
            <label className="block text-sm font-bold">Date</label>
            <input name="date" type="date" value={formData.date || ''} onChange={handleChange} className="w-full border p-2 rounded" required />
          </div>

          <div>
            <label className="block text-sm font-bold">Venue</label>
            <select name="venueId" value={formData.venueId || ''} onChange={handleChange} className="w-full border p-2 rounded" required>
              <option value="">Select a venue...</option>
              {venues.map(venue => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} ({venue.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold">Type</label>
            <select name="type" value={formData.type || 'concert'} onChange={handleChange} className="w-full border p-2 rounded">
               <option value="concert">Concert</option>
               <option value="festival">Festival</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold">Event Name (Optional)</label>
            <input name="eventName" value={formData.eventName || ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-sm font-bold">Setlist Link (Optional)</label>
            <input name="setlist" value={formData.setlist || ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-sm font-bold">Notes</label>
            <textarea name="notes" value={formData.notes || ''} onChange={handleChange} className="w-full border p-2 rounded" rows="3" />
          </div>
        </div>
      )}

      {/* --- VENUE FORM --- */}
      {type === 'venue' && (
        <div className="space-y-2 p-4 border rounded bg-white shadow">
          <div>
            <label className="block text-sm font-bold">Venue Name</label>
            <input name="name" value={formData.name || ''} onChange={handleChange} className="w-full border p-2 rounded" required />
          </div>
          
          <div>
            <label className="block text-sm font-bold">City</label>
            <input name="city" value={formData.city || ''} onChange={handleChange} className="w-full border p-2 rounded" required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold">Latitude</label>
              <input name="latitude" type="number" step="any" value={formData.latitude || ''} onChange={handleChange} className="w-full border p-2 rounded" required />
            </div>
            <div>
              <label className="block text-sm font-bold">Longitude</label>
              <input name="longitude" type="number" step="any" value={formData.longitude || ''} onChange={handleChange} className="w-full border p-2 rounded" required />
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-4">
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Save Changes
        </button>
        <button type="button" onClick={() => navigate('/')} className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default EditPage;