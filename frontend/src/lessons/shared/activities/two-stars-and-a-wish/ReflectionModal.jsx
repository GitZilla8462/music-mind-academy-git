// File: /src/lessons/shared/activities/two-stars-and-a-wish/ReflectionModal.jsx
// UPDATED: Simplified reflection flow (stickers removed)
// Steps: 1=choose type, 2=partner name (peer only), 3=listen, 4=star1, 5=star2, 6=wish, 7=vibe, 8=summary

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Star, Sparkles, Volume2, VolumeX, HelpCircle, Minimize2, Maximize2, Smile } from 'lucide-react';
import { SELF_REFLECTION_PROMPTS, PARTNER_REFLECTION_OPTIONS } from './reflectionPrompts';
import { saveStudentWork, getClassAuthInfo, parseActivityId } from '../../../../utils/studentWorkStorage';
import { loadStudentWork as loadFromFirebase } from '../../../../firebase/studentWork';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useSession } from '../../../../context/SessionContext';

// Chromebook detection for cursor handling
const isChromebook = typeof navigator !== 'undefined' && (
  /CrOS/.test(navigator.userAgent) ||
  (navigator.userAgentData?.platform === 'Chrome OS') ||
  (navigator.maxTouchPoints > 0 && /Macintosh/.test(navigator.userAgent))
);

