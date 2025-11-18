// VirtualKeyboard.jsx
// Simplified - just white keys side by side first

import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import KeyboardKey from './KeyboardKey';
import { notes, synthTypes, defaultVolume } from './keyboardConfig';

const VirtualKeyboard = ({ onExit }) => {
  const [currentSynthType, setCurrentSynthType] = useState('piano');
  const [volume, setVolume] = useState(defaultVolume);
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [isAudioReady, setIsAudioReady] = useState(false);
  
  const synthRef = useRef(null);
  const volumeNodeRef = useRef(null);

  // Get current instrument display name
  const currentInstrument = synthTypes.find(s => s.id === currentSynthType);

  // Initialize Tone.js synth
  useEffect(() => {
    volumeNodeRef.current = new Tone.Volume(volume).toDestination();
    const synthConfig = synthTypes.find(s => s.id === currentSynthType).config;
    synthRef.current = new Tone.PolySynth(Tone.Synth, synthConfig).connect(volumeNodeRef.current);
    
    return () => {
      if (synthRef.current) synthRef.current.dispose();
      if (volumeNodeRef.current) volumeNodeRef.current.dispose();
    };
  }, []);

  // Update synth when type changes
  useEffect(() => {
    if (!synthRef.current) return;
    synthRef.current.dispose();
    const synthConfig = synthTypes.find(s => s.id === currentSynthType).config;
    synthRef.current = new Tone.PolySynth(Tone.Synth, synthConfig).connect(volumeNodeRef.current);
  }, [currentSynthType]);

  // Update volume
  useEffect(() => {
    if (volumeNodeRef.current) volumeNodeRef.current.volume.value = volume;
  }, [volume]);

  // Start audio context
  const startAudio = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
      setIsAudioReady(true);
    }
  };

  // Play note
  const playNote = async (note) => {
    await startAudio();
    if (synthRef.current && !pressedKeys.has(note)) {
      synthRef.current.triggerAttack(note);
      setPressedKeys(prev => new Set([...prev, note]));
    }
  };

  // Stop note
  const stopNote = (note) => {
    if (synthRef.current && pressedKeys.has(note)) {
      synthRef.current.triggerRelease(note);
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(note);
        return newSet;
      });
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      const note = notes.find(n => n.key.toLowerCase() === e.key.toLowerCase());
      if (note) {
        e.preventDefault();
        playNote(note.note);
      }
    };

    const handleKeyUp = (e) => {
      const note = notes.find(n => n.key.toLowerCase() === e.key.toLowerCase());
      if (note) {
        e.preventDefault();
        stopNote(note.note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [pressedKeys]);

  // Get ALL white keys from both octaves
  const allWhiteKeys = notes.filter(n => n.isWhite);
  // Get ALL black keys
  const allBlackKeys = notes.filter(n => !n.isWhite);

  return (
    <div style={{
      height: '100%',
      backgroundColor: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'auto'
    }}>
      {/* Only show header if there's an onExit button */}
      {onExit && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            color: 'white',
            fontSize: '28px',
            fontWeight: 'bold',
            margin: 0
          }}>
            🎹 Virtual Piano
          </h1>
          
          <button
            onClick={onExit}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
          >
            ← Back
          </button>
        </div>
      )}

      {/* Instrument Name Display */}
      <div style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#f1f5f9',
        marginBottom: '12px',
        marginTop: onExit ? '60px' : '0',
        textAlign: 'center',
        textShadow: '0 2px 10px rgba(59, 130, 246, 0.5)'
      }}>
        {currentInstrument?.displayName || 'Piano'}
      </div>

      {/* Controls Panel */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(10px)',
        borderRadius: '8px',
        padding: '10px 20px',
        marginBottom: '15px',
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        flexWrap: 'wrap',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        {/* Instrument Selector */}
        <div>
          <label style={{
            display: 'block',
            color: '#cbd5e1',
            fontSize: '9px',
            fontWeight: '600',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Change Instrument
          </label>
          <select
            value={currentSynthType}
            onChange={(e) => setCurrentSynthType(e.target.value)}
            style={{
              padding: '6px 10px',
              fontSize: '12px',
              borderRadius: '4px',
              border: '2px solid #3b82f6',
              backgroundColor: 'white',
              cursor: 'pointer',
              minWidth: '140px',
              fontWeight: '500'
            }}
          >
            {synthTypes.map(synth => (
              <option key={synth.id} value={synth.id}>
                {synth.name}
              </option>
            ))}
          </select>
        </div>

        {/* Volume Control */}
        <div>
          <label style={{
            display: 'block',
            color: '#cbd5e1',
            fontSize: '9px',
            fontWeight: '600',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Volume: {Math.round((volume + 40) / 40 * 100)}%
          </label>
          <input
            type="range"
            min="-40"
            max="0"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{
              width: '140px',
              height: '5px',
              borderRadius: '3px',
              cursor: 'pointer',
              accentColor: '#3b82f6'
            }}
          />
        </div>

        {/* Audio Status */}
        {!isAudioReady && (
          <div style={{
            color: '#fbbf24',
            fontSize: '10px',
            fontWeight: '600',
            backgroundColor: 'rgba(251, 191, 36, 0.15)',
            padding: '6px 12px',
            borderRadius: '4px',
            border: '1px solid rgba(251, 191, 36, 0.3)'
          }}>
            🔊 Click any key to start
          </div>
        )}
      </div>

      {/* Piano Container - WHITE KEYS WITH BLACK KEYS OVERLAID */}
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Container with relative positioning for black keys */}
        <div style={{
          position: 'relative',
          display: 'flex',
          gap: '0px'
        }}>
          {/* White keys */}
          {allWhiteKeys.map((noteData, index) => (
            <div key={noteData.note} style={{ position: 'relative' }}>
              <KeyboardKey
                note={noteData.note}
                isWhite={true}
                label={noteData.label}
                computerKey={noteData.key}
                isPressed={pressedKeys.has(noteData.note)}
                onPress={() => playNote(noteData.note)}
                onRelease={() => stopNote(noteData.note)}
              />
              
              {/* Black key goes AFTER this white key if it exists */}
              {/* Find if there's a black key that comes after this white key in the original notes array */}
              {(() => {
                const whiteKeyIndex = notes.findIndex(n => n.note === noteData.note);
                const nextNote = notes[whiteKeyIndex + 1];
                
                // If the next note exists and is black, render it here
                if (nextNote && !nextNote.isWhite) {
                  return (
                    <div style={{
                      position: 'absolute',
                      left: '27px', // Adjusted for smaller keys (40px white, 26px black)
                      top: 0,
                      zIndex: 10
                    }}>
                      <KeyboardKey
                        note={nextNote.note}
                        isWhite={false}
                        label={nextNote.label}
                        computerKey={nextNote.key}
                        isPressed={pressedKeys.has(nextNote.note)}
                        onPress={() => playNote(nextNote.note)}
                        onRelease={() => stopNote(nextNote.note)}
                      />
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        marginTop: '12px',
        color: '#cbd5e1',
        textAlign: 'center',
        maxWidth: '700px'
      }}>
        <p style={{ fontSize: '11px', lineHeight: '1.4', margin: 0 }}>
          <strong style={{ color: '#f1f5f9' }}>Lower:</strong> Z X C V B N M (with S D G H J for sharps) · <strong style={{ color: '#f1f5f9' }}>Upper:</strong> Q W E R T Y U I (with 2 3 5 6 7 for sharps)
        </p>
      </div>
    </div>
  );
};

export default VirtualKeyboard;