// File: /src/pages/projects/film-music-score/shared/LoopLibrary.jsx
// Dynamic loop library with backend API integration
// UPDATED: Added showSoundEffects prop and checkbox to display sound effects
// FIXED: Default soundEffectsEnabled to false (unchecked)
// FIXED: Grey styling when unchecked, purple when checked

import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, Search, Filter, Lock } from 'lucide-react';
import { soundEffects } from './soundEffectsData';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';

// Distinct instrument colors - high contrast
const INSTRUMENT_COLORS = {
  'Guitar': '#f97316',    // Orange
  'Bass': '#2563eb',      // Deep Blue
  'Drums': '#dc2626',     // Red
  'Keys': '#06b6d4',      // Teal/Cyan
  'Synth': '#db2777',     // Magenta
  'Strings': '#16a34a',   // Green
  'Brass': '#eab308',     // Gold
  'Woodwinds': '#3b82f6', // Light Blue
  'Vocals': '#a855f7',    // Purple
  'Other': '#6b7280'      // Gray
};

const LoopLibrary = ({ 
  selectedCategory, 
  onCategoryChange, 
  onLoopPreview, 
  onLoopDragStart,
  tutorialMode = false,
  lockFeatures = {},
  restrictToCategory = null,
  lockedMood = null,
  showSoundEffects = false,  // NEW PROP: Enable sound effects
  currentlyPlayingLoopId = null,  // NEW PROP: Track which loop is playing from parent
  highlighted = false  // NEW PROP: Highlight for tutorial
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [loops, setLoops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moodFilter, setMoodFilter] = useState(lockedMood || 'All');
  const [instrumentFilter, setInstrumentFilter] = useState('All');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(false);  // FIXED: Default to false (unchecked)

  // DEBUG: Log props on mount
  useEffect(() => {
    console.log('🎵 LoopLibrary Props:', { restrictToCategory, lockedMood, showSoundEffects });
  }, []);

  // Lock mood filter when lockedMood is set
  useEffect(() => {
    if (lockedMood) {
      setMoodFilter(lockedMood);
    }
  }, [lockedMood]);

  // Sync UI state with parent's currently playing loop
  useEffect(() => {
    if (currentlyPlayingLoopId === null && currentlyPlaying !== null) {
      // Parent says nothing is playing, but we think something is - reset UI
      setCurrentlyPlaying(null);
      setIsPlayingAudio(false);
    }
  }, [currentlyPlayingLoopId, currentlyPlaying]);

  // Load loops from backend API
  useEffect(() => {
    const loadLoopsFromAPI = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/loops`);
        if (!response.ok) {
          throw new Error(`Failed to fetch loops: ${response.status}`);
        }
        
        const serverLoops = await response.json();
        const processedLoops = serverLoops.map(serverLoop => 
          createLoopFromServerData(serverLoop)
        );

        setLoops(processedLoops);
        setLoading(false);

        // Test audio accessibility for all loops
        processedLoops.forEach(loop => {
          testAudioFile(loop.file, loop.id);
        });
        
      } catch (error) {
        console.error('Failed to load loops from API:', error);
        setError(error.message);
        setLoops([]);
        setLoading(false);
      }
    };

    loadLoopsFromAPI();
  }, []);

  // Convert backend loop data to frontend format
  const createLoopFromServerData = (serverLoop) => {
    const { name, file, extension, size, created } = serverLoop;
    const nameLower = name.toLowerCase();
    
    // Detect instrument from filename
    let instrument = 'Other';
    if (nameLower.includes('guitar') || nameLower.includes('gtr')) {
      instrument = 'Guitar';
    } else if (nameLower.includes('bass')) {
      instrument = 'Bass';
    } else if (nameLower.includes('key') || nameLower.includes('piano')) {
      instrument = 'Keys';
    } else if (nameLower.includes('synth')) {
      instrument = 'Synth';
    } else if (nameLower.includes('drum') || nameLower.includes('beat') || nameLower.includes('percussion')) {
      instrument = 'Drums';
    } else if (nameLower.includes('string') || nameLower.includes('violin') || nameLower.includes('cello')) {
      instrument = 'Strings';
    } else if (nameLower.includes('brass') || nameLower.includes('trumpet') || nameLower.includes('horn')) {
      instrument = 'Brass';
    } else if (nameLower.includes('wood') || nameLower.includes('flute') || nameLower.includes('clarinet') || nameLower.includes('oboe') || nameLower.includes('bells')) {
      instrument = 'Woodwinds';
    } else if (nameLower.includes('vocal') || nameLower.includes('voice') || nameLower.includes('choir') || nameLower.includes('song')) {
      instrument = 'Vocals';
    }
    
    // Detect mood from filename
    let mood = 'Neutral';
    
    // Priority order matters - check most specific moods first
    if (nameLower.includes('scary') || nameLower.includes('horror') || nameLower.includes('frightening') || nameLower.includes('creepy')) {
      mood = 'Scary';
    } else if (nameLower.includes('mysterious') || nameLower.includes('mystery') || nameLower.includes('suspense') || nameLower.includes('enigma')) {
      mood = 'Mysterious';
    } else if (nameLower.includes('heroic') || nameLower.includes('hero') || nameLower.includes('triumphant') || nameLower.includes('victory') || nameLower.includes('epic') || nameLower.includes('brave')) {
      mood = 'Heroic';
    } else if (nameLower.includes('upbeat') || nameLower.includes('happy') || nameLower.includes('energetic') || nameLower.includes('cheerful') || nameLower.includes('bright') || nameLower.includes('positive')) {
      mood = 'Upbeat';
    } else if (nameLower.includes('sad') || nameLower.includes('melancholy') || nameLower.includes('somber')) {
      mood = 'Sad';
    } else if (nameLower.includes('chill') || nameLower.includes('calm') || nameLower.includes('peaceful') || nameLower.includes('relaxed')) {
      mood = 'Chill';
    } else if (nameLower.includes('dark') || nameLower.includes('ominous') || nameLower.includes('tense')) {
      mood = 'Dark';
    } else if (nameLower.includes('dramatic') || nameLower.includes('intense')) {
      mood = 'Dramatic';
    } else if (nameLower.includes('romantic') || nameLower.includes('tender')) {
      mood = 'Romantic';
    }
    
    // Detect sub-type
    let subType = null;
    if (nameLower.includes('electric')) subType = 'Electric';
    else if (nameLower.includes('acoustic')) subType = 'Acoustic';
    
    // Build searchable tags
    const tags = [instrument, mood];
    if (subType) tags.push(subType);
    if (nameLower.includes('layer')) tags.push('layered');
    if (nameLower.includes('loop')) tags.push('loop');
    
    return {
      id: serverLoop.id,
      name: name,
      file: file,
      instrument: instrument,
      mood: mood,
      subType: subType,
      color: INSTRUMENT_COLORS[instrument],
      category: instrument,
      duration: 4,
      loaded: false,
      accessible: true,
      originalFilename: `${name}.${extension}`,
      volume: 0.8,
      tags: tags,
      size: size,
      created: created,
      extension: extension,
      type: 'loop'  // Mark as loop (not sound effect)
    };
  };

  // Test if audio file is accessible and get its duration
  const testAudioFile = async (path, loopId) => {
    try {
      const testAudio = new Audio();
      testAudio.preload = 'metadata';
      
      const loadPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          testAudio.src = '';
          reject(new Error('Load timeout'));
        }, 15000);
        
        testAudio.addEventListener('loadedmetadata', () => {
          clearTimeout(timeout);
          resolve({
            duration: testAudio.duration || 4,
            accessible: true
          });
        });
        
        testAudio.addEventListener('error', (e) => {
          clearTimeout(timeout);
          reject(e);
        });
      });

      testAudio.src = path;
      const result = await loadPromise;
      
      // Update loop with actual duration
      setLoops(prev => prev.map(loop => 
        loop.id === loopId 
          ? { ...loop, duration: result.duration, loaded: true, accessible: true }
          : loop
      ));
      
      testAudio.src = '';
    } catch (error) {
      console.warn(`Failed to load audio for ${loopId}:`, error);
      setLoops(prev => prev.map(loop => 
        loop.id === loopId 
          ? { ...loop, loaded: true, accessible: false }
          : loop
      ));
    }
  };

  // Combine loops and sound effects if enabled - SOUND EFFECTS FIRST
  const allItems = soundEffectsEnabled && showSoundEffects 
    ? [...soundEffects, ...loops]  // Sound effects at TOP
    : loops;

  // Extract unique moods and instruments
  const moods = ['All', ...new Set(loops.map(l => l.mood).filter(Boolean))].sort();
  const instruments = ['All', ...new Set(loops.map(l => l.instrument).filter(Boolean))].sort();

  // Filter function
  const isLoopRestricted = (loop) => {
    if (restrictToCategory && loop.mood !== restrictToCategory) {
      return true;
    }
    return false;
  };

  // Filter loops and sound effects
  const filteredLoops = allItems.filter(item => {
    // Search filter
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Sound effects don't have mood/instrument filters
    if (item.type === 'soundEffect') {
      return true;
    }

    // Mood filter (only for music loops)
    if (moodFilter !== 'All' && item.mood !== moodFilter) {
      return false;
    }

    // Instrument filter (only for music loops)
    if (instrumentFilter !== 'All' && item.instrument !== instrumentFilter) {
      return false;
    }

    // Restriction check (only for music loops)
    if (restrictToCategory) {
      return item.mood === restrictToCategory;
    }

    return true;
  });

  // Handle playing loop
  const handlePlayLoop = async (loop) => {
    // If clicking the same loop, toggle off
    if (currentlyPlaying === loop.id) {
      setCurrentlyPlaying(null);
      setIsPlayingAudio(false);
      
      // Notify parent that preview stopped
      if (onLoopPreview) {
        onLoopPreview(loop, false);
      }
      return;
    }

    // Play new loop - let parent handle actual audio playback
    setCurrentlyPlaying(loop.id);
    setIsPlayingAudio(true);
    
    // Notify parent that preview started
    if (onLoopPreview) {
      onLoopPreview(loop, true);
    }
  };

  // Handle drag start
  const handleDragStart = (e, loop) => {
    if (lockFeatures.allowLoopDrag === false || isLoopRestricted(loop)) {
      e.preventDefault();
      return;
    }

    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify(loop));
    
    if (onLoopDragStart) {
      onLoopDragStart(loop);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-gray-800">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <Volume2 size={48} className="mx-auto mb-4 opacity-50 animate-pulse" />
            <p>Loading loops...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col bg-gray-800">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-400">
            <Volume2 size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-medium">Failed to load loops</p>
            <p className="text-sm mt-2 text-gray-300">{error}</p>
            <p className="text-xs mt-4 text-gray-500">Make sure backend server is running</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col bg-gray-800 loop-library ${highlighted ? 'tutorial-highlight' : ''}`}>
      {/* Header - COMPACT VERSION */}
      <div className="p-2 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-white">Loops</h2>
          <span className="text-xs text-gray-400">{filteredLoops.length}</span>
        </div>

        {/* NEW: Restriction Notice */}
        {restrictToCategory && (
          <div className="mb-2 bg-blue-900/30 border border-blue-500/50 rounded px-2 py-1.5">
            <div className="flex items-center gap-1.5">
              <Lock size={12} className="text-blue-400 flex-shrink-0" />
              <span className="text-xs text-blue-300 font-medium">
                Only {restrictToCategory} loops
              </span>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-2">
          <Search size={14} className="absolute left-2 top-2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-7 pr-2 py-1.5 bg-gray-700 text-white text-xs rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Filters - Compact Version */}
        <div className="space-y-1.5">
          {/* MOOD FILTER - UPDATED: Show locked state */}
          <div className="relative">
            <select
              value={moodFilter}
              onChange={(e) => !lockedMood && setMoodFilter(e.target.value)}
              disabled={!!lockedMood}
              className={`w-full bg-gray-700 text-white text-xs rounded border border-gray-600 focus:border-blue-500 focus:outline-none px-2 py-1.5 ${
                lockedMood ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <option value="All">All Moods</option>
              {moods.filter(m => m !== 'All').map(mood => (
                <option key={mood} value={mood}>{mood}</option>
              ))}
            </select>
            {lockedMood && (
              <Lock size={12} className="absolute right-2 top-2 text-gray-400 pointer-events-none" />
            )}
          </div>

          {/* INSTRUMENT FILTER */}
          <select
            value={instrumentFilter}
            onChange={(e) => setInstrumentFilter(e.target.value)}
            className="w-full bg-gray-700 text-white text-xs rounded border border-gray-600 focus:border-blue-500 focus:outline-none px-2 py-1.5"
          >
            <option value="All">All Instruments</option>
            {instruments.filter(i => i !== 'All').map(inst => (
              <option key={inst} value={inst}>{inst}</option>
            ))}
          </select>

          {/* FIXED: SOUND EFFECTS CHECKBOX - Grey when unchecked, purple when checked */}
          {showSoundEffects && (
            <label className={`flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer transition-colors ${
              soundEffectsEnabled 
                ? 'bg-purple-900/30 border border-purple-500/50 hover:bg-purple-900/50'
                : 'bg-gray-700/30 border border-gray-600/50 hover:bg-gray-700/50'
            }`}>
              <input
                type="checkbox"
                checked={soundEffectsEnabled}
                onChange={(e) => setSoundEffectsEnabled(e.target.checked)}
                className="w-3.5 h-3.5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              />
              <span className={`text-xs font-medium flex items-center gap-1 ${
                soundEffectsEnabled ? 'text-purple-300' : 'text-gray-400'
              }`}>
                Show Sound Effects
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Loop List - UPDATED: Visual feedback for sound effects */}
      <div className="flex-1 overflow-y-auto p-1.5">
        <div className="space-y-1">
          {filteredLoops.map((loop) => {
            const restricted = isLoopRestricted(loop);
            const isSoundEffect = loop.type === 'soundEffect';
            
            return (
              <div
                key={loop.id}
                className={`group relative rounded p-1.5 transition-colors border ${
                  restricted 
                    ? 'bg-gray-800 border-gray-700 opacity-40 cursor-not-allowed' 
                    : isSoundEffect
                    ? 'bg-purple-900/30 hover:bg-purple-900/50 cursor-move border-purple-600 hover:border-purple-500'
                    : 'bg-gray-700 hover:bg-gray-600 cursor-move border-gray-600 hover:border-gray-500'
                }`}
                draggable={lockFeatures.allowLoopDrag !== false && !restricted}
                onDragStart={(e) => handleDragStart(e, loop)}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-xs font-medium truncate leading-tight ${
                      isSoundEffect ? 'text-purple-300' : 'text-white'
                    }`}>
                      {loop.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span 
                        className="px-1 py-0.5 rounded text-white font-semibold text-xs leading-none"
                        style={{ backgroundColor: loop.color, fontSize: '10px' }}
                      >
                        {isSoundEffect ? loop.category : loop.instrument}
                      </span>
                      <span className="text-gray-400 text-xs" style={{ fontSize: '10px' }}>
                        {Math.round(loop.duration)}s
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (!restricted) {
                        handlePlayLoop(loop);
                      }
                    }}
                    disabled={!loop.loaded || !loop.accessible || lockFeatures.allowLoopPreview === false || isPlayingAudio || restricted}
                    className={`flex-shrink-0 p-1 rounded-full transition-colors ${
                      currentlyPlaying === loop.id
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : loop.loaded && loop.accessible && lockFeatures.allowLoopPreview !== false && !isPlayingAudio && !restricted
                        ? isSoundEffect 
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                    title={restricted ? "Restricted" : (isPlayingAudio ? "Processing..." : (currentlyPlaying === loop.id ? "Playing" : "Play"))}
                  >
                    {currentlyPlaying === loop.id ? <Pause size={12} /> : <Play size={12} />}
                  </button>
                </div>

                {lockFeatures.allowLoopDrag !== false && !restricted && (
                  <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-gray-400 text-xs" style={{ fontSize: '9px' }}>Drag</div>
                  </div>
                )}

                {restricted && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Lock size={16} className="text-gray-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredLoops.length === 0 && (
          <div className="text-center text-gray-400 mt-6">
            <Volume2 size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-xs">No {soundEffectsEnabled && showSoundEffects ? 'items' : 'loops'} found</p>
            <p className="text-xs mt-1" style={{ fontSize: '10px' }}>
              {restrictToCategory ? `Only ${restrictToCategory} loops available` : 'Try different filters'}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{filteredLoops.length}/{allItems.length}</span>
          <span className="truncate ml-1">
            {soundEffectsEnabled && showSoundEffects && 'SFX ON'}
            {soundEffectsEnabled && showSoundEffects && (restrictToCategory || moodFilter !== 'All' || instrumentFilter !== 'All') && ' • '}
            {restrictToCategory && `Locked: ${restrictToCategory}`}
            {restrictToCategory && (moodFilter !== 'All' || instrumentFilter !== 'All') && ' • '}
            {moodFilter !== 'All' && !restrictToCategory && `${moodFilter}`}
            {moodFilter !== 'All' && instrumentFilter !== 'All' && ' • '}
            {instrumentFilter !== 'All' && `${instrumentFilter}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoopLibrary;