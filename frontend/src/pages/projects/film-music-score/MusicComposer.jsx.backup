import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FileText, Play } from 'lucide-react';

// Import project components
import LoopLibrary from './LoopLibrary';
import Timeline from './timeline/Timeline';
import VideoPlayer from './VideoPlayer';
import TransportControls from './TransportControls';
import { useAudioEngine } from './useAudioEngine';
import { getVideoById } from './loopData';

// Debug component
const AudioDebugPanel = ({ placedLoops, isPlaying, currentTime, playersRef }) => {
  const [showDebug, setShowDebug] = useState(false);
  
  if (!showDebug) {
    return (
      <button 
        onClick={() => setShowDebug(true)}
        className="fixed top-20 right-4 bg-yellow-600 text-white px-2 py-1 text-xs rounded z-50"
      >
        Debug Audio
      </button>
    );
  }

  return (
    <div className="fixed top-20 right-4 bg-black bg-opacity-90 text-white p-4 rounded text-xs max-w-sm z-50 max-h-96 overflow-y-auto">
      <div className="flex justify-between mb-2">
        <span className="font-bold">Audio Debug</span>
        <button onClick={() => setShowDebug(false)} className="text-red-400">×</button>
      </div>
      
      <div className="space-y-1">
        <div>Transport Playing: {isPlaying ? 'YES' : 'NO'}</div>
        <div>Current Time: {currentTime.toFixed(2)}s</div>
        <div>Placed Loops: {placedLoops.length}</div>
        <div>Audio Players: {Object.keys(playersRef.current || {}).length}</div>
        
        <div className="border-t border-gray-600 pt-2 mt-2">
          <div className="font-semibold">Loops Status:</div>
          {placedLoops.map(loop => {
            const shouldBePlaying = currentTime >= loop.startTime && currentTime < loop.endTime;
            const hasPlayer = playersRef.current && playersRef.current[loop.id];
            return (
              <div key={loop.id} className={`p-1 rounded text-xs ${shouldBePlaying ? 'bg-green-800' : 'bg-gray-800'}`}>
                <div className="truncate">{loop.name}</div>
                <div className="opacity-75">
                  {loop.startTime.toFixed(1)}s - {loop.endTime.toFixed(1)}s
                  {shouldBePlaying && ' (SHOULD PLAY)'}
                  {hasPlayer ? ' [PLAYER OK]' : ' [NO PLAYER]'}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="border-t border-gray-600 pt-2 mt-2">
          <button 
            onClick={() => {
              console.log('=== AUDIO DEBUG INFO ===');
              console.log('Transport state:', window.Tone?.Transport?.state);
              console.log('Transport time:', window.Tone?.Transport?.seconds);
              console.log('Audio context:', window.Tone?.context?.state);
              console.log('Placed loops:', placedLoops);
              console.log('Audio players:', Object.keys(playersRef.current || {}));
              console.log('Players detail:', playersRef.current);
            }}
            className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
          >
            Log Debug Info
          </button>
        </div>
      </div>
    </div>
  );
};

const MusicComposer = ({ showToast }) => {
  const { videoId, assignmentId } = useParams();
  const navigate = useNavigate();

  // Audio engine hook
  const {
    isPlaying,
    currentTime,
    volume,
    isMuted,
    play,
    pause,
    stop,
    seek,
    setMasterVolume,
    toggleMute,
    previewLoop,
    createLoopPlayer,
    scheduleLoops,
    initializeAudio,
    playersRef // Added to get access to players for debugging
  } = useAudioEngine();

  // Component state
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [placedLoops, setPlacedLoops] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLoop, setSelectedLoop] = useState(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  // Resizable panel states - larger initial video size
  const [leftPanelWidth, setLeftPanelWidth] = useState(320);
  const [topPanelHeight, setTopPanelHeight] = useState(400);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingTop, setIsResizingTop] = useState(false);
  
  const containerRef = useRef(null);

  // Handle resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingLeft && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newWidth = e.clientX - containerRect.left;
        const minWidth = 250;
        const maxWidth = containerRect.width * 0.5;
        setLeftPanelWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)));
      }

      if (isResizingTop && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const headerHeight = 80;
        const availableHeight = containerRect.height;
        const mouseYRelativeToContainer = e.clientY - containerRect.top;
        
        const minHeight = 120;
        const maxHeight = availableHeight - 200;
        const newHeight = Math.max(minHeight, Math.min(maxHeight, mouseYRelativeToContainer));
        
        setTopPanelHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizingLeft(false);
      setIsResizingTop(false);
    };

    if (isResizingLeft || isResizingTop) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isResizingLeft ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingLeft, isResizingTop]);

  // Initialize video on mount
  useEffect(() => {
    if (videoId) {
      const video = getVideoById(videoId);
      if (video) {
        setSelectedVideo(video);
      } else {
        showToast('Video not found', 'error');
        navigate('/student');
      }
    }
  }, [videoId, navigate, showToast]);

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges && assignmentId) {
      const autoSave = setTimeout(() => {
        const compositionData = {
          selectedVideo,
          placedLoops,
          submissionNotes,
          videoId,
          lastModified: new Date().toISOString()
        };
        
        localStorage.setItem(`composition-${assignmentId}`, JSON.stringify(compositionData));
        console.log('Auto-saved composition');
      }, 2000);

      return () => clearTimeout(autoSave);
    }
  }, [placedLoops, submissionNotes, hasUnsavedChanges, assignmentId, selectedVideo, videoId]);

  // Load saved composition on mount
  useEffect(() => {
    if (assignmentId) {
      const saved = localStorage.getItem(`composition-${assignmentId}`);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (data.placedLoops) {
            setPlacedLoops(data.placedLoops);
          }
          if (data.submissionNotes) {
            setSubmissionNotes(data.submissionNotes);
          }
        } catch (error) {
          console.error('Error loading saved composition:', error);
        }
      }
    }
  }, [assignmentId]);

  // Initialize audio with user interaction
  const handleInitializeAudio = async () => {
    try {
      await initializeAudio();
      setAudioReady(true);
      showToast('Audio engine ready!', 'success');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      showToast('Failed to initialize audio engine', 'error');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || !audioReady) {
        return;
      }
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          isPlaying ? pause() : handlePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(Math.max(0, currentTime - 5));
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(Math.min(selectedVideo?.duration || 60, currentTime + 5));
          break;
        case 'KeyR':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleRestart();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, currentTime, pause, seek, selectedVideo?.duration, audioReady]);

  // FIXED: Better error handling and retry logic for loop drop
  const handleLoopDrop = useCallback(async (loopData, trackIndex, startTime) => {
    if (!audioReady) {
      showToast('Please initialize audio first', 'error');
      return;
    }

    console.log(`Dropping loop: ${loopData.name} at track ${trackIndex}, time ${startTime}`);

    const newLoop = {
      id: `${loopData.id}-${Date.now()}`,
      originalId: loopData.id,
      name: loopData.name,
      file: loopData.file,
      duration: loopData.duration,
      category: loopData.category,
      color: loopData.color,
      trackIndex,
      startTime,
      endTime: startTime + loopData.duration,
      volume: 1,
      muted: false
    };

    try {
      // FIXED: Create the audio player first and verify it works
      console.log(`Creating audio player for ${newLoop.name} from ${newLoop.file}`);
      const player = await createLoopPlayer(newLoop);
      
      if (!player) {
        throw new Error('Failed to create audio player - no player returned');
      }
      
      // Verify the player is properly loaded
      if (player.isNative) {
        if (!player.loaded && player.audio) {
          // Wait for native audio to load
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Native audio load timeout')), 3000);
            
            if (player.audio.readyState >= 2) {
              clearTimeout(timeout);
              resolve();
            } else {
              player.audio.addEventListener('canplaythrough', () => {
                clearTimeout(timeout);
                resolve();
              }, { once: true });
              
              player.audio.addEventListener('error', () => {
                clearTimeout(timeout);
                reject(new Error('Native audio load error'));
              }, { once: true });
            }
          });
        }
      } else {
        // Tone.js player
        if (!player.loaded) {
          throw new Error('Tone.js player not loaded');
        }
      }
      
      console.log(`Audio player created successfully for ${newLoop.name}`);
      
      // Update placed loops state
      const updatedLoops = [...placedLoops, newLoop];
      setPlacedLoops(updatedLoops);
      setHasUnsavedChanges(true);
      
      // FIXED: Always reschedule all loops after adding a new one
      console.log(`Rescheduling all ${updatedLoops.length} loops after drop`);
      scheduleLoops(updatedLoops, selectedVideo?.duration || 60);
      
      showToast(`Added "${loopData.name}" to track ${trackIndex + 1}`, 'success');
    } catch (error) {
      console.error('Error creating loop player:', error);
      
      // Try to determine the specific issue
      let errorMessage = `Failed to load "${loopData.name}"`;
      if (error.message.includes('timeout')) {
        errorMessage += ' - File loading timeout (check file exists)';
      } else if (error.message.includes('CORS')) {
        errorMessage += ' - File access blocked (CORS issue)';
      } else if (error.message.includes('decode')) {
        errorMessage += ' - Invalid audio format';
      } else {
        errorMessage += ` - ${error.message}`;
      }
      
      showToast(errorMessage, 'error');
      
      // Don't add the loop to the timeline if the player creation failed
      console.log(`Not adding loop to timeline due to player creation failure`);
    }
  }, [createLoopPlayer, showToast, audioReady, placedLoops, scheduleLoops, selectedVideo?.duration]);

  const handleLoopDelete = useCallback((loopId) => {
    console.log(`Deleting loop: ${loopId}`);
    const updatedLoops = placedLoops.filter(loop => loop.id !== loopId);
    setPlacedLoops(updatedLoops);
    setHasUnsavedChanges(true);
    
    if (selectedLoop === loopId) {
      setSelectedLoop(null);
    }
    
    // Reschedule remaining loops
    if (updatedLoops.length > 0) {
      scheduleLoops(updatedLoops, selectedVideo?.duration || 60);
    }
    
    showToast('Loop removed', 'info');
  }, [selectedLoop, showToast, placedLoops, scheduleLoops, selectedVideo?.duration]);

  const handleLoopSelect = useCallback((loopId) => {
    setSelectedLoop(selectedLoop === loopId ? null : loopId);
  }, [selectedLoop]);

  const handleLoopUpdate = useCallback((loopId, updates) => {
    console.log(`Updating loop ${loopId}:`, updates);
    const updatedLoops = placedLoops.map(loop => 
      loop.id === loopId 
        ? { ...loop, ...updates }
        : loop
    );
    setPlacedLoops(updatedLoops);
    setHasUnsavedChanges(true);
    
    // Reschedule loops with updated positions/durations
    scheduleLoops(updatedLoops, selectedVideo?.duration || 60);
  }, [placedLoops, scheduleLoops, selectedVideo?.duration]);

  const handleLoopPreview = useCallback(async (loop) => {
    if (!audioReady) {
      showToast('Please initialize audio first', 'error');
      return;
    }
    
    try {
      await previewLoop(loop);
    } catch (error) {
      console.error('Error previewing loop:', error);
      showToast(`Failed to preview "${loop.name}" - ${error.message}`, 'error');
    }
  }, [previewLoop, audioReady, showToast]);

  const handleRestart = useCallback(() => {
    if (!audioReady) return;
    stop();
    seek(0);
  }, [stop, seek, audioReady]);

  // FIXED: Enhanced play function to ensure proper scheduling and immediate starts
  const handlePlay = useCallback(async () => {
    if (!audioReady) {
      showToast('Audio not ready', 'error');
      return;
    }
    
    try {
      console.log(`Starting playback with ${placedLoops.length} loops`);
      
      // CRITICAL: Always schedule loops before starting playback
      if (placedLoops.length > 0) {
        console.log('Scheduling all loops before play...');
        scheduleLoops(placedLoops, selectedVideo?.duration || 60);
        
        // INCREASED: Longer delay to ensure scheduling completes and immediate starts happen
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      await play();
      console.log('Playback started successfully');
    } catch (error) {
      console.error('Error starting playback:', error);
      showToast('Failed to start playback', 'error');
    }
  }, [audioReady, placedLoops, scheduleLoops, selectedVideo?.duration, play, showToast]);

  // FIXED: Enhanced seek function to reschedule loops
  const handleSeek = useCallback((time) => {
    if (!audioReady) return;
    
    console.log(`Seeking to ${time}s`);
    seek(time);
    
    // If we have loops, reschedule them from the new position
    if (placedLoops.length > 0) {
      console.log('Rescheduling loops after seek...');
      scheduleLoops(placedLoops, selectedVideo?.duration || 60);
    }
  }, [audioReady, seek, placedLoops, scheduleLoops, selectedVideo?.duration]);

  const handleSubmit = async () => {
    if (placedLoops.length === 0) {
      showToast('Please add some music loops before submitting', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const compositionData = {
        selectedVideo,
        placedLoops,
        submissionNotes,
        videoId,
        duration: selectedVideo?.duration || 60,
        submittedAt: new Date().toISOString()
      };

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/students/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentWork: JSON.stringify(compositionData)
        }),
      });

      if (response.ok) {
        showToast('Film score submitted successfully!', 'success');
        setHasUnsavedChanges(false);
        localStorage.removeItem(`composition-${assignmentId}`);
        setTimeout(() => navigate('/student'), 1500);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit composition');
      }
    } catch (error) {
      console.error('Submission error:', error);
      showToast('Failed to submit composition: ' + error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearComposition = () => {
    if (window.confirm('Are you sure you want to clear all loops? This cannot be undone.')) {
      setPlacedLoops([]);
      setSelectedLoop(null);
      setHasUnsavedChanges(true);
      showToast('Composition cleared', 'info');
    }
  };

  const getAudioStatus = () => {
    if (!audioReady) return 'Audio not ready';
    if (placedLoops.length === 0) return 'No loops placed';
    return `${placedLoops.length} loops ready`;
  };

  if (!selectedVideo) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Audio Debug Panel */}
      <AudioDebugPanel 
        placedLoops={placedLoops} 
        isPlaying={isPlaying} 
        currentTime={currentTime}
        playersRef={playersRef}
      />

      {/* Audio Initialization Modal */}
      {!audioReady && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg text-center max-w-md">
            <Play size={48} className="mx-auto mb-4 text-blue-400" />
            <h2 className="text-xl font-semibold mb-4">Initialize Audio Engine</h2>
            <p className="text-gray-300 mb-6">
              Click the button below to start the audio system. This is required for playing and previewing music loops.
            </p>
            <button
              onClick={handleInitializeAudio}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              Start Audio Engine
            </button>
            <p className="text-xs text-gray-400 mt-4">
              Note: Loops will only play when you start playback
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-300 hover:text-white mr-4 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-xl font-semibold">Film Music Composer</h1>
              <p className="text-sm text-gray-400">
                {selectedVideo.title} • {Math.round(currentTime)}s / {Math.round(selectedVideo.duration)}s • {getAudioStatus()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {hasUnsavedChanges && (
              <span className="text-yellow-400 text-sm">● Unsaved</span>
            )}
            
            <button
              onClick={() => setShowNotesPanel(!showNotesPanel)}
              className={`p-2 rounded transition-colors ${
                showNotesPanel ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title="Add notes"
            >
              <FileText size={16} />
            </button>

            <button
              onClick={clearComposition}
              disabled={placedLoops.length === 0}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-500 rounded transition-colors"
            >
              Clear All
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || placedLoops.length === 0}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 rounded transition-colors flex items-center"
            >
              <Save size={16} className="mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content with Resizable Panels */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Panel - Loop Library with resizable width */}
        <div style={{ width: leftPanelWidth }} className="bg-gray-800 border-r border-gray-700 flex flex-col">
          <LoopLibrary
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onLoopPreview={handleLoopPreview}
            onLoopDragStart={() => {}}
          />
        </div>

        {/* Left Resizer - Thin line */}
        <div
          className="w-px bg-gray-500 hover:bg-blue-400 cursor-col-resize transition-colors relative group"
          onMouseDown={() => setIsResizingLeft(true)}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-400/20" />
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Top Panel - Video Player with resizable height */}
          <div className="flex-shrink-0" style={{ height: `${topPanelHeight}px` }}>
            <div className="h-full p-4">
              <div className="h-full">
                <VideoPlayer
                  selectedVideo={selectedVideo}
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  volume={volume}
                  isMuted={isMuted}
                  onSeek={handleSeek}
                  onVolumeChange={setMasterVolume}
                  onToggleMute={toggleMute}
                  maxHeight={topPanelHeight - 32}
                />
              </div>
            </div>
          </div>

          {/* Top Resizer - Thin line */}
          <div
            className="h-px bg-gray-500 hover:bg-blue-400 cursor-row-resize transition-colors relative group flex-shrink-0"
            onMouseDown={() => setIsResizingTop(true)}
          >
            <div className="absolute inset-x-0 -top-1 -bottom-1 group-hover:bg-blue-400/20" />
          </div>

          {/* Bottom Panel - Timeline (takes remaining space) */}
          <div className="flex-1 min-h-0">
            <Timeline
              placedLoops={placedLoops}
              duration={selectedVideo.duration}
              currentTime={currentTime}
              onLoopDrop={handleLoopDrop}
              onLoopDelete={handleLoopDelete}
              onLoopSelect={handleLoopSelect}
              onLoopUpdate={handleLoopUpdate}
              onSeek={handleSeek}
              selectedLoop={selectedLoop}
              zoom={zoom}
            />
          </div>
        </div>

        {/* Notes Panel */}
        {showNotesPanel && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
            <h3 className="text-lg font-semibold mb-3">Submission Notes</h3>
            <textarea
              value={submissionNotes}
              onChange={(e) => {
                setSubmissionNotes(e.target.value);
                setHasUnsavedChanges(true);
              }}
              placeholder="Describe your creative choices, what mood you were trying to create, or any challenges you faced..."
              className="w-full h-40 p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
              maxLength={1000}
            />
            <div className="text-xs text-gray-400 mt-1">
              {submissionNotes.length}/1000 characters
            </div>
            <p className="text-sm text-gray-400 mt-3">
              These notes will be submitted with your composition and help your teacher understand your creative process.
            </p>
          </div>
        )}
      </div>

      {/* Transport Controls - Now part of the flex layout */}
      <div className="flex-shrink-0 z-30">
        <TransportControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={selectedVideo.duration}
          volume={volume}
          isMuted={isMuted}
          onPlay={handlePlay}
          onPause={pause}
          onStop={stop}
          onSeek={handleSeek}
          onVolumeChange={setMasterVolume}
          onToggleMute={toggleMute}
          onRestart={handleRestart}
        />
      </div>
    </div>
  );
};

export default MusicComposer;