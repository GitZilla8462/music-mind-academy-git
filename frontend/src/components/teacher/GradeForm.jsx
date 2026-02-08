// Grade Form — Google Classroom Style
// src/components/teacher/GradeForm.jsx
// Points input always visible. Rubric is a collapsible calculator that fills points.
// Auto-saves on blur/Enter. Teacher can override rubric-calculated grade anytime.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, ChevronDown, ChevronRight, Loader2, Settings, Plus, Minus, Trash2, BookOpen } from 'lucide-react';
import { gradeSubmission } from '../../firebase/grades';
import { saveRubricTemplate, getRubricTemplates, deleteRubricTemplate } from '../../firebase/rubrics';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';

const QUICK_FEEDBACK = [
  { id: 'great-work', label: 'Great work!', positive: true },
  { id: 'creative', label: 'Creative choices', positive: true },
  { id: 'good-effort', label: 'Good effort', positive: true },
  { id: 'needs-variety', label: 'More variety', positive: false },
  { id: 'incomplete', label: 'Incomplete', positive: false },
  { id: 'revise', label: 'Please revise', positive: false }
];

// Performance levels — percentage of each criterion's max points
const LEVELS = [
  { title: 'Gold', pct: 1.0, color: 'bg-yellow-500 text-white ring-yellow-300' },
  { title: 'Silver', pct: 0.75, color: 'bg-gray-400 text-white ring-gray-300' },
  { title: 'Bronze', pct: 0.5, color: 'bg-amber-700 text-white ring-amber-400' },
  { title: 'Grey', pct: 0.25, color: 'bg-gray-300 text-gray-600 ring-gray-200' }
];

const DEFAULT_CRITERIA = [
  { name: 'Creativity' },
  { name: 'Accuracy' },
  { name: 'Effort' },
  { name: 'Completion' }
];

