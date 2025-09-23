// /src/components/dashboard/SolfegeIDActivities.jsx - FIXED DEMO NAVIGATION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ADDED THIS IMPORT
import { 
  BookOpen, 
  Play, 
  ArrowLeft,
  CheckCircle,
  Users,
  X,
  Award,
  Target,
  TrendingUp,
  Trophy,
  Star
} from 'lucide-react';

// Add Bravura font for musical symbols
const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Bravura&display=swap');
  .music-symbol {
    font-family: 'Bravura', serif;
    font-size: 18px;
  }
`;

// Inject font styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = FONT_STYLE;
  document.head.appendChild(styleElement);
}

// Musical note components using Bravura font
const QuarterNote = ({ className = "music-symbol" }) => (
  <span className={className}>&#xe1d5;</span>
);

const HalfNote = ({ className = "music-symbol" }) => (
  <span className={className}>&#xe1d3;</span>
);

const QuarterRest = ({ className = "music-symbol" }) => (
  <span className={className}>&#xe4e5;</span>
);

const EighthNote = ({ className = "music-symbol" }) => (
  <span className={className}>&#xe1d7;</span>
);

// Sight Reading Category Definition
const SIGHT_READING_CATEGORY = {
  id: 'sight-reading',
  title: 'Sight Reading Identification',
  icon: <BookOpen className="w-6 h-6" />,
  color: 'bg-blue-500',
  description: 'Identify solfege syllables',
  skillLevels: {
    'beginner': {
      id: 'beginner',
      title: 'Beginner',
      icon: <Award className="w-5 h-5" />,
      color: 'bg-emerald-500',
      description: (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold">Rhythm:</span>
            <QuarterNote className="music-symbol" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold">Time:</span>
            <span className="text-sm">4/4</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold">Solfege:</span>
            <span className="text-sm">Do-Sol</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold">Key:</span>
            <span className="text-sm">C Major</span>
          </div>
        </div>
      ),
      exercises: [
        { id: 1, title: 'Exercise 1', difficulty: 'Beginner', status: '0/8', description: 'Do-Re' },
        { id: 2, title: 'Exercise 2', difficulty: 'Beginner', status: '0/8', description: 'Do-Mi' },
        { id: 3, title: 'Exercise 3', difficulty: 'Beginner', status: '0/8', description: 'Do-Fa' },
        { id: 4, title: 'Exercise 4', difficulty: 'Beginner', status: '0/8', description: 'Do-Sol' }
      ]
    },
    'level-1': {
      id: 'level-1',
      title: 'Level 1',
      icon: <Target className="w-5 h-5" />,
      color: 'bg-blue-500',
      description: (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold">Rhythm:</span>
            <div className="flex items-center space-x-1">
              <QuarterNote className="music-symbol" />
              <HalfNote className="music-symbol" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold">Time:</span>
            <span className="text-sm">4/4</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold">Solfege:</span>
            <span className="text-sm">Do-Sol</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold">Keys:</span>
            <span className="text-sm">C Major, F Major</span>
          </div>
        </div>
      ),
      exercises: [
        { 
          id: 1, 
          title: 'Exercise 1', 
          difficulty: 'Level 1', 
          status: '0/16', 
          description: 'C Major',
          detailedDescription: '8-measure solfege identification with Do through Sol using quarter and half notes in C Major'
        },
        { 
          id: 2, 
          title: 'Exercise 2', 
          difficulty: 'Level 1', 
          status: '0/16', 
          description: 'F Major',
          detailedDescription: '8-measure solfege identification with Do through Sol using quarter and half notes in F Major'
        }
      ]
    },
    'level-2': {
      id: 'level-2',
      title: 'Level 2',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-orange-500',
      description: (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold">Rhythm:</span>
            <div className="flex items-center space-x-1">
              <QuarterNote className="music-symbol" />
              <HalfNote className="music-symbol" />
              <QuarterRest className="music-symbol" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold">Time:</span>
            <span className="text-sm">4/4, 2/4</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold">Solfege:</span>
            <span className="text-sm">Do-La</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold">Keys:</span>
            <span className="text-sm">C Major, F Major, G Major</span>
          </div>
        </div>
      ),
      exercises: [
        { 
          id: 1, 
          title: 'Exercise 1', 
          difficulty: 'Level 2', 
          status: '0/20', 
          description: 'C Major',
          detailedDescription: '8-measure solfege identification with Do through La using quarter notes, half notes, and quarter rests in C Major. Includes Do-Mi-Sol patterns and rhythmic complexity.'
        },
        { 
          id: 2, 
          title: 'Exercise 2', 
          difficulty: 'Level 2', 
          status: '0/20', 
          description: 'F Major',
          detailedDescription: '8-measure solfege identification with Do through La using quarter notes, half notes, and quarter rests in F Major. Includes Do-Mi-Sol patterns and rhythmic complexity.'
        },
        { 
          id: 3, 
          title: 'Exercise 3', 
          difficulty: 'Level 2', 
          status: '0/20', 
          description: 'G Major',
          detailedDescription: '8-measure solfege identification with Do through La using quarter notes, half notes, and quarter rests in G Major. Includes Do-Mi-Sol patterns and rhythmic complexity.'
        },
      ]
    },
    'level-3': {
      id: 'level-3',
      title: 'Level 3',
      icon: <Star className="w-5 h-5" />,
      color: 'bg-purple-500',
      description: (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold">Rhythm:</span>
            <div className="flex items-center space-x-1">
              <QuarterNote className="music-symbol" />
              <HalfNote className="music-symbol" />
              <EighthNote className="music-symbol" />
              <QuarterRest className="music-symbol" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold">Time:</span>
            <span className="text-sm">4/4</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold">Solfege:</span>
            <span className="text-sm">Do-La</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold">Keys:</span>
            <span className="text-sm">C Major, F Major, G Major</span>
          </div>
        </div>
      ),
      exercises: [
        { 
          id: 1, 
          title: 'Exercise 1', 
          difficulty: 'Level 3', 
          status: '0/23', 
          description: 'C Major',
          keySignature: 'C Major',
          timeSignature: '4/4',
          detailedDescription: '8-measure solfege identification with Do through La using quarter notes, half notes, and eighth note pairs in C Major with 4/4 time signature.'
        },
        { 
          id: 2, 
          title: 'Exercise 2', 
          difficulty: 'Level 3', 
          status: '0/23', 
          description: 'F Major',
          keySignature: 'F Major',
          timeSignature: '4/4',
          detailedDescription: '8-measure solfege identification with Do through La using quarter notes, half notes, and eighth note pairs in F Major with 4/4 time signature.'
        },
        { 
          id: 3, 
          title: 'Exercise 3', 
          difficulty: 'Level 3', 
          status: '0/23', 
          description: 'G Major',
          keySignature: 'G Major',
          timeSignature: '4/4',
          detailedDescription: '8-measure solfege identification with Do through La using quarter notes, half notes, and eighth note pairs in G Major with 4/4 time signature.'
        },
        { 
          id: 4, 
          title: 'Exercise 4', 
          difficulty: 'Level 3', 
          status: '0/24', 
          description: 'C Major',
          keySignature: 'C Major',
          timeSignature: '3/4',
          detailedDescription: '8-measure solfege identification with Do only using quarter notes in C Major with 3/4 time signature.'
        }
      ]
    },
    'level-4': {
      id: 'level-4',
      title: 'Level 4',
      icon: <Trophy className="w-5 h-5" />,
      color: 'bg-red-500',
      description: (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold">Rhythm:</span>
            <div className="flex items-center space-x-1">
              <QuarterNote className="music-symbol" />
              <HalfNote className="music-symbol" />
              <EighthNote className="music-symbol" />
              <QuarterRest className="music-symbol" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold">Time:</span>
            <span className="text-sm">4/4</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold">Solfege:</span>
            <span className="text-sm">Do-Ti</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold">Keys:</span>
            <span className="text-sm">C Major, F Major, G Major</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold">Dynamics:</span>
            <span className="text-sm">f/p</span>
          </div>
        </div>
      ),
      exercises: [
        { 
          id: 1, 
          title: 'Exercise 1', 
          difficulty: 'Level 4', 
          status: '0/25', 
          description: 'C Major',
          keySignature: 'C Major',
          timeSignature: '4/4',
          detailedDescription: '8-measure solfege identification with Do through Ti using quarter notes, half notes, and eighth note pairs in C Major with 4/4 time signature. Includes dynamics (forte/piano) and Sol-La-Ti-Do sequences.'
        },
        { 
          id: 2, 
          title: 'Exercise 2', 
          difficulty: 'Level 4', 
          status: '0/25', 
          description: 'F Major',
          keySignature: 'F Major',
          timeSignature: '4/4',
          detailedDescription: '8-measure solfege identification with Do through Ti using quarter notes, half notes, and eighth note pairs in F Major with 4/4 time signature. Includes dynamics (forte/piano) and Sol-La-Ti-Do sequences.'
        },
        { 
          id: 3, 
          title: 'Exercise 3', 
          difficulty: 'Level 4', 
          status: '0/25', 
          description: 'G Major',
          keySignature: 'G Major',
          timeSignature: '4/4',
          detailedDescription: '8-measure solfege identification with Do through Ti using quarter notes, half notes, and eighth note pairs in G Major with 4/4 time signature. Includes dynamics (forte/piano) and Sol-La-Ti-Do sequences.'
        }
      ]
    }
  }
};

const SolfegeIDActivities = ({ 
  selectedClass, 
  onAssignToStudents, 
  onClose,
  onBackToCategories,
  initialSkillLevel
}) => {
  const navigate = useNavigate(); // ADDED THIS LINE
  const [selectedSkillLevel, setSelectedSkillLevel] = useState(initialSkillLevel || null);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [showPreview, setShowPreview] = useState(null);
  const [hasUserNavigated, setHasUserNavigated] = useState(false);

  // Update selectedSkillLevel when initialSkillLevel prop changes
  // Only auto-set if we haven't manually navigated away from it
  useEffect(() => {
    if (initialSkillLevel && !selectedSkillLevel && !hasUserNavigated) {
      setSelectedSkillLevel(initialSkillLevel);
    }
  }, [initialSkillLevel, selectedSkillLevel, hasUserNavigated]);

  const category = SIGHT_READING_CATEGORY;

  // Function to clear URL parameters
  const clearUrlParameters = () => {
    window.history.replaceState({}, '', window.location.pathname);
  };

  // Skill level selection component
  const SkillLevelSelection = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                if (onBackToCategories) {
                  onBackToCategories();
                } else {
                  console.warn('onBackToCategories function not provided');
                }
              }}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Categories</span>
            </button>
          </div>
          
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-3 mb-8">
          <div className={`${category.color} text-white p-2 rounded-lg`}>
            {category.icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{category.title}</h3>
            <p className="text-gray-600">Choose your skill level</p>
          </div>
        </div>

        {/* First row: Beginner, Level 1, Level 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {['beginner', 'level-1', 'level-2'].map((levelId) => {
            const skillLevel = category.skillLevels[levelId];
            return (
              <div
                key={skillLevel.id}
                onClick={() => setSelectedSkillLevel(skillLevel.id)}
                className="bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="p-4">
                  <div className={`${skillLevel.color} text-white p-2 rounded-lg mb-3 flex flex-col items-center justify-center`}>
                    {skillLevel.icon}
                    <div className="mt-1 text-center">
                      <div className="font-bold text-sm">{skillLevel.title}</div>
                    </div>
                  </div>
                  
                  <div className="mb-3 text-xs">{skillLevel.description}</div>
                  
                  <div className="text-xs text-gray-500 text-center">
                    {skillLevel.exercises.length} exercise{skillLevel.exercises.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Second row: Level 3, Level 4 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['level-3', 'level-4'].map((levelId) => {
            const skillLevel = category.skillLevels[levelId];
            return (
              <div
                key={skillLevel.id}
                onClick={() => setSelectedSkillLevel(skillLevel.id)}
                className="bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="p-4">
                  <div className={`${skillLevel.color} text-white p-2 rounded-lg mb-3 flex flex-col items-center justify-center`}>
                    {skillLevel.icon}
                    <div className="mt-1 text-center">
                      <div className="font-bold text-sm">{skillLevel.title}</div>
                    </div>
                  </div>
                  
                  <div className="mb-3 text-xs">{skillLevel.description}</div>
                  
                  <div className="text-xs text-gray-500 text-center">
                    {skillLevel.exercises.length} exercise{skillLevel.exercises.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Exercise list component
  const ExerciseList = () => {
    const skillLevel = category.skillLevels[selectedSkillLevel];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                setSelectedSkillLevel(null);
                setHasUserNavigated(true); // Mark that user has manually navigated
                clearUrlParameters(); // Clear URL parameters when going back
              }}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sight Reading Identification</span>
            </button>
          </div>
          
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-start gap-6">
            <div className={`${skillLevel.color} text-white p-3 rounded-lg flex-shrink-0`}>
              {skillLevel.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{skillLevel.title} Exercises</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-700">Rhythm:</span>
                  <div className="flex items-center space-x-1">
                    {skillLevel.id === 'beginner' && <QuarterNote className="music-symbol" />}
                    {skillLevel.id === 'level-1' && (
                      <>
                        <QuarterNote className="music-symbol" />
                        <HalfNote className="music-symbol" />
                      </>
                    )}
                    {skillLevel.id === 'level-2' && (
                      <>
                        <QuarterNote className="music-symbol" />
                        <HalfNote className="music-symbol" />
                        <QuarterRest className="music-symbol" />
                      </>
                    )}
                    {skillLevel.id === 'level-3' && (
                      <>
                        <QuarterNote className="music-symbol" />
                        <HalfNote className="music-symbol" />
                        <EighthNote className="music-symbol" />
                        <QuarterRest className="music-symbol" />
                      </>
                    )}
                    {skillLevel.id === 'level-4' && (
                      <>
                        <QuarterNote className="music-symbol" />
                        <HalfNote className="music-symbol" />
                        <EighthNote className="music-symbol" />
                        <QuarterRest className="music-symbol" />
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-700">Time:</span>
                  <span className="text-sm text-gray-800">
                    {skillLevel.id === 'beginner' && '4/4'}
                    {skillLevel.id === 'level-1' && '4/4'}
                    {skillLevel.id === 'level-2' && '4/4, 2/4'}
                    {skillLevel.id === 'level-3' && '4/4, 3/4, 2/4'}
                    {skillLevel.id === 'level-4' && '4/4'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-700">Solfege:</span>
                  <span className="text-sm text-gray-800">
                    {skillLevel.id === 'beginner' && 'Do-Sol'}
                    {skillLevel.id === 'level-1' && 'Do-Sol'}
                    {skillLevel.id === 'level-2' && 'Do-La'}
                    {skillLevel.id === 'level-3' && 'Do-La'}
                    {skillLevel.id === 'level-4' && 'Do-Ti'}
                  </span>
                </div>
                
                <div className="text-sm">
                  <span className="font-bold">Keys:</span> 
                  <span className="text-sm text-gray-800">
                    {skillLevel.id === 'beginner' && ' C Major'}
                    {skillLevel.id === 'level-1' && ' C Major, F Major'}
                    {skillLevel.id === 'level-2' && ' C Major, F Major, G Major'}
                    {skillLevel.id === 'level-3' && ' C Major, F Major, G Major'}
                    {skillLevel.id === 'level-4' && ' C Major, F Major, G Major'}
                  </span>
                </div>
              </div>
              {skillLevel.id === 'level-4' && (
                <div className="mt-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-700">Dynamics:</span>
                    <span className="text-sm text-gray-800">forte (f) / piano (p)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillLevel.exercises.map((exercise) => {
            const isSelected = selectedExercises.includes(exercise.id);
            
            return (
              <div
                key={exercise.id}
                className={`bg-white rounded-lg border-2 transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-blue-500 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => handleExerciseSelect(exercise.id)}
              >
                <div className={`${skillLevel.color} text-white p-3 rounded-t-lg`}>
                  <h4 className="font-semibold text-center">{exercise.title}</h4>
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 text-center">
                      {(skillLevel.id === 'level-3' || skillLevel.id === 'level-4') ? (
                        <div>
                          <div className="mb-2">
                            <div className="text-sm font-bold text-gray-700">
                              <div>Key</div>
                              <div>Signature:</div>
                            </div>
                            <span className="text-lg font-bold text-gray-800">{exercise.keySignature || exercise.description}</span>
                          </div>
                          <div className="mb-1">
                            <span className="text-sm font-bold text-gray-700">Time: </span>
                            <span className="text-lg font-bold text-gray-800">{exercise.timeSignature}</span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="mb-1">
                            <div className="text-sm font-bold text-gray-700">
                              <div>Key</div>
                              <div>Signature:</div>
                            </div>
                          </div>
                          <div className="text-lg font-bold text-gray-800">{exercise.description}</div>
                        </div>
                      )}
                    </div>
                    
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Progress:</span>
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {exercise.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDemoExercise(exercise);
                      }}
                      className="w-full flex items-center justify-center space-x-1 py-2 px-3 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      <span>Demo</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {selectedExercises.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium">
                  {selectedExercises.length} exercise{selectedExercises.length > 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => setSelectedExercises([])}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear selection
                </button>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleAssignToClass}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span>Assign to {selectedClass?.name || 'Class'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Preview Modal
  const PreviewModal = () => {
    if (!showPreview) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Exercise Preview</h3>
            <button
              onClick={() => setShowPreview(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800">
                {showPreview.title}
              </h4>
              <p className="text-gray-600 text-sm mt-1">{showPreview.detailedDescription || showPreview.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Duration:</span>
                <span className="ml-2 text-gray-700">{showPreview.duration}</span>
              </div>
              <div>
                <span className="text-gray-500">Level:</span>
                <span className="ml-2 text-gray-700">{showPreview.difficulty}</span>
              </div>
              <div>
                <span className="text-gray-500">Progress:</span>
                <span className="ml-2 text-gray-700">{showPreview.status}</span>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium text-blue-800 mb-2">What students will do:</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                {getSightReadingPreviewItems(showPreview)}
              </ul>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowPreview(null);
                  handleDemoExercise(showPreview);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
              >
                Try Demo
              </button>
              <button
                onClick={() => setShowPreview(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper function for sight reading preview items
  const getSightReadingPreviewItems = (exercise) => {
    if (exercise.id === 1 && selectedSkillLevel === 'level-1') {
      return [
        <li key="1">• View 8 measures of music notation in C Major</li>,
        <li key="2">• Listen to individual notes by clicking Play Note</li>,
        <li key="3">• Identify solfege syllables (Do through Sol)</li>,
        <li key="4">• Work with quarter and half note rhythms</li>,
        <li key="5">• Complete 16 note identification exercises</li>,
        <li key="6">• Receive immediate feedback on answers</li>
      ];
    } else if (exercise.id === 2 && selectedSkillLevel === 'level-1') {
      return [
        <li key="1">• View 8 measures of music notation in F Major</li>,
        <li key="2">• Listen to individual notes by clicking Play Note</li>,
        <li key="3">• Identify solfege syllables (Do through Sol)</li>,
        <li key="4">• Work with quarter and half note rhythms</li>,
        <li key="5">• Complete 16 note identification exercises</li>,
        <li key="6">• Receive immediate feedback on answers</li>
      ];
    } else if (exercise.id === 1 && selectedSkillLevel === 'level-2') {
      return [
        <li key="1">• View 8 measures of music notation in C Major</li>,
        <li key="2">• Listen to individual notes by clicking Play Note</li>,
        <li key="3">• Identify solfege syllables (Do through La)</li>,
        <li key="4">• Work with quarter notes, half notes, and quarter rests</li>,
        <li key="5">• Practice Do-Mi-Sol patterns within the exercises</li>,
        <li key="6">• Complete approximately 20 note identification exercises</li>,
        <li key="7">• Receive immediate feedback on answers</li>
      ];
    } else if (exercise.id === 2 && selectedSkillLevel === 'level-2') {
      return [
        <li key="1">• View 8 measures of music notation in F Major</li>,
        <li key="2">• Listen to individual notes by clicking Play Note</li>,
        <li key="3">• Identify solfege syllables (Do through La)</li>,
        <li key="4">• Work with quarter notes, half notes, and quarter rests</li>,
        <li key="5">• Practice Do-Mi-Sol patterns within the exercises</li>,
        <li key="6">• Complete approximately 20 note identification exercises</li>,
        <li key="7">• Receive immediate feedback on answers</li>
      ];
    } else if (exercise.id === 3 && selectedSkillLevel === 'level-2') {
      return [
        <li key="1">• View 8 measures of music notation in G Major</li>,
        <li key="2">• Listen to individual notes by clicking Play Note</li>,
        <li key="3">• Identify solfege syllables (Do through La)</li>,
        <li key="4">• Work with quarter notes, half notes, and quarter rests</li>,
        <li key="5">• Practice Do-Mi-Sol patterns within the exercises</li>,
        <li key="6">• Complete approximately 20 note identification exercises</li>,
        <li key="7">• Receive immediate feedback on answers</li>
      ];
    } else if (exercise.id === 1 && selectedSkillLevel === 'level-3') {
      return [
        <li key="1">• View 8 measures of music notation in C Major with 4/4 time</li>,
        <li key="2">• Listen to individual notes by clicking Play Note</li>,
        <li key="3">• Identify solfege syllables (Do through La)</li>,
        <li key="4">• Work with quarter notes, half notes, and eighth note pairs</li>,
        <li key="5">• Practice stepwise eighth note patterns</li>,
        <li key="6">• Complete approximately 23 note identification exercises</li>,
        <li key="7">• Receive immediate feedback on answers</li>
      ];
    } else if (exercise.id === 2 && selectedSkillLevel === 'level-3') {
      return [
        <li key="1">• View 8 measures of music notation in F Major with 4/4 time</li>,
        <li key="2">• Listen to individual notes by clicking Play Note</li>,
        <li key="3">• Identify solfege syllables (Do through La)</li>,
        <li key="4">• Work with quarter notes, half notes, and eighth note pairs</li>,
        <li key="5">• Practice stepwise eighth note patterns in F Major</li>,
        <li key="6">• Complete approximately 23 note identification exercises</li>,
        <li key="7">• Receive immediate feedback on answers</li>
      ];
    } else if (exercise.id === 3 && selectedSkillLevel === 'level-3') {
      return [
        <li key="1">• View 8 measures of music notation in G Major with 4/4 time</li>,
        <li key="2">• Listen to individual notes by clicking Play Note</li>,
        <li key="3">• Identify solfege syllables (Do through La)</li>,
        <li key="4">• Work with quarter notes, half notes, and eighth note pairs</li>,
        <li key="5">• Practice stepwise eighth note patterns in G Major</li>,
        <li key="6">• Complete approximately 23 note identification exercises</li>,
        <li key="7">• Receive immediate feedback on answers</li>
      ];
    } else if (exercise.id === 4 && selectedSkillLevel === 'level-3') {
      return [
        <li key="1">• View 8 measures of music notation in C Major with 3/4 time</li>,
        <li key="2">• Listen to individual notes by clicking Play Note</li>,
        <li key="3">• Identify solfege syllables (Do only)</li>,
        <li key="4">• Work with quarter notes in 3/4 time signature</li>,
        <li key="5">• Practice simple rhythmic patterns with all Do notes</li>,
        <li key="6">• Complete 24 note identification exercises</li>,
        <li key="7">• Receive immediate feedback on answers</li>
      ];
    } else if (exercise.id === 1 && selectedSkillLevel === 'level-4') {
      return [
        <li key="1">• View 8 measures of music notation in C Major with 4/4 time</li>,
        <li key="2">• Listen to individual notes by clicking Play Note</li>,
        <li key="3">• Identify solfege syllables (Do through Ti)</li>,
        <li key="4">• Work with quarter notes, half notes, and eighth note pairs</li>,
        <li key="5">• Practice Do-Mi-Sol and Sol-La-Ti-Do sequences</li>,
        <li key="6">• Experience dynamics markings (forte/piano)</li>,
        <li key="7">• Complete approximately 25 note identification exercises</li>,
        <li key="8">• Receive immediate feedback on answers</li>
      ];
    } else if (exercise.id === 2 && selectedSkillLevel === 'level-4') {
      return [
        <li key="1">• View 8 measures of music notation in F Major with 4/4 time</li>,
        <li key="2">• Listen to individual notes by clicking Play Note</li>,
        <li key="3">• Identify solfege syllables (Do through Ti)</li>,
        <li key="4">• Work with quarter notes, half notes, and eighth note pairs</li>,
        <li key="5">• Practice Do-Mi-Sol and Sol-La-Ti-Do sequences in F Major</li>,
        <li key="6">• Experience dynamics markings (forte/piano)</li>,
        <li key="7">• Complete approximately 25 note identification exercises</li>,
        <li key="8">• Receive immediate feedback on answers</li>
      ];
    } else if (exercise.id === 3 && selectedSkillLevel === 'level-4') {
      return [
        <li key="1">• View 8 measures of music notation in G Major with 4/4 time</li>,
        <li key="2">• Listen to individual notes by clicking Play Note</li>,
        <li key="3">• Identify solfege syllables (Do through Ti)</li>,
        <li key="4">• Work with quarter notes, half notes, and eighth note pairs</li>,
        <li key="5">• Practice Do-Mi-Sol and Sol-La-Ti-Do sequences in G Major</li>,
        <li key="6">• Experience dynamics markings (forte/piano)</li>,
        <li key="7">• Complete approximately 25 note identification exercises</li>,
        <li key="8">• Receive immediate feedback on answers</li>
      ];
    } else {
      return [
        <li key="1">• Listen to musical notes</li>,
        <li key="2">• Identify the correct solfege syllable</li>,
        <li key="3">• Complete {exercise.status.split('/')[1]} exercises</li>,
        <li key="4">• Receive immediate feedback</li>
      ];
    }
  };

  const handleExerciseSelect = (exerciseId) => {
    setSelectedExercises(prev => 
      prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  // FIXED DEMO EXERCISE FUNCTION - USES REACT ROUTER NAVIGATION
  const handleDemoExercise = (exercise) => {
    let exerciseUrl;
    if (exercise.id === 1 && selectedSkillLevel === 'level-1') {
      exerciseUrl = `/lvl1-exercise-1`;
    } else if (exercise.id === 2 && selectedSkillLevel === 'level-1') {
      exerciseUrl = `/lvl1-exercise-2`;
    } else if (exercise.id === 1 && selectedSkillLevel === 'level-2') {
      exerciseUrl = `/lvl2-exercise-1`;
    } else if (exercise.id === 2 && selectedSkillLevel === 'level-2') {
      exerciseUrl = `/lvl2-exercise-2`;
    } else if (exercise.id === 3 && selectedSkillLevel === 'level-2') {
      exerciseUrl = `/lvl2-exercise-3`;
    } else if (exercise.id === 1 && selectedSkillLevel === 'level-3') {
      exerciseUrl = `/lvl3-exercise-1`;
    } else if (exercise.id === 2 && selectedSkillLevel === 'level-3') {
      exerciseUrl = `/lvl3-exercise-2`;
    } else if (exercise.id === 3 && selectedSkillLevel === 'level-3') {
      exerciseUrl = `/lvl3-exercise-3`;
    } else if (exercise.id === 4 && selectedSkillLevel === 'level-3') {
      exerciseUrl = `/lvl3-exercise-4`;
    } else if (exercise.id === 1 && selectedSkillLevel === 'level-4') {
      exerciseUrl = `/lvl4-exercise-1`;
    } else if (exercise.id === 2 && selectedSkillLevel === 'level-4') {
      exerciseUrl = `/lvl4-exercise-2`;
    } else if (exercise.id === 3 && selectedSkillLevel === 'level-4') {
      exerciseUrl = `/lvl4-exercise-3`;
    } else {
      exerciseUrl = `/exercise-${exercise.id}`;
    }
    
    // Use React Router navigation instead of window.open
    navigate(exerciseUrl);
  };

  const handleAssignToClass = () => {
    const skillLevel = category.skillLevels[selectedSkillLevel];
    const exercises = skillLevel.exercises.filter(ex => selectedExercises.includes(ex.id));
    
    onAssignToStudents({
      categoryId: 'sight-reading',
      categoryTitle: category.title,
      skillLevelId: selectedSkillLevel,
      skillLevelTitle: skillLevel.title,
      exercises: exercises,
      assignedAt: new Date().toISOString(),
      classId: selectedClass?.id,
      className: selectedClass?.name
    });
    
    setSelectedExercises([]);
    if (onClose) onClose();
  };

  // Determine which view to show
  if (!selectedSkillLevel) {
    return <SkillLevelSelection />;
  } else {
    return (
      <>
        <ExerciseList />
        <PreviewModal />
      </>
    );
  }
};

export default SolfegeIDActivities;