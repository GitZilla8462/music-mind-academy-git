// File: /src/lessons/film-music-project/lesson1/activities/two-stars-and-a-wish/ReflectionModal.jsx
// UPDATED: Top-left positioning with minimize functionality
// Steps: 1=choose type, 2=listen & share, 3=star1, 4=star2, 5=wish, 6=summary
// UPDATED: Step 6 now has READ ALOUD banner at top, submit button at bottom

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Star, Sparkles, Volume2, VolumeX, HelpCircle, Minimize2, Maximize2 } from 'lucide-react';
import { SELF_REFLECTION_PROMPTS, PARTNER_REFLECTION_OPTIONS } from './reflectionPrompts';

const ReflectionModal = ({ compositionData, onComplete, viewMode = false, isSessionMode = false }) => {
  // Steps: 1=choose type, 2=listen & share, 3=star1, 4=star2, 5=wish, 6=summary
  const [currentStep, setCurrentStep] = useState(viewMode ? 6 : 1);
  const [reflectionData, setReflectionData] = useState({
    reviewType: null,
    partnerName: '',
    star1: '',
    star2: '',
    wish: '',
    submittedAt: null
  });

  // For partner reflection dropdowns
  const [customInputs, setCustomInputs] = useState({
    star1: false,
    star2: false,
    wish: false
  });

  // Voice and UI state
  const [voiceEnabled, setVoiceEnabled] = useState(false); // Disabled by default
  const [voiceVolume, setVoiceVolume] = useState(0.5);
  const [showHint, setShowHint] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const hasSpokenRef = useRef(false);

  // Load saved reflection if in view mode
  useEffect(() => {
    if (viewMode) {
      const saved = localStorage.getItem('school-beneath-reflection');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setReflectionData(data);
        } catch (error) {
          console.error('Error loading reflection:', error);
        }
      }
    }
  }, [viewMode]);

  // Voice synthesis with better voice selection
  const speak = (text) => {
    if (!voiceEnabled || !text) return;
    
    if ('speechSynthesis' in window) {
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
      } else {
        console.log('Using default voice');
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Speak on step change
  useEffect(() => {
    const partnerName = reflectionData.partnerName || 'your partner';
    const reviewTarget = reflectionData.reviewType === 'self' ? 'your' : `${partnerName}'s`;
    
    const messages = {
      1: "Whose composition are you reviewing? Choose whether you'll reflect on your own work or a friend's composition.",
      2: reflectionData.reviewType === 'self'
        ? "Now, listen to your entire film score from beginning to end. Pay attention to: How the music tools, such as timeline, tracks, and volume, were used. How the loops are timed with the video. And the overall sound and mood of the music."
        : `Now it's time to share! First, share your score with ${partnerName} so they can see and hear your work. Then, listen to ${partnerName}'s entire film score from beginning to end. Pay attention to: How the music tools were used. How the loops are timed with the video. And the overall sound and mood of the music.`,
      3: "Star 1: Think about what went well with using the DAW tools. What did you do well?",
      4: "Star 2: Think about what worked well with the loop timing and music sound.",
      5: "Now for the Wish: What do you want to try or improve next time?",
      6: reflectionData.reviewType === 'self' 
        ? "Here's your complete reflection summary! Now read your reflection out loud to yourself or share it with a neighbor."
        : `Here's your complete reflection summary! Now read your feedback out loud to ${partnerName}.`
    };

    const message = messages[currentStep];
    if (message && !isMinimized) {
      hasSpokenRef.current = false;
      
      setTimeout(() => {
        speak(message);
        hasSpokenRef.current = true;
      }, 500);
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentStep, reflectionData.reviewType, reflectionData.partnerName, isMinimized]);

  // Step navigation
  const goToNextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleReviewTypeSelection = (type) => {
    setReflectionData(prev => ({ ...prev, reviewType: type }));
  };

  const handlePartnerNameChange = (e) => {
    setReflectionData(prev => ({ ...prev, partnerName: e.target.value }));
  };

  const handleContinueFromStep1 = () => {
    if (reflectionData.reviewType === 'partner' && !reflectionData.partnerName.trim()) {
      alert('Please enter your partner\'s name');
      return;
    }
    goToNextStep();
  };

  const handleDropdownChange = (field, value) => {
    if (value === 'Custom...') {
      setCustomInputs(prev => ({ ...prev, [field]: true }));
      setReflectionData(prev => ({ ...prev, [field]: '' }));
    } else {
      setCustomInputs(prev => ({ ...prev, [field]: false }));
      setReflectionData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleTextChange = (field, value) => {
    setReflectionData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitQuestion = (field) => {
    if (!reflectionData[field].trim()) {
      alert('Please answer the question before continuing');
      return;
    }
    goToNextStep();
  };

  const handleFinalSubmit = () => {
    const finalData = {
      ...reflectionData,
      submittedAt: new Date().toISOString()
    };

    // Save reflection data to localStorage
    localStorage.setItem('school-beneath-reflection', JSON.stringify(finalData));
    console.log('Reflection saved:', finalData);

    goToNextStep();
  };

  const handleSubmitReflection = () => {
    // This is called from the summary step (step 6)
    // Reflection is already saved from handleFinalSubmit
    // Now we call onComplete to transition to the game
    console.log('Submit Reflection clicked - transitioning to game');
    onComplete();
  };

  const handleVolumeChange = (e) => {
    e.stopPropagation();
    const newVolume = parseFloat(e.target.value);
    setVoiceVolume(newVolume);
    
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      
      setTimeout(() => {
        speak("Volume adjusted");
      }, 100);
    }
  };

  const handleMuteToggle = (e) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const toggleMinimize = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsMinimized(!isMinimized);
  };

  // If minimized, show small header only
  if (isMinimized) {
    return (
      <div className="fixed top-4 left-4 z-40">
        <button
          onClick={toggleMinimize}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2"
        >
          <Maximize2 size={16} />
          <span className="font-semibold">Show Reflection</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-4 z-40 w-96 max-h-[calc(100vh-2rem)] flex flex-col bg-white rounded-xl shadow-2xl border-2 border-purple-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-t-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={20} />
          <h2 className="font-bold text-lg">
            {currentStep === 0 && "Teacher Instructions"}
            {currentStep === 1 && "Choose Review Type"}
            {currentStep === 2 && "Listen & Share"}
            {currentStep === 3 && "⭐ Star 1"}
            {currentStep === 4 && "⭐ Star 2"}
            {currentStep === 5 && "✨ Wish"}
            {currentStep === 6 && "📝 Summary"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Voice Controls */}
          <div className="flex items-center gap-1 bg-white/20 rounded-lg px-2 py-1">
            <button
              onClick={handleMuteToggle}
              className="hover:bg-white/20 p-1 rounded transition-colors"
              title={voiceEnabled ? "Mute voice" : "Unmute voice"}
            >
              {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            {voiceEnabled && (
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={voiceVolume}
                onChange={handleVolumeChange}
                className="w-16 h-1 accent-white"
                title="Voice volume"
              />
            )}
          </div>
          
          {/* Minimize Button */}
          <button
            onClick={toggleMinimize}
            className="hover:bg-white/20 p-1 rounded transition-colors"
            title="Minimize"
          >
            <Minimize2 size={16} />
          </button>
        </div>
      </div>

      {/* Content Area with Scroll */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* STEP 1: Choose Review Type */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <p className="text-gray-700 mb-4">
              Whose composition are you reviewing?
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleReviewTypeSelection('self')}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  reflectionData.reviewType === 'self'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <div className="text-left">
                  <div className="font-bold text-gray-800 flex items-center gap-2">
                    {reflectionData.reviewType === 'self' && <CheckCircle className="text-blue-600" size={20} />}
                    Self-Review
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Reflect on your own composition
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleReviewTypeSelection('partner')}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  reflectionData.reviewType === 'partner'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-300'
                }`}
              >
                <div className="text-left">
                  <div className="font-bold text-gray-800 flex items-center gap-2">
                    {reflectionData.reviewType === 'partner' && <CheckCircle className="text-purple-600" size={20} />}
                    Partner Review
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Give feedback on a friend's composition
                  </div>
                </div>
              </button>
            </div>

            {reflectionData.reviewType === 'partner' && (
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Partner's Name:
                </label>
                <input
                  type="text"
                  value={reflectionData.partnerName}
                  onChange={handlePartnerNameChange}
                  placeholder="Enter partner's name..."
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
            )}

            {reflectionData.reviewType && (
              <button
                onClick={handleContinueFromStep1}
                className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Continue →
              </button>
            )}
          </div>
        )}

        {/* STEP 2: Listen & Share */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <p className="text-lg font-bold text-gray-800 mb-2">
                🎧 {reflectionData.reviewType === 'self' ? 'Listen to Your Score' : 'Share & Listen'}
              </p>
              {reflectionData.reviewType === 'self' ? (
                <div className="text-gray-700 space-y-2">
                  <p>Listen to your entire film score from beginning to end.</p>
                  <p className="font-semibold mt-3">Pay attention to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>How you used the DAW tools (timeline, tracks, volume)</li>
                    <li>How your loops are timed with the video</li>
                    <li>The overall sound and mood of your music</li>
                  </ul>
                </div>
              ) : (
                <div className="text-gray-700 space-y-2">
                  <p className="font-semibold">1. Share your score with {reflectionData.partnerName}</p>
                  <p className="text-sm ml-3">Let them see and hear your composition first</p>
                  
                  <p className="font-semibold mt-3">2. Listen to {reflectionData.partnerName}'s score</p>
                  <p className="text-sm ml-3">Pay attention to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-6 text-sm">
                    <li>How they used the DAW tools</li>
                    <li>How their loops are timed with the video</li>
                    <li>The overall sound and mood of their music</li>
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={goToNextStep}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Ready for Star 1 →
            </button>
          </div>
        )}

        {/* STEP 3: Star 1 */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="text-yellow-500" size={24} />
              <h2 className="text-xl font-bold text-gray-800">
                {reflectionData.reviewType === 'self' ? 'STAR 1: Using the DAW' : `STAR 1: What did they do well?`}
              </h2>
            </div>

            <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
              <p className="text-sm text-gray-800 font-semibold">
                {reflectionData.reviewType === 'self' 
                  ? SELF_REFLECTION_PROMPTS.star1.question
                  : PARTNER_REFLECTION_OPTIONS.star1.question.replace('[Partner Name]', reflectionData.partnerName)
                }
              </p>
            </div>

            {!customInputs.star1 ? (
              <select
                value={reflectionData.star1}
                onChange={(e) => handleDropdownChange('star1', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select an option...</option>
                {(reflectionData.reviewType === 'self' 
                  ? SELF_REFLECTION_PROMPTS.star1.options 
                  : PARTNER_REFLECTION_OPTIONS.star1.options
                ).map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <textarea
                value={reflectionData.star1}
                onChange={(e) => handleTextChange('star1', e.target.value)}
                placeholder="Type your custom answer..."
                rows={4}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
              />
            )}

            <button
              onClick={() => handleSubmitQuestion('star1')}
              className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Continue to Star 2 →
            </button>
          </div>
        )}

        {/* STEP 4: Star 2 */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="text-yellow-500" size={24} />
              <h2 className="text-xl font-bold text-gray-800">
                {reflectionData.reviewType === 'self' ? 'STAR 2: Loop Timing & Sound' : `STAR 2: What worked well?`}
              </h2>
            </div>

            <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
              <p className="text-sm text-gray-800 font-semibold">
                {reflectionData.reviewType === 'self' 
                  ? SELF_REFLECTION_PROMPTS.star2.question
                  : PARTNER_REFLECTION_OPTIONS.star2.question.replace('[Partner Name]', reflectionData.partnerName)
                }
              </p>
            </div>

            {!customInputs.star2 ? (
              <select
                value={reflectionData.star2}
                onChange={(e) => handleDropdownChange('star2', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select an option...</option>
                {(reflectionData.reviewType === 'self' 
                  ? SELF_REFLECTION_PROMPTS.star2.options 
                  : PARTNER_REFLECTION_OPTIONS.star2.options
                ).map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <textarea
                value={reflectionData.star2}
                onChange={(e) => handleTextChange('star2', e.target.value)}
                placeholder="Type your custom answer..."
                rows={4}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
              />
            )}

            <button
              onClick={() => handleSubmitQuestion('star2')}
              className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Continue to Wish →
            </button>
          </div>
        )}

        {/* STEP 5: Wish */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-purple-500" size={24} />
              <h2 className="text-xl font-bold text-gray-800">
                {reflectionData.reviewType === 'self' ? 'WISH: What to try next?' : `WISH: What could they try?`}
              </h2>
            </div>

            <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
              <p className="text-sm text-gray-800 font-semibold">
                {reflectionData.reviewType === 'self' 
                  ? SELF_REFLECTION_PROMPTS.wish.question
                  : PARTNER_REFLECTION_OPTIONS.wish.question
                }
              </p>
            </div>

            {!customInputs.wish ? (
              <select
                value={reflectionData.wish}
                onChange={(e) => handleDropdownChange('wish', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select an option...</option>
                {(reflectionData.reviewType === 'self' 
                  ? SELF_REFLECTION_PROMPTS.wish.options 
                  : PARTNER_REFLECTION_OPTIONS.wish.options
                ).map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <textarea
                value={reflectionData.wish}
                onChange={(e) => handleTextChange('wish', e.target.value)}
                placeholder="Type your custom answer..."
                rows={4}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
              />
            )}

            <button
              onClick={handleFinalSubmit}
              className="w-full mt-4 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              View Summary →
            </button>
          </div>
        )}

        {/* STEP 6: Summary - UPDATED with READ ALOUD at very top */}
        {currentStep === 6 && (
          <div className="space-y-4">
            {/* READ ALOUD INSTRUCTION AT VERY TOP */}
            <div className={`p-4 rounded-lg border-2 text-center ${
              reflectionData.reviewType === 'self' 
                ? 'bg-blue-100 border-blue-400' 
                : 'bg-purple-100 border-purple-400'
            }`}>
              <p className="text-xl font-bold text-gray-800">
                📖 Now read your reflection out loud to {reflectionData.reviewType === 'self' ? 'yourself or a neighbor' : reflectionData.partnerName}.
              </p>
            </div>

            <div className="text-center mb-4">
              <Sparkles className="mx-auto text-yellow-500 mb-2" size={48} />
              <h2 className="text-2xl font-bold text-gray-800">♪ Your Reflection Summary</h2>
              <p className="text-sm text-gray-600 mt-1">
                You reviewed: {reflectionData.reviewType === 'self' ? 'Your own composition' : `${reflectionData.partnerName}'s composition`}
              </p>
            </div>

            <div className="space-y-4 bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="text-yellow-500" size={20} />
                  <h3 className="font-bold text-gray-800">STAR 1: Using the DAW</h3>
                </div>
                <p className="text-gray-700 bg-white p-3 rounded border border-gray-200">{reflectionData.star1}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="text-yellow-500" size={20} />
                  <h3 className="font-bold text-gray-800">STAR 2: Loop Timing & Music Sound</h3>
                </div>
                <p className="text-gray-700 bg-white p-3 rounded border border-gray-200">{reflectionData.star2}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="text-purple-500" size={20} />
                  <h3 className="font-bold text-gray-800">WISH: What to try next</h3>
                </div>
                <p className="text-gray-700 bg-white p-3 rounded border border-gray-200">{reflectionData.wish}</p>
              </div>
            </div>

            {/* SUBMIT BUTTON AT BOTTOM */}
            <button
              onClick={handleSubmitReflection}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} />
              Submit Reflection and play Name That Loop!
            </button>
          </div>
        )}

        {/* Hint Section */}
        {showHint && currentStep !== 6 && (
          <div className="mt-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
            <div className="text-sm text-yellow-900">
              <span className="font-semibold">💡 Hint:</span> Take your time to think about your answer. Be specific and honest in your reflection!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReflectionModal;