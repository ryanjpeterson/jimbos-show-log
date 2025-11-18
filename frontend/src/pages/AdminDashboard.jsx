import React, { useState, useCallback } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle file drop
  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);
    setSuccess(null);

    const file = e.dataTransfer.files[0];

    if (file && file.type === 'application/json') {
      setLoading(true);
      try {
        // 1. Read the file as text
        const text = await file.text();
        // 2. Parse the text into JSON
        const data = JSON.parse(text);

        // 3. Post the JSON data (not the file) to the backend
        const res = await axios.post('/api/import', data);
        
        setSuccess(res.data.message);
      } catch (err) {
        if (err instanceof SyntaxError) {
          setError("Invalid JSON file. Check for syntax errors.");
        } else {
          setError(err.response?.data?.message || "An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    } else {
      setError("Invalid file type. Please drop a single .json file.");
    }
  }, []);

  // Prevent default browser behavior for drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
        <h2 className="text-xl font-bold mb-4">Import Data</h2>
        <p className="text-gray-600 mb-4">
          Drop a valid <code>.json</code> file into the area below to bulk-import venues and concerts. 
          Data is transactional: if one entry fails, the entire import is rolled back.
        </p>
        
        <div 
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-4 border-dashed rounded-lg p-12 text-center transition-colors
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
          `}
        >
          {loading ? (
            <p className="text-lg font-semibold text-gray-700">Importing...</p>
          ) : (
            <p className="text-lg font-semibold text-gray-700">
              {isDragging ? "Release to upload" : "Drag & drop your JSON file here"}
            </p>
          )}
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-lg">
            <strong className="font-bold">Error:</strong> {error}
          </div>
        )}
        {success && (
          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg">
            <strong className="font-bold">Success:</strong> {success}
          </div>
        )}

        <div className="mt-6">
          <h3 className="font-bold text-gray-700">Need the template?</h3>
          <p className="text-gray-600">
            Download the official data template to ensure your import is successful.
          </p>
          {/* This link assumes you've placed the template in the /public folder */}
          <a 
            href="/jimbos-show-log-import-template.json" 
            download
            className="inline-block mt-2 bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800"
          >
            Download Template
          </a>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;