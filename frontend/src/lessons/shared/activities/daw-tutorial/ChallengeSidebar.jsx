// File: /src/lessons/film-music-project/lesson1/activities/daw-tutorial/ChallengeSidebar.jsx
// Fixed left sidebar for DAW tutorial challenges - matches SchoolBeneathActivity pattern
// UPDATED: Hide timer in session mode for students

import React from 'react';
import { Volume2, VolumeX, HelpCircle, SkipForward, CheckCircle, XCircle } from 'lucide-react';

const ChallengeSidebar = ({
  currentChallenge,
  currentChallengeIndex,
  totalChallenges,
  progressPercent,
  userAnswer,
  feedback,
  showHint,
  setShowHint,
  showExplanation,
  voiceEnabled,
  setVoiceEnabled,
  voiceVolume,
  setVoiceVolume,
  onMultipleChoiceAnswer,
  onSkipChallenge,
  showExplorationMode = false,
  timeRemaining = 0,
  formatTime = (ms) => '0:00',
  isSessionMode = false  // NEW: Hide timer in session mode
}) => {
  
  console.log('🎨 ChallengeSidebar RENDER:', {
    showExplorationMode,
    currentChallengeIndex,
    hasCurrentChallenge: !!currentChallenge,
    challengeType: currentChallenge?.type,
    isSessionMode  // NEW: Log session mode
  });
  
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVoiceVolume(newVolume);
    
    console.log('Volume changed to:', newVolume);
    
    // If currently speaking, cancel and restart with new volume
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      
      setTimeout(() => {
        if (voiceEnabled && currentChallenge) {
          const utterance = new SpeechSynthesisUtterance(currentChallenge.question);
          utterance.volume = newVolume;
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(voice => 
            voice.lang === 'en-US' && (
              voice.name.includes('Google US English') ||
              voice.name.includes('Microsoft David') ||
              voice.name.includes('Microsoft Mark') ||
              voice.name.includes('Samantha') ||
              voice.name.includes('Alex')
            )
          ) || voices.find(voice => voice.lang === 'en-US') || voices.find(voice => voice.lang.startsWith('en'));
          
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }
          
          window.speechSynthesis.speak(utterance);
          console.log('Restarted speech with new volume:', newVolume);
        }
      }, 100);
    }
  };

  const handleMuteToggle = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setVoiceEnabled(!voiceEnabled);
    console.log('Voice toggled:', !voiceEnabled);
  };

  // EXPLORATION MODE VIEW - HIDE TIMER IN SESSION MODE
  if (showExplorationMode) {
    // Speak the message when exploration mode first shows
    React.useEffect(() => {
      if ('speechSynthesis' in window && voiceEnabled) {
        // Small delay to ensure component is mounted
        const timer = setTimeout(() => {
          const message = "Tutorial Complete! Excellent work! Use the remaining time to explore and create music freely.";
          const utterance = new SpeechSynthesisUtterance(message);
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.volume = voiceVolume;
          
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(voice => 
            voice.lang === 'en-US' && (
              voice.name.includes('Google US English') ||
              voice.name.includes('Microsoft David') ||
              voice.name.includes('Microsoft Mark') ||
              voice.name.includes('Samantha') ||
              voice.name.includes('Alex')
            )
          ) || voices.find(voice => voice.lang === 'en-US') || voices.find(voice => voice.lang.startsWith('en'));
          
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }
          
          window.speechSynthesis.speak(utterance);
        }, 300);
        
        return () => clearTimeout(timer);
      }
    }, []); // Empty dependency array so it only runs once
    
    return (
      <div className="h-full bg-white text-gray-800 p-4 flex flex-col gap-4 overflow-y-auto border-4 border-orange-600">
        {/* Header */}
        <div className="text-center bg-orange-600 -m-4 mb-0 p-4 rounded-t-lg">
          <div className="text-2xl font-bold mb-2 text-white">🎉</div>
          <h2 className="text-lg font-bold mb-1 text-white">Tutorial Complete!</h2>
        </div>

        {/* Main Message in White Area */}
        <div className="bg-white rounded-lg p-4 text-center">
          <p className="text-base text-gray-800 leading-relaxed">
            Excellent work! Use the remaining time to explore and create music freely.
          </p>
        </div>

        {/* Timer Display - ONLY SHOW IN SELF-GUIDED MODE */}
        {!isSessionMode && (
          <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-4 text-center">
            <div className="text-[10px] text-gray-600 mb-1 font-semibold">
              Time Remaining:
            </div>
            <div className="text-4xl font-bold text-green-600 mb-1">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-[9px] text-gray-500">
              The DAW is fully unlocked - experiment!
            </div>
          </div>
        )}
      </div>
    );
  }

  // CHALLENGE VIEW
  return (
    <div className="h-full bg-white text-gray-800 flex flex-col overflow-hidden border-4 border-orange-600">
      {/* Progress Bar */}
      <div className="h-2 bg-gray-200 flex-shrink-0">
        <div 
          className="h-full bg-blue-400 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Header Section */}
      <div className="bg-orange-600 px-3 py-2 border-b border-orange-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-white">Challenge Question</h3>
          <div className="flex items-center gap-1">
            {/* Voice Volume Slider */}
            <div className="flex items-center gap-1 bg-white/20 rounded px-2 py-1">
              <Volume2 size={12} className="text-white flex-shrink-0" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={voiceVolume}
                onChange={handleVolumeChange}
                className="w-12 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #fff 0%, #fff ${voiceVolume * 100}%, rgba(255,255,255,0.2) ${voiceVolume * 100}%, rgba(255,255,255,0.2) 100%)`
                }}
                title={`Voice volume: ${Math.round(voiceVolume * 100)}%`}
              />
            </div>

            {/* Mute Toggle */}
            <button
              onClick={handleMuteToggle}
              className={`p-1 rounded transition-colors ${
                voiceEnabled ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'
              }`}
              title={voiceEnabled ? "Mute voice" : "Unmute voice"}
            >
              {voiceEnabled ? <Volume2 size={14} className="text-white" /> : <VolumeX size={14} className="text-white" />}
            </button>

            {/* Hint Toggle */}
            <button
              onClick={() => setShowHint(!showHint)}
              className="p-1 bg-yellow-500 rounded hover:bg-yellow-600 transition-colors"
              title="Show hint"
            >
              <HelpCircle size={14} className="text-white" />
            </button>
          </div>
        </div>

        {/* Challenge Progress */}
        <div className="text-[10px] text-white">
          Challenge {currentChallengeIndex + 1} of {totalChallenges}
          {currentChallenge?.section && (
            <span className="ml-2 text-orange-100">• {currentChallenge.section}</span>
          )}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white">
        {/* Question */}
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
          <p className="text-sm leading-relaxed text-gray-800">
            {currentChallenge?.question}
          </p>
        </div>

        {/* Multiple Choice Options */}
        {currentChallenge?.type === 'multiple-choice' && (
          <div className="space-y-2">
            {currentChallenge.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => onMultipleChoiceAnswer(choice, index)}
                disabled={feedback !== null && userAnswer === choice}
                className={`w-full px-3 py-2 rounded-lg border-2 text-left text-xs font-medium transition-all ${
                  userAnswer === choice
                    ? feedback?.type === 'success'
                      ? 'border-green-400 bg-green-600/90 text-white'
                      : 'border-red-400 bg-red-600/90 text-white'
                    : 'border-gray-400 hover:border-blue-400 bg-gray-700/80 hover:bg-blue-700/80 text-white'
                } ${feedback !== null && userAnswer === choice ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {choice}
              </button>
            ))}
          </div>
        )}

        {/* Interactive Task Instructions */}
        {currentChallenge?.type === 'interactive-task' && (
          <div className="bg-blue-600/90 border-2 border-blue-400 rounded-lg p-3">
            <p className="text-white text-xs font-medium">
              {currentChallenge.instruction}
            </p>
          </div>
        )}

        {/* Identify-Click Instructions */}
        {currentChallenge?.type === 'identify-click' && (
          <div className="bg-blue-600/90 border-2 border-blue-400 rounded-lg p-3">
            <p className="text-white text-xs font-medium">
              {currentChallenge.instruction}
            </p>
          </div>
        )}

        {/* Hint Section */}
        {showHint && currentChallenge?.hint && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
            <div className="text-xs text-yellow-900">
              <span className="font-semibold">💡 Hint:</span> {currentChallenge.hint}
            </div>
          </div>
        )}

        {/* Feedback Section */}
        {feedback && (
          <div className={`border-2 rounded-lg p-3 flex items-start gap-2 ${
            feedback.type === 'success' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
            ) : (
              <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
            )}
            <span className={`text-xs font-medium ${
              feedback.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              {feedback.message}
            </span>
          </div>
        )}

        {/* Explanation Section */}
        {showExplanation && currentChallenge?.explanation && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
            <div className="text-xs text-green-900">
              <span className="font-semibold">📚 Explanation:</span> {currentChallenge.explanation}
            </div>
          </div>
        )}
      </div>

      {/* Skip Button (if allowed) */}
      {currentChallenge?.allowSkip && (
        <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onSkipChallenge}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs font-medium"
          >
            <SkipForward size={14} />
            Skip Challenge
          </button>
        </div>
      )}
    </div>
  );
};

export default ChallengeSidebar;