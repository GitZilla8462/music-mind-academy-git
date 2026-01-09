// File: DAWLoadingScreen.jsx
// Fun loading screen for MusicComposer with rotating music-themed messages
// Designed for middle school students (8th grade humor)

import React, { useState, useEffect } from 'react';

// Funny music-themed loading messages
const LOADING_MESSAGES = [
  // Instruments Being Dramatic
  "Waking up the drums... they're grumpy",
  "Convincing the bass to stop being so low-key...",
  "The strings are having a meltdown, one sec...",
  "Brass section is warming up... loudly",
  "Telling the triangle it's important too...",
  "Synths are arguing about who sounds cooler...",
  "Piano keys are stretching their fingers...",

  // Studio/Producer Vibes
  "Downloading more cowbell...",
  "Adding that extra sparkle to the mix...",
  "Cranking the vibes to 11...",
  "Finding where the beat dropped...",
  "Making sure everything slaps...",
  "Polishing the audio diamonds...",

  // Technical But Funny
  "Teaching robots to feel the rhythm...",
  "Untangling the audio spaghetti...",
  "Warming up the woofers... woof",
  "Calibrating the boom and the bap...",
  "Defragmenting the funk...",
  "Compressing the chaos...",

  // Beat/Rhythm Jokes
  "The beat is loading... don't drop it",
  "Loading sick beats... they need rest",
  "Your fire track is pre-heating...",
];

// Shuffle array to randomize order each time
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const DAWLoadingScreen = ({
  duration = 3000,  // Total loading time in ms
  onComplete,       // Callback when loading finishes
  showProgress = true
}) => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [messages] = useState(() => shuffleArray(LOADING_MESSAGES));
  const [isComplete, setIsComplete] = useState(false);

  // Progress bar animation
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100 && !isComplete) {
        setIsComplete(true);
        clearInterval(interval);
        // Small delay before calling onComplete for smooth transition
        setTimeout(() => {
          onComplete?.();
        }, 300);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onComplete, isComplete]);

  // Rotate messages every 1.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        {/* Animated music icon */}
        <div className="mb-6 relative">
          <div className="text-6xl animate-bounce">
            🎵
          </div>
          {/* Pulsing rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border-2 border-blue-500/30 animate-ping" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-2">
          Music Composer
        </h2>

        {/* Funny loading message */}
        <div className="h-8 flex items-center justify-center mb-6">
          <p className="text-blue-300 text-lg transition-opacity duration-300">
            {messages[messageIndex]}
          </p>
        </div>

        {/* Progress bar */}
        {showProgress && (
          <div className="w-full bg-gray-700 rounded-full h-3 mb-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-100 ease-out"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
                boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)'
              }}
            />
          </div>
        )}

        {/* Progress percentage */}
        <p className="text-gray-400 text-sm">
          {Math.round(progress)}% loaded
        </p>

        {/* Bouncing equalizer bars */}
        <div className="flex justify-center gap-1 mt-6">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-2 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full"
              style={{
                height: '24px',
                animation: `equalizer 0.8s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>

        {/* CSS for equalizer animation */}
        <style>{`
          @keyframes equalizer {
            0%, 100% { transform: scaleY(0.3); }
            50% { transform: scaleY(1); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default DAWLoadingScreen;