const GradeForm = ({ student, lesson, activity, classId, currentGrade, submission, onSave, compact = false, maxPointsProp, onMaxPointsChange }) => {
  const { user } = useFirebaseAuth();
  const effectiveUid = student?.studentUid || (student?.seatNumber != null ? `seat-${student.seatNumber}` : null);

  // Grade state
  const [points, setPoints] = useState('');
  const [maxPoints, setMaxPoints] = useState('100');
  const [selectedFeedback, setSelectedFeedback] = useState([]);
  const [comment, setComment] = useState('');

  // Rubric state
  const [showRubric, setShowRubric] = useState(false);
  const [criteria, setCriteria] = useState(DEFAULT_CRITERIA.map(c => ({ ...c, selectedLevel: null, pointsOverride: null })));
  const [editingRubric, setEditingRubric] = useState(false);

  // Templates
  const [savedRubrics, setSavedRubrics] = useState([]);
  const [rubricName, setRubricName] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  // UI state
  const [showComment, setShowComment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveTimerRef = useRef(null);
  const savedTimerRef = useRef(null);

  // Load saved rubric templates
  useEffect(() => {
    if (user?.uid) {
      getRubricTemplates(user.uid).then(setSavedRubrics).catch(console.error);
    }
  }, [user?.uid]);

  // Reset form when student changes
  useEffect(() => {
    const g = currentGrade;
    setPoints(g?.points?.toString() || '');
    setMaxPoints(g?.maxPoints?.toString() || maxPointsProp || '100');
    setSelectedFeedback(g?.quickFeedback || []);
    setComment(g?.feedback || '');
    setSaved(false);
    setSaving(false);
    setShowComment(!!g?.feedback);

    if (g?.rubricCriteria?.length) {
      setCriteria(g.rubricCriteria.map(c => ({
        name: c.name,
        selectedLevel: c.selectedLevel ?? null,
        pointsOverride: c.pointsOverride ?? null
      })));
      setShowRubric(true);
    } else {
      setCriteria(DEFAULT_CRITERIA.map(c => ({ ...c, selectedLevel: null, pointsOverride: null })));
    }

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
  }, [currentGrade, effectiveUid, lesson?.id]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  // Sync maxPoints from parent (e.g., teacher changed it for another student)
  useEffect(() => {
    if (maxPointsProp && maxPointsProp !== maxPoints) {
      setMaxPoints(maxPointsProp);
    }
  }, [maxPointsProp]);

  // Calculate point value for a level in a criterion
  const getLevelPoints = useCallback((levelIdx) => {
    const maxPts = parseInt(maxPoints, 10) || 100;
    const perCriterion = maxPts / criteria.length;
    return Math.round(perCriterion * LEVELS[levelIdx].pct);
  }, [maxPoints, criteria.length]);

  // Get effective points for a criterion (override or calculated from level)
  const getCriterionPoints = useCallback((c) => {
    if (c.selectedLevel === null) return 0;
    if (c.pointsOverride !== null) return c.pointsOverride;
    const maxPts = parseInt(maxPoints, 10) || 100;
    const perCriterion = maxPts / criteria.length;
    return Math.round(perCriterion * LEVELS[c.selectedLevel].pct);
  }, [maxPoints, criteria.length]);

  // Calculate rubric total
  const getRubricTotal = useCallback((crit) => {
    const allScored = crit.every(c => c.selectedLevel !== null);
    if (!allScored) return null;
    return crit.reduce((sum, c) => sum + getCriterionPoints(c), 0);
  }, [getCriterionPoints]);

  // Auto-save
  const doSave = useCallback(async (overrides = {}) => {
    const pts = parseInt(overrides.points ?? points, 10);
    if (isNaN(pts) || !effectiveUid) return;

    const maxPts = parseInt(overrides.maxPoints ?? maxPoints, 10) || 100;
    const currentCriteria = overrides.criteria ?? criteria;
    const currentFeedback = overrides.selectedFeedback ?? selectedFeedback;
    const currentComment = overrides.comment ?? comment;

    setSaving(true);
    setSaved(false);

    try {
      const gradeData = {
        type: 'points',
        points: pts,
        maxPoints: maxPts,
        grade: `${pts}/${maxPts}`,
        quickFeedback: currentFeedback,
        feedback: currentComment || null,
        rubricCriteria: currentCriteria.map((c) => ({
          name: c.name,
          selectedLevel: c.selectedLevel,
          pointsOverride: c.pointsOverride ?? null,
          levelPoints: c.selectedLevel !== null
            ? (c.pointsOverride !== null ? c.pointsOverride : Math.round((maxPts / currentCriteria.length) * LEVELS[c.selectedLevel].pct))
            : 0
        })),
        activityId: activity?.id || null,
        activityType: activity?.type || 'composition'
      };

      const result = await gradeSubmission(classId, effectiveUid, lesson.id, gradeData, user.uid);
      setSaved(true);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSaved(false), 2000);
      onSave(effectiveUid, lesson.id, result);
    } catch (err) {
      console.error('Error saving grade:', err);
    } finally {
      setSaving(false);
    }
  }, [points, maxPoints, criteria, selectedFeedback, comment, effectiveUid, classId, lesson, activity, user, onSave]);

  // Points blur → save
  const handlePointsBlur = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (points) doSave();
  };

  // Feedback toggle → save
  const toggleFeedback = (id) => {
    const updated = selectedFeedback.includes(id)
      ? selectedFeedback.filter(f => f !== id)
      : [...selectedFeedback, id];
    setSelectedFeedback(updated);
    if (points) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => doSave({ selectedFeedback: updated }), 500);
    }
  };

  // Comment blur → save
  const handleCommentBlur = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (points) doSave({ comment });
  };

  // Rubric level click → fill points → save
  const selectLevel = (criterionIdx, levelIdx) => {
    const newCriteria = criteria.map((c, i) =>
      i === criterionIdx ? { ...c, selectedLevel: levelIdx, pointsOverride: null } : c
    );
    setCriteria(newCriteria);

    const total = getRubricTotal(newCriteria);
    if (total !== null) {
      setPoints(total.toString());
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      doSave({ points: total.toString(), criteria: newCriteria });
    }
  };

  // +/- adjustment on a criterion
  const adjustCriterionPoints = (criterionIdx, delta) => {
    const c = criteria[criterionIdx];
    if (c.selectedLevel === null) return;
    const currentPts = getCriterionPoints(c);
    const newPts = Math.max(0, currentPts + delta);
    const maxPts = parseInt(maxPoints, 10) || 100;
    const perCriterion = Math.round(maxPts / criteria.length);
    const clamped = Math.min(newPts, perCriterion);

    const newCriteria = criteria.map((cr, i) =>
      i === criterionIdx ? { ...cr, pointsOverride: clamped } : cr
    );
    setCriteria(newCriteria);

    const total = getRubricTotal(newCriteria);
    if (total !== null) {
      setPoints(total.toString());
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      doSave({ points: total.toString(), criteria: newCriteria });
    }
  };

  // Rubric editing
  const updateCriterionName = (idx, name) => {
    setCriteria(prev => prev.map((c, i) => i === idx ? { ...c, name } : c));
  };

  const addCriterion = () => {
    if (criteria.length >= 6) return;
    setCriteria(prev => [...prev, { name: '', selectedLevel: null, pointsOverride: null }]);
  };

  const removeCriterion = (idx) => {
    if (criteria.length <= 1) return;
    setCriteria(prev => prev.filter((_, i) => i !== idx));
  };

  // Template save/load
  const handleSaveTemplate = async () => {
    if (!rubricName.trim()) return;
    try {
      const template = await saveRubricTemplate(user.uid, {
        name: rubricName.trim(),
        categories: criteria.map(c => ({ name: c.name }))
      });
      setSavedRubrics(prev => [...prev, template]);
      setRubricName('');
    } catch (err) {
      console.error('Error saving rubric template:', err);
    }
  };

  const loadTemplate = (template) => {
    setCriteria(template.categories.map(c => ({ name: c.name, selectedLevel: null, pointsOverride: null })));
    setShowTemplates(false);
  };

  const rubricTotal = getRubricTotal(criteria);

  return (
    <div className="space-y-4">
      {/* Grade Input — always visible */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          onBlur={handlePointsBlur}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          placeholder="--"
          min="0"
          className="w-20 px-3 py-2.5 border-2 border-gray-300 rounded-lg text-center text-xl font-bold text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <span className="text-gray-400 text-xl">/</span>
        <input
          type="number"
          value={maxPoints}
          onChange={(e) => setMaxPoints(e.target.value)}
          onBlur={() => {
            onMaxPointsChange?.(maxPoints);
            if (points) doSave({ maxPoints });
          }}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          min="1"
          className="w-20 px-3 py-2.5 border border-gray-200 rounded-lg text-center text-xl font-semibold text-gray-500 focus:outline-none focus:border-blue-500"
        />
        <div className="flex items-center gap-1 ml-1">
          {saving && <Loader2 size={16} className="text-blue-500 animate-spin" />}
          {saved && <Check size={16} className="text-green-500" />}
        </div>
      </div>

      {/* Rubric — collapsible calculator */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setShowRubric(!showRubric)}
          className="w-full px-3 py-2 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-medium text-gray-700">Rubric</span>
          <div className="flex items-center gap-2">
            {rubricTotal !== null && (
              <span className="text-xs text-gray-500 font-medium">{rubricTotal}/{maxPoints}</span>
            )}
            {showRubric ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
          </div>
        </button>

        {showRubric && (
          <div className="p-3">
            {!editingRubric ? (
              <div className="space-y-1">
                {/* Header row */}
                <div className="flex items-center gap-1">
                  <div className="w-20 flex-shrink-0" />
                  {LEVELS.map((level, i) => (
                    <div key={i} className="flex-1 text-[9px] text-center text-gray-400 font-medium">
                      {level.title}
                    </div>
                  ))}
                  <div className="w-16 flex-shrink-0" />
                </div>

                {/* Criterion rows */}
                {criteria.map((criterion, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <div className="w-20 flex-shrink-0 text-[11px] font-medium text-gray-600 truncate">
                      {criterion.name || `Criterion ${idx + 1}`}
                    </div>
                    {LEVELS.map((level, levelIdx) => {
                      const levelPts = getLevelPoints(levelIdx);
                      const isSelected = criterion.selectedLevel === levelIdx;
                      return (
                        <button
                          key={levelIdx}
                          onClick={() => selectLevel(idx, levelIdx)}
                          className={`flex-1 py-1 rounded text-center text-[11px] font-bold transition-all ${
                            isSelected
                              ? `${level.color} ring-1 ring-offset-1`
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {levelPts}
                        </button>
                      );
                    })}
                    <div className="w-16 flex-shrink-0 flex items-center justify-end gap-0.5">
                      {criterion.selectedLevel !== null && (
                        <>
                          <button
                            onClick={() => adjustCriterionPoints(idx, -1)}
                            className="w-4 h-4 flex items-center justify-center rounded bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                          >
                            <Minus size={8} />
                          </button>
                          <span className="text-[11px] font-bold text-gray-700 tabular-nums w-5 text-center">
                            {getCriterionPoints(criterion)}
                          </span>
                          <button
                            onClick={() => adjustCriterionPoints(idx, 1)}
                            className="w-4 h-4 flex items-center justify-center rounded bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                          >
                            <Plus size={8} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {/* Rubric total */}
                <div className="pt-1.5 mt-1 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">Total</span>
                  <span className="text-xs font-bold text-gray-800 tabular-nums">
                    {rubricTotal !== null ? rubricTotal : '--'} / {maxPoints}
                  </span>
                </div>

                {/* Edit / Templates links */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => setEditingRubric(true)}
                    className="text-[11px] text-gray-400 hover:text-gray-600 flex items-center gap-1"
                  >
                    <Settings size={10} />
                    Edit criteria
                  </button>
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="text-[11px] text-gray-400 hover:text-gray-600 flex items-center gap-1"
                  >
                    <BookOpen size={10} />
                    Templates
                  </button>
                </div>

                {/* Templates dropdown */}
                {showTemplates && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden mt-1">
                    {savedRubrics.length === 0 ? (
                      <div className="p-2 text-xs text-gray-400 text-center">No saved templates</div>
                    ) : (
                      savedRubrics.map(r => (
                        <div key={r.id} className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                          <button
                            onClick={() => loadTemplate(r)}
                            className="text-xs text-gray-700 hover:text-blue-600 text-left flex-1 truncate"
                          >
                            {r.name}
                          </button>
                          <button
                            onClick={() => {
                              deleteRubricTemplate(user.uid, r.id);
                              setSavedRubrics(prev => prev.filter(x => x.id !== r.id));
                            }}
                            className="text-gray-300 hover:text-red-500 ml-2 flex-shrink-0"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Editing view */
              <div className="space-y-2">
                {criteria.map((criterion, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={criterion.name}
                      onChange={(e) => updateCriterionName(idx, e.target.value)}
                      placeholder="Criterion name"
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                    />
                    {criteria.length > 1 && (
                      <button onClick={() => removeCriterion(idx)} className="text-gray-300 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}

                {criteria.length < 6 && (
                  <button
                    onClick={addCriterion}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Plus size={12} />
                    Add criterion
                  </button>
                )}

                {/* Save as template */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <input
                    type="text"
                    value={rubricName}
                    onChange={(e) => setRubricName(e.target.value)}
                    placeholder="Template name..."
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleSaveTemplate}
                    disabled={!rubricName.trim()}
                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>

                <button
                  onClick={() => setEditingRubric(false)}
                  className="w-full py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium text-gray-700 mt-1"
                >
                  Done editing
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Feedback Chips */}
      <div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_FEEDBACK.map(item => (
            <button
              key={item.id}
              onClick={() => toggleFeedback(item.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                selectedFeedback.includes(item.id)
                  ? item.positive
                    ? 'bg-green-100 text-green-700 ring-1 ring-green-400'
                    : 'bg-amber-100 text-amber-700 ring-1 ring-amber-400'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comment — collapsible */}
      <div>
        <button
          onClick={() => setShowComment(!showComment)}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          {showComment ? 'Hide comment' : comment ? 'Edit comment' : '+ Add comment'}
        </button>
        {showComment && (
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onBlur={handleCommentBlur}
            placeholder="Private comment for student..."
            className="w-full mt-1.5 h-16 border border-gray-200 rounded-lg p-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
          />
        )}
      </div>
    </div>
  );
};

export default GradeForm;
