// FilmMusicCompositionActivity.jsx
// Film Music unit composition activity
// Wraps MusicComposer with film selection and virtual instrument enabled
// Students select a film, then compose using Beat Maker, Melody Maker,
// Virtual Instrument (record-to-timeline), and Loop Library

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Film, Play, Check } from 'lucide-react';
import MusicComposer from '../../../pages/projects/film-music-score/composer/MusicComposer';
import { films } from '../../film-music/shared/film-library/filmLibraryData';

const STORAGE_KEY = 'fm-composition';

// Save composition state to localStorage
const saveComposition = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      savedAt: new Date().toISOString()
    }));
  } catch (e) {
    console.error('Error saving FM composition:', e);
  }
};

const loadComposition = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error('Error loading FM composition:', e);
    return null;
  }
};

const FilmMusicCompositionActivity = ({
  onComplete,
  viewMode = false,
  isSessionMode = false,
}) => {
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [placedLoops, setPlacedLoops] = useState([]);
  const [showFilmPicker, setShowFilmPicker] = useState(true);

  // Load saved state
  useEffect(() => {
    const saved = loadComposition();
    if (saved) {
      if (saved.filmId) {
        const film = films.find(f => f.id === saved.filmId);
        if (film) {
          setSelectedFilm(film);
          setShowFilmPicker(false);
        }
      }
      if (saved.placedLoops) {
        setPlacedLoops(saved.placedLoops);
      }
    }
  }, []);

  // Track loop changes for auto-save
  const handleLoopPlaced = useCallback((loop) => {
    setPlacedLoops(prev => {
      const updated = [...prev, loop];
      saveComposition({ filmId: selectedFilm?.id, placedLoops: updated });
      return updated;
    });
  }, [selectedFilm]);

  const handleLoopDeleted = useCallback((loopId) => {
    setPlacedLoops(prev => {
      const updated = prev.filter(l => l.id !== loopId);
      saveComposition({ filmId: selectedFilm?.id, placedLoops: updated });
      return updated;
    });
  }, [selectedFilm]);

  const handleLoopUpdated = useCallback((loopId, updates) => {
    setPlacedLoops(prev => {
      const updated = prev.map(l => l.id === loopId ? { ...l, ...updates } : l);
      saveComposition({ filmId: selectedFilm?.id, placedLoops: updated });
      return updated;
    });
  }, [selectedFilm]);

  const handleSelectFilm = useCallback((film) => {
    setSelectedFilm(film);
    setShowFilmPicker(false);
    saveComposition({ filmId: film.id, placedLoops });
  }, [placedLoops]);

  // Film picker screen
  if (showFilmPicker) {
    return (
      <div className="h-screen bg-gray-900 flex flex-col">
        <div className="text-center py-6">
          <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <Film className="w-7 h-7 text-blue-400" />
            Choose Your Film
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Pick a film that matches your character's mood — then score it
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {films.filter(f => f.videoPath).map((film) => {
              const isSelected = selectedFilm?.id === film.id;
              return (
                <button
                  key={film.id}
                  className={`rounded-xl overflow-hidden border transition-all text-left ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/50'
                      : 'border-gray-700 hover:border-gray-500'
                  }`}
                  onClick={() => handleSelectFilm(film)}
                >
                  <div className="aspect-video bg-gray-800 relative">
                    {film.thumbnailPath ? (
                      <img src={film.thumbnailPath} alt={film.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-10 h-10 text-gray-600" />
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-gray-800/50">
                    <h3 className="text-sm font-medium text-white">{film.title}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{film.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // DAW with film loaded
  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Change film button */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 border-b border-gray-700">
        <span className="text-sm text-gray-400">
          Scoring: <span className="text-white font-medium">{selectedFilm?.title}</span>
        </span>
        <button
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          onClick={() => setShowFilmPicker(true)}
        >
          Change Film
        </button>
      </div>

      <div className="flex-1 min-h-0">
        <MusicComposer
          key={`fm-composer-${selectedFilm?.id || 'none'}`}
          onLoopDropCallback={handleLoopPlaced}
          onLoopDeleteCallback={handleLoopDeleted}
          onLoopUpdateCallback={handleLoopUpdated}
          preselectedVideo={{
            id: selectedFilm.id,
            title: selectedFilm.title,
            duration: selectedFilm.duration,
            videoPath: selectedFilm.videoPath,
            thumbnail: selectedFilm.thumbnailPath
          }}
          showCreatorTools={true}
          showVirtualInstrument={true}
          showSoundEffects={true}
          hideHeader={true}
          hideSubmitButton={true}
          isLessonMode={true}
          showToast={(msg, type) => console.log(msg, type)}
          initialPlacedLoops={placedLoops}
          readOnly={viewMode}
          compositionKey={`fm-score-${selectedFilm?.id || 'default'}`}
        />
      </div>
    </div>
  );
};

export default FilmMusicCompositionActivity;
