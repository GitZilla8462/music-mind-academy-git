// File: /src/lessons/shared/activities/two-stars-and-a-wish/WildlifeReflectionModal.jsx
// Epic Wildlife - Two Stars and a Wish Reflection Modal
// ✅ UPDATED: Added confidence check (self only) + vibe + stickers
// Steps: 1=choose type, 2=confidence (self only), 3=listen & share, 4=star1, 5=star2, 6=wish, 7=vibe, 8=stickers, 9=summary

import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronRight, ChevronLeft, Check, Sparkles, Volume2, VolumeX, Minimize2, Maximize2, CheckCircle, Smile, X } from 'lucide-react';
import { saveReflection, getReflection } from '../../../film-music-project/lesson3/lesson3StorageUtils';

const WildlifeReflectionModal = ({
  compositionData,
  onComplete,
  viewMode = false,
  isSessionMode = false
}) => {
  // Steps: 1=choose type, 2=confidence (self only), 3=listen & share, 4=star1, 5=star2, 6=wish, 7=vibe, 8=stickers, 9=summary
  const [currentStep, setCurrentStep] = useState(viewMode ? 9 : 1);
  const [reflectionData, setReflectionData] = useState({
    reviewType: null,
    partnerName: '',
    confidence: '',
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

  // For custom inputs
  const [customInputs, setCustomInputs] = useState({
    star1: false,
    star2: false,
    wish: false
  });

  // Voice and UI state
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceVolume, setVoiceVolume] = useState(0.5);
  const [isMinimized, setIsMinimized] = useState(false);

  const hasSpokenRef = useRef(false);

  // Load saved reflection if in view mode
  useEffect(() => {
    if (viewMode) {
      const saved = getReflection();
      if (saved) {
        setReflectionData(saved);
      }
    }
  }, [viewMode]);

  // Voice synthesis
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
        voice.lang === 'en-US'
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Confidence options
  const confidenceOptions = [
    { emoji: "🚀", label: "Nailed it!", description: "I'm really proud of this" },
    { emoji: "😊", label: "Pretty good", description: "I think it turned out well" },
    { emoji: "🤔", label: "Not sure", description: "It's okay, I guess" },
    { emoji: "😬", label: "Needs work", description: "I know I can do better" }
  ];

  // Helper: Get confidence phrase for read-aloud paragraph
  const getConfidencePhrase = (confidence, isPartner = false) => {
    const mapping = {
      "Nailed it!": { self: "really proud of", partner: "amazing" },
      "Pretty good": { self: "pretty good about", partner: "really good" },
      "Not sure": { self: "still figuring out", partner: "really creative" },
      "Needs work": { self: "still working on", partner: "a great start" }
    };
    const phrases = mapping[confidence] || { self: "good about", partner: "great" };
    return isPartner ? phrases.partner : phrases.self;
  };

  // Helper: Strip emoji from vibe text
  const stripEmojiFromVibe = (vibe) => {
    if (!vibe) return "";
    return vibe.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu, '').trim().toLowerCase();
  };

  // Speak on step change
  useEffect(() => {
    const partnerName = reflectionData.partnerName || 'your partner';

    const messages = {
      1: "Whose composition are you reviewing? Choose whether you'll reflect on your own work or a friend's composition.",
      2: "How confident do you feel about your composition? Be honest - there's no wrong answer!",
      3: reflectionData.reviewType === 'self'
        ? "Now, listen to your entire wildlife composition from beginning to end. Pay attention to: How you used sectional form. How the music matched the nature footage. And the overall mood and texture."
        : `Now it's time to share! First, share your score with ${partnerName}. Then, listen to ${partnerName}'s entire wildlife composition from beginning to end.`,
      4: "Star 1: Think about what went well with song form and sections.",
      5: "Star 2: Think about how well the music supported the wildlife video.",
      6: "Now for the Wish: What do you want to try or improve next time?",
      7: "Pick a vibe! If the composition was a mood, which one would it be?",
      8: "Now place some stickers on the composition! Pick a sticker, then click anywhere on the DAW to mark that spot.",
      9: reflectionData.reviewType === 'self'
        ? "Here's your complete reflection summary! Now read your reflection out loud to yourself or share it with a neighbor."
        : `Here's your complete reflection summary! Now read your feedback out loud to ${partnerName}.`
    };

    if (!hasSpokenRef.current && messages[currentStep]) {
      setTimeout(() => {
        speak(messages[currentStep]);
        hasSpokenRef.current = true;
      }, 500);
    }
  }, [currentStep, reflectionData.reviewType, reflectionData.partnerName, voiceEnabled]);

  // Reset spoken flag when step changes
  useEffect(() => {
    hasSpokenRef.current = false;
  }, [currentStep]);

  const handleReviewTypeSelection = (type) => {
    setReflectionData(prev => ({ ...prev, reviewType: type }));

    if (type === 'partner') {
      const name = prompt("What is your partner's name?");
      if (name) {
        setReflectionData(prev => ({ ...prev, partnerName: name }));
      }
      setCurrentStep(3); // Skip confidence for partner review
    } else {
      setCurrentStep(2); // Go to confidence check for self review
    }
  };

  const handleConfidenceSelection = (label) => {
    setReflectionData(prev => ({ ...prev, confidence: label }));
    setCurrentStep(3); // Go to listen & share
  };

  const handleMuteToggle = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const handleVolumeChange = (e) => {
    setVoiceVolume(parseFloat(e.target.value));
  };

  const toggleMinimize = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsMinimized(!isMinimized);
  };

  const saveAndContinue = () => {
    const fullData = {
      ...reflectionData,
      submittedAt: new Date().toISOString()
    };

    // Save using the lesson4 storage utility
    saveReflection(
      fullData.reviewType,
      fullData.partnerName,
      fullData.star1,
      fullData.star2,
      fullData.wish
    );

    // Also save to localStorage for consistency
    localStorage.setItem('epic-wildlife-reflection', JSON.stringify(fullData));
    console.log('✅ Wildlife reflection saved:', fullData);

    // Clear stickers before transitioning
    setReflectionData(prev => ({ ...prev, stickers: [] }));
    setSelectedSticker(null);
    setIsPlacingSticker(false);

    if (onComplete) {
      onComplete();
    }
  };

  // Vibe options (wildlife themed)
  const vibeOptions = [
    { emoji: "🌿", text: "Peaceful and serene vibes" },
    { emoji: "🦁", text: "Majestic and powerful" },
    { emoji: "🌊", text: "Flowing and graceful" },
    { emoji: "⚡", text: "Electric and exciting" },
    { emoji: "🎢", text: "Rollercoaster of emotions" },
    { emoji: "🌅", text: "Epic sunset energy" },
    { emoji: "🔥", text: "Intense and dramatic" },
    { emoji: "✨", text: "Magical and mysterious" },
    { emoji: "🏔️", text: "Grand and sweeping" },
    { emoji: "🌙", text: "Calm and atmospheric" }
  ];

  // Sticker options for marking up the composition
  const stickerOptions = [
    { emoji: "🔥", label: "Fire", description: "This part is amazing!" },
    { emoji: "⭐", label: "Star", description: "Great moment" },
    { emoji: "🎯", label: "Target", description: "Nailed it" },
    { emoji: "💡", label: "Idea", description: "Creative choice" },
    { emoji: "🔧", label: "Fix", description: "Could improve here" }
  ];

  // Handle sticker placement clicks
  useEffect(() => {
    if (!isPlacingSticker || !selectedSticker) return;

    const handleClick = (e) => {
      const modal = document.querySelector('[data-reflection-modal]');
      if (modal && modal.contains(e.target)) return;

      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;

      setReflectionData(prev => ({
        ...prev,
        stickers: [...prev.stickers, { emoji: selectedSticker, x, y }]
      }));
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isPlacingSticker, selectedSticker]);

  // If minimized, show small button (with submit button on steps 8-9)
  if (isMinimized) {
    return (
      <div className="fixed top-4 left-4 z-[100] flex flex-col gap-2">
        <button
          onClick={toggleMinimize}
          className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-lg shadow-lg hover:from-green-700 hover:to-teal-700 transition-all flex items-center gap-2"
        >
          <Maximize2 size={16} />
          <span className="font-semibold">Show Reflection</span>
        </button>
        {(currentStep === 8 || currentStep === 9) && (
          <button
            onClick={() => {
              if (currentStep === 8) {
                setSelectedSticker(null);
                setIsPlacingSticker(false);
                const fullData = { ...reflectionData, submittedAt: new Date().toISOString() };
                localStorage.setItem('epic-wildlife-reflection', JSON.stringify(fullData));
                setCurrentStep(9);
              } else {
                saveAndContinue();
              }
            }}
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
      {/* Sticker Overlay - displays placed stickers */}
      {reflectionData.stickers.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-[90]">
          {reflectionData.stickers.map((sticker, idx) => (
            <div
              key={idx}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 text-4xl drop-shadow-lg animate-bounce"
              style={{
                left: `${sticker.x}%`,
                top: `${sticker.y}%`,
                animationDelay: `${idx * 100}ms`,
                animationDuration: '0.5s',
                animationIterationCount: '1'
              }}
            >
              {sticker.emoji}
            </div>
          ))}
        </div>
      )}

      {/* Placing sticker indicator */}
      {isPlacingSticker && selectedSticker && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[110] bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg pointer-events-none">
          Click anywhere to place {selectedSticker}
        </div>
      )}

      <div data-reflection-modal className="fixed top-4 left-4 z-[100] w-96 max-h-[calc(100vh-2rem)] flex flex-col bg-white rounded-xl shadow-2xl border-2 border-green-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-3 rounded-t-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={20} />
          <h2 className="font-bold text-lg">
            {currentStep === 1 && "Choose Review Type"}
            {currentStep === 2 && "🎯 Confidence Check"}
            {currentStep === 3 && "Listen & Share"}
            {currentStep === 4 && "⭐ Star 1"}
            {currentStep === 5 && "⭐ Star 2"}
            {currentStep === 6 && "✨ Wish"}
            {currentStep === 7 && "🌍 Pick a Vibe"}
            {currentStep === 8 && "Place Stickers"}
            {currentStep === 9 && "📝 Summary"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Voice Controls */}
          <div className="flex items-center gap-1 bg-white/20 rounded-lg px-2 py-1">
            <button
              onClick={handleMuteToggle}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title={voiceEnabled ? "Mute voice" : "Enable voice"}
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
              />
            )}
          </div>
          {/* Minimize Button */}
          <button
            onClick={toggleMinimize}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Minimize"
          >
            <Minimize2 size={16} />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* STEP 1: Choose Review Type */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-5xl mb-2">🌍</div>
              <h3 className="font-bold text-gray-900">Whose composition?</h3>
            </div>

            <button
              onClick={() => handleReviewTypeSelection('self')}
              className="w-full p-4 text-left rounded-lg border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all"
            >
              <div className="font-bold text-gray-900">My own composition</div>
              <div className="text-sm text-gray-600">Self-reflect on your work</div>
            </button>

            <button
              onClick={() => handleReviewTypeSelection('partner')}
              className="w-full p-4 text-left rounded-lg border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all"
            >
              <div className="font-bold text-gray-900">A friend's composition</div>
              <div className="text-sm text-gray-600">Give peer feedback</div>
            </button>
          </div>
        )}

        {/* STEP 2: Confidence Check */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <p className="text-gray-700 text-center mb-4">
              How confident do you feel about your composition?
            </p>

            <div className="grid grid-cols-2 gap-3">
              {confidenceOptions.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleConfidenceSelection(option.label)}
                  className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    reflectionData.confidence === option.label
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <div className="text-3xl mb-2 text-center">{option.emoji}</div>
                  <div className="font-bold text-gray-800 text-center text-sm">{option.label}</div>
                  <div className="text-xs text-gray-500 text-center mt-1">{option.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Listen & Share */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-5xl mb-2">🎧</div>
              <h3 className="font-bold text-gray-900">Listen & Share</h3>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              {reflectionData.reviewType === 'self' ? (
                <div className="space-y-3 text-sm text-gray-700">
                  <p><strong>Listen to your entire composition.</strong></p>
                  <p>Pay attention to:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>How you used sectional form (Intro, A, A', Outro)</li>
                    <li>How the music matched the wildlife footage</li>
                    <li>The overall mood and texture changes</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-3 text-sm text-gray-700">
                  <p><strong>1. Share your score</strong> with {reflectionData.partnerName}</p>
                  <p><strong>2. Listen to {reflectionData.partnerName}'s composition</strong></p>
                  <p>Pay attention to their sectional form, mood matching, and texture.</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-sm text-gray-700">
                👆 <strong>Press play on the composition</strong> behind this panel to listen!
              </p>
            </div>

            <button
              onClick={() => setCurrentStep(4)}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all"
            >
              I've Listened → Continue
            </button>
          </div>
        )}

        {/* STEP 4: Star 1 */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <Star className="w-12 h-12 mx-auto text-yellow-500 fill-yellow-500 mb-2" />
              <h3 className="font-bold text-gray-900">Star 1: Song Form & Sections</h3>
              <p className="text-sm text-gray-600 mt-1">
                {reflectionData.reviewType === 'self'
                  ? 'What did you do well with sectional form?'
                  : `What did ${reflectionData.partnerName} do well?`
                }
              </p>
            </div>

            <div className="space-y-2">
              {[
                reflectionData.reviewType === 'self'
                  ? "using clear Intro, A, A', and Outro sections"
                  : "using clear sections effectively",
                reflectionData.reviewType === 'self'
                  ? "building up texture effectively through sections"
                  : "building up texture well through sections",
                reflectionData.reviewType === 'self'
                  ? "creating good contrast between sections"
                  : "creating good contrast between sections",
                reflectionData.reviewType === 'self'
                  ? "following the sectional loop form structure well"
                  : "following the form structure well",
                "Custom..."
              ].map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (option === "Custom...") {
                      setCustomInputs(prev => ({ ...prev, star1: true }));
                    } else {
                      setReflectionData(prev => ({ ...prev, star1: option }));
                      setCurrentStep(5);
                    }
                  }}
                  className="w-full p-3 text-left rounded-lg border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all text-sm"
                >
                  {option}
                </button>
              ))}

              {customInputs.star1 && (
                <div className="space-y-2">
                  <textarea
                    value={reflectionData.star1}
                    onChange={(e) => setReflectionData(prev => ({ ...prev, star1: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg text-sm"
                    rows={3}
                    placeholder="Type your response..."
                  />
                  <button
                    onClick={() => setCurrentStep(5)}
                    disabled={!reflectionData.star1.trim()}
                    className="w-full bg-green-600 text-white py-2 rounded-lg disabled:opacity-50"
                  >
                    Continue →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: Star 2 */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <Star className="w-12 h-12 mx-auto text-yellow-500 fill-yellow-500 mb-2" />
              <h3 className="font-bold text-gray-900">Star 2: Musical Choices</h3>
              <p className="text-sm text-gray-600 mt-1">
                {reflectionData.reviewType === 'self'
                  ? 'How well did your music support the wildlife video?'
                  : `How well did ${reflectionData.partnerName}'s music fit?`
                }
              </p>
            </div>

            <div className="space-y-2">
              {[
                "how the loops matched the mood of the footage",
                "how the section changes were well-timed",
                "how the texture changes enhanced the visual story",
                "how the music built tension and release effectively",
                "Custom..."
              ].map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (option === "Custom...") {
                      setCustomInputs(prev => ({ ...prev, star2: true }));
                    } else {
                      setReflectionData(prev => ({ ...prev, star2: option }));
                      setCurrentStep(6);
                    }
                  }}
                  className="w-full p-3 text-left rounded-lg border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all text-sm"
                >
                  {option}
                </button>
              ))}

              {customInputs.star2 && (
                <div className="space-y-2">
                  <textarea
                    value={reflectionData.star2}
                    onChange={(e) => setReflectionData(prev => ({ ...prev, star2: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg text-sm"
                    rows={3}
                    placeholder="Type your response..."
                  />
                  <button
                    onClick={() => setCurrentStep(6)}
                    disabled={!reflectionData.star2.trim()}
                    className="w-full bg-green-600 text-white py-2 rounded-lg disabled:opacity-50"
                  >
                    Continue →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 6: Wish */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <Sparkles className="w-12 h-12 mx-auto text-purple-500 mb-2" />
              <h3 className="font-bold text-gray-900">Wish: What to Try Next</h3>
              <p className="text-sm text-gray-600 mt-1">
                {reflectionData.reviewType === 'self'
                  ? 'What do you want to improve or try next time?'
                  : `What could ${reflectionData.partnerName} try next?`
                }
              </p>
            </div>

            <div className="space-y-2">
              {[
                reflectionData.reviewType === 'self'
                  ? "creating more dramatic section changes"
                  : "creating more dramatic section changes",
                reflectionData.reviewType === 'self'
                  ? "adding a B section for more variety"
                  : "adding a B section for more variety",
                reflectionData.reviewType === 'self'
                  ? "better matching music to video moments"
                  : "better matching music to video moments",
                reflectionData.reviewType === 'self'
                  ? "experimenting with different loop combinations"
                  : "trying different loop combinations",
                "Custom..."
              ].map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (option === "Custom...") {
                      setCustomInputs(prev => ({ ...prev, wish: true }));
                    } else {
                      setReflectionData(prev => ({ ...prev, wish: option }));
                      setCurrentStep(7);
                    }
                  }}
                  className="w-full p-3 text-left rounded-lg border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all text-sm"
                >
                  {option}
                </button>
              ))}

              {customInputs.wish && (
                <div className="space-y-2">
                  <textarea
                    value={reflectionData.wish}
                    onChange={(e) => setReflectionData(prev => ({ ...prev, wish: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg text-sm"
                    rows={3}
                    placeholder="Type your response..."
                  />
                  <button
                    onClick={() => setCurrentStep(7)}
                    disabled={!reflectionData.wish.trim()}
                    className="w-full bg-green-600 text-white py-2 rounded-lg disabled:opacity-50"
                  >
                    Continue →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 7: Vibe Selector */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <Smile className="w-12 h-12 mx-auto text-blue-500 mb-2" />
              <h3 className="font-bold text-gray-900">Pick a Vibe! 🌍</h3>
              <p className="text-sm text-gray-600 mt-1">
                If {reflectionData.reviewType === 'self' ? 'your' : `${reflectionData.partnerName}'s`} composition was a vibe, which would it be?
              </p>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {vibeOptions.map((vibe, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setReflectionData(prev => ({ ...prev, vibe: vibe.text }));
                    setCurrentStep(8); // Go to stickers step
                  }}
                  className="w-full p-3 text-left rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center gap-3"
                >
                  <span className="text-2xl">{vibe.emoji}</span>
                  <span className="text-gray-900 text-sm">{vibe.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 8: Place Stickers */}
        {currentStep === 8 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-700 text-center font-semibold">
              Place at least 3 feedback stickers
            </p>
            <p className="text-xs text-gray-500 text-center">
              {selectedSticker ? `Click on the DAW to place ${selectedSticker}` : 'Select a sticker, then click on the DAW'}
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
                      ? 'bg-green-500 scale-110 shadow-lg'
                      : 'bg-gray-100 hover:bg-green-100 border border-gray-200'
                  }`}
                  title={sticker.description}
                >
                  <span className="text-xl">{sticker.emoji}</span>
                </button>
              ))}
            </div>

            {/* Placed stickers count */}
            <p className={`text-center text-sm font-semibold ${reflectionData.stickers.length >= 3 ? 'text-green-600' : 'text-gray-500'}`}>
              {reflectionData.stickers.length}/3 stickers placed
            </p>

            {/* Placed stickers list */}
            {reflectionData.stickers.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-center">
                {reflectionData.stickers.map((sticker, idx) => (
                  <div key={idx} className="flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-200">
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
                const fullData = { ...reflectionData, submittedAt: new Date().toISOString() };
                localStorage.setItem('epic-wildlife-reflection', JSON.stringify(fullData));
                setCurrentStep(9);
              }}
              disabled={reflectionData.stickers.length < 3}
              className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                reflectionData.stickers.length >= 3
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue →
            </button>
          </div>
        )}

        {/* STEP 9: Summary - Read-Aloud Paragraph */}
        {currentStep === 9 && (
          <div className="space-y-4">
            {/* READ ALOUD HEADER */}
            <div className="bg-gradient-to-r from-green-600 to-teal-600 p-3 rounded-lg text-center">
              <p className="text-white font-bold text-lg">
                📖 Read this out loud:
              </p>
            </div>

            {/* Read-Aloud Paragraph Card */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-5 rounded-xl border-2 border-yellow-300 shadow-md">
              <p className="text-gray-900 text-lg leading-loose">
                {reflectionData.reviewType === 'self' ? (
                  <>
                    {reflectionData.confidence && (
                      <>I felt <strong>{getConfidencePhrase(reflectionData.confidence, false)}</strong> my composition.<br /><br /></>
                    )}
                    One thing I did well with the DAW was <strong>{reflectionData.star1.toLowerCase()}</strong>.<br /><br />
                    Something that worked well in my music was <strong>{reflectionData.star2.toLowerCase()}</strong>.<br /><br />
                    Next time, I want to try <strong>{reflectionData.wish.toLowerCase()}</strong>.<br /><br />
                    {reflectionData.vibe && (
                      <>Overall, my composition gave off <strong>{stripEmojiFromVibe(reflectionData.vibe)}</strong> vibes.</>
                    )}
                  </>
                ) : (
                  <>
                    Hey <strong>{reflectionData.partnerName}</strong>! I thought your composition was <strong>{getConfidencePhrase(reflectionData.confidence, true)}</strong>.<br /><br />
                    One thing you did really well with the DAW was <strong>{reflectionData.star1.toLowerCase()}</strong>.<br /><br />
                    Something that worked well in your music was <strong>{reflectionData.star2.toLowerCase()}</strong>.<br /><br />
                    I wonder what would happen if you tried <strong>{reflectionData.wish.toLowerCase()}</strong>.<br /><br />
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
                🏷️ Your feedback stickers are shown on the composition above.
              </p>
            )}

            {!viewMode && (
              <button
                onClick={saveAndContinue}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-teal-700 transition-all shadow-lg"
              >
                ✓ Complete Reflection
              </button>
            )}

            {viewMode && (
              <button
                onClick={onComplete}
                className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all"
              >
                Close
              </button>
            )}
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default WildlifeReflectionModal;