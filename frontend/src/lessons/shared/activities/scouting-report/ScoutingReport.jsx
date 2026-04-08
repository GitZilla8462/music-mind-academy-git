// ScoutingReport — Simplified 3-slide builder for Lesson 1.
// Reuses SlideCanvas from PressKitDesigner but with its own slide configs and storage.
// Paired with Artist Discovery in a tabbed layout so students can browse + build simultaneously.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Save, Check, BookOpen, Search, RotateCcw } from 'lucide-react';
import DirectionsModal from '../../components/DirectionsModal';
import { AudioProvider, useGlobalAudio } from '../artist-discovery/AudioContext';
import ArtistDiscovery from '../artist-discovery/ArtistDiscovery';
import MiniPlayer from '../artist-discovery/profile/MiniPlayer';
import SlideCanvas from '../press-kit-designer/components/SlideCanvas';
import ImagePickerModal from '../press-kit-designer/components/ImagePickerModal';
import { getPalette } from '../press-kit-designer/palettes';
import { renderSlideObject, CANVAS_W, CANVAS_H } from '../press-kit-designer/components/SlideCanvas';
import { SCOUTING_SLIDE_CONFIGS, generateScoutingTemplateObjects } from './scoutingReportConfig';
import { GENRE_SCOUTS_SLIDE_CONFIGS, generateGenreScoutsTemplateObjects } from './genreScoutsConfig';
import { loadScoutingReport, saveScoutingReport, getOrCreateScoutingReport } from './scoutingReportStorage';

const AUTOSAVE_INTERVAL = 30000;
const THUMB_W = 110;
const THUMB_SCALE = THUMB_W / CANVAS_W;

function ScoutingReportInner({ onComplete, viewMode, isSessionMode, variant = 'scouting-report' }) {
  const isGenreScouts = variant === 'genre-scouts';
  const slideConfigs = isGenreScouts ? GENRE_SCOUTS_SLIDE_CONFIGS : SCOUTING_SLIDE_CONFIGS;
  const generateTemplateObjects = isGenreScouts ? generateGenreScoutsTemplateObjects : generateScoutingTemplateObjects;
  const storageKey = isGenreScouts ? 'mma-genre-scouts-data' : 'mma-scouting-report-data';
  const activityTitle = isGenreScouts ? 'Genre Scouts' : 'Scouting Report';
  const [report, setReport] = useState(null);
  const [activeSlide, setActiveSlide] = useState(1);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [activeTab, setActiveTab] = useState('discover'); // start on discover so they browse first
  const reportRef = useRef(null);
  const saveTimerRef = useRef(null);
  const imageCallbackRef = useRef(null);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);

  const audio = useGlobalAudio();

  // Directions modal
  const directionsKey = `mma-${variant || 'scouting-report'}-directions-seen`;
  const [showDirections, setShowDirections] = useState(() => !localStorage.getItem(directionsKey));
  const closeDirections = () => {
    setShowDirections(false);
    localStorage.setItem(directionsKey, 'true');
  };

  const DIRECTIONS_STEPS = isGenreScouts
    ? [
        { text: 'Browse artists and listen to tracks across different genres' },
        { text: 'Star artists that catch your ear' },
        { text: 'Switch to "My Report" to build your slides' },
        { text: 'Fill in all 3 slides — your progress shows at the top' },
      ]
    : [
        { text: 'Browse the artist library — listen to tracks across genres' },
        { text: 'Star artists that catch your ear' },
        { text: 'Switch to "My Report" to build your 3 slides' },
        { text: 'Slide 1: Top 5 Artists, Slide 2: #1 Pick, Slide 3: What I Notice' },
      ];

  useEffect(() => { reportRef.current = report; }, [report]);

  // Image picker — listen for SlideCanvas custom event
  useEffect(() => {
    const handler = (e) => {
      imageCallbackRef.current = e.detail?.callback || null;
      setImagePickerOpen(true);
    };
    window.addEventListener('press-kit-add-image', handler);
    return () => window.removeEventListener('press-kit-add-image', handler);
  }, []);

  const handleImageSelect = useCallback((imageData) => {
    if (imageCallbackRef.current) {
      imageCallbackRef.current(imageData);
      imageCallbackRef.current = null;
    }
    setImagePickerOpen(false);
  }, []);

  // Init
  useEffect(() => {
    let r = loadScoutingReport(storageKey, slideConfigs);
    if (!r) r = getOrCreateScoutingReport(storageKey, slideConfigs);

    // Generate template objects for any empty slides
    r.slides = r.slides.map((slide, i) => {
      if (!slide.objects || slide.objects.length === 0) {
        return { ...slide, objects: generateTemplateObjects(i + 1, slide.fields || {}) };
      }
      return slide;
    });

    setReport(r);
  }, [storageKey, slideConfigs, generateTemplateObjects]);

  // Autosave
  useEffect(() => {
    saveTimerRef.current = setInterval(() => {
      if (reportRef.current) {
        setSaveStatus('saving');
        saveScoutingReport(reportRef.current, storageKey, isGenreScouts ? 'mj-genre-scouts' : undefined, isGenreScouts ? 'mj-lesson1' : undefined);
        setTimeout(() => setSaveStatus('saved'), 600);
        setTimeout(() => setSaveStatus('idle'), 2500);
      }
    }, AUTOSAVE_INTERVAL);
    return () => clearInterval(saveTimerRef.current);
  }, [storageKey, isGenreScouts]);

  useEffect(() => {
    return () => { if (reportRef.current) saveScoutingReport(reportRef.current, storageKey, isGenreScouts ? 'mj-genre-scouts' : undefined, isGenreScouts ? 'mj-lesson1' : undefined); };
  }, [storageKey, isGenreScouts]);

  const handleSave = useCallback(() => {
    if (!report) return;
    setSaveStatus('saving');
    saveScoutingReport(report, storageKey, isGenreScouts ? 'mj-genre-scouts' : undefined, isGenreScouts ? 'mj-lesson1' : undefined);
    setTimeout(() => setSaveStatus('saved'), 400);
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, [report, storageKey, isGenreScouts]);

  const handleUpdateSlide = useCallback((updates) => {
    setReport(prev => {
      if (!prev) return prev;
      const idx = activeSlide - 1;
      const newSlides = [...prev.slides];
      newSlides[idx] = { ...newSlides[idx], ...updates };
      return { ...prev, slides: newSlides };
    });
  }, [activeSlide]);

  const handleObjectsChange = useCallback((newObjects) => {
    handleUpdateSlide({ objects: newObjects });
  }, [handleUpdateSlide]);

  const handleResetTemplate = useCallback(() => {
    if (!report) return;
    const idx = activeSlide - 1;
    const slide = report.slides[idx];
    const newObjects = generateTemplateObjects(activeSlide, slide.fields || {});
    handleUpdateSlide({ objects: newObjects });
  }, [activeSlide, report, handleUpdateSlide, generateTemplateObjects]);

  const handleComplete = useCallback(() => {
    if (report) saveScoutingReport(report, storageKey, isGenreScouts ? 'mj-genre-scouts' : undefined, isGenreScouts ? 'mj-lesson1' : undefined);
    if (onComplete) onComplete();
  }, [report, onComplete, storageKey, isGenreScouts]);

  // Slide completion — student marks each slide done manually
  const completionKey = `${storageKey}-completed`;
  const [slidesDone, setSlidesDone] = useState(() => {
    try { return JSON.parse(localStorage.getItem(completionKey)) || {}; } catch { return {}; }
  });
  const toggleSlideDone = useCallback((slideNum) => {
    setSlidesDone(prev => {
      const next = { ...prev, [slideNum]: !prev[slideNum] };
      localStorage.setItem(completionKey, JSON.stringify(next));
      return next;
    });
  }, [completionKey]);
  const slidesCompleted = slideConfigs.filter((_, i) => slidesDone[i + 1]).length;
  const totalSlides = slideConfigs.length;

  if (!report) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#0f1419' }}>
        <p className="text-white/40 text-sm">Loading {activityTitle}...</p>
      </div>
    );
  }

  const currentSlide = report.slides[activeSlide - 1];
  const palette = getPalette('genre', '');
  const hasAudioPlaying = audio?.currentTrack != null;

  return (
    <div className="h-screen flex flex-col" style={{ background: '#1a2744' }}>
      {/* Directions modal */}
      <DirectionsModal
        title={activityTitle}
        isOpen={showDirections}
        onClose={closeDirections}
        steps={DIRECTIONS_STEPS}
      />

      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-white/10" style={{ background: '#0f1b2e' }}>
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen size={18} className="text-amber-400" />
            {activityTitle}
          </h1>
          {/* Tab buttons */}
          <div className="flex bg-white/5 rounded-lg p-0.5 ml-3">
            <button
              onClick={() => setActiveTab('discover')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'discover'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Search size={12} /> Explore Artists
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`px-3 py-2 rounded text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'report'
                  ? 'bg-amber-500/20 text-amber-300'
                  : slidesCompleted === 0
                    ? 'bg-red-500/15 text-red-300 hover:bg-red-500/25 animate-pulse'
                    : slidesCompleted < totalSlides
                      ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
              }`}
            >
              <BookOpen size={12} /> My Report
            </button>
          </div>
          {/* Progress text */}
          <span className={`text-xs font-bold ${slidesCompleted === 0 ? 'text-red-400' : slidesCompleted < totalSlides ? 'text-amber-400' : 'text-emerald-400'}`}>
            {slidesCompleted}/{totalSlides} Slides Completed
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Save status */}
          <span className="text-[10px] text-white/30">
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : ''}
          </span>
          <button
            onClick={handleSave}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded text-xs text-white/50 hover:text-white/70 flex items-center gap-1 transition-colors"
          >
            <Save size={12} /> Save
          </button>
          {!viewMode && onComplete && (
            <button
              onClick={handleComplete}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs text-white font-medium flex items-center gap-1 transition-colors"
            >
              <Check size={12} /> Done
            </button>
          )}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Artist Discovery (always mounted, hidden when on report tab) */}
        <div
          className="flex-1 overflow-hidden"
          style={{ display: activeTab === 'discover' ? 'block' : 'none', background: '#0f1419' }}
        >
          <div className="h-full overflow-y-auto">
            <ArtistDiscovery isSessionMode={isSessionMode} hideMiniPlayer />
          </div>
        </div>

        {/* Report builder */}
        <div
          className="flex-1 flex overflow-hidden min-h-0"
          style={{ display: activeTab === 'report' ? 'flex' : 'none' }}
        >
          {/* Slide thumbnails */}
          <div className="flex-shrink-0 flex flex-col gap-2 p-2 overflow-y-auto border-r border-white/[0.06]" style={{ width: 140, background: '#0f1b2e' }}>
            {slideConfigs.map((cfg, i) => {
              const slideNum = cfg.number;
              const slide = report.slides[i];
              const isActive = activeSlide === slideNum;

              return (
                <div key={slideNum} className="flex flex-col gap-0.5">
                  <button
                    onClick={() => setActiveSlide(slideNum)}
                    className={`relative flex flex-col rounded-lg overflow-hidden transition-all ${
                      isActive
                        ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-400/10'
                        : 'ring-1 ring-white/[0.08] hover:ring-white/20'
                    }`}
                  >
                    <div className="absolute top-1 left-1 z-10">
                      <span className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold ${
                        isActive ? 'bg-amber-400 text-black' : 'bg-black/50 text-white/70'
                      }`}>
                        {slideNum}
                      </span>
                    </div>

                    <div
                      className="relative w-full overflow-hidden pointer-events-none"
                      style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}`, background: palette.bg }}
                    >
                      {(slide?.objects || []).map(obj => (
                        <div
                          key={obj.id}
                          style={{
                            position: 'absolute',
                            left: obj.x * THUMB_SCALE,
                            top: obj.y * THUMB_SCALE,
                          }}
                        >
                          {renderSlideObject(obj, THUMB_SCALE)}
                        </div>
                      ))}
                      {(!slide?.objects || slide.objects.length === 0) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] text-white/20">{cfg.title}</span>
                        </div>
                      )}
                    </div>

                    <div className={`px-1.5 py-1 text-[10px] font-medium truncate ${
                      isActive ? 'text-amber-400' : 'text-white/40'
                    }`} style={{ background: '#0d1520' }}>
                      {cfg.title}
                    </div>
                  </button>
                  {!viewMode && (
                    <button
                      onClick={() => toggleSlideDone(slideNum)}
                      className={`flex items-center justify-center gap-1 w-full py-1 rounded text-[10px] font-medium transition-all ${
                        slidesDone[slideNum]
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded border flex items-center justify-center ${
                        slidesDone[slideNum] ? 'border-emerald-400 bg-emerald-500/30' : 'border-red-400/50'
                      }`}>
                        {slidesDone[slideNum] && <Check size={8} />}
                      </div>
                      {slidesDone[slideNum] ? 'Done' : 'Mark done'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Canvas */}
          <div className="flex-1 flex flex-col items-center justify-center p-3 min-h-0 overflow-y-auto" style={{ background: '#202530' }}>
            <div className="w-full" style={{ maxWidth: 780 }}>
              <SlideCanvas
                objects={currentSlide.objects || []}
                paletteId={currentSlide.palette || 'genre'}
                genre=""
                onChange={handleObjectsChange}
                readOnly={viewMode}
              />
            </div>
            {!viewMode && (
              <button
                onClick={handleResetTemplate}
                className="mt-1.5 flex items-center gap-1 px-2.5 py-1 rounded text-[10px] text-white/25 hover:text-white/50 hover:bg-white/[0.04] transition-colors"
              >
                <RotateCcw size={10} /> Reset to template
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Image picker modal */}
      <ImagePickerModal
        isOpen={imagePickerOpen}
        onClose={() => { setImagePickerOpen(false); imageCallbackRef.current = null; }}
        onSelect={handleImageSelect}
      />

      {/* Mini player */}
      {hasAudioPlaying && (
        <MiniPlayer
          currentTrack={audio.currentTrack}
          isPlaying={audio.isPlaying}
          progress={audio.progress}
          currentTime={audio.currentTime}
          duration={audio.duration}
          onTogglePlay={audio.togglePlay}
          onNext={audio.next}
          onPrev={audio.prev}
          onSeek={audio.seek}
          volume={audio.volume}
          onVolumeChange={audio.setVolume}
          imageUrl={audio.artistImageUrl}
          artistName={audio.artistName}
          onArtistClick={() => setActiveTab('discover')}
        />
      )}
    </div>
  );
}

const ScoutingReport = ({ variant, ...props }) => (
  <AudioProvider>
    <ScoutingReportInner {...props} variant={variant} />
  </AudioProvider>
);

export default ScoutingReport;
