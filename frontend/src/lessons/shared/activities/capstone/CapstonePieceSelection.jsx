// File: /src/lessons/shared/activities/capstone/CapstonePieceSelection.jsx
// Capstone Piece Selection - Student View
// Students browse 5 classical pieces, listen to preview clips, and select one for their capstone project.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Check, ChevronRight, ChevronDown, ChevronUp, Clock, Music, Sparkles } from 'lucide-react';
import { CAPSTONE_PIECES, getPieceById } from '../../../listening-lab/lesson4/lesson4Config';

const STORAGE_KEY = 'listening-lab-lesson4-selected-piece';

// ============ PIECE CARD ============
const PieceCard = ({ piece, isExpanded, isSelected, onToggleExpand, onSelect, onPlayPreview, isPlaying, playingPieceId }) => {
  const isThisPlaying = isPlaying && playingPieceId === piece.id;

  return (
    <div
      className={`rounded-xl border-2 transition-all duration-300 overflow-hidden cursor-pointer ${
        isSelected
          ? 'border-green-400 shadow-lg shadow-green-500/20'
          : isExpanded
            ? 'border-white/30 shadow-lg'
            : 'border-white/10 hover:border-white/25'
      }`}
      style={{ backgroundColor: isSelected ? `${piece.color}15` : 'rgba(0,0,0,0.3)' }}
    >
      {/* Card Header - always visible */}
      <button
        onClick={() => onToggleExpand(piece.id)}
        className="w-full text-left p-4 flex items-start gap-4"
      >
        {/* Emoji + Number */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: `${piece.color}30` }}
        >
          {piece.emoji}
        </div>

        {/* Title + Meta */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white leading-tight truncate">
            {piece.title}
          </h3>
          <p className="text-sm text-gray-400 mt-0.5">{piece.composer} ({piece.year})</p>
          <p className="text-sm mt-1" style={{ color: piece.color }}>
            {piece.vibe}
          </p>
        </div>

        {/* Duration + Expand */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock size={12} />
            <span>{piece.duration}</span>
          </div>
          {isSelected ? (
            <Check className="w-5 h-5 text-green-400" />
          ) : isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-white/10">
          {/* Form */}
          <div className="flex items-center gap-2 mt-3 mb-3">
            <Music size={14} className="text-gray-400" />
            <span className="text-sm text-gray-300">
              Form: <span className="font-semibold text-white">{piece.formLetters}</span>
              <span className="text-gray-500 ml-1">({piece.form})</span>
            </span>
          </div>

          {/* Key Features */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Key Features</p>
            <ul className="space-y-1">
              {piece.keyFeatures.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <Sparkles size={12} className="mt-1 shrink-0" style={{ color: piece.color }} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sections Preview */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Sections</p>
            <div className="flex gap-1">
              {piece.sections.map((section) => (
                <div
                  key={section.id}
                  className="flex-1 rounded-lg py-1.5 px-2 text-center"
                  style={{ backgroundColor: `${section.color}30` }}
                >
                  <div className="text-xs font-bold text-white">{section.label}</div>
                  <div className="text-[10px] text-gray-400 truncate">{section.sectionLabel}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlayPreview(piece);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                isThisPlaying
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              {isThisPlaying ? (
                <>
                  <Pause size={16} />
                  Stop Preview
                </>
              ) : (
                <>
                  <Play size={16} />
                  Listen
                </>
              )}
            </button>

            {!isSelected && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(piece);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm text-white transition-all"
                style={{ backgroundColor: piece.color }}
              >
                <Check size={16} />
                Select This Piece
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============ CONFIRMATION SCREEN ============
const ConfirmationScreen = ({ piece, onChangeMind, onConfirm }) => (
  <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Big Emoji */}
        <div
          className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl mx-auto mb-6"
          style={{ backgroundColor: `${piece.color}30` }}
        >
          {piece.emoji}
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Great Choice!</h1>
        <div className="w-16 h-1 mx-auto mb-4" style={{ backgroundColor: piece.color }}></div>

        <h2 className="text-xl font-semibold text-white mb-1">{piece.title}</h2>
        <p className="text-gray-400 mb-2">{piece.composer} ({piece.year})</p>
        <p className="text-sm mb-6" style={{ color: piece.color }}>{piece.vibe}</p>

        {/* Piece Details */}
        <div className="bg-black/30 rounded-xl p-4 mb-6 text-left">
          <div className="flex items-center gap-2 mb-3">
            <Music size={14} className="text-gray-400" />
            <span className="text-sm text-gray-300">
              Form: <span className="font-semibold text-white">{piece.formLetters}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-gray-400" />
            <span className="text-sm text-gray-300">
              Duration: <span className="font-semibold text-white">{piece.duration}</span>
            </span>
          </div>
          <div className="text-sm text-gray-300">
            <span className="text-gray-500">{piece.sections.length} sections:</span>{' '}
            {piece.sections.map(s => s.label).join(' - ')}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg text-white transition-all"
            style={{ backgroundColor: piece.color }}
          >
            <Check size={20} />
            Confirm Selection
            <ChevronRight size={20} />
          </button>
          <button
            onClick={onChangeMind}
            className="w-full px-6 py-3 rounded-xl font-semibold text-sm text-gray-400 bg-gray-800 hover:bg-gray-700 transition-all"
          >
            Pick a Different Piece
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ============ MAIN COMPONENT ============
const CapstonePieceSelection = ({ onComplete, isSessionMode }) => {
  const [expandedPieceId, setExpandedPieceId] = useState(null);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingPieceId, setPlayingPieceId] = useState(null);
  const audioRef = useRef(null);

  // Check for existing selection on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.pieceId) {
          const piece = getPieceById(parsed.pieceId);
          if (piece) {
            setSelectedPiece(piece);
            setConfirmed(true);
          }
        }
      }
    } catch (e) {
      console.error('Error loading saved selection:', e);
    }
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleToggleExpand = useCallback((pieceId) => {
    setExpandedPieceId(prev => prev === pieceId ? null : pieceId);
  }, []);

  const handlePlayPreview = useCallback((piece) => {
    // If already playing this piece, stop it
    if (isPlaying && playingPieceId === piece.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
      setPlayingPieceId(null);
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Use audioPath (the preview may not exist yet)
    const path = piece.previewPath || piece.audioPath;
    audioRef.current = new Audio(path);
    audioRef.current.onended = () => {
      setIsPlaying(false);
      setPlayingPieceId(null);
    };
    audioRef.current.onerror = () => {
      // If preview fails, try main audio
      if (path === piece.previewPath && piece.audioPath) {
        audioRef.current = new Audio(piece.audioPath);
        audioRef.current.onended = () => {
          setIsPlaying(false);
          setPlayingPieceId(null);
        };
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setPlayingPieceId(piece.id);
          })
          .catch(err => console.error('Error playing audio:', err));
      }
    };
    audioRef.current.play()
      .then(() => {
        setIsPlaying(true);
        setPlayingPieceId(piece.id);
      })
      .catch(err => console.error('Error playing audio:', err));
  }, [isPlaying, playingPieceId]);

  const handleSelectPiece = useCallback((piece) => {
    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      setPlayingPieceId(null);
    }
    setSelectedPiece(piece);
    setConfirmed(false);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedPiece) return;

    // Save to localStorage
    const selection = {
      pieceId: selectedPiece.id,
      selectedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
    setConfirmed(true);

    // Notify parent
    if (onComplete) {
      onComplete({ pieceId: selectedPiece.id, piece: selectedPiece });
    }
  }, [selectedPiece, onComplete]);

  const handleChangeMind = useCallback(() => {
    setSelectedPiece(null);
    setConfirmed(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // ---- CONFIRMATION SCREEN ----
  if (selectedPiece && !confirmed) {
    return (
      <ConfirmationScreen
        piece={selectedPiece}
        onChangeMind={handleChangeMind}
        onConfirm={handleConfirm}
      />
    );
  }

  // ---- ALREADY CONFIRMED ----
  if (selectedPiece && confirmed) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-500/20">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Piece Selected!</h1>
            <div className="w-16 h-1 mx-auto mb-6" style={{ backgroundColor: selectedPiece.color }}></div>

            <div className="bg-black/30 rounded-xl p-6 mb-6">
              <div className="text-4xl mb-3">{selectedPiece.emoji}</div>
              <h2 className="text-xl font-bold text-white mb-1">{selectedPiece.title}</h2>
              <p className="text-gray-400">{selectedPiece.composer}</p>
              <p className="text-sm mt-2" style={{ color: selectedPiece.color }}>{selectedPiece.vibe}</p>
            </div>

            <p className="text-gray-400 text-sm mb-6">
              Watch the main screen for next steps.
            </p>

            <button
              onClick={handleChangeMind}
              className="px-6 py-3 rounded-xl font-semibold text-sm text-gray-400 bg-gray-800 hover:bg-gray-700 transition-all"
            >
              Change My Selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- PIECE BROWSING ----
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-black/30 py-4 px-6 shrink-0">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Pick Your Piece</h1>
          <p className="text-sm text-gray-400 mt-1">Listen to previews, then select one for your Listening Journey</p>
        </div>
      </div>

      {/* Scrollable Card Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {CAPSTONE_PIECES.map((piece) => (
            <PieceCard
              key={piece.id}
              piece={piece}
              isExpanded={expandedPieceId === piece.id}
              isSelected={false}
              onToggleExpand={handleToggleExpand}
              onSelect={handleSelectPiece}
              onPlayPreview={handlePlayPreview}
              isPlaying={isPlaying}
              playingPieceId={playingPieceId}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CapstonePieceSelection;
