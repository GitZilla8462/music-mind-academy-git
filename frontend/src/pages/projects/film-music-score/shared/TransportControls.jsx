import React, { useState, useRef, useCallback } from 'react';
import { Play, Pause, Square, SkipBack, SkipForward, Volume2, VolumeX, RotateCcw,
         Settings, Headphones, Repeat, Activity, Clock } from 'lucide-react';

// Debounce time for play/pause toggle (prevents double-click issues)
const PLAY_PAUSE_DEBOUNCE_MS = 300;

const TransportControls = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  onPlay,
  onPause,
  onStop,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onRestart
}) => {
  const [isLooping, setIsLooping] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);

  // ADDED: Button press states for visual feedback
  const [pressedButton, setPressedButton] = useState(null);

  // Debounce ref for play/pause to prevent double-click issues
  const lastPlayPauseClickRef = useRef(0);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const frames = Math.floor((time % 1) * 30); // 30 fps for film
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${frames.toString().padStart(2, '0')}`;
  };

  // FIXED: Button handlers with visual feedback
  const skipBackward = () => {
    setPressedButton('skipBack');
    const newTime = Math.max(0, currentTime - 10);
    onSeek(newTime);
    setTimeout(() => setPressedButton(null), 150);
  };

  const skipForward = () => {
    setPressedButton('skipForward');
    const newTime = Math.min(duration, currentTime + 10);
    onSeek(newTime);
    setTimeout(() => setPressedButton(null), 150);
  };

  const handleStop = () => {
    setPressedButton('stop');
    onStop();
    setTimeout(() => setPressedButton(null), 150);
  };

  const handleRestart = () => {
    setPressedButton('restart');
    onRestart();
    setTimeout(() => setPressedButton(null), 150);
  };

  const handlePlayPause = useCallback(() => {
    // Debounce: prevent rapid double-clicks from toggling twice
    const now = Date.now();
    if (now - lastPlayPauseClickRef.current < PLAY_PAUSE_DEBOUNCE_MS) {
      console.log('⏸️ Play/pause debounced - ignoring rapid click');
      return;
    }
    lastPlayPauseClickRef.current = now;

    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  }, [isPlaying, onPlay, onPause]);

  return (
    <div 
      className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700"
      // CHROMEBOOK FIX: Force consistent cursor
      style={{ cursor: 'default' }}
    >
      {/* Main Transport Section - Reduced height */}
      <div className="px-6 py-2">
        {/* Single Row Layout */}
        <div className="flex items-center justify-between">
          {/* Left: Time Display and Controls */}
          <div className="flex items-center space-x-4">
            {/* Time Display - Compact */}
            <div className="flex items-center space-x-2">
              <div className="text-lg font-mono text-white bg-gray-800 px-3 py-1 rounded border border-gray-600">
                {formatTime(currentTime)}
              </div>
              <div className="text-gray-400">/</div>
              <div className="text-sm font-mono text-gray-300 bg-gray-800 px-2 py-1 rounded border border-gray-600">
                {formatTime(duration)}
              </div>
            </div>

            {/* Secondary Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRestart}
                className={`p-1.5 rounded transition-all duration-200 group ${
                  pressedButton === 'restart'
                    ? 'bg-gray-600 text-white scale-95'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title="Restart from beginning"
              >
                <RotateCcw size={16} className={pressedButton === 'restart' ? '' : 'group-hover:rotate-180 transition-transform duration-300'} />
              </button>

              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`p-1.5 rounded transition-all duration-200 ${
                  isLooping 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title="Loop playback"
              >
                <Repeat size={16} />
              </button>

              <button
                onClick={() => setMetronomeEnabled(!metronomeEnabled)}
                className={`p-1.5 rounded transition-all duration-200 ${
                  metronomeEnabled 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title="Metronome"
              >
                <Activity size={14} />
              </button>
            </div>
          </div>

          {/* Center: Main Transport Buttons - Compact with FIXED highlighting */}
          <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={skipBackward}
              className={`p-2 rounded transition-all duration-150 ${
                pressedButton === 'skipBack'
                  ? 'bg-gray-600 text-white scale-95'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              title="Skip back 10s"
            >
              <SkipBack size={18} />
            </button>

            <button
              onClick={handlePlayPause}
              className={`p-3 rounded-lg transition-all duration-150 transform ${
                isPlaying
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30 hover:scale-105'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 hover:scale-105'
              }`}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>

            <button
              onClick={handleStop}
              className={`p-2 rounded transition-all duration-150 ${
                pressedButton === 'stop'
                  ? 'bg-red-600 text-white scale-95'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              title="Stop"
            >
              <Square size={18} />
            </button>

            <button
              onClick={skipForward}
              className={`p-2 rounded transition-all duration-150 ${
                pressedButton === 'skipForward'
                  ? 'bg-gray-600 text-white scale-95'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              title="Skip forward 10s"
            >
              <SkipForward size={18} />
            </button>
          </div>

          {/* Right: Volume Controls - Compact */}
          <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg p-2">
            <button
              onClick={onToggleMute}
              className={`p-1.5 rounded transition-all duration-200 ${
                isMuted 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-24 h-1 bg-gray-600 rounded-lg appearance-none slider cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${volume * 100}%, #4B5563 ${volume * 100}%, #4B5563 100%)`
              }}
              title="Master volume"
            />
            <span className="text-xs text-gray-400 font-mono w-8">
              {Math.round(volume * 100)}%
            </span>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`p-1.5 rounded transition-all duration-200 ${
                showAdvanced 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              title="Advanced settings"
            >
              <Settings size={14} />
            </button>
          </div>
        </div>

        {/* Advanced Controls Panel - Compact */}
        {showAdvanced && (
          <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-600 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Playback Rate */}
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-400">Speed:</span>
                  <select className="bg-gray-700 text-white text-xs rounded px-1 py-0.5 border border-gray-600">
                    <option value="0.5">0.5x</option>
                    <option value="0.75">0.75x</option>
                    <option value="1" selected>1.0x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2.0x</option>
                  </select>
                </div>

                {/* Pitch */}
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-400">Pitch:</span>
                  <input 
                    type="range" 
                    min="-12" 
                    max="12" 
                    defaultValue="0" 
                    className="w-16 h-1 bg-gray-600 rounded-lg appearance-none"
                  />
                  <span className="text-xs text-gray-400 w-6">0st</span>
                </div>

                {/* Pre-roll */}
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-400">Pre-roll:</span>
                  <select className="bg-gray-700 text-white text-xs rounded px-1 py-0.5 border border-gray-600">
                    <option value="0">None</option>
                    <option value="1">1 sec</option>
                    <option value="2">2 sec</option>
                    <option value="4">4 sec</option>
                  </select>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                  <span className="text-gray-400">
                    {isPlaying ? 'Playing' : 'Stopped'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1 text-gray-400">
                  <Clock size={12} />
                  <span>BPM: 120</span>
                </div>
                
                <div className="flex items-center space-x-1 text-gray-400">
                  <Headphones size={12} />
                  <span>24-bit/48kHz</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts - Compact */}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
          <div className="flex items-center space-x-3">
            <span>Spacebar: Play/Pause</span>
            <span>←→: Seek ±10s</span>
            <span>Home: Restart</span>
            <span>M: Mute</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <span>Film scoring transport controls</span>
            <div className="w-1 h-1 bg-blue-500 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportControls;