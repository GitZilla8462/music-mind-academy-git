// LaunchDayStudent.jsx — Student view for Music Journalist Lesson 5
// Listens to Firebase presentationState from teacher.
// Phases: watch (Chromebook closed) → feedback → voting → done

import React, { useState, useEffect, useCallback } from 'react';
import { Monitor, Send, CheckCircle, Vote, MessageSquare, Trophy } from 'lucide-react';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { useSession } from '../../../../context/SessionContext';
import { useStudentAuth } from '../../../../context/StudentAuthContext';
import { saveStudentWork, getClassAuthInfo } from '../../../../utils/studentWorkStorage';
import ExitSessionButton from '../../../../components/ExitSessionButton';

const FEEDBACK_ACTIVITY_ID = 'mj-peer-feedback';
const LESSON_ID = 'mj-lesson5';

const LaunchDayStudent = ({ onComplete, isSessionMode = false }) => {
  const { sessionCode, classCode: contextClassCode } = useSession();
  const { pinSession } = useStudentAuth();
  const urlClassCode = new URLSearchParams(window.location.search).get('classCode');
  const effectiveSessionCode = sessionCode || contextClassCode || urlClassCode;

  // State from teacher broadcast
  const [presState, setPresState] = useState(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [strongerText, setStrongerText] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [allFeedbackSent, setAllFeedbackSent] = useState([]);

  // Listen to teacher's presentation state
  useEffect(() => {
    if (!effectiveSessionCode) return;
    const db = getDatabase();
    const stateRef = ref(db, `sessions/${effectiveSessionCode}/presentationState`);
    const unsub = onValue(stateRef, (snap) => {
      const data = snap.val();
      if (data) {
        setPresState(data);
        // Reset feedback when presenter changes
        if (data.phase === 'presenting') {
          setFeedbackSent(false);
          setFeedbackText('');
          setStrongerText('');
        }
      }
    });
    return () => unsub();
  }, [effectiveSessionCode]);

  // Get student identity
  const auth = getClassAuthInfo(pinSession);
  const studentUid = auth?.uid || 'anonymous';

  // Submit feedback to Firebase
  const handleSubmitFeedback = useCallback(() => {
    if (!feedbackText.trim() || !presState?.presenterUid) return;

    const entry = {
      presenterUid: presState.presenterUid,
      presenterName: presState.presenterName,
      artistName: presState.artistName,
      convinced: feedbackText.trim(),
      stronger: strongerText.trim(),
      sentAt: Date.now(),
    };

    // Save to Firebase for the presenter to see later
    if (effectiveSessionCode) {
      const db = getDatabase();
      set(ref(db, `sessions/${effectiveSessionCode}/peerFeedback/${presState.presenterUid}/${studentUid}`), entry);
    }

    // Track locally
    const updated = [...allFeedbackSent, entry];
    setAllFeedbackSent(updated);

    // Save to student work storage
    saveStudentWork(FEEDBACK_ACTIVITY_ID, {
      title: `Feedback (${updated.length})`,
      emoji: '💬',
      viewRoute: null,
      category: 'Music Journalist',
      type: 'peer-feedback',
      lessonId: LESSON_ID,
      data: { feedbackEntries: updated },
    }, null, auth);

    setFeedbackSent(true);
  }, [feedbackText, strongerText, presState, effectiveSessionCode, studentUid, allFeedbackSent, auth]);

  // Submit vote
  const handleVote = useCallback(() => {
    if (!selectedArtist || !effectiveSessionCode) return;

    const db = getDatabase();
    set(ref(db, `sessions/${effectiveSessionCode}/artistVotes/${studentUid}`), {
      artistName: selectedArtist.artistName,
      presenterUid: selectedArtist.uid,
      votedAt: Date.now(),
    });

    setHasVoted(true);
  }, [selectedArtist, effectiveSessionCode, studentUid]);

  // ─── No state yet — show watch screen ──────────────────────────
  if (!presState || presState.phase === 'roster') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0d1520] text-white p-8 relative">
        <ExitSessionButton />
        <Monitor className="w-24 h-24 mb-6 animate-pulse text-white/40" />
        <h1 className="text-4xl font-bold mb-3">Launch Day</h1>
        <p className="text-xl text-white/40">Waiting for presentations to begin...</p>
        <p className="text-sm text-white/25 mt-2">Close your Chromebook and watch the main screen</p>
      </div>
    );
  }

  // ─── Presenting — Chromebook should be closed ──────────────────
  if (presState.phase === 'presenting') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0d1520] text-white p-8 relative">
        <ExitSessionButton />
        <div className="text-center">
          <div className="text-6xl mb-4">🎤</div>
          <h1 className="text-3xl font-bold mb-2">Now Presenting</h1>
          <p className="text-2xl text-[#f0b429] font-bold mb-1">{presState.artistName || presState.presenterName}</p>
          <p className="text-white/40 mt-6 text-lg">Close your Chromebook and watch the presentation</p>
          <p className="text-white/25 text-sm mt-2">You'll have time to give feedback after</p>
        </div>
      </div>
    );
  }

  // ─── Feedback — open Chromebook and submit ─────────────────────
  if (presState.phase === 'feedback' && presState.feedbackOpen) {
    // Don't show feedback for own presentation
    if (presState.presenterUid === studentUid) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#0d1520] text-white p-8">
          <div className="text-6xl mb-4">⭐</div>
          <h1 className="text-2xl font-bold mb-2">Great Job!</h1>
          <p className="text-white/50">Your classmates are writing feedback about your pitch.</p>
        </div>
      );
    }

    if (feedbackSent) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#0d1520] text-white p-8">
          <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Feedback Sent!</h1>
          <p className="text-white/50">Close your Chromebook — next presenter coming up.</p>
        </div>
      );
    }

    return (
      <div className="h-screen flex flex-col bg-[#0d1520] text-white">
        {/* Header */}
        <div className="flex-shrink-0 bg-blue-600 px-6 py-3 text-center">
          <h1 className="text-lg font-bold">Feedback for {presState.artistName || presState.presenterName}</h1>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-4">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                What convinced you about this artist?
              </label>
              <textarea
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value.slice(0, 200))}
                placeholder="The evidence that convinced me was..."
                rows={3}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-base text-white placeholder-white/30 focus:outline-none focus:border-blue-400 resize-none"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                What could make the pitch stronger?
              </label>
              <textarea
                value={strongerText}
                onChange={e => setStrongerText(e.target.value.slice(0, 200))}
                placeholder="One thing that could be stronger..."
                rows={2}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-base text-white placeholder-white/30 focus:outline-none focus:border-blue-400 resize-none"
              />
            </div>
            <button
              onClick={handleSubmitFeedback}
              disabled={feedbackText.trim().length < 5}
              className={`w-full py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 transition-all ${
                feedbackText.trim().length >= 5
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              <Send size={18} />
              Send Feedback
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Voting ────────────────────────────────────────────────────
  if (presState.phase === 'voting') {
    const artists = presState.artists || [];
    // Filter out own artist
    const votableArtists = artists.filter(a => a.uid !== studentUid);

    if (hasVoted) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#0d1520] text-white p-8">
          <CheckCircle className="w-16 h-16 text-[#f0b429] mb-4" />
          <h1 className="text-2xl font-bold mb-2">Vote Cast!</h1>
          <p className="text-white/50">You voted for <span className="text-[#f0b429] font-bold">{selectedArtist?.artistName}</span></p>
          <p className="text-white/25 text-sm mt-4">Watch the main screen for results...</p>
        </div>
      );
    }

    return (
      <div className="h-screen flex flex-col bg-[#0d1520] text-white">
        <div className="flex-shrink-0 bg-gradient-to-r from-[#f0b429] to-[#e09910] px-6 py-4 text-center">
          <h1 className="text-xl font-black text-[#1a2744]">🗳️ Which Artist Deserves to Go Viral?</h1>
          <p className="text-[#1a2744]/70 text-sm mt-1">Vote for the artist — not the presenter</p>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-md mx-auto space-y-3">
            {votableArtists.map(artist => {
              const isSelected = selectedArtist?.uid === artist.uid;
              return (
                <button
                  key={artist.uid}
                  onClick={() => setSelectedArtist(artist)}
                  className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                    isSelected
                      ? 'bg-[#f0b429]/20 border-[#f0b429] scale-[1.02]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="text-lg font-bold text-white">{artist.artistName}</div>
                  <div className="text-white/40 text-sm">Pitched by {artist.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vote button */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-white/10">
          <button
            onClick={handleVote}
            disabled={!selectedArtist}
            className={`w-full py-4 rounded-xl text-lg font-black flex items-center justify-center gap-2 transition-all ${
              selectedArtist
                ? 'bg-[#f0b429] text-[#1a2744] hover:bg-[#f0b429]/90'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            <Vote size={20} />
            {selectedArtist ? `Vote for ${selectedArtist.artistName}` : 'Select an artist'}
          </button>
        </div>
      </div>
    );
  }

  // ─── Results ───────────────────────────────────────────────────
  if (presState.phase === 'results') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0d1520] text-white p-8">
        <Trophy className="w-20 h-20 text-[#f0b429] mb-4" />
        <h1 className="text-3xl font-bold mb-2">Results Are In!</h1>
        <p className="text-white/50 text-lg">Watch the main screen</p>
      </div>
    );
  }

  // Fallback
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0d1520] text-white p-8 relative">
      <ExitSessionButton />
      <Monitor className="w-24 h-24 mb-6 animate-pulse text-white/40" />
      <h1 className="text-4xl font-bold mb-3">Watch the Main Screen</h1>
    </div>
  );
};

export default LaunchDayStudent;
