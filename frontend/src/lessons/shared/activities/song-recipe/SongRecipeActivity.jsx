// Song Recipe Activity - Main Game Component
// Students order scrambled song sections (Intro, A, A', A, Outro) by listening to layer counts
// src/lessons/shared/activities/song-recipe/SongRecipeActivity.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Check, X, Trophy, ChefHat } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { generateRecipe, createAudioClips } from './recipeGenerator';
import { generatePlayerName, getPlayerColor, getPlayerEmoji } from '../layer-detective/nameGenerator';

const SongRecipeActivity = ({ onComplete, viewMode = false }) => {
  const { sessionCode, currentUserId, updateStudentData, getSessionData } = useSession();
  
  // Game state
  const [recipe, setRecipe] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState({
    intro: null,
    a1: null,
    aPrime: null,
    a2: null,
    outro: null
  });
  const [activeSlot, setActiveSlot] = useState('intro');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [playingClip, setPlayingClip] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Audio management
  const audioRefs = useRef({});
  
  // Player identity
  const [playerName, setPlayerName] = useState('');
  const [playerColor, setPlayerColor] = useState('');
  const [playerEmoji, setPlayerEmoji] = useState('');
  
  // Initialize player identity and first recipe
  useEffect(() => {
    if (currentUserId) {
      const name = generatePlayerName(currentUserId);
      const color = getPlayerColor(currentUserId);
      const emoji = getPlayerEmoji(currentUserId);
      
      setPlayerName(name);
      setPlayerColor(color);
      setPlayerEmoji(emoji);
      
      // Update Firebase with player info
      if (sessionCode && !viewMode) {
        updateStudentData({
          playerName: name,
          displayName: name,
          playerColor: color,
          playerEmoji: emoji,
          score: 0
        });
      }
    }
  }, [currentUserId, sessionCode, viewMode]);
  
  // Generate new recipe on mount and when round changes
  useEffect(() => {
    const newRecipe = generateRecipe();
    setRecipe(newRecipe);
    console.log('🎵 Generated recipe:', newRecipe);
  }, [round]);
  
  // Load audio clips when recipe changes
  useEffect(() => {
    if (!recipe) return;
    
    const loadAudio = async () => {
      const clips = await createAudioClips(recipe);
      
      // Store audio elements
      clips.forEach((clip, index) => {
        const audio = new Audio();
        audio.src = clip.audioBlob;
        audio.loop = true;
        audioRefs.current[`clip${index}`] = audio;
      });
    };
    
    loadAudio();
    
    // Cleanup
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, [recipe]);
  
  // Auto-advance slots
  useEffect(() => {
    const slots = ['intro', 'a1', 'aPrime', 'a2', 'outro'];
    const currentIndex = slots.indexOf(activeSlot);
    
    if (selectedSlots[activeSlot] !== null && currentIndex < slots.length - 1) {
      // Move to next slot after a brief delay
      setTimeout(() => {
        setActiveSlot(slots[currentIndex + 1]);
      }, 1500);
    }
    
    // Check if complete
    if (Object.values(selectedSlots).every(slot => slot !== null)) {
      handleRecipeComplete();
    }
  }, [selectedSlots, activeSlot]);
  
  // Play/pause clip
  const togglePlayClip = (clipIndex) => {
    const audio = audioRefs.current[`clip${clipIndex}`];
    if (!audio) return;
    
    // Pause all other clips
    Object.entries(audioRefs.current).forEach(([key, otherAudio]) => {
      if (key !== `clip${clipIndex}` && otherAudio) {
        otherAudio.pause();
        otherAudio.currentTime = 0;
      }
    });
    
    if (playingClip === clipIndex) {
      audio.pause();
      setPlayingClip(null);
    } else {
      audio.play();
      setPlayingClip(clipIndex);
    }
  };
  
  // Select a clip for the active slot
  const selectClip = (clipIndex) => {
    if (!recipe || selectedSlots[activeSlot] !== null) return;
    
    const correctIndex = getCorrectIndexForSlot(activeSlot);
    const isCorrect = clipIndex === correctIndex;
    
    // Update selected slots
    setSelectedSlots(prev => ({
      ...prev,
      [activeSlot]: clipIndex
    }));
    
    // Stop playing
    if (playingClip !== null) {
      const audio = audioRefs.current[`clip${playingClip}`];
      if (audio) audio.pause();
      setPlayingClip(null);
    }
    
    // Update score
    if (isCorrect) {
      const points = 25;
      setScore(prev => prev + points);
      
      // Update Firebase
      if (sessionCode && !viewMode) {
        updateStudentData({
          score: score + points
        });
      }
    }
  };
  
  // Get correct clip index for a slot
  const getCorrectIndexForSlot = (slot) => {
    if (!recipe) return null;
    
    const slotMapping = {
      'intro': 'intro',
      'a1': 'a',
      'aPrime': 'aPrime',
      'a2': 'a',
      'outro': 'outro'
    };
    
    const sectionName = slotMapping[slot];
    return recipe.scrambledOrder.findIndex(index => {
      const section = recipe.sections[index];
      return section.name === sectionName;
    });
  };
  
  // Handle recipe completion
  const handleRecipeComplete = () => {
    setIsComplete(true);
    setShowCelebration(true);
    
    // Bonus points for completion
    const bonusPoints = 25;
    setScore(prev => prev + bonusPoints);
    
    if (sessionCode && !viewMode) {
      updateStudentData({
        score: score + bonusPoints
      });
    }
    
    setTimeout(() => {
      setShowCelebration(false);
    }, 3000);
  };
  
  // Play full song
  const playFullSong = () => {
    if (!recipe) return;
    
    // Play clips in order: intro, a1, aPrime, a2, outro
    const order = ['intro', 'a1', 'aPrime', 'a2', 'outro'];
    let currentIndex = 0;
    
    const playNext = () => {
      if (currentIndex >= order.length) return;
      
      const slot = order[currentIndex];
      const clipIndex = selectedSlots[slot];
      const audio = audioRefs.current[`clip${clipIndex}`];
      
      if (audio) {
        audio.loop = false;
        audio.play();
        audio.onended = () => {
          currentIndex++;
          playNext();
        };
      }
    };
    
    playNext();
  };
  
  // Next round
  const handleNextRound = () => {
    setRound(prev => prev + 1);
    setSelectedSlots({
      intro: null,
      a1: null,
      aPrime: null,
      a2: null,
      outro: null
    });
    setActiveSlot('intro');
    setIsComplete(false);
    setPlayingClip(null);
  };
  
  if (!recipe) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-orange-600 to-red-600">
        <div className="text-white text-2xl">Loading recipe...</div>
      </div>
    );
  }
  
  const slots = [
    { id: 'intro', label: 'INTRO', layers: 2 },
    { id: 'a1', label: 'A', layers: 3 },
    { id: 'aPrime', label: "A'", layers: 4 },
    { id: 'a2', label: 'A', layers: 3 },
    { id: 'outro', label: 'OUTRO', layers: 1 }
  ];
  
  return (
    <div className="h-screen bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 overflow-hidden relative">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="text-center animate-bounce">
            <div className="text-9xl mb-4">🎉</div>
            <h1 className="text-6xl font-bold text-white mb-4">Recipe Complete!</h1>
            <p className="text-3xl text-yellow-400">+25 Bonus Points!</p>
          </div>
        </div>
      )}
      
      <div className="h-full flex flex-col p-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ChefHat size={48} className="text-white" />
              <div>
                <h1 className="text-4xl font-bold text-white">Order the Recipe</h1>
                <p className="text-xl text-white/80">Build the correct song structure!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Player Info */}
              <div className="bg-white/10 px-6 py-3 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${playerColor}20` }}
                  >
                    {playerEmoji}
                  </div>
                  <div>
                    <div className="text-xl font-bold" style={{ color: playerColor }}>
                      {playerName}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Score */}
              <div className="bg-white/10 px-6 py-3 rounded-xl">
                <div className="text-3xl font-bold text-yellow-400">{score}</div>
                <div className="text-sm text-white/80">points</div>
              </div>
              
              {/* Round */}
              <div className="bg-white/10 px-6 py-3 rounded-xl">
                <div className="text-3xl font-bold text-white">Round {round}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recipe Slots */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Your Recipe:</h2>
          <div className="flex items-center justify-between space-x-2">
            {slots.map((slot, index) => (
              <React.Fragment key={slot.id}>
                <div
                  className={`
                    flex-1 rounded-xl p-4 transition-all duration-300
                    ${activeSlot === slot.id ? 'bg-yellow-400 shadow-2xl shadow-yellow-400/50 scale-105' : 'bg-white/5'}
                    ${selectedSlots[slot.id] !== null ? 'bg-green-500' : ''}
                  `}
                >
                  <div className="text-center">
                    <div className={`text-xl font-bold mb-2 ${activeSlot === slot.id ? 'text-gray-900' : 'text-white'}`}>
                      {slot.label}
                    </div>
                    
                    {selectedSlots[slot.id] !== null ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Check size={32} className="text-white" />
                        <div className="text-white font-bold">{slot.layers} 🔴</div>
                      </div>
                    ) : (
                      <div className={`text-lg ${activeSlot === slot.id ? 'text-gray-700' : 'text-white/50'}`}>
                        {slot.layers} layers
                      </div>
                    )}
                  </div>
                </div>
                
                {index < slots.length - 1 && (
                  <div className="text-white text-2xl">→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Instructions */}
        {!isComplete && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
            <p className="text-xl text-white text-center">
              🎧 Listen and select which clip goes in the <span className="font-bold text-yellow-400">{slots.find(s => s.id === activeSlot)?.label}</span> slot ({slots.find(s => s.id === activeSlot)?.layers} layers)
            </p>
          </div>
        )}
        
        {/* Mystery Clips */}
        {!isComplete && (
          <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-2xl font-bold text-white mb-4">Mystery Clips (scrambled order):</h3>
            
            <div className="grid grid-cols-5 gap-4 h-[calc(100%-40px)]">
              {recipe.scrambledOrder.map((sectionIndex, clipIndex) => {
                const section = recipe.sections[sectionIndex];
                const isUsed = Object.values(selectedSlots).includes(clipIndex);
                const isPlaying = playingClip === clipIndex;
                
                return (
                  <div
                    key={clipIndex}
                    className={`
                      rounded-xl p-6 flex flex-col items-center justify-between transition-all
                      ${isUsed ? 'opacity-30 pointer-events-none bg-gray-500' : 'bg-white/20 hover:bg-white/30 cursor-pointer'}
                    `}
                  >
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-white mb-2">CLIP {clipIndex + 1}</div>
                      <div className="flex items-center justify-center space-x-1 mb-2">
                        {[...Array(section.layers)].map((_, i) => (
                          <div key={i} className="w-4 h-4 rounded-full bg-red-500" />
                        ))}
                      </div>
                      <div className="text-lg text-white/80">{section.layers} Layer{section.layers > 1 ? 's' : ''}</div>
                    </div>
                    
                    <button
                      onClick={() => togglePlayClip(clipIndex)}
                      disabled={isUsed}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold mb-3 flex items-center space-x-2 transition-all"
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                      <span>{isPlaying ? 'Pause' : 'Play'}</span>
                    </button>
                    
                    <button
                      onClick={() => selectClip(clipIndex)}
                      disabled={isUsed || activeSlot === null}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full"
                    >
                      Select
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Complete State */}
        {isComplete && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <button
              onClick={playFullSong}
              className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-6 rounded-2xl font-bold text-3xl flex items-center space-x-4 transition-all shadow-2xl"
            >
              <Play size={40} />
              <span>Play Full Song</span>
            </button>
            
            <button
              onClick={handleNextRound}
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 rounded-2xl font-bold text-2xl transition-all"
            >
              Next Recipe
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SongRecipeActivity;