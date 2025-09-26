// src/components/dashboard/studentdashboard/StudentExercisesTab.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudentExercisesTab = ({ availableExercises = [], showToast }) => {
  const navigate = useNavigate();

  const handleStartExercise = (exercise) => {
    showToast(`Starting practice: ${exercise.title}`, 'info');
    
    // Navigate to the specific project based on exercise type
    if (exercise.type === 'film-music-score' || exercise.id === 'film-music-score') {
      // Navigate to the film music project interface in practice mode
      navigate('/student/practice/film-music-score');
    } else if (exercise.type === 'solfege') {
      navigate(`/student/exercise/solfege/${exercise.level}`);
    } else if (exercise.type === 'listening') {
      navigate(`/student/exercise/listening/${exercise.level}`);
    } else {
      // Default fallback
      navigate(`/student/exercise/${exercise.type}/${exercise.level || 'beginner'}`);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Practice Exercises</h2>
        <div className="text-sm text-gray-500">
          {availableExercises.length} exercise{availableExercises.length !== 1 ? 's' : ''} available
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {availableExercises.map((exercise) => (
          <div
            key={exercise.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {exercise.title}
              </h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                {exercise.difficulty}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4 text-sm">
              {exercise.description}
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>⏱️ {exercise.estimatedTime}</span>
              <span>📊 {exercise.level}</span>
            </div>
            
            <button
              onClick={() => handleStartExercise(exercise)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Start Practice
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentExercisesTab;