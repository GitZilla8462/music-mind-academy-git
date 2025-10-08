import React, { useState, useEffect } from 'react';
import { Play, BookOpen, Music, PenTool, CheckCircle } from 'lucide-react';

const SimpleLessonPlaceholder = ({ lessonId = 'film-music-1' }) => {
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessonData();
  }, [lessonId]);

  const fetchLessonData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/lessons/${lessonId}`);
      const result = await response.json();
      if (result.success) {
        setLessonData(result.data);
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'intro-video': return <Play className="text-blue-600" size={24} />;
      case 'interactive-quiz': return <BookOpen className="text-green-600" size={24} />;
      case 'composer-daw': return <Music className="text-purple-600" size={24} />;
      case 'reflection': return <PenTool className="text-orange-600" size={24} />;
      default: return <CheckCircle className="text-gray-600" size={24} />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center text-red-500">
          Failed to load lesson data. Make sure your backend is running on port 5000.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{lessonData.title}</h1>
        <p className="text-gray-600 mb-4">{lessonData.description}</p>
        
        {/* Lesson Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{lessonData.estimatedTime}</div>
            <div className="text-sm text-gray-500">Minutes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 capitalize">{lessonData.difficulty}</div>
            <div className="text-sm text-gray-500">Difficulty</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{lessonData.activities?.length}</div>
            <div className="text-sm text-gray-500">Activities</div>
          </div>
        </div>
      </div>

      {/* Learning Objectives */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Learning Objectives</h2>
        <ul className="space-y-2">
          {lessonData.learningObjectives?.map((objective, index) => (
            <li key={index} className="flex items-start space-x-2">
              <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={16} />
              <span className="text-gray-700">{objective}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Activities Preview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Lesson Activities</h2>
        <div className="space-y-4">
          {lessonData.activities?.map((activity, index) => (
            <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-800">
                    Activity {activity.order}: {activity.title}
                  </h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {activity.type.replace('-', ' ')} • {activity.estimatedTime} minutes
                  </p>
                  {activity.type === 'interactive-quiz' && (
                    <p className="text-xs text-blue-600 mt-1">
                      {activity.config.questionCount} questions • {activity.config.passingScore}% passing score
                    </p>
                  )}
                  {activity.type === 'composer-daw' && (
                    <p className="text-xs text-purple-600 mt-1">
                      Project: {activity.config.project} • {activity.config.availableLoops?.length} loops available
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className={`px-2 py-1 rounded text-xs ${
                    activity.isRequired 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {activity.isRequired ? 'Required' : 'Optional'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Start Lesson Button */}
      <div className="text-center">
        <button 
          onClick={() => alert('Lesson player coming soon! This will launch the full interactive experience.')}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold inline-flex items-center space-x-2"
        >
          <Play size={20} />
          <span>Start Lesson</span>
        </button>
        <p className="text-sm text-gray-500 mt-2">
          This will launch the interactive lesson player with video segments, quizzes, and activities
        </p>
      </div>

      {/* Debug Info */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Debug Info</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div>Lesson ID: {lessonData.id}</div>
          <div>Category: {lessonData.category}</div>
          <div>Created: {new Date(lessonData.createdAt).toLocaleDateString()}</div>
          <div>API Connection: ✅ Connected to backend</div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLessonPlaceholder;

