// ShowcaseMode — full-screen presentation of student compositions
// src/components/teacher/ShowcaseMode.jsx
// No grades, no rubric — just student work for class showcase

import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Monitor,
  Layers
} from 'lucide-react';
import { getStudentWorkForTeacher } from '../../firebase/studentWork';

const LazyCompositionPreview = lazy(() => import('./CompositionPreview'));

const ShowcaseMode = ({
  isOpen,
  onClose,
  classId,
  lessonId,
  activityId,
  activityName,
  roster,
  submissions
}) => {
  const [studentEntries, setStudentEntries] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [workCache, setWorkCache] = useState({});
  const [loadingWork, setLoadingWork] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [videoOnly, setVideoOnly] = useState(false);

  // Build list of students who have submitted compositions with placedLoops
  useEffect(() => {
    if (!isOpen) return;

    const loadAllWork = async () => {
      setLoadingList(true);
      setSelectedIndex(0);
      setWorkCache({});
      setVideoOnly(false);

      // Find submissions for this activity
      const activitySubmissions = submissions.filter(
        s => s.lessonId === lessonId && s.activityId === activityId && s.workKey
      );

      // Fetch work for each submission
      const entries = [];
      const cache = {};

      await Promise.all(activitySubmissions.map(async (sub) => {
        try {
          const work = await getStudentWorkForTeacher(sub.studentUid, sub.workKey);
          if (work?.data?.placedLoops && work.data.placedLoops.length > 0) {
            const rosterEntry = roster.find(
              r => (r.studentUid || `seat-${classId}-${r.seatNumber}`) === sub.studentUid
            );
            entries.push({
              uid: sub.studentUid,
              displayName: rosterEntry?.displayName || `Seat ${rosterEntry?.seatNumber || '?'}`,
              seatNumber: rosterEntry?.seatNumber || 999,
              submission: sub,
              work
            });
            cache[sub.studentUid] = work;
          }
        } catch (err) {
          console.warn('Failed to load work for showcase:', sub.studentUid, err);
        }
      }));

      // Sort by name
      entries.sort((a, b) => a.displayName.localeCompare(b.displayName));

      setStudentEntries(entries);
      setWorkCache(cache);
      setLoadingList(false);
    };

    loadAllWork();
  }, [isOpen, classId, lessonId, activityId, roster, submissions]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex(prev => Math.min(studentEntries.length - 1, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose, studentEntries.length]);

  if (!isOpen) return null;

  const current = studentEntries[selectedIndex];
  const currentWork = current ? workCache[current.uid] : null;
  const compositionTitle = currentWork?.data?.compositionTitle || currentWork?.title || '';

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Top bar */}
      <div className="h-12 bg-gray-900 border-b border-gray-700 flex items-center px-4 gap-3 flex-shrink-0">
        {/* Student name + composition title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {current && (
            <>
              <span className="text-white font-semibold text-sm truncate">
                {current.displayName}
              </span>
              {compositionTitle && (
                <>
                  <span className="text-gray-600">|</span>
                  <span className="text-gray-400 text-sm truncate">{compositionTitle}</span>
                </>
              )}
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedIndex(prev => Math.max(0, prev - 1))}
            disabled={selectedIndex === 0 || studentEntries.length === 0}
            className="p-1.5 rounded hover:bg-gray-700 text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <span className="text-gray-400 text-sm tabular-nums min-w-[60px] text-center">
            {studentEntries.length > 0
              ? `${selectedIndex + 1} of ${studentEntries.length}`
              : '0 of 0'
            }
          </span>

          <button
            onClick={() => setSelectedIndex(prev => Math.min(studentEntries.length - 1, prev + 1))}
            disabled={selectedIndex >= studentEntries.length - 1 || studentEntries.length === 0}
            className="p-1.5 rounded hover:bg-gray-700 text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Video Only toggle */}
        <button
          onClick={() => setVideoOnly(prev => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            videoOnly
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
          }`}
          title={videoOnly ? 'Show track lanes' : 'Hide track lanes'}
        >
          {videoOnly ? <Monitor size={14} /> : <Layers size={14} />}
          {videoOnly ? 'Video Only' : 'Full View'}
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors ml-1"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {loadingList ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-10 h-10 text-gray-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Loading student compositions...</p>
            </div>
          </div>
        ) : studentEntries.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 text-lg font-medium">No Compositions</p>
              <p className="text-gray-500 text-sm mt-1">No students have submitted compositions for this activity yet.</p>
            </div>
          </div>
        ) : currentWork ? (
          <Suspense fallback={
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-gray-500 animate-spin" />
            </div>
          }>
            <LazyCompositionPreview
              key={current.uid}
              workData={currentWork}
              submittedAt={current.submission?.submittedAt}
              videoOnly={videoOnly}
            />
          </Suspense>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-gray-500 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowcaseMode;
