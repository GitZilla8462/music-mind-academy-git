// File: /src/lessons/components/activities/MusicConceptsActivity.jsx
// Description: Interactive component that teaches music concepts (tempo, dynamics, instrumentation, harmony)
// Uses audio loops to demonstrate each concept with built-in quiz assessment

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, RotateCcw, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

// Simple Visual Indicator Component
const TempoVisual = ({ isPlaying, tempoType }) => {
  if (!isPlaying || !tempoType) return null;

  const getVisualStyle = () => {
    switch (tempoType) {
      case 'largo':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          border: '2px solid rgba(59, 130, 246, 0.3)',
          animation: 'pulse 4s ease-in-out infinite'
        };
      case 'andante':
        return {
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          border: '2px solid rgba(34, 197, 94, 0.3)',
          animation: 'pulse 2s ease-in-out infinite'
        };
      case 'allegro':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '2px solid rgba(239, 68, 68, 0.3)',
          animation: 'pulse 1s ease-in-out infinite'
        };
      case 'presto':
        return {
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          border: '2px solid rgba(168, 85, 247, 0.3)',
          animation: 'pulse 0.5s ease-in-out infinite'
        };
      default:
        return {};
    }
  };

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
      `}</style>
      <div 
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={getVisualStyle()}
      />
    </>
  );
};

// AI Voice Narration Component
const VoiceNarration = ({ text, isPlaying, onComplete }) => {
  const [isNarrating, setIsNarrating] = useState(false);
  const speechRef = useRef(null);

  useEffect(() => {
    if (isPlaying && text && 'speechSynthesis' in window) {
      setIsNarrating(true);
      
      // Cancel any existing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onend = () => {
        setIsNarrating(false);
        if (onComplete) onComplete();
      };
      
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else if (!isPlaying && speechRef.current) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    }

    return () => {
      if (speechRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying, text, onComplete]);

  return null;
};

const MusicConceptsActivity = ({ onComplete }) => {
  const [currentConcept, setCurrentConcept] = useState(0);
  const [currentExample, setCurrentExample] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
  const [audioCompleted, setAudioCompleted] = useState(false);
  const [voiceCompleted, setVoiceCompleted] = useState(false);
  const [completedConcepts, setCompletedConcepts] = useState(new Set());
  const [showConceptQuiz, setShowConceptQuiz] = useState(false);
  const [conceptQuizAnswers, setConceptQuizAnswers] = useState({});
  const [currentConceptQuizQuestion, setCurrentConceptQuizQuestion] = useState(0);
  const [conceptQuizComplete, setConceptQuizComplete] = useState(false);
  const [allConceptsComplete, setAllConceptsComplete] = useState(false);
  const audioRef = useRef(null);
  const quizAudioRefs = useRef({});

  // Voice narration text for each example
  const voiceNarrations = {
    'tempo-largo': 'Largo is a very slow tempo marking, ranging from 40 to 60 beats per minute. This Italian word means "broad" and creates feelings of grandeur, sadness, or deep emotion. Listen to how each note has time to breathe and resonate, creating space for reflection and contemplation.',
    'tempo-andante': 'Andante means "walking" in Italian, with a moderate tempo of 76 to 108 beats per minute. This tempo feels natural and flowing, like a comfortable walking pace. It creates a sense of gentle movement and is often used in ballads and emotional film scenes.',
    'tempo-allegro': 'Allegro means "cheerful" in Italian and ranges from 120 to 168 beats per minute. This fast tempo creates energy, excitement, and joy. The quick pace makes you want to move and creates feelings of happiness or urgency.',
    'tempo-presto': 'Presto means "quickly" in Italian and is one of the fastest tempos at 168 plus beats per minute. This extremely fast speed creates intense excitement and can make listeners feel their heart racing. It\'s often used in action scenes and virtuosic musical passages.',
  };

  const getTempoType = () => {
    if (currentConceptData?.id === 'tempo') {
      const example = currentExampleData?.name?.toLowerCase();
      if (example?.includes('largo')) return 'largo';
      if (example?.includes('andante')) return 'andante';
      if (example?.includes('allegro')) return 'allegro';
      if (example?.includes('presto')) return 'presto';
    }
    return null;
  };

  const getCurrentNarration = () => {
    if (currentConceptData?.id === 'tempo' && currentExampleData) {
      const key = `tempo-${getTempoType()}`;
      return voiceNarrations[key];
    }
    return null;
  };

  const concepts = [
    {
      id: 'tempo',
      title: 'Tempo',
      description: 'Tempo is the speed of music, measured in beats per minute (BPM). Musicians use Italian terms to describe different speeds. Tempo affects how music makes us feel - faster tempos often create excitement, while slower tempos can feel relaxing or dramatic.',
      examples: [
        {
          name: 'Largo (Very Slow, 40-60 BPM)',
          description: 'Largo means "broad" in Italian. This very slow tempo creates feelings of sadness, grandeur, or deep emotion. You might hear largo in funeral music, dramatic movie scenes, or when composers want to create a sense of majesty. The slow pace gives each note time to resonate and creates space for reflection.',
          audio: '/projects/film-music-score/loops/Sad Keys 1.wav',
          characteristics: ['Very Slow', 'Emotional', 'Majestic', 'Reflective', 'Dramatic']
        },
        {
          name: 'Andante (Walking Pace, 76-108 BPM)',
          description: 'Andante means "walking" in Italian - imagine a comfortable walking speed. This moderate tempo feels natural and flowing, like a gentle stream or a peaceful stroll. Andante is often used in ballads, folk songs, and emotional scenes in movies. It\'s not rushed but not dragging either.',
          audio: '/projects/film-music-score/loops/Sad Strings.wav',
          characteristics: ['Moderate', 'Flowing', 'Natural', 'Comfortable', 'Peaceful']
        },
        {
          name: 'Allegro (Fast and Lively, 120-168 BPM)',
          description: 'Allegro means "cheerful" or "lively" in Italian. This fast tempo creates energy, excitement, and joy. You\'ll hear allegro in dance music, celebration scenes, chase sequences in movies, and upbeat pop songs. The quick pace makes you want to move and creates a sense of urgency or happiness.',
          audio: '/projects/film-music-score/loops/Upbeat Piano.wav',
          characteristics: ['Fast', 'Energetic', 'Joyful', 'Exciting', 'Lively']
        },
        {
          name: 'Presto (Very Fast, 168+ BPM)',
          description: 'Presto means "quickly" in Italian and is one of the fastest tempo markings. This extremely fast speed creates intense excitement, panic, or superhuman energy. Think of action movie soundtracks, video game music during intense moments, or classical pieces that showcase incredible skill. Presto can make listeners feel their heart racing!',
          audio: '/projects/film-music-score/loops/Upbeat Drums 2.wav',
          characteristics: ['Very Fast', 'Intense', 'Thrilling', 'Urgent', 'Virtuosic']
        }
      ]
    },
    {
      id: 'dynamics',
      title: 'Dynamics',
      description: 'Dynamics control how loud or soft music is played. Like tempo, musicians use Italian terms for dynamics. Volume changes can completely transform the mood of music - soft music draws listeners in close, while loud music commands attention. Dynamics help tell musical stories by creating contrast and emphasis.',
      examples: [
        {
          name: 'Piano (p) - Soft',
          description: 'Piano means "soft" in Italian (not the instrument!). When music is played piano, it creates intimacy, mystery, or calmness. Soft dynamics make listeners lean in to hear better, creating a sense of closeness. You might hear piano dynamics in lullabies, love scenes in movies, or when a composer wants to create suspense.',
          audio: '/projects/film-music-score/loops/Sad String Sustain.wav',
          characteristics: ['Soft', 'Intimate', 'Mysterious', 'Gentle', 'Subtle']
        },
        {
          name: 'Mezzo Piano (mp) - Medium Soft',
          description: 'Mezzo piano means "half soft" - it\'s louder than piano but still on the quiet side. This dynamic level is perfect for background music that supports dialogue in movies, gentle conversation between instruments, or when you want music that\'s present but not overwhelming. It\'s like speaking in a normal, comfortable voice.',
          audio: '/projects/film-music-score/loops/Sad Bass 1.wav',
          characteristics: ['Medium Soft', 'Conversational', 'Supportive', 'Comfortable', 'Present']
        },
        {
          name: 'Mezzo Forte (mf) - Medium Loud',
          description: 'Mezzo forte means "half strong" - this is a confident, clear volume that most music sits at. It\'s loud enough to be heard clearly but not overwhelming. Think of a confident speaking voice or music that fills a room nicely. Many pop songs, classical themes, and movie soundtracks use mezzo forte as their main dynamic level.',
          audio: '/projects/film-music-score/loops/Upbeat Acoustic Guitar.wav',
          characteristics: ['Medium Loud', 'Confident', 'Clear', 'Balanced', 'Present']
        },
        {
          name: 'Forte (f) - Loud',
          description: 'Forte means "strong" in Italian. This loud dynamic creates power, excitement, and drama. Forte grabs attention and makes bold statements. You\'ll hear forte in action scenes, triumphant moments, rock concerts, and when composers want to create impact. It\'s like someone speaking with authority and passion.',
          audio: '/projects/film-music-score/loops/Upbeat Drums 1.wav',
          characteristics: ['Loud', 'Powerful', 'Dramatic', 'Bold', 'Commanding']
        }
      ]
    },
    {
      id: 'instrumentation',
      title: 'Instrumentation',
      description: 'Instrumentation refers to which instruments are chosen for a piece of music. Each instrument has its own personality, color, and emotional associations. Composers carefully select instruments based on the story they want to tell. Some instruments sound warm and friendly, others mysterious or powerful. The combination of different instruments creates the overall texture and mood of the music.',
      examples: [
        {
          name: 'Piano - The Universal Storyteller',
          description: 'The piano is incredibly versatile - it can play melody, harmony, and rhythm all at once. Its wide range from very low to very high notes makes it perfect for expressing any emotion. Gentle piano melodies can sound romantic or peaceful, while powerful piano chords can sound dramatic or triumphant. In film music, piano often represents human emotions, memories, or intimate moments.',
          audio: '/projects/film-music-score/loops/Upbeat Piano.wav',
          characteristics: ['Versatile', 'Expressive', 'Emotional', 'Clear', 'Dynamic']
        },
        {
          name: 'Strings - The Emotional Heart',
          description: 'String instruments (violins, violas, cellos, basses) are the emotional core of most orchestras. They can play smooth, flowing melodies that tug at heartstrings, or sharp, aggressive rhythms that create tension. Strings can sound like human voices singing together. In movies, strings often underscore love scenes, sad moments, or build suspense. They blend beautifully and can create huge walls of sound.',
          audio: '/projects/film-music-score/loops/Sad Strings.wav',
          characteristics: ['Emotional', 'Flowing', 'Warm', 'Expressive', 'Blending']
        },
        {
          name: 'Guitar - The Personal Voice',
          description: 'Guitars have a warm, personal quality that feels like someone speaking directly to you. Acoustic guitars can sound folk-like, peaceful, or introspective, while electric guitars can be powerful, edgy, or modern. Guitars are great for creating atmosphere - a gentle fingerpicked guitar might represent countryside or memories, while a distorted electric guitar could represent rebellion or power.',
          audio: '/projects/film-music-score/loops/Upbeat Acoustic Guitar.wav',
          characteristics: ['Personal', 'Warm', 'Versatile', 'Atmospheric', 'Relatable']
        },
        {
          name: 'Synthesizers - The Sound of Tomorrow',
          description: 'Synthesizers create electronic sounds that can be otherworldly, futuristic, or completely new. They can imitate real instruments or create sounds that don\'t exist in nature. Synths are perfect for sci-fi movies, modern pop music, or any time composers want to create unusual atmospheres. They can sound smooth and floating or sharp and mechanical, depending on the story being told.',
          audio: '/projects/film-music-score/loops/Sad Synth 1.wav',
          characteristics: ['Electronic', 'Futuristic', 'Atmospheric', 'Unique', 'Flexible']
        },
        {
          name: 'Drums - The Rhythmic Engine',
          description: 'Drums are the heartbeat of music - they provide the pulse that makes you want to move. Different drum sounds create different feelings: soft brushes might sound jazzy and relaxed, while pounding timpani drums sound epic and powerful. In film music, drums can represent danger, excitement, marching armies, or celebration. They drive the energy and can make quiet scenes feel urgent.',
          audio: '/projects/film-music-score/loops/Upbeat Drums 2.wav',
          characteristics: ['Rhythmic', 'Driving', 'Energetic', 'Powerful', 'Pulse']
        }
      ]
    },
    {
      id: 'harmony',
      title: 'Harmony',
      description: 'Harmony is what happens when different musical notes are played together to create chords. The most important types are major and minor harmonies. Major chords use a specific pattern of notes that naturally sounds happy, bright, and positive to most people. Minor chords use a different pattern that tends to sound sad, dark, or mysterious. This isn\'t just opinion - our brains are wired to hear these patterns as having different emotional qualities.',
      examples: [
        {
          name: 'Minor Harmony - The Sound of Emotions',
          description: 'Minor chords and scales have a darker, more complex emotional quality. They\'re built using a pattern of notes that creates natural tension and sadness. Minor harmony is perfect for expressing deep emotions, mystery, or drama. You\'ll hear minor keys in sad songs, scary movie scenes, and music that explores complex feelings. Minor doesn\'t always mean sad though - it can also sound sophisticated, mysterious, or exotic.',
          audio: '/projects/film-music-score/loops/Sad Keys 1.wav',
          characteristics: ['Emotional', 'Complex', 'Dramatic', 'Mysterious', 'Deep']
        },
        {
          name: 'Major Harmony - The Sound of Light',
          description: 'Major chords and scales use a pattern of notes that sounds naturally bright and positive. Our ears hear major harmony as resolved, complete, and happy. Major keys are used in celebration music, pop songs, children\'s songs, and triumphant movie moments. The brightness of major harmony can represent hope, joy, victory, or simple contentment. It feels like musical sunshine.',
          audio: '/projects/film-music-score/loops/Upbeat Bells.wav',
          characteristics: ['Bright', 'Happy', 'Resolved', 'Positive', 'Triumphant']
        }
      ]
    }
  ];

  // Organize quiz questions by concept
  const quizQuestionsByContent = {
    tempo: [
      {
        question: 'Listen to this audio clip. What tempo marking best describes this music?',
        audio: '/projects/film-music-score/loops/Sad Keys 1.wav',
        options: ['Presto (Very Fast)', 'Allegro (Fast)', 'Andante (Walking Pace)', 'Largo (Very Slow)'],
        correct: 3
      },
      {
        question: 'This music has what kind of tempo feel?',
        audio: '/projects/film-music-score/loops/Upbeat Drums 2.wav',
        options: ['Largo (Very Slow)', 'Andante (Walking Pace)', 'Allegro (Fast)', 'Presto (Very Fast)'],
        correct: 3
      },
      {
        question: 'What tempo would you use to describe this musical example?',
        audio: '/projects/film-music-score/loops/Upbeat Piano.wav',
        options: ['Largo (Very Slow)', 'Andante (Walking Pace)', 'Allegro (Fast)', 'Presto (Very Fast)'],
        correct: 2
      },
      {
        question: 'The speed of this music is best described as:',
        audio: '/projects/film-music-score/loops/Sad Strings.wav',
        options: ['Presto (Very Fast)', 'Allegro (Fast)', 'Andante (Walking Pace)', 'Largo (Very Slow)'],
        correct: 2
      }
    ],
    dynamics: [
      {
        question: 'What dynamic level do you hear in this musical example?',
        audio: '/projects/film-music-score/loops/Upbeat Drums 1.wav',
        options: ['Piano (Soft)', 'Mezzo Piano (Medium Soft)', 'Mezzo Forte (Medium Loud)', 'Forte (Loud)'],
        correct: 3
      },
      {
        question: 'The volume level in this clip is best described as:',
        audio: '/projects/film-music-score/loops/Sad String Sustain.wav',
        options: ['Forte (Loud)', 'Mezzo Forte (Medium Loud)', 'Mezzo Piano (Medium Soft)', 'Piano (Soft)'],
        correct: 3
      },
      {
        question: 'What dynamic marking would best fit this audio?',
        audio: '/projects/film-music-score/loops/Upbeat Acoustic Guitar.wav',
        options: ['Piano (Soft)', 'Mezzo Piano (Medium Soft)', 'Mezzo Forte (Medium Loud)', 'Forte (Loud)'],
        correct: 2
      },
      {
        question: 'How would you describe the volume of this music?',
        audio: '/projects/film-music-score/loops/Sad Bass 1.wav',
        options: ['Forte (Loud)', 'Mezzo Forte (Medium Loud)', 'Mezzo Piano (Medium Soft)', 'Piano (Soft)'],
        correct: 2
      }
    ],
    instrumentation: [
      {
        question: 'What is the primary instrument family in this audio clip?',
        audio: '/projects/film-music-score/loops/Sad Strings.wav',
        options: ['Piano', 'Strings', 'Guitar', 'Synthesizer'],
        correct: 1
      },
      {
        question: 'Which instrument do you hear prominently in this example?',
        audio: '/projects/film-music-score/loops/Upbeat Acoustic Guitar.wav',
        options: ['Piano', 'Drums', 'Guitar', 'Strings'],
        correct: 2
      },
      {
        question: 'What type of instrument is featured in this audio?',
        audio: '/projects/film-music-score/loops/Upbeat Piano.wav',
        options: ['Guitar', 'Piano', 'Drums', 'Synthesizer'],
        correct: 1
      },
      {
        question: 'The main instrument you hear in this clip is:',
        audio: '/projects/film-music-score/loops/Sad Synth 1.wav',
        options: ['Piano', 'Strings', 'Guitar', 'Synthesizer'],
        correct: 3
      }
    ],
    harmony: [
      {
        question: 'What type of harmony do you hear in this example?',
        audio: '/projects/film-music-score/loops/Upbeat Piano.wav',
        options: ['Minor Harmony', 'Major Harmony'],
        correct: 1
      },
      {
        question: 'The emotional quality of this harmony is:',
        audio: '/projects/film-music-score/loops/Sad Bass 1.wav',
        options: ['Major (Bright and Happy)', 'Minor (Dark and Emotional)'],
        correct: 1
      },
      {
        question: 'What kind of harmonic feeling does this music have?',
        audio: '/projects/film-music-score/loops/Upbeat Bells.wav',
        options: ['Minor (Dark and Emotional)', 'Major (Bright and Happy)'],
        correct: 1
      },
      {
        question: 'The harmony in this audio clip sounds:',
        audio: '/projects/film-music-score/loops/Sad Keys 1.wav',
        options: ['Major (Bright and Happy)', 'Minor (Dark and Emotional)'],
        correct: 1
      }
    ]
  };

  const currentConceptData = concepts[currentConcept];
  const currentExampleData = currentConceptData?.examples[currentExample];

  useEffect(() => {
    // Reset completion states when changing examples or concepts
    setAudioCompleted(false);
    setVoiceCompleted(false);
    setHasPlayedAudio(false);
    setIsPlaying(false);
    
    // Stop audio when component unmounts or changes
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      // Cancel any ongoing speech synthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      // Clean up quiz audio refs
      Object.values(quizAudioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, [currentConcept, currentExample]);

  const playAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      setHasPlayedAudio(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setAudioCompleted(true);
  };

  const resetAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const nextExample = () => {
    // Only allow progression if both audio and voice narration have been completed
    const bothCompleted = audioCompleted && (voiceCompleted || !getCurrentNarration());
    if (!bothCompleted) return;
    
    if (currentExample < currentConceptData.examples.length - 1) {
      setCurrentExample(currentExample + 1);
      setIsPlaying(false);
    } else {
      // No more examples in this concept, start concept quiz
      setShowConceptQuiz(true);
    }
  };

  const prevExample = () => {
    if (currentExample > 0) {
      setCurrentExample(currentExample - 1);
      setIsPlaying(false);
    }
  };

  const nextConcept = () => {
    if (currentConcept < concepts.length - 1) {
      setCompletedConcepts(prev => new Set([...prev, currentConcept]));
      setCurrentConcept(currentConcept + 1);
      setCurrentExample(0);
      setIsPlaying(false);
      setShowConceptQuiz(false);
      setConceptQuizAnswers({});
      setCurrentConceptQuizQuestion(0);
      setConceptQuizComplete(false);
    } else {
      // All concepts completed
      setAllConceptsComplete(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  };

  const prevConcept = () => {
    if (currentConcept > 0) {
      setCurrentConcept(currentConcept - 1);
      setCurrentExample(0);
      setIsPlaying(false);
      setShowConceptQuiz(false);
      setConceptQuizAnswers({});
      setCurrentConceptQuizQuestion(0);
      setConceptQuizComplete(false);
    }
  };

  const handleConceptQuizAnswer = (questionIndex, answerIndex) => {
    setConceptQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const nextConceptQuizQuestion = () => {
    const conceptQuestions = quizQuestionsByContent[currentConceptData.id];
    if (currentConceptQuizQuestion < conceptQuestions.length - 1) {
      setCurrentConceptQuizQuestion(currentConceptQuizQuestion + 1);
    } else {
      // Last question in concept quiz - complete it
      submitConceptQuiz();
    }
  };

  const prevConceptQuizQuestion = () => {
    if (currentConceptQuizQuestion > 0) {
      setCurrentConceptQuizQuestion(currentConceptQuizQuestion - 1);
    }
  };

  const submitConceptQuiz = () => {
    setConceptQuizComplete(true);
    // Move to next concept after a short delay
    setTimeout(() => {
      nextConcept();
    }, 2000);
  };

  // FIXED: Play quiz audio with proper ref handling
  const playQuizAudio = (audioSrc, questionIndex) => {
    // Stop any currently playing quiz audio
    Object.values(quizAudioRefs.current).forEach(audio => {
      if (audio && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    // Get or create audio element for this question
    if (!quizAudioRefs.current[questionIndex]) {
      const audio = new Audio(audioSrc);
      quizAudioRefs.current[questionIndex] = audio;
    }

    const audio = quizAudioRefs.current[questionIndex];
    
    if (audio.paused) {
      audio.play().catch(err => console.error('Quiz audio play error:', err));
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  if (showConceptQuiz) {
    const conceptQuestions = quizQuestionsByContent[currentConceptData.id];
    const currentQuestion = conceptQuestions[currentConceptQuizQuestion];
    
    return (
      <div className="h-full bg-gradient-to-br from-purple-50 to-blue-50 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {currentConceptData.title} Quiz
            </h2>
            <p className="text-gray-600">Test your knowledge of {currentConceptData.title.toLowerCase()}!</p>
            <div className="mt-4">
              <span className="text-sm text-gray-500">
                Question {currentConceptQuizQuestion + 1} of {conceptQuestions.length}
              </span>
            </div>
          </div>

          {!conceptQuizComplete ? (
            <div className="space-y-8">
              {/* Current Question */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">
                  {currentConceptData.title}
                </h3>
                <p className="text-gray-700 mb-4">{currentQuestion.question}</p>
                
                {/* FIXED: Audio player for quiz question */}
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => playQuizAudio(currentQuestion.audio, currentConceptQuizQuestion)}
                      className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                    >
                      <Play size={20} />
                    </button>
                    <span className="text-sm text-gray-600">Click to play audio</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {currentQuestion.options.map((option, optIndex) => (
                    <button
                      key={optIndex}
                      onClick={() => handleConceptQuizAnswer(currentConceptQuizQuestion, optIndex)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                        conceptQuizAnswers[currentConceptQuizQuestion] === optIndex
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={prevConceptQuizQuestion}
                  disabled={currentConceptQuizQuestion === 0}
                  className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft size={20} />
                  <span>Previous</span>
                </button>

                <div className="flex space-x-1">
                  {conceptQuestions.map((_, index) =>(
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full ${
                        index === currentConceptQuizQuestion
                          ? 'bg-blue-500'
                          : conceptQuizAnswers[index] !== undefined
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextConceptQuizQuestion}
                  disabled={conceptQuizAnswers[currentConceptQuizQuestion] === undefined}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span>
                    {currentConceptQuizQuestion === conceptQuestions.length - 1 ? 'Complete Quiz' : 'Next'}
                  </span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <CheckCircle className="mx-auto text-green-500 mb-6" size={96} />
              <h3 className="text-2xl font-bold text-green-800 mb-4">
                {currentConceptData.title} Quiz Complete!
              </h3>
              <p className="text-green-700 mb-6">
                Moving to the next concept...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (allConceptsComplete) {
    return (
      <div className="h-full bg-gradient-to-br from-green-50 to-blue-50 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto text-center">
          <CheckCircle className="mx-auto text-green-500 mb-6" size={96} />
          <h2 className="text-4xl font-bold text-green-800 mb-4">
            All Concepts Complete!
          </h2>
          <p className="text-green-700 mb-8 text-xl">
            You've successfully learned and been quizzed on all four music concepts!
          </p>
          <p className="text-gray-600">Moving to the next activity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Music Concepts Builder</h1>
            <div className="text-sm text-gray-600">
              Concept {currentConcept + 1} of {concepts.length}
            </div>
          </div>
          
          {/* Progress indicators */}
          <div className="flex space-x-2">
            {concepts.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full ${
                  completedConcepts.has(index)
                    ? 'bg-green-500'
                    : index === currentConcept
                    ? 'bg-blue-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Concept Introduction */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{currentConceptData.title}</h2>
            <p className="text-gray-600 text-lg mb-6">{currentConceptData.description}</p>
            
            {/* Example progress indicator */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold">
                Example {currentExample + 1} of {currentConceptData.examples.length}
              </h3>
              <div className="flex justify-center space-x-2 mt-3">
                {currentConceptData.examples.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === currentExample
                        ? 'bg-blue-500'
                        : index < currentExample
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Current Example */}
          <div className="bg-white rounded-lg shadow-lg p-8 relative overflow-hidden">
            {/* Simple Visual Background for Tempo Concepts */}
            {currentConceptData.id === 'tempo' && (
              <TempoVisual 
                isPlaying={isPlaying} 
                tempoType={getTempoType()}
              />
            )}
            
            {/* Voice Narration */}
            {getCurrentNarration() && (
              <VoiceNarration
                text={getCurrentNarration()}
                isPlaying={isPlaying}
                onComplete={() => setVoiceCompleted(true)}
              />
            )}

            <div className="relative z-10">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                {currentExampleData.name}
              </h3>
              <p className="text-gray-600 mb-6">{currentExampleData.description}</p>

              {/* Characteristics */}
              <div className="flex flex-wrap gap-2 mb-8">
                {currentExampleData.characteristics.map((char, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {char}
                  </span>
                ))}
              </div>

              {/* Audio Player */}
              <div className="bg-gray-100 rounded-lg p-6">
                <audio
                  ref={audioRef}
                  src={currentExampleData.audio}
                  onEnded={handleAudioEnded}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={playAudio}
                    className="bg-blue-600 text-white p-4 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    {isPlaying ? <Pause size={32} /> : <Play size={32} />}
                  </button>
                  
                  <button
                    onClick={resetAudio}
                    className="bg-gray-600 text-white p-3 rounded-full hover:bg-gray-700 transition-colors"
                  >
                    <RotateCcw size={24} />
                  </button>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-800">
                      {isPlaying ? 'Playing Audio & Narration...' : audioCompleted && voiceCompleted ? 'Complete!' : hasPlayedAudio ? 'Audio Paused' : 'Click Play to Listen'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {getCurrentNarration() ? 'Listen to audio and voice explanation' : 'Listen to the audio example'}
                    </div>
                  </div>
                </div>
                
                {/* Completion indicators */}
                {getCurrentNarration() && (
                  <div className="mt-4 flex justify-center space-x-6">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${audioCompleted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-gray-600">Audio</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${voiceCompleted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-gray-600">Narration</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={prevConcept}
              disabled={currentConcept === 0}
              className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Previous Concept</span>
            </button>

            <div className="text-center flex-1 mx-4">
              {(!audioCompleted || !voiceCompleted) && (
                <p className="text-sm text-orange-600">
                  Listen to complete audio and narration to continue
                </p>
              )}
            </div>

            <button
              onClick={nextExample}
              disabled={!audioCompleted || (!voiceCompleted && getCurrentNarration())}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                (audioCompleted && (voiceCompleted || !getCurrentNarration()))
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>
                {currentExample === currentConceptData.examples.length - 1 
                  ? `Take ${currentConceptData.title} Quiz`
                  : 'Next Example'
                }
              </span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicConceptsActivity;