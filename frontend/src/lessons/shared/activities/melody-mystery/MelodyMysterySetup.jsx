// MelodyMysterySetup.jsx - Mode and concept selection screen
// Step 1: Mode → Step 2: Partner Role (if partner/trio) → Step 3: Concept → Step 4: Ending → Start Creating
// Follows Beat Escape Room pattern exactly

import React, { useState, useEffect } from 'react';
import { Copy, Check, Play, Pencil, Lock, Trash2 } from 'lucide-react';
import { MODES, createRoom } from './melodyMysteryConfig';
import {
  getAllConcepts,
  getConcept,
  getStoryline,
  getConceptAssets
} from './melodyMysteryConcepts';
import { getAllStudentWork, getStudentId, saveStudentWork } from '../../../../utils/studentWorkStorage';

// Use shared background for title page
const SHARED_BG_TITLE = '/lessons/film-music-project/lesson5/concepts/vanishing-composer/bg-setup.png';

const MelodyMysterySetup = ({ onStartCreate, onJoinMystery, onJoinToCreate, onPlaySavedRoom }) => {
  const [step, setStep] = useState('mode'); // 'mode' | 'partner-role' | 'concept' | 'ending' | 'show-code' | 'join-to-create'
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [selectedEnding, setSelectedEnding] = useState(null);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [joinCode, setJoinCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [savedRooms, setSavedRooms] = useState([]);
  const [editingRoomIndex, setEditingRoomIndex] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [playCode, setPlayCode] = useState('');
  const [playError, setPlayError] = useState('');

  const modes = Object.values(MODES);
  const concepts = getAllConcepts();

  // Load saved rooms on mount
  const loadSavedRooms = () => {
    const studentId = getStudentId();
    const allWork = getAllStudentWork(studentId);
    const mysteryRooms = allWork.filter(w => w.activityId === 'melody-mystery');
    setSavedRooms(mysteryRooms);
  };

  useEffect(() => {
    loadSavedRooms();
  }, []);

  // Handle saving edited title
  const handleSaveTitle = (room, index) => {
    const conceptData = getConcept(room.data?.concept || 'vanishing-composer');
    const newTitle = editingTitle.trim() || `My ${conceptData?.name || 'Mystery'} Room`;

    saveStudentWork('melody-mystery', {
      title: newTitle,
      emoji: '',
      viewRoute: room.viewRoute,
      subtitle: room.subtitle,
      category: room.category,
      data: room.data
    });

    setEditingRoomIndex(null);
    setEditingTitle('');
    loadSavedRooms();
  };

  // Handle deleting a saved room
  const handleDeleteRoom = (room) => {
    if (!confirm('Delete this mystery? This cannot be undone.')) return;

    const studentId = getStudentId();
    const storageKey = `mma-saved-${studentId}-melody-mystery`;

    try {
      const existing = localStorage.getItem(storageKey);
      if (existing) {
        const allSaved = JSON.parse(existing);

        // Check if it's an array or single object
        if (Array.isArray(allSaved)) {
          // Filter out the room to delete (match by savedAt timestamp or viewRoute)
          const filtered = allSaved.filter(saved =>
            saved.savedAt !== room.savedAt && saved.viewRoute !== room.viewRoute
          );
          if (filtered.length > 0) {
            localStorage.setItem(storageKey, JSON.stringify(filtered));
          } else {
            localStorage.removeItem(storageKey);
          }
        } else {
          // Single object - just remove the whole key
          localStorage.removeItem(storageKey);
        }
      }
      loadSavedRooms();
    } catch (error) {
      console.error('Failed to delete room:', error);
    }
  };

  const handleModeSelect = (modeId) => {
    setSelectedMode(modeId);
    if (modeId === 'partner' || modeId === 'trio') {
      setStep('partner-role');
    } else {
      setStep('concept');
    }
  };

  // Get default ending for a concept (first available)
  const getDefaultEnding = (conceptId) => {
    const storyline = getStoryline(conceptId);
    const endingIds = Object.keys(storyline?.endings || {});
    return endingIds[0] || 'ranaway';
  };

  // Solo mode: concept select goes directly to creating (skip ending selection)
  const handleSoloConceptSelect = (concept) => {
    if (!concept.available) return;
    const defaultEnding = getDefaultEnding(concept.id);
    onStartCreate({
      concept: concept.id,
      mode: selectedMode,
      ending: defaultEnding,
      playerIndex: 0,
      shareCode: null,
    });
  };

  // Partner mode: concept select goes directly to room creation (skip ending selection)
  const handlePartnerConceptSelect = async (concept) => {
    if (!concept.available || isCreating) return;
    setIsCreating(true);
    setSelectedConcept(concept.id);
    const defaultEnding = getDefaultEnding(concept.id);
    setSelectedEnding(defaultEnding);

    try {
      const room = await createRoom({
        mode: selectedMode,
        concept: concept.id,
        ending: defaultEnding,
        melodies: {},
        status: 'creating'
      });

      setGeneratedCode(room.code);
      setPlayerIndex(0);
      setStep('show-code');
    } catch (error) {
      console.error('Failed to create room:', error);
      setJoinError('Failed to create room. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerateNewRoom = () => {
    setStep('concept');
  };

  const handleCopyCode = async () => {
    if (generatedCode) {
      try {
        await navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  // After partner room is created and code shown, continue to creator
  const handleContinueToCreate = () => {
    onStartCreate({
      concept: selectedConcept,
      mode: selectedMode,
      ending: selectedEnding,
      playerIndex: 0,
      shareCode: generatedCode,
    });
  };

  const handleBack = () => {
    if (step === 'concept') {
      if (selectedMode === 'partner' || selectedMode === 'trio') {
        setStep('partner-role');
      } else {
        setStep('mode');
        setSelectedMode(null);
      }
    } else if (step === 'show-code') {
      setStep('concept');
      setGeneratedCode('');
    } else if (step === 'partner-role' || step === 'join-to-create') {
      setStep('mode');
      setSelectedMode(null);
    } else {
      setStep('mode');
      setSelectedMode(null);
    }
  };

  const handleJoinToCreate = () => {
    if (!joinCode || joinCode.length < 4) {
      setJoinError('Enter a valid code');
      return;
    }
    setJoinError('');
    if (onJoinToCreate) {
      onJoinToCreate(joinCode, selectedMode);
    }
  };

  // Step 1: Mode Selection - Matches Beat Escape Room exactly
  if (step === 'mode') {
    return (
      <div
        className="h-full flex flex-col p-4 relative overflow-auto"
        style={{
          backgroundImage: `url(${SHARED_BG_TITLE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/50 pointer-events-none" />

        {/* Header */}
        <div className="text-center pt-4 pb-6 relative z-10">
          <h1
            className="text-5xl font-black text-white mb-2 uppercase tracking-wider"
            style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.8), 0 4px 8px rgba(0,0,0,0.5)' }}
          >
            Mystery Melody
          </h1>
          <p className="text-xl text-purple-200">
            Create melody puzzles for your partner to solve!
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center relative z-10">
          {/* Mode Selection - Hero Section */}
          <div className="w-full max-w-3xl mb-8">
            <h2 className="text-center text-2xl font-bold text-white mb-6"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              How are you working today?
            </h2>

            <div className="flex gap-4 justify-center">
              {modes.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  className="group bg-gray-800/90 hover:bg-gray-700/90 border-2 border-gray-600 hover:border-purple-500 rounded-xl p-4 w-32 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30"
                >
                  <div className="text-lg font-bold text-white mb-1">{mode.label}</div>
                  <div className="text-purple-400 font-semibold text-sm">
                    {mode.totalMelodies} melodies
                  </div>
                  {mode.perPerson < mode.totalMelodies && (
                    <div className="text-gray-400 text-xs mt-1">
                      ({mode.perPerson} each)
                    </div>
                  )}
                </button>
              ))}

              {/* Play Someone Else's Mystery */}
              <div className="bg-gray-800/90 border-2 border-gray-600 rounded-xl p-4 w-40">
                <div className="text-sm font-bold text-white mb-1">Play Someone Else's Mystery</div>
                <div className="text-gray-400 text-xs mb-2">Enter their code:</div>
                <input
                  type="text"
                  value={playCode}
                  onChange={(e) => {
                    setPlayCode(e.target.value.toUpperCase());
                    setPlayError('');
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && playCode.length >= 4) {
                      onJoinMystery?.(playCode);
                    }
                  }}
                  placeholder="CODE"
                  maxLength={6}
                  className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-sm font-mono tracking-widest uppercase focus:outline-none focus:border-green-500 mb-2"
                />
                {playError && (
                  <div className="text-red-400 text-xs mb-1">{playError}</div>
                )}
                <button
                  onClick={() => {
                    if (playCode.length >= 4) {
                      onJoinMystery?.(playCode);
                    } else {
                      setPlayError('Enter a valid code');
                    }
                  }}
                  disabled={playCode.length < 4}
                  className={`w-full px-3 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1 ${
                    playCode.length >= 4
                      ? 'bg-green-600 hover:bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Play size={14} />
                  Join
                </button>
              </div>
            </div>
          </div>

          {/* Saved Rooms Section */}
          {savedRooms.length > 0 && (
            <div className="w-full max-w-4xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-px bg-gray-600" />
                <h3 className="text-lg font-semibold text-gray-300">YOUR MYSTERIES</h3>
                <div className="flex-1 h-px bg-gray-600" />
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2">
                {savedRooms.map((room, index) => {
                  const conceptData = getConcept(room.data?.concept || 'vanishing-composer');
                  const defaultTitle = `My ${conceptData?.name || 'Mystery'} Room`;
                  const displayTitle = room.title || defaultTitle;
                  const melodyCount = room.data?.melodies ? Object.keys(room.data.melodies).length : 0;
                  const isEditing = editingRoomIndex === index;

                  return (
                    <div
                      key={index}
                      className="bg-gray-800/90 rounded-xl p-4 border border-gray-600 min-w-[200px] flex-shrink-0"
                    >
                      {isEditing ? (
                        <div className="mb-3">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSaveTitle(room, index)}
                            onBlur={() => handleSaveTitle(room, index)}
                            autoFocus
                            placeholder={defaultTitle}
                            className="w-full px-2 py-1 bg-gray-700 border border-purple-500 rounded text-white text-sm focus:outline-none"
                          />
                        </div>
                      ) : (
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-white font-semibold text-sm leading-tight pr-2">
                            {displayTitle}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingRoomIndex(index);
                                setEditingTitle(room.title || '');
                              }}
                              className="text-gray-400 hover:text-purple-400 transition-colors p-1"
                              title="Edit title"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteRoom(room)}
                              className="text-gray-400 hover:text-red-400 transition-colors p-1"
                              title="Delete mystery"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="text-gray-400 text-xs mb-3">
                        {melodyCount} melodies • {conceptData?.name || 'Mystery'}
                      </div>
                      <button
                        onClick={() => onPlaySavedRoom?.(room)}
                        className="w-full px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <Play size={16} />
                        Play
                      </button>
                      {room.data?.shareCode && (
                        <div className="text-center text-gray-400 text-xs mt-2">
                          Code: <span className="font-mono text-white">{room.data.shareCode}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Partner Role Selection (for partner/trio modes)
  if (step === 'partner-role') {
    const modeConfig = MODES[selectedMode];
    return (
      <div
        className="h-full flex flex-col items-center justify-center p-4 relative"
        style={{
          backgroundImage: `url(${SHARED_BG_TITLE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        <button
          onClick={handleBack}
          className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2 z-10"
        >
          ← Back
        </button>

        <div className="text-center mb-10 relative z-10">
          <h1 className="text-4xl font-black text-white mb-3">
            {modeConfig?.label} Mode
          </h1>
          <p className="text-lg text-purple-200">
            {modeConfig?.totalMelodies} melodies total - {modeConfig?.perPerson} melodies each
          </p>
        </div>

        <div className="w-full max-w-md space-y-4 relative z-10">
          <button
            onClick={handleGenerateNewRoom}
            className="w-full bg-gray-800/90 hover:bg-gray-700/90 border-2 border-gray-600 hover:border-purple-500 rounded-2xl p-6 transition-all duration-200 hover:scale-105"
          >
            <div className="text-xl font-bold text-white mb-1">
              Generate New Room
            </div>
            <div className="text-gray-400 text-sm">
              Pick a theme and get a code for your partner
            </div>
          </button>

          <button
            onClick={() => setStep('join-to-create')}
            className="w-full bg-gray-800/90 hover:bg-gray-700/90 border-2 border-gray-600 hover:border-green-500 rounded-2xl p-6 transition-all duration-200 hover:scale-105"
          >
            <div className="text-xl font-bold text-white mb-1">Join Partner's Room</div>
            <div className="text-gray-400 text-sm">
              Enter your partner's code
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Concept Selection (Theme) - matches "Choose Your Theme"
  if (step === 'concept') {
    const isPartnerMode = selectedMode === 'partner' || selectedMode === 'trio';
    const handleConceptClick = isPartnerMode ? handlePartnerConceptSelect : handleSoloConceptSelect;

    return (
      <div
        className="h-full flex flex-col items-center justify-center p-4 relative overflow-auto"
        style={{
          backgroundImage: `url(${SHARED_BG_TITLE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        <button
          onClick={handleBack}
          className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2 z-10"
        >
          ← Back
        </button>

        <div className="text-center mb-10 relative z-10">
          <h1 className="text-4xl font-black text-white mb-3">
            Choose Your Theme
          </h1>
          <p className="text-lg text-purple-200">
            {MODES[selectedMode]?.label} Mode - {MODES[selectedMode]?.totalMelodies} Melodies
          </p>
          {isPartnerMode && (
            <p className="text-sm text-gray-400 mt-2">
              Your partner will use the same theme
            </p>
          )}
        </div>

        {isCreating && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <div className="text-2xl mb-2">Creating Room...</div>
              <div className="text-gray-400">Please wait</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 max-w-2xl relative z-10">
          {concepts.map(concept => {
            const assets = getConceptAssets(concept.id);

            return (
              <button
                key={concept.id}
                onClick={() => handleConceptClick(concept)}
                disabled={!concept.available || isCreating}
                className={`
                  relative rounded-2xl overflow-hidden transition-all duration-200
                  ${concept.available && !isCreating
                    ? 'hover:scale-105 hover:shadow-xl cursor-pointer border-2 border-transparent hover:border-purple-500'
                    : 'opacity-60 cursor-not-allowed grayscale'
                  }
                `}
              >
                {/* Theme preview background */}
                <div
                  className="h-40 bg-cover bg-center"
                  style={{
                    backgroundImage: concept.available
                      ? `url(${assets.bgSetup})`
                      : 'none',
                    backgroundColor: concept.colors.background,
                  }}
                />

                {/* Theme info overlay */}
                <div className="bg-black bg-opacity-80 p-4">
                  <div className="text-left">
                    <div className="text-xl font-bold text-white flex items-center gap-2">
                      <span>{concept.icon}</span>
                      {concept.name}
                    </div>
                    <div className="text-sm text-gray-400">{concept.description}</div>
                  </div>

                  {!concept.available && (
                    <div className="mt-3 text-yellow-400 text-sm font-bold">
                      COMING SOON
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-8 text-gray-500 text-sm relative z-10">
          More themes coming soon!
        </p>
      </div>
    );
  }

  // Step: Show generated code (partner mode)
  if (step === 'show-code') {
    const modeConfig = MODES[selectedMode];
    const conceptData = getConcept(selectedConcept);
    const conceptAssets = getConceptAssets(selectedConcept);
    const storyline = getStoryline(selectedConcept);
    const endingData = storyline?.endings?.[selectedEnding];

    return (
      <div
        className="h-full flex flex-col items-center justify-center p-4 relative overflow-auto"
        style={{
          backgroundImage: `url(${conceptAssets?.bgShare || SHARED_BG_TITLE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/50 pointer-events-none" />

        <button
          onClick={handleBack}
          className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2 z-10"
        >
          ← Back
        </button>

        <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl font-black text-white mb-2">
            Room Created!
          </h1>
          <p className="text-lg text-purple-200">
            Share this code with your partner
          </p>
        </div>

        <div className="bg-gray-800/90 rounded-2xl p-8 w-full max-w-md mb-6 relative z-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="bg-gray-900 px-8 py-4 rounded-xl text-5xl font-mono font-bold text-white tracking-widest">
              {generatedCode}
            </div>
            <button
              onClick={handleCopyCode}
              className="p-4 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
              title="Copy code"
            >
              {copied ? (
                <Check className="text-green-400" size={28} />
              ) : (
                <Copy className="text-gray-300" size={28} />
              )}
            </button>
          </div>
          {copied && (
            <p className="text-green-400 text-center">Copied!</p>
          )}

          <div className="bg-gray-700/50 rounded-lg p-3 mt-4 flex items-center justify-between">
            <span className="text-gray-400 text-sm">Theme:</span>
            <span className="text-white font-semibold">{conceptData?.name || 'Unknown'}</span>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-3 mt-2 flex items-center justify-between">
            <span className="text-gray-400 text-sm">Story:</span>
            <span className="text-white font-semibold">{endingData?.icon} {endingData?.name}</span>
          </div>

          <div className="bg-purple-900/50 rounded-lg p-4 mt-3">
            <p className="text-purple-200 text-sm text-center">
              Your partner enters this code to join and add their {modeConfig?.perPerson} melodies
            </p>
          </div>
        </div>

        <button
          onClick={handleContinueToCreate}
          className="px-8 py-4 bg-green-600 hover:bg-green-500 rounded-xl text-white text-xl font-bold transition-all hover:scale-105 relative z-10"
        >
          Start Creating Melodies
        </button>
      </div>
    );
  }

  // Step: Join to Create (partner joining existing room to add melodies)
  if (step === 'join-to-create') {
    const modeConfig = MODES[selectedMode];
    return (
      <div
        className="h-full flex flex-col items-center justify-center p-4 relative overflow-auto"
        style={{
          backgroundImage: `url(${SHARED_BG_TITLE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        <button
          onClick={handleBack}
          className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2 z-10"
        >
          ← Back
        </button>

        <div className="text-center mb-10 relative z-10">
          <h1 className="text-4xl font-black text-white mb-3">
            Join Partner's Room
          </h1>
          <p className="text-lg text-purple-200">
            Enter the code from your partner
          </p>
        </div>

        <div className="bg-gray-800/90 rounded-2xl p-8 w-full max-w-md relative z-10">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => {
                setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                setJoinError('');
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinToCreate()}
              placeholder="Enter Partner's Code"
              maxLength={6}
              className="w-full px-6 py-4 bg-gray-700 border-2 border-gray-600 rounded-xl text-white text-center text-2xl font-bold tracking-widest placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
              autoFocus
            />
            <button
              onClick={handleJoinToCreate}
              disabled={!joinCode}
              className="w-full px-6 py-4 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl text-white text-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              Join & Add My Melodies
            </button>
          </div>

          {joinError && (
            <p className="text-red-400 text-sm text-center mt-4">{joinError}</p>
          )}

          <p className="text-gray-400 text-sm text-center mt-6">
            You'll add your {modeConfig?.perPerson} melodies to complete the room
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default MelodyMysterySetup;
