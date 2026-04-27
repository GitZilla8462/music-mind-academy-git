// Motif Gallery — Teacher Presentation View (Simplified)
// Search for a student → display their character card + play their motif
// No voting, no guessing. Just showcase volunteer work.

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Play, Square, Search, ArrowLeft, ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useSession } from '../../../../context/SessionContext';
import { formatFirstNameLastInitial } from '../layer-detective/nameGenerator';
import { INSTRUMENTS } from '../../../film-music/shared/virtual-instrument/instrumentConfig';

const ActivityBanner = () => (
  <div className="w-full flex items-center justify-center" style={{ height: '64px', backgroundColor: '#7c3aed', flexShrink: 0 }}>
    <span className="text-white font-bold" style={{ fontSize: '28px' }}>STUDENT ACTIVITY</span>
  </div>
);

const CHARACTER_TYPE_INFO = {
  hero: { emoji: '🦸', label: 'Hero', color: '#EF4444' },
  villain: { emoji: '🦹', label: 'Villain', color: '#7C3AED' },
  romantic: { emoji: '💕', label: 'Romantic', color: '#EC4899' },
  sneaky: { emoji: '🕵️', label: 'Sneaky', color: '#F59E0B' },
  other: { emoji: '✨', label: 'Custom', color: '#6B7280' },
};

