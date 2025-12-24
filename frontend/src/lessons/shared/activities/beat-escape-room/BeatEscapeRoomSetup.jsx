// BeatEscapeRoomSetup.jsx - Mode and theme selection screen
// Step 1: Mode → Step 2: Partner Role (if partner/trio) → Step 3: Theme → Start Creating

import React, { useState, useEffect } from 'react';
import { Copy, Check, Play, Share2 } from 'lucide-react';
import { MODES, createRoom } from './beatEscapeRoomConfig';
import { getAllThemes, getThemeAssets, getSharedAssets, THEMES } from './beatEscapeRoomThemes';
import { getAllStudentWork, getStudentId } from '../../../../utils/studentWorkStorage';

const BeatEscapeRoomSetup = ({ onStartCreate, onJoinRoom, onJoinToCreate, onPlaySavedRoom, onShareSavedRoom }) => {
  const [step, setStep] = useState('mode'); // 'mode' | 'partner-role' | 'theme' | 'show-code' | 'join-to-create'
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [joinCode, setJoinCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [savedRooms, setSavedRooms] = useState([]);

  const modes = Object.values(MODES);
  const themes = getAllThemes();
  const sharedAssets = getSharedAssets();

  // Load saved rooms on mount
  useEffect(() => {
    const studentId = getStudentId();
    const allWork = getAllStudentWork(studentId);
    // Filter for beat-escape-room saves
    const escapeRooms = allWork.filter(w => w.activityType === 'beat-escape-room');
    setSavedRooms(escapeRooms);
  }, []);

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
    if (step === 'theme') {
      if (selectedMode === 'partner' || selectedMode === 'trio') {
        setStep('partner-role');
      } else {
        setStep('mode');
        setSelectedMode(null);
      }
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

  // Step 1: Mode Selection
  if (step === 'mode') {
    return (
      <div
        className="min-h-screen flex flex-col p-6 relative"
        style={{
          backgroundImage: `url(${sharedAssets.bgTitle})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        {/* Header */}
        <div className="text-center pt-6 pb-8 relative z-10">
          <h1
            className="text-5xl font-black text-white mb-3 uppercase tracking-wider"
            style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.8), 0 4px 8px rgba(0,0,0,0.5)' }}
          >
            Beat Escape Room
          </h1>
          <p className="text-xl text-purple-200">
            Create beat puzzles for your partner to solve!
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="flex-1 flex gap-6 relative z-10 max-w-6xl mx-auto w-full">
          {/* Left Column - Create New */}
          <div className="flex-1 flex flex-col">
            {/* Mode Selection */}
            <div className="mb-8">
              <p className="text-center text-lg text-gray-300 mb-6">
                How are you working today?
              </p>

              <div className="flex gap-4 flex-wrap justify-center">
                {modes.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => handleModeSelect(mode.id)}
                    className="group bg-gray-800/90 hover:bg-gray-700/90 border-2 border-gray-600 hover:border-purple-500 rounded-2xl p-6 w-40 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
                  >
                    <div className="text-xl font-bold text-white mb-1">{mode.label}</div>
                    <div className="text-purple-400 font-semibold">
                      {mode.totalLocks} locks
                    </div>
                    {mode.perPerson < mode.totalLocks && (
                      <div className="text-gray-400 text-sm">
                        ({mode.perPerson} each)
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6 w-full max-w-md mx-auto">
              <div className="flex-1 h-px bg-gray-600" />
              <span className="text-gray-400 font-semibold text-sm">OR PLAY EXISTING</span>
              <div className="flex-1 h-px bg-gray-600" />
            </div>

            {/* Join Section */}
            <div className="bg-gray-800/90 rounded-2xl p-5 w-full max-w-md mx-auto">
              <p className="text-center text-gray-300 mb-4 text-sm">
                Have a code? Join a room created by someone else!
              </p>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                    setJoinError('');
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                  placeholder="Enter Code"
                  maxLength={6}
                  className="flex-1 px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white text-center text-xl font-bold tracking-widest placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleJoin}
                  disabled={!joinCode}
                  className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-bold transition-colors flex items-center gap-2"
                >
                  Play
                </button>
              </div>

              {joinError && (
                <p className="text-red-400 text-sm text-center mt-2">{joinError}</p>
              )}
            </div>
          </div>

          {/* Right Column - Saved Rooms */}
          <div className="w-80 flex flex-col">
            <div className="bg-gray-800/90 rounded-2xl p-5 flex-1 overflow-hidden flex flex-col">
              <h2 className="text-xl font-bold text-white mb-4 text-center">
                Your Saved Rooms
              </h2>

              {savedRooms.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-500 text-center text-sm">
                    No saved rooms yet.<br />Create one to get started!
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {savedRooms.map((room, index) => {
                    const themeName = THEMES[room.data?.theme]?.name || room.data?.theme || 'Unknown';
                    const lockCount = room.data?.patterns ? Object.keys(room.data.patterns).length : 0;
                    const modeLabel = MODES[room.data?.mode]?.label || 'Solo';

                    return (
                      <div
                        key={index}
                        className="bg-gray-700/80 rounded-xl p-4 border border-gray-600"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-white font-semibold">{themeName}</div>
                          <div className="text-gray-400 text-xs">{room.data?.shareCode}</div>
                        </div>
                        <div className="text-gray-400 text-sm mb-3">
                          {lockCount} locks • {modeLabel}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onPlaySavedRoom?.(room)}
                            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                          >
                            <Play size={14} />
                            Play
                          </button>
                          <button
                            onClick={() => onShareSavedRoom?.(room)}
                            className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                          >
                            <Share2 size={14} />
                            Share
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Partner Role Selection (for partner/trio modes)
  if (step === 'partner-role') {
    const modeConfig = MODES[selectedMode];
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 relative"
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
          className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2 z-10"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="text-center mb-10 relative z-10">
          <h1 className="text-4xl font-black text-white mb-3">
            {modeConfig?.label} Mode
          </h1>
          <p className="text-lg text-purple-200">
            {modeConfig?.totalLocks} locks total - {modeConfig?.perPerson} locks each
          </p>
        </div>

        {/* Role Selection */}
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

  // Step: Show generated code (partner 1)
  if (step === 'show-code') {
    const modeConfig = MODES[selectedMode];
    const themeConfig = themes.find(t => t.id === selectedTheme);
    const themeAssets = getThemeAssets(selectedTheme);

    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 relative"
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
          className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2 z-10"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl font-black text-white mb-2">
            Room Created!
          </h1>
          <p className="text-lg text-purple-200">
            Share this code with your partner
          </p>
        </div>

        {/* Code Display */}
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

          {/* Theme info */}
          <div className="bg-gray-700/50 rounded-lg p-3 mt-4 flex items-center justify-between">
            <span className="text-gray-400 text-sm">Theme:</span>
            <span className="text-white font-semibold">{themeConfig?.name || 'Unknown'}</span>
          </div>

          <div className="bg-purple-900/50 rounded-lg p-4 mt-3">
            <p className="text-purple-200 text-sm text-center">
              Your partner enters this code to join and add their {modeConfig?.perPerson} locks
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinueToCreate}
          className="px-8 py-4 bg-green-600 hover:bg-green-500 rounded-xl text-white text-xl font-bold transition-all hover:scale-105 relative z-10"
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
        className="min-h-screen flex flex-col items-center justify-center p-6 relative"
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
          className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2 z-10"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="text-center mb-10 relative z-10">
          <h1 className="text-4xl font-black text-white mb-3">
            Join Partner's Room
          </h1>
          <p className="text-lg text-purple-200">
            Enter the code from your partner
          </p>
        </div>

        {/* Join Form */}
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
              Join & Add My Locks
            </button>
          </div>

          {joinError && (
            <p className="text-red-400 text-sm text-center mt-4">{joinError}</p>
          )}

          <p className="text-gray-400 text-sm text-center mt-6">
            You'll add your {modeConfig?.perPerson} locks to complete the room
          </p>
        </div>
      </div>
    );
  }

  // Step 3: Theme Selection
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative"
      style={{
        backgroundImage: `url(${sharedAssets.bgSelect})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Back button */}
      <button
        onClick={handleBack}
        className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2 z-10"
      >
        ← Back
      </button>

      {/* Header */}
      <div className="text-center mb-10 relative z-10">
        <h1 className="text-4xl font-black text-white mb-3">
          Choose Your Theme
        </h1>
        <p className="text-lg text-purple-200">
          {MODES[selectedMode]?.label} Mode - {MODES[selectedMode]?.totalLocks} Locks
        </p>
        {(selectedMode === 'partner' || selectedMode === 'trio') && (
          <p className="text-sm text-gray-400 mt-2">
            Your partner will use the same theme
          </p>
        )}
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
