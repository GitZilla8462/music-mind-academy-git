import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, Search, Filter, Plus, RefreshCw } from 'lucide-react';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://music-mind-academy-git-production.up.railway.app' 
  : 'http://localhost:5000';

const LoopLibrary = ({ 
  selectedCategory, 
  onCategoryChange, 
  onLoopPreview, 
  onLoopDragStart 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  const [loops, setLoops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [lastReload, setLastReload] = useState(Date.now());
  const [error, setError] = useState(null);

  // Load loops from your Node.js backend API
  useEffect(() => {
    const loadLoopsFromAPI = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching loops from API...');
        
        // Fetch from your backend API
        const response = await fetch(`${API_BASE_URL}/api/loops`);
                
        if (!response.ok) {
          throw new Error(`Failed to fetch loops: ${response.status} ${response.statusText}`);
        }
        
        const serverLoops = await response.json();
        console.log('Received loops from server:', serverLoops);
        
        // Convert server data to your app's format
        const processedLoops = serverLoops.map(serverLoop => 
          createLoopFromServerData(serverLoop)
        );

        setLoops(processedLoops);
        setLoading(false);
        console.log(`Loaded ${processedLoops.length} loops from API`);

        // Test accessibility for each loop asynchronously
        processedLoops.forEach(loop => {
          testAudioFile(loop.file, loop.id);
        });
        
      } catch (error) {
        console.error('Failed to load loops from API:', error);
        setError(error.message);
        setLoading(false);
        
        // Fallback to empty array or you could fallback to hardcoded loops
        setLoops([]);
      }
    };

    loadLoopsFromAPI();
  }, [lastReload]);

  // Convert server loop data to your app's format
  const createLoopFromServerData = (serverLoop) => {
    const { name, file, extension, size, created } = serverLoop;
    
    // Auto-categorize based on filename
    let category = 'Uncategorized';
    let color = '#6b7280';
    
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('beat') || nameLower.includes('drum') || nameLower.includes('percussion')) {
      category = 'Percussion';
      color = '#ef4444';
    } else if (nameLower.includes('string') || nameLower.includes('violin') || nameLower.includes('cello')) {
      category = 'Strings';
      color = '#10b981';
    } else if (nameLower.includes('brass') || nameLower.includes('trumpet') || nameLower.includes('horn')) {
      category = 'Brass';
      color = '#f59e0b';
    } else if (nameLower.includes('piano') || nameLower.includes('keys')) {
      category = 'Piano';
      color = '#6366f1';
    } else if (nameLower.includes('orchestra') || nameLower.includes('symphony') || nameLower.includes('academy')) {
      category = 'Orchestral';
      color = '#8b5cf6';
    } else if (nameLower.includes('ambient') || nameLower.includes('atmosphere') || nameLower.includes('ocean')) {
      category = 'Ambient';
      color = '#06b6d4';
    } else if (nameLower.includes('wood') || nameLower.includes('flute') || nameLower.includes('clarinet')) {
      category = 'Woodwinds';
      color = '#3b82f6';
    }

    // Generate tags based on name
    const tags = ['auto-detected'];
    if (nameLower.includes('beat')) tags.push('rhythm', 'beat');
    if (nameLower.includes('slow')) tags.push('slow');
    if (nameLower.includes('fast') || nameLower.includes('accelerate')) tags.push('fast');
    if (nameLower.includes('ambient') || nameLower.includes('ocean')) tags.push('atmospheric');
    if (nameLower.includes('accent')) tags.push('accent');
    if (nameLower.includes('layer')) tags.push('layered');

    return {
      id: serverLoop.id,
      name: name,
      file: file,
      category: category,
      color: color,
      duration: 4, // Default duration, will be updated by testAudioFile
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

  // Test audio file accessibility and get duration
  const testAudioFile = async (path, loopId) => {
    try {
      const testAudio = new Audio();
      testAudio.preload = 'metadata';
      
      const loadPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          testAudio.src = '';
          reject(new Error('Load timeout'));
        }, 5000);
        
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
      
      // Update loop with real duration and loaded status
      setLoops(prev => prev.map(loop => 
        loop.id === loopId 
          ? { ...loop, duration: result.duration, loaded: true, accessible: true }
          : loop
      ));
      
    } catch (error) {
      console.warn(`Audio test failed for ${path}:`, error.message);
      // Mark as inaccessible but keep with default duration
      setLoops(prev => prev.map(loop => 
        loop.id === loopId 
          ? { ...loop, duration: 4, loaded: true, accessible: false }
          : loop
      ));
    }
  };

  // Manual reload function - now hits the API
  const handleReloadLoops = async () => {
    console.log('Manually reloading loops from API...');
    setLastReload(Date.now());
  };

  // Force rescan using the dedicated rescan endpoint
  const handleForceRescan = async () => {
    try {
      setLoading(true);
      console.log('Force rescanning loops directory...');
      
      const response = await fetch(`${API_BASE_URL}/api/loops/rescan`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Rescan failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Rescan result:', result);
      
      // Reload the loops after rescan
      setLastReload(Date.now());
      
    } catch (error) {
      console.error('Force rescan failed:', error);
      setError(`Rescan failed: ${error.message}`);
      setLoading(false);
    }
  };

  // Get dynamic categories from loaded loops
  const categories = ['All', ...new Set(loops.map(loop => loop.category))];

  // Filter loops based on category and search
  const filteredLoops = loops.filter(loop => {
    const matchesCategory = selectedCategory === 'All' || loop.category === selectedCategory;
    const matchesSearch = loop.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // FIXED: Handle loop preview with immediate pause functionality
  const handlePlayLoop = async (loop) => {
    // If this loop is currently playing, stop immediately
    if (currentlyPlaying === loop.id && currentAudio) {
      // Stop local audio immediately
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.loop = false; // Disable looping before stopping
      
      // Clear the audio source to ensure it stops completely
      const tempSrc = currentAudio.src;
      currentAudio.src = '';
      currentAudio.load(); // Force reload to clear any buffered audio
      
      setCurrentlyPlaying(null);
      setCurrentAudio(null);
      
      console.log(`Stopped playing: ${loop.name}`);
      return;
    }

    // Stop any currently playing audio (both local and ensure complete stop)
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.loop = false;
      currentAudio.src = '';
      currentAudio.load();
    }

    if (!loop.accessible) {
      alert(`Audio file "${loop.name}" is not accessible. Please check the file path: ${loop.file}`);
      return;
    }

    try {
      console.log(`Attempting to play: ${loop.name} from ${loop.file}`);
      
      // Use ONLY local audio player, don't call parent preview to avoid double playback
      const audio = new Audio();
      
      // Set up audio properties before setting src
      audio.loop = true; // Loop the audio for preview
      audio.volume = 0.7; // Set reasonable volume
      audio.crossOrigin = 'anonymous'; // Handle CORS if needed
      audio.preload = 'auto';
      
      // Wait for the audio to be ready with better error handling
      const loadPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Audio load timeout after 10 seconds'));
        }, 10000);
        
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
        
        const cleanup = () => {
          audio.removeEventListener('canplaythrough', handleCanPlay);
          audio.removeEventListener('error', handleError);
        };
        
        audio.addEventListener('canplaythrough', handleCanPlay, { once: true });
        audio.addEventListener('error', handleError, { once: true });
      });

      // Set the source to start loading
      audio.src = loop.file;
      
      // Wait for load
      await loadPromise;

      // Handle audio ending (in case loop fails)
      audio.addEventListener('ended', () => {
        setCurrentlyPlaying(null);
        setCurrentAudio(null);
      });

      // Handle any playback errors
      audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        setCurrentlyPlaying(null);
        setCurrentAudio(null);
      });

      // Try to play
      const playPromise = audio.play();
      if (playPromise) {
        await playPromise;
      }
      
      setCurrentlyPlaying(loop.id);
      setCurrentAudio(audio);
      
      // DON'T call parent preview handler to avoid double playback
      // The parent onLoopPreview is meant for the Tone.js engine when dropping loops
      // For library preview, we only want the simple HTML5 audio
      
      console.log(`Successfully playing loop: ${loop.name}`);
      
    } catch (error) {
      console.error('Failed to play audio:', error);
      alert(`Failed to play "${loop.name}". Error: ${error.message}`);
      setCurrentlyPlaying(null);
      setCurrentAudio(null);
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        setCurrentAudio(null);
      }
    };
  }, [currentAudio]);

  // Clean up audio when component unmounts
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
    };
  }, []);

  // Handle drag start
  const handleDragStart = (e, loop) => {
    e.dataTransfer.setData('application/json', JSON.stringify(loop));
    e.dataTransfer.effectAllowed = 'copy';
    if (onLoopDragStart) {
      onLoopDragStart(loop);
    }
    console.log(`Starting drag for loop: ${loop.name}`);
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-gray-800">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <Volume2 size={48} className="mx-auto mb-4 opacity-50 animate-pulse" />
            <p>Loading audio loops from API...</p>
            <p className="text-xs mt-2">Fetching from /api/loops</p>
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
            <div className="mt-4 space-x-2">
              <button
                onClick={handleReloadLoops}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
              >
                Retry
              </button>
              <button
                onClick={handleForceRescan}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
              >
                Force Rescan
              </button>
            </div>
            <p className="text-xs mt-3 text-gray-500">
              Make sure your backend server is running
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Loop Library</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReloadLoops}
              className="p-1.5 bg-green-600 hover:bg-green-700 rounded text-white transition-colors"
              title="Reload loops from API"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={handleForceRescan}
              className="p-1.5 bg-yellow-600 hover:bg-yellow-700 rounded text-white transition-colors text-xs px-2"
              title="Force rescan loops directory"
            >
              Rescan
            </button>
            <button
              onClick={() => setShowUploader(true)}
              className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
              title="Add new loop"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search loops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-1 mb-2">
          <Filter size={14} className="text-gray-400 flex-shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="flex-1 min-w-0 bg-gray-700 text-white text-xs rounded border border-gray-600 focus:border-blue-500 focus:outline-none px-2 py-1 truncate"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loop List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {filteredLoops.map((loop) => (
            <div
              key={loop.id}
              className="group relative bg-gray-700 hover:bg-gray-600 rounded-lg p-3 cursor-move transition-colors border border-gray-600 hover:border-gray-500"
              draggable
              onDragStart={(e) => handleDragStart(e, loop)}
            >
              {/* Loop Info */}
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white text-sm font-medium truncate">
                    {loop.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span 
                      className="text-xs px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: loop.color }}
                    >
                      {loop.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {Math.round(loop.duration)}s
                    </span>
                    {loop.size && (
                      <span className="text-xs text-gray-500">
                        {(loop.size / 1024 / 1024).toFixed(1)}MB
                      </span>
                    )}
                    {loop.loaded && loop.accessible && (
                      <span className="text-xs text-green-400">Ready</span>
                    )}
                    {loop.loaded && !loop.accessible && (
                      <span className="text-xs text-red-400">Error</span>
                    )}
                    {!loop.loaded && (
                      <span className="text-xs text-yellow-400">Loading...</span>
                    )}
                  </div>
                </div>

                {/* Play/Pause Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handlePlayLoop(loop);
                  }}
                  disabled={!loop.loaded || !loop.accessible}
                  className={`ml-2 p-2 rounded-full transition-colors ${
                    currentlyPlaying === loop.id
                      ? 'bg-green-600 hover:bg-green-700 text-white animate-pulse'
                      : loop.loaded && loop.accessible
                      ? 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                  title={
                    !loop.loaded
                      ? 'Audio file loading...'
                      : !loop.accessible
                      ? 'Audio file not accessible'
                      : currentlyPlaying === loop.id 
                      ? 'Stop preview' 
                      : 'Preview loop'
                  }
                >
                  {currentlyPlaying === loop.id ? (
                    <Pause size={16} />
                  ) : (
                    <Play size={16} />
                  )}
                </button>
              </div>

              {/* Drag indicator */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-gray-400 text-xs">Drag to timeline</div>
              </div>

              {/* Error info */}
              {loop.loaded && !loop.accessible && (
                <div className="text-xs text-red-400 mt-1 opacity-75">
                  File not accessible: {loop.file}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredLoops.length === 0 && !loading && (
          <div className="text-center text-gray-400 mt-8">
            <Volume2 size={48} className="mx-auto mb-4 opacity-50" />
            <p>No loops found</p>
            <p className="text-sm mt-1">
              {loops.length === 0 
                ? 'No audio files detected in loops folder' 
                : searchTerm 
                ? 'Try a different search term' 
                : 'Select a different category'
              }
            </p>
            {loops.length === 0 && (
              <div className="mt-3 space-x-2">
                <button
                  onClick={handleReloadLoops}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                >
                  Reload Loops
                </button>
                <button
                  onClick={handleForceRescan}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                >
                  Force Rescan
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {filteredLoops.length} loop{filteredLoops.length !== 1 ? 's' : ''} available
            {loops.length > 0 && (
              <span className="ml-2">
                • {loops.filter(l => l.loaded && l.accessible).length}/{loops.length} ready
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500">
            From API • Auto-categorized
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoopLibrary;