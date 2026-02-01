// Student Work Viewer Component
// src/components/teacher/StudentWorkViewer.jsx
// Modal for teachers to view student submitted work

import React, { useState, useEffect } from 'react';
import { X, Clock, CheckCircle, Music, FileText, Loader2 } from 'lucide-react';
import { getStudentWorkForTeacher } from '../../firebase/studentWork';

const StudentWorkViewer = ({
  isOpen,
  onClose,
  student,
  lesson,
  submission,
  classId
}) => {
  const [workData, setWorkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWork = async () => {
      if (!submission?.workKey || !student?.studentUid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getStudentWorkForTeacher(student.studentUid, submission.workKey);
        setWorkData(data);
      } catch (err) {
        console.error('Error fetching work:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchWork();
    }
  }, [isOpen, submission?.workKey, student?.studentUid]);

  if (!isOpen) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] border border-gray-700 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              {workData?.emoji || '📁'} {workData?.title || 'Student Work'}
            </h2>
            <p className="text-sm text-gray-400">
              {student?.displayName || `Student ${student?.seatNumber}`} - {lesson?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : !workData ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No work data available</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Submission Info */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Submission Info</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="ml-2 text-white flex items-center gap-1 inline-flex">
                      {workData.status === 'submitted' ? (
                        <>
                          <Clock className="w-4 h-4 text-yellow-400" />
                          Pending Review
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          Graded
                        </>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-2 text-white capitalize">{workData.type || 'composition'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Submitted:</span>
                    <span className="ml-2 text-white">{formatDate(workData.submittedAt)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Updated:</span>
                    <span className="ml-2 text-white">{formatDate(workData.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Work Preview */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  Composition Data
                </h3>

                {workData.data ? (
                  <div className="space-y-4">
                    {/* Placed Loops */}
                    {workData.data.placedLoops && (
                      <div>
                        <h4 className="text-xs text-gray-500 uppercase mb-2">
                          Loops Used ({workData.data.placedLoops.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {workData.data.placedLoops.map((loop, idx) => (
                            <div
                              key={idx}
                              className="px-3 py-1.5 bg-gray-600 rounded-lg text-sm text-white"
                            >
                              {loop.displayName || loop.name || `Loop ${idx + 1}`}
                              {loop.track !== undefined && (
                                <span className="text-gray-400 ml-1">
                                  (Track {loop.track + 1})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Video Info */}
                    {workData.data.videoId && (
                      <div>
                        <h4 className="text-xs text-gray-500 uppercase mb-2">Video</h4>
                        <p className="text-white">
                          {workData.data.videoTitle || workData.data.videoId}
                        </p>
                      </div>
                    )}

                    {/* Duration */}
                    {workData.data.videoDuration && (
                      <div>
                        <h4 className="text-xs text-gray-500 uppercase mb-2">Duration</h4>
                        <p className="text-white">
                          {Math.floor(workData.data.videoDuration / 60)}:{(workData.data.videoDuration % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                    )}

                    {/* Raw Data Preview (collapsible) */}
                    <details className="mt-4">
                      <summary className="text-xs text-gray-500 uppercase cursor-pointer hover:text-gray-400">
                        View Raw Data
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-800 rounded-lg text-xs text-gray-300 overflow-x-auto">
                        {JSON.stringify(workData.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                ) : (
                  <p className="text-gray-400">No composition data available</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-gray-700 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentWorkViewer;
