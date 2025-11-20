import React, { useState, useCallback } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  
  const handleDrop = useCallback(async (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false); setError(null); setSuccess(null);
    const file = e.dataTransfer.files[0];

    if (file && file.type === 'application/json') {
      setLoading(true);
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        const res = await axios.post('/api/import', data);
        setSuccess(res.data.message);
      } catch (err) {
        if (err instanceof SyntaxError) setError("Invalid JSON file. Check for syntax errors.");
        else setError(err.response?.data?.message || "An unknown error occurred.");
      } finally { setLoading(false); }
    } else { setError("Invalid file type. Please drop a single .json file."); }
  }, []);

  const handleExport = async () => {
    setExportLoading(true); setError(null); setSuccess(null);
    try {
      const response = await axios.get('/api/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `jimbos-show-log-backup-${dateStr}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSuccess("Export successful! File downloaded.");
    } catch (err) {
      console.error("Export failed", err);
      setError("Failed to export database.");
    } finally { setExportLoading(false); }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: IMPORT */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold mb-4 flex items-center"><span className="text-2xl mr-2">📥</span> Import Data</h2>
          <p className="text-gray-600 mb-4 text-sm">Drop a valid <code>.json</code> file below to bulk-import venues and concerts. </p>
          
          <div 
            onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
            className={`border-4 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
          >
            {loading ? (
              <p className="text-lg font-semibold text-gray-700 animate-pulse">Importing...</p>
            ) : (
              <div>
                <p className="text-lg font-semibold text-gray-700">{isDragging ? "Release to upload" : "Drag & drop JSON here"}</p>
                <p className="text-xs text-gray-400 mt-2">or click to select (future)</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Format Guide:</p>
            <a href="/jimbos-show-log-import-template.json" download className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md uppercase font-semibold hover:bg-gray-200 transition">Download Template JSON</a>
          </div>
        </div>

        {/* RIGHT COLUMN: EXPORT & STATUS */}
        <div className="space-y-8">
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold mb-4 flex items-center"><span className="text-2xl mr-2">📤</span> Export Database</h2>
            <p className="text-gray-600 mb-6 text-sm">Download a complete backup of your database in JSON format. </p>
            
            <button 
              onClick={handleExport} disabled={exportLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportLoading ? (<span>Generating JSON...</span>) : (<span>Download Backup (.json)</span>)}
            </button>
          </div>

          {(error || success) && (
            <div className={`p-4 rounded-lg shadow-md ${error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
              <h3 className="font-bold mb-1">{error ? 'Error' : 'Success'}</h3>
              <p className="text-sm">{error || success}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;