const ReflectionModal = ({ compositionData, onComplete, viewMode: viewModeProp = false, isSessionMode = false, activityId = null, reflectionKey = 'school-beneath-reflection' }) => {
  // Steps: 1=choose type, 2=partner name (peer only), 3=listen, 4=star1, 5=star2, 6=wish, 7=vibe, 8=summary
  const [isEditing, setIsEditing] = useState(false);
  const viewMode = viewModeProp && !isEditing;
  const [currentStep, setCurrentStep] = useState(viewModeProp ? 8 : 1);
  const [reflectionData, setReflectionData] = useState({
    reviewType: null,
    partnerName: '',
    star1: '',
    star2: '',
    wish: '',
    vibe: '',
    submittedAt: null
  });

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
  const componentMountTimeRef = useRef(Date.now());
  const lastSaveCommandRef = useRef(null);

  // Refs for latest state — used by save command handler to avoid stale closures
  const reflectionDataRef = useRef(reflectionData);
  const currentStepRef = useRef(currentStep);
  useEffect(() => { reflectionDataRef.current = reflectionData; }, [reflectionData]);
  useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);

  // Session code for save command listener
  const { sessionCode } = useSession();
  const classCode = new URLSearchParams(window.location.search).get('classCode');
  const effectiveSessionCode = sessionCode || classCode;

  // Save current progress (even if incomplete) — used by teacher save command and submit
  const saveProgress = () => {
    const progressData = {
      ...reflectionDataRef.current,
      savedAt: new Date().toISOString(),
      currentStep: currentStepRef.current,
      isComplete: currentStepRef.current === 8
    };
    localStorage.setItem(reflectionKey, JSON.stringify(progressData));

    if (activityId) {
      saveStudentWork(activityId, {
        title: 'Reflection',
        emoji: '\uD83D\uDCDD',
        type: 'reflection',
        data: progressData
      });
    }
    console.log('💾 Reflection progress saved');
  };

  // Listen for teacher's save command — uses refs so listener is set up once, never stale
  useEffect(() => {
    if (!effectiveSessionCode || !isSessionMode || viewMode) return;

    const db = getDatabase();
    const saveCommandRef = ref(db, `sessions/${effectiveSessionCode}/saveCommand`);

    const unsubscribe = onValue(saveCommandRef, (snapshot) => {
      const saveCommand = snapshot.val();
      if (!saveCommand) return;

      // Only process commands issued after mount
      if (saveCommand <= componentMountTimeRef.current) {
        lastSaveCommandRef.current = saveCommand;
        return;
      }

      if (saveCommand !== lastSaveCommandRef.current) {
        lastSaveCommandRef.current = saveCommand;
        console.log('💾 Teacher save command received in reflection!');
        saveProgress();
      }
    });

    return () => unsubscribe();
  }, [effectiveSessionCode, isSessionMode, viewMode]);

  // Load saved reflection if in view mode — tries localStorage first, then Firebase fallback
  useEffect(() => {
    if (!viewModeProp) return;

    // Try localStorage first
    const saved = localStorage.getItem(reflectionKey);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setReflectionData(data);
        return; // Found locally, no need for Firebase
      } catch (error) {
        console.error('Error loading reflection:', error);
      }
    }

    // Firebase fallback for authenticated students (e.g., different device)
    if (activityId) {
      const authInfo = getClassAuthInfo();
      if (authInfo?.uid) {
        const { lessonId, activityId: parsedActivityId } = parseActivityId(activityId);
        loadFromFirebase(authInfo.uid, lessonId, parsedActivityId).then((firebaseData) => {
          if (firebaseData?.data) {
            console.log('☁️ Loaded reflection from Firebase:', activityId);
            setReflectionData(firebaseData.data);
            // Cache locally for future loads
            localStorage.setItem(reflectionKey, JSON.stringify(firebaseData.data));
          }
        }).catch((err) => {
          console.warn('⚠️ Firebase reflection load failed:', err.message);
        });
      }
    }
  }, [viewModeProp, reflectionKey, activityId]);

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

  // Speak on step change
  useEffect(() => {
    const partnerName = reflectionData.partnerName || 'your partner';

    const messages = {
      1: "Choose how you want to reflect. You can review your own work or give feedback to a partner.",
      2: "Who are you giving feedback to? Enter your partner's first name.",
      3: reflectionData.reviewType === 'self'
        ? "Listen to your entire film score from beginning to end. Pay attention to how you used the DAW tools, how loops are timed with the video, and the overall sound and mood."
        : `Get ready to share with ${partnerName}. When they come to your screen, they'll listen to your composition. Then you'll read your feedback out loud.`,
      4: reflectionData.reviewType === 'self'
        ? "Star 1: What did you do well with using the DAW tools?"
        : `Star 1: What did ${partnerName} do well with using the DAW tools?`,
      5: reflectionData.reviewType === 'self'
        ? "Star 2: What worked well with your loop timing and music sound?"
        : `Star 2: What worked well with ${partnerName}'s loop timing and music sound?`,
      6: reflectionData.reviewType === 'self'
        ? "Now for the Wish: What do you want to try next time?"
        : `Now for the Wish: What could ${partnerName} try next time?`,
      7: reflectionData.reviewType === 'self'
        ? "Pick a vibe! If your composition was a movie mood, which one would it be?"
        : `Pick a vibe! If ${partnerName}'s composition was a movie mood, which one would it be?`,
      8: reflectionData.reviewType === 'self'
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
      setCurrentStep(3); // Skip partner name, go to listen
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
    setCurrentStep(3); // Go to listen
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

  const handleSubmitReflection = async () => {
    // Save reflection data
    const finalData = {
      ...reflectionData,
      submittedAt: new Date().toISOString()
    };
    localStorage.setItem(reflectionKey, JSON.stringify(finalData));

    // Save to Firebase for teacher grading view — await so it completes before navigating away
    if (activityId) {
      const result = saveStudentWork(activityId, {
        title: 'Reflection',
        emoji: '\uD83D\uDCDD',
        type: 'reflection',
        data: finalData
      });
      // Wait for Firebase sync + submission to complete before transitioning
      if (result?._firebaseSync) {
        await result._firebaseSync;
      }
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
      case 3: return reflectionData.reviewType === 'self' ? "🎧 Listen" : `🎧 Listen to ${reflectionData.partnerName}'s Composition`;
      case 4: return "⭐ Star 1";
      case 5: return "⭐ Star 2";
      case 6: return "✨ Wish";
      case 7: return "🎭 Pick a Vibe";
      case 8: return "📝 Summary";
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
        {currentStep === 8 && (
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
    <div data-reflection-modal className={`fixed top-4 left-4 z-[100] w-96 max-h-[calc(100dvh-2rem)] flex flex-col bg-white rounded-xl shadow-2xl border-2 border-purple-200 ${isChromebook ? 'chromebook-hide-cursor' : ''}`} style={{ maxHeight: 'calc(100dvh - 2rem)' }}>
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
                  <div className="font-bold text-gray-800 text-lg">Reflect Solo</div>
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
                  <div className="font-bold text-gray-800 text-lg">Reflect with Partner</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Review with a classmate
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

        {/* STEP 3: Listen */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
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
              onClick={goToNextStep}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              I Listened →
            </button>
          </div>
        )}

        {/* STEP 4: Star 1 */}
        {currentStep === 4 && (
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

        {/* STEP 5: Star 2 */}
        {currentStep === 5 && (
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

        {/* STEP 6: Wish */}
        {currentStep === 6 && (
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

        {/* STEP 7: Vibe Selector */}
        {currentStep === 7 && (
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
                    setCurrentStep(8);
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

        {/* STEP 8: Summary */}
        {currentStep === 8 && (
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

            {/* SUBMIT or EDIT BUTTON */}
            {viewMode ? (
              <button
                onClick={() => {
                  setIsEditing(true);
                  setCurrentStep(4);
                }}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Star size={20} />
                Edit Response
              </button>
            ) : (
              <button
                onClick={handleSubmitReflection}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                Submit Reflection and play Name That Loop!
              </button>
            )}
          </div>
        )}

        {/* Hint Section */}
        {showHint && currentStep !== 8 && (
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
