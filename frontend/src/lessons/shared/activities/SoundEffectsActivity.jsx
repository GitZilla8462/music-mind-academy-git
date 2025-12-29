// File: /src/lessons/film-music-project/lesson1/activities/SoundEffectsActivity.jsx
// Bonus activity: Add sound effects to completed composition
// UPDATED: isSessionMode prop to hide timer for students in session mode
// UPDATED: Firebase saving for compositions + AUTO-SAVE every 5 seconds

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MusicComposer from "../../../pages/projects/film-music-score/composer/MusicComposer";
import { saveCompositionToServer } from '../../film-music-project/lesson1/compositionServerUtils';
import { Sparkles } from 'lucide-react';
import { useAutoSave, AutoSaveIndicator } from '../../../hooks/useAutoSave.jsx';

const SoundEffectsActivity = ({ 
  onComplete, 
  viewMode = false, 
  lessonStartTime = null,
  isSessionMode = false  // NEW: Hide timer in session mode
}) => {
  const navigate = useNavigate();
  const [placedLoops, setPlacedLoops] = useState([]);
  const [videoDuration, setVideoDuration] = useState(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceVolume, setVoiceVolume] = useState(0.5);
  const hasSpokenRef = useRef(false);
  
  // Student ID for auto-save
  const [studentId, setStudentId] = useState('');
  
  useEffect(() => {
    let id = localStorage.getItem('anonymous-student-id');
    if (!id) {
      id = `Student-${Math.floor(100000 + Math.random() * 900000)}`;
      localStorage.setItem('anonymous-student-id', id);
    }
    setStudentId(id);
  }, []);

  // Auto-save composition with sound effects every 5 seconds
  const compositionData = {
    placedLoops,
    videoDuration,
    timestamp: Date.now()
  };
  
  const { lastSaved, isSaving } = useAutoSave(
    studentId,
    'school-beneath',  // Same key as original composition
    compositionData,
    10000  // 10 seconds
  );

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
      const message = "Great job on your composition! For the remaining time, you can explore and add sound effects to your trailer. Sound effects like electric shocks, risers, and wooshes can make your film score even more exciting and realistic. Your music is already loaded, now add sound effects on top!";
      
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

  // UPDATED: Save composition to both localStorage and Firebase
  const handleSaveProgress = async () => {
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
    
    // Save to Firebase
    try {
      const result = await saveCompositionToServer(
        {
          ...compositionData,
          studentName: 'Student',
        },
        'sound-effects'
      );
      console.log('âœ… Composition saved to Firebase:', result.shareCode);
      setSaveMessage('Saved!');
    } catch (error) {
      console.error('âŒ Firebase save failed:', error);
      setSaveMessage('Saved locally!');
    }
    
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // UPDATED: Submit with Firebase saving
  const handleSubmit = async () => {
    await handleSaveProgress(); // Save first
    
    setSaveMessage('Submitted!');
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

  // Left panel content (similar to SchoolBeneathActivity structure)
  const assignmentPanelContent = (
    <div className="h-full bg-gray-800 text-white p-2 flex flex-col gap-2 overflow-y-auto">
      {/* Title - BIG */}
      <div className="text-center">
        <h3 className="font-bold text-base mb-1 flex items-center justify-center gap-1">
          <Sparkles size={16} className="text-purple-400" />
          <span>Bonus Activity</span>
        </h3>
        <p className="text-xs text-gray-300">Explore and add sound effects for the remaining time</p>
      </div>

      {/* Action Buttons at TOP */}
      <div className="space-y-1">
        {saveMessage && (
          <div className="text-[9px] text-green-400 font-semibold text-center bg-green-900/20 py-1 rounded">
            {saveMessage}
          </div>
        )}
        
        <button
          onClick={handleSaveProgress}
          className="w-full bg-blue-600 text-white px-2 py-1.5 rounded text-xs font-semibold hover:bg-blue-700 transition-colors"
        >
          Save
        </button>
        
        <button
          onClick={handleSubmit}
          className="w-full bg-green-600 text-white px-2 py-1.5 rounded text-xs font-semibold hover:bg-green-700 transition-colors"
        >
          Submit
        </button>
      </div>

      {/* Sound effects available */}
      <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-2">
        <div className="text-[9px] text-gray-300 leading-relaxed space-y-1">
          <div className="font-bold mb-1 text-blue-300 text-[10px]">Sound effects you can add:</div>
          <ul className="space-y-0.5 text-[9px]">
            <li className="flex items-start gap-1">
              <span className="text-yellow-400">-</span>
              <span><strong>Electric shocks & impacts</strong></span>
            </li>
            <li className="flex items-start gap-1">
              <span className="text-purple-400">-</span>
              <span><strong>Risers</strong> to build tension</span>
            </li>
            <li className="flex items-start gap-1">
              <span className="text-blue-400">-</span>
              <span><strong>Wooshes</strong> for movement</span>
            </li>
          </ul>
        </div>
      </div>

      {/* How to add */}
      <div className="bg-green-900/30 border border-green-500 rounded-lg p-2">
        <div className="text-[9px] text-gray-300 leading-relaxed">
          <div className="font-bold mb-1 text-green-300 text-[10px]">How to add sound effects:</div>
          <ol className="space-y-0.5 text-[9px] list-decimal list-inside">
            <li>Look for <strong>Show Sound Effects</strong> checkbox</li>
            <li>Check it to see available sound effects</li>
            <li>Drag onto timeline like music loops</li>
            <li>Place at perfect moments in your video!</li>
          </ol>
        </div>
      </div>

      {/* Stats - Sound Effects Only */}
      <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-2">
        <div className="text-[9px] text-gray-300 flex justify-between">
          <span>Sound Effects Added:</span>
          <span className="font-bold text-purple-400 text-sm">{soundEffectLoops.length}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Activity Header - Shows content in sandbox mode, empty in lesson mode */}
      <div className="bg-gray-800 text-white border-b border-gray-700 flex-shrink-0">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between gap-3">
            {/* Show content only if NOT in lesson mode (standalone/sandbox) */}
            {!lessonStartTime ? (
              <>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <h2 className="text-sm font-bold whitespace-nowrap">
                    The School Beneath - Add Sound Effects
                  </h2>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-xs text-gray-400">
                    {soundEffectLoops.length} SFX added
                  </div>
                </div>
              </>
            ) : (
              // Empty when in lesson mode (behind navigation header)
              <div></div>
            )}
          </div>
        </div>
      </div>

      {/* Main Composer with Left Panel */}
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
          assignmentPanelContent={assignmentPanelContent}
        />
      </div>
    </div>
  );
};

export default SoundEffectsActivity;