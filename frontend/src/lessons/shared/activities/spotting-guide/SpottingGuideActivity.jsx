// SpottingGuideActivity.jsx
// Film Music Lesson 3: Plan Your Score
// Students choose a film, watch it, add scene breaks, and plan their music for each scene.
// Data saves for use in Lesson 4 composing.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Plus, Trash2, ChevronDown, ChevronUp, Check, Volume2, VolumeX, Film, Scissors, Music, HelpCircle } from 'lucide-react';
import { FILM_LIBRARY, MOOD_OPTIONS, CHARACTER_TYPES, INSTRUMENT_OPTIONS, SCENE_COLORS } from '../../../film-music/lesson3/filmLibrary';
import { saveSpottingGuide, getSpottingGuide } from '../../../film-music/lesson3/lesson3StorageUtils';
import { saveStudentWork, getStudentId, getClassAuthInfo } from '../../../../utils/studentWorkStorage';
import DirectionsModal from '../../components/DirectionsModal';

const ACTIVITY_ID = 'fm-spotting-guide';
const VIEW_ROUTE = '/lessons/film-music/lesson3?view=saved';
const MIN_SCENE_LENGTH = 2; // seconds

// ============================================================
// FORMAT TIME HELPER
// ============================================================
const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// ============================================================
// FILM PICKER
// ============================================================
const FilmPicker = ({ onSelect }) => (
  <div className="h-screen bg-gray-900 flex flex-col items-center p-6 overflow-auto">
    <div className="text-5xl mb-4 mt-4">🎬</div>
    <h1 className="text-3xl font-bold text-white mb-2">Choose Your Film</h1>
    <p className="text-gray-400 mb-6 text-center max-w-lg">
      Pick a film to score for your final project. You'll watch it, break it into scenes, and plan your music.
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl pb-6">
      {FILM_LIBRARY.map(film => (
        <button key={film.id} onClick={() => onSelect(film)}
          className="bg-white/5 hover:bg-white/10 rounded-2xl p-4 text-left transition-all border border-transparent hover:border-orange-500 group">
          <div className="aspect-video bg-gray-800 rounded-xl mb-3 flex items-center justify-center overflow-hidden relative">
            {film.thumbnail ? (
              <img src={film.thumbnail} alt={film.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
            ) : null}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Film size={24} className="text-white" />
              </div>
            </div>
            <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white font-bold">
              {formatTime(film.duration)}
            </div>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">{film.title}</h3>
          <p className="text-sm text-gray-400 mb-2">{film.description}</p>
          {film.background && (
            <p className="text-xs text-gray-500 mb-2 italic">{film.background}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex gap-1 flex-wrap">
              {(film.tags || []).map(tag => (
                <span key={tag} className="text-[9px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
            <span className="text-xs text-orange-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              Choose →
            </span>
          </div>
        </button>
      ))}
    </div>
  </div>
);

// ============================================================
// SCENE TIMELINE BAR
// ============================================================
const SceneTimeline = ({ scenes, totalDuration, activeSceneId, onSceneClick }) => {
  if (scenes.length === 0 || totalDuration === 0) return null;
  return (
    <div className="flex h-8 rounded-lg overflow-hidden border border-gray-700 flex-shrink-0">
      {scenes.map((scene, i) => {
        const width = ((scene.endTime - scene.startTime) / totalDuration) * 100;
        const color = SCENE_COLORS[i % SCENE_COLORS.length];
        const isActive = scene.id === activeSceneId;
        return (
          <button key={scene.id} onClick={() => onSceneClick(scene)}
            className={`flex items-center justify-center text-[10px] font-bold text-white transition-all ${isActive ? 'ring-2 ring-white ring-inset' : 'hover:brightness-125'}`}
            style={{ width: `${width}%`, backgroundColor: color, minWidth: 20 }}>
            {width > 5 && `S${i + 1}`}
          </button>
        );
      })}
    </div>
  );
};

// ============================================================
// SCENE CARD
// ============================================================
const SceneCard = ({ scene, index, color, onUpdate, onDelete, onPlayScene, canDelete }) => {
  const [expanded, setExpanded] = useState(true);

  const updateField = (field, value) => {
    onUpdate(scene.id, { ...scene, [field]: value });
  };

  return (
    <div className="bg-white/5 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}>
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ backgroundColor: color }}>
          {index + 1}
        </div>
        <span className="text-white font-semibold text-sm flex-1 text-left">
          Scene {index + 1}
          <span className="text-gray-500 font-normal ml-2">{formatTime(scene.startTime)} – {formatTime(scene.endTime)}</span>
        </span>
        <button onClick={(e) => { e.stopPropagation(); onPlayScene(scene.startTime); }}
          className="p-1 rounded bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600 transition-colors">
          <Play size={12} />
        </button>
        {canDelete && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(scene.id); }}
            className="p-1 rounded bg-gray-700 text-gray-400 hover:text-red-400 hover:bg-gray-600 transition-colors">
            <Trash2 size={12} />
          </button>
        )}
        {expanded ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
      </div>

      {/* Body */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2.5 border-t border-gray-700/50 pt-2.5">
          {/* What's happening */}
          <div>
            <label className="text-gray-400 text-[10px] font-bold uppercase">What's Happening?</label>
            <input type="text" value={scene.description} onChange={e => updateField('description', e.target.value)}
              placeholder="e.g. Engineer working alone at desk..."
              maxLength={100}
              className="w-full mt-0.5 px-2 py-1.5 bg-gray-800 text-white text-xs rounded border border-gray-600 focus:border-orange-500 focus:outline-none" />
          </div>

          {/* Character Type */}
          <div>
            <label className="text-gray-400 text-[10px] font-bold uppercase">Character Type</label>
            <div className="flex gap-1 mt-0.5 flex-wrap">
              {CHARACTER_TYPES.map(t => (
                <button key={t.id} onClick={() => updateField('characterType', t.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                    scene.characterType === t.id ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}>
                  <span>{t.emoji}</span> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Instrument + Mood row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-gray-400 text-[10px] font-bold uppercase">Instrument</label>
              <select value={scene.instrument} onChange={e => updateField('instrument', e.target.value)}
                className="w-full mt-0.5 px-2 py-1.5 bg-gray-800 text-white text-xs rounded border border-gray-600 focus:border-orange-500 focus:outline-none">
                <option value="">Pick one...</option>
                {INSTRUMENT_OPTIONS.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-gray-400 text-[10px] font-bold uppercase">Mood</label>
              <div className="flex gap-0.5 mt-0.5 flex-wrap">
                {MOOD_OPTIONS.map(m => (
                  <button key={m.id} onClick={() => updateField('mood', m.id)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-colors ${
                      scene.mood === m.id ? 'text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                    style={scene.mood === m.id ? { backgroundColor: m.color } : {}}>
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Music or Silence + SFX row */}
          <div className="flex gap-3">
            <div>
              <label className="text-gray-400 text-[10px] font-bold uppercase">Music or Silence?</label>
              <div className="flex gap-1 mt-0.5">
                <button onClick={() => updateField('musicOrSilence', 'music')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                    scene.musicOrSilence === 'music' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}>
                  <Volume2 size={12} /> Music
                </button>
                <button onClick={() => updateField('musicOrSilence', 'silence')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                    scene.musicOrSilence === 'silence' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}>
                  <VolumeX size={12} /> Silence
                </button>
              </div>
            </div>
            <div className="flex-1">
              <label className="text-gray-400 text-[10px] font-bold uppercase">SFX Ideas</label>
              <input type="text" value={scene.sfxIdeas} onChange={e => updateField('sfxIdeas', e.target.value)}
                placeholder="e.g. footsteps, crash, wind..."
                maxLength={80}
                className="w-full mt-0.5 px-2 py-1.5 bg-gray-800 text-white text-xs rounded border border-gray-600 focus:border-orange-500 focus:outline-none" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// DIRECTIONS PAGES
// ============================================================
const DIRECTIONS_PAGES = [
  {
    title: 'Plan Your Score',
    items: [
      'Watch your film all the way through first',
      'Then watch again and click "Add Scene Break" whenever the mood, action, or character changes',
      'The film will be split into scenes at each break point',
      'You decide where the scenes are — that\'s what real composers do!'
    ]
  },
  {
    title: 'Fill Out Your Plan',
    items: [
      'For each scene, describe what\'s happening',
      'Pick a character type, instrument, and mood that fits',
      'Decide: music or silence? Sometimes silence is more powerful!',
      'Add SFX ideas (footsteps, wind, crashes, etc.)',
      'This plan will be your guide when you compose next class'
    ]
  }
];

// ============================================================
// MAIN COMPONENT
// ============================================================
const SpottingGuideActivity = ({ onComplete, isSessionMode = false, viewMode = false }) => {
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [showDirections, setShowDirections] = useState(true);
  const [showSaved, setShowSaved] = useState(false);

  // Video state
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    const saved = getSpottingGuide();
    if (saved?.filmId) {
      const film = FILM_LIBRARY.find(f => f.id === saved.filmId);
      if (film) {
        setSelectedFilm(film);
        setScenes(saved.scenes || []);
        setShowDirections(false);
      }
    }
  }, []);

  // Auto-save on scene changes
  useEffect(() => {
    if (!selectedFilm || scenes.length === 0) return;
    const timeout = setTimeout(() => {
      saveSpottingGuide({
        filmId: selectedFilm.id,
        filmTitle: selectedFilm.title,
        scenes,
        totalDuration: videoDuration || selectedFilm.duration,
      });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [scenes, selectedFilm, videoDuration]);

  // Video time tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onLoaded = () => { setVideoDuration(video.duration); setVideoReady(true); };
    const onError = () => setVideoError(true);

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('error', onError);
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('error', onError);
    };
  }, [selectedFilm]);

  // ── Video controls ──
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  const seekTo = (time) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleScrub = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekTo(pct * videoDuration);
  };

  // ── Scene management ──
  const createDefaultScene = (startTime, endTime) => ({
    id: Date.now() + Math.random(),
    startTime,
    endTime,
    description: '',
    characterType: '',
    instrument: '',
    mood: '',
    musicOrSilence: 'music',
    sfxIdeas: '',
  });

  const addSceneBreak = useCallback(() => {
    const time = Math.round(currentTime * 10) / 10; // round to 0.1s
    const duration = videoDuration || selectedFilm?.duration || 0;
    if (duration === 0) return;

    setScenes(prev => {
      // If no scenes yet, create first scene from 0 to break, second from break to end
      if (prev.length === 0) {
        if (time < MIN_SCENE_LENGTH || duration - time < MIN_SCENE_LENGTH) {
          return [createDefaultScene(0, duration)];
        }
        return [
          createDefaultScene(0, time),
          createDefaultScene(time, duration),
        ];
      }

      // Find which scene the current time falls in
      const sceneIdx = prev.findIndex(s => time >= s.startTime && time < s.endTime);
      if (sceneIdx === -1) return prev;

      const scene = prev[sceneIdx];
      // Check minimum length
      if (time - scene.startTime < MIN_SCENE_LENGTH || scene.endTime - time < MIN_SCENE_LENGTH) return prev;

      // Split the scene
      const updated = [...prev];
      const newScene = createDefaultScene(time, scene.endTime);
      updated[sceneIdx] = { ...scene, endTime: time };
      updated.splice(sceneIdx + 1, 0, newScene);
      return updated;
    });
  }, [currentTime, videoDuration, selectedFilm]);

  const updateScene = useCallback((id, updated) => {
    setScenes(prev => prev.map(s => s.id === id ? updated : s));
  }, []);

  const deleteScene = useCallback((id) => {
    setScenes(prev => {
      if (prev.length <= 1) return prev;
      const idx = prev.findIndex(s => s.id === id);
      if (idx === -1) return prev;

      const updated = [...prev];
      if (idx > 0) {
        // Merge into previous scene
        updated[idx - 1] = { ...updated[idx - 1], endTime: updated[idx].endTime };
      } else {
        // First scene — extend next scene backward
        updated[1] = { ...updated[1], startTime: updated[0].startTime };
      }
      updated.splice(idx, 1);
      return updated;
    });
  }, []);

  // ── Film selection ──
  const handleFilmSelect = (film) => {
    setSelectedFilm(film);
    // Initialize with one scene covering the whole film
    setScenes([createDefaultScene(0, film.duration)]);
    setShowDirections(true);
  };

  // ── Save to Firebase ──
  const handleSave = useCallback(() => {
    if (!selectedFilm || scenes.length === 0) return;
    const data = {
      filmId: selectedFilm.id,
      filmTitle: selectedFilm.title,
      scenes,
      totalDuration: videoDuration || selectedFilm.duration,
      completedAt: new Date().toISOString(),
    };
    saveSpottingGuide(data);

    const studentId = getStudentId();
    const authInfo = getClassAuthInfo();
    saveStudentWork(ACTIVITY_ID, {
      title: 'Spotting Guide',
      emoji: '🎬',
      viewRoute: VIEW_ROUTE,
      subtitle: `${selectedFilm.title} • ${scenes.length} scenes`,
      category: 'Film Music: Scoring the Story',
      lessonId: 'fms-lesson3',
      data,
    }, studentId, authInfo);

    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  }, [selectedFilm, scenes, videoDuration]);

  // ── Film picker phase ──
  if (!selectedFilm) {
    return <FilmPicker onSelect={handleFilmSelect} />;
  }

  // ── Main spotting guide ──
  const scrubPct = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;

  return (
    <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Film size={16} className="text-orange-400" />
          <span className="text-white font-semibold text-sm">{selectedFilm.title}</span>
          <span className="text-gray-500 text-xs">• {scenes.length} scene{scenes.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-2">
          {showSaved && (
            <span className="text-green-400 text-xs flex items-center gap-1"><Check size={12} /> Saved</span>
          )}
          <button onClick={handleSave}
            className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-colors">
            <Check size={12} /> Save
          </button>
          <button onClick={() => setShowDirections(true)}
            className="flex items-center gap-1 px-2 py-1 bg-gray-700 text-gray-300 rounded-lg text-xs hover:bg-gray-600 transition-colors">
            <HelpCircle size={12} /> Help
          </button>
        </div>
      </div>

      {/* Video Player */}
      <div className="flex-shrink-0 bg-black relative" style={{ height: '35vh' }}>
        {videoError ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Film size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Video not available yet</p>
              <p className="text-xs text-gray-600 mt-1">Upload to R2 first, then refresh</p>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={selectedFilm.videoUrl}
            className="w-full h-full object-contain"
            preload="metadata"
            playsInline
            onClick={togglePlay}
          />
        )}
        {/* Play overlay */}
        {!isPlaying && videoReady && (
          <button onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Play size={32} className="text-white ml-1" />
            </div>
          </button>
        )}
      </div>

      {/* Video Controls */}
      <div className="flex-shrink-0 px-3 py-1.5 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <button onClick={togglePlay} className="p-1 rounded text-gray-300 hover:text-white transition-colors">
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <span className="text-xs text-gray-400 tabular-nums w-16">{formatTime(currentTime)}</span>

          {/* Scrub bar */}
          <div className="flex-1 h-6 relative cursor-pointer group" onClick={handleScrub}>
            <div className="absolute top-2.5 left-0 right-0 h-1 bg-gray-700 rounded-full">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${scrubPct}%` }} />
            </div>
            {/* Scene break markers on scrub bar */}
            {scenes.slice(1).map((s, i) => {
              const pct = (s.startTime / videoDuration) * 100;
              return (
                <div key={i} className="absolute top-1 w-0.5 h-4 bg-yellow-400" style={{ left: `${pct}%` }} />
              );
            })}
            {/* Playhead */}
            <div className="absolute top-1 w-2 h-4 bg-white rounded-sm -translate-x-1/2"
              style={{ left: `${scrubPct}%` }} />
          </div>

          <span className="text-xs text-gray-400 tabular-nums w-16 text-right">{formatTime(videoDuration)}</span>

          {/* Add Scene Break button */}
          <button onClick={addSceneBreak}
            disabled={!videoReady}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              videoReady
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}>
            <Scissors size={13} /> Add Scene Break
          </button>
        </div>
      </div>

      {/* Scene Timeline */}
      <div className="flex-shrink-0 px-3 py-1">
        <SceneTimeline
          scenes={scenes}
          totalDuration={videoDuration || selectedFilm.duration}
          activeSceneId={scenes.find(s => currentTime >= s.startTime && currentTime < s.endTime)?.id}
          onSceneClick={(scene) => seekTo(scene.startTime)}
        />
      </div>

      {/* Scene Cards */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0">
        {scenes.map((scene, i) => (
          <SceneCard
            key={scene.id}
            scene={scene}
            index={i}
            color={SCENE_COLORS[i % SCENE_COLORS.length]}
            onUpdate={updateScene}
            onDelete={deleteScene}
            onPlayScene={seekTo}
            canDelete={scenes.length > 1}
          />
        ))}
      </div>

      {/* Directions modal */}
      <DirectionsModal
        title="Spotting Guide"
        isOpen={showDirections}
        pages={DIRECTIONS_PAGES}
        onClose={() => setShowDirections(false)}
      />
    </div>
  );
};

export default SpottingGuideActivity;
