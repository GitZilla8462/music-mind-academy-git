// LaunchDayTeacher.jsx — Teacher presentation controller for Music Journalist Lesson 5
// Phases: roster → presenting (with feedback gate) → voting → results
// Teacher clicks student names, controls slides, opens/closes feedback, manages awards

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Users, MessageSquare, Vote, Trophy, Clock, Play, Pause, User, Check, Star, X, Award } from 'lucide-react';
import { getDatabase, ref, update, onValue, get, set, remove } from 'firebase/database';
import { getStudentWorkForTeacher } from '../../../../firebase/studentWork';
import SlideRenderer from '../press-kit-designer/layouts/SlideRenderer';
import { renderSlideObject, CANVAS_W, CANVAS_H } from '../press-kit-designer/components/SlideCanvas';
import { getPalette } from '../press-kit-designer/palettes';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const AWARDS = [
  { id: 'gone-viral', label: 'Gone Viral', emoji: '🚀', description: 'Most votes' },
  { id: 'best-hook', label: 'Best Hook', emoji: '🎣', description: 'Most compelling opening' },
  { id: 'best-sound', label: 'Best Sound Statement', emoji: '🎧', description: 'Most vivid music description' },
  { id: 'strongest-case', label: 'Strongest Case', emoji: '📊', description: 'Best evidence and research' },
  { id: 'best-design', label: 'Best Campaign', emoji: '🎨', description: 'Most professional press kit' },
  { id: 'crowd-favorite', label: 'Crowd Favorite', emoji: '👏', description: 'Biggest audience reaction' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const LaunchDayTeacher = ({ sessionCode, classId }) => {
  // Phase: 'roster' | 'presenting' | 'feedback' | 'voting' | 'results'
  const [phase, setPhase] = useState('roster');
  const [presenterIndex, setPresenterIndex] = useState(-1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [pressKitData, setPressKitData] = useState(null);
  const [loadingKit, setLoadingKit] = useState(false);
  const [presented, setPresented] = useState(new Set());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // Voting state
  const [votes, setVotes] = useState({});
  const [manualAwards, setManualAwards] = useState({});
  const [showAwardPicker, setShowAwardPicker] = useState(null);

  // Build presenter list from Firebase class roster
  const [presenterList, setPresenterList] = useState([]);
  const [artistNames, setArtistNames] = useState({}); // uid -> artistName

  // Load roster from Firebase on mount — use realtime listener so late joiners appear
  useEffect(() => {
    if (!classId) {
      console.log('🎤 LaunchDayTeacher: no classId, skipping roster load');
      return;
    }
    const db = getDatabase();

    // Listen to students joined in the current session (realtime so late joiners appear)
    const studentsRef = ref(db, `classes/${classId}/currentSession/studentsJoined`);
    const unsub = onValue(studentsRef, (snap) => {
      if (!snap.exists()) {
        console.log('🎤 LaunchDayTeacher: no students joined yet');
        return;
      }
      const data = snap.val();
      console.log('🎤 LaunchDayTeacher: loaded roster', Object.keys(data).length, 'students');
      const list = Object.entries(data).map(([seatId, student]) => ({
        uid: seatId,
        name: student.name || student.displayName || seatId,
        seatNumber: student.seatNumber,
      }));
      setPresenterList(list);

      // Try to load artist names from each student's press kit data
      list.forEach(async (student) => {
        try {
          const keys = ['unknown-mj-press-kit', 'mj-lesson4-mj-press-kit', 'mj-lesson4-mj-slide-builder'];
          for (const key of keys) {
            const d = await getStudentWorkForTeacher(student.uid, key);
            if (d?.data?.slides?.[0]) {
              const slide1 = d.data.slides[0];
              const artistName = slide1.fields?.artistName || slide1.fields?.hookLine || '';
              if (artistName) {
                setArtistNames(prev => ({ ...prev, [student.uid]: artistName }));
              }
              break;
            }
          }
        } catch { /* skip */ }
      });
    });

    return () => unsub();
  }, [classId]);

  // Timer
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Broadcast presentation state to students via Firebase
  const broadcastState = useCallback((stateUpdate) => {
    if (!sessionCode) return;
    const db = getDatabase();
    update(ref(db, `sessions/${sessionCode}/presentationState`), {
      ...stateUpdate,
      updatedAt: Date.now(),
    });
  }, [sessionCode]);

  // Load a student's press kit from Firebase
  const loadPressKit = useCallback(async (studentUid) => {
    setLoadingKit(true);
    setPressKitData(null);
    setCurrentSlide(0);

    try {
      const keys = ['unknown-mj-press-kit', 'mj-lesson4-mj-press-kit', 'mj-lesson4-mj-slide-builder'];
      for (const key of keys) {
        const data = await getStudentWorkForTeacher(studentUid, key);
        if (data?.data?.slides?.length > 0) {
          setPressKitData(data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Failed to load press kit:', err);
    } finally {
      setLoadingKit(false);
    }
  }, []);

  // Select a presenter and start their presentation
  const startPresenter = useCallback((index) => {
    const student = presenterList[index];
    if (!student) return;

    setPresenterIndex(index);
    setPhase('presenting');
    setElapsedSeconds(0);
    setTimerRunning(true);
    loadPressKit(student.uid);

    broadcastState({
      phase: 'presenting',
      presenterUid: student.uid,
      presenterName: student.name,
      artistName: artistNames[student.uid] || '',
      feedbackOpen: false,
    });
  }, [presenterList, artistNames, loadPressKit, broadcastState]);

  // Open feedback for current presenter
  const openFeedback = useCallback(() => {
    setPhase('feedback');
    setTimerRunning(false);
    const student = presenterList[presenterIndex];
    broadcastState({
      phase: 'feedback',
      presenterUid: student?.uid,
      presenterName: student?.name,
      artistName: artistNames[student?.uid] || '',
      feedbackOpen: true,
    });
  }, [presenterIndex, presenterList, artistNames, broadcastState]);

  // Close feedback and mark presenter as done
  const closeFeedback = useCallback(() => {
    const student = presenterList[presenterIndex];
    setPresented(prev => new Set([...prev, student?.uid]));
    setPhase('roster');
    setTimerRunning(false);
    broadcastState({
      phase: 'roster',
      feedbackOpen: false,
      presenterUid: null,
    });
  }, [presenterIndex, presenterList, broadcastState]);

  // Start voting phase
  const startVoting = useCallback(() => {
    setPhase('voting');

    // Build artist list for students
    const artists = presenterList
      .filter(s => presented.has(s.uid))
      .map(s => ({
        uid: s.uid,
        name: s.name,
        artistName: artistNames[s.uid] || 'Unknown Artist',
      }));

    broadcastState({
      phase: 'voting',
      feedbackOpen: false,
      presenterUid: null,
      artists: artists,
    });
  }, [presenterList, presented, artistNames, broadcastState]);

  // Listen for votes from Firebase
  useEffect(() => {
    if (!sessionCode || phase !== 'voting') return;
    const db = getDatabase();
    const votesRef = ref(db, `sessions/${sessionCode}/artistVotes`);
    const unsub = onValue(votesRef, (snap) => {
      setVotes(snap.val() || {});
    });
    return () => unsub();
  }, [sessionCode, phase]);

  // Show results
  const showResults = useCallback(() => {
    setPhase('results');
    broadcastState({ phase: 'results', feedbackOpen: false });
  }, [broadcastState]);

  // Calculate vote tallies
  const voteTallies = {};
  Object.values(votes).forEach(v => {
    if (v.artistName) {
      voteTallies[v.artistName] = (voteTallies[v.artistName] || 0) + 1;
    }
  });
  const sortedArtists = Object.entries(voteTallies).sort((a, b) => b[1] - a[1]);
  const winner = sortedArtists[0];

  // Assign manual award
  const assignAward = (awardId, presenterUid) => {
    setManualAwards(prev => ({ ...prev, [awardId]: presenterUid }));
    setShowAwardPicker(null);
  };

  // Current presenter info
  const currentPresenter = presenterList[presenterIndex];
  const slides = pressKitData?.slides || [];
  const slide = slides[currentSlide];
  const slideGenre = pressKitData?.slides?.[0]?.fields?.genre?.split(' / ')?.[0] || '';

  // ─── Render: Roster Phase ──────────────────────────────────────
  if (phase === 'roster') {
    return (
      <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-[#1a2744] via-[#0f1a2e] to-[#1a2744]">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Agent Pitch</h1>
            <p className="text-white/50 text-sm">{presented.size} of {presenterList.length} presented</p>
          </div>
          {presented.size > 0 && (
            <button
              onClick={startVoting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#f0b429] text-[#1a2744] rounded-xl font-bold text-sm hover:bg-[#f0b429]/90 transition-all"
            >
              <Vote size={16} />
              Start Voting ({presented.size} presenters)
            </button>
          )}
        </div>

        {/* Roster Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {presenterList.map((student, idx) => {
              const hasDone = presented.has(student.uid);
              const artistName = artistNames[student.uid];
              return (
                <button
                  key={student.uid}
                  onClick={() => startPresenter(idx)}
                  disabled={hasDone}
                  className={`relative p-4 rounded-xl border text-left transition-all ${
                    hasDone
                      ? 'bg-green-900/20 border-green-500/30 opacity-60'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#f0b429]/50 active:scale-[0.98]'
                  }`}
                >
                  {hasDone && (
                    <div className="absolute top-2 right-2">
                      <Check size={16} className="text-green-400" />
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      <User size={18} className="text-white/50" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-semibold text-sm truncate">{student.name}</div>
                      {artistName && (
                        <div className="text-[#f0b429] text-xs truncate">{artistName}</div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Presenting / Feedback Phase ─────────────────────────
  if (phase === 'presenting' || phase === 'feedback') {
    return (
      <div className="absolute inset-0 flex flex-col bg-[#0d1520]">
        {/* Top bar */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-[#111c33] border-b border-white/10">
          {/* Back to roster */}
          <button
            onClick={closeFeedback}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm"
          >
            <ChevronLeft size={16} />
            Roster
          </button>

          {/* Presenter info */}
          <div className="text-center">
            <div className="text-white font-bold text-sm">{currentPresenter?.name}</div>
            <div className="text-[#f0b429] text-xs">{artistNames[currentPresenter?.uid] || ''}</div>
          </div>

          {/* Timer + slide counter */}
          <div className="flex items-center gap-4">
            <span className="text-white/50 text-sm">
              {slides.length > 0 ? `Slide ${currentSlide + 1}/${slides.length}` : ''}
            </span>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className={elapsedSeconds > 180 ? 'text-red-400' : 'text-white/50'} />
              <span className={`text-sm font-mono ${elapsedSeconds > 180 ? 'text-red-400' : 'text-white/50'}`}>
                {formatTime(elapsedSeconds)}
              </span>
            </div>
          </div>
        </div>

        {/* Slide area */}
        <div className="flex-1 flex items-center justify-center px-8 py-4 overflow-hidden relative">
          {loadingKit ? (
            <div className="text-white/40">Loading press kit...</div>
          ) : !slide ? (
            <div className="text-center">
              <div className="text-6xl mb-4">🎤</div>
              <p className="text-white/50 text-lg">No press kit found for this student</p>
              <p className="text-white/30 text-sm mt-1">They may not have completed Lesson 4</p>
            </div>
          ) : slide.objects?.length > 0 ? (
            <div className="w-full max-w-4xl relative overflow-hidden rounded-lg" style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}`, background: getPalette(slide.palette || 'genre', slideGenre).bg }}>
              <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 30% 50%, ${getPalette(slide.palette || 'genre', slideGenre).accent}11 0%, transparent 70%)` }} />
              {slide.objects.map(obj => {
                const containerEl = document.querySelector('.max-w-4xl');
                const presentScale = containerEl ? containerEl.offsetWidth / CANVAS_W : 1;
                return (
                  <div
                    key={obj.id}
                    style={{
                      position: 'absolute',
                      left: obj.x * presentScale,
                      top: obj.y * presentScale,
                      transform: obj.rotation ? `rotate(${obj.rotation}deg)` : undefined,
                    }}
                  >
                    {renderSlideObject(obj, presentScale)}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="w-full max-w-4xl relative overflow-hidden rounded-lg" style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}>
              <SlideRenderer
                slideNumber={currentSlide + 1}
                layout={slide.layout}
                paletteId={slide.palette}
                genre={slideGenre}
                fields={slide.fields || {}}
                image={slide.image}
              />
            </div>
          )}

          {/* Nav arrows */}
          {slides.length > 0 && (
            <>
              <button
                onClick={() => setCurrentSlide(c => Math.max(0, c - 1))}
                disabled={currentSlide === 0}
                className={`absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all ${
                  currentSlide === 0 ? 'text-white/10' : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={() => setCurrentSlide(c => Math.min(slides.length - 1, c + 1))}
                disabled={currentSlide === slides.length - 1}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all ${
                  currentSlide === slides.length - 1 ? 'text-white/10' : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}
        </div>

        {/* Bottom bar — feedback controls */}
        <div className="flex-shrink-0 px-4 py-3 bg-[#111c33] border-t border-white/10 flex items-center justify-between">
          {phase === 'presenting' ? (
            <>
              <div className="text-white/40 text-sm">
                Student is presenting — Chromebooks closed
              </div>
              <button
                onClick={openFeedback}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all"
              >
                <MessageSquare size={16} />
                Open Feedback (60 sec)
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-blue-400 text-sm">
                <MessageSquare size={16} className="animate-pulse" />
                Students are submitting feedback...
              </div>
              <button
                onClick={closeFeedback}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#f0b429] text-[#1a2744] rounded-xl font-bold text-sm hover:bg-[#f0b429]/90 transition-all"
              >
                <ChevronRight size={16} />
                Close Feedback & Next
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── Render: Voting Phase ────────────────────────────────────────
  if (phase === 'voting') {
    const totalVotes = Object.keys(votes).length;
    return (
      <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-[#1a2744] via-[#0f1a2e] to-[#1a2744]">
        <div className="flex-shrink-0 px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">🗳️ Voting Open</h1>
            <p className="text-white/50 text-sm">Which artist deserves to go viral?</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/50 text-sm">{totalVotes} vote{totalVotes !== 1 ? 's' : ''} received</span>
            <button
              onClick={showResults}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#f0b429] text-[#1a2744] rounded-xl font-bold text-sm hover:bg-[#f0b429]/90 transition-all"
            >
              <Trophy size={16} />
              Reveal Results
            </button>
          </div>
        </div>

        {/* Live vote tally */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto space-y-3">
            {sortedArtists.length === 0 ? (
              <div className="text-center py-12">
                <Vote size={48} className="text-white/20 mx-auto mb-4" />
                <p className="text-white/40 text-lg">Waiting for votes...</p>
                <p className="text-white/25 text-sm mt-1">Students are voting on their Chromebooks</p>
              </div>
            ) : (
              sortedArtists.map(([artistName, count], idx) => {
                const maxVotes = sortedArtists[0]?.[1] || 1;
                const pct = (count / maxVotes) * 100;
                return (
                  <div key={artistName} className="relative bg-white/5 border border-white/10 rounded-xl p-4 overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-[#f0b429]/10 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {idx === 0 && <span className="text-2xl">🚀</span>}
                        <span className="text-white font-bold text-lg">{artistName}</span>
                      </div>
                      <span className="text-[#f0b429] font-bold text-xl">{count} vote{count !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Results Phase ───────────────────────────────────────
  if (phase === 'results') {
    return (
      <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-[#1a2744] via-[#0f1a2e] to-[#1a2744] overflow-auto">
        <div className="flex-shrink-0 px-6 py-4 border-b border-white/10">
          <h1 className="text-3xl font-black text-white text-center">🏆 The Results Are In</h1>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Gone Viral — auto from votes */}
            {winner && (
              <div className="bg-gradient-to-r from-[#f0b429]/20 to-[#f0b429]/5 border-2 border-[#f0b429]/50 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-2">🚀</div>
                <h2 className="text-2xl font-black text-[#f0b429] mb-1">GONE VIRAL</h2>
                <p className="text-white text-3xl font-bold mb-1">{winner[0]}</p>
                <p className="text-white/50 text-sm">{winner[1]} vote{winner[1] !== 1 ? 's' : ''}</p>
              </div>
            )}

            {/* Manual awards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AWARDS.filter(a => a.id !== 'gone-viral').map(award => {
                const assignedUid = manualAwards[award.id];
                const assignedStudent = presenterList.find(s => s.uid === assignedUid);
                return (
                  <div
                    key={award.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-all"
                    onClick={() => setShowAwardPicker(award.id)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{award.emoji}</span>
                      <div>
                        <div className="text-white font-bold text-sm">{award.label}</div>
                        <div className="text-white/40 text-xs">{award.description}</div>
                      </div>
                    </div>
                    {assignedStudent ? (
                      <div className="bg-[#f0b429]/10 border border-[#f0b429]/30 rounded-lg px-3 py-2 text-[#f0b429] font-semibold text-sm">
                        {assignedStudent.name} — {artistNames[assignedStudent.uid] || ''}
                      </div>
                    ) : (
                      <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/30 text-sm">
                        Tap to assign
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Award picker modal */}
        {showAwardPicker && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-[#1a2744] rounded-2xl border border-white/20 max-w-sm w-full max-h-[80vh] overflow-auto">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-white font-bold text-sm">
                  {AWARDS.find(a => a.id === showAwardPicker)?.label}
                </h3>
                <button onClick={() => setShowAwardPicker(null)} className="text-white/40 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <div className="p-2">
                {presenterList.filter(s => presented.has(s.uid)).map(student => (
                  <button
                    key={student.uid}
                    onClick={() => assignAward(showAwardPicker, student.uid)}
                    className="w-full px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-colors flex items-center gap-3"
                  >
                    <User size={16} className="text-white/40" />
                    <div>
                      <div className="text-white text-sm font-medium">{student.name}</div>
                      <div className="text-[#f0b429] text-xs">{artistNames[student.uid] || ''}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default LaunchDayTeacher;
