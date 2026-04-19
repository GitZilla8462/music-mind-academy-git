// ComposersNotes.jsx
// Text reflection component for Film Music Lesson 5
// Students explain 3+ creative choices in their film score

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PenTool, Check, Save } from 'lucide-react';
import { saveComposersNotes, getComposersNotes } from '../../lesson5/lesson5StorageUtils';

const PROMPTS = [
  "Why did you choose this motif for your character? What makes it fit?",
  "Where did you use silence, and why does it matter in that moment?",
  "What emotion were you trying to create? How did your instrument choices help?",
  "How does your music change as the story changes? Why?",
  "What was the hardest creative decision you made?"
];

const MIN_CHARS = 100;

const ComposersNotes = ({ onComplete, viewMode = false, isSessionMode = false }) => {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const saveTimeoutRef = useRef(null);

  // Load saved notes
  useEffect(() => {
    const saved = getComposersNotes();
    if (saved?.text) {
      setText(saved.text);
    }
  }, []);

  // Auto-save
  const handleChange = useCallback((e) => {
    const value = e.target.value;
    setText(value);
    setSaved(false);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveComposersNotes(value);
      setSaved(true);
    }, 1500);
  }, []);

  // Manual save + complete
  const handleSubmit = useCallback(() => {
    saveComposersNotes(text);
    setSaved(true);
    if (onComplete) onComplete();
  }, [text, onComplete]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const charCount = text.length;
  const isReady = charCount >= MIN_CHARS;

  return (
    <div className="h-screen flex flex-col bg-gray-900 p-4 sm:p-6">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <PenTool className="w-6 h-6 text-orange-400" />
          Composer's Notes
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Explain at least three creative choices you made in your film score.
        </p>
      </div>

      {/* Prompt suggestions */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {PROMPTS.map((prompt, i) => (
          <button
            key={i}
            className="px-3 py-1.5 bg-gray-800 text-gray-400 text-xs rounded-lg hover:bg-gray-700 hover:text-white transition-colors text-left max-w-xs"
            onClick={() => {
              if (!viewMode) {
                setText(prev => prev + (prev ? '\n\n' : '') + prompt + '\n');
              }
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Text area */}
      <div className="flex-1 flex flex-col max-w-2xl w-full mx-auto">
        <textarea
          className="flex-1 bg-gray-800 text-white rounded-xl p-4 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50 border border-gray-700"
          placeholder="Start writing about your creative choices here..."
          value={text}
          onChange={handleChange}
          readOnly={viewMode}
          autoFocus={!viewMode}
        />

        {/* Footer */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            <span className={`text-xs ${isReady ? 'text-green-400' : 'text-gray-500'}`}>
              {charCount} characters {!isReady && `(${MIN_CHARS - charCount} more needed)`}
            </span>
            {saved && (
              <span className="text-xs text-green-400 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Saved
              </span>
            )}
          </div>

          {!viewMode && (
            <button
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isReady
                  ? 'bg-orange-600 text-white hover:bg-orange-500 shadow-lg shadow-orange-600/30'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
              onClick={handleSubmit}
              disabled={!isReady}
            >
              <Save className="w-4 h-4" />
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComposersNotes;
