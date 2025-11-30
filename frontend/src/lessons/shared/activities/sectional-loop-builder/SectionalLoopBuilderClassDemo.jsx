// File: /src/lessons/shared/activities/sectional-loop-builder/SectionalLoopBuilderClassDemo.jsx
// Epic Wildlife - Class Demo (Teacher leads on projector)
// 3 practice questions teaching students to count layers
// ✅ Teacher plays audio, class discusses, teacher reveals answer
// ✅ Shows layer visualization after reveal

import React, { useState, useRef } from 'react';
import { Play, Pause, Eye, ChevronRight, Globe, Volume2 } from 'lucide-react';

// Audio files for demo questions
const DEMO_QUESTIONS = [
  {
    id: 1,
    section: 'a',
    label: 'A Section',
    layers: 3,
    description: '3 layers: Drums + Brass + Strings',
    audio: [
      '/projects/film-music-score/loops/Heroic Drums 1.mp3',
      '/projects/film-music-score/loops/Heroic Brass 2.mp3',
      '/projects/film-music-score/loops/Heroic Strings 1.mp3'
    ],
    hint: 'Listen for the steady beat, the bold brass, and the flowing strings.',
    color: '#3B82F6'
  },
  {
    id: 2,
    section: 'intro',
    label: 'INTRO',
    layers: 2,
    description: '2 layers: Drums + Strings',
    audio: [
      '/projects/film-music-score/loops/Heroic Drums 1.mp3',
      '/projects/film-music-score/loops/Heroic Strings 1.mp3'
    ],
    hint: 'This one has fewer instruments. Can you hear what\'s missing?',
    color: '#8B5CF6'
  },
  {
    id: 3,
    section: 'aPrime',
    label: "A' (A Prime)",
    layers: 4,
    description: '4 layers: Drums + Brass + Strings + Synth',
    audio: [
      '/projects/film-music-score/loops/Heroic Drums 1.mp3',
      '/projects/film-music-score/loops/Heroic Brass 2.mp3',
      '/projects/film-music-score/loops/Heroic Strings 1.mp3',
      '/projects/film-music-score/loops/Heroic Synth 1.mp3'
    ],
    hint: 'This is the thickest texture. Listen for an extra electronic sound!',
    color: '#F59E0B'
  }
];

const SECTION_INFO = {
  intro: { label: 'INTRO', layers: 2, color: '#8B5CF6' },
  a: { label: 'A', layers: 3, color: '#3B82F6' },
  aPrime: { label: "A'", layers: 4, color: '#F59E0B' },
  outro: { label: 'OUTRO', layers: 1, color: '#8B5CF6' }
};

const SectionalLoopBuilderClassDemo = ({ onComplete, sessionData }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [phase, setPhase] = useState('intro'); // intro, playing, revealed
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRefs = useRef([]);

  const question = DEMO_QUESTIONS[currentQuestion];

  // Load audio for current question
  const loadAudio = () => {
    stopAudio();
    audioRefs.current = question.audio.map(file => {
      const audio = new Audio(file);
      audio.loop = true;
      audio.volume = 0.7;
      return audio;
    });
  };

  // Play all layers
  const playAudio = () => {
    if (audioRefs.current.length === 0) loadAudio();
    
    audioRefs.current.forEach(audio => {
      audio.currentTime = 0;
      audio.play().catch(err => console.error('Audio error:', err));
    });
    setIsPlaying(true);
  };

  // Stop audio
  const stopAudio = () => {
    audioRefs.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    setIsPlaying(false);
  };

  // Start the demo
  const startDemo = () => {
    setPhase('playing');
    loadAudio();
  };

  // Reveal the answer
  const revealAnswer = () => {
    stopAudio();
    setPhase('revealed');
  };

  // Move to next question or finish
  const nextQuestion = () => {
    if (currentQuestion < DEMO_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setPhase('playing');
      setTimeout(loadAudio, 100);
    } else {
      // Demo complete
      stopAudio();
      if (onComplete) onComplete();
    }
  };

  // Intro screen
  if (phase === 'intro') {
    return (
      <div className="h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex flex-col items-center justify-center p-8 text-white">
        <Globe className="text-green-400 mb-6" size={80} />
        <h1 className="text-5xl font-black mb-4">Epic Wildlife</h1>
        <h2 className="text-3xl text-green-300 mb-8">Learn to Count Layers!</h2>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mb-8">
          <p className="text-xl text-center mb-6">
            In this game, you'll identify song sections by <span className="text-yellow-400 font-bold">counting the layers</span> of instruments.
          </p>
          
          <div className="grid grid-cols-4 gap-4 mb-6">
            {Object.entries(SECTION_INFO).map(([key, info]) => (
              <div 
                key={key}
                className="text-center p-3 rounded-xl"
                style={{ backgroundColor: `${info.color}30` }}
              >
                <div className="text-2xl font-bold">{info.label}</div>
                <div className="text-lg text-white/80">{info.layers} layers</div>
              </div>
            ))}
          </div>
          
          <p className="text-center text-white/70">
            Let's practice together! Listen carefully and count the instruments.
          </p>
        </div>
        
        <button
          onClick={startDemo}
          className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-2xl text-2xl font-bold transition-all hover:scale-105"
        >
          Start Practice →
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex flex-col p-6 text-white">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="text-green-400" size={36} />
            <div>
              <h1 className="text-2xl font-bold">Practice Round</h1>
              <p className="text-white/70">Question {currentQuestion + 1} of {DEMO_QUESTIONS.length}</p>
            </div>
          </div>
          
          {/* Progress */}
          <div className="flex gap-2">
            {DEMO_QUESTIONS.map((_, idx) => (
              <div 
                key={idx}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
                  ${idx === currentQuestion ? 'bg-yellow-400 text-gray-900' : ''}
                  ${idx < currentQuestion ? 'bg-green-500 text-white' : ''}
                  ${idx > currentQuestion ? 'bg-white/20' : ''}
                `}
              >
                {idx < currentQuestion ? '✓' : idx + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {phase === 'playing' ? (
          // Playing phase - students listen and discuss
          <div className="text-center max-w-3xl">
            <div className="text-8xl mb-6">🎧</div>
            <h2 className="text-4xl font-bold mb-4">Listen Carefully!</h2>
            <p className="text-2xl text-white/80 mb-8">{question.hint}</p>
            
            {/* Audio controls */}
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={isPlaying ? stopAudio : playAudio}
                className={`px-8 py-4 rounded-2xl text-2xl font-bold transition-all hover:scale-105 flex items-center gap-3
                  ${isPlaying ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'}
                `}
              >
                {isPlaying ? <Pause size={32} /> : <Play size={32} />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
            </div>
            
            {/* Layer hint visualization */}
            <div className="bg-white/10 rounded-xl p-6 mb-8">
              <p className="text-xl mb-4">How many layers do you hear?</p>
              <div className="flex justify-center gap-6">
                {[1, 2, 3, 4].map(num => (
                  <div 
                    key={num}
                    className="text-center"
                  >
                    <div className="flex flex-col items-center gap-1 mb-2">
                      {[...Array(num)].map((_, i) => (
                        <div key={i} className="w-12 h-3 bg-white/40 rounded" />
                      ))}
                    </div>
                    <div className="text-lg">{num} layer{num > 1 ? 's' : ''}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Section options */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {Object.entries(SECTION_INFO).map(([key, info]) => (
                <div 
                  key={key}
                  className="p-4 rounded-xl text-center opacity-70"
                  style={{ backgroundColor: `${info.color}40` }}
                >
                  <div className="text-2xl font-bold">{info.label}</div>
                  <div className="text-white/70">{info.layers} layers</div>
                </div>
              ))}
            </div>
            
            <button
              onClick={revealAnswer}
              className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 rounded-2xl text-2xl font-bold transition-all hover:scale-105 flex items-center gap-2 mx-auto"
            >
              <Eye size={28} /> Reveal Answer
            </button>
          </div>
        ) : (
          // Revealed phase - show correct answer
          <div className="text-center max-w-3xl">
            <div 
              className="text-8xl mb-4 p-6 rounded-full mx-auto w-32 h-32 flex items-center justify-center"
              style={{ backgroundColor: `${question.color}40` }}
            >
              {question.layers === 2 ? '🎵' : question.layers === 3 ? '🎶' : '🎼'}
            </div>
            
            <h2 
              className="text-5xl font-black mb-2"
              style={{ color: question.color }}
            >
              {question.label}
            </h2>
            
            <div className="text-3xl text-white/80 mb-6">
              {question.layers} Layers
            </div>
            
            {/* Layer visualization */}
            <div className="bg-white/10 rounded-xl p-6 mb-6">
              <p className="text-xl mb-4">{question.description}</p>
              <div className="flex justify-center gap-2">
                {[...Array(question.layers)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-16 h-6 rounded"
                    style={{ 
                      backgroundColor: question.color,
                      opacity: 1 - (i * 0.15)
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* Play again button */}
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={isPlaying ? stopAudio : playAudio}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-all flex items-center gap-2"
              >
                <Volume2 size={20} />
                {isPlaying ? 'Pause' : 'Play Again'}
              </button>
            </div>
            
            <button
              onClick={nextQuestion}
              className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-2xl text-2xl font-bold transition-all hover:scale-105 flex items-center gap-2 mx-auto"
            >
              {currentQuestion < DEMO_QUESTIONS.length - 1 ? (
                <>Next Question <ChevronRight size={28} /></>
              ) : (
                <>Start the Game! 🎮</>
              )}
            </button>
          </div>
        )}
      </div>
      
      {/* Bottom hint */}
      <div className="bg-white/5 rounded-xl p-3 text-center text-white/60">
        Remember: INTRO = 2 layers • A = 3 layers • A' = 4 layers • OUTRO = 1 layer
      </div>
    </div>
  );
};

export default SectionalLoopBuilderClassDemo;