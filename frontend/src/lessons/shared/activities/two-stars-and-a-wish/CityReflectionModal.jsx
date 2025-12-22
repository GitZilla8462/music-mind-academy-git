// File: /src/lessons/shared/activities/two-stars-and-a-wish/CityReflectionModal.jsx
// City Soundscape Reflection Modal - Purple overlay that stays on top of composition
// Adapted from SportsReflectionModal for city soundscapes
// Allows students to reflect while composition remains accessible underneath
// ✅ UPDATED: "Read out loud" instruction moved to top of summary and made more prominent

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Star, Sparkles, Volume2, VolumeX, Minimize2, Maximize2, Smile } from 'lucide-react';

const CityReflectionModal = ({ compositionData, onComplete, viewMode = false, isSessionMode = false }) => {
  // Steps: 1=choose type, 2=listen & share, 3=star1, 4=star2, 5=wish, 6=meme, 7=summary
  const [currentStep, setCurrentStep] = useState(viewMode ? 7 : 1);
  const [reflectionData, setReflectionData] = useState({
    reviewType: null,
    partnerName: '',
    star1: '',
    star2: '',
    wish: '',
    meme: '',
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
      const saved = localStorage.getItem('city-reflection');
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

  // Speak on step change
  useEffect(() => {
    const partnerName = reflectionData.partnerName || 'your partner';
    
    const messages = {
      1: "Whose composition are you reviewing? Choose whether you'll reflect on your own work or a friend's composition.",
      2: reflectionData.reviewType === 'self'
        ? "Now, listen to your entire city soundscape from beginning to end. Pay attention to: How many layers you used. The overall texture. And how the layers work together to create a city atmosphere."
        : `Now it's time to share! First, share your soundscape with ${partnerName}. Then, listen to ${partnerName}'s entire city soundscape from beginning to end. Pay attention to the layers, texture, and overall atmosphere.`,
      3: "Star 1: Think about what went well with texture and layering.",
      4: "Star 2: Think about how well your loop choices worked together.",
      5: "Now for the Wish: What do you want to try or improve next time?",
      6: "Bonus question! If your city soundscape was a meme, which one would it be? Choose the one that best describes the vibe of your music!",
      7: reflectionData.reviewType === 'self' 
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
    }
    
    setCurrentStep(2);
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
    
    localStorage.setItem('city-reflection', JSON.stringify(fullData));
    console.log('✅ City reflection saved:', fullData);
    
    if (onComplete) {
      onComplete();
    }
  };

  // Meme options (city-themed)
  const memeOptions = [
    { emoji: "🏙️", text: "Big city energy (Bustling and alive)" },
    { emoji: "🌃", text: "Night city vibes (Mysterious and cool)" },
    { emoji: "🚕", text: "Rush hour chaos (Fast and hectic)" },
    { emoji: "🎭", text: "Cultural masterpiece (Elegant and refined)" },
    { emoji: "🎪", text: "Festival atmosphere (Fun and exciting)" },
    { emoji: "☕", text: "Cozy café vibes (Chill and relaxed)" },
    { emoji: "🏗️", text: "Under construction (Building something great)" },
    { emoji: "🌆", text: "Sunset skyline (Beautiful and peaceful)" },
    { emoji: "🎨", text: "Artistic expression (Creative and unique)" },
    { emoji: "🌟", text: "City lights magic (Dazzling and bright)" }
  ];

  // If minimized, show small button
  if (isMinimized) {
    return (
      <div className="fixed top-4 left-4 z-[100]">
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
    <div className="fixed top-4 left-4 z-[100] w-96 max-h-[calc(100vh-2rem)] flex flex-col bg-white rounded-xl shadow-2xl border-2 border-purple-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-t-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={20} />
          <h2 className="font-bold text-lg">
            {currentStep === 1 && "Choose Review Type"}
            {currentStep === 2 && "Listen & Share"}
            {currentStep === 3 && "⭐ Star 1"}
            {currentStep === 4 && "⭐ Star 2"}
            {currentStep === 5 && "✨ Wish"}
            {currentStep === 6 && "😄 Bonus: Meme"}
            {currentStep === 7 && "📝 Summary"}
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
              className="w-full p-4 text-left rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
            >
              <div className="font-semibold text-gray-900">My own composition</div>
              <div className="text-sm text-gray-600 mt-1">(Self-Reflection)</div>
            </button>

            <button
              onClick={() => handleReviewTypeSelection('partner')}
              className="w-full p-4 text-left rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
            >
              <div className="font-semibold text-gray-900">A friend's composition</div>
              <div className="text-sm text-gray-600 mt-1">(Peer Feedback)</div>
            </button>
          </div>
        )}

        {/* STEP 2: Listen & Share */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="font-bold text-gray-900">
                {reflectionData.reviewType === 'self' 
                  ? '🎧 Listen to Your City Soundscape' 
                  : '🔄 Share & Listen'
                }
              </h3>
            </div>

            {reflectionData.reviewType === 'self' ? (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-gray-700 mb-3">
                    Listen to your entire city soundscape from beginning to end.
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="font-semibold text-gray-800">Pay attention to:</div>
                    <ul className="list-disc list-inside space-y-1">
                      <li>How many layers you used and when</li>
                      <li>The overall texture (thin vs. thick)</li>
                      <li>How the layers work together to create a city atmosphere</li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep(3)}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700"
                >
                  Continue to Reflection →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="font-semibold text-gray-900 mb-2">📤 First: Share your soundscape</div>
                  <p className="text-sm text-gray-700">
                    Share your composition with {reflectionData.partnerName} so they can see and hear your work.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="font-semibold text-gray-900 mb-2">🎧 Then: Listen</div>
                  <p className="text-gray-700 mb-3">
                    Listen to {reflectionData.partnerName}'s entire city soundscape.
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="font-semibold text-gray-800">Pay attention to:</div>
                    <ul className="list-disc list-inside space-y-1">
                      <li>How many layers they used and when</li>
                      <li>The overall texture (thin vs. thick)</li>
                      <li>How the layers work together to create a city atmosphere</li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep(3)}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700"
                >
                  Continue to Reflection →
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Star 1 - Texture & Layering */}
        {currentStep === 3 && (
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
                  ? "I used multiple layers to create thick texture"
                  : `${reflectionData.partnerName} used multiple layers effectively`,
                reflectionData.reviewType === 'self'
                  ? "I layered loops effectively to build a city atmosphere"
                  : `${reflectionData.partnerName} created thick texture with many sounds`,
                reflectionData.reviewType === 'self'
                  ? "I created interesting texture by combining different loops"
                  : `${reflectionData.partnerName} made interesting layer combinations`,
                reflectionData.reviewType === 'self'
                  ? "I varied the texture throughout my composition"
                  : `${reflectionData.partnerName} varied the texture throughout`,
                "Custom..."
              ].map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (option === "Custom...") {
                      setCustomInputs(prev => ({ ...prev, star1: true }));
                    } else {
                      setReflectionData(prev => ({ ...prev, star1: option }));
                      setCurrentStep(4);
                    }
                  }}
                  className="w-full p-3 text-left rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
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
                    onClick={() => setCurrentStep(4)}
                    disabled={!reflectionData.star1.trim()}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg disabled:opacity-50"
                  >
                    Continue →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: Star 2 - Loop Choices */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <Star className="w-12 h-12 mx-auto text-yellow-500 fill-yellow-500 mb-2" />
              <h3 className="font-bold text-gray-900">Star 2: Loop Choices</h3>
              <p className="text-sm text-gray-600 mt-1">
                {reflectionData.reviewType === 'self'
                  ? 'How well did your loop choices work together?'
                  : `How well did ${reflectionData.partnerName}'s loops work together?`
                }
              </p>
            </div>

            <div className="space-y-2">
              {[
                reflectionData.reviewType === 'self'
                  ? "My loops blended together nicely"
                  : "The loops blended together nicely",
                reflectionData.reviewType === 'self'
                  ? "I chose loops that created a good city vibe"
                  : "The loops created a good city atmosphere",
                reflectionData.reviewType === 'self'
                  ? "My loop combinations were creative and interesting"
                  : "The loop combinations were creative",
                reflectionData.reviewType === 'self'
                  ? "The different layers complemented each other well"
                  : "The layers complemented each other well",
                "Custom..."
              ].map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (option === "Custom...") {
                      setCustomInputs(prev => ({ ...prev, star2: true }));
                    } else {
                      setReflectionData(prev => ({ ...prev, star2: option }));
                      setCurrentStep(5);
                    }
                  }}
                  className="w-full p-3 text-left rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
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
                    onClick={() => setCurrentStep(5)}
                    disabled={!reflectionData.star2.trim()}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg disabled:opacity-50"
                  >
                    Continue →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: Wish */}
        {currentStep === 5 && (
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
                  ? "I want to add even more layers for thicker texture"
                  : `${reflectionData.partnerName} could add more layers`,
                reflectionData.reviewType === 'self'
                  ? "I want to try different loop combinations"
                  : `${reflectionData.partnerName} could try different combinations`,
                reflectionData.reviewType === 'self'
                  ? "I want to vary the texture more (thin and thick sections)"
                  : `${reflectionData.partnerName} could vary the texture more`,
                reflectionData.reviewType === 'self'
                  ? "I want to experiment with different volumes and timing"
                  : `${reflectionData.partnerName} could experiment with volumes`,
                "Custom..."
              ].map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (option === "Custom...") {
                      setCustomInputs(prev => ({ ...prev, wish: true }));
                    } else {
                      setReflectionData(prev => ({ ...prev, wish: option }));
                      setCurrentStep(6);
                    }
                  }}
                  className="w-full p-3 text-left rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
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
                    onClick={() => setCurrentStep(6)}
                    disabled={!reflectionData.wish.trim()}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg disabled:opacity-50"
                  >
                    Continue →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 6: BONUS - Meme Question */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <Smile className="w-12 h-12 mx-auto text-blue-500 mb-2" />
              <h3 className="font-bold text-gray-900">Bonus: Meme Energy! 😄</h3>
              <p className="text-sm text-gray-600 mt-1">
                If {reflectionData.reviewType === 'self' ? 'your' : `${reflectionData.partnerName}'s`} city soundscape was a meme, which would it be?
              </p>
            </div>

            <div className="space-y-2">
              {memeOptions.map((meme, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setReflectionData(prev => ({ ...prev, meme: meme.text }));
                    setCurrentStep(7);
                  }}
                  className="w-full p-3 text-left rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center gap-3"
                >
                  <span className="text-3xl">{meme.emoji}</span>
                  <span className="text-gray-900">{meme.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 7: Summary - ✅ UPDATED with prominent "read out loud" at top */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-2" />
              <h3 className="font-bold text-gray-900">Your Reflection Summary</h3>
            </div>

            {/* ✅ READ OUT LOUD INSTRUCTION - NOW AT TOP AND PROMINENT */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 border-2 border-blue-700 shadow-lg animate-pulse">
              <p className="text-white text-center font-bold text-lg leading-relaxed">
                📖 Now read your reflection out loud
                {reflectionData.reviewType === 'self' 
                  ? ' to yourself or share it with a neighbor!'
                  : ` to ${reflectionData.partnerName}!`
                }
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-200 space-y-3">
              <div>
                <div className="flex items-center gap-2 font-bold text-gray-900 mb-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  Star 1: Texture & Layering
                </div>
                <p className="text-gray-700">{reflectionData.star1}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 font-bold text-gray-900 mb-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  Star 2: Loop Choices
                </div>
                <p className="text-gray-700">{reflectionData.star2}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 font-bold text-gray-900 mb-1">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Wish: Try Next
                </div>
                <p className="text-gray-700">{reflectionData.wish}</p>
              </div>

              {reflectionData.meme && (
                <div>
                  <div className="flex items-center gap-2 font-bold text-gray-900 mb-1">
                    <Smile className="w-4 h-4 text-blue-500" />
                    Meme Energy
                  </div>
                  <p className="text-gray-700">{reflectionData.meme}</p>
                </div>
              )}
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

export default CityReflectionModal;