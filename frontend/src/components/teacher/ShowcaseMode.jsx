// ShowcaseMode — full-screen presentation of student work
// src/components/teacher/ShowcaseMode.jsx
// Supports compositions (placedLoops), listening maps (imageData), and listening journeys (sections)

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
const LazyLJPreview = lazy(() => import('./ListeningJourneyPreview'));

// Check if work data has any displayable content
const hasDisplayableWork = (work) => {
  if (!work?.data) return false;
  // DAW compositions
  if (work.data.placedLoops?.length > 0) return true;
  // Listening maps (canvas image)
  if (work.data.imageData) return true;
  // Listening journeys (sections)
  if (work.data.sections) return true;
  return false;
};

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

  // Shared fetch function — used for initial load and auto-refresh
  const loadAllWork = useCallback(async (isRefresh = false) => {
    if (!isRefresh) {
      setLoadingList(true);
      setSelectedIndex(0);
      setVideoOnly(false);
    }
    if (!isRefresh) setWorkCache({});

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
        if (hasDisplayableWork(work)) {
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
    if (!isRefresh) setLoadingList(false);
  }, [classId, lessonId, activityId, roster, submissions]);

  // Build list of students who have submitted work
  useEffect(() => {
    if (!isOpen) return;
    loadAllWork(false);
  }, [isOpen, loadAllWork]);

  // Auto-refresh work data every 10 seconds while showcase is open
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => loadAllWork(true), 10000);
    return () => clearInterval(interval);
  }, [isOpen, loadAllWork]);

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
  const compositionTitle = currentWork?.data?.compositionTitle || currentWork?.data?.songTitle || currentWork?.title || '';

  // Determine work type for rendering
  const isListeningMap = currentWork?.data?.imageData && !currentWork?.data?.placedLoops;
  const isComposition = currentWork?.data?.placedLoops?.length > 0;
  const isListeningJourney = currentWork?.data?.sections?.length > 0;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Top bar */}
      <div className="h-12 bg-gray-900 border-b border-gray-700 flex items-center px-4 gap-3 flex-shrink-0">
        {/* Student name + title */}
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

        {/* Video Only toggle — only for compositions */}
        {isComposition && (
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
        )}

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
              <p className="text-gray-400 text-sm">Loading student work...</p>
            </div>
          </div>
        ) : studentEntries.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 text-lg font-medium">No Submissions</p>
              <p className="text-gray-500 text-sm mt-1">No students have submitted work for this activity yet.</p>
            </div>
          </div>
        ) : isListeningMap && currentWork ? (
          /* Listening Map — show as full-screen image matching Chromebook canvas layout */
          <div className="flex-1 flex items-center justify-center p-6 bg-gray-950" style={{ minHeight: 0 }}>
            <img
              src={currentWork.data.imageData}
              alt={`${current.displayName}'s listening map`}
              className="rounded-lg shadow-2xl"
              style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#ffffff' }}
            />
          </div>
        ) : isComposition && currentWork ? (
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
        ) : isListeningJourney && currentWork ? (
          <Suspense fallback={
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-gray-500 animate-spin" />
            </div>
          }>
            <LazyLJPreview
              key={current.uid}
              workData={currentWork}
              submittedAt={current.submission?.submittedAt}
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
