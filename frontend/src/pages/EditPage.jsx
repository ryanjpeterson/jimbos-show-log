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
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (payload.venue) delete payload.venue;
      if (payload.venueId) payload.venueId = parseInt(payload.venueId);
      if (payload.concerts) delete payload.concerts;
      if (payload.relatedConcerts) delete payload.relatedConcerts;
      payload.type = payload.type || 'concert';
      await axios.put(`/api/edit/${type}/${id}`, payload);
      navigate('/');
    } catch (err) { alert('Update failed'); }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 capitalize">Edit {type}</h2>
        {type === 'concert' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <input name="artist" value={formData.artist || ''} onChange={handleChange} placeholder="Artist" className="border border-gray-300 p-3 rounded-lg w-full" required />
               <input name="date" type="date" value={formData.date || ''} onChange={handleChange} className="border border-gray-300 p-3 rounded-lg w-full" required />
            </div>
            <select name="venueId" value={formData.venueId || ''} onChange={handleChange} className="border border-gray-300 p-3 rounded-lg w-full" required>
               <option value="">Select Venue</option>{venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            
            {/* Media Section */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
               <div>
                  <ImageUploader label="Main Image" onUrlUpdate={(url) => setFormData(p => ({...p, imageUrl: url}))} concertData={concertData} isMainImage={true} />
                  {formData.imageUrl && <img src={getImageUrl(formData.imageUrl)} alt="Main" className="mt-2 h-32 object-cover rounded" />}
               </div>
               <div>
                  <ImageUploader label="Gallery" multiple={true} onUrlUpdate={(urls) => setFormData(p => ({...p, gallery: [...p.gallery, ...urls]}))} concertData={concertData} />
                  <div className="grid grid-cols-3 gap-2 mt-2">
                     {formData.gallery?.map((url, i) => (
                        <div key={i} className="relative h-20"><img src={getImageUrl(url)} className="w-full h-full object-cover rounded" /><button type="button" onClick={() => {const g=[...formData.gallery]; g.splice(i,1); setFormData({...formData, gallery:g})}} className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1">X</button></div>
                     ))}
                  </div>
               </div>
            </div>
            {/* ... other inputs ... */}
          </div>
        )}
        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg">Save</button>
      </form>
    </div>
  );
}
export default EditPage;