// BeatEscapeRoomSetup.jsx - Mode and theme selection screen
// Step 1: Mode → Step 2: Partner Role (if partner/trio) → Step 3: Theme → Start Creating

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { MODES, generateShareCode } from './beatEscapeRoomConfig';
import { getAllThemes, getThemeAssets } from './beatEscapeRoomThemes';

const BeatEscapeRoomSetup = ({ onStartCreate, onJoinRoom, onJoinToCreate }) => {
  const [step, setStep] = useState('mode'); // 'mode' | 'partner-role' | 'show-code' | 'join-to-create' | 'theme'
  const [selectedMode, setSelectedMode] = useState(null);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [joinCode, setJoinCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [copied, setCopied] = useState(false);

  const modes = Object.values(MODES);
  const themes = getAllThemes();

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

  const handleGenerateCode = () => {
    // Generate a new room code
    const code = generateShareCode();
    setGeneratedCode(code);
    setPlayerIndex(0);
    setStep('show-code');
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

  const handleThemeSelect = (theme) => {
    if (!theme.available) return;
    onStartCreate({
      mode: selectedMode,
      themeId: theme.id,
      playerIndex: playerIndex,
      shareCode: generatedCode, // Pass the pre-generated code
    });
  };

  const handleBack = () => {
    if (step === 'theme') {
      if (selectedMode === 'partner' || selectedMode === 'trio') {
        setStep('show-code');
      } else {
        setStep('mode');
        setSelectedMode(null);
      }
    } else if (step === 'show-code') {
      setStep('partner-role');
      setGeneratedCode('');
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
    onJoinRoom(joinCode.toUpperCase());
  };

  const handleJoinToCreate = () => {
    if (!joinCode || joinCode.length < 4) {
      setJoinError('Enter a valid code');
      return;
    }
    setJoinError('');
    // Join existing room to add locks
    if (onJoinToCreate) {
      onJoinToCreate(joinCode.toUpperCase(), selectedMode);
    }
  };

  // Step 1: Mode Selection
  if (step === 'mode') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center p-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-white mb-3 flex items-center justify-center gap-3">
            <span className="text-4xl">🥁</span>
            Beat Escape Room
          </h1>
          <p className="text-xl text-purple-200">
            Create beat puzzles for your partner to solve!
          </p>
        </div>

        {/* Mode Selection */}
        <div className="mb-10">
          <p className="text-center text-lg text-gray-300 mb-6">
            How are you working today?
          </p>

          <div className="flex gap-4 flex-wrap justify-center">
            {modes.map(mode => (
              <button
                key={mode.id}
                onClick={() => handleModeSelect(mode.id)}
                className="group bg-gray-800 hover:bg-gray-700 border-2 border-gray-600 hover:border-purple-500 rounded-2xl p-6 w-40 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
              >
                <div className="text-4xl mb-2">{mode.icon}</div>
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
        <div className="flex items-center gap-4 mb-8 w-full max-w-md">
          <div className="flex-1 h-px bg-gray-600" />
          <span className="text-gray-400 font-semibold">OR PLAY EXISTING</span>
          <div className="flex-1 h-px bg-gray-600" />
        </div>

        {/* Join Section */}
        <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
          <p className="text-center text-gray-300 mb-4">
            Have a code? Join a room created by someone else!
          </p>

          <div className="flex gap-3">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => {
                setJoinCode(e.target.value.toUpperCase());
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
              🔓 Play
            </button>
          </div>

          {joinError && (
            <p className="text-red-400 text-sm text-center mt-2">{joinError}</p>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Partner Role Selection (for partner/trio modes)
  if (step === 'partner-role') {
    const modeConfig = MODES[selectedMode];
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center p-6">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">{modeConfig?.icon}</div>
          <h1 className="text-4xl font-black text-white mb-3">
            {modeConfig?.label} Mode
          </h1>
          <p className="text-lg text-purple-200">
            {modeConfig?.totalLocks} locks total • {modeConfig?.perPerson} locks each
          </p>
        </div>

        {/* Role Selection */}
        <div className="w-full max-w-md space-y-4">
          <button
            onClick={handleGenerateCode}
            className="w-full bg-gray-800 hover:bg-gray-700 border-2 border-gray-600 hover:border-purple-500 rounded-2xl p-6 transition-all duration-200 hover:scale-105"
          >
            <div className="text-3xl mb-2">🆕</div>
            <div className="text-xl font-bold text-white mb-1">Generate New Room</div>
            <div className="text-gray-400 text-sm">
              Get a code to share with your partner
            </div>
          </button>

          <button
            onClick={() => setStep('join-to-create')}
            className="w-full bg-gray-800 hover:bg-gray-700 border-2 border-gray-600 hover:border-green-500 rounded-2xl p-6 transition-all duration-200 hover:scale-105"
          >
            <div className="text-3xl mb-2">🔗</div>
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
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center p-6">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-3xl font-black text-white mb-2">
            Your Room Code
          </h1>
          <p className="text-lg text-purple-200">
            Share this code with your partner
          </p>
        </div>

        {/* Code Display */}
        <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md mb-6">
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

          <div className="bg-purple-900/50 rounded-lg p-4 mt-4">
            <p className="text-purple-200 text-sm text-center">
              📱 Your partner enters this code to join and add their {modeConfig?.perPerson} locks
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={() => setStep('theme')}
          className="px-8 py-4 bg-green-600 hover:bg-green-500 rounded-xl text-white text-xl font-bold transition-all hover:scale-105"
        >
          Continue to Create →
        </button>
      </div>
    );
  }

  // Step: Join to Create (partner joining existing room to add locks)
  if (step === 'join-to-create') {
    const modeConfig = MODES[selectedMode];
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center p-6">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🔗</div>
          <h1 className="text-4xl font-black text-white mb-3">
            Join Partner's Room
          </h1>
          <p className="text-lg text-purple-200">
            Enter the code from your partner
          </p>
        </div>

        {/* Join Form */}
        <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => {
                setJoinCode(e.target.value.toUpperCase());
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
              🔓 Join & Add My Locks
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center p-6">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
      >
        ← Back
      </button>

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-white mb-3">
          Choose Your Theme
        </h1>
        <p className="text-lg text-purple-200">
          {MODES[selectedMode]?.label} Mode • {MODES[selectedMode]?.totalLocks} Locks
        </p>
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-2 gap-6 max-w-2xl">
        {themes.map(theme => {
          const assets = getThemeAssets(theme.id);
          return (
            <button
              key={theme.id}
              onClick={() => handleThemeSelect(theme)}
              disabled={!theme.available}
              className={`
                relative rounded-2xl overflow-hidden transition-all duration-200
                ${theme.available
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
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{theme.emoji}</span>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">{theme.name}</div>
                    <div className="text-sm text-gray-400">{theme.description}</div>
                  </div>
                </div>

                {!theme.available && (
                  <div className="mt-3 flex items-center gap-2 text-yellow-400 text-sm font-bold">
                    <span>🔒</span>
                    <span>COMING SOON</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Only Space Station available notice */}
      <p className="mt-8 text-gray-500 text-sm">
        More themes coming soon!
      </p>
    </div>
  );
};

export default BeatEscapeRoomSetup;
