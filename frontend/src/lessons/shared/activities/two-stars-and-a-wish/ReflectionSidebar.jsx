// File: /src/lessons/film-music-project/lesson1/activities/two-stars-and-a-wish/ReflectionSidebar.jsx
// Full-height sidebar for reflection activity - matches ChallengeSidebar pattern
// UPDATED: Full height sidebar matching DAWTutorialActivity ChallengeSidebar

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Star, Sparkles, Volume2, VolumeX, HelpCircle, Minimize2, Maximize2 } from 'lucide-react';
import { SELF_REFLECTION_PROMPTS, PARTNER_REFLECTION_OPTIONS } from './reflectionPrompts';

const ReflectionSidebar = ({ compositionData, onComplete, viewMode = false, isSessionMode = false }) => {
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
    const newVolume = parseFloat(e.target.value);
    setVoiceVolume(newVolume);
    
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      
      setTimeout(() => {
        speak("Volume adjusted");
      }, 100);
    }
  };

  const handleMuteToggle = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  // Get step title
  const getStepTitle = () => {
    switch(currentStep) {
      case 0: return 'Teacher Instruction';
      case 1: return 'Choose Review Type';
      case 2: return 'Listen & Share';
      case 3: return 'Star 1: DAW Tools';
      case 4: return 'Star 2: Timing & Sound';
      case 5: return 'Wish: Next Time';
      case 6: return 'Reflection Summary';
      default: return 'Reflection';
    }
  };

  // Get progress percentage
  const progressPercent = (currentStep / 6) * 100;

  // MAIN RENDER - MATCHING ChallengeSidebar STRUCTURE
  return (
    <div className="h-full bg-white text-gray-800 flex flex-col overflow-hidden border-4 border-purple-600">
      {/* Progress Bar */}
      <div className="h-2 bg-gray-200 flex-shrink-0">
        <div 
          className="h-full bg-purple-400 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Header Section */}
      <div className="bg-purple-600 px-3 py-2 border-b border-purple-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-white">Reflection Activity</h3>
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

        {/* Step Progress */}
        <div className="text-[10px] text-white">
          {getStepTitle()} • Step {currentStep + 1} of 7
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white">
        
        {/* STEP 0: Teacher Instruction */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4">
              <h2 className="text-lg font-bold text-gray-800 mb-3">🎓 For the Teacher</h2>
              <p className="text-sm text-gray-700 mb-4">
                Before students begin, please explain whether they will be:
              </p>
              <ul className="text-sm text-gray-700 space-y-2 ml-4 list-disc">
                <li><strong>Self-reflection:</strong> Reviewing their own composition</li>
                <li><strong>Partner reflection:</strong> Reviewing a classmate's composition</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-xs text-gray-700">
                <strong>Next:</strong> Students will choose their review type and complete a Two Stars and a Wish reflection.
              </p>
            </div>

            <button
              onClick={handleContinueFromStep0}
              className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
            >
              Continue to Choose Type →
            </button>
          </div>
        )}

        {/* STEP 1: Choose Review Type */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
              <p className="text-sm font-semibold text-gray-800 mb-3">
                Whose composition are you reviewing?
              </p>
            </div>

            <button
              onClick={() => handleReviewTypeSelection('self')}
              className={`w-full px-4 py-4 rounded-lg border-2 text-left transition-all ${
                reflectionData.reviewType === 'self'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">🎵</div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">My Own Composition</div>
                  <div className="text-xs text-gray-600 mt-1">Review your own work</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleReviewTypeSelection('partner')}
              className={`w-full px-4 py-4 rounded-lg border-2 text-left transition-all ${
                reflectionData.reviewType === 'partner'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 bg-white hover:border-purple-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">👥</div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">Partner's Composition</div>
                  <div className="text-xs text-gray-600 mt-1">Review a classmate's work</div>
                </div>
              </div>
            </button>

            {reflectionData.reviewType === 'partner' && (
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Partner's Name:
                </label>
                <input
                  type="text"
                  value={reflectionData.partnerName}
                  onChange={handlePartnerNameChange}
                  placeholder="Enter partner's name"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                />
              </div>
            )}

            {reflectionData.reviewType && (
              <button
                onClick={handleContinueFromStep1}
                className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
              >
                Continue to Listen & Share →
              </button>
            )}
          </div>
        )}

        {/* STEP 2: Listen & Share */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
              <p className="text-sm text-gray-800 leading-relaxed">
                {reflectionData.reviewType === 'self' ? (
                  <>Now, <strong>listen to your entire film score</strong> from beginning to end.</>
                ) : (
                  <>Now it's time to share! First, <strong>share your score with {reflectionData.partnerName}</strong> so they can see and hear your work. Then, <strong>listen to {reflectionData.partnerName}'s entire film score</strong> from beginning to end.</>
                )}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-xs font-semibold mb-2 text-gray-800">🎧 What to listen for:</div>
              <ul className="text-[10px] text-gray-700 space-y-1">
                <li>✓ How the music tools (timeline, tracks, volume) were used</li>
                <li>✓ How the loops are timed with the video</li>
                <li>✓ The overall sound and mood of the music</li>
              </ul>
            </div>

            <button
              onClick={goToNextStep}
              className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
            >
              Continue to Star 1 →
            </button>
          </div>
        )}

        {/* STEP 3: Star 1 */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="text-yellow-500" size={20} />
              <h2 className="text-base font-bold text-gray-800">
                {reflectionData.reviewType === 'self' ? 'STAR 1: Using the DAW' : `STAR 1: What worked well?`}
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
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
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
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-sm"
              />
            )}

            <button
              onClick={() => handleSubmitQuestion('star1')}
              className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
            >
              Continue to Star 2 →
            </button>
          </div>
        )}

        {/* STEP 4: Star 2 */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="text-yellow-500" size={20} />
              <h2 className="text-base font-bold text-gray-800">
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
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
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
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-sm"
              />
            )}

            <button
              onClick={() => handleSubmitQuestion('star2')}
              className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
            >
              Continue to Wish →
            </button>
          </div>
        )}

        {/* STEP 5: Wish */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-purple-500" size={20} />
              <h2 className="text-base font-bold text-gray-800">
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
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
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
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-sm"
              />
            )}

            <button
              onClick={handleFinalSubmit}
              className="w-full mt-4 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
            >
              Submit Reflection →
            </button>
          </div>
        )}

        {/* STEP 6: Summary */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div className="text-center">
              <Sparkles className="mx-auto text-yellow-500 mb-2" size={36} />
              <h2 className="text-lg font-bold text-gray-800">♪ Your Reflection Summary</h2>
              <p className="text-xs text-gray-600 mt-1">
                You reviewed: {reflectionData.reviewType === 'self' ? 'Your own composition' : `${reflectionData.partnerName}'s composition`}
              </p>
            </div>

            <div className={`p-3 rounded-lg border-2 text-center ${
              reflectionData.reviewType === 'self' 
                ? 'bg-blue-50 border-blue-300' 
                : 'bg-purple-50 border-purple-300'
            }`}>
              <p className="text-sm font-bold text-gray-800 mb-1">📖 Now Read Your Reflection Aloud!</p>
              <p className="text-xs text-gray-700">
                {reflectionData.reviewType === 'self' 
                  ? 'Read your reflection to yourself or share it with a neighbor.'
                  : `Read this feedback out loud to ${reflectionData.partnerName}.`
                }
              </p>
            </div>

            <div className="space-y-3 bg-gradient-to-br from-blue-50 to-purple-50 p-3 rounded-lg border-2 border-blue-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Star className="text-yellow-500" size={16} />
                  <h3 className="font-bold text-gray-800 text-xs">STAR 1: Using the DAW</h3>
                </div>
                <p className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200">{reflectionData.star1}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Star className="text-yellow-500" size={16} />
                  <h3 className="font-bold text-gray-800 text-xs">STAR 2: Loop Timing & Music Sound</h3>
                </div>
                <p className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200">{reflectionData.star2}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="text-purple-500" size={16} />
                  <h3 className="font-bold text-gray-800 text-xs">WISH: What to try next</h3>
                </div>
                <p className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200">{reflectionData.wish}</p>
              </div>
            </div>
          </div>
        )}

        {/* Hint Section */}
        {showHint && currentStep !== 6 && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
            <div className="text-xs text-yellow-900">
              <span className="font-semibold">💡 Hint:</span> Take your time to think about your answer. Be specific and honest in your reflection!
            </div>
          </div>
        )}
      </div>

      {/* Done Button (only on summary step) */}
      {currentStep === 6 && (
        <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleDone}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
          >
            <CheckCircle size={16} />
            {isSessionMode ? 'Done - Wait for Teacher' : 'Done - Complete Lesson'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReflectionSidebar;