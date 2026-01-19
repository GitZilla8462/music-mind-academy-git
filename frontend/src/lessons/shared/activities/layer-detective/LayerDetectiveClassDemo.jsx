// File: /src/lessons/shared/activities/layer-detective/LayerDetectiveClassDemo.jsx
// Whole-class demo of Layer Detective - 4 questions shown on presentation screen
// Teacher leads students through before they do individual game
// ✅ COMPACT VERSION - Fits on screen

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

const LayerDetectiveClassDemo = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  
  const audioRefs = useRef([]);

  // 4 DEMO QUESTIONS - Building from 1 to 4 layers
  const demoQuestions = [
    // QUESTION 1: 1 Layer
    {
      id: 1,
      questionNumber: 1,
      correctAnswer: 'A',
      numLayers: 1,
      layers: [
        {
          name: 'Heroic Drums 1',
          category: 'Drums',
          file: '/projects/film-music-score/loops/Heroic Drums 1.m4a',
          color: '#EF4444' // Red
        }
      ]
    },

    // QUESTION 2: 2 Layers
    {
      id: 2,
      questionNumber: 2,
      correctAnswer: 'B',
      numLayers: 2,
      layers: [
        {
          name: 'Heroic Drums 1',
          category: 'Drums',
          file: '/projects/film-music-score/loops/Heroic Drums 1.m4a',
          color: '#EF4444'
        },
        {
          name: 'Heroic Brass 2',
          category: 'Brass',
          file: '/projects/film-music-score/loops/Heroic Brass 2.m4a',
          color: '#F59E0B' // Orange
        }
      ]
    },

    // QUESTION 3: 3 Layers
    {
      id: 3,
      questionNumber: 3,
      correctAnswer: 'C',
      numLayers: 3,
      layers: [
        {
          name: 'Heroic Drums 1',
          category: 'Drums',
          file: '/projects/film-music-score/loops/Heroic Drums 1.m4a',
          color: '#EF4444'
        },
        {
          name: 'Heroic Brass 2',
          category: 'Brass',
          file: '/projects/film-music-score/loops/Heroic Brass 2.m4a',
          color: '#F59E0B'
        },
        {
          name: 'Heroic Strings 1',
          category: 'Strings',
          file: '/projects/film-music-score/loops/Heroic Strings 1.m4a',
          color: '#10B981' // Green
        }
      ]
    },

    // QUESTION 4: 4 Layers
    {
      id: 4,
      questionNumber: 4,
      correctAnswer: 'D',
      numLayers: 4,
      layers: [
        {
          name: 'Heroic Drums 1',
          category: 'Drums',
          file: '/projects/film-music-score/loops/Heroic Drums 1.m4a',
          color: '#EF4444'
        },
        {
          name: 'Heroic Brass 2',
          category: 'Brass',
          file: '/projects/film-music-score/loops/Heroic Brass 2.m4a',
          color: '#F59E0B'
        },
        {
          name: 'Heroic Strings 1',
          category: 'Strings',
          file: '/projects/film-music-score/loops/Heroic Strings 1.m4a',
          color: '#10B981'
        },
        {
          name: 'Heroic Piano 1',
          category: 'Piano',
          file: '/projects/film-music-score/loops/Heroic Piano 1.m4a',
          color: '#8B5CF6' // Purple
        }
      ]
    }
  ];

  const question = demoQuestions[currentQuestion];

  // Play all layers together
  const playLayers = () => {
    if (isPlaying) {
      // Stop all audio
      audioRefs.current.forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
      setIsPlaying(false);
    } else {
      // Play all layers
      audioRefs.current.forEach(audio => {
        if (audio) {
          audio.currentTime = 0;
          audio.play().catch(err => console.error('Failed to play:', err));
        }
      });
      setIsPlaying(true);
    }
  };

  // Handle audio end - loop it
  useEffect(() => {
    const handleEnded = (index) => {
      if (audioRefs.current[index] && isPlaying) {
        audioRefs.current[index].currentTime = 0;
        audioRefs.current[index].play();
      }
    };

    audioRefs.current.forEach((audio, index) => {
      if (audio) {
        audio.addEventListener('ended', () => handleEnded(index));
      }
    });

    return () => {
      audioRefs.current.forEach((audio, index) => {
        if (audio) {
          audio.removeEventListener('ended', () => handleEnded(index));
        }
      });
    };
  }, [isPlaying]);

  // Auto-play when question loads
  useEffect(() => {
    if (!showAnswer) {
      const timer = setTimeout(() => {
        playLayers();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion, showAnswer]);

  // Handle answer selection
  const handleAnswer = (answer) => {
    if (showAnswer) return;
    
    setSelectedAnswer(answer);
    setShowAnswer(true);
    
    // Stop playing
    audioRefs.current.forEach(audio => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    setIsPlaying(false);
  };

  // Next question
  const handleNext = () => {
    if (currentQuestion < demoQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setShowAnswer(false);
      setSelectedAnswer(null);
      setIsPlaying(false);
    } else {
      // Demo complete - advance to next stage
      console.log('✅ Demo complete - advancing to individual game');
      if (onComplete) {
        onComplete();
      }
    }
  };

  // Previous question
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setShowAnswer(false);
      setSelectedAnswer(null);
      setIsPlaying(false);
    }
  };

  const isCorrect = selectedAnswer === question.correctAnswer;
  const isLastQuestion = currentQuestion === demoQuestions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 flex items-center justify-center p-4">
      {/* Hidden audio elements */}
      {question.layers.map((layer, index) => (
        <audio
          key={index}
          ref={el => audioRefs.current[index] = el}
          src={layer.file}
        />
      ))}
      
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-5xl w-full">
        {/* Header - Compact */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-1">
            🎵 Layer Detective - Class Demo
          </h1>
          <p className="text-xl text-gray-700">
            Question {question.questionNumber} of {demoQuestions.length}
          </p>
        </div>

        {!showAnswer ? (
          <>
            {/* Question - Compact */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🎧 How many layers do you hear?
              </h2>
              
              {/* Play Button - Compact */}
              <button
                onClick={playLayers}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-full font-bold text-2xl hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 mx-auto"
              >
                {isPlaying ? (
                  <>
                    <Pause size={32} />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play size={32} />
                    <span>Play Loops</span>
                  </>
                )}
              </button>
            </div>

            {/* Visual Placeholder - Compact */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 border-4 border-gray-300">
              <div className="space-y-2">
                {[1, 2, 3, 4].map((row) => (
                  <div
                    key={row}
                    className="h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-lg font-semibold"
                  >
                    Layer {row}
                  </div>
                ))}
              </div>
            </div>

            {/* Answer Buttons - Compact */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { letter: 'A', num: 1 },
                { letter: 'B', num: 2 },
                { letter: 'C', num: 3 },
                { letter: 'D', num: 4 }
              ].map(option => (
                <button
                  key={option.letter}
                  onClick={() => handleAnswer(option.letter)}
                  className="bg-gray-100 hover:bg-gray-200 py-6 px-4 rounded-xl font-bold text-2xl transition-all border-4 border-transparent hover:border-orange-500 shadow-lg"
                >
                  <div className="text-orange-600 text-3xl mb-1">{option.letter}</div>
                  <div className="text-gray-800 text-lg">{option.num} Layer{option.num > 1 ? 's' : ''}</div>
                </button>
              ))}
            </div>
          </>
        ) : (
          /* ANSWER REVEALED - Compact */
          <>
            {/* Result - Compact */}
            <div className="text-center mb-4">
              <div className={`text-6xl mb-3 ${isCorrect ? 'animate-bounce' : ''}`}>
                {isCorrect ? '✅' : '❌'}
              </div>
              <div className={`text-4xl font-bold mb-4 ${
                isCorrect ? 'text-green-600' : 'text-red-600'
              }`}>
                {isCorrect ? 'Correct!' : 'Not Quite!'}
              </div>
            </div>

            {/* Stacked Tracks Visual */}
            <div className="bg-blue-50 rounded-xl p-4 mb-4 border-4 border-blue-300">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-2xl">🎧</span>
                <h3 className="text-xl font-bold text-gray-900">
                  {question.numLayers} {question.numLayers === 1 ? 'Layer' : 'Layers'} Playing Together
                </h3>
              </div>
              <div className="space-y-2">
                {question.layers.map((layer, index) => (
                  <div
                    key={index}
                    className="h-14 rounded-lg flex items-center overflow-hidden shadow-lg transition-all animate-fadeIn"
                    style={{
                      animationDelay: `${index * 0.15}s`
                    }}
                  >
                    <div
                      className="w-14 h-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: layer.color }}
                    >
                      {layer.category === 'Drums' ? '🥁' :
                       layer.category === 'Bass' ? '🎸' :
                       layer.category === 'Brass' ? '🎺' :
                       layer.category === 'Strings' ? '🎻' :
                       layer.category === 'Piano' ? '🎹' :
                       layer.category === 'Synth' ? '🎛️' : '🎵'}
                    </div>
                    <div
                      className="flex-1 h-full flex items-center px-4 text-white font-bold text-lg"
                      style={{ backgroundColor: layer.color }}
                    >
                      {layer.category}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons - Compact */}
            <div className="flex gap-3">
              {currentQuestion > 0 && (
                <button
                  onClick={handlePrevious}
                  className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-xl font-bold text-xl hover:bg-gray-400 transition-all shadow-lg"
                >
                  ← Previous
                </button>
              )}
              
              <button
                onClick={handleNext}
                className={`flex-1 ${
                  isLastQuestion 
                    ? 'bg-gradient-to-r from-green-600 to-blue-600' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600'
                } text-white py-3 rounded-xl font-bold text-xl hover:opacity-90 transition-all shadow-lg`}
              >
                {isLastQuestion ? (
                  <>🎮 Start Layer Detective Game! →</>
                ) : (
                  <>Next Question →</>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default LayerDetectiveClassDemo;