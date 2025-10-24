// File: /src/lessons/film-music-project/lesson1/activities/two-stars-and-a-wish/ReflectionModal.jsx
// UPDATED: Bottom-right positioning, teacher instruction step, no screen dimming
// Steps: 0=teacher instruction, 1=choose type, 2=listen & share, 3=star1, 4=star2, 5=wish, 6=summary

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Star, Sparkles, Volume2, VolumeX, HelpCircle, Minimize2, Maximize2 } from 'lucide-react';
import { SELF_REFLECTION_PROMPTS, PARTNER_REFLECTION_OPTIONS } from './reflectionPrompts';

const ReflectionModal = ({ compositionData, onComplete, viewMode = false }) => {
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
    if (message) {
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
  }, [currentStep, reflectionData.reviewType, reflectionData.partnerName]);

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
    // Just move to step 1 (choose review type)
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

    goToNextStep(); // Go to summary
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

  const progressPercent = (currentStep / 6) * 100;

  // Minimized view
  if (isMinimized) {
    return (
      <div
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '20px',
          width: '280px',
          zIndex: 1000,
          pointerEvents: 'auto'
        }}
        className="bg-white rounded-lg shadow-2xl border-4 border-orange-500"
      >
        <div className="bg-orange-500 px-4 py-2 flex items-center justify-between">
          <div className="text-white font-bold text-sm flex items-center gap-2">
            <Star size={16} />
            Reflection Activity
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(false);
            }}
            className="p-1 bg-white/20 rounded hover:bg-white/30 transition-colors"
          >
            <Maximize2 size={16} className="text-white" />
          </button>
        </div>
        <div className="px-4 py-2 text-sm text-gray-600">
          Click to restore
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        right: '20px',
        bottom: '20px',
        width: currentStep === 0 || currentStep === 1 ? '500px' : '600px',
        maxHeight: '80vh',
        zIndex: 1000,
        pointerEvents: 'auto'
      }}
      className="bg-white rounded-lg shadow-2xl border-4 border-orange-500 overflow-hidden flex flex-col"
    >
      {/* Progress Bar */}
      <div className="h-1 bg-gray-200 flex-shrink-0">
        <div 
          className="h-full bg-blue-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Header */}
      <div className="bg-orange-500 px-4 py-2 flex items-center justify-between flex-shrink-0">
        <div className="text-white font-bold text-sm flex items-center gap-2">
          <Star size={16} />
          Two Stars and a Wish
        </div>
        
        <div className="flex items-center gap-2" onMouseDown={(e) => e.stopPropagation()}>
          {/* Volume Control */}
          <div className="flex items-center gap-1 bg-white/20 rounded px-2 py-1">
            <Volume2 size={14} className="text-white flex-shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={voiceVolume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #fff 0%, #fff ${voiceVolume * 100}%, rgba(255,255,255,0.3) ${voiceVolume * 100}%, rgba(255,255,255,0.3) 100%)`
              }}
            />
          </div>

          <button
            onClick={handleMuteToggle}
            className={`p-1.5 rounded transition-colors ${
              voiceEnabled ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 hover:bg-gray-600'
            }`}
          >
            {voiceEnabled ? <Volume2 size={16} className="text-white" /> : <VolumeX size={16} className="text-white" />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowHint(!showHint);
            }}
            className="p-1.5 bg-yellow-500 rounded hover:bg-yellow-600 transition-colors"
          >
            <HelpCircle size={16} className="text-white" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(true);
            }}
            className="p-1.5 bg-white/20 rounded hover:bg-white/30 transition-colors"
          >
            <Minimize2 size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className={`flex-1 overflow-y-auto px-6 py-4 ${currentStep === 6 ? 'flex flex-col' : ''}`} style={{ pointerEvents: 'auto' }}>
        
        {/* STEP 0: Ask Teacher - NEW STEP */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">👨‍🏫</div>
              <h2 className="text-xl font-bold text-gray-800">Time to Reflect!</h2>
            </div>
            
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <p className="text-gray-800 text-base leading-relaxed font-semibold mb-3">
                Before you begin your reflection:
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">
                Ask your teacher whether you will be:
              </p>
              <ul className="mt-2 space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Reviewing your own composition (self-reflection)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Reviewing a partner's composition (peer feedback)</span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="font-semibold">💡 Note:</span> Once your teacher tells you which type of review to do, click Continue below to proceed.
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
            <h2 className="text-xl font-bold text-gray-800 text-center">Whose composition are you reviewing?</h2>
            
            <div className="space-y-3">
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                <input
                  type="radio"
                  name="reviewType"
                  value="self"
                  checked={reflectionData.reviewType === 'self'}
                  onChange={() => handleReviewTypeSelection('self')}
                  className="mr-3 w-5 h-5"
                />
                <span className="font-semibold text-gray-700">My own composition (Self-Reflect)</span>
              </label>

              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                <input
                  type="radio"
                  name="reviewType"
                  value="partner"
                  checked={reflectionData.reviewType === 'partner'}
                  onChange={() => handleReviewTypeSelection('partner')}
                  className="mr-3 w-5 h-5"
                />
                <span className="font-semibold text-gray-700">A friend's composition</span>
              </label>

              {reflectionData.reviewType === 'partner' && (
                <div className="ml-8 mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter partner name:
                  </label>
                  <input
                    type="text"
                    value={reflectionData.partnerName}
                    onChange={handlePartnerNameChange}
                    placeholder="Partner's name"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleContinueFromStep1}
              disabled={!reflectionData.reviewType}
              className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 2: Listen & Share */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">
              {reflectionData.reviewType === 'self' ? 'Listen to Your Composition' : 'Share & Listen'}
            </h2>
            
            {reflectionData.reviewType === 'self' ? (
              <>
                <p className="text-gray-700">
                  Listen to your entire film score from beginning to end.
                </p>
                
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Pay attention to:</p>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>How the music tools (timeline, tracks, volume) were used</li>
                    <li>How the loops are timed with the video</li>
                    <li>The overall sound and mood of the music</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-3">
                  <p className="text-sm font-semibold text-green-900 mb-2">🔄 First: Share your score</p>
                  <p className="text-sm text-green-800">
                    Share your score with {reflectionData.partnerName} so they can see and hear your work.
                  </p>
                </div>

                <p className="text-gray-700 font-semibold">
                  Now, listen to {reflectionData.partnerName}'s entire film score from beginning to end.
                </p>
                
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Pay attention to:</p>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>How the music tools (timeline, tracks, volume) were used</li>
                    <li>How the loops are timed with the video</li>
                    <li>The overall sound and mood of the music</li>
                  </ul>
                </div>
              </>
            )}

            <button
              onClick={goToNextStep}
              className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Continue to Questions →
            </button>
          </div>
        )}

        {/* STEP 3: Star 1 */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="text-yellow-500" size={24} />
              <h2 className="text-xl font-bold text-gray-800">
                {reflectionData.reviewType === 'self' ? 'STAR 1: Using the DAW' : `STAR 1: What did ${reflectionData.partnerName} do well?`}
              </h2>
            </div>

            <p className="text-sm text-gray-700 font-semibold">
              {reflectionData.reviewType === 'self' 
                ? SELF_REFLECTION_PROMPTS.star1.question
                : PARTNER_REFLECTION_OPTIONS.star1.question.replace('[Partner Name]', reflectionData.partnerName)
              }
            </p>

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

            <p className="text-sm text-gray-700 font-semibold">
              {reflectionData.reviewType === 'self' 
                ? SELF_REFLECTION_PROMPTS.star2.question
                : PARTNER_REFLECTION_OPTIONS.star2.question.replace('[Partner Name]', reflectionData.partnerName)
              }
            </p>

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

            <p className="text-sm text-gray-700 font-semibold">
              {reflectionData.reviewType === 'self' 
                ? SELF_REFLECTION_PROMPTS.wish.question
                : PARTNER_REFLECTION_OPTIONS.wish.question
              }
            </p>

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
          <>
            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="text-center mb-4">
                <Sparkles className="mx-auto text-yellow-500 mb-2" size={48} />
                <h2 className="text-2xl font-bold text-gray-800">🎵 Your Reflection Summary</h2>
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

              <div className="space-y-4 bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200 mb-4">
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
            </div>

            <div className="flex-shrink-0 pt-4 border-t-2 border-gray-200 bg-white">
              <button
                onClick={handleDone}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                Done - Complete Lesson
              </button>
            </div>
          </>
        )}
      </div>

      {/* Hint Section */}
      {showHint && currentStep !== 6 && (
        <div className="px-4 py-3 bg-yellow-50 border-t-2 border-yellow-200 flex-shrink-0" style={{ pointerEvents: 'auto' }}>
          <div className="text-sm text-yellow-900">
            <span className="font-semibold">💡 Hint:</span> Take your time to think about your answer. Be specific and honest in your reflection!
          </div>
        </div>
      )}
    </div>
  );
};

export default ReflectionModal;