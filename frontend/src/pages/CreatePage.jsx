import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreatePage() {
  const [type, setType] = useState('concert');
  const [venues, setVenues] = useState([]);
  const [formData, setFormData] = useState({ gallery: [] });
  const [galleryInput, setGalleryInput] = useState(''); 
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/venues').then(res => setVenues(res.data));
  }, []);

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
      if (type === 'concert') {
        payload.type = payload.type || 'concert';
        if (payload.venueId) payload.venueId = parseInt(payload.venueId);
        if (!payload.gallery) payload.gallery = [];
        delete payload.venue;
      }
      if (type === 'venue') {
        payload.latitude = payload.latitude ? parseFloat(payload.latitude) : 0.0;
        payload.longitude = payload.longitude ? parseFloat(payload.longitude) : 0.0;
        if (!payload.name) return alert("Venue name required");
        delete payload.gallery; delete payload.imageUrl; delete payload.artist; delete payload.date; delete payload.venueId; delete payload.type; delete payload.eventName; delete payload.setlist; delete payload.notes;
      }
      await axios.post(`/api/create/${type}`, payload);
      navigate('/');
    } catch (err) { alert(`Error: ${err.response?.data?.message || err.message}`); }
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
              <option value="">Select Venue *</option>{venues.map(v => <option key={v.id} value={v.id}>{v.name} ({v.city})</option>)}
            </select>
            
            <input name="eventName" onChange={handleChange} placeholder="Tour / Event Name (Optional)" className="border border-gray-300 p-3 rounded-lg w-full" />
            
            {/* IMAGE FIELDS */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
              <h3 className="font-bold text-gray-700">Images</h3>
              
              <div><label className="block text-sm font-semibold text-gray-600 mb-1">Main Hero Image URL</label><input name="imageUrl" onChange={handleChange} placeholder="https://..." className="border border-gray-300 p-2 rounded-md w-full" /></div>
              
              <div><label className="block text-sm font-semibold text-gray-600 mb-1">Gallery Images</label>
                <div className="flex space-x-2">
                  <input value={galleryInput} onChange={(e) => setGalleryInput(e.target.value)} placeholder="Paste image URL" className="border border-gray-300 p-2 rounded-md flex-grow" />
                  <button type="button" onClick={addGalleryImage} className="text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-md uppercase font-semibold hover:bg-gray-200 transition shadow-sm">Add</button>
                </div>
                
                {formData.gallery?.length > 0 && <div className="mt-2 space-y-2">{formData.gallery.map((url, idx) => <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200 text-sm"><span className="truncate max-w-xs">{url}</span><button type="button" onClick={() => removeGalleryImage(idx)} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md uppercase font-semibold hover:bg-red-50 hover:text-red-600 transition">Remove</button></div>)}</div>}
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

        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-blue-700 transition">
          Save Entry
        </button>
      </form>
    </div>
  );
}

export default CreatePage;