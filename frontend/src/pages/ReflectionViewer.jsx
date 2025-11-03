// File: /src/pages/ReflectionViewer.jsx
// Viewer page for displaying shared reflections via share code

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Star, Sparkles, User, Calendar } from 'lucide-react';
import { getReflectionByCode } from '../lessons/film-music-project/lesson1/reflectionServerUtils';

const ReflectionViewer = () => {
  const { shareCode } = useParams();
  const [searchParams] = useSearchParams();
  const activityType = searchParams.get('type');
  
  const [reflection, setReflection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReflection();
  }, [shareCode]);

  const loadReflection = async () => {
    try {
      const ref = await getReflectionByCode(shareCode);
      
      if (ref && ref.reflection) {
        setReflection(ref);
        setLoading(false);
      } else {
        throw new Error('Reflection not found');
      }
    } catch (error) {
      console.error('Error loading reflection:', error);
      setError('Failed to load reflection');
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getReviewTypeLabel = () => {
    if (reflection.reflection.reviewType === 'self') {
      return 'Self-Reflection';
    } else {
      return `Feedback for ${reflection.reflection.partnerName}`;
    }
  };

  const getReviewTypeColor = () => {
    if (reflection.reflection.reviewType === 'self') {
      return 'from-blue-600 to-cyan-600';
    } else {
      return 'from-purple-600 to-pink-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-400 mx-auto mb-6"></div>
          <div className="text-xl">Loading reflection...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="text-white text-center">
          <div className="text-red-400 text-6xl mb-6">⚠️</div>
          <div className="text-2xl mb-4">{error}</div>
          <button
            onClick={() => window.close()}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className={`bg-gradient-to-r ${getReviewTypeColor()} rounded-2xl shadow-2xl overflow-hidden mb-6`}>
          <div className="p-8">
            <div className="flex items-center gap-4 mb-4">
              <Star className="text-yellow-300" size={48} />
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Student Reflection
                </h1>
                <p className="text-blue-100 text-lg">
                  Two Stars and a Wish Activity
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="text-blue-200" size={20} />
                  <span className="text-blue-100 text-sm font-semibold">Student</span>
                </div>
                <p className="text-white font-bold text-lg">{reflection.studentName}</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="text-purple-200" size={20} />
                  <span className="text-purple-100 text-sm font-semibold">Review Type</span>
                </div>
                <p className="text-white font-bold text-lg">{getReviewTypeLabel()}</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="text-green-200" size={20} />
                  <span className="text-green-100 text-sm font-semibold">Submitted</span>
                </div>
                <p className="text-white font-bold text-sm">{formatDate(reflection.timestamp)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reflection Content */}
        <div className="space-y-6">
          {/* Star 1 */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-4">
              <div className="flex items-center gap-3">
                <Star className="text-white" size={28} fill="currentColor" />
                <h2 className="text-xl font-bold text-white">
                  STAR 1: Using the DAW
                </h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-800 text-lg leading-relaxed">
                {reflection.reflection.star1}
              </p>
            </div>
          </div>

          {/* Star 2 */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-400 to-purple-400 p-4">
              <div className="flex items-center gap-3">
                <Star className="text-white" size={28} fill="currentColor" />
                <h2 className="text-xl font-bold text-white">
                  STAR 2: Loop Timing & Music Sound
                </h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-800 text-lg leading-relaxed">
                {reflection.reflection.star2}
              </p>
            </div>
          </div>

          {/* Wish */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="text-white" size={28} />
                <h2 className="text-xl font-bold text-white">
                  WISH: What to Try Next
                </h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-800 text-lg leading-relaxed">
                {reflection.reflection.wish}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 inline-block">
            <p className="text-white text-sm mb-2">Share Code</p>
            <code className="text-green-400 text-xl font-mono font-bold">
              {reflection.shareCode}
            </code>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => window.close()}
            className="px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg font-semibold transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReflectionViewer;