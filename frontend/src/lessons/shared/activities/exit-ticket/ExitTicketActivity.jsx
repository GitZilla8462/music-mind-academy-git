// Exit Ticket Activity — one question per screen, no score shown
// Saves answers to Firebase for teacher review + student dashboard

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Send, CheckCircle } from 'lucide-react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useSession } from '../../../../context/SessionContext';
import { useStudentAuth } from '../../../../context/StudentAuthContext';
import { saveStudentWork, getClassAuthInfo, loadStudentWork } from '../../../../utils/studentWorkStorage';

const ExitTicketActivity = ({ questions = [], onComplete, isSessionMode = false, storageKey = 'exit-ticket', lessonId = null }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [teacherSaveToast, setTeacherSaveToast] = useState(false);
  const [previousSubmission, setPreviousSubmission] = useState(null);

  // Load previous submission on mount
  useEffect(() => {
    const saved = loadStudentWork(storageKey);
    if (saved?.data?.answers && saved?.data?.submittedAt) {
      setPreviousSubmission(saved.data);
    }
  }, [storageKey]);

  const { sessionCode, classCode: contextClassCode } = useSession();
  const { pinSession } = useStudentAuth();
  const urlClassCode = new URLSearchParams(window.location.search).get('classCode');
  const effectiveSessionCode = sessionCode || contextClassCode || urlClassCode;

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

  // Build save data from current answers
  const buildSaveData = useCallback((currentAnswers) => {
    const mcQuestions = questions.filter(q => q.type === 'multiple-choice');
    const mcCorrect = mcQuestions.filter(q => currentAnswers[q.id] === q.correctAnswer).length;

    return {
      answers: currentAnswers,
      questions: questions.map(q => ({
        id: q.id,
        type: q.type,
        question: q.question,
        correctAnswer: q.correctAnswer || null,
        options: q.options || null,
      })),
      mcCorrect,
      mcTotal: mcQuestions.length,
      submittedAt: new Date().toISOString(),
    };
  }, [questions]);

  // Save exit ticket data properly
  const doSave = useCallback((currentAnswers) => {
    const data = buildSaveData(currentAnswers);
    const auth = getClassAuthInfo(pinSession);

    saveStudentWork(storageKey, {
      title: 'Exit Ticket',
      emoji: '🎫',
      viewRoute: null,
      subtitle: `${data.mcCorrect}/${data.mcTotal} correct`,
      category: 'Exit Ticket',
      lessonId,
      data
    }, null, auth);
  }, [storageKey, buildSaveData, pinSession]);

  const handleSubmit = useCallback(() => {
    if (!allAnswered || submitted) return;
    setSubmitted(true);
    doSave(answers);
  }, [allAnswered, submitted, answers, doSave]);

  // Listen for teacher's "Save All" command — save whatever the student has so far
  const lastSaveCommandRef = useRef(null);
  const componentMountTimeRef = useRef(Date.now());
  const answersRef = useRef(answers);
  answersRef.current = answers;

  useEffect(() => {
    if (!effectiveSessionCode || !isSessionMode) return;

    const db = getDatabase();
    const saveCommandRef = ref(db, `sessions/${effectiveSessionCode}/saveCommand`);

    const unsubscribe = onValue(saveCommandRef, (snapshot) => {
      const saveCommand = snapshot.val();
      if (!saveCommand) return;

      if (saveCommand <= componentMountTimeRef.current) {
        lastSaveCommandRef.current = saveCommand;
        return;
      }

      if (saveCommand !== lastSaveCommandRef.current) {
        lastSaveCommandRef.current = saveCommand;
        console.log('💾 Teacher save command received for exit ticket!');

        // Save current answers (even if not all answered yet)
        const currentAnswers = answersRef.current;
        if (Object.keys(currentAnswers).length > 0) {
          doSave(currentAnswers);
        }

        setTeacherSaveToast(true);
        setTimeout(() => setTeacherSaveToast(false), 3000);
      }
    });

    return () => unsubscribe();
  }, [effectiveSessionCode, isSessionMode, doSave]);

  // Save toast modal
  const saveToastModal = teacherSaveToast && (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden text-center">
        <div className="bg-green-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white">Saving Your Work</h3>
        </div>
        <div className="p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-semibold">Your work is being saved!</p>
          <p className="text-gray-500 text-sm mt-2">You can view it anytime from your dashboard.</p>
        </div>
      </div>
    </div>
  );

  // Redirect to dashboard after submit
  const goBack = useCallback(() => {
    if (onComplete) onComplete();
    navigate('/student/home');
  }, [onComplete, navigate]);

  useEffect(() => {
    if (!submitted) return;
    const timer = setTimeout(goBack, 3000);
    return () => clearTimeout(timer);
  }, [submitted, goBack]);

  // ── Previous submission results view ──
  if (previousSubmission && !submitted && Object.keys(answers).length === 0) {
    const prev = previousSubmission;
    const qs = prev.questions || questions;
    return (
      <div className="h-screen flex flex-col bg-gray-900">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <h1 className="text-lg font-black text-white">Exit Ticket — Your Results</h1>
          {prev.mcTotal > 0 && (
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${prev.mcCorrect === prev.mcTotal ? 'bg-green-400/20 text-green-200' : 'bg-amber-400/20 text-amber-200'}`}>
              {prev.mcCorrect}/{prev.mcTotal} correct
            </span>
          )}
        </div>
        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <div className="max-w-xl mx-auto space-y-4">
            {qs.map((q, i) => {
              const answer = prev.answers[q.id];
              const isMC = q.type === 'multiple-choice';
              const isCorrect = isMC && answer === q.correctAnswer;
              return (
                <div key={q.id} className="bg-white/10 border border-white/10 rounded-xl p-4">
                  <div className="text-xs font-semibold text-purple-300 uppercase mb-1">
                    {isMC ? `Question ${i + 1}` : 'Reflection'}
                  </div>
                  <div className="text-sm font-medium text-white mb-3">{q.question}</div>
                  {isMC && q.options ? (
                    <div className="space-y-1.5">
                      {q.options.map(opt => {
                        const isSelected = answer === opt;
                        const isRight = opt === q.correctAnswer;
                        return (
                          <div key={opt} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                            isSelected && isRight ? 'bg-green-500/20 border border-green-400/40 text-green-200 font-semibold' :
                            isSelected && !isRight ? 'bg-red-500/20 border border-red-400/40 text-red-200 font-semibold' :
                            isRight ? 'bg-green-500/10 border border-green-400/20 text-green-300' :
                            'bg-white/5 text-white/40'
                          }`}>
                            {isSelected && isRight && <span>✓</span>}
                            {isSelected && !isRight && <span>✗</span>}
                            {!isSelected && isRight && <span className="text-green-400">✓</span>}
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white/5 rounded-lg px-4 py-3 text-sm text-white/80 whitespace-pre-wrap">
                      {answer || <span className="text-white/30 italic">No response</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 border-t border-white/5">
          <button
            onClick={() => navigate('/student/home')}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => setPreviousSubmission(null)}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white transition-all"
          >
            Retake Exit Ticket
          </button>
        </div>
      </div>
    );
  }

  // ── Submitted screen ──
  if (submitted) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 p-4">
        {saveToastModal}
        <div className="text-center">
          <CheckCircle size={64} className="text-emerald-400 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-2">Exit Ticket Submitted</h2>
          <p className="text-lg text-white/60">Thanks for sharing your thoughts!</p>
          <button
            onClick={goBack}
            className="mt-6 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  const questionNumber = currentIndex + 1;
  const isMC = currentQ.type === 'multiple-choice';

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {saveToastModal}
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
