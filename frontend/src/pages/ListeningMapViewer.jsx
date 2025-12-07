// File: /src/pages/ListeningMapViewer.jsx
// Standalone viewer for saved Listening Maps
// Works independently of lesson/session context

import React from 'react';
import { useNavigate } from 'react-router-dom';

// Get student ID
const getStudentId = () => {
  return localStorage.getItem('anonymous-student-id') || 'unknown';
};

// Load saved listening map directly from localStorage
const loadListeningMap = () => {
  const studentId = getStudentId();
  const key = `mma-saved-${studentId}-listening-map`;
  
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const data = JSON.parse(saved);
      console.log('📂 Loaded listening map:', data);
      console.log('📂 Data structure keys:', Object.keys(data));
      if (data.data) {
        console.log('📂 Inner data keys:', Object.keys(data.data));
      }
      return data;
    }
  } catch (error) {
    console.error('Error loading listening map:', error);
  }
  return null;
};

// Extract imageData from various possible structures
const getImageData = (savedWork) => {
  if (!savedWork) return null;
  
  // Try different possible locations for imageData
  if (savedWork.data?.imageData) {
    console.log('✅ Found imageData at savedWork.data.imageData');
    return savedWork.data.imageData;
  }
  if (savedWork.imageData) {
    console.log('✅ Found imageData at savedWork.imageData');
    return savedWork.imageData;
  }
  if (typeof savedWork.data === 'string' && savedWork.data.startsWith('data:image')) {
    console.log('✅ Found imageData as savedWork.data string');
    return savedWork.data;
  }
  
  console.log('❌ Could not find imageData in structure');
  return null;
};

const ListeningMapViewer = () => {
  const navigate = useNavigate();
  const savedWork = loadListeningMap();
  const imageData = getImageData(savedWork);
  
  const handleBack = () => {
    navigate('/join');
  };
  
  // No saved work found
  if (!savedWork || !imageData) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white p-8">
        <div className="text-8xl mb-8">🗺️</div>
        <h1 className="text-4xl font-bold mb-4">No Saved Listening Map Found</h1>
        <p className="text-xl text-gray-300 mb-8">You haven't saved a listening map yet.</p>
        {savedWork && (
          <p className="text-sm text-gray-400 mb-4">
            (Data found but imageData missing - check console)
          </p>
        )}
        <button
          onClick={handleBack}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition-colors"
        >
          ← Back to Join Page
        </button>
      </div>
    );
  }
  
  // Get metadata from various possible locations
  const songTitle = savedWork.data?.songTitle || savedWork.title || "Allegro (from Vivaldi's Spring)";
  const composer = savedWork.data?.composer || savedWork.composer || 'Antonio Vivaldi';
  const lastSaved = savedWork.lastSaved || savedWork.data?.savedAt || new Date().toISOString();
  
  // Display saved work
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="h-16 px-6 flex items-center justify-between bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">🗺️ Your Listening Map</h1>
            <p className="text-sm text-gray-500">
              {songTitle} • {composer}
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Saved {new Date(lastSaved).toLocaleString()}
        </div>
      </div>
      
      {/* Canvas Image */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-200 overflow-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <img 
            src={imageData} 
            alt="Your Listening Map"
            style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 150px)', objectFit: 'contain' }}
          />
        </div>
      </div>
    </div>
  );
};

export default ListeningMapViewer;