const MotifGalleryTeacher = ({ sessionData, onComplete }) => {
  const { sessionCode: contextSessionCode, classId } = useSession();
  const urlParams = new URLSearchParams(window.location.search);
  const sessionCode = contextSessionCode || sessionData?.sessionCode || urlParams.get('session') || urlParams.get('classCode');

  const studentsPath = useMemo(() => {
    if (classId) return `classes/${classId}/currentSession/studentsJoined`;
    if (sessionCode) return `sessions/${sessionCode}/studentsJoined`;
    return null;
  }, [classId, sessionCode]);

  const [submissions, setSubmissions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedMotifIndex, setSelectedMotifIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  // Audio
  const synthRef = useRef(null);
  const playbackTimeoutsRef = useRef([]);
  const [ToneLib, setToneLib] = useState(null);

  useEffect(() => { import('tone').then(t => setToneLib(t)); }, []);

  // Subscribe to students
  useEffect(() => {
    if (!studentsPath) return;
    const db = getDatabase();
    const unsubscribe = onValue(ref(db, studentsPath), (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data)
        .filter(([, s]) => s.motifSubmission || s.allMotifs)
        .map(([id, s]) => {
          const name = formatFirstNameLastInitial(s.displayName || s.playerName || s.name || 'Student');
          const allMotifsObj = s.allMotifs || {};
          const allMotifsList = Object.entries(allMotifsObj)
            .filter(([, m]) => m.notes && m.notes.length > 0)
            .map(([charId, m]) => ({ ...m, characterId: charId }));
          return { id, studentName: name, motifs: allMotifsList };
        })
        .filter(s => s.motifs.length > 0)
        .sort((a, b) => a.studentName.localeCompare(b.studentName));
      setSubmissions(list);
    });
    return () => unsubscribe();
  }, [studentsPath]);

  // Playback
  const stopPlayback = useCallback(() => {
    playbackTimeoutsRef.current.forEach(t => clearTimeout(t));
    if (synthRef.current) { try { synthRef.current.dispose(); } catch(e) {} }
    synthRef.current = null;
    setIsPlaying(false);
  }, []);

  const doPlayback = useCallback(async (motif) => {
    if (!motif?.notes?.length || !ToneLib) return;
    if (ToneLib.context.state !== 'running') await ToneLib.start();
    stopPlayback();

    const inst = INSTRUMENTS[motif.instrument];
    if (!inst) return;
    setIsPlaying(true);

    const startNotes = (synth) => {
      synthRef.current = synth;
      const timeouts = [];
      const notes = motif.notes.filter(n => !n.note?.startsWith('drum-'));
      notes.forEach(nd => {
        timeouts.push(setTimeout(() => {
          try { synth.triggerAttackRelease(nd.note, nd.duration || 0.3); } catch(e) {}
        }, nd.timestamp * 1000));
      });
      const last = notes[notes.length - 1];
      const totalMs = last ? (last.timestamp + (last.duration || 0.3)) * 1000 + 500 : 500;
      timeouts.push(setTimeout(() => setIsPlaying(false), totalMs));
      playbackTimeoutsRef.current = timeouts;
    };

    if (inst.useSampler && inst.samples) {
      try {
        const sampler = new ToneLib.Sampler({
          urls: inst.samples.urls, baseUrl: inst.samples.baseUrl,
          attack: inst.samplerAttack || 0, release: inst.config?.envelope?.release || 1,
          onload: () => startNotes(sampler),
          onerror: () => { const fb = new ToneLib.PolySynth(ToneLib.Synth, inst.config).toDestination(); fb.volume.value = -6; startNotes(fb); },
        }).toDestination();
        sampler.volume.value = -6;
      } catch(e) {
        const fb = new ToneLib.PolySynth(ToneLib.Synth, inst.config).toDestination(); fb.volume.value = -6; startNotes(fb);
      }
    } else {
      const s = new ToneLib.PolySynth(ToneLib.Synth, inst.config).toDestination(); s.volume.value = -6; startNotes(s);
    }
  }, [ToneLib, stopPlayback]);

  useEffect(() => { return () => { stopPlayback(); }; }, [stopPlayback]);

  const searchResults = searchQuery.trim()
    ? submissions.filter(s => s.studentName?.toLowerCase().includes(searchQuery.toLowerCase()))
    : submissions;

  // Select a student and show their first motif
  const selectStudent = (student) => {
    stopPlayback();
    setSelectedStudent(student);
    setSelectedMotifIndex(0);
  };

  const backToSearch = () => {
    stopPlayback();
    setSelectedStudent(null);
    setSelectedMotifIndex(0);
  };

  const currentMotif = selectedStudent?.motifs?.[selectedMotifIndex];
  const charTypeInfo = CHARACTER_TYPE_INFO[currentMotif?.characterType] || CHARACTER_TYPE_INFO.other;

  // ============ STUDENT SELECTED — SHOW THEIR MOTIF ============
  if (selectedStudent && currentMotif) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900">
        <ActivityBanner />

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          {/* Back + student name */}
          <div className="flex items-center gap-3 w-full max-w-2xl mb-6">
            <button onClick={backToSearch} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-black text-white">{selectedStudent.studentName}</h1>
            {selectedStudent.motifs.length > 1 && (
              <span className="text-purple-300 text-lg">Character {selectedMotifIndex + 1} of {selectedStudent.motifs.length}</span>
            )}
          </div>

          {/* Character card with artwork */}
          <div className="w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl mb-6" style={{ backgroundColor: currentMotif.characterColor || '#3B82F6' }}>
            <div className="flex">
              {/* Artwork */}
              {currentMotif.drawing ? (
                <div className="w-64 shrink-0 bg-white p-2 flex items-center justify-center">
                  <img
                    src={currentMotif.drawing}
                    alt={currentMotif.characterName || 'Character artwork'}
                    className="w-full h-auto rounded-lg"
                    style={{ aspectRatio: '2/3', objectFit: 'contain' }}
                  />
                </div>
              ) : null}

              {/* Character info */}
              <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                <div className="text-7xl mb-3">{charTypeInfo.emoji}</div>
                <h2 className="text-4xl font-black text-white mb-2">{currentMotif.characterName || 'Unnamed Character'}</h2>
                <div className="inline-block px-4 py-1 rounded-full bg-black/20 text-white text-lg font-bold mb-3">
                  {charTypeInfo.label}
                </div>
                {currentMotif.characterDescription && (
                  <p className="text-xl text-white/80 italic">"{currentMotif.characterDescription}"</p>
                )}
              </div>
            </div>

            {/* Instrument + motif info bar */}
            <div className="bg-black/20 px-8 py-4 flex items-center justify-between">
              <div className="text-white">
                <span className="text-sm text-white/60">Instrument: </span>
                <span className="font-bold">{INSTRUMENTS[currentMotif.instrument]?.name || currentMotif.instrument}</span>
              </div>
              <div className="text-white">
                <span className="text-sm text-white/60">Notes: </span>
                <span className="font-bold">{currentMotif.notes?.length || 0}</span>
              </div>
              <div className="text-white">
                <span className="text-sm text-white/60">Mode: </span>
                <span className="font-bold">{currentMotif.mode === 'minor' ? 'Dark (Minor)' : 'Bright (Major)'}</span>
              </div>
            </div>
          </div>

          {/* Play controls */}
          <div className="flex gap-4 items-center">
            <button
              onClick={() => isPlaying ? stopPlayback() : doPlayback(currentMotif)}
              className={`px-10 py-4 text-white text-2xl font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-3 ${
                isPlaying
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
              }`}
            >
              {isPlaying ? <><Square size={28} /> Stop</> : <><Play size={28} /> Play Motif</>}
            </button>
            {!isPlaying && (
              <button
                onClick={() => doPlayback(currentMotif)}
                className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl flex items-center gap-2 transition-colors"
              >
                <RotateCcw size={20} /> Replay
              </button>
            )}
          </div>

          {/* Navigate between this student's characters */}
          {selectedStudent.motifs.length > 1 && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { stopPlayback(); setSelectedMotifIndex(Math.max(0, selectedMotifIndex - 1)); }}
                disabled={selectedMotifIndex === 0}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center gap-1 transition-colors disabled:opacity-30"
              >
                <ChevronLeft size={18} /> Prev Character
              </button>
              <button
                onClick={() => { stopPlayback(); setSelectedMotifIndex(Math.min(selectedStudent.motifs.length - 1, selectedMotifIndex + 1)); }}
                disabled={selectedMotifIndex >= selectedStudent.motifs.length - 1}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center gap-1 transition-colors disabled:opacity-30"
              >
                Next Character <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============ SEARCH / BROWSE ============
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900">
      <ActivityBanner />

      <div className="flex-1 flex flex-col items-center p-6">
        <h1 className="text-5xl font-black text-white mb-2">Motif Gallery</h1>
        <p className="text-xl text-purple-200 mb-6">{submissions.length} student{submissions.length !== 1 ? 's' : ''} with motifs</p>

        {/* Search bar */}
        <div className="w-full max-w-xl relative mb-6">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student name..."
            autoFocus
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-lg placeholder-purple-300 focus:outline-none focus:border-purple-400"
          />
        </div>

        {/* Student list */}
        <div className="w-full max-w-xl flex-1 overflow-y-auto space-y-2">
          {searchResults.length === 0 ? (
            <p className="text-center text-purple-300 py-8">
              {submissions.length === 0 ? 'No motifs submitted yet' : 'No students match your search'}
            </p>
          ) : (
            searchResults.map(student => (
              <button
                key={student.id}
                onClick={() => selectStudent(student)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all text-left"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0"
                  style={{ backgroundColor: student.motifs[0]?.characterColor || '#3B82F6' }}
                >
                  {CHARACTER_TYPE_INFO[student.motifs[0]?.characterType]?.emoji || '🎵'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-lg truncate">{student.studentName}</div>
                  <div className="text-purple-300 text-sm">
                    {student.motifs.length} character{student.motifs.length !== 1 ? 's' : ''}
                    {' — '}
                    {student.motifs.map(m => m.characterName || 'Unnamed').join(', ')}
                  </div>
                </div>
                <Play size={20} className="text-purple-300 shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MotifGalleryTeacher;
