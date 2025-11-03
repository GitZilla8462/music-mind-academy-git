// File: /src/pages/CompositionViewer.jsx
// Viewer page for displaying saved compositions in the DAW

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import SchoolBeneathActivity from '../lessons/shared/activities/SchoolBeneathActivity';
import SoundEffectsActivity from '../lessons/shared/activities/SoundEffectsActivity';
import { getCompositionByCode } from '../lessons/film-music-project/lesson1/compositionServerUtils';

const CompositionViewer = () => {
  const { shareCode } = useParams();
  const [searchParams] = useSearchParams();
  const activityType = searchParams.get('type');
  
  const [composition, setComposition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadComposition();
  }, [shareCode]);

  const loadComposition = async () => {
    try {
      // Try to load from Firebase first
      const comp = await getCompositionByCode(shareCode);
      
      if (comp && comp.composition) {
        // Store in localStorage for the activity to read
        const viewKey = activityType === 'sound-effects' 
          ? 'view-sound-effects' 
          : 'view-school-beneath';
        localStorage.setItem(viewKey, JSON.stringify(comp.composition));
        
        setComposition(comp.composition);
        setLoading(false);
      } else {
        throw new Error('Composition not found');
      }
    } catch (error) {
      console.error('Error loading composition:', error);
      setError('Failed to load composition');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg">Loading composition...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="text-red-500 text-2xl mb-4">⚠️</div>
          <div className="text-lg mb-4">{error}</div>
          <button
            onClick={() => window.close()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  // Render the appropriate activity in view mode
  if (activityType === 'sound-effects') {
    return (
      <SoundEffectsActivity
        viewMode={true}
        onComplete={() => {}}
      />
    );
  }

  return (
    <SchoolBeneathActivity
      viewMode={true}
      viewBonusMode={false}
      onComplete={() => {}}
    />
  );
};

export default CompositionViewer;