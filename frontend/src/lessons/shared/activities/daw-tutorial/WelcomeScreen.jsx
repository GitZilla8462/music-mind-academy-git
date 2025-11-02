// File: /src/lessons/film-music-project/lesson1/activities/daw-tutorial/WelcomeScreen.jsx

import React from 'react';

const WelcomeScreen = ({ onStart }) => {
  return (
    <div className="h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
      <div className="text-center p-8 max-w-2xl">
        <div className="mb-6">
          <div className="text-6xl mb-4">♪</div>
        </div>
        <h2 className="text-4xl font-bold text-white mb-6">
          Welcome to Your DAW Tutorial!
        </h2>
        <p className="text-xl text-blue-100 mb-8 leading-relaxed">
          You're about to learn how to use a Digital Audio Workstation (DAW) - 
          the tool professional composers use to create music for films. 
          Follow along with the interactive challenges to master the basics!
        </p>
        <button
          onClick={onStart}
          className="bg-white text-blue-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          Let's Get Started!
        </button>
        <p className="text-sm text-blue-200 mt-4">Auto-starting in 5 seconds...</p>
      </div>
    </div>
  );
};

export default WelcomeScreen;