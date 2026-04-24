// Motif Gallery — Student View
// Students vote on 4 categories (Character, Mode, Instrument Family, Register)
// Same clean button UI as Mystery Motif. Shows vote results on reveal.

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Check } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, update, onValue } from 'firebase/database';
import { getPlayerColor, getPlayerEmoji, getStudentDisplayName } from '../layer-detective/nameGenerator';

const CHARACTER_OPTIONS = [
  { id: 'hero', label: 'Hero' },
  { id: 'villain', label: 'Villain' },
  { id: 'romantic', label: 'Romantic' },
  { id: 'sneaky', label: 'Sneaky' },
];

const MODE_OPTIONS = [
  { id: 'major', label: 'Major', description: 'Bright, happy' },
  { id: 'minor', label: 'Minor', description: 'Dark, serious' },
];

const FAMILY_OPTIONS = [
  { id: 'strings', label: 'Strings' },
  { id: 'woodwind', label: 'Woodwind' },
  { id: 'brass', label: 'Brass' },
];

const REGISTER_OPTIONS = [
  { id: 'low', label: 'Low', description: 'Deep sound' },
  { id: 'mid', label: 'Mid', description: 'Middle range' },
  { id: 'high', label: 'High', description: 'Bright, soaring' },
];

const MotifGalleryStudent = ({ onComplete, isSessionMode = true }) => {
  const { sessionCode, classId, userId: contextUserId } = useSession();
  const userId = contextUserId || localStorage.getItem('current-session-userId');

  const gamePath = useMemo(() => {
    if (classId) return `classes/${classId}/currentSession/motifGallery`;
    if (sessionCode) return `sessions/${sessionCode}/motifGallery`;
    return null;
  }, [classId, sessionCode]);

  const studentsPath = useMemo(() => {
    if (classId) return `classes/${classId}/currentSession/studentsJoined`;
    if (sessionCode) return `sessions/${sessionCode}/studentsJoined`;
    return null;
  }, [classId, sessionCode]);

  // Player info
  const [playerName, setPlayerName] = useState('');
  const [playerColor, setPlayerColor] = useState('#3B82F6');
  const [playerEmoji, setPlayerEmoji] = useState('');

  // Game state from teacher
  const [gamePhase, setGamePhase] = useState('waiting');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalMotifs, setTotalMotifs] = useState(0);

  // Student picks (4 categories)
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedRegister, setSelectedRegister] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  // Reveal data
  const [correctAnswers, setCorrectAnswers] = useState(null);
  const [composerInfo, setComposerInfo] = useState(null);

  const prevIndexRef = useRef(-1);

  // Get player name
  useEffect(() => {
    if (!userId) return;
    const assignName = async () => {
      setPlayerColor(getPlayerColor(userId));
      setPlayerEmoji(getPlayerEmoji(userId));
      setPlayerName(await getStudentDisplayName(userId, null, studentsPath));
    };
    assignName();
  }, [userId, studentsPath]);

  // Listen for game state
  useEffect(() => {
    if (!gamePath) return;
    const db = getDatabase();
    const unsubscribe = onValue(ref(db, gamePath), (snapshot) => {
      const data = snapshot.val();
      if (!data) { setGamePhase('waiting'); return; }

      setGamePhase(data.phase || 'waiting');
      setCurrentIndex(data.currentIndex || 0);
      setTotalMotifs(data.totalMotifs || 0);

      // New motif — reset picks
      if (data.currentIndex !== prevIndexRef.current) {
        prevIndexRef.current = data.currentIndex;
        setSelectedCharacter(null);
        setSelectedMode(null);
        setSelectedFamily(null);
        setSelectedRegister(null);
        setAnswerSubmitted(false);
        setCorrectAnswers(null);
        setComposerInfo(null);
      }

      // Reveal
      if (data.phase === 'revealed') {
        if (data.correctAnswers) {
          setCorrectAnswers(typeof data.correctAnswers === 'string' ? JSON.parse(data.correctAnswers) : data.correctAnswers);
        }
        if (data.composerInfo) {
          setComposerInfo(typeof data.composerInfo === 'string' ? JSON.parse(data.composerInfo) : data.composerInfo);
        }
      }
    });
    return () => unsubscribe();
  }, [gamePath]);

  // Submit vote
  const submitVote = () => {
    if (answerSubmitted || gamePhase !== 'guessing') return;
    if (!selectedCharacter || !selectedMode || !selectedFamily || !selectedRegister) return;

    setAnswerSubmitted(true);

    const vote = {
      character: selectedCharacter,
      mode: selectedMode,
      instrumentFamily: selectedFamily,
      register: selectedRegister,
    };

    if (studentsPath && userId) {
      update(ref(getDatabase(), `${studentsPath}/${userId}`), {
        galleryVote: JSON.stringify(vote),
      });
    }
  };

  const allPicked = selectedCharacter && selectedMode && selectedFamily && selectedRegister;

  // ============ WAITING / MENU ============
  if (gamePhase === 'waiting' || gamePhase === 'selecting' || gamePhase === 'menu' || gamePhase === 'directions') {
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <h1 className="text-3xl font-bold text-white mb-3">Motif Gallery</h1>
          <p className="text-purple-200 mb-6">Get ready to listen to your classmates' motifs!</p>
          <div className="bg-white/10 rounded-2xl p-5 text-left space-y-3 mb-6">
            <p className="text-sm text-white"><span className="font-bold">1.</span> A mystery motif will play on the main screen</p>
            <p className="text-sm text-white"><span className="font-bold">2.</span> Vote on Character, Mode, Instrument Family, and Register</p>
            <p className="text-sm text-white"><span className="font-bold">3.</span> See who composed it and how the class voted</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 inline-block">
            <span className="text-3xl mb-1 block">{playerEmoji}</span>
            <div className="text-xl font-bold" style={{ color: playerColor }}>{playerName}</div>
            <p className="text-purple-300 text-xs mt-1">Waiting for teacher...</p>
          </div>
        </div>
      </div>
    );
  }

  // ============ FINISHED ============
  if (gamePhase === 'finished') {
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Gallery Complete!</h1>
          <p className="text-purple-200">Look at the main screen!</p>
        </div>
      </div>
    );
  }

  // ============ PLAYING / GUESSING / REVEALED ============
  return (
    <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
            style={{ backgroundColor: playerColor }}
          >{playerEmoji}</div>
          <div>
            <div className="text-lg font-bold" style={{ color: playerColor }}>{playerName}</div>
            <div className="text-sm text-purple-200">Motif {currentIndex + 1}/{totalMotifs}</div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto">

        {/* Playing — listening */}
        {gamePhase === 'playing' && (
          <div className="text-center">
            <p className="text-2xl text-white font-bold mb-2">Listen carefully...</p>
            <p className="text-purple-200">The teacher will play a student's motif</p>
          </div>
        )}

        {/* Guessing — not yet submitted */}
        {gamePhase === 'guessing' && !answerSubmitted && (
          <div className="w-full max-w-md">
            <p className="text-center text-purple-200 text-sm mb-4">Listen, then pick all 4:</p>

            {/* Character */}
            <div className="mb-3">
              <label className="text-xs font-bold text-purple-300 uppercase mb-1.5 block">Character Type?</label>
              <div className="grid grid-cols-4 gap-2">
                {CHARACTER_OPTIONS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCharacter(c.id)}
                    className={`p-3 rounded-xl text-center transition-all duration-200 active:scale-95 font-bold ${
                      selectedCharacter === c.id
                        ? 'bg-purple-500 text-white ring-2 ring-white scale-105'
                        : selectedCharacter
                        ? 'bg-white/10 text-white/40 hover:text-white/70 hover:bg-white/15'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <div className="text-lg">{c.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mode */}
            <div className="mb-3">
              <label className="text-xs font-bold text-purple-300 uppercase mb-1.5 block">Bright or Dark?</label>
              <div className="flex gap-2">
                {MODE_OPTIONS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMode(m.id)}
                    className={`flex-1 p-3 rounded-xl text-center transition-all duration-200 active:scale-95 font-bold ${
                      selectedMode === m.id
                        ? 'bg-purple-500 text-white ring-2 ring-white scale-105'
                        : selectedMode
                        ? 'bg-white/10 text-white/40 hover:text-white/70 hover:bg-white/15'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <div className="text-lg">{m.label}</div>
                    <div className="text-xs opacity-70">{m.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Instrument Family */}
            <div className="mb-3">
              <label className="text-xs font-bold text-purple-300 uppercase mb-1.5 block">Instrument Family?</label>
              <div className="grid grid-cols-3 gap-2">
                {FAMILY_OPTIONS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFamily(f.id)}
                    className={`p-3 rounded-xl text-center transition-all duration-200 active:scale-95 font-bold ${
                      selectedFamily === f.id
                        ? 'bg-purple-500 text-white ring-2 ring-white scale-105'
                        : selectedFamily
                        ? 'bg-white/10 text-white/40 hover:text-white/70 hover:bg-white/15'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <div className="text-lg">{f.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Register */}
            <div className="mb-4">
              <label className="text-xs font-bold text-purple-300 uppercase mb-1.5 block">Register?</label>
              <div className="flex gap-2">
                {REGISTER_OPTIONS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRegister(r.id)}
                    className={`flex-1 p-3 rounded-xl text-center transition-all duration-200 active:scale-95 font-bold ${
                      selectedRegister === r.id
                        ? 'bg-purple-500 text-white ring-2 ring-white scale-105'
                        : selectedRegister
                        ? 'bg-white/10 text-white/40 hover:text-white/70 hover:bg-white/15'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <div className="text-lg">{r.label}</div>
                    <div className="text-xs opacity-70">{r.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Lock In */}
            <button
              onClick={submitVote}
              disabled={!allPicked}
              className="w-full py-4 rounded-xl text-lg font-bold transition-all active:scale-95 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            >
              {allPicked ? 'Lock In Vote' : 'Pick all 4 to vote'}
            </button>
          </div>
        )}

        {/* Vote submitted */}
        {gamePhase === 'guessing' && answerSubmitted && (
          <div className="text-center">
            <div className="bg-white/20 rounded-2xl p-6 inline-block">
              <Check size={48} className="mx-auto text-green-400 mb-3" />
              <p className="text-xl text-white font-bold mb-3">Vote Locked In!</p>
              <div className="flex flex-wrap gap-2 mb-3 justify-center">
                <span className="px-3 py-1 rounded-full text-sm font-bold text-white bg-purple-500">
                  {CHARACTER_OPTIONS.find(c => c.id === selectedCharacter)?.label}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-bold text-white bg-purple-500">
                  {MODE_OPTIONS.find(m => m.id === selectedMode)?.label}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-bold text-white bg-purple-500">
                  {FAMILY_OPTIONS.find(f => f.id === selectedFamily)?.label}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-bold text-white bg-purple-500">
                  {REGISTER_OPTIONS.find(r => r.id === selectedRegister)?.label}
                </span>
              </div>
              <p className="text-sm text-purple-300">Waiting for reveal...</p>
            </div>
          </div>
        )}

        {/* Revealed */}
        {gamePhase === 'revealed' && correctAnswers && composerInfo && (
          <div className="text-center w-full max-w-md">
            {/* Composer card */}
            <div className="bg-white/10 rounded-2xl p-5 mb-4">
              <p className="text-sm text-purple-300 mb-1">Composed by</p>
              <p className="text-2xl font-bold text-white mb-1">{composerInfo.name}</p>
              <div className="text-lg font-bold" style={{ color: composerInfo.characterColor || '#3B82F6' }}>
                {composerInfo.characterName || 'Unnamed Character'}
              </div>
              {composerInfo.description && (
                <p className="text-purple-400 text-sm italic mt-1">"{composerInfo.description}"</p>
              )}
            </div>

            {/* Your results */}
            {answerSubmitted && (
              <div className="space-y-2 mb-4">
                {[
                  { label: 'Character', picked: selectedCharacter, correct: correctAnswers.character, options: CHARACTER_OPTIONS },
                  { label: 'Mode', picked: selectedMode, correct: correctAnswers.mode, options: MODE_OPTIONS },
                  { label: 'Instrument', picked: selectedFamily, correct: correctAnswers.instrumentFamily, options: FAMILY_OPTIONS },
                  { label: 'Register', picked: selectedRegister, correct: correctAnswers.register, options: REGISTER_OPTIONS },
                ].map(cat => {
                  const isCorrect = cat.picked === cat.correct;
                  return (
                    <div key={cat.label} className={`flex items-center gap-3 p-3 rounded-xl ${isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      <span className="text-xl">{isCorrect ? '✅' : '❌'}</span>
                      <div className="flex-1 text-left">
                        <div className="text-xs text-purple-300">{cat.label}</div>
                        <div className="text-white font-bold">{cat.options.find(o => o.id === cat.correct)?.label}</div>
                      </div>
                      {!isCorrect && (
                        <span className="text-sm text-red-300">You: {cat.options.find(o => o.id === cat.picked)?.label}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <p className="text-purple-200 text-sm">Look at the main screen for class votes!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MotifGalleryStudent;
