// File: /src/lessons/shared/activities/two-stars-and-a-wish/WildlifeReflectionModal.jsx
// Epic Wildlife - Two Stars and a Wish Reflection Modal
// ✅ UPDATED: Floating top-left panel (like SportsReflectionModal)
// Allows students to play their composition while reflecting

import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronRight, ChevronLeft, Check, Sparkles, Volume2, VolumeX, Minimize2, Maximize2, CheckCircle, Smile } from 'lucide-react';
import { saveReflection, getReflection } from '../../../film-music-project/lesson3/lesson3StorageUtils';

const WildlifeReflectionModal = ({
  compositionData,
  onComplete,
  viewMode = false,
  isSessionMode = false
}) => {
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

  // Speak on step change
  useEffect(() => {
    const partnerName = reflectionData.partnerName || 'your partner';
    
    const messages = {
      1: "Whose composition are you reviewing? Choose whether you'll reflect on your own work or a friend's composition.",
      2: reflectionData.reviewType === 'self'
        ? "Now, listen to your entire wildlife composition from beginning to end. Pay attention to: How you used sectional form. How the music matched the nature footage. And the overall mood and texture."
        : `Now it's time to share! First, share your score with ${partnerName}. Then, listen to ${partnerName}'s entire wildlife composition from beginning to end.`,
      3: "Star 1: Think about what went well with song form and sections.",
      4: "Star 2: Think about how well the music supported the wildlife video.",
      5: "Now for the Wish: What do you want to try or improve next time?",
      6: "Bonus question! If the composition was a meme, which one would it be?",
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
    
    if (onComplete) {
      onComplete();
    }
  };

  // Meme options
  const memeOptions = [
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

  // If minimized, show small button
  if (isMinimized) {
    return (
      <div className="fixed top-4 left-4 z-40">
        <button
          onClick={toggleMinimize}
          className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-lg shadow-lg hover:from-green-700 hover:to-teal-700 transition-all flex items-center gap-2"
        >
          <Maximize2 size={16} />
          <span className="font-semibold">Show Reflection</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-4 z-40 w-96 max-h-[calc(100vh-2rem)] flex flex-col bg-white rounded-xl shadow-2xl border-2 border-green-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-3 rounded-t-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={20} />
          <h2 className="font-bold text-lg">
            {currentStep === 1 && "Choose Review Type"}
            {currentStep === 2 && "Listen & Share"}
            {currentStep === 3 && "⭐ Star 1"}
            {currentStep === 4 && "⭐ Star 2"}
            {currentStep === 5 && "✨ Wish"}
            {currentStep === 6 && "🌍 Bonus: Meme"}
            {currentStep === 7 && "📝 Summary"}
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

        {/* STEP 2: Listen & Share */}
        {currentStep === 2 && (
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
              onClick={() => setCurrentStep(3)}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all"
            >
              I've Listened → Continue
            </button>
          </div>
        )}

        {/* STEP 3: Star 1 */}
        {currentStep === 3 && (
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
                  ? "I used clear Intro, A, A', and Outro sections"
                  : `${reflectionData.partnerName} used clear sections effectively`,
                reflectionData.reviewType === 'self'
                  ? "I built up texture effectively through sections"
                  : `${reflectionData.partnerName} built up texture well`,
                reflectionData.reviewType === 'self'
                  ? "I created good contrast between sections"
                  : `${reflectionData.partnerName} created good contrast`,
                reflectionData.reviewType === 'self'
                  ? "I followed the sectional loop form structure well"
                  : `${reflectionData.partnerName} followed the form well`,
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
                    onClick={() => setCurrentStep(4)}
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

        {/* STEP 4: Star 2 */}
        {currentStep === 4 && (
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
                "The loops matched the mood of the footage",
                "The section changes were well-timed",
                "The texture changes enhanced the visual story",
                "The music built tension and release effectively",
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
                    onClick={() => setCurrentStep(5)}
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
                  ? "I want to create more dramatic section changes"
                  : `${reflectionData.partnerName} could create more dramatic changes`,
                reflectionData.reviewType === 'self'
                  ? "I want to try adding a B section"
                  : `${reflectionData.partnerName} could try adding a B section`,
                reflectionData.reviewType === 'self'
                  ? "I want to better match music to video moments"
                  : `${reflectionData.partnerName} could better match the video`,
                reflectionData.reviewType === 'self'
                  ? "I want to experiment with different loop combinations"
                  : `${reflectionData.partnerName} could try different loops`,
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
                    onClick={() => setCurrentStep(6)}
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

        {/* STEP 6: BONUS - Meme Question */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <Smile className="w-12 h-12 mx-auto text-blue-500 mb-2" />
              <h3 className="font-bold text-gray-900">Bonus: Meme Energy! 🌍</h3>
              <p className="text-sm text-gray-600 mt-1">
                If {reflectionData.reviewType === 'self' ? 'your' : `${reflectionData.partnerName}'s`} composition was a vibe, which would it be?
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
                  <span className="text-2xl">{meme.emoji}</span>
                  <span className="text-gray-900 text-sm">{meme.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 7: Summary */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-2" />
              <h3 className="font-bold text-gray-900">Your Reflection Summary</h3>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-4 border-2 border-green-200 space-y-3 text-sm">
              <div>
                <div className="flex items-center gap-2 font-bold text-gray-900 mb-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  Star 1: Song Form
                </div>
                <p className="text-gray-700">{reflectionData.star1}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 font-bold text-gray-900 mb-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  Star 2: Musical Choices
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
                    Vibe Energy
                  </div>
                  <p className="text-gray-700">{reflectionData.meme}</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-sm text-gray-700">
                📖 <strong>Now read your reflection out loud</strong>
                {reflectionData.reviewType === 'self' 
                  ? ' to yourself or share it with a neighbor.'
                  : ` to ${reflectionData.partnerName}.`
                }
              </p>
            </div>

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
  );
};

export default WildlifeReflectionModal;