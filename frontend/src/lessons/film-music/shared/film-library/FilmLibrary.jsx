// FilmLibrary.jsx
// Film selection grid with mood tabs, thumbnails, and preview

import React, { useState, useRef, useCallback } from 'react';
import { Film, Play, Check } from 'lucide-react';
import { films, FILM_MOODS, getFilmsByMood } from './filmLibraryData';

const FilmLibrary = ({ onSelect, selectedFilmId }) => {
  const [activeMood, setActiveMood] = useState('all');
  const [previewingId, setPreviewingId] = useState(null);
  const previewVideoRef = useRef(null);

  const filteredFilms = getFilmsByMood(activeMood);

  const handlePreview = useCallback((film) => {
    if (film.placeholder || !film.videoPath) return;

    if (previewingId === film.id) {
      setPreviewingId(null);
      return;
    }
    setPreviewingId(film.id);
  }, [previewingId]);

  const handleSelect = useCallback((film) => {
    if (film.placeholder || !film.videoPath) return;
    onSelect(film);
  }, [onSelect]);

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="text-center py-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <Film className="w-7 h-7 text-blue-400" />
          Choose Your Film
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Pick a film that matches your character's mood — then score it
        </p>
      </div>

      {/* Mood tabs */}
      <div className="flex justify-center gap-2 py-3 border-b border-gray-800">
        {FILM_MOODS.map((mood) => (
          <button
            key={mood.id}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeMood === mood.id
                ? 'text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
            style={{
              backgroundColor: activeMood === mood.id ? mood.color : 'transparent',
              border: `1px solid ${activeMood === mood.id ? mood.color : '#4B5563'}`,
            }}
            onClick={() => setActiveMood(mood.id)}
          >
            {mood.name}
          </button>
        ))}
      </div>

      {/* Film grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {filteredFilms.map((film) => {
            const isSelected = selectedFilmId === film.id;
            const isPreviewing = previewingId === film.id;
            const isAvailable = !film.placeholder && film.videoPath;
            const moodData = FILM_MOODS.find(m => m.id === film.mood);

            return (
              <div
                key={film.id}
                className={`rounded-xl overflow-hidden border transition-all ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/50'
                    : isAvailable
                    ? 'border-gray-700 hover:border-gray-500 cursor-pointer'
                    : 'border-gray-800 opacity-50 cursor-not-allowed'
                }`}
                onClick={() => isAvailable && handleSelect(film)}
              >
                {/* Thumbnail / Preview */}
                <div className="aspect-video bg-gray-800 relative overflow-hidden">
                  {isPreviewing && isAvailable ? (
                    <video
                      ref={previewVideoRef}
                      src={film.videoPath}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : film.thumbnailPath ? (
                    <img
                      src={film.thumbnailPath}
                      alt={film.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-10 h-10 text-gray-600" />
                    </div>
                  )}

                  {/* Mood badge */}
                  <div
                    className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
                    style={{ backgroundColor: moodData?.color || '#6B7280' }}
                  >
                    {moodData?.name || film.mood}
                  </div>

                  {/* Selected checkmark */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Preview overlay */}
                  {isAvailable && !isPreviewing && (
                    <button
                      className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(film);
                      }}
                    >
                      <Play className="w-10 h-10 text-white" />
                    </button>
                  )}

                  {/* Coming soon label for placeholder films */}
                  {film.placeholder && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <span className="text-gray-400 text-xs font-medium">Coming Soon</span>
                    </div>
                  )}
                </div>

                {/* Film info */}
                <div className="p-3 bg-gray-800/50">
                  <h3 className="text-sm font-medium text-white truncate">{film.title}</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">
                    {film.description}
                  </p>
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    {Math.floor(film.duration / 60)}:{String(film.duration % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FilmLibrary;
