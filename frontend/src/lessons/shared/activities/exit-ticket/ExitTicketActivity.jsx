// Exit Ticket Activity — one question per screen, no score shown
// Saves answers to Firebase for teacher review

import React, { useState, useCallback } from 'react';
import { ChevronRight, ChevronLeft, Send, CheckCircle } from 'lucide-react';
import { saveStudentWork } from '../../../../utils/studentWorkStorage';

const ExitTicketActivity = ({ questions = [], onComplete, isSessionMode = false, storageKey = 'exit-ticket' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const currentQ = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const isFirst = currentIndex === 0;
  const currentAnswered = currentQ?.type === 'multiple-choice'
    ? answers[currentQ.id] != null
    : (answers[currentQ?.id] || '').trim().length > 0;
  const allAnswered = questions.every(q =>
    q.type === 'multiple-choice' ? answers[q.id] != null : (answers[q.id] || '').trim().length > 0
  );

  const handleMCSelect = useCallback((option) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [currentQ.id]: option }));
  }, [submitted, currentQ]);

  const handleOpenChange = useCallback((value) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }));
  }, [submitted, currentQ]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleSubmit = useCallback(() => {
    if (!allAnswered || submitted) return;
    setSubmitted(true);

    const mcQuestions = questions.filter(q => q.type === 'multiple-choice');
    const mcCorrect = mcQuestions.filter(q => answers[q.id] === q.correctAnswer).length;

    const data = {
      answers,
      mcCorrect,
      mcTotal: mcQuestions.length,
      submittedAt: new Date().toISOString(),
    };
    saveStudentWork(storageKey, data);

    if (onComplete) {
      setTimeout(() => onComplete(data), 2000);
    }
  }, [allAnswered, submitted, answers, questions, storageKey, onComplete]);

  // ── Submitted screen ──
  if (submitted) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="text-center">
          <CheckCircle size={64} className="text-emerald-400 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-2">Exit Ticket Submitted</h2>
          <p className="text-lg text-white/60">Thanks for sharing your thoughts!</p>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  const questionNumber = currentIndex + 1;
  const isMC = currentQ.type === 'multiple-choice';

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <h1 className="text-lg font-black text-white">Exit Ticket</h1>
        <div className="flex items-center gap-3">
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {questions.map((q, i) => {
              const answered = q.type === 'multiple-choice'
                ? answers[q.id] != null
                : (answers[q.id] || '').trim().length > 0;
              return (
                <div
                  key={q.id}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === currentIndex ? 'bg-white scale-125 ring-2 ring-white/30' :
                    answered ? 'bg-white/80' : 'bg-white/25'
                  }`}
                />
              );
            })}
          </div>
          <span className="text-white/60 text-sm font-medium">{questionNumber} of {questions.length}</span>
        </div>
      </div>

      {/* Question content — centered on screen */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-xl w-full">
          {/* Question label */}
          <div className="mb-2">
            <span className="text-sm font-bold text-purple-400 uppercase tracking-wider">
              {isMC ? `Question ${questionNumber}` : 'Reflection'}
            </span>
          </div>

          {/* Question text */}
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-8 leading-tight">
            {currentQ.question}
          </h2>

          {/* MC options */}
          {isMC && (
            <div className="space-y-3">
              {currentQ.options.map((option, i) => {
                const selected = answers[currentQ.id] === option;
                const letter = String.fromCharCode(65 + i); // A, B, C, D
                return (
                  <button
                    key={option}
                    onClick={() => handleMCSelect(option)}
                    className={`w-full text-left px-5 py-4 rounded-2xl text-lg font-semibold transition-all flex items-center gap-4 ${
                      selected
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20 scale-[1.02]'
                        : 'bg-white/10 text-white/90 hover:bg-white/15 border border-white/10'
                    }`}
                  >
                    <span className={`w-9 h-9 rounded-full flex items-center justify-center text-base font-black flex-shrink-0 ${
                      selected ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50'
                    }`}>
                      {letter}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {/* Open response */}
          {!isMC && (
            <textarea
              value={answers[currentQ.id] || ''}
              onChange={e => handleOpenChange(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full h-36 px-5 py-4 rounded-2xl bg-white/10 border border-white/10 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 text-white text-lg placeholder-white/30 resize-none"
              autoFocus
            />
          )}
        </div>
      </div>

      {/* Navigation footer */}
      <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 border-t border-white/5">
        <button
          onClick={handleBack}
          className={`flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white/50 hover:text-white hover:bg-white/10 transition-all ${
            isFirst ? 'opacity-0 pointer-events-none' : ''
          }`}
        >
          <ChevronLeft size={18} /> Back
        </button>

        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-base font-black transition-all ${
              allAnswered
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            <Send size={18} /> Submit
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!currentAnswered}
            className={`flex items-center gap-1 px-5 py-2.5 rounded-xl text-base font-bold transition-all ${
              currentAnswered
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            Next <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ExitTicketActivity;
