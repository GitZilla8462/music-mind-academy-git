// File: /src/lessons/film-music-project/lesson1/activities/two-stars-and-a-wish/ReflectionModal.jsx
// UPDATED: Top-left positioning with minimize functionality
// Steps: 0=teacher instruction, 1=choose type, 2=listen & share, 3=star1, 4=star2, 5=wish, 6=summary

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Star, Sparkles, Volume2, VolumeX, HelpCircle, Minimize2, Maximize2 } from 'lucide-react';
import { SELF_REFLECTION_PROMPTS, PARTNER_REFLECTION_OPTIONS } from './reflectionPrompts';

const ReflectionModal = ({ compositionData, onComplete, viewMode = false, isSessionMode = false }) => {
  // Steps: 0=teacher instruction, 1=choose type, 2=listen & share, 3=star1, 4=star2, 5=wish, 6=summary
  const [currentStep, setCurrentStep] = useState(viewMode ? 6 : 0);
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
  const [voiceEnabled, setVoiceEnabled] = useState(true);
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
      0: "Time to reflect on your work! First, ask your teacher: Are you reviewing your own composition, or will you be reviewing a partner's work?",
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

  const handleContinueFromStep0 = () => {
    goToNextStep();
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

    localStorage.setItem('school-beneath-reflection', JSON.stringify(finalData));
    console.log('Reflection saved:', finalData);

    goToNextStep();
  };

  const handleDone = () => {
    console.log('Done button clicked, calling onComplete');
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

  const toggleMinimize = (e) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Get step title for minimized view
  const getStepTitle = () => {
    if (currentStep === 0) return "Teacher Instruction";
    if (currentStep === 1) return "Choose Review Type";
    if (currentStep === 2) return "Listen & Share";
    if (currentStep === 3) return "Star 1";
    if (currentStep === 4) return "Star 2";
    if (currentStep === 5) return "Wish";
    if (currentStep === 6) return "Summary";
    return "Reflection";
  };

  // Minimized view
  if (isMinimized) {
    return (
      <div 
        className="fixed top-4 left-4 z-50 bg-purple-600 text-white rounded-lg shadow-2xl cursor-pointer hover:bg-purple-700 transition-colors"
        onClick={toggleMinimize}
        style={{ pointerEvents: 'auto' }}
      >
        <div className="px-4 py-3 flex items-center gap-3">
          <Sparkles size={20} />
          <span className="font-semibold">Reflection: {getStepTitle()}</span>
          <Maximize2 size={18} className="ml-2" />
        </div>
      </div>
    );
  }

  // Full modal view
  return (
    <div 
      className="fixed top-4 left-4 z-50 bg-white rounded-lg shadow-2xl border-2 border-purple-600 flex flex-col overflow-hidden"
      style={{ 
        width: '480px', 
        maxHeight: 'calc(100vh - 32px)',
        pointerEvents: 'auto'
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={20} />
          <h1 className="text-lg font-bold">Two Stars and a Wish</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Volume Control */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleMuteToggle}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title={voiceEnabled ? "Mute voice" : "Unmute voice"}
            >
              {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            {voiceEnabled && (
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={voiceVolume}
                onChange={handleVolumeChange}
                className="w-16 h-1"
                title="Adjust volume"
              />
            )}
          </div>
          {/* Hint Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowHint(!showHint);
            }}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Show hint"
          >
            <HelpCircle size={18} />
          </button>
          {/* Minimize Button */}
          <button
            onClick={toggleMinimize}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Minimize"
          >
            <Minimize2 size={18} />
          </button>
        </div>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* STEP 0: Teacher Instruction */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">👩‍🏫</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Teacher Check-In</h2>
              <p className="text-sm text-gray-600">Before you begin your reflection...</p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <p className="text-gray-800 font-semibold mb-3">
                🙋 Ask your teacher:
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">
                "Are we reviewing our <strong>own</strong> composition today, or will we be reviewing a <strong>partner's</strong> work?"
              </p>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">💡 Why ask?</span> Your teacher will tell you whether today's lesson focuses on self-reflection or peer feedback!
              </p>
            </div>

            <button
              onClick={handleContinueFromStep0}
              className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Continue →
            </button>
          </div>
        )}

        {/* STEP 1: Choose Review Type */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Whose composition are you reviewing?</h2>
            
            <div className="space-y-3">
              <button
                onClick={() => handleReviewTypeSelection('self')}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  reflectionData.reviewType === 'self'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🎵</div>
                  <div className="text-left flex-1">
                    <div className="font-bold text-gray-800 mb-1">My Own Composition</div>
                    <div className="text-sm text-gray-600">I'll reflect on my own film score</div>
                  </div>
                  {reflectionData.reviewType === 'self' && (
                    <CheckCircle className="text-blue-500 flex-shrink-0" size={24} />
                  )}
                </div>
              </button>

              <button
                onClick={() => handleReviewTypeSelection('partner')}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  reflectionData.reviewType === 'partner'
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-300 hover:border-purple-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">👥</div>
                  <div className="text-left flex-1">
                    <div className="font-bold text-gray-800 mb-1">A Partner's Composition</div>
                    <div className="text-sm text-gray-600">I'll give feedback to a classmate</div>
                  </div>
                  {reflectionData.reviewType === 'partner' && (
                    <CheckCircle className="text-purple-500 flex-shrink-0" size={24} />
                  )}
                </div>
              </button>
            </div>

            {reflectionData.reviewType === 'partner' && (
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What is your partner's name?
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

            <button
              onClick={handleContinueFromStep1}
              disabled={!reflectionData.reviewType}
              className={`w-full mt-4 px-6 py-3 rounded-lg font-semibold transition-colors ${
                reflectionData.reviewType
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue →
            </button>
          </div>
        )}

        {/* STEP 2: Listen & Share */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">🎧</div>
              <h2 className="text-xl font-bold text-gray-800">Listen & Share</h2>
            </div>

            {reflectionData.reviewType === 'self' ? (
              <div className="space-y-3">
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                  <p className="text-sm text-gray-800 font-semibold mb-2">Listen to your entire film score</p>
                  <p className="text-sm text-gray-700">Press play and watch/listen from beginning to end.</p>
                </div>

                <div className="bg-gray-50 border border-gray-300 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Pay attention to:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>✓ How you used the DAW tools (timeline, tracks, volume)</li>
                    <li>✓ How your loops are timed with the video</li>
                    <li>✓ The overall sound and mood of your music</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                  <p className="text-sm text-gray-800 font-semibold mb-2">Share & Listen Together</p>
                  <ol className="text-sm text-gray-700 space-y-2">
                    <li>1. Share your score with {reflectionData.partnerName}</li>
                    <li>2. Listen to {reflectionData.partnerName}'s entire film score</li>
                  </ol>
                </div>

                <div className="bg-gray-50 border border-gray-300 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Pay attention to:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>✓ How they used the DAW tools</li>
                    <li>✓ How their loops are timed with the video</li>
                    <li>✓ The overall sound and mood of their music</li>
                  </ul>
                </div>
              </div>
            )}

            <button
              onClick={goToNextStep}
              className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              I've Listened - Continue →
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
              Submit Reflection →
            </button>
          </div>
        )}

        {/* STEP 6: Summary */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <Sparkles className="mx-auto text-yellow-500 mb-2" size={48} />
              <h2 className="text-2xl font-bold text-gray-800">♪ Your Reflection Summary</h2>
              <p className="text-sm text-gray-600 mt-1">
                You reviewed: {reflectionData.reviewType === 'self' ? 'Your own composition' : `${reflectionData.partnerName}'s composition`}
              </p>
            </div>

            <div className={`p-4 rounded-lg border-2 text-center ${
              reflectionData.reviewType === 'self' 
                ? 'bg-blue-50 border-blue-300' 
                : 'bg-purple-50 border-purple-300'
            }`}>
              <p className="text-lg font-bold text-gray-800 mb-2">📖 Now Read Your Reflection Aloud!</p>
              <p className="text-gray-700">
                {reflectionData.reviewType === 'self' 
                  ? 'Read your reflection to yourself or share it with a neighbor.'
                  : `Read this feedback out loud to ${reflectionData.partnerName}.`
                }
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

            <button
              onClick={handleDone}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} />
              {isSessionMode ? 'Done - Wait for Teacher' : 'Done - Complete Lesson'}
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