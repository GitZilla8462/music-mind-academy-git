// File: topic-selector/TopicSelector.jsx
// Simple component for students to select and lock in their research topic
// Used in Music Journalist Lesson 2

import React, { useState, useEffect } from 'react';
import { Check, Lock, Pencil } from 'lucide-react';
import { saveStudentWork, getClassAuthInfo } from '../../../../utils/studentWorkStorage';

const STORAGE_KEY = 'mma-research-topic';
const ACTIVITY_ID = 'mj-topic';
const LESSON_ID = 'mj-lesson2';
const MAX_CHARS = 100;
const MIN_CHARS = 5;

const TopicSelector = ({ onComplete, isSessionMode = false }) => {
  const [topic, setTopic] = useState('');
  const [locked, setLocked] = useState(false);

  // Load saved topic on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.topic && parsed.locked) {
          setTopic(parsed.topic);
          setLocked(true);
        } else if (parsed.topic) {
          setTopic(parsed.topic);
        }
      }
    } catch { /* ignore */ }
  }, []);

  const handleLockIn = () => {
    if (topic.trim().length < MIN_CHARS) return;

    const trimmed = topic.trim();
    setTopic(trimmed);
    setLocked(true);

    // Save to localStorage
    const saveData = { topic: trimmed, locked: true, timestamp: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));

    // Save via studentWorkStorage (handles Firebase sync)
    const auth = getClassAuthInfo();
    saveStudentWork(ACTIVITY_ID, {
      title: trimmed,
      emoji: '\uD83D\uDD0D',
      viewRoute: null,
      category: 'Music Journalist',
      type: 'topic-selection',
      lessonId: LESSON_ID,
      data: saveData,
    }, null, auth);

    if (onComplete) {
      onComplete(ACTIVITY_ID);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val.length <= MAX_CHARS) {
      setTopic(val);
    }
  };

  const charsLeft = MAX_CHARS - topic.length;
  const canSubmit = topic.trim().length >= MIN_CHARS && !locked;

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#1a2744] text-white p-6">
      <div className="w-full max-w-lg bg-[#111c33] rounded-2xl border border-white/10 shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">
            {locked ? <Check className="w-14 h-14 text-green-400 mx-auto" /> : <Pencil className="w-12 h-12 text-[#f0b429] mx-auto" />}
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {locked ? 'Topic Locked!' : 'Choose Your Research Topic'}
          </h1>
          {!locked && (
            <p className="text-white/60 text-sm">
              Pick a music topic you want to investigate and write about.
            </p>
          )}
        </div>

        {locked ? (
          /* Locked state */
          <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold text-sm uppercase tracking-wide">Locked In</span>
            </div>
            <p className="text-xl font-bold text-white">{topic}</p>
          </div>
        ) : (
          /* Input state */
          <>
            <label className="block text-white/70 text-sm font-medium mb-2" htmlFor="topic-input">
              My research topic is...
            </label>
            <input
              id="topic-input"
              type="text"
              value={topic}
              onChange={handleInputChange}
              placeholder="e.g., How hip-hop changed pop music"
              className="w-full bg-[#1a2744] border border-white/20 rounded-xl px-5 py-4 text-lg text-white placeholder-white/30 focus:outline-none focus:border-[#f0b429] focus:ring-1 focus:ring-[#f0b429] transition-colors"
              autoFocus
              autoComplete="off"
            />
            <div className="flex items-center justify-between mt-2 mb-6">
              <span className={`text-xs ${charsLeft < 20 ? 'text-amber-400' : 'text-white/40'}`}>
                {charsLeft} characters remaining
              </span>
              {topic.trim().length > 0 && topic.trim().length < MIN_CHARS && (
                <span className="text-xs text-red-400">
                  At least {MIN_CHARS} characters needed
                </span>
              )}
            </div>

            <button
              onClick={handleLockIn}
              disabled={!canSubmit}
              className={`w-full py-4 rounded-xl text-lg font-bold transition-all ${
                canSubmit
                  ? 'bg-[#f0b429] text-[#1a2744] hover:bg-[#f0b429]/90 active:scale-[0.98] cursor-pointer'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Lock className="w-5 h-5" />
                Lock In Topic
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TopicSelector;
