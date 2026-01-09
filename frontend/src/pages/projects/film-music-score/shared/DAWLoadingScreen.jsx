// File: DAWLoadingScreen.jsx
// Fun loading screen for MusicComposer with sound wave animation
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

const DAWLoadingScreen = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [messages] = useState(() => shuffleArray(LOADING_MESSAGES));

  // Rotate messages every 1.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="h-full w-full bg-gray-900 flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        {/* Sound wave / equalizer animation */}
        <div className="flex justify-center items-end gap-1 mb-8 h-16">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="w-3 bg-gradient-to-t from-blue-500 via-purple-500 to-pink-500 rounded-full"
              style={{
                height: '48px',
                animation: `equalizer 0.6s ease-in-out infinite`,
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-4">
          Music Composer
        </h2>

        {/* Funny loading message */}
        <div className="h-8 flex items-center justify-center">
          <p className="text-blue-300 text-lg transition-opacity duration-300">
            {messages[messageIndex]}
          </p>
        </div>

        {/* CSS for equalizer animation */}
        <style>{`
          @keyframes equalizer {
            0%, 100% { transform: scaleY(0.2); }
            50% { transform: scaleY(1); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default DAWLoadingScreen;
