// File: peer-feedback/PeerFeedback.jsx
// Feedback submission component for after Music Journalist presentations
// Students write specific feedback for each presenter

import React, { useState, useEffect, useCallback } from 'react';
import { Send, MessageSquare, CheckCircle, ChevronRight, User } from 'lucide-react';
import { saveStudentWork, getClassAuthInfo } from '../../../../utils/studentWorkStorage';
import { useSession } from '../../../../context/SessionContext';

const SENT_STORAGE_KEY = 'mma-peer-feedback-sent';
const RECEIVED_STORAGE_KEY = 'mma-peer-feedback-received';
const ACTIVITY_ID = 'mj-peer-feedback';
const LESSON_ID = 'mj-lesson4';
const MAX_CHARS = 300;
const MIN_CHARS = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadSentFeedback() {
  try {
    const raw = localStorage.getItem(SENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveSentFeedback(entries) {
  localStorage.setItem(SENT_STORAGE_KEY, JSON.stringify(entries));
}

function loadReceivedFeedback() {
  try {
    const raw = localStorage.getItem(RECEIVED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const PeerFeedback = ({ onComplete, isSessionMode = false, viewMode = false }) => {
  // If viewMode, show received feedback
  if (viewMode) {
    return <ReceivedFeedbackView />;
  }

  return <FeedbackForm onComplete={onComplete} isSessionMode={isSessionMode} />;
};

// ---------------------------------------------------------------------------
// Received Feedback View
// ---------------------------------------------------------------------------

const ReceivedFeedbackView = () => {
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    setFeedback(loadReceivedFeedback());
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#1a2744] text-white p-6">
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">
        <h1 className="text-2xl font-bold text-center mb-2">Feedback Received</h1>
        <p className="text-white/50 text-sm text-center mb-6">What your classmates said about your presentation.</p>

        {feedback.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <MessageSquare className="w-16 h-16 text-white/20 mb-4" />
            <p className="text-white/40 text-lg">No feedback received yet</p>
            <p className="text-white/25 text-sm mt-1">Feedback will appear here after presentations.</p>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto flex-1">
            {feedback.map((entry, i) => (
              <div
                key={i}
                className="bg-[#111c33] border border-white/10 rounded-xl p-5"
              >
                <p className="text-white/90 text-base leading-relaxed">{entry.text}</p>
                {entry.timestamp && (
                  <p className="text-white/25 text-xs mt-2">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Feedback Form
// ---------------------------------------------------------------------------

const FeedbackForm = ({ onComplete, isSessionMode }) => {
  const [presenterName, setPresenterName] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [sentList, setSentList] = useState([]);
  const [justSent, setJustSent] = useState(false);
  const [studentNames, setStudentNames] = useState([]);

  // Try to get session for student names
  let sessionCtx = null;
  try {
    sessionCtx = useSession();
  } catch { /* not in session context */ }

  // Load sent feedback on mount
  useEffect(() => {
    setSentList(loadSentFeedback());
  }, []);

  // Load student names from session if available
  useEffect(() => {
    if (isSessionMode && sessionCtx?.getStudents) {
      const students = sessionCtx.getStudents();
      if (students && students.length > 0) {
        const names = students
          .map((s) => s.displayName || s.name || s.studentName || '')
          .filter((n) => n.length > 0)
          .sort((a, b) => a.localeCompare(b));
        setStudentNames(names);
      }
    }
  }, [isSessionMode, sessionCtx]);

  const alreadySentTo = useCallback(
    (name) => sentList.some((entry) => entry.presenterName.toLowerCase() === name.toLowerCase()),
    [sentList]
  );

  const charsLeft = MAX_CHARS - feedbackText.length;
  const canSubmit =
    presenterName.trim().length > 0 &&
    feedbackText.trim().length >= MIN_CHARS &&
    !alreadySentTo(presenterName.trim());

  const handleSubmit = () => {
    if (!canSubmit) return;

    const entry = {
      presenterName: presenterName.trim(),
      text: feedbackText.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedList = [...sentList, entry];
    setSentList(updatedList);
    saveSentFeedback(updatedList);

    // Save via studentWorkStorage
    const auth = getClassAuthInfo();
    saveStudentWork(ACTIVITY_ID, {
      title: `Feedback (${updatedList.length})`,
      emoji: '\uD83D\uDCAC',
      viewRoute: null,
      category: 'Music Journalist',
      type: 'peer-feedback',
      lessonId: LESSON_ID,
      data: { feedbackEntries: updatedList },
    }, null, auth);

    setJustSent(true);
  };

  const handleWriteAnother = () => {
    setPresenterName('');
    setFeedbackText('');
    setJustSent(false);
  };

  const handleDone = () => {
    if (onComplete) onComplete(ACTIVITY_ID);
  };

  // Just-sent confirmation
  if (justSent) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#1a2744] text-white p-6">
        <div className="w-full max-w-md bg-[#111c33] rounded-2xl border border-white/10 shadow-2xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Feedback Sent!</h1>
          <p className="text-white/60 text-sm mb-8">
            You've given feedback to {sentList.length} presenter{sentList.length !== 1 ? 's' : ''}.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleWriteAnother}
              className="w-full py-4 bg-[#f0b429] text-[#1a2744] rounded-xl font-bold text-lg hover:bg-[#f0b429]/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Write Another
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleDone}
              className="w-full py-3 bg-white/10 border border-white/20 rounded-xl font-semibold text-base hover:bg-white/20 active:scale-[0.98] transition-all"
            >
              I'm Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#1a2744] text-white p-6">
      <div className="w-full max-w-md bg-[#111c33] rounded-2xl border border-white/10 shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <MessageSquare className="w-10 h-10 text-[#f0b429] mx-auto mb-2" />
          <h1 className="text-2xl font-bold mb-1">Give Feedback</h1>
          <p className="text-white/50 text-sm">
            Write one specific thing you learned from this presentation.
          </p>
        </div>

        {/* Sent count */}
        {sentList.length > 0 && (
          <div className="bg-green-900/20 border border-green-500/20 rounded-lg px-3 py-2 mb-5 text-center">
            <span className="text-green-400 text-xs font-medium">
              {sentList.length} feedback{sentList.length !== 1 ? 's' : ''} sent
            </span>
          </div>
        )}

        {/* Presenter selector */}
        <label className="block text-white/70 text-sm font-medium mb-2">
          Who presented?
        </label>
        {isSessionMode && studentNames.length > 0 ? (
          <select
            value={presenterName}
            onChange={(e) => setPresenterName(e.target.value)}
            className="w-full bg-[#1a2744] border border-white/20 rounded-xl px-4 py-3 text-base text-white focus:outline-none focus:border-[#f0b429] focus:ring-1 focus:ring-[#f0b429] transition-colors mb-1 appearance-none cursor-pointer"
          >
            <option value="">Select a presenter...</option>
            {studentNames.map((name) => (
              <option key={name} value={name} disabled={alreadySentTo(name)}>
                {name}{alreadySentTo(name) ? ' (sent)' : ''}
              </option>
            ))}
          </select>
        ) : (
          <div className="relative mb-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              value={presenterName}
              onChange={(e) => setPresenterName(e.target.value)}
              placeholder="Presenter's name"
              className="w-full bg-[#1a2744] border border-white/20 rounded-xl pl-10 pr-4 py-3 text-base text-white placeholder-white/30 focus:outline-none focus:border-[#f0b429] focus:ring-1 focus:ring-[#f0b429] transition-colors"
              autoComplete="off"
            />
          </div>
        )}
        {presenterName.trim() && alreadySentTo(presenterName.trim()) && (
          <p className="text-amber-400 text-xs mb-3">You already sent feedback to this presenter.</p>
        )}
        {!alreadySentTo(presenterName.trim()) && <div className="mb-4" />}

        {/* Feedback text area */}
        <label className="block text-white/70 text-sm font-medium mb-2">
          Your feedback
        </label>
        <textarea
          value={feedbackText}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) {
              setFeedbackText(e.target.value);
            }
          }}
          placeholder="I learned that..."
          rows={4}
          className="w-full bg-[#1a2744] border border-white/20 rounded-xl px-4 py-3 text-base text-white placeholder-white/30 focus:outline-none focus:border-[#f0b429] focus:ring-1 focus:ring-[#f0b429] transition-colors resize-none"
        />
        <div className="flex items-center justify-between mt-1 mb-5">
          <span className={`text-xs ${charsLeft < 50 ? 'text-amber-400' : 'text-white/40'}`}>
            {charsLeft} characters remaining
          </span>
          {feedbackText.length > 0 && feedbackText.trim().length < MIN_CHARS && (
            <span className="text-xs text-red-400">At least {MIN_CHARS} characters</span>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full py-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2 ${
            canSubmit
              ? 'bg-[#f0b429] text-[#1a2744] hover:bg-[#f0b429]/90 active:scale-[0.98] cursor-pointer'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
          }`}
        >
          <Send className="w-5 h-5" />
          Send Feedback
        </button>
      </div>
    </div>
  );
};

export default PeerFeedback;
