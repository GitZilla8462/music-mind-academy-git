// FactOpinionStudentView — Simple writing activity
// Students write one fact and one opinion about their chosen artist, with examples shown.

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Lightbulb } from 'lucide-react';

const EXAMPLES = [
  { type: 'fact', text: 'Their debut single was streamed 50,000 times in the first month.', why: 'You can verify this with data — it\'s measurable.' },
  { type: 'opinion', text: 'Their music sounds better than anyone else in the genre.', why: '"Better" is a personal judgment — not everyone would agree.' },
  { type: 'fact', text: 'They released 3 albums between 2022 and 2024.', why: 'Specific numbers and dates that can be checked.' },
  { type: 'opinion', text: 'Their lyrics are the most creative I\'ve ever heard.', why: '"Most creative" is subjective — it depends on the listener.' },
];

const STORAGE_KEY = 'mma-fact-opinion-writing';

const FactOpinionStudentView = ({ onComplete, isSessionMode = true }) => {
  const [fact, setFact] = useState('');
  const [opinion, setOpinion] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const saveTimer = useRef(null);

  // Load saved work
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved) {
        setFact(saved.fact || '');
        setOpinion(saved.opinion || '');
        if (saved.submitted) setSubmitted(true);
      }
    } catch {}
  }, []);

  // Autosave
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ fact, opinion, submitted, savedAt: new Date().toISOString() }));
    }, 1000);
    return () => clearTimeout(saveTimer.current);
  }, [fact, opinion, submitted]);

  const canSubmit = fact.trim().length >= 10 && opinion.trim().length >= 10;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ fact, opinion, submitted: true, savedAt: new Date().toISOString() }));
    onComplete?.();
  };

  if (submitted) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-6">
        <div className="text-center max-w-lg">
          <CheckCircle size={64} className="text-green-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-3">Nice work!</h1>
          <div className="bg-white/10 rounded-2xl p-5 mb-3 text-left">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Your Fact</div>
            <p className="text-white text-lg">{fact}</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-5 text-left">
            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">Your Opinion</div>
            <p className="text-white text-lg">{opinion}</p>
          </div>
          <p className="text-white/50 text-sm mt-4">Waiting for teacher to continue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex flex-col overflow-y-auto">
      <div className="flex-1 p-4 max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-white">Fact or Opinion?</h1>
          <p className="text-indigo-200 text-sm">Think about the artist you picked. Write one of each.</p>
        </div>

        {/* Examples */}
        <div className="bg-white/5 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={16} className="text-amber-400" />
            <span className="text-sm font-bold text-amber-400">Examples</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {EXAMPLES.map((ex, i) => (
              <div key={i} className={`rounded-lg p-2.5 ${ex.type === 'fact' ? 'bg-blue-500/15 border border-blue-500/20' : 'bg-purple-500/15 border border-purple-500/20'}`}>
                <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${ex.type === 'fact' ? 'text-blue-400' : 'text-purple-400'}`}>
                  {ex.type}
                </div>
                <p className="text-white text-xs leading-relaxed mb-1">&ldquo;{ex.text}&rdquo;</p>
                <p className={`text-[10px] italic ${ex.type === 'fact' ? 'text-blue-300/60' : 'text-purple-300/60'}`}>{ex.why}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Writing areas */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-sm font-bold text-blue-400 mb-1">
              Write one FACT about your artist
            </label>
            <p className="text-[11px] text-white/40 mb-1.5">Something you could prove with data or evidence — numbers, dates, or events.</p>
            <textarea
              value={fact}
              onChange={e => setFact(e.target.value)}
              placeholder="e.g. They have released 2 EPs since 2023..."
              className="w-full h-20 bg-white/10 border border-blue-500/30 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-purple-400 mb-1">
              Write one OPINION about your artist
            </label>
            <p className="text-[11px] text-white/40 mb-1.5">A personal judgment — what you think or feel about their music. Not everyone would agree.</p>
            <textarea
              value={opinion}
              onChange={e => setOpinion(e.target.value)}
              placeholder="e.g. I think their beats are the catchiest in the genre..."
              className="w-full h-20 bg-white/10 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full py-3 rounded-xl text-lg font-bold transition-all ${
            canSubmit
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:scale-[1.02] active:scale-95'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
          }`}
        >
          {canSubmit ? 'Submit' : 'Write at least a sentence for each'}
        </button>
      </div>
    </div>
  );
};

export default FactOpinionStudentView;
