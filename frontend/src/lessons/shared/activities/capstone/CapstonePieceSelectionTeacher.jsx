// File: /src/lessons/shared/activities/capstone/CapstonePieceSelectionTeacher.jsx
// Capstone Piece Selection - Teacher View (Projector/Presentation)
// Displays all 5 pieces in a beautiful grid while students select on their Chromebooks.

import React from 'react';
import { Music, Clock, Users } from 'lucide-react';
import { CAPSTONE_PIECES } from '../../../listening-lab/lesson4/lesson4Config';

// Student Activity Time Banner
const ActivityBanner = () => (
  <div
    className="w-full flex items-center justify-center"
    style={{
      height: '64px',
      backgroundColor: '#0d9488',
      flexShrink: 0
    }}
  >
    <span className="text-white font-bold" style={{ fontSize: '28px' }}>
      STUDENT ACTIVITY
    </span>
  </div>
);

// ============ PIECE DISPLAY CARD ============
const PieceDisplayCard = ({ piece, selectionCount }) => (
  <div
    className="rounded-2xl border border-white/10 overflow-hidden transition-all"
    style={{ backgroundColor: `${piece.color}10` }}
  >
    {/* Color accent bar */}
    <div className="h-2" style={{ backgroundColor: piece.color }} />

    <div className="p-5">
      {/* Top row: emoji + title */}
      <div className="flex items-start gap-4 mb-3">
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0"
          style={{ backgroundColor: `${piece.color}25` }}
        >
          {piece.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white leading-tight">
            {piece.title}
          </h3>
          <p className="text-sm text-gray-400 mt-0.5">
            {piece.composer} ({piece.year})
          </p>
        </div>
        {/* Selection count badge (if provided) */}
        {selectionCount > 0 && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold text-white shrink-0"
            style={{ backgroundColor: piece.color }}
          >
            <Users size={14} />
            {selectionCount}
          </div>
        )}
      </div>

      {/* Vibe description */}
      <p className="text-base font-medium mb-3" style={{ color: piece.color }}>
        {piece.vibe}
      </p>

      {/* Meta row */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5 text-sm text-gray-400">
          <Clock size={14} />
          <span>{piece.duration}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-400">
          <Music size={14} />
          <span className="font-semibold text-white">{piece.formLetters}</span>
        </div>
      </div>

      {/* Section pills */}
      <div className="flex gap-1.5">
        {piece.sections.map((section) => (
          <div
            key={section.id}
            className="flex-1 rounded-lg py-1.5 text-center"
            style={{ backgroundColor: `${section.color}25` }}
          >
            <div className="text-xs font-bold text-white">{section.label}</div>
            <div className="text-[10px] text-gray-500 truncate px-1">{section.sectionLabel}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ============ MAIN COMPONENT ============
const CapstonePieceSelectionTeacher = ({ sessionData }) => {
  // Try to get selection counts from session data
  const selectionCounts = {};
  if (sessionData?.studentsJoined) {
    Object.values(sessionData.studentsJoined).forEach((student) => {
      const pieceId = student?.selectedPiece || student?.capstonePiece;
      if (pieceId) {
        selectionCounts[pieceId] = (selectionCounts[pieceId] || 0) + 1;
      }
    });
  }

  const totalSelections = Object.values(selectionCounts).reduce((sum, n) => sum + n, 0);
  const totalStudents = sessionData?.studentsJoined
    ? Object.keys(sessionData.studentsJoined).length
    : 0;

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-indigo-950/30 to-gray-900">
      <ActivityBanner />

      {/* Title Area */}
      <div className="text-center pt-5 pb-3 px-6 shrink-0">
        <h1 className="text-5xl font-bold text-white mb-2">Pick Your Piece!</h1>
        <p className="text-xl text-gray-400">
          Listen to previews on your Chromebook, then select one
        </p>
        {totalStudents > 0 && (
          <div className="flex items-center justify-center gap-2 mt-2 text-base text-gray-500">
            <Users size={16} />
            <span>
              {totalSelections > 0
                ? `${totalSelections} of ${totalStudents} students have chosen`
                : `${totalStudents} students connected`
              }
            </span>
          </div>
        )}
      </div>

      {/* Piece Grid - 3 top, 2 bottom centered */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="max-w-6xl mx-auto">
          {/* Top row - 3 pieces */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {CAPSTONE_PIECES.slice(0, 3).map((piece) => (
              <PieceDisplayCard
                key={piece.id}
                piece={piece}
                selectionCount={selectionCounts[piece.id] || 0}
              />
            ))}
          </div>
          {/* Bottom row - 2 pieces centered */}
          <div className="grid grid-cols-3 gap-4">
            <div /> {/* empty spacer for centering */}
            {CAPSTONE_PIECES.slice(3, 5).map((piece) => (
              <PieceDisplayCard
                key={piece.id}
                piece={piece}
                selectionCount={selectionCounts[piece.id] || 0}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapstonePieceSelectionTeacher;
