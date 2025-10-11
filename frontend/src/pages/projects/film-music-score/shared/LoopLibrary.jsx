// File: /src/pages/projects/film-music-score/shared/LoopLibrary.jsx
// Dynamic loop library with backend API integration
// FIXED: Loop preview plays once and stops automatically

import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, Search, Filter } from 'lucide-react';

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
  lockFeatures = {}
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [loops, setLoops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [error, setError] = useState(null);
  const [moodFilter, setMoodFilter] = useState('All');
  const [instrumentFilter, setInstrumentFilter] = useState('All');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

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
      const matchesMood = moodFilter === 'All' || loop.mood === moodFilter;
      const matchesInstrument = instrumentFilter === 'All' || loop.instrument === instrumentFilter;
      const matchesSearch = loop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loop.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesMood && matchesInstrument && matchesSearch;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // FIXED: Handle loop preview playback - plays once and stops
  const handlePlayLoop = async (loop) => {
    if (lockFeatures.allowLoopPreview === false) {
      console.log('Loop preview is locked');
      return;
    }

    if (isPlayingAudio) {
      console.log('Audio action already in progress, ignoring click');
      return;
    }

    setIsPlayingAudio(true);

    try {
      const isCurrentlyPlaying = currentlyPlaying === loop.id;
      
      if (isCurrentlyPlaying && currentAudio) {
        // STOPPING - Stop current audio
        console.log(`Stopping preview for: ${loop.name}`);
        try {
          currentAudio.pause();
          currentAudio.currentTime = 0;
          currentAudio.loop = false; // Ensure loop is disabled
          currentAudio.src = '';
        } catch (e) {
          console.error('Error stopping audio:', e);
        }
        
        setCurrentlyPlaying(null);
        setCurrentAudio(null);
        
        return;
      }

      // PLAYING - Stop any existing audio first
      if (currentAudio) {
        console.log('Cleaning up previous audio');
        try {
          currentAudio.pause();
          currentAudio.currentTime = 0;
          currentAudio.loop = false;
          currentAudio.src = '';
        } catch (e) {
          console.error('Error cleaning up previous audio:', e);
        }
        setCurrentAudio(null);
        setCurrentlyPlaying(null);
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (!loop.accessible) {
        alert(`Audio file "${loop.name}" is not accessible.`);
        return;
      }

      console.log(`Starting preview for: ${loop.name}`);
      
      const audio = new Audio();
      audio.loop = false; // CHANGED: No looping - play once only
      audio.volume = 0.7;
      audio.crossOrigin = 'anonymous';
      audio.preload = 'auto';
      
      // ADDED: Auto-stop when audio ends
      const handleEnded = () => {
        console.log(`Preview ended for: ${loop.name}`);
        setCurrentlyPlaying(null);
        setCurrentAudio(null);
      };
      
      audio.addEventListener('ended', handleEnded, { once: true });
      
      const loadPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Audio load timeout'));
        }, 20000);
        
        const cleanup = () => {
          audio.removeEventListener('canplaythrough', handleCanPlay);
          audio.removeEventListener('error', handleError);
        };
        
        const handleCanPlay = () => {
          clearTimeout(timeout);
          cleanup();
          resolve();
        };
        
        const handleError = (e) => {
          clearTimeout(timeout);
          cleanup();
          reject(new Error(`Audio load failed: ${e.target.error?.message || 'Unknown error'}`));
        };
        
        audio.addEventListener('canplaythrough', handleCanPlay, { once: true });
        audio.addEventListener('error', handleError, { once: true });
      });

      audio.src = loop.file;
      await loadPromise;

      // Set state before playing
      setCurrentlyPlaying(loop.id);
      setCurrentAudio(audio);

      const playPromise = audio.play();
      if (playPromise) {
        await playPromise;
        console.log(`Successfully playing: ${loop.name} (will play once and stop)`);
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

  // Handle drag start
  const handleDragStart = (e, loop) => {
    if (lockFeatures.allowLoopDrag === false) {
      e.preventDefault();
      console.log('Loop dragging is locked');
      return;
    }

    e.dataTransfer.setData('application/json', JSON.stringify(loop));
    e.dataTransfer.effectAllowed = 'copy';
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
    <div className="h-full flex flex-col bg-gray-800">
      {/* Header - COMPACT VERSION */}
      <div className="p-2 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-white">Loops</h2>
          <span className="text-xs text-gray-400">{loops.length}</span>
        </div>

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
          {/* MOOD FILTER */}
          <select
            value={moodFilter}
            onChange={(e) => setMoodFilter(e.target.value)}
            className="w-full bg-gray-700 text-white text-xs rounded border border-gray-600 focus:border-blue-500 focus:outline-none px-2 py-1.5"
          >
            <option value="All">All Moods</option>
            {moods.filter(m => m !== 'All').map(mood => (
              <option key={mood} value={mood}>{mood}</option>
            ))}
          </select>

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

      {/* Loop List - UPDATED: Smaller, more compact fonts for 160px width */}
      <div className="flex-1 overflow-y-auto p-1.5">
        <div className="space-y-1">
          {filteredLoops.map((loop) => (
            <div
              key={loop.id}
              className="group relative bg-gray-700 hover:bg-gray-600 rounded p-1.5 cursor-move transition-colors border border-gray-600 hover:border-gray-500"
              draggable={lockFeatures.allowLoopDrag !== false}
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
                    handlePlayLoop(loop);
                  }}
                  disabled={!loop.loaded || !loop.accessible || lockFeatures.allowLoopPreview === false || isPlayingAudio}
                  className={`flex-shrink-0 p-1 rounded-full transition-colors ${
                    currentlyPlaying === loop.id
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : loop.loaded && loop.accessible && lockFeatures.allowLoopPreview !== false && !isPlayingAudio
                      ? 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                  title={isPlayingAudio ? "Processing..." : (currentlyPlaying === loop.id ? "Playing" : "Play")}
                >
                  {currentlyPlaying === loop.id ? <Pause size={12} /> : <Play size={12} />}
                </button>
              </div>

              {lockFeatures.allowLoopDrag !== false && (
                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-gray-400 text-xs" style={{ fontSize: '9px' }}>Drag</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredLoops.length === 0 && (
          <div className="text-center text-gray-400 mt-6">
            <Volume2 size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-xs">No loops found</p>
            <p className="text-xs mt-1" style={{ fontSize: '10px' }}>Try different filters</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{filteredLoops.length}/{loops.length}</span>
          <span className="truncate ml-1">
            {moodFilter !== 'All' && `${moodFilter}`}
            {moodFilter !== 'All' && instrumentFilter !== 'All' && ' • '}
            {instrumentFilter !== 'All' && `${instrumentFilter}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoopLibrary;