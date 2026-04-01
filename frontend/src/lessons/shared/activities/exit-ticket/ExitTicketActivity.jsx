// Exit Ticket Activity — student-facing quiz + reflection
// Multiple choice questions + open response, saves to Firebase

import React, { useState, useCallback } from 'react';
import { Check, ChevronRight, Send } from 'lucide-react';
import { saveStudentWork } from '../../../../utils/studentWorkStorage';

const ExitTicketActivity = ({ questions = [], onComplete, isSessionMode = false, storageKey = 'exit-ticket' }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const mcQuestions = questions.filter(q => q.type === 'multiple-choice');
  const openQuestions = questions.filter(q => q.type === 'open-response');
  const allAnswered = questions.every(q =>
    q.type === 'multiple-choice' ? answers[q.id] != null : (answers[q.id] || '').trim().length > 0
  );

  const handleMCSelect = useCallback((questionId, option) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  }, [submitted]);

  const handleOpenChange = useCallback((questionId, value) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, [submitted]);

  const handleSubmit = useCallback(() => {
    if (!allAnswered || submitted) return;
    setSubmitted(true);
    setShowResults(true);

    // Calculate score from MC questions
    const mcCorrect = mcQuestions.filter(q => answers[q.id] === q.correctAnswer).length;

    // Save to Firebase
    const data = {
      answers,
      mcCorrect,
      mcTotal: mcQuestions.length,
      submittedAt: new Date().toISOString(),
    };
    saveStudentWork(storageKey, data);

    if (onComplete) {
      setTimeout(() => onComplete(data), 3000);
    }
  }, [allAnswered, submitted, answers, mcQuestions, storageKey, onComplete]);

  if (showResults) {
    const mcCorrect = mcQuestions.filter(q => answers[q.id] === q.correctAnswer).length;
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden text-center">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-6">
            <div className="text-5xl mb-2">{mcCorrect === mcQuestions.length ? '100%' : `${Math.round((mcCorrect / mcQuestions.length) * 100)}%`}</div>
            <h2 className="text-2xl font-black text-white">Exit Ticket Complete</h2>
            <p className="text-white/80 text-sm mt-1">{mcCorrect}/{mcQuestions.length} correct</p>
          </div>
          <div className="px-6 py-5 space-y-3">
            {mcQuestions.map(q => {
              const isCorrect = answers[q.id] === q.correctAnswer;
              return (
                <div key={q.id} className={`flex items-center gap-3 p-3 rounded-xl ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                    {isCorrect ? <Check size={14} className="text-white" /> : <span className="text-white text-xs font-bold">X</span>}
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-700">{q.question}</p>
                    {!isCorrect && <p className="text-xs text-green-700 font-semibold mt-0.5">Answer: {q.correctAnswer}</p>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-6 pb-5">
            <p className="text-gray-500 text-sm">Your responses have been saved.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <h1 className="text-xl font-black text-white">Exit Ticket</h1>
        <div className="text-white/70 text-sm">
          {Object.keys(answers).length}/{questions.length} answered
        </div>
      </div>

      {/* Questions */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-xl mx-auto space-y-6">
          {/* Multiple Choice */}
          {mcQuestions.map((q, qi) => (
            <div key={q.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <span className="text-sm font-bold text-purple-600">Question {qi + 1}</span>
                <p className="text-lg text-gray-800 font-semibold mt-1">{q.question}</p>
              </div>
              <div className="p-3 space-y-2">
                {q.options.map(option => {
                  const selected = answers[q.id] === option;
                  return (
                    <button
                      key={option}
                      onClick={() => handleMCSelect(q.id, option)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all ${
                        selected
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-gray-50 text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Open Response */}
          {openQuestions.map((q, qi) => (
            <div key={q.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <span className="text-sm font-bold text-purple-600">Reflection {qi + 1}</span>
                <p className="text-lg text-gray-800 font-semibold mt-1">{q.question}</p>
              </div>
              <div className="p-4">
                <textarea
                  value={answers[q.id] || ''}
                  onChange={e => handleOpenChange(q.id, e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full h-24 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-gray-800 text-base resize-none"
                />
              </div>
            </div>
          ))}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className={`w-full py-4 rounded-2xl text-lg font-bold transition-all flex items-center justify-center gap-2 ${
              allAnswered
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send size={20} /> Submit Exit Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitTicketActivity;
