// File: /src/pages/projects/film-music-score/shared/LoopLibrary.jsx
// Dynamic loop library with backend API integration
// UPDATED: Added restrictToCategory and lockedMood props to lock filters for lessons

import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, Search, Filter, Lock } from 'lucide-react';

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
  restrictToCategory = null,  // NEW: Restrict to specific mood category
  lockedMood = null            // NEW: Lock mood filter to specific value
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [loops, setLoops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [error, setError] = useState(null);
  const [moodFilter, setMoodFilter] = useState(lockedMood || 'All');  // UPDATED: Use locked mood if provided
  const [instrumentFilter, setInstrumentFilter] = useState('All');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // DEBUG: Log props on mount
  useEffect(() => {
    console.log('🔍 LoopLibrary Props:', { restrictToCategory, lockedMood });
  }, []);

  // Lock mood filter when lockedMood is set
  useEffect(() => {
    if (lockedMood) {
      setMoodFilter(lockedMood);
    }
  }, [lockedMood]);

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
      extension: extension
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
          reject(new Error(`Load error: ${e.message}`));
        });
      });

      testAudio.src = path;
      const result = await loadPromise;
      
      setLoops(prev => prev.map(loop => 
        loop.id === loopId 
          ? { ...loop, duration: result.duration, loaded: true, accessible: true }
          : loop
      ));
      
    } catch (error) {
      console.warn(`Failed to load audio for ${loopId}:`, error);
      setLoops(prev => prev.map(loop => 
        loop.id === loopId 
          ? { ...loop, duration: 4, loaded: true, accessible: false }
          : loop
      ));
    }
  };

  // Get unique moods and instruments for filters
  const moods = ['All', ...new Set(loops.map(loop => loop.mood))].sort();
  const instruments = ['All', ...new Set(loops.map(loop => loop.instrument))].sort();

  // Filter loops by mood, instrument, and search term, then sort alphabetically
  const filteredLoops = loops
    .filter(loop => {
      // Apply mood filter
      const matchesMood = moodFilter === 'All' || loop.mood === moodFilter;
      
      // Apply instrument filter
      const matchesInstrument = instrumentFilter === 'All' || loop.instrument === instrumentFilter;
      
      // Apply search term filter
      const matchesSearch = searchTerm === '' || 
        loop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loop.mood.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loop.instrument.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (loop.subType && loop.subType.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // NEW: Apply restrictToCategory filter (hard restriction)
      const matchesRestriction = !restrictToCategory || loop.mood === restrictToCategory;
      
      return matchesMood && matchesInstrument && matchesSearch && matchesRestriction;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // Stop currently playing loop
  const stopCurrentLoop = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.src = '';
      setCurrentAudio(null);
    }
    setCurrentlyPlaying(null);
  };

  // Play or stop a loop
  const handlePlayLoop = async (loop) => {
    if (isPlayingAudio) {
      console.log('Already processing audio, please wait...');
      return;
    }

    if (currentlyPlaying === loop.id) {
      stopCurrentLoop();
      if (onLoopPreview) {
        onLoopPreview(loop, false);
      }
      return;
    }

    if (currentAudio) {
      stopCurrentLoop();
    }

    setIsPlayingAudio(true);

    try {
      const audio = new Audio();
      audio.volume = 0.7;
      audio.loop = false;

      audio.addEventListener('ended', () => {
        console.log(`Loop finished playing: ${loop.name}`);
        setCurrentlyPlaying(null);
        setCurrentAudio(null);
        if (onLoopPreview) {
          onLoopPreview(loop, false);
        }
      }, { once: true });

      const loadPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          audio.src = '';
          reject(new Error('Audio load timeout (10s)'));
        }, 10000);

        const handleLoad = () => {
          clearTimeout(timeout);
          resolve();
        };

        const handleError = (e) => {
          clearTimeout(timeout);
          reject(new Error(`Failed to load audio: ${e.message || 'Unknown error'}`));
        };

        audio.addEventListener('canplaythrough', handleLoad, { once: true });
        audio.addEventListener('error', handleError, { once: true });
      });

      audio.src = loop.file;
      await loadPromise;

      setCurrentlyPlaying(loop.id);
      setCurrentAudio(audio);

      const playPromise = audio.play();
      if (playPromise) {
        await playPromise;
        console.log(`Successfully playing: ${loop.name} (will play once and stop)`);
      }

      if (onLoopPreview) {
        onLoopPreview(loop, true);
      }
      
    } catch (error) {
      console.error('Failed to play audio:', error);
      alert(`Failed to play "${loop.name}": ${error.message}`);
      setCurrentlyPlaying(null);
      setCurrentAudio(null);
    } finally {
      setTimeout(() => {
        setIsPlayingAudio(false);
      }, 300);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
    };
  }, [currentAudio]);

  // Handle drag start - UPDATED: Check if loop matches restriction
  const handleDragStart = (e, loop) => {
    if (lockFeatures.allowLoopDrag === false) {
      e.preventDefault();
      console.log('Loop dragging is locked');
      return;
    }

    // NEW: Prevent dragging restricted loops
    if (restrictToCategory && loop.mood !== restrictToCategory) {
      e.preventDefault();
      console.log(`Loop drag prevented - only ${restrictToCategory} loops allowed`);
      return;
    }

    e.dataTransfer.setData('application/json', JSON.stringify(loop));
    e.dataTransfer.effectAllowed = 'copy';
    if (onLoopDragStart) {
      onLoopDragStart(loop);
    }
  };

  // NEW: Check if a loop is restricted (for visual feedback)
  const isLoopRestricted = (loop) => {
    return restrictToCategory && loop.mood !== restrictToCategory;
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
    <div className="h-full flex flex-col bg-gray-800">
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
        </div>
      </div>

      {/* Loop List - UPDATED: Visual feedback for restricted loops */}
      <div className="flex-1 overflow-y-auto p-1.5">
        <div className="space-y-1">
          {filteredLoops.map((loop) => {
            const restricted = isLoopRestricted(loop);
            return (
              <div
                key={loop.id}
                className={`group relative rounded p-1.5 transition-colors border ${
                  restricted 
                    ? 'bg-gray-800 border-gray-700 opacity-40 cursor-not-allowed' 
                    : 'bg-gray-700 hover:bg-gray-600 cursor-move border-gray-600 hover:border-gray-500'
                }`}
                draggable={lockFeatures.allowLoopDrag !== false && !restricted}
                onDragStart={(e) => handleDragStart(e, loop)}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-xs font-medium truncate leading-tight">
                      {loop.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span 
                        className="px-1 py-0.5 rounded text-white font-semibold text-xs leading-none"
                        style={{ backgroundColor: loop.color, fontSize: '10px' }}
                      >
                        {loop.instrument}
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
                        ? 'bg-gray-600 hover:bg-gray-500 text-gray-300'
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
            <p className="text-xs">No loops found</p>
            <p className="text-xs mt-1" style={{ fontSize: '10px' }}>
              {restrictToCategory ? `Only ${restrictToCategory} loops available` : 'Try different filters'}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{filteredLoops.length}/{loops.length}</span>
          <span className="truncate ml-1">
            {restrictToCategory && `ðŸ”’ ${restrictToCategory}`}
            {restrictToCategory && (moodFilter !== 'All' || instrumentFilter !== 'All') && ' â€¢ '}
            {moodFilter !== 'All' && !restrictToCategory && `${moodFilter}`}
            {moodFilter !== 'All' && instrumentFilter !== 'All' && ' â€¢ '}
            {instrumentFilter !== 'All' && `${instrumentFilter}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoopLibrary;