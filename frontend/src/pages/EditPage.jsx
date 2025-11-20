import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function EditPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ gallery: [] });
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [galleryInput, setGalleryInput] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (type === 'concert') { const venueRes = await axios.get('/api/venues'); setVenues(venueRes.data); }
        
        const endpoint = type === 'concert' ? `/api/concerts/${id}` : `/api/venues/id/${id}`;
        const res = await axios.get(endpoint);
        
        let data = res.data;
        if (type === 'concert' && data.date) data.date = new Date(data.date).toISOString().split('T')[0];
        if (type === 'concert' && !data.gallery) data.gallery = [];

        setFormData(data);
        setLoading(false);
      } catch (err) { console.log(err); setError("Failed to load data. Item might not exist."); setLoading(false); }
    };
    fetchData();
  }, [type, id]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const addGalleryImage = () => {
    if (galleryInput) { setFormData({ ...formData, gallery: [...(formData.gallery || []), galleryInput] }); setGalleryInput(''); }
  };

  const removeGalleryImage = (index) => {
    const newGallery = [...formData.gallery]; newGallery.splice(index, 1); setFormData({ ...formData, gallery: newGallery });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (payload.venue) delete payload.venue;
      if (payload.venueId) payload.venueId = parseInt(payload.venueId);
      payload.type = payload.type || 'concert';

      await axios.put(`/api/edit/${type}/${id}`, payload);
      navigate('/');
    } catch (err) { alert(`Error: ${err.response?.data?.message || "Failed to update entry."}`); }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 capitalize">Edit {type}</h2>

        {type === 'concert' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="artist" value={formData.artist || ''} onChange={handleChange} placeholder="Artist Name" className="border border-gray-300 p-3 rounded-lg w-full" required />
              <input name="date" type="date" value={formData.date || ''} onChange={handleChange} placeholder="Date" className="border border-gray-300 p-3 rounded-lg w-full" required />
            </div>

            <select name="venueId" value={formData.venueId || ''} onChange={handleChange} className="border border-gray-300 p-3 rounded-lg w-full" required>
              <option value="">Select a venue...</option>
              {venues.map(venue => <option key={venue.id} value={venue.id}>{venue.name} ({venue.city})</option>)}
            </select>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select name="type" value={formData.type || 'concert'} onChange={handleChange} className="border border-gray-300 p-3 rounded-lg w-full">
                  <option value="concert">Concert</option><option value="festival">Festival</option>
              </select>
              <input name="eventName" value={formData.eventName || ''} onChange={handleChange} placeholder="Event Name (Optional)" className="border border-gray-300 p-3 rounded-lg w-full" />
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
              <h3 className="font-bold text-gray-700">Images</h3>
              <div><label className="block text-sm font-semibold text-gray-600 mb-1">Main Hero Image URL</label><input name="imageUrl" value={formData.imageUrl || ''} onChange={handleChange} placeholder="https://..." className="border border-gray-300 p-2 rounded-md w-full" /></div>
              <div><label className="block text-sm font-semibold text-gray-600 mb-1">Gallery Images</label>
                <div className="flex space-x-2"><input value={galleryInput} onChange={(e) => setGalleryInput(e.target.value)} placeholder="Paste image URL" className="border border-gray-300 p-2 rounded-md flex-grow" />
                  <button type="button" onClick={addGalleryImage} className="text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-md uppercase font-semibold hover:bg-gray-200 transition shadow-sm">Add</button>
                </div>
                {formData.gallery?.length > 0 && <div className="mt-2 space-y-2">{formData.gallery.map((url, idx) => <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200 text-sm"><span className="truncate max-w-xs">{url}</span><button type="button" onClick={() => removeGalleryImage(idx)} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded uppercase font-semibold hover:bg-red-50 hover:text-red-600 transition">Remove</button></div>)}</div>}
              </div>
            </div>

            <input name="setlist" value={formData.setlist || ''} onChange={handleChange} placeholder="Setlist.fm Link" className="border border-gray-300 p-3 rounded-lg w-full" />
            <textarea name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Notes" className="border border-gray-300 p-3 rounded-lg w-full h-32" />
          </div>
        )}

        {type === 'venue' && (
          <div className="space-y-4">
            <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Venue Name" className="border border-gray-300 p-3 rounded-lg w-full" required />
            <input name="city" value={formData.city || ''} onChange={handleChange} placeholder="City" className="border border-gray-300 p-3 rounded-lg w-full" required />
            <input name="address" value={formData.address || ''} onChange={handleChange} placeholder="Address (Optional)" className="border border-gray-300 p-3 rounded-lg w-full" />
            
            <div className="grid grid-cols-2 gap-4">
              <input name="latitude" type="number" step="any" value={formData.latitude || ''} onChange={handleChange} placeholder="Latitude" className="border border-gray-300 p-3 rounded-lg w-full" required />
              <input name="longitude" type="number" step="any" value={formData.longitude || ''} onChange={handleChange} placeholder="Longitude" className="border border-gray-300 p-3 rounded-lg w-full" required />
            </div>
          </div>
        )}

        <div className="flex space-x-4 pt-4">
          <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-blue-700 transition">Save Changes</button>
          <button type="button" onClick={() => navigate('/')} className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-lg shadow-sm hover:bg-gray-300 transition">Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default EditPage;