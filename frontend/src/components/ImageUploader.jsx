import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

function ImageUploader({ onUrlUpdate, label, multiple = false, isMainImage = false, concertData }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    if (!concertData || !concertData.id || !concertData.artist || !concertData.date) {
        setError("Error: Missing Concert ID, Artist, or Date. Please save text fields first.");
        return;
    }

    setUploading(true);
    setError(null);

    const filesToUpload = multiple ? acceptedFiles : [acceptedFiles[0]];

    const uploadPromises = filesToUpload.map(async (file) => {
      const formData = new FormData();
      
      // IMPORTANT: Append text fields FIRST
      formData.append('concertId', concertData.id);
      formData.append('artist', concertData.artist);
      formData.append('date', concertData.date); 
      formData.append('isMainImage', isMainImage ? 'true' : 'false'); 

      // Append file LAST so req.body is populated when multer sees the file
      formData.append('file', file);

      try {
        const res = await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data.url;
      } catch (err) {
        console.error("Upload failed", err.response?.data);
        throw new Error(`Upload failed: ${err.response?.data?.message || err.message}`);
      }
    });

    try {
      const urls = await Promise.all(uploadPromises);
      if (multiple) {
        onUrlUpdate(urls);
      } else {
        onUrlUpdate(urls[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }, [onUrlUpdate, multiple, isMainImage, concertData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    multiple,
    accept: { 'image/*': [], 'video/*': [] }
  });

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-600 mb-1">{label}</label>
      <div 
        {...getRootProps()} 
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}
          ${uploading ? 'opacity-50 cursor-wait' : ''}
        `}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <p className="text-sm text-blue-600 font-medium animate-pulse">Uploading...</p>
        ) : isDragActive ? (
          <p className="text-sm text-blue-600 font-medium">Drop files here...</p>
        ) : (
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Drag & drop {multiple ? "files" : "an image"} here</p>
            <p className="text-xs text-gray-400">Saved as YYYYMMDD-artist-N.ext</p>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export default ImageUploader;