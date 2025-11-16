// Teacher Controls for Layer Detective
// Includes End Activity button and activity management
// src/lessons/shared/activities/layer-detective/LayerDetectiveTeacherControls.jsx

import React, { useState } from 'react';
import { useSession } from '../../../../context/SessionContext';
import { StopCircle, Trophy, RefreshCw, Play } from 'lucide-react';

const LayerDetectiveTeacherControls = () => {
  const { sessionCode, setCurrentStage, getStudents } = useSession();
  const [showConfirm, setShowConfirm] = useState(false);
  
  const handleEndActivity = async () => {
    setShowConfirm(true);
  };
  
  const confirmEndActivity = async () => {
    // Change stage to show results
    await setCurrentStage('layer-detective-results');
    setShowConfirm(false);
  };
  
  const handlePlayAgain = async () => {
    // Reset scores and restart
    // This would need to be implemented in your firebase config
    await setCurrentStage('layer-detective');
  };
  
  const handleNextActivity = async () => {
    // Move to next lesson stage
    await setCurrentStage('next-activity');
  };
  
  const studentCount = getStudents().length;
  
  return (
    <div className="bg-gray-100 rounded-lg p-4 shadow-lg">
      <h3 className="text-lg font-bold mb-4 text-gray-800">Layer Detective Controls</h3>
      
      {/* Activity Status */}
      <div className="mb-4 p-3 bg-white rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Students Playing:</span>
          <span className="font-bold text-gray-900">{studentCount}</span>
        </div>
      </div>
      
      {/* Control Buttons */}
      <div className="space-y-2">
        {!showConfirm ? (
          <button
            onClick={handleEndActivity}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
          >
            <StopCircle size={20} />
            <span>End Activity</span>
          </button>
        ) : (
          <div className="space-y-2">
            <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800">
              End Layer Detective and show results?
            </div>
            <button
              onClick={confirmEndActivity}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold"
            >
              Yes, Show Results
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      
      {/* Instructions */}
      <div className="mt-4 text-xs text-gray-500">
        <p>• Students are earning points for correct answers</p>
        <p>• Speed bonuses are awarded for fast responses</p>
        <p>• Click "End Activity" when ready to show final results</p>
      </div>
    </div>
  );
};

export default LayerDetectiveTeacherControls;