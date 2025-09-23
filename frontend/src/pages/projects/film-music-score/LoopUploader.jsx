// LoopUploader.jsx - Component for uploading new loops
import React, { useState } from 'react';
import { Upload, Plus, X } from 'lucide-react';

export const LoopUploader = ({ onLoopAdd, onClose }) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newLoop, setNewLoop] = useState({
    name: '',
    category: 'Custom',
    bpm: 120,
    key: 'C',
    tags: '',
    color: '#3B82F6'
  });

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        if (file.type.startsWith('audio/')) {
          const audioUrl = URL.createObjectURL(file);
          
          // Get audio duration
          const audio = new Audio(audioUrl);
          await new Promise((resolve, reject) => {
            audio.addEventListener('loadedmetadata', resolve);
            audio.addEventListener('error', reject);
          });

          const loopData = {
            ...newLoop,
            name: newLoop.name || file.name.replace(/\.[^/.]+$/, ''),
            file: audioUrl,
            duration: audio.duration,
            tags: newLoop.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            originalFile: file
          };

          await onLoopAdd(loopData);
        }
      }
    } catch (error) {
      console.error('Failed to upload loop:', error);
      alert('Failed to upload audio file. Please check the file format.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Add New Loop</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Loop Details Form */}
        <div className="space-y-4 mb-4">
          <input
            type="text"
            placeholder="Loop name"
            value={newLoop.name}
            onChange={(e) => setNewLoop(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
          />
          
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Category"
              value={newLoop.category}
              onChange={(e) => setNewLoop(prev => ({ ...prev, category: e.target.value }))}
              className="p-2 bg-gray-700 text-white rounded border border-gray-600"
            />
            <input
              type="number"
              placeholder="BPM"
              value={newLoop.bpm}
              onChange={(e) => setNewLoop(prev => ({ ...prev, bpm: parseInt(e.target.value) }))}
              className="p-2 bg-gray-700 text-white rounded border border-gray-600"
            />
          </div>

          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={newLoop.tags}
            onChange={(e) => setNewLoop(prev => ({ ...prev, tags: e.target.value }))}
            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
          />
        </div>

        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver 
              ? 'border-blue-400 bg-blue-400 bg-opacity-10' 
              : 'border-gray-600 hover:border-gray-500'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="mx-auto mb-4 text-gray-400" size={32} />
          <p className="text-gray-300 mb-2">Drop audio files here or</p>
          <input
            type="file"
            accept="audio/*"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
          >
            Choose Files
          </label>
          {uploading && (
            <p className="text-yellow-400 mt-2">Uploading...</p>
          )}
        </div>

        <p className="text-sm text-gray-400 mt-2">
          Supported formats: MP3, WAV, OGG, M4A
        </p>
      </div>
    </div>
  );
};