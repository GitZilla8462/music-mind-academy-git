// File: /src/lessons/shared/activities/two-stars-and-a-wish/SportsReflectionModal.jsx
// Sports Reflection Modal - Purple overlay that stays on top of composition
// Steps: 1=choose type, 2=confidence, 3=listen & share, 4=star1, 5=star2, 6=wish, 7=vibe, 8=summary

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Star, Sparkles, Volume2, VolumeX, Minimize2, Maximize2, Smile } from 'lucide-react';

// Chromebook detection for cursor handling
const isChromebook = typeof navigator !== 'undefined' && (
  /CrOS/.test(navigator.userAgent) ||
  (navigator.userAgentData?.platform === 'Chrome OS')
);

const SportsReflectionModal = ({ compositionData, onComplete, viewMode = false, isSessionMode = false }) => {
  console.log('🎭 SportsReflectionModal MOUNTED', { viewMode, isSessionMode, compositionData: !!compositionData });

  // Steps: 1=choose type, 2=confidence, 3=listen & share, 4=star1, 5=star2, 6=wish, 7=vibe, 8=summary
  const [currentStep, setCurrentStep] = useState(viewMode ? 8 : 1);
  const [reflectionData, setReflectionData] = useState({
    reviewType: null,
    partnerName: '',
    confidence: '',
    star1: '',
    star2: '',
    wish: '',
    vibe: '',
    submittedAt: null
  });

  // For dropdown selections
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
      const saved = localStorage.getItem('sports-reflection');
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
        ? "Now, listen to your entire sports composition from beginning to end. Pay attention to: How many layers you used. How the music matched the sports action. And the overall energy and excitement."
        : `Now it's time to share! First, share your score with ${partnerName}. Then, listen to ${partnerName}'s entire sports composition from beginning to end. Pay attention to the layers, how it matches the action, and the energy level.`,
      4: "Star 1: Think about what went well with texture and layering.",
      5: "Star 2: Think about how well your music matched the sports action.",
      6: "Now for the Wish: What do you want to try or improve next time?",
      7: "Pick a vibe! If your composition was a meme, which one would it be? Choose the one that best describes the vibe of your music!",
      8: reflectionData.reviewType === 'self'
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
      // Prompt for partner name
      const name = prompt("What is your partner's name?");
      if (name) {
        setReflectionData(prev => ({ ...prev, partnerName: name }));
      }
      setCurrentStep(3); // Skip confidence for partner review, go to listen
    } else {
      setCurrentStep(2); // Go to confidence check for self review
    }
  };

  const handleConfidenceSelection = (label) => {
    setReflectionData(prev => ({ ...prev, confidence: label }));
    setCurrentStep(3); // Go to listen
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

    localStorage.setItem('sports-reflection', JSON.stringify(fullData));
    console.log('✅ Sports reflection saved:', fullData);

    if (onComplete) {
      onComplete();
    }
  };

  // Vibe options (sports themed)
  const vibeOptions = [
    { emoji: "🔥", text: "This is fine (Everything's intense!)" },
    { emoji: "💪", text: "Strong and powerful vibes" },
    { emoji: "🚀", text: "To the moon! (Epic energy)" },
    { emoji: "😎", text: "Cool and confident" },
    { emoji: "🎢", text: "Rollercoaster of emotions" },
    { emoji: "⚡", text: "Electric and shocking" },
    { emoji: "🌟", text: "Main character energy" },
    { emoji: "🎯", text: "On point and precise" },
    { emoji: "🤯", text: "Mind-blowing intensity" },
    { emoji: "👑", text: "Champion/Winner vibes" }
  ];

  // If minimized, show small button
  if (isMinimized) {
    return (
      <div className="fixed top-4 left-4 z-[100] flex flex-col gap-2">
        <button
          onClick={toggleMinimize}
          className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:from-orange-700 hover:to-red-700 transition-all flex items-center gap-2"
        >
          <Maximize2 size={16} />
          <span className="font-semibold">Show Reflection</span>
        </button>
        {currentStep === 8 && (
          <button
            onClick={saveAndContinue}
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
    <div data-reflection-modal className={`fixed top-4 left-4 z-[100] w-96 max-h-[calc(100vh-2rem)] flex flex-col bg-white rounded-xl shadow-2xl border-2 border-orange-200 ${isChromebook ? 'chromebook-hide-cursor' : ''}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-3 rounded-t-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={20} />
          <h2 className="font-bold text-lg">
            {currentStep === 1 && "Choose Review Type"}
            {currentStep === 2 && "🎯 Confidence Check"}
            {currentStep === 3 && (reflectionData.reviewType === 'self' ? "🎧 Listen" : `🎧 Listen to ${reflectionData.partnerName}'s Composition`)}
            {currentStep === 4 && "⭐ Star 1"}
            {currentStep === 5 && "⭐ Star 2"}
            {currentStep === 6 && "✨ Wish"}
            {currentStep === 7 && "😄 Pick a Vibe"}
            {currentStep === 8 && "📝 Summary"}
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

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* STEP 1: Choose Review Type */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="font-bold text-gray-900 mb-2">Whose composition are you reviewing?</h3>
              <p className="text-sm text-gray-600">
                Ask your teacher which type of review to do
              </p>
            </div>

            <button
              onClick={() => handleReviewTypeSelection('self')}
              className="w-full p-4 text-left rounded-lg border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all"
            >
              <div className="font-semibold text-gray-900">My own composition</div>
              <div className="text-sm text-gray-600 mt-1">(Self-Reflection)</div>
            </button>

            <button
              onClick={() => handleReviewTypeSelection('partner')}
              className="w-full p-4 text-left rounded-lg border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all"
            >
              <div className="font-semibold text-gray-900">A friend's composition</div>
              <div className="text-sm text-gray-600 mt-1">(Peer Feedback)</div>
            </button>
          </div>
        )}

        {/* STEP 2: Confidence Check */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <p className="text-gray-700 text-center mb-4">
              How confident do you feel about {reflectionData.reviewType === 'self' ? 'your' : "your partner's"} composition?
            </p>

            <div className="grid grid-cols-2 gap-3">
              {confidenceOptions.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleConfidenceSelection(option.label)}
                  className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    reflectionData.confidence === option.label
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
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

        {/* STEP 3: Listen */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-lg font-bold text-gray-800 mb-2">
                {reflectionData.reviewType === 'self'
                  ? '🎧 Listen to Your Composition'
                  : `🎧 Listen to ${reflectionData.partnerName}'s Composition`
                }
              </p>
              <div className="text-gray-700 space-y-2">
                <p className="font-semibold">Pay attention to:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>How the loops work together</li>
                  <li>The overall mood and feel</li>
                  <li>What stands out to you</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep(4)}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700"
            >
              I Listened →
            </button>
          </div>
        )}

        {/* STEP 4: Star 1 - Texture & Layering */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <Star className="w-12 h-12 mx-auto text-yellow-500 fill-yellow-500 mb-2" />
              <h3 className="font-bold text-gray-900">Star 1: Texture & Layering</h3>
              <p className="text-sm text-gray-600 mt-1">
                {reflectionData.reviewType === 'self'
                  ? 'What did you do well with texture and layering?'
                  : `What did ${reflectionData.partnerName} do well?`
                }
              </p>
            </div>

            <div className="space-y-2">
              {[
                reflectionData.reviewType === 'self'
                  ? "using multiple layers to build energy"
                  : "using multiple layers effectively",
                reflectionData.reviewType === 'self'
                  ? "layering loops at exciting moments in the video"
                  : "layering loops at exciting moments",
                reflectionData.reviewType === 'self'
                  ? "creating thick texture with many loops playing together"
                  : "creating thick texture with many sounds",
                reflectionData.reviewType === 'self'
                  ? "varying the texture by adding and removing layers"
                  : "varying the texture throughout",
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
                  className="w-full p-3 text-left rounded-lg border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all"
                >
                  {option}
                </button>
              ))}

              {customInputs.star1 && (
                <div className="space-y-2">
                  <textarea
                    value={reflectionData.star1}
                    onChange={(e) => setReflectionData(prev => ({ ...prev, star1: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Type your response..."
                  />
                  <button
                    onClick={() => setCurrentStep(5)}
                    disabled={!reflectionData.star1.trim()}
                    className="w-full bg-orange-600 text-white py-2 rounded-lg disabled:opacity-50"
                  >
                    Continue →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: Star 2 - Matching the Action */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <Star className="w-12 h-12 mx-auto text-yellow-500 fill-yellow-500 mb-2" />
              <h3 className="font-bold text-gray-900">Star 2: Matching the Action</h3>
              <p className="text-sm text-gray-600 mt-1">
                {reflectionData.reviewType === 'self'
                  ? 'How well did your music match the sports action?'
                  : `How well did ${reflectionData.partnerName}'s music match?`
                }
              </p>
            </div>

            <div className="space-y-2">
              {[
                reflectionData.reviewType === 'self'
                  ? "how the music built energy during intense moments"
                  : "how the music built energy during intense moments",
                reflectionData.reviewType === 'self'
                  ? "how the layers matched the pace of the sports action"
                  : "how the layers matched the pace of the action",
                reflectionData.reviewType === 'self'
                  ? "how my loop choices fit the sports mood perfectly"
                  : "how the loop choices fit the sports mood well",
                reflectionData.reviewType === 'self'
                  ? "the timing of my layers matching key moments"
                  : "the timing matching key moments perfectly",
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
                  className="w-full p-3 text-left rounded-lg border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all"
                >
                  {option}
                </button>
              ))}

              {customInputs.star2 && (
                <div className="space-y-2">
                  <textarea
                    value={reflectionData.star2}
                    onChange={(e) => setReflectionData(prev => ({ ...prev, star2: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Type your response..."
                  />
                  <button
                    onClick={() => setCurrentStep(6)}
                    disabled={!reflectionData.star2.trim()}
                    className="w-full bg-orange-600 text-white py-2 rounded-lg disabled:opacity-50"
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
                  ? "adding even more layers for fuller sound"
                  : "adding more layers for fuller sound",
                reflectionData.reviewType === 'self'
                  ? "trying different combinations of loops"
                  : "trying different loop combinations",
                reflectionData.reviewType === 'self'
                  ? "timing layers more precisely"
                  : "timing layers more precisely",
                reflectionData.reviewType === 'self'
                  ? "experimenting with different volumes"
                  : "experimenting with different volumes",
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
                  className="w-full p-3 text-left rounded-lg border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all"
                >
                  {option}
                </button>
              ))}

              {customInputs.wish && (
                <div className="space-y-2">
                  <textarea
                    value={reflectionData.wish}
                    onChange={(e) => setReflectionData(prev => ({ ...prev, wish: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Type your response..."
                  />
                  <button
                    onClick={() => setCurrentStep(7)}
                    disabled={!reflectionData.wish.trim()}
                    className="w-full bg-orange-600 text-white py-2 rounded-lg disabled:opacity-50"
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
              <h3 className="font-bold text-gray-900">Pick a Vibe! 😄</h3>
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
                    setCurrentStep(8); // Go to summary step
                  }}
                  className="w-full p-3 text-left rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center gap-3"
                >
                  <span className="text-3xl">{vibe.emoji}</span>
                  <span className="text-gray-900">{vibe.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 8: Summary - Read-Aloud Paragraph */}
        {currentStep === 8 && (
          <div className="space-y-4">
            {/* READ ALOUD HEADER */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-3 rounded-lg text-center">
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

            {!viewMode && (
              <button
                onClick={saveAndContinue}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg"
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
  );
};

export default SportsReflectionModal;
