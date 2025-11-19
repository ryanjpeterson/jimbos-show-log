import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function EditPage() {
  const { type, id } = useParams(); // Grab parameters from URL
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    gallery: []
  });
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [galleryInput, setGalleryInput] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. If editing a concert, we need the list of venues for the dropdown
        if (type === 'concert') {
          const venueRes = await axios.get('/api/venues');
          setVenues(venueRes.data);
        }

        // 2. Fetch the existing data for the item we are editing
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
        
        // Ensure gallery is an array
        if (type === 'concert' && !data.gallery) {
          data.gallery = [];
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

  // Handle adding a URL to the gallery array
  const addGalleryImage = () => {
    if (galleryInput) {
      setFormData({
        ...formData,
        gallery: [...(formData.gallery || []), galleryInput]
      });
      setGalleryInput('');
    }
  };

  const removeGalleryImage = (index) => {
    const newGallery = [...formData.gallery];
    newGallery.splice(index, 1);
    setFormData({ ...formData, gallery: newGallery });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Create a copy of the form data so we don't mutate state
      const payload = { ...formData };

      // 2. CLEANUP: Remove the nested 'venue' object.
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
      const message = err.response?.data?.message || "Failed to update entry.";
      alert(message);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 capitalize">Edit {type}</h2>

      {/* --- CONCERT FORM --- */}
      {type === 'concert' && (
        <div className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="artist" value={formData.artist || ''} onChange={handleChange} placeholder="Artist Name" className="border p-3 rounded w-full" required />
            <input name="date" type="date" value={formData.date || ''} onChange={handleChange} className="border p-3 rounded w-full" required />
          </div>

          <select name="venueId" value={formData.venueId || ''} onChange={handleChange} className="border p-3 rounded w-full" required>
            <option value="">Select a venue...</option>
            {venues.map(venue => (
              <option key={venue.id} value={venue.id}>
                {venue.name} ({venue.city})
              </option>
            ))}
          </select>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <select name="type" value={formData.type || 'concert'} onChange={handleChange} className="border p-3 rounded w-full">
                 <option value="concert">Concert</option>
                 <option value="festival">Festival</option>
              </select>
              <input name="eventName" value={formData.eventName || ''} onChange={handleChange} placeholder="Event Name (Optional)" className="border p-3 rounded w-full" />
           </div>

           {/* IMAGE FIELDS */}
          <div className="p-4 bg-gray-50 rounded border border-gray-200 space-y-3">
            <h3 className="font-bold text-gray-700">Images</h3>
            
            {/* Main Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Main Hero Image URL</label>
              <input name="imageUrl" value={formData.imageUrl || ''} onChange={handleChange} placeholder="https://..." className="border p-2 rounded w-full" />
            </div>

            {/* Gallery */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Gallery Images</label>
              <div className="flex space-x-2">
                <input 
                  value={galleryInput} 
                  onChange={(e) => setGalleryInput(e.target.value)} 
                  placeholder="Paste image URL" 
                  className="border p-2 rounded flex-grow" 
                />
                <button type="button" onClick={addGalleryImage} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Add</button>
              </div>
              
              {/* Gallery Preview List */}
              {formData.gallery && formData.gallery.length > 0 && (
                <div className="mt-2 space-y-2">
                  {formData.gallery.map((url, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border text-sm">
                      <span className="truncate max-w-xs">{url}</span>
                      <button type="button" onClick={() => removeGalleryImage(idx)} className="text-red-500 hover:text-red-700 text-xs font-bold">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <input name="setlist" value={formData.setlist || ''} onChange={handleChange} placeholder="Setlist.fm Link" className="border p-3 rounded w-full" />
          <textarea name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Notes" className="border p-3 rounded w-full h-32" />
        </div>
      )}

      {/* --- VENUE FORM --- */}
      {type === 'venue' && (
        <div className="space-y-4">
          <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Venue Name" className="border p-3 rounded w-full" required />
          <input name="city" value={formData.city || ''} onChange={handleChange} placeholder="City" className="border p-3 rounded w-full" required />
          
          <div className="grid grid-cols-2 gap-4">
            <input name="latitude" type="number" step="any" value={formData.latitude || ''} onChange={handleChange} placeholder="Latitude" className="border p-3 rounded w-full" required />
            <input name="longitude" type="number" step="any" value={formData.longitude || ''} onChange={handleChange} placeholder="Longitude" className="border p-3 rounded w-full" required />
          </div>
        </div>
      )}

      <div className="flex space-x-4 mt-6">
        <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 shadow-lg">
          Save Changes
        </button>
        <button type="button" onClick={() => navigate('/')} className="flex-1 bg-gray-500 text-white font-bold py-3 rounded-lg hover:bg-gray-600 shadow-lg">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default EditPage;