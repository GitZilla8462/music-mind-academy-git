import React from 'react';
import { Play, Music, Clock, FileText } from 'lucide-react';

const MusicCompositionViewer = ({ studentWork, isExpanded = false }) => {
  let compositionData = null;
  
  try {
    compositionData = JSON.parse(studentWork);
  } catch (error) {
    // If it's not JSON, treat it as plain text
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-700">{studentWork}</p>
      </div>
    );
  }

  if (!compositionData) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-500">No composition data available</p>
      </div>
    );
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTrackColor = (color) => {
    return color || '#6b7280';
  };

  if (!isExpanded) {
    // Compact view for cards
    return (
      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Play className="w-4 h-4 mr-2" />
          Video: {compositionData.selectedVideo?.title || 'Unknown'}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Music className="w-4 h-4 mr-2" />
          {compositionData.placedLoops?.length || 0} music loops
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          Duration: {formatTime(compositionData.duration || 0)}
        </div>
        {compositionData.submissionNotes && (
          <div className="flex items-center text-sm text-gray-600">
            <FileText className="w-4 h-4 mr-2" />
            Has notes
          </div>
        )}
      </div>
    );
  }

  // Expanded view for detailed viewing
  return (
    <div className="space-y-6">
      {/* Video Information */}
      <div>
        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
          <Play className="w-4 h-4 mr-2" />
          Selected Video
        </h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="font-medium">{compositionData.selectedVideo?.title || 'Unknown Video'}</p>
          <p className="text-sm text-gray-600">Duration: {formatTime(compositionData.duration || 0)}</p>
        </div>
      </div>

      {/* Music Composition */}
      <div>
        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
          <Music className="w-4 h-4 mr-2" />
          Music Composition ({compositionData.placedLoops?.length || 0} loops)
        </h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          {compositionData.placedLoops && compositionData.placedLoops.length > 0 ? (
            <div className="space-y-3">
              {/* Group loops by track */}
              {[0, 1, 2, 3].map(trackIndex => {
                const trackLoops = compositionData.placedLoops.filter(loop => loop.trackIndex === trackIndex);
                if (trackLoops.length === 0) return null;
                
                return (
                  <div key={trackIndex} className="border-l-4 border-gray-300 pl-4">
                    <h5 className="font-medium text-gray-700 mb-2">Track {trackIndex + 1}</h5>
                    <div className="space-y-1">
                      {trackLoops
                        .sort((a, b) => a.startTime - b.startTime)
                        .map((loop, index) => (
                          <div 
                            key={index} 
                            className="flex items-center justify-between p-2 bg-white rounded border-l-4"
                            style={{ borderLeftColor: getTrackColor(loop.color) }}
                          >
                            <div className="flex-1">
                              <span className="font-medium text-sm">{loop.name}</span>
                              <span className="text-xs text-gray-500 ml-2">({loop.category})</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {formatTime(loop.startTime)} - {formatTime(loop.endTime)}
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No music loops placed</p>
          )}
        </div>
      </div>

      {/* Timeline Visualization */}
      {compositionData.placedLoops && compositionData.placedLoops.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Timeline Overview</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              {[0, 1, 2, 3].map(trackIndex => {
                const trackLoops = compositionData.placedLoops.filter(loop => loop.trackIndex === trackIndex);
                return (
                  <div key={trackIndex} className="relative">
                    <div className="text-xs text-gray-500 mb-1">Track {trackIndex + 1}</div>
                    <div className="h-8 bg-gray-200 rounded relative overflow-hidden">
                      {/* Timeline grid */}
                      {compositionData.duration && Array.from({ length: Math.ceil(compositionData.duration / 10) }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute top-0 bottom-0 border-r border-gray-300/50"
                          style={{ left: `${(i * 10 / compositionData.duration) * 100}%` }}
                        />
                      ))}
                      
                      {/* Loops */}
                      {trackLoops.map((loop, index) => (
                        <div
                          key={index}
                          className="absolute top-1 bottom-1 rounded text-xs text-white flex items-center justify-center font-medium"
                          style={{
                            left: `${(loop.startTime / compositionData.duration) * 100}%`,
                            width: `${(loop.duration / compositionData.duration) * 100}%`,
                            backgroundColor: getTrackColor(loop.color),
                            minWidth: '20px'
                          }}
                          title={`${loop.name} (${formatTime(loop.startTime)} - ${formatTime(loop.endTime)})`}
                        >
                          <span className="truncate px-1 text-xs">{loop.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Time markers */}
            {compositionData.duration && (
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0:00</span>
                <span>{formatTime(compositionData.duration)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Student Notes */}
      {compositionData.submissionNotes && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Student Notes
          </h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">{compositionData.submissionNotes}</p>
          </div>
        </div>
      )}

      {/* Submission Metadata */}
      {compositionData.submittedAt && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Submission Details</h4>
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
            <p>Submitted: {new Date(compositionData.submittedAt).toLocaleString()}</p>
            {compositionData.videoId && <p>Video ID: {compositionData.videoId}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicCompositionViewer;