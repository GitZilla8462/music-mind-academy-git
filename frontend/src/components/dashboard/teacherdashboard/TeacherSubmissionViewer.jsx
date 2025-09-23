import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Clock, CheckCircle, AlertCircle, User, Calendar, FileText, Star, X } from 'lucide-react';
import StudentSubmissionView from './StudentSubmissionView';

const TeacherSubmissionViewer = ({ showToast }) => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showPlaybackView, setShowPlaybackView] = useState(false);
  const [gradingData, setGradingData] = useState({ grade: '', feedback: '' });
  const [isGrading, setIsGrading] = useState(false);
  const [currentSubmissionIndex, setCurrentSubmissionIndex] = useState(0);

  useEffect(() => {
    fetchAssignmentAndSubmissions();
  }, [assignmentId]);

  const fetchAssignmentAndSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch assignment details
      const assignmentResponse = await fetch(`/api/assignments/${assignmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (assignmentResponse.ok) {
        const assignmentData = await assignmentResponse.json();
        setAssignment(assignmentData);
      }

      // Fetch submissions
      const submissionsResponse = await fetch(`/api/submissions/assignment/${assignmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json();
        setSubmissions(submissionsData);
      } else {
        showToast('Failed to load submissions', 'error');
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Error loading assignment data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to parse student work
  const parseStudentWork = (studentWork) => {
    try {
      return JSON.parse(studentWork);
    } catch (error) {
      return null;
    }
  };

  // Helper function to get submission summary
  const getSubmissionSummary = (studentWork) => {
    const parsed = parseStudentWork(studentWork);
    if (parsed) {
      return {
        videoTitle: parsed.selectedVideo?.title || 'Unknown Video',
        loopCount: parsed.placedLoops?.length || 0,
        hasNotes: !!parsed.submissionNotes
      };
    }
    return {
      videoTitle: 'Text Submission',
      loopCount: 0,
      hasNotes: false
    };
  };

  const handleGradeSubmission = async (submissionId) => {
    if (!gradingData.grade || gradingData.grade < 0 || gradingData.grade > 100) {
      showToast('Please enter a valid grade (0-100)', 'error');
      return;
    }

    setIsGrading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/submissions/${submissionId}/grade`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grade: parseFloat(gradingData.grade),
          feedback: gradingData.feedback,
          status: 'graded'
        }),
      });

      if (response.ok) {
        showToast('Submission graded successfully', 'success');
        await fetchAssignmentAndSubmissions(); // Refresh data
        setSelectedSubmission(null);
        setShowPlaybackView(false);
        setGradingData({ grade: '', feedback: '' });
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Failed to grade submission', 'error');
      }
    } catch (error) {
      console.error('Error grading submission:', error);
      showToast('Error grading submission', 'error');
    } finally {
      setIsGrading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'graded':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'text-yellow-600 bg-yellow-100';
      case 'graded':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewPlayback = (submission) => {
    const parsed = parseStudentWork(submission.studentWork);
    if (parsed && parsed.selectedVideo) {
      const index = submissions.findIndex(s => s._id === submission._id);
      setCurrentSubmissionIndex(index);
      setSelectedSubmission(submission);
      setShowPlaybackView(true);
      // Pre-fill grading data if already graded
      setGradingData({
        grade: submission.grade !== undefined ? submission.grade.toString() : '',
        feedback: submission.feedback || ''
      });
    } else {
      showToast('This submission cannot be played back (no music composition found)', 'error');
    }
  };

  // Navigation functions for playback view
  const navigateToPreviousSubmission = () => {
    const playableSubmissions = submissions.filter(s => {
      const parsed = parseStudentWork(s.studentWork);
      return parsed && parsed.selectedVideo;
    });
    
    const currentPlayableIndex = playableSubmissions.findIndex(s => s._id === selectedSubmission._id);
    if (currentPlayableIndex > 0) {
      const prevSubmission = playableSubmissions[currentPlayableIndex - 1];
      const globalIndex = submissions.findIndex(s => s._id === prevSubmission._id);
      setCurrentSubmissionIndex(globalIndex);
      setSelectedSubmission(prevSubmission);
      setGradingData({
        grade: prevSubmission.grade !== undefined ? prevSubmission.grade.toString() : '',
        feedback: prevSubmission.feedback || ''
      });
    }
  };

  const navigateToNextSubmission = () => {
    const playableSubmissions = submissions.filter(s => {
      const parsed = parseStudentWork(s.studentWork);
      return parsed && parsed.selectedVideo;
    });
    
    const currentPlayableIndex = playableSubmissions.findIndex(s => s._id === selectedSubmission._id);
    if (currentPlayableIndex < playableSubmissions.length - 1) {
      const nextSubmission = playableSubmissions[currentPlayableIndex + 1];
      const globalIndex = submissions.findIndex(s => s._id === nextSubmission._id);
      setCurrentSubmissionIndex(globalIndex);
      setSelectedSubmission(nextSubmission);
      setGradingData({
        grade: nextSubmission.grade !== undefined ? nextSubmission.grade.toString() : '',
        feedback: nextSubmission.feedback || ''
      });
    }
  };

  const getCurrentSubmissionInfo = () => {
    if (!selectedSubmission) return null;
    const playableSubmissions = submissions.filter(s => {
      const parsed = parseStudentWork(s.studentWork);
      return parsed && parsed.selectedVideo;
    });
    const currentIndex = playableSubmissions.findIndex(s => s._id === selectedSubmission._id);
    return {
      current: currentIndex + 1,
      total: playableSubmissions.length,
      hasPrevious: currentIndex > 0,
      hasNext: currentIndex < playableSubmissions.length - 1
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading submissions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/teacher')}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Dashboard
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {assignment?.title || 'Assignment'} - Submissions
                </h1>
                <p className="text-sm text-gray-500">
                  {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Assignment Info */}
        {assignment && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">{assignment.title}</h2>
                <p className="text-gray-600 mb-4">{assignment.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Due: {formatDate(assignment.dueDate)}
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {submissions.filter(s => s.status === 'submitted' || s.status === 'graded').length} submitted
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submissions List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {submissions.map((submission) => (
            <div
              key={submission._id}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {submission.student.firstName} {submission.student.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{submission.student.email}</p>
                    </div>
                  </div>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                    {getStatusIcon(submission.status)}
                    <span className="ml-1 capitalize">{submission.status}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {(() => {
                    const summary = getSubmissionSummary(submission.studentWork);
                    return (
                      <>
                        <div className="flex items-center text-sm text-gray-600">
                          <Play className="w-4 h-4 mr-2" />
                          {summary.videoTitle}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FileText className="w-4 h-4 mr-2" />
                          {summary.loopCount} music loops
                        </div>
                      </>
                    );
                  })()}
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    Submitted: {formatDate(submission.submittedAt || submission.createdAt)}
                  </div>
                  {submission.grade !== undefined && submission.grade !== null && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 mr-2" />
                      Grade: {submission.grade}/100
                    </div>
                  )}
                </div>

                {(() => {
                  const parsed = parseStudentWork(submission.studentWork);
                  const notes = parsed?.submissionNotes || (typeof submission.studentWork === 'string' && !parsed ? submission.studentWork : '');
                  return notes ? (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 line-clamp-3">{notes}</p>
                    </div>
                  ) : null;
                })()}

                {/* Action Buttons */}
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => setSelectedSubmission(submission)}
                    className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Quick Grade
                  </button>
                  {(() => {
                    const parsed = parseStudentWork(submission.studentWork);
                    return parsed && parsed.selectedVideo ? (
                      <button
                        onClick={() => handleViewPlayback(submission)}
                        className="flex-1 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        View Playback
                      </button>
                    ) : null;
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {submissions.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600 mb-2">No submissions yet</p>
            <p className="text-gray-500">Students haven't submitted this assignment yet.</p>
          </div>
        )}
      </div>

      {/* Full-Screen Playback Modal */}
      {showPlaybackView && selectedSubmission && (
        <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
          {/* Navigation Header */}
          <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Back Button */}
              <button
                onClick={() => {
                  setShowPlaybackView(false);
                  setSelectedSubmission(null);
                  setGradingData({ grade: '', feedback: '' });
                }}
                className="flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Submissions
              </button>

              {/* Student Info */}
              <div className="text-white">
                <h2 className="text-lg font-medium">
                  {selectedSubmission.student.name || `${selectedSubmission.student.firstName} ${selectedSubmission.student.lastName}`}'s Submission
                </h2>
                <p className="text-sm text-gray-400">
                  {assignment?.title} • {(() => {
                    const parsed = parseStudentWork(selectedSubmission.studentWork);
                    return parsed?.selectedVideo?.title || 'Unknown Video';
                  })()}
                </p>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center space-x-4">
              {(() => {
                const info = getCurrentSubmissionInfo();
                if (!info) return null;
                
                return (
                  <>
                    {/* Submission Counter */}
                    <div className="text-gray-300 text-sm">
                      {info.current} of {info.total}
                    </div>

                    {/* Previous Button */}
                    <button
                      onClick={navigateToPreviousSubmission}
                      disabled={!info.hasPrevious}
                      className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white transition-colors"
                      title="Previous Submission"
                    >
                      <ArrowLeft size={16} />
                    </button>

                    {/* Next Button */}
                    <button
                      onClick={navigateToNextSubmission}
                      disabled={!info.hasNext}
                      className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white transition-colors"
                      title="Next Submission"
                    >
                      <ArrowLeft size={16} className="rotate-180" />
                    </button>

                    {/* Close Button */}
                    <button
                      onClick={() => {
                        setShowPlaybackView(false);
                        setSelectedSubmission(null);
                        setGradingData({ grade: '', feedback: '' });
                      }}
                      className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                      title="Close Playback"
                    >
                      <X size={16} />
                    </button>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Main Playback Content */}
          <div className="flex-1 flex">
            {/* Embedded StudentSubmissionView */}
            <div className="flex-1">
              <StudentSubmissionView 
                showToast={showToast}
                submissionId={selectedSubmission._id}
                embedded={true}
              />
            </div>

            {/* Grading Sidebar */}
            <div className="w-80 bg-gray-800 text-white p-6 border-l border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Star size={18} className="mr-2" />
                Grade Submission
              </h3>

              <div className="mb-4">
                <p className="text-sm text-gray-300 mb-1">Student</p>
                <p className="font-medium">
                  {selectedSubmission.student.firstName} {selectedSubmission.student.lastName}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-300 mb-1">Submitted</p>
                <p className="text-sm">{formatDate(selectedSubmission.submittedAt || selectedSubmission.createdAt)}</p>
              </div>

              {/* Show existing grade if any */}
              {(selectedSubmission.grade !== undefined && selectedSubmission.grade !== null) && (
                <div className="mb-4 p-3 bg-blue-900/50 rounded-lg">
                  <p className="text-sm text-blue-200 mb-1">Current Grade</p>
                  <p className="text-xl font-semibold text-blue-100">{selectedSubmission.grade}/100</p>
                  {selectedSubmission.feedback && (
                    <p className="text-sm text-blue-200 mt-2">{selectedSubmission.feedback}</p>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Grade (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={gradingData.grade}
                    onChange={(e) => setGradingData({...gradingData, grade: e.target.value})}
                    className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter grade"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Feedback
                  </label>
                  <textarea
                    value={gradingData.feedback}
                    onChange={(e) => setGradingData({...gradingData, feedback: e.target.value})}
                    rows={6}
                    className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Provide feedback to the student..."
                    maxLength={1000}
                  />
                  <div className="text-xs text-gray-400 mt-1">{gradingData.feedback.length}/1000</div>
                </div>
                
                <button
                  onClick={() => handleGradeSubmission(selectedSubmission._id)}
                  disabled={isGrading || !gradingData.grade}
                  className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed px-4 py-3 rounded transition-colors"
                >
                  {isGrading ? 'Saving...' : selectedSubmission.status === 'graded' ? 'Update Grade' : 'Submit Grade'}
                </button>

                {/* Navigation hint */}
                <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-600">
                  Use the navigation buttons above to move between submissions
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Grading Modal (original functionality) */}
      {selectedSubmission && !showPlaybackView && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedSubmission.student.firstName} {selectedSubmission.student.lastName}'s Submission
                  </h3>
                  <p className="text-sm text-gray-500">
                    Submitted: {formatDate(selectedSubmission.submittedAt || selectedSubmission.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>

              {/* Submission Details */}
              <div className="space-y-4 mb-6">
                {(() => {
                  const parsed = parseStudentWork(selectedSubmission.studentWork);
                  
                  if (parsed && parsed.selectedVideo) {
                    // Music composition submission
                    return (
                      <>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Video Selected</h4>
                          <p className="text-gray-700">{parsed.selectedVideo.title}</p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Music Composition</h4>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-2">
                              {parsed.placedLoops?.length || 0} music loops placed
                            </p>
                          </div>
                        </div>

                        {parsed.submissionNotes && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Student Notes</h4>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-gray-700 whitespace-pre-wrap">{parsed.submissionNotes}</p>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  } else {
                    // Text submission
                    return (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Student Work</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-700 whitespace-pre-wrap">{selectedSubmission.studentWork}</p>
                        </div>
                      </div>
                    );
                  }
                })()}

                {/* Show existing grade and feedback if any */}
                {(selectedSubmission.grade !== undefined && selectedSubmission.grade !== null) && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Current Grade</h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-lg font-semibold text-blue-900">{selectedSubmission.grade}/100</p>
                      {selectedSubmission.feedback && (
                        <p className="text-sm text-blue-700 mt-2">{selectedSubmission.feedback}</p>
                      )}
                      {selectedSubmission.gradedAt && (
                        <p className="text-xs text-blue-600 mt-1">
                          Graded: {formatDate(selectedSubmission.gradedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Grading Section */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">
                  {selectedSubmission.status === 'graded' ? 'Update Grade' : 'Grade Submission'}
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grade (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={gradingData.grade}
                      onChange={(e) => setGradingData({...gradingData, grade: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={selectedSubmission.grade !== undefined ? selectedSubmission.grade.toString() : "Enter grade"}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Feedback (Optional)
                    </label>
                    <textarea
                      value={gradingData.feedback}
                      onChange={(e) => setGradingData({...gradingData, feedback: e.target.value})}
                      rows={4}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={selectedSubmission.feedback || "Provide feedback to the student..."}
                      maxLength={1000}
                    />
                    <p className="text-xs text-gray-500 mt-1">{gradingData.feedback.length}/1000 characters</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setSelectedSubmission(null);
                      setGradingData({ grade: '', feedback: '' });
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  {/* View Playback Button */}
                  {(() => {
                    const parsed = parseStudentWork(selectedSubmission.studentWork);
                    return parsed && parsed.selectedVideo ? (
                      <button
                        onClick={() => handleViewPlayback(selectedSubmission)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        View Playback
                      </button>
                    ) : null;
                  })()}
                  
                  <button
                    onClick={() => handleGradeSubmission(selectedSubmission._id)}
                    disabled={isGrading || !gradingData.grade}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isGrading ? 'Saving...' : selectedSubmission.status === 'graded' ? 'Update Grade' : 'Submit Grade'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherSubmissionViewer;