// LaunchDayTeacher.jsx — Teacher presentation controller for Music Journalist Lesson 5
// Phases: roster → presenting (with feedback gate) → voting → results
// Teacher clicks student names, controls slides, opens/closes feedback, manages awards

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Users, MessageSquare, Vote, Trophy, Clock, Play, Pause, User, Check, Star, X, Award, HelpCircle } from 'lucide-react';
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
// Directions Modal
// ---------------------------------------------------------------------------
const DIRECTIONS_STEPS = [
  { emoji: '1️⃣', text: 'Ask for volunteers who want to present to the whole class' },
  { emoji: '2️⃣', text: 'Click a volunteer\'s name — their press kit slides appear on screen' },
  { emoji: '3️⃣', text: 'They present live (2-3 min) while the class watches' },
  { emoji: '4️⃣', text: 'After each pitch, give verbal feedback or ask the class for shout-outs (optional)' },
  { emoji: '5️⃣', text: 'Click "Next" to pick the next volunteer' },
  { emoji: '6️⃣', text: 'When volunteers are done, advance to Speed Pitching — everyone presents to a partner' },
];

const AgentPitchDirections = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#1a2744] to-[#2a3f6e] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">Agent Pitch</h2>
            <p className="text-blue-200 text-sm">Whole Class Pitches</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl font-bold leading-none">{'\u2715'}</button>
        </div>
        <div className="px-6 py-5 space-y-3">
          {DIRECTIONS_STEPS.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0 w-8 text-center">{step.emoji}</span>
              <p className="text-base text-gray-700">{step.text}</p>
            </div>
          ))}
        </div>
        <div className="px-6 pb-5">
          <button onClick={onClose} className="w-full py-3 bg-gradient-to-r from-[#1a2744] to-[#2a3f6e] text-white text-lg font-bold rounded-xl hover:opacity-90 transition-all">
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Student sidebar — persistent list on the left during all phases
// ---------------------------------------------------------------------------
const StudentSidebar = ({ presenterList, artistNames, presented, presenterIndex, phase, onSelectPresenter }) => {
  const currentPresenter = presenterList[presenterIndex];
  return (
    <div className="w-52 flex-shrink-0 h-full flex flex-col bg-[#0d1520] border-r border-white/10">
      {/* Sidebar header */}
      <div className="px-3 py-2.5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-white/40" />
          <span className="text-white/60 text-xs font-semibold">{presented.size}/{presenterList.length}</span>
        </div>
        <span className="text-[10px] text-white/30 uppercase tracking-wider">Roster</span>
      </div>

      {/* Student list */}
      <div className="flex-1 overflow-y-auto py-1">
        {presenterList.map((student, idx) => {
          const hasDone = presented.has(student.uid);
          const isActive = currentPresenter?.uid === student.uid && (phase === 'presenting' || phase === 'feedback');
          const artistName = artistNames[student.uid];
          return (
            <button
              key={student.uid}
              onClick={() => onSelectPresenter(idx)}
              disabled={hasDone || isActive}
              className={`w-full px-3 py-2 text-left flex items-center gap-2 transition-all ${
                isActive ? 'bg-[#f0b429]/20 border-l-2 border-[#f0b429]' :
                hasDone ? 'opacity-40' :
                'hover:bg-white/5'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                isActive ? 'bg-[#f0b429] text-[#1a2744]' :
                hasDone ? 'bg-green-500/30 text-green-300' :
                'bg-white/10 text-white/40'
              }`}>
                {hasDone ? <Check size={10} /> : idx + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-semibold truncate ${isActive ? 'text-[#f0b429]' : hasDone ? 'text-white/40' : 'text-white/80'}`}>
                  {student.name}
                </p>
                {artistName && (
                  <p className={`text-[10px] truncate ${isActive ? 'text-[#f0b429]/60' : 'text-white/30'}`}>{artistName}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const LaunchDayTeacher = ({ sessionCode, classId }) => {
  // Phase: 'roster' | 'presenting'
  const [phase, setPhase] = useState('roster');
  const [showDirections, setShowDirections] = useState(true);
  const [presenterIndex, setPresenterIndex] = useState(-1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [pressKitData, setPressKitData] = useState(null);
  const [loadingKit, setLoadingKit] = useState(false);
  const [presented, setPresented] = useState(new Set());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // Build presenter list from Firebase class roster
  const [presenterList, setPresenterList] = useState([]);
  const [artistNames, setArtistNames] = useState({}); // uid -> artistName

  // Load full class roster from Firebase (all students, not just who's online)
  useEffect(() => {
    if (!classId) {
      console.log('🎤 LaunchDayTeacher: no classId, skipping roster load');
      return;
    }
    const db = getDatabase();

    const loadRoster = async () => {
      // Load the permanent class roster (all enrolled students)
      const rosterRef = ref(db, `classRosters/${classId}`);
      const rosterSnap = await get(rosterRef);

      if (!rosterSnap.exists()) {
        console.log('🎤 LaunchDayTeacher: no students in class roster');
        return;
      }

      const seats = [];
      rosterSnap.forEach((child) => {
        const seat = child.val();
        if (seat.status === 'active') seats.push(seat);
      });
      seats.sort((a, b) => a.seatNumber - b.seatNumber);

      console.log('🎤 LaunchDayTeacher: loaded class roster', seats.length, 'students');

      const list = seats.map(seat => ({
        uid: `seat-${classId}-${seat.seatNumber}`,
        name: seat.displayName || `Seat ${seat.seatNumber}`,
        seatNumber: seat.seatNumber,
      }));
      setPresenterList(list);

      // Load artist names from each student's press kit data
      list.forEach(async (student) => {
        try {
          const key = 'mj-lesson4-mj-press-kit';
          const d = await getStudentWorkForTeacher(student.uid, key);
          if (d?.data?.slides?.[0]) {
            const slide1 = d.data.slides[0];
            // Try multiple fields where artist name might be stored
            const artistObj = slide1.objects?.find(o => o.type === 'text' && o.role === 'artistName');
            const artistName = artistObj?.text || slide1.fields?.artistName || slide1.fields?.hookLine || '';
            if (artistName) {
              setArtistNames(prev => ({ ...prev, [student.uid]: artistName }));
            }
          }
        } catch { /* skip */ }
      });
    };

    loadRoster();
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
      const data = await getStudentWorkForTeacher(studentUid, 'mj-lesson4-mj-press-kit');
      if (data?.data?.slides?.length > 0) {
        setPressKitData(data.data);
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

  // Mark presenter as done and go back to roster
  const finishPresenter = useCallback(() => {
    const student = presenterList[presenterIndex];
    setPresented(prev => new Set([...prev, student?.uid]));
    setPhase('roster');
    setTimerRunning(false);
    broadcastState({
      phase: 'roster',
      presenterUid: null,
    });
  }, [presenterIndex, presenterList, broadcastState]);

  // Current presenter info
  const currentPresenter = presenterList[presenterIndex];
  const slides = pressKitData?.slides || [];
  const slide = slides[currentSlide];
  const slideGenre = pressKitData?.slides?.[0]?.fields?.genre?.split(' / ')?.[0] || '';

  // ─── Render: Roster Phase ──────────────────────────────────────
  if (phase === 'roster') {
    return (
      <div className="absolute inset-0 flex bg-gradient-to-br from-[#1a2744] via-[#0f1a2e] to-[#1a2744]">
        <AgentPitchDirections isOpen={showDirections} onClose={() => setShowDirections(false)} />

        {/* Student sidebar */}
        <StudentSidebar
          presenterList={presenterList}
          artistNames={artistNames}
          presented={presented}
          presenterIndex={presenterIndex}
          phase={phase}
          onSelectPresenter={startPresenter}
        />

        {/* Main area — waiting for selection */}
        <div className="flex-1 flex flex-col">
          <div className="flex-shrink-0 px-6 py-3 border-b border-white/10 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-white">Agent Pitch</h1>
              <p className="text-white/50 text-xs">{presented.size} of {presenterList.length} presented</p>
            </div>
            <button
              onClick={() => setShowDirections(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all text-sm"
            >
              <HelpCircle size={16} /> How it works
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🎤</div>
              <h2 className="text-2xl font-bold text-white mb-2">Select a Student to Present</h2>
              <p className="text-white/40 text-sm">Click a name in the sidebar to start their pitch</p>
              {presenterList.length === 0 && (
                <p className="text-amber-400/60 text-sm mt-4">Waiting for students to join...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Presenting / Feedback Phase ─────────────────────────
  if (phase === 'presenting') {
    return (
      <div className="absolute inset-0 flex bg-[#0d1520]">
        {/* Student sidebar */}
        <StudentSidebar
          presenterList={presenterList}
          artistNames={artistNames}
          presented={presented}
          presenterIndex={presenterIndex}
          phase={phase}
          onSelectPresenter={startPresenter}
        />

        {/* Main presenting area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-[#111c33] border-b border-white/10">
            {/* Presenter info */}
            <div>
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

        {/* Bottom bar — done with this presenter */}
        <div className="flex-shrink-0 px-4 py-3 bg-[#111c33] border-t border-white/10 flex items-center justify-end">
          <button
            onClick={finishPresenter}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#f0b429] text-[#1a2744] rounded-xl font-bold text-sm hover:bg-[#f0b429]/90 transition-all"
          >
            <Check size={16} />
            Done — Next Student
          </button>
        </div>
        </div>
      </div>
    );
  }

  // Voting and Results are handled by the separate ClassVote stage

  return null;
};

export default LaunchDayTeacher;
