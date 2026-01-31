// BeatEscapeRoomSetup.jsx - Mode and theme selection screen
// Step 1: Mode → Step 2: Partner Role (if partner/trio) → Step 3: Theme → Start Creating

import React, { useState, useEffect } from 'react';
import { Copy, Check, Play, Pencil } from 'lucide-react';
import { MODES, createRoom } from './beatEscapeRoomConfig';
import { getAllThemes, getThemeAssets, getSharedAssets, THEMES } from './beatEscapeRoomThemes';
import { getAllStudentWork, getStudentId, saveStudentWork } from '../../../../utils/studentWorkStorage';

const BeatEscapeRoomSetup = ({ onStartCreate, onJoinRoom, onJoinToCreate, onPlaySavedRoom }) => {
  // TEMPORARILY DISABLED: Partner mode - skip mode selection and go straight to theme
  // To re-enable partner mode, change initial step back to 'mode' and selectedMode to null
  const [step, setStep] = useState('theme'); // 'mode' | 'partner-role' | 'theme' | 'show-code' | 'join-to-create'
  const [selectedMode, setSelectedMode] = useState('solo'); // Auto-select solo mode
  const [selectedTheme, setSelectedTheme] = useState(null);
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
  const themes = getAllThemes();
  const sharedAssets = getSharedAssets();

  // Load saved rooms on mount
  const loadSavedRooms = () => {
    const studentId = getStudentId();
    const allWork = getAllStudentWork(studentId);
    const escapeRooms = allWork.filter(w => w.activityId === 'beat-escape-room');
    setSavedRooms(escapeRooms);
  };

  useEffect(() => {
    loadSavedRooms();
  }, []);

  // Handle saving edited title
  const handleSaveTitle = (room, index) => {
    const newTitle = editingTitle.trim() || `My ${THEMES[room.data?.theme]?.name || 'Escape'} Room`;

    // Save with updated title
    saveStudentWork('beat-escape-room', {
      title: newTitle,
      emoji: '',
      viewRoute: room.viewRoute,
      subtitle: room.subtitle,
      category: room.category,
      data: room.data
    });

    setEditingRoomIndex(null);
    setEditingTitle('');
    loadSavedRooms(); // Refresh the list
  };

  const handleModeSelect = (modeId) => {
    setSelectedMode(modeId);
    // For partner/trio, ask which partner they are
    if (modeId === 'partner' || modeId === 'trio') {
      setStep('partner-role');
    } else {
      // Solo goes straight to theme
      setStep('theme');
    }
  };

  // For partner mode: select theme first, THEN create room with theme
  const handlePartnerThemeSelect = async (theme) => {
    if (!theme.available || isCreating) return;
    setIsCreating(true);
    setSelectedTheme(theme.id);

    try {
      // Create room on server WITH the theme already set
      const room = await createRoom({
        mode: selectedMode,
        patterns: {},
        theme: theme.id,  // Theme is set when room is created
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
    // Go to theme selection - room will be created after theme is chosen
    setStep('theme');
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

  // Solo mode: theme select goes directly to creating
  const handleSoloThemeSelect = (theme) => {
    if (!theme.available) return;
    onStartCreate({
      mode: selectedMode,
      themeId: theme.id,
      playerIndex: 0,
      shareCode: null,
    });
  };

  // After partner room is created and code shown, continue to collab creator
  const handleContinueToCreate = () => {
    onStartCreate({
      mode: selectedMode,
      themeId: selectedTheme,
      playerIndex: 0,
      shareCode: generatedCode,
    });
  };

  const handleBack = () => {
    // TEMPORARILY DISABLED: Partner mode - no back navigation from theme since we skip mode selection
    // To re-enable, restore the original back navigation logic
    if (step === 'theme') {
      // Partner mode disabled - nowhere to go back to from theme
      // Original code:
      // if (selectedMode === 'partner' || selectedMode === 'trio') {
      //   setStep('partner-role');
      // } else {
      //   setStep('mode');
      //   setSelectedMode(null);
      // }
      return; // No back from theme in solo-only mode
    } else if (step === 'show-code') {
      // Can't go back from show-code - room is already created
      // Just go back to partner-role and clear the code
      setStep('partner-role');
      setGeneratedCode('');
      setSelectedTheme(null);
    } else if (step === 'partner-role' || step === 'join-to-create') {
      setStep('mode');
      setSelectedMode(null);
    } else {
      setStep('mode');
      setSelectedMode(null);
    }
  };

  const handleJoin = () => {
    if (!joinCode || joinCode.length < 4) {
      setJoinError('Enter a valid code');
      return;
    }
    setJoinError('');
    onJoinRoom(joinCode);
  };

  const handleJoinToCreate = () => {
    if (!joinCode || joinCode.length < 4) {
      setJoinError('Enter a valid code');
      return;
    }
    setJoinError('');
    // Join existing room to add locks
    if (onJoinToCreate) {
      onJoinToCreate(joinCode, selectedMode);
    }
  };

  // Step 1: Mode Selection - Vertical Stack Layout
  if (step === 'mode') {
    return (
      <div
        className="h-full flex flex-col p-4 relative overflow-auto"
        style={{
          backgroundImage: `url(${sharedAssets.bgTitle})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/50 pointer-events-none" />

        {/* Header */}
        <div className="text-center pt-2 pb-4 relative z-10">
          <h1
            className="text-4xl font-black text-white mb-1 uppercase tracking-wider"
            style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.8), 0 4px 8px rgba(0,0,0,0.5)' }}
          >
            Beat Escape Room
          </h1>
          <p className="text-lg text-purple-200">
            Create beat puzzles for your partner to solve!
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center relative z-10">
          {/* Mode Selection - Hero Section */}
          <div className="w-full max-w-3xl mb-4">
            <h2 className="text-center text-xl font-bold text-white mb-4"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              How are you working today?
            </h2>

            <div className="flex gap-3 justify-center">
              {modes.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  className="group bg-gray-800/90 hover:bg-gray-700/90 border-2 border-gray-600 hover:border-purple-500 rounded-xl p-3 w-28 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30"
                >
                  <div className="text-base font-bold text-white mb-0.5">{mode.label}</div>
                  <div className="text-purple-400 font-semibold text-sm">
                    {mode.totalLocks} locks
                  </div>
                  {mode.perPerson < mode.totalLocks && (
                    <div className="text-gray-400 text-xs">
                      ({mode.perPerson} each)
                    </div>
                  )}
                </button>
              ))}

              {/* Play Someone Else's Room */}
              <div className="bg-gray-800/90 border-2 border-gray-600 rounded-xl p-3 w-36">
                <div className="text-sm font-bold text-white mb-0.5">Play Someone Else's Room</div>
                <div className="text-gray-400 text-xs mb-1.5">Enter their code:</div>
                <input
                  type="text"
                  value={playCode}
                  onChange={(e) => {
                    setPlayCode(e.target.value.toUpperCase());
                    setPlayError('');
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && playCode.length >= 4) {
                      onJoinRoom?.(playCode);
                    }
                  }}
                  placeholder="CODE"
                  maxLength={6}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-sm font-mono tracking-widest uppercase focus:outline-none focus:border-green-500 mb-1.5"
                />
                {playError && (
                  <div className="text-red-400 text-xs mb-1">{playError}</div>
                )}
                <button
                  onClick={() => {
                    if (playCode.length >= 4) {
                      onJoinRoom?.(playCode);
                    } else {
                      setPlayError('Enter a valid code');
                    }
                  }}
                  disabled={playCode.length < 4}
                  className={`w-full px-2 py-1 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1 ${
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
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 h-px bg-gray-600" />
                <h3 className="text-base font-semibold text-gray-300">YOUR ESCAPE ROOMS</h3>
                <div className="flex-1 h-px bg-gray-600" />
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2">
                {savedRooms.map((room, index) => {
                  const themeName = THEMES[room.data?.theme]?.name || 'Escape';
                  const defaultTitle = `My ${themeName} Room`;
                  const displayTitle = room.title || defaultTitle;
                  const lockCount = room.data?.patterns ? Object.keys(room.data.patterns).length : 0;
                  const isEditing = editingRoomIndex === index;

                  return (
                    <div
                      key={index}
                      className="bg-gray-800/90 rounded-xl p-3 border border-gray-600 min-w-[170px] flex-shrink-0"
                    >
                      {isEditing ? (
                        <div className="mb-2">
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
                        <div className="flex items-start justify-between mb-1">
                          <div className="text-white font-semibold text-sm leading-tight pr-2">
                            {displayTitle}
                          </div>
                          <button
                            onClick={() => {
                              setEditingRoomIndex(index);
                              setEditingTitle(room.title || '');
                            }}
                            className="text-gray-400 hover:text-purple-400 transition-colors p-0.5"
                            title="Edit title"
                          >
                            <Pencil size={12} />
                          </button>
                        </div>
                      )}
                      <div className="text-gray-400 text-xs mb-2">
                        {lockCount} locks • {themeName}
                      </div>
                      <button
                        onClick={() => onPlaySavedRoom?.(room)}
                        className="w-full px-2 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                      >
                        <Play size={14} />
                        Play
                      </button>
                      {room.data?.shareCode && (
                        <div className="text-center text-gray-400 text-xs mt-1.5">
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
        className="h-full flex flex-col items-center justify-center p-4 relative overflow-auto"
        style={{
          backgroundImage: `url(${sharedAssets.bgTitle})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        {/* Back button */}
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors flex items-center gap-2 z-10"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="text-center mb-6 relative z-10">
          <h1 className="text-3xl font-black text-white mb-2">
            {modeConfig?.label} Mode
          </h1>
          <p className="text-base text-purple-200">
            {modeConfig?.totalLocks} locks total - {modeConfig?.perPerson} locks each
          </p>
        </div>

        {/* Role Selection */}
        <div className="w-full max-w-md space-y-3 relative z-10">
          <button
            onClick={handleGenerateNewRoom}
            className="w-full bg-gray-800/90 hover:bg-gray-700/90 border-2 border-gray-600 hover:border-purple-500 rounded-xl p-4 transition-all duration-200 hover:scale-105"
          >
            <div className="text-lg font-bold text-white mb-1">
              Generate New Room
            </div>
            <div className="text-gray-400 text-sm">
              Pick a theme and get a code for your partner
            </div>
          </button>

          <button
            onClick={() => setStep('join-to-create')}
            className="w-full bg-gray-800/90 hover:bg-gray-700/90 border-2 border-gray-600 hover:border-green-500 rounded-xl p-4 transition-all duration-200 hover:scale-105"
          >
            <div className="text-lg font-bold text-white mb-1">Join Partner's Room</div>
            <div className="text-gray-400 text-sm">
              Enter your partner's code
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Step: Show generated code (partner 1)
  if (step === 'show-code') {
    const modeConfig = MODES[selectedMode];
    const themeConfig = themes.find(t => t.id === selectedTheme);
    const themeAssets = getThemeAssets(selectedTheme);

    return (
      <div
        className="h-full flex flex-col items-center justify-center p-4 relative overflow-auto"
        style={{
          backgroundImage: `url(${themeAssets?.bgRoom1 || sharedAssets.bgTitle})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/50 pointer-events-none" />

        {/* Back button */}
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors flex items-center gap-2 z-10"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="text-center mb-4 relative z-10">
          <h1 className="text-2xl font-black text-white mb-1">
            Room Created!
          </h1>
          <p className="text-base text-purple-200">
            Share this code with your partner
          </p>
        </div>

        {/* Code Display */}
        <div className="bg-gray-800/90 rounded-xl p-6 w-full max-w-md mb-4 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="bg-gray-900 px-6 py-3 rounded-xl text-4xl font-mono font-bold text-white tracking-widest">
              {generatedCode}
            </div>
            <button
              onClick={handleCopyCode}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
              title="Copy code"
            >
              {copied ? (
                <Check className="text-green-400" size={24} />
              ) : (
                <Copy className="text-gray-300" size={24} />
              )}
            </button>
          </div>
          {copied && (
            <p className="text-green-400 text-center text-sm">Copied!</p>
          )}

          {/* Theme info */}
          <div className="bg-gray-700/50 rounded-lg p-2 mt-3 flex items-center justify-between">
            <span className="text-gray-400 text-sm">Theme:</span>
            <span className="text-white font-semibold text-sm">{themeConfig?.name || 'Unknown'}</span>
          </div>

          <div className="bg-purple-900/50 rounded-lg p-3 mt-2">
            <p className="text-purple-200 text-sm text-center">
              Your partner enters this code to join and add their {modeConfig?.perPerson} locks
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinueToCreate}
          className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl text-white text-lg font-bold transition-all hover:scale-105 relative z-10"
        >
          Start Creating Locks
        </button>
      </div>
    );
  }

  // Step: Join to Create (partner joining existing room to add locks)
  if (step === 'join-to-create') {
    const modeConfig = MODES[selectedMode];
    return (
      <div
        className="h-full flex flex-col items-center justify-center p-4 relative overflow-auto"
        style={{
          backgroundImage: `url(${sharedAssets.bgTitle})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        {/* Back button */}
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors flex items-center gap-2 z-10"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="text-center mb-6 relative z-10">
          <h1 className="text-3xl font-black text-white mb-2">
            Join Partner's Room
          </h1>
          <p className="text-base text-purple-200">
            Enter the code from your partner
          </p>
        </div>

        {/* Join Form */}
        <div className="bg-gray-800/90 rounded-xl p-6 w-full max-w-md relative z-10">
          <div className="flex flex-col gap-3">
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
              className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white text-center text-xl font-bold tracking-widest placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
              autoFocus
            />
            <button
              onClick={handleJoinToCreate}
              disabled={!joinCode}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl text-white text-lg font-bold transition-colors flex items-center justify-center gap-2"
            >
              Join & Add My Locks
            </button>
          </div>

          {joinError && (
            <p className="text-red-400 text-sm text-center mt-3">{joinError}</p>
          )}

          <p className="text-gray-400 text-sm text-center mt-4">
            You'll add your {modeConfig?.perPerson} locks to complete the room
          </p>
        </div>
      </div>
    );
  }

  // Step 3: Theme Selection (now the first step since partner mode is disabled)
  return (
    <div
      className="h-full flex flex-col items-center justify-center p-4 relative overflow-auto"
      style={{
        backgroundImage: `url(${sharedAssets.bgSelect})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* TEMPORARILY DISABLED: Back button - no mode selection to go back to
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors flex items-center gap-2 z-10"
      >
        ← Back
      </button>
      */}

      {/* Header */}
      <div className="text-center mb-6 relative z-10">
        <h1 className="text-3xl font-black text-white mb-2">
          Beat Escape Room
        </h1>
        <p className="text-base text-purple-200">
          Choose a theme and create {MODES[selectedMode]?.totalLocks} beat locks!
        </p>
        {/* TEMPORARILY DISABLED: Partner mode text
        {(selectedMode === 'partner' || selectedMode === 'trio') && (
          <p className="text-sm text-gray-400 mt-1">
            Your partner will use the same theme
          </p>
        )}
        */}
      </div>

      {/* Loading indicator for partner mode */}
      {isCreating && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-2xl mb-2">Creating Room...</div>
            <div className="text-gray-400">Please wait</div>
          </div>
        </div>
      )}

      {/* Theme Grid */}
      <div className="grid grid-cols-2 gap-6 max-w-2xl relative z-10">
        {themes.map(theme => {
          const assets = getThemeAssets(theme.id);
          const isPartnerMode = selectedMode === 'partner' || selectedMode === 'trio';
          const handleClick = isPartnerMode ? handlePartnerThemeSelect : handleSoloThemeSelect;

          return (
            <button
              key={theme.id}
              onClick={() => handleClick(theme)}
              disabled={!theme.available || isCreating}
              className={`
                relative rounded-2xl overflow-hidden transition-all duration-200
                ${theme.available && !isCreating
                  ? 'hover:scale-105 hover:shadow-xl cursor-pointer border-2 border-transparent hover:border-purple-500'
                  : 'opacity-60 cursor-not-allowed grayscale'
                }
              `}
            >
              {/* Theme preview background */}
              <div
                className="h-40 bg-cover bg-center"
                style={{
                  backgroundImage: theme.available
                    ? `url(${assets.bgRoom1})`
                    : 'none',
                  backgroundColor: theme.colors.background,
                }}
              />

              {/* Theme info overlay */}
              <div className="bg-black bg-opacity-80 p-4">
                <div className="text-left">
                  <div className="text-xl font-bold text-white">{theme.name}</div>
                  <div className="text-sm text-gray-400">{theme.description}</div>
                </div>

                {!theme.available && (
                  <div className="mt-3 text-yellow-400 text-sm font-bold">
                    COMING SOON
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Only Space Station available notice */}
      <p className="mt-8 text-gray-500 text-sm relative z-10">
        More themes coming soon!
      </p>
    </div>
  );
};

export default BeatEscapeRoomSetup;
