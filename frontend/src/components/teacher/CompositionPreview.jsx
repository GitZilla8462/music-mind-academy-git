// CompositionPreview — embedded present-mode view of student composition work
// Used in ActivityGradingView to show video on top, loop blocks below
// Plays loop audio using Web Audio API (no Tone.js dependency)

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Volume2, Loader2 } from 'lucide-react';
import { renderBeatToBlob, renderMelodyToBlob } from '../../pages/projects/film-music-score/shared/beatRenderUtils';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const CompositionPreview = ({ workData, submittedAt, videoOnly = false }) => {
  const videoRef = useRef(null);
  const rafRef = useRef(null);
  const audioCtxRef = useRef(null);
  const buffersRef = useRef({});       // file path -> AudioBuffer
  const sourcesRef = useRef([]);       // active { source, gain } objects
  const masterGainRef = useRef(null);
  const playStartRef = useRef(null);   // { ctxTime, timelineTime } for tracking position

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [audioReady, setAudioReady] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);

  const data = workData?.data || {};
  const initialLoops = data.placedLoops || [];
  const [placedLoops, setPlacedLoops] = useState(initialLoops);
  const videoTitle = data.videoTitle || '';
  const duration = data.videoDuration || 60;

  // Check if any custom loops need re-rendering (blob URLs are dead across sessions)
  const hasCustomLoopsToRender = initialLoops.some(loop =>
    (loop.type === 'custom-beat' || loop.type === 'custom-melody') &&
    loop.pattern &&
    (!loop.file || loop.file.startsWith('blob:'))
  );

  // Re-render custom beats/melodies that have pattern data but dead blob URLs
  const [renderingCustom, setRenderingCustom] = useState(hasCustomLoopsToRender);
  useEffect(() => {
    if (!hasCustomLoopsToRender) return;

    let cancelled = false;

    const renderAll = async () => {
      const customLoops = initialLoops.filter(loop =>
        (loop.type === 'custom-beat' || loop.type === 'custom-melody') &&
        loop.pattern &&
        (!loop.file || loop.file.startsWith('blob:'))
      );

      const updates = {};
      for (const loop of customLoops) {
        try {
          if (loop.type === 'custom-melody') {
            const { blobURL } = await renderMelodyToBlob({
              pattern: loop.pattern,
              bpm: loop.bpm,
              synthType: loop.synthType,
              notes: loop.notes,
              beats: loop.beats,
              mood: loop.mood
            });
            updates[loop.id] = blobURL;
          } else {
            const { blobURL } = await renderBeatToBlob({
              pattern: loop.pattern,
              bpm: loop.bpm,
              kit: loop.kit,
              steps: loop.steps
            });
            updates[loop.id] = blobURL;
          }
        } catch (err) {
          console.warn('Failed to re-render custom loop:', loop.name, err);
        }
      }
      if (!cancelled && Object.keys(updates).length > 0) {
        setPlacedLoops(prev => prev.map(loop =>
          updates[loop.id] ? { ...loop, file: updates[loop.id] } : loop
        ));
      }
      if (!cancelled) setRenderingCustom(false);
    };

    renderAll();
    return () => { cancelled = true; };
  }, []); // Run once on mount

  // Resolve video path — use saved path, or look up by videoId for older saves missing videoPath
  const VIDEO_PATHS = {
    // Adventure (Lesson 1)
    'nature-drone': '/lessons/film-music-project/lesson1/NatureDroneFootage.mp4',
    // City (Lesson 2)
    'nyc': '/lessons/film-music-project/lesson2/NYCMontage.mp4',
    'paris': '/lessons/film-music-project/lesson2/ParisMontage.mp4',
    'madrid': '/lessons/film-music-project/lesson2/MadridMontage.mp4',
    'tokyo': '/lessons/film-music-project/lesson2/TokyoMontage.mp4',
    // Wildlife (Lesson 3)
    'forest': '/lessons/film-music-project/lesson3/slides/ForestCreatures.mp4',
    'savanna': '/lessons/film-music-project/lesson3/slides/SavannaCreatures.mp4',
    'underwater': '/lessons/film-music-project/lesson3/slides/UnderwaterCreatures.mp4',
    // Sports (Lesson 4)
    'soccer': '/lessons/film-music-project/lesson4/SoccerHighlightReel.mp4',
    'basketball': '/lessons/film-music-project/lesson4/BasketballHighlightReel.mp4',
    'skateboarding': '/lessons/film-music-project/lesson4/SkateboardHighlighReel.mp4',
    // Game (Lesson 5)
    'grow-a-garden': '/lessons/film-music-project/GrowAGarden.mp4',
    'minecraft': '/lessons/film-music-project/MinecraftGameplay.mp4',
    'unpacking': '/lessons/film-music-project/Unpacking.mp4',
    // School Beneath
    'school-beneath': '/lessons/videos/film-music-loop-project/SchoolMystery.mp4'
  };
  const videoPath = data.videoPath || (data.videoId && VIDEO_PATHS[data.videoId]) || null;

  // Initialize AudioContext and load buffers once custom loops are rendered
  useEffect(() => {
    if (renderingCustom) return; // Wait for custom beats/melodies to finish rendering

    const uniqueFiles = [...new Set(placedLoops.map(l => l.file).filter(Boolean))];
    if (uniqueFiles.length === 0) {
      setAudioReady(true);
      return;
    }

    setLoadingAudio(true);
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);
    masterGainRef.current = master;

    let cancelled = false;

    const loadAll = async () => {
      const results = {};
      await Promise.all(uniqueFiles.map(async (filePath) => {
        try {
          const resp = await fetch(filePath);
          if (!resp.ok) return;
          const arrayBuf = await resp.arrayBuffer();
          const audioBuf = await ctx.decodeAudioData(arrayBuf);
          results[filePath] = audioBuf;
        } catch (err) {
          console.warn('Failed to load loop audio:', filePath, err);
        }
      }));
      if (!cancelled) {
        buffersRef.current = results;
        setAudioReady(true);
        setLoadingAudio(false);
      }
    };

    loadAll();

    return () => {
      cancelled = true;
      stopAllSources();
      ctx.close().catch(() => {});
    };
  }, [renderingCustom, placedLoops]); // Re-run after custom loops are rendered

  // Update master volume
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = volume;
    }
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  // Stop all active audio sources
  const stopAllSources = useCallback(() => {
    for (const s of sourcesRef.current) {
      try { s.source.stop(); } catch (_) {}
    }
    sourcesRef.current = [];
    playStartRef.current = null;
  }, []);

  // Schedule loop audio from a given timeline position
  const scheduleLoops = useCallback((fromTime) => {
    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;

    if (ctx.state === 'suspended') ctx.resume();

    stopAllSources();

    const now = ctx.currentTime;
    playStartRef.current = { ctxTime: now, timelineTime: fromTime };

    for (const loop of placedLoops) {
      if (loop.muted) continue;
      const buffer = buffersRef.current[loop.file];
      if (!buffer) continue;

      if (fromTime >= loop.endTime) continue;

      const loopDur = buffer.duration;
      const loopStart = Math.max(loop.startTime, fromTime);
      const delay = loopStart - fromTime;
      const elapsed = loopStart - loop.startTime;
      const offset = elapsed % loopDur;
      const remaining = loop.endTime - loopStart;

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.loopStart = 0;
      source.loopEnd = loopDur;

      const gain = ctx.createGain();
      gain.gain.value = loop.volume ?? 1;

      source.connect(gain);
      gain.connect(master);

      source.start(now + delay, offset, remaining);
      sourcesRef.current.push({ source, gain });
    }
  }, [placedLoops, stopAllSources]);

  // rAF loop for smooth playhead updates
  useEffect(() => {
    const tick = () => {
      const video = videoRef.current;
      if (video && !video.paused) {
        setCurrentTime(video.currentTime);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handlePlay = useCallback(() => {
    const video = videoRef.current;
    const t = video ? video.currentTime : currentTime;
    video?.play().catch(() => {});
    scheduleLoops(t);
    setIsPlaying(true);
  }, [currentTime, scheduleLoops]);

  const handlePause = useCallback(() => {
    videoRef.current?.pause();
    stopAllSources();
    setIsPlaying(false);
  }, [stopAllSources]);

  const handleSeek = useCallback((time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    setCurrentTime(time);
    if (isPlaying) {
      scheduleLoops(time);
    }
  }, [isPlaying, scheduleLoops]);

  const handleRestart = useCallback(() => {
    handleSeek(0);
    setTimeout(() => handlePlay(), 50);
  }, [handleSeek, handlePlay]);

  const handleSkipBack = useCallback(() => {
    handleSeek(Math.max(0, currentTime - 5));
  }, [currentTime, handleSeek]);

  const handleSkipForward = useCallback(() => {
    handleSeek(Math.min(duration, currentTime + 5));
  }, [currentTime, duration, handleSeek]);

  const handleTimelineClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    handleSeek(percent * duration);
  }, [duration, handleSeek]);

  const handleVideoEnded = useCallback(() => {
    stopAllSources();
    setIsPlaying(false);
  }, [stopAllSources]);

  const playheadPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Track layout
  const trackIndices = [...new Set(placedLoops.map(l => l.trackIndex))].sort((a, b) => a - b);
  const totalTracks = Math.max(4, Math.max(...trackIndices, 0) + 1, 8);
  const trackHeight = 32;
  const trackLabelWidth = 56;

  return (
    <div className="flex-1 flex flex-col bg-black overflow-hidden">
      {/* Loading overlay while audio buffers load */}
      {(loadingAudio || renderingCustom) && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
          <div className="text-center text-white">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-sm">{renderingCustom ? 'Rendering custom beats...' : 'Loading audio...'}</p>
          </div>
        </div>
      )}

      {/* Top: Video */}
      <div className={`bg-black flex items-center justify-center ${videoOnly ? 'flex-1' : 'flex-shrink-0'}`} style={videoOnly ? undefined : { height: '45%' }}>
        {videoPath ? (
          <video
            ref={videoRef}
            src={videoPath}
            className="h-full w-full object-contain"
            playsInline
            preload="auto"
            onEnded={handleVideoEnded}
          />
        ) : (
          <div className="text-gray-500 text-center">
            <Play size={48} className="mx-auto mb-2 opacity-50" />
            <p>No video available</p>
          </div>
        )}
      </div>

      {/* Middle: Loop track lanes */}
      {!videoOnly && <div className="flex-1 bg-gray-900 border-t border-gray-700 flex flex-col overflow-hidden">
        {/* Timeline divider */}
        <div className="h-1 bg-gray-800 border-b border-gray-700 flex-shrink-0" />

        {/* Track rows + loop blocks */}
        <div className="flex-1 relative overflow-hidden">
          {Array.from({ length: totalTracks }).map((_, i) => (
            <div
              key={i}
              className={`absolute left-0 right-0 border-b border-gray-800 flex ${
                i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-900/50'
              }`}
              style={{ top: i * trackHeight, height: trackHeight }}
            >
              <div
                className="flex-shrink-0 flex items-center px-1.5 border-r border-gray-700 bg-gray-800/30"
                style={{ width: trackLabelWidth }}
              >
                <span className="text-[9px] text-gray-500 truncate">Track {i + 1}</span>
              </div>
            </div>
          ))}

          {/* Loop blocks */}
          {placedLoops.map((loop) => {
            const leftPct = (loop.startTime / duration) * 100;
            const widthPct = ((loop.endTime - loop.startTime) / duration) * 100;
            const trackAreaFrac = 1 - trackLabelWidth / (window.innerWidth * 0.5 || 600);

            return (
              <div
                key={loop.id}
                className="absolute rounded overflow-hidden"
                style={{
                  left: `calc(${trackLabelWidth}px + ${leftPct * trackAreaFrac}%)`,
                  width: `${widthPct * trackAreaFrac}%`,
                  top: loop.trackIndex * trackHeight + 2,
                  height: trackHeight - 4,
                  backgroundColor: loop.color || '#3b82f6',
                  opacity: 0.9
                }}
              >
                <div className="px-1 py-0.5 text-[9px] text-white truncate font-medium">
                  {loop.name}
                </div>
              </div>
            );
          })}

          {/* Playhead — no transition for smooth rAF-driven movement */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
            style={{ left: `calc(${trackLabelWidth}px + ${playheadPercent * (1 - trackLabelWidth / (window.innerWidth * 0.5 || 600))}%)`, willChange: 'left' }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
          </div>
        </div>
      </div>}

      {/* Bottom: Transport controls */}
      <div className="flex-shrink-0 h-12 bg-gray-800 border-t border-gray-700 flex items-center justify-center gap-2 px-4">
        <button onClick={handleRestart} className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-colors" title="Restart">
          <RotateCcw size={14} />
        </button>
        <button onClick={handleSkipBack} className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-colors" title="Back 5s">
          <SkipBack size={14} />
        </button>
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          className="p-2.5 bg-blue-600 hover:bg-blue-500 rounded-full text-white transition-colors"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>
        <button onClick={handleSkipForward} className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-colors" title="Forward 5s">
          <SkipForward size={14} />
        </button>

        {/* Timeline scrubber */}
        <div className="flex-1 max-w-xs mx-2 h-1.5 bg-gray-700 rounded cursor-pointer relative" onClick={handleTimelineClick}>
          <div className="h-full bg-blue-600 rounded" style={{ width: `${playheadPercent}%` }} />
        </div>

        <div className="flex items-center gap-1.5 ml-1">
          <Volume2 size={14} className="text-gray-400" />
          <input
            type="range" min="0" max="1" step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {videoTitle && (
          <span className="text-[10px] text-gray-400 ml-2 truncate max-w-[100px]">{videoTitle}</span>
        )}

        {submittedAt && (
          <span className="text-[10px] text-gray-500 ml-auto">
            {new Date(submittedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default CompositionPreview;
