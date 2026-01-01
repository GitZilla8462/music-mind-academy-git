// File: /src/lessons/shared/activities/two-stars-and-a-wish/ReflectionModal.jsx
// UPDATED: Simplified reflection flow
// Steps: 1=choose type, 2=partner name (peer only), 3=place stickers (both), 4=listen, 5=star1, 6=star2, 7=wish, 8=vibe, 9=summary

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Star, Sparkles, Volume2, VolumeX, HelpCircle, Minimize2, Maximize2, Smile, X } from 'lucide-react';
import { SELF_REFLECTION_PROMPTS, PARTNER_REFLECTION_OPTIONS } from './reflectionPrompts';

const ReflectionModal = ({ compositionData, onComplete, viewMode = false, isSessionMode = false }) => {
  // Steps: 1=choose type, 2=partner name (peer only), 3=stickers (both), 4=listen, 5=star1, 6=star2, 7=wish, 8=vibe, 9=summary
  const [currentStep, setCurrentStep] = useState(viewMode ? 9 : 1);
  const [reflectionData, setReflectionData] = useState({
    reviewType: null,
    partnerName: '',
    star1: '',
    star2: '',
    wish: '',
    vibe: '',
    stickers: [],
    submittedAt: null
  });

  // Sticker placement state
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [isPlacingSticker, setIsPlacingSticker] = useState(false);

  // Timeline scroll tracking for sticker positioning
  const [timelineScroll, setTimelineScroll] = useState({ x: 0, y: 0 });

  // For dropdown custom inputs
  const [customInputs, setCustomInputs] = useState({
    star1: false,
    star2: false,
    wish: false
  });

  // Voice and UI state
  const [voiceEnabled, setVoiceEnabled] = useState(false);
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
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  // Helper: Strip emoji from vibe text
  const stripEmojiFromVibe = (vibe) => {
    if (!vibe) return "";
    return vibe.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu, '').trim().toLowerCase();
  };

  // Vibe options
  const vibeOptions = [
    { emoji: "🕵️", text: "Detective vibes (Investigating mysteries)" },
    { emoji: "👻", text: "Spooky atmosphere (Creepy and eerie)" },
    { emoji: "🔮", text: "Mystical energy (Magical and enchanting)" },
    { emoji: "🌙", text: "Midnight mood (Dark and mysterious)" },
    { emoji: "🎭", text: "Dramatic reveal (Tension and suspense)" },
    { emoji: "🌫️", text: "Foggy unknown (Uncertain and curious)" },
    { emoji: "⚡", text: "Thrilling discovery (Exciting and intense)" },
    { emoji: "🏚️", text: "Haunted halls (Abandoned and creepy)" },
    { emoji: "🔦", text: "Searching in the dark (Exploring the unknown)" },
    { emoji: "🎬", text: "Movie trailer energy (Epic and cinematic)" }
  ];

  // Sticker options
  const stickerOptions = [
    { emoji: "🔥", label: "Fire", description: "This part is amazing!" },
    { emoji: "⭐", label: "Star", description: "Great moment" },
    { emoji: "🎯", label: "Target", description: "Nailed it" },
    { emoji: "💡", label: "Idea", description: "Creative choice" },
    { emoji: "🔧", label: "Fix", description: "Could improve here" }
  ];

  // Track timeline scroll position for sticker rendering
  useEffect(() => {
    const timelineScrollEl = document.querySelector('[data-timeline-scroll]');
    if (!timelineScrollEl) return;

    const handleScroll = () => {
      setTimelineScroll({
        x: timelineScrollEl.scrollLeft,
        y: timelineScrollEl.scrollTop
      });
    };

    handleScroll();
    timelineScrollEl.addEventListener('scroll', handleScroll);
    return () => timelineScrollEl.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle sticker placement clicks
  useEffect(() => {
    if (!isPlacingSticker || !selectedSticker) return;

    const handleClick = (e) => {
      const modal = document.querySelector('[data-reflection-modal]');
      if (modal && modal.contains(e.target)) return;

      const timelineContent = document.querySelector('[data-timeline-content]');
      const timelineScrollEl = document.querySelector('[data-timeline-scroll]');

      if (timelineContent && timelineScrollEl) {
        const contentRect = timelineContent.getBoundingClientRect();
        const scrollLeft = timelineScrollEl.scrollLeft;
        const scrollTop = timelineScrollEl.scrollTop;

        const contentX = e.clientX - contentRect.left + scrollLeft;
        const contentY = e.clientY - contentRect.top + scrollTop;

        const relativeX = (contentX / timelineContent.scrollWidth) * 100;
        const relativeY = (contentY / timelineContent.scrollHeight) * 100;

        setReflectionData(prev => ({
          ...prev,
          stickers: [...prev.stickers, {
            emoji: selectedSticker,
            relativeX,
            relativeY,
            x: (e.clientX / window.innerWidth) * 100,
            y: (e.clientY / window.innerHeight) * 100
          }]
        }));
      } else {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;

        setReflectionData(prev => ({
          ...prev,
          stickers: [...prev.stickers, { emoji: selectedSticker, x, y }]
        }));
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isPlacingSticker, selectedSticker]);

  // Speak on step change
  useEffect(() => {
    const partnerName = reflectionData.partnerName || 'your partner';

    const messages = {
      1: "Choose how you want to reflect. You can review your own work or give feedback to a partner.",
      2: "Who are you giving feedback to? Enter your partner's first name.",
      3: reflectionData.reviewType === 'self'
        ? "Mark 3 highlights on your composition. Pick a sticker and click on the timeline to mark moments you're proud of."
        : `Mark 3 highlights for ${partnerName}. Pick a sticker and click on the timeline to show them what to notice.`,
      4: reflectionData.reviewType === 'self'
        ? "Listen to your entire film score from beginning to end. Pay attention to how you used the DAW tools, how loops are timed with the video, and the overall sound and mood."
        : `Get ready to share with ${partnerName}. When they come to your screen, they'll look at your stickers and listen to your composition. Then you'll read your feedback out loud.`,
      5: reflectionData.reviewType === 'self'
        ? "Star 1: What did you do well with using the DAW tools?"
        : `Star 1: What did ${partnerName} do well with using the DAW tools?`,
      6: reflectionData.reviewType === 'self'
        ? "Star 2: What worked well with your loop timing and music sound?"
        : `Star 2: What worked well with ${partnerName}'s loop timing and music sound?`,
      7: reflectionData.reviewType === 'self'
        ? "Now for the Wish: What do you want to try next time?"
        : `Now for the Wish: What could ${partnerName} try next time?`,
      8: reflectionData.reviewType === 'self'
        ? "Pick a vibe! If your composition was a movie mood, which one would it be?"
        : `Pick a vibe! If ${partnerName}'s composition was a movie mood, which one would it be?`,
      9: reflectionData.reviewType === 'self'
        ? "Here's your reflection summary! Read it out loud to yourself or share it with a neighbor."
        : `Here's your feedback summary! Read it out loud to ${partnerName}.`
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
    if (type === 'self') {
      setCurrentStep(3); // Skip partner name, go to stickers
    } else {
      setCurrentStep(2); // Go to partner name
    }
  };

  const handlePartnerNameChange = (e) => {
    setReflectionData(prev => ({ ...prev, partnerName: e.target.value }));
  };

  const handleContinueFromStep2 = () => {
    if (!reflectionData.partnerName.trim()) {
      alert("Please enter your partner's name");
      return;
    }
    setCurrentStep(3); // Go to stickers
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

  const handleSubmitReflection = () => {
    // Save reflection data
    const finalData = {
      ...reflectionData,
      submittedAt: new Date().toISOString()
    };
    localStorage.setItem('school-beneath-reflection', JSON.stringify(finalData));

    // Clear stickers
    setSelectedSticker(null);
    setIsPlacingSticker(false);

    // Update localStorage without stickers
    try {
      const data = { ...finalData, stickers: [] };
      localStorage.setItem('school-beneath-reflection', JSON.stringify(data));
    } catch (e) {
      console.error('Error updating reflection:', e);
    }

    console.log('Submit Reflection clicked - transitioning to game');
    onComplete();
  };

  const handleVolumeChange = (e) => {
    e.stopPropagation();
    const newVolume = parseFloat(e.target.value);
    setVoiceVolume(newVolume);

    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setTimeout(() => speak("Volume adjusted"), 100);
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

  // Get header title based on current step
  const getHeaderTitle = () => {
    switch (currentStep) {
      case 1: return "Choose Review Type";
      case 2: return "Partner's Name";
      case 3: return "🏷️ Mark Highlights";
      case 4: return reflectionData.reviewType === 'self' ? "🎧 Listen to Your Score" : "🎧 Share & Listen";
      case 5: return "⭐ Star 1";
      case 6: return "⭐ Star 2";
      case 7: return "✨ Wish";
      case 8: return "🎭 Pick a Vibe";
      case 9: return "📝 Summary";
      default: return "Reflection";
    }
  };

  // If minimized, show small header only
  if (isMinimized) {
    return (
      <div className="fixed top-4 left-4 z-[100] flex flex-col gap-2">
        <button
          onClick={toggleMinimize}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2"
        >
          <Maximize2 size={16} />
          <span className="font-semibold">Show Reflection</span>
        </button>
        {currentStep === 3 && reflectionData.stickers.length >= 3 && (
          <button
            onClick={() => {
              setSelectedSticker(null);
              setIsPlacingSticker(false);
              setCurrentStep(4);
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 transition-all flex items-center gap-2"
          >
            <CheckCircle size={16} />
            <span className="font-semibold">Continue</span>
          </button>
        )}
        {currentStep === 9 && (
          <button
            onClick={handleSubmitReflection}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 transition-all flex items-center gap-2"
          >
            <CheckCircle size={16} />
            <span className="font-semibold">Submit Reflection</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Sticker Overlay */}
      {reflectionData.stickers.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-[90]">
          {reflectionData.stickers.map((sticker, idx) => {
            const timelineContent = document.querySelector('[data-timeline-content]');
            const timelineScrollEl = document.querySelector('[data-timeline-scroll]');

            let left, top;

            if (timelineContent && timelineScrollEl && sticker.relativeX !== undefined) {
              const contentRect = timelineContent.getBoundingClientRect();
              const contentWidth = timelineContent.scrollWidth;
              const contentHeight = timelineContent.scrollHeight;

              const contentX = (sticker.relativeX / 100) * contentWidth;
              const contentY = (sticker.relativeY / 100) * contentHeight;

              left = contentRect.left + contentX - timelineScroll.x;
              top = contentRect.top + contentY - timelineScroll.y;
            } else {
              left = (sticker.x / 100) * window.innerWidth;
              top = (sticker.y / 100) * window.innerHeight;
            }

            return (
              <div
                key={idx}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 text-4xl drop-shadow-lg animate-bounce"
                style={{
                  left: `${left}px`,
                  top: `${top}px`,
                  animationDelay: `${idx * 100}ms`,
                  animationDuration: '0.5s',
                  animationIterationCount: '1'
                }}
              >
                {sticker.emoji}
              </div>
            );
          })}
        </div>
      )}

      {/* Placing sticker indicator */}
      {isPlacingSticker && selectedSticker && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[110] bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg pointer-events-none">
          Click anywhere to place {selectedSticker}
        </div>
      )}

      <div data-reflection-modal className="fixed top-4 left-4 z-[100] w-96 max-h-[calc(100vh-2rem)] flex flex-col bg-white rounded-xl shadow-2xl border-2 border-purple-200 chromebook-hide-cursor">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-t-xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={20} />
            <h2 className="font-bold text-lg">{getHeaderTitle()}</h2>
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* STEP 1: Choose Review Type - Simplified */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-gray-700 text-center mb-4">
                How would you like to reflect today?
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handleReviewTypeSelection('self')}
                  className="w-full p-5 rounded-xl border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">🌟</div>
                    <div className="font-bold text-gray-800 text-lg">Reflect on My Work</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Review your own composition
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleReviewTypeSelection('partner')}
                  className="w-full p-5 rounded-xl border-2 border-purple-200 hover:border-purple-500 hover:bg-purple-50 transition-all"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">🎁</div>
                    <div className="font-bold text-gray-800 text-lg">Give Partner Feedback</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Share feedback with a classmate
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Partner Name (peer only) */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-gray-700 text-center mb-4">
                Who are you giving feedback to?
              </p>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Partner's First Name:
                </label>
                <input
                  type="text"
                  value={reflectionData.partnerName}
                  onChange={handlePartnerNameChange}
                  placeholder="Enter their first name..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
                  autoFocus
                />
              </div>

              <button
                onClick={handleContinueFromStep2}
                disabled={!reflectionData.partnerName.trim()}
                className={`w-full mt-4 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  reflectionData.partnerName.trim()
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue →
              </button>
            </div>
          )}

          {/* STEP 3: Place Stickers (BOTH modes) */}
          {currentStep === 3 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-700 text-center font-semibold">
                {reflectionData.reviewType === 'self'
                  ? "Mark 3 highlights on your composition"
                  : `Mark 3 highlights for ${reflectionData.partnerName}`
                }
              </p>
              <p className="text-xs text-gray-500 text-center">
                {reflectionData.reviewType === 'self'
                  ? "Pick a sticker, then click on the timeline to mark moments you're proud of"
                  : "Pick a sticker, then click on the timeline to show them what to notice"
                }
              </p>

              {/* Sticker selection */}
              <div className="flex justify-center gap-1">
                {stickerOptions.map((sticker, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedSticker(sticker.emoji);
                      setIsPlacingSticker(true);
                    }}
                    className={`p-1.5 rounded-lg transition-all ${
                      selectedSticker === sticker.emoji
                        ? 'bg-purple-500 scale-110 shadow-lg'
                        : 'bg-gray-100 hover:bg-purple-100 border border-gray-200'
                    }`}
                    title={sticker.description}
                  >
                    <span className="text-xl">{sticker.emoji}</span>
                  </button>
                ))}
              </div>

              {/* Placed stickers count */}
              <p className={`text-center text-sm font-semibold ${reflectionData.stickers.length >= 3 ? 'text-green-600' : 'text-gray-500'}`}>
                {reflectionData.stickers.length}/3 highlights marked
              </p>

              {/* Placed stickers list */}
              {reflectionData.stickers.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center">
                  {reflectionData.stickers.map((sticker, idx) => (
                    <div key={idx} className="flex items-center gap-0.5 bg-purple-50 px-1.5 py-0.5 rounded-full border border-purple-200">
                      <span className="text-sm">{sticker.emoji}</span>
                      <button
                        onClick={() => {
                          setReflectionData(prev => ({
                            ...prev,
                            stickers: prev.stickers.filter((_, i) => i !== idx)
                          }));
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setSelectedSticker(null);
                  setIsPlacingSticker(false);
                  goToNextStep();
                }}
                disabled={reflectionData.stickers.length < 3}
                className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                  reflectionData.stickers.length >= 3
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue →
              </button>
            </div>
          )}

          {/* STEP 4: Listen & Prepare */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                {reflectionData.reviewType === 'self' ? (
                  <>
                    <p className="text-lg font-bold text-gray-800 mb-2">
                      🎧 Listen to Your Score
                    </p>
                    <div className="text-gray-700 space-y-2">
                      <p>Listen to your entire film score from beginning to end.</p>
                      <p className="font-semibold mt-3">Pay attention to:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>How you used the DAW tools (timeline, tracks, volume)</li>
                        <li>How your loops are timed with the video</li>
                        <li>The overall sound and mood of your music</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold text-gray-800 mb-2">
                      🎧 Get Ready to Share
                    </p>
                    <div className="text-gray-700 space-y-2">
                      <p>Get ready to share with <strong>{reflectionData.partnerName}</strong>.</p>
                      <p className="mt-2">When they come to your screen, they'll look at your stickers and listen to your composition.</p>
                      <p className="mt-2">Then you'll read your feedback out loud.</p>
                    </div>
                  </>
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

          {/* STEP 5: Star 1 */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="text-yellow-500" size={24} />
                <h2 className="text-xl font-bold text-gray-800">
                  {reflectionData.reviewType === 'self'
                    ? 'STAR 1: Using the DAW'
                    : `STAR 1: What did ${reflectionData.partnerName} do well?`
                  }
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

          {/* STEP 6: Star 2 */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="text-yellow-500" size={24} />
                <h2 className="text-xl font-bold text-gray-800">
                  {reflectionData.reviewType === 'self'
                    ? 'STAR 2: Loop Timing & Sound'
                    : `STAR 2: What worked well?`
                  }
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

          {/* STEP 7: Wish */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="text-purple-500" size={24} />
                <h2 className="text-xl font-bold text-gray-800">
                  {reflectionData.reviewType === 'self'
                    ? 'WISH: What to try next?'
                    : `WISH: What could ${reflectionData.partnerName} try?`
                  }
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
                onClick={() => handleSubmitQuestion('wish')}
                className="w-full mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Pick a Vibe →
              </button>
            </div>
          )}

          {/* STEP 8: Vibe Selector */}
          {currentStep === 8 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <Smile className="w-12 h-12 mx-auto text-purple-500 mb-2" />
                <h3 className="font-bold text-gray-900">Pick a Vibe! 🎭</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {reflectionData.reviewType === 'self'
                    ? "If your composition was a movie mood..."
                    : `If ${reflectionData.partnerName}'s composition was a movie mood...`
                  }
                </p>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {vibeOptions.map((vibe, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setReflectionData(prev => ({ ...prev, vibe: vibe.text }));
                      setCurrentStep(9);
                    }}
                    className="w-full p-3 text-left rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all flex items-center gap-3"
                  >
                    <span className="text-2xl">{vibe.emoji}</span>
                    <span className="text-gray-900 text-sm">{vibe.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 9: Summary */}
          {currentStep === 9 && (
            <div className="space-y-4">
              {/* READ ALOUD HEADER */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-lg text-center">
                <p className="text-white font-bold text-lg">
                  📖 Read this out loud:
                </p>
              </div>

              {/* Read-Aloud Paragraph */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-5 rounded-xl border-2 border-yellow-300 shadow-md">
                <p className="text-gray-900 text-lg leading-loose">
                  {reflectionData.reviewType === 'self' ? (
                    <>
                      One thing I did well with the DAW was <strong>{reflectionData.star1}</strong>.<br /><br />
                      Something that worked well in my music was <strong>{reflectionData.star2}</strong>.<br /><br />
                      Next time, I want to try <strong>{reflectionData.wish}</strong>.<br /><br />
                      {reflectionData.vibe && (
                        <>Overall, my composition gave off <strong>{stripEmojiFromVibe(reflectionData.vibe)}</strong> vibes.</>
                      )}
                    </>
                  ) : (
                    <>
                      Hey <strong>{reflectionData.partnerName}</strong>!<br /><br />
                      One thing you did really well with the DAW was <strong>{reflectionData.star1}</strong>.<br /><br />
                      Something that worked well in your music was <strong>{reflectionData.star2}</strong>.<br /><br />
                      I wonder what would happen if you tried <strong>{reflectionData.wish}</strong>.<br /><br />
                      {reflectionData.vibe && (
                        <>Overall, your composition gave off <strong>{stripEmojiFromVibe(reflectionData.vibe)}</strong> vibes!</>
                      )}
                    </>
                  )}
                </p>
              </div>

              {/* Stickers note */}
              {reflectionData.stickers && reflectionData.stickers.length > 0 && (
                <p className="text-center text-sm text-gray-600">
                  🏷️ Your highlights are shown on the composition above.
                </p>
              )}

              {/* SUBMIT BUTTON */}
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
          {showHint && currentStep !== 9 && (
            <div className="mt-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
              <div className="text-sm text-yellow-900">
                <span className="font-semibold">💡 Hint:</span> Take your time to think about your answer. Be specific and honest in your reflection!
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReflectionModal;
