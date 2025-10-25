// File: /src/lessons/film-music-project/lesson1/activities/SoundEffectsActivity.jsx
// Bonus activity: Add sound effects to completed composition
// NO TIME LIMIT - Teacher controls when to advance

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MusicComposer from "../../../../pages/projects/film-music-score/composer/MusicComposer";
import { Sparkles, Volume2, VolumeX, Minimize2, Maximize2 } from 'lucide-react';

const SoundEffectsActivity = ({ onComplete, viewMode = false }) => {
  const navigate = useNavigate();
  const [placedLoops, setPlacedLoops] = useState([]);
  const [videoDuration, setVideoDuration] = useState(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');
  const [isMinimizedModal, setIsMinimizedModal] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceVolume, setVoiceVolume] = useState(0.5);
  const hasSpokenRef = useRef(false);

  // Load School Beneath composition on mount
  useEffect(() => {
    const saved = localStorage.getItem('school-beneath-composition');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setPlacedLoops(data.placedLoops || []);
        setVideoDuration(data.videoDuration || 60);
        setIsLoadingVideo(false);
        console.log('Loaded School Beneath composition for sound effects:', data);
      } catch (error) {
        console.error('Error loading composition:', error);
        setVideoDuration(60);
        setIsLoadingVideo(false);
      }
    } else {
      console.warn('No School Beneath composition found!');
      setVideoDuration(60);
      setIsLoadingVideo(false);
    }
  }, []);

  // Voice narration on mount
  useEffect(() => {
    if (!isLoadingVideo && !hasSpokenRef.current && voiceEnabled) {
      const message = "Great job finishing your reflection! For the remainder of class, you'll get to add sound effects to your trailer. Sound effects like electric shocks, risers, and wooshes can make your film score even more exciting and realistic. Your music is already loaded - now add sound effects on top!";
      
      setTimeout(() => {
        speakText(message);
        hasSpokenRef.current = true;
      }, 1000);
    }
  }, [isLoadingVideo, voiceEnabled]);

  // Text-to-speech function
  const speakText = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = voiceVolume;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name === 'Samantha' || 
      voice.name === 'Google US English' ||
      voice.name === 'Google US English Female' ||
      (voice.name.includes('Microsoft') && voice.lang === 'en-US') ||
      voice.name.includes('Zira') ||
      (voice.lang === 'en-US' && voice.name.includes('United States'))
    ) || voices.find(voice => voice.lang.startsWith('en-US'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
      console.log('Using voice:', preferredVoice.name, preferredVoice.lang);
    }
    
    window.speechSynthesis.speak(utterance);
  };

  // Callbacks for loop management
  const handleLoopPlaced = (loopData, trackIndex, startTime) => {
    console.log('Loop/Sound effect placed:', loopData, trackIndex, startTime);
    
    const newLoop = {
      id: `${loopData.id}-${Date.now()}`,
      originalId: loopData.id,
      name: loopData.name,
      file: loopData.file,
      duration: loopData.duration,
      category: loopData.category,
      mood: loopData.mood,
      type: loopData.type, // Will be 'soundEffect' for sound effects
      color: loopData.color,
      trackIndex,
      startTime,
      endTime: startTime + loopData.duration,
      volume: 1,
      muted: false
    };
    
    setPlacedLoops(prev => [...prev, newLoop]);
  };

  const handleLoopDeleted = (loopId) => {
    console.log('Loop deleted:', loopId);
    setPlacedLoops(prev => prev.filter(loop => loop.id !== loopId));
  };

  const handleLoopUpdated = (loopId, updates) => {
    console.log('Loop updated:', loopId, updates);
    setPlacedLoops(prev => 
      prev.map(loop => loop.id === loopId ? { ...loop, ...updates } : loop)
    );
  };

  // Save composition (overwrites original School Beneath)
  const handleSaveProgress = () => {
    const musicLoops = placedLoops.filter(l => l.type !== 'soundEffect');
    const soundEffectLoops = placedLoops.filter(l => l.type === 'soundEffect');
    
    const compositionData = {
      title: 'The School Beneath',
      placedLoops: placedLoops,
      savedAt: new Date().toISOString(),
      loopCount: musicLoops.length,
      soundEffectCount: soundEffectLoops.length,
      videoDuration: videoDuration,
      requirements: {} // Keep empty, requirements were for original assignment
    };
    
    localStorage.setItem('school-beneath-composition', JSON.stringify(compositionData));
    console.log('Composition with sound effects saved:', compositionData);
    
    setSaveMessage('[OK] Saved with sound effects!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // Submit (can be resubmitted)
  const handleSubmit = () => {
    handleSaveProgress(); // Save first
    
    setSaveMessage('[OK] Submitted! Great work!');
    setTimeout(() => {
      setSaveMessage('');
    }, 2000);
  };

  // Count loops and sound effects
  const musicLoops = placedLoops.filter(l => l.type !== 'soundEffect');
  const soundEffectLoops = placedLoops.filter(l => l.type === 'soundEffect');

  if (isLoadingVideo || videoDuration === null) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg">Loading your composition...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-gray-900">
      {/* Floating Instructional Modal */}
      {!isMinimizedModal && (
        <div
          style={{
            position: 'fixed',
            right: '20px',
            bottom: '20px',
            width: '380px',
            maxHeight: '500px',
            zIndex: 1000,
            pointerEvents: 'auto'
          }}
          className="bg-white rounded-lg shadow-2xl border-4 border-purple-500 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 flex items-center justify-between">
            <div className="text-white font-semibold text-sm flex items-center gap-2">
              <Sparkles size={16} className="animate-pulse" />
              <span>🎬 Bonus: Add Sound Effects!</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Voice controls */}
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className="p-1.5 bg-white/20 rounded hover:bg-white/30 transition-colors"
                title={voiceEnabled ? "Mute voice" : "Unmute voice"}
              >
                {voiceEnabled ? <Volume2 size={14} className="text-white" /> : <VolumeX size={14} className="text-white" />}
              </button>
              
              <button
                onClick={() => setIsMinimizedModal(true)}
                className="p-1.5 bg-white/20 rounded hover:bg-white/30 transition-colors"
                title="Minimize"
              >
                <Minimize2 size={14} className="text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Main message */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border-2 border-purple-200">
              <div className="text-sm text-gray-800 mb-2 font-semibold leading-relaxed">
                🎉 Great job finishing your reflection!
              </div>
              <div className="text-xs text-gray-700 leading-relaxed">
                For the remainder of class, you'll get to add <strong>sound effects</strong> to your trailer.
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
              <div className="text-xs text-gray-800 leading-relaxed space-y-2">
                <div className="font-bold mb-2 text-blue-900 text-sm">Sound effects you can add:</div>
                <ul className="space-y-1 text-xs">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 font-bold">⚡</span>
                    <span><strong>Electric shocks & impacts</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold">📈</span>
                    <span><strong>Risers</strong> to build tension</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">💨</span>
                    <span><strong>Wooshes</strong> for movement</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* How to use */}
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3">
              <div className="text-xs text-gray-800 leading-relaxed">
                <div className="font-bold mb-2 text-green-900">How to add sound effects:</div>
                <ol className="space-y-1 text-xs list-decimal list-inside">
                  <li>Look for the <strong>☑️ Show Sound Effects</strong> checkbox in the Loop Library</li>
                  <li>Check it to see all available sound effects</li>
                  <li>Drag sound effects onto your timeline just like music loops</li>
                  <li>Place them at the perfect moments in your video!</li>
                </ol>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-3">
              <div className="text-xs text-gray-700 space-y-1">
                <div className="flex justify-between">
                  <span>♪ Music Loops:</span>
                  <span className="font-bold">{musicLoops.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>🔊 Sound Effects:</span>
                  <span className="font-bold text-purple-600">{soundEffectLoops.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with action buttons */}
          <div className="border-t-2 border-gray-200 p-3 bg-white space-y-2">
            {saveMessage && (
              <div className="text-xs text-green-600 font-semibold text-center animate-pulse mb-2">
                {saveMessage}
              </div>
            )}
            
            <button
              onClick={handleSaveProgress}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
            >
              💾 Save Progress
            </button>
            
            <button
              onClick={handleSubmit}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
            >
              [OK] Submit (can resubmit)
            </button>
          </div>
        </div>
      )}

      {/* Minimized modal */}
      {isMinimizedModal && (
        <div
          style={{
            position: 'fixed',
            right: '20px',
            bottom: '20px',
            width: '280px',
            zIndex: 1000,
            pointerEvents: 'auto'
          }}
          className="bg-white rounded-lg shadow-2xl border-4 border-purple-500"
        >
          <div className="bg-purple-500 px-4 py-2 flex items-center justify-between">
            <div className="text-white font-semibold text-sm flex items-center gap-2">
              <Sparkles size={14} />
              <span>Sound Effects Activity</span>
            </div>
            <button
              onClick={() => setIsMinimizedModal(false)}
              className="p-1 bg-white/20 rounded hover:bg-white/30 transition-colors"
            >
              <Maximize2 size={14} className="text-white" />
            </button>
          </div>
          <div className="px-4 py-2 text-sm text-gray-600">
            <div className="flex justify-between text-xs">
              <span>♪ Loops: {musicLoops.length}</span>
              <span>🔊 SFX: {soundEffectLoops.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-800 text-white border-b border-gray-700 flex-shrink-0">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <h2 className="text-sm font-bold whitespace-nowrap">
                🎬 The School Beneath - Add Sound Effects
              </h2>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-xs text-gray-400">
                ♪ {musicLoops.length} loops | 🔊 {soundEffectLoops.length} SFX
              </div>

              {saveMessage && (
                <div className="text-xs text-green-400 font-semibold animate-pulse">
                  {saveMessage}
                </div>
              )}

              <button
                onClick={handleSaveProgress}
                className="px-4 py-1.5 text-sm rounded font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Progress
              </button>

              <button
                onClick={handleSubmit}
                className="px-4 py-1.5 text-sm rounded font-medium transition-colors bg-green-600 hover:bg-green-700 text-white"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Composer */}
      <div className="flex-1 min-h-0">
        <MusicComposer
          onLoopDropCallback={handleLoopPlaced}
          onLoopDeleteCallback={handleLoopDeleted}
          onLoopUpdateCallback={handleLoopUpdated}
          tutorialMode={false}
          preselectedVideo={{
            id: 'school-beneath',
            title: 'The School Beneath',
            duration: videoDuration,
            videoPath: '/lessons/videos/film-music-loop-project/SchoolMystery.mp4'
          }}
          showSoundEffects={true}  // CRITICAL: Enables sound effects checkbox
          hideHeader={true}
          hideSubmitButton={true}
          isLessonMode={true}
          showToast={(msg, type) => console.log(msg, type)}
          initialPlacedLoops={placedLoops}
          readOnly={false}
        />
      </div>
    </div>
  );
};

export default SoundEffectsActivity;