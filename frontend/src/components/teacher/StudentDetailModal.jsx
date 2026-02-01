// Student Detail Modal Component
// src/components/teacher/StudentDetailModal.jsx
// Shows all work from a single student - Google Classroom style

import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Music,
  FileText,
  Gamepad2,
  Play,
  Loader2
} from 'lucide-react';
import { getStudentSubmissions } from '../../firebase/grades';

// Lesson definitions
const LESSONS = [
  { id: 'lesson1', name: 'Lesson 1: Mood & Expression', activities: [
    { id: 'mood-match', name: 'Mood Match Game', type: 'game', icon: Gamepad2 },
    { id: 'adventure-composition', name: 'Adventure Composition', type: 'composition', icon: Music },
    { id: 'reflection', name: 'Reflection', type: 'reflection', icon: FileText }
  ]},
  { id: 'lesson2', name: 'Lesson 2: Instrumentation', activities: [
    { id: 'melody-escape', name: 'Melody Escape Room', type: 'game', icon: Gamepad2 },
    { id: 'sports-composition', name: 'Sports Composition', type: 'composition', icon: Music },
    { id: 'reflection', name: 'Reflection', type: 'reflection', icon: FileText }
  ]},
  { id: 'lesson3', name: 'Lesson 3: Texture & Layering', activities: [
    { id: 'listening-map', name: 'Listening Map', type: 'game', icon: Gamepad2 },
    { id: 'city-composition', name: 'City Composition', type: 'composition', icon: Music },
    { id: 'reflection', name: 'Reflection', type: 'reflection', icon: FileText }
  ]},
  { id: 'lesson4', name: 'Lesson 4: Form & Structure', activities: [
    { id: 'sectional-builder', name: 'Sectional Loop Builder', type: 'game', icon: Gamepad2 },
    { id: 'wildlife-composition', name: 'Wildlife Composition', type: 'composition', icon: Music },
    { id: 'reflection', name: 'Reflection', type: 'reflection', icon: FileText }
  ]},
  { id: 'lesson5', name: 'Lesson 5: Capstone', activities: [
    { id: 'capstone-composition', name: 'Capstone Composition', type: 'composition', icon: Music },
    { id: 'peer-critique', name: 'Peer Critique', type: 'reflection', icon: FileText },
    { id: 'self-assessment', name: 'Self Assessment', type: 'reflection', icon: FileText }
  ]}
];

const StudentDetailModal = ({
  isOpen,
  onClose,
  student,
  classId,
  onViewWork,
  onGrade
}) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, submitted, graded, missing
  const [expandedLessons, setExpandedLessons] = useState(['lesson1', 'lesson2']);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!student?.studentUid || !classId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getStudentSubmissions(classId, student.studentUid);
        setSubmissions(data || []);
      } catch (err) {
        console.error('Error fetching student submissions:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchSubmissions();
    }
  }, [isOpen, student?.studentUid, classId]);

  if (!isOpen) return null;

  const toggleLesson = (lessonId) => {
    setExpandedLessons(prev =>
      prev.includes(lessonId)
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  // Get submission for a specific activity
  const getSubmission = (lessonId, activityId) => {
    return submissions.find(s =>
      s.lessonId === lessonId && s.activityId === activityId
    );
  };

  // Get status badge
  const getStatusBadge = (submission) => {
    if (!submission) {
      return (
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <AlertCircle size={12} />
          Not started
        </span>
      );
    }

    if (submission.status === 'graded') {
      return (
        <span className="flex items-center gap-1 text-xs text-green-600">
          <CheckCircle2 size={12} />
          Graded: {submission.grade?.points !== undefined
            ? `${submission.grade.points}/${submission.grade.maxPoints}`
            : submission.grade?.grade || 'Complete'}
        </span>
      );
    }

    if (submission.status === 'submitted') {
      return (
        <span className="flex items-center gap-1 text-xs text-amber-600">
          <Clock size={12} />
          Submitted
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1 text-xs text-blue-600">
        <Clock size={12} />
        In progress
      </span>
    );
  };

  // Calculate overall stats
  const totalActivities = LESSONS.reduce((sum, l) => sum + l.activities.length, 0);
  const submitted = submissions.filter(s => s.status === 'submitted' || s.status === 'graded').length;
  const graded = submissions.filter(s => s.status === 'graded').length;
  const pending = submissions.filter(s => s.status === 'submitted').length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl font-semibold text-blue-600">
              {(student?.displayName || student?.name || 'S').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {student?.displayName || student?.name || `Student ${student?.seatNumber}`}
              </h2>
              <p className="text-sm text-gray-500">
                Seat #{student?.seatNumber} • {submitted}/{totalActivities} activities complete
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-6 text-sm">
          <button
            onClick={() => setFilter('all')}
            className={`font-medium ${filter === 'all' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('submitted')}
            className={`flex items-center gap-1 font-medium ${filter === 'submitted' ? 'text-amber-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Clock size={14} />
            Pending ({pending})
          </button>
          <button
            onClick={() => setFilter('graded')}
            className={`flex items-center gap-1 font-medium ${filter === 'graded' ? 'text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <CheckCircle2 size={14} />
            Graded ({graded})
          </button>
          <button
            onClick={() => setFilter('missing')}
            className={`flex items-center gap-1 font-medium ${filter === 'missing' ? 'text-red-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <AlertCircle size={14} />
            Missing
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {LESSONS.map((lesson) => {
                const isExpanded = expandedLessons.includes(lesson.id);
                const lessonSubmissions = submissions.filter(s => s.lessonId === lesson.id);
                const lessonGraded = lessonSubmissions.filter(s => s.status === 'graded').length;
                const lessonPending = lessonSubmissions.filter(s => s.status === 'submitted').length;

                return (
                  <div key={lesson.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Lesson Header */}
                    <button
                      onClick={() => toggleLesson(lesson.id)}
                      className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <ChevronRight
                          size={18}
                          className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        />
                        <span className="font-medium text-gray-900">{lesson.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {lessonPending > 0 && (
                          <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            {lessonPending} pending
                          </span>
                        )}
                        {lessonGraded > 0 && (
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            {lessonGraded} graded
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Activities */}
                    {isExpanded && (
                      <div className="divide-y divide-gray-100">
                        {lesson.activities.map((activity) => {
                          const submission = getSubmission(lesson.id, activity.id);
                          const Icon = activity.icon;

                          // Apply filter
                          if (filter === 'submitted' && submission?.status !== 'submitted') return null;
                          if (filter === 'graded' && submission?.status !== 'graded') return null;
                          if (filter === 'missing' && submission) return null;

                          return (
                            <div
                              key={activity.id}
                              className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  activity.type === 'game' ? 'bg-purple-100' :
                                  activity.type === 'composition' ? 'bg-blue-100' : 'bg-gray-100'
                                }`}>
                                  <Icon size={16} className={
                                    activity.type === 'game' ? 'text-purple-600' :
                                    activity.type === 'composition' ? 'text-blue-600' : 'text-gray-600'
                                  } />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 text-sm">
                                    {activity.name}
                                  </div>
                                  <div className="text-xs text-gray-500 capitalize">
                                    {activity.type}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                {getStatusBadge(submission)}

                                {submission && activity.type === 'composition' && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => onViewWork?.(student, lesson, activity, submission)}
                                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                      title="View Work"
                                    >
                                      <Play size={16} />
                                    </button>
                                    <button
                                      onClick={() => onGrade?.(student, lesson, activity, submission)}
                                      className="px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    >
                                      {submission.status === 'graded' ? 'Edit Grade' : 'Grade'}
                                    </button>
                                  </div>
                                )}

                                {submission && activity.type === 'game' && submission.autoScore && (
                                  <span className="text-sm font-medium text-gray-700">
                                    {submission.autoScore.points}/{submission.autoScore.maxPoints}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;
