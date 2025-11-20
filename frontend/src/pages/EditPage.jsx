import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';
import { getImageUrl } from '../utils/imageUtils';

function EditPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ gallery: [] });
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const concertData = { id: parseInt(id), artist: formData.artist, date: formData.date };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (type === 'concert') { const res = await axios.get('/api/venues'); setVenues(res.data); }
        const res = await axios.get(type === 'concert' ? `/api/concerts/${id}` : `/api/venues/id/${id}`);
        let data = res.data;
        if (type === 'concert') {
            if (data.date) data.date = new Date(data.date).toISOString().split('T')[0];
            if (!data.gallery) data.gallery = [];
        }
        setFormData(data);
        setLoading(false);
      } catch (err) { setLoading(false); }
    };
    fetchData();
  }, [type, id]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleMainImageUpload = (url) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
  };

  const handleGalleryUpload = (urls) => {
    setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ...urls] }));
  };

  // DELETE FILE HANDLER (Server + State)
  const removeFileFromServer = async (url) => {
    if (!url) return;
    try {
      // Clean URL if absolute
      let relativeUrl = url;
      if (url.startsWith('http')) {
         relativeUrl = new URL(url).pathname; 
      }
      
      // Call backend to delete file from disk and update DB
      await axios.delete('/api/upload', { 
          data: { 
              fileUrl: relativeUrl, 
              concertId: parseInt(id) // Sending ID allows backend to update DB record immediately
          } 
      });
    } catch (err) {
      console.error("Failed to delete file from server:", err);
      // Proceed to remove from UI state anyway so user doesn't get stuck
    }
  };

  const removeMainImage = async () => {
      await removeFileFromServer(formData.imageUrl);
      setFormData({ ...formData, imageUrl: '' });
  };

  const removeGalleryImage = async (index) => {
    const url = formData.gallery[index];
    await removeFileFromServer(url);
    
    const newGallery = [...formData.gallery];
    newGallery.splice(index, 1);
    setFormData({ ...formData, gallery: newGallery });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (payload.venue) delete payload.venue;
      if (payload.venueId) payload.venueId = parseInt(payload.venueId);
      if (payload.concerts) delete payload.concerts;
      if (payload.relatedConcerts) delete payload.relatedConcerts;
      if (payload.id) delete payload.id;
      
      payload.type = payload.type || 'concert';

      await axios.put(`/api/edit/${type}/${id}`, payload);
      navigate('/');
    } catch (err) { alert(`Error: ${err.response?.data?.message || "Failed to update entry."}`); }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
      try {
        await axios.delete(`/api/delete/${type}/${id}`);
        navigate('/');
      } catch (err) {
        console.error("Delete failed", err);
        alert(`Failed to delete: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-800 capitalize">Edit {type}</h2>
            <button 
                type="button"
                onClick={handleDelete}
                className="text-xs bg-red-50 text-red-600 px-3 py-2 rounded-md uppercase font-bold hover:bg-red-100 transition border border-red-100"
            >
                Delete {type}
            </button>
        </div>

        {type === 'concert' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <input name="artist" value={formData.artist || ''} onChange={handleChange} placeholder="Artist" className="border border-gray-300 p-3 rounded-lg w-full" required />
               <input name="date" type="date" value={formData.date || ''} onChange={handleChange} className="border border-gray-300 p-3 rounded-lg w-full" required />
            </div>
            <select name="venueId" value={formData.venueId || ''} onChange={handleChange} className="border border-gray-300 p-3 rounded-lg w-full" required>
               <option value="">Select Venue</option>{venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select name="type" value={formData.type || 'concert'} onChange={handleChange} className="border border-gray-300 p-3 rounded-lg w-full">
                    <option value="concert">Concert</option><option value="festival">Festival</option>
                </select>
                <input name="eventName" value={formData.eventName || ''} onChange={handleChange} placeholder="Event Name" className="border border-gray-300 p-3 rounded-lg w-full" />
            </div>
            
            {/* Media Section */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
               <h3 className="font-bold text-gray-700">Media (Drag & Drop)</h3>
               <div>
                  <ImageUploader label="Main Image" onUrlUpdate={handleMainImageUpload} concertData={concertData} isMainImage={true} />
                  {formData.imageUrl && (
                      <div className="mt-2 relative">
                        <img src={getImageUrl(formData.imageUrl)} alt="Main" className="mt-2 h-32 object-cover rounded" />
                        <button type="button" onClick={removeMainImage} className="absolute top-2 right-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md uppercase font-semibold hover:bg-red-50 hover:text-red-600 transition">Remove</button>
                      </div>
                  )}
               </div>
               <div>
                  <ImageUploader label="Gallery" multiple={true} onUrlUpdate={handleGalleryUpload} concertData={concertData} />
                  <div className="grid grid-cols-3 gap-2 mt-2">
                     {formData.gallery?.map((url, i) => (
                        <div key={i} className="relative h-20">
                            <img src={getImageUrl(url)} className="w-full h-full object-cover rounded" />
                            <button type="button" onClick={() => removeGalleryImage(i)} className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-bl">X</button>
                        </div>
                     ))}
                  </div>
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