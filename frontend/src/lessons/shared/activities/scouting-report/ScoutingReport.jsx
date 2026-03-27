// ScoutingReport — Simplified 3-slide builder for Lesson 1.
// Reuses SlideCanvas from PressKitDesigner but with its own slide configs and storage.
// Paired with Artist Discovery in a tabbed layout so students can browse + build simultaneously.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Save, Check, BookOpen, Search, RotateCcw } from 'lucide-react';
import { AudioProvider, useGlobalAudio } from '../artist-discovery/AudioContext';
import ArtistDiscovery from '../artist-discovery/ArtistDiscovery';
import MiniPlayer from '../artist-discovery/profile/MiniPlayer';
import SlideCanvas from '../press-kit-designer/components/SlideCanvas';
import { getPalette } from '../press-kit-designer/palettes';
import { renderSlideObject, CANVAS_W, CANVAS_H } from '../press-kit-designer/components/SlideCanvas';
import { SCOUTING_SLIDE_CONFIGS, generateScoutingTemplateObjects } from './scoutingReportConfig';
import { loadScoutingReport, saveScoutingReport, getOrCreateScoutingReport } from './scoutingReportStorage';

const AUTOSAVE_INTERVAL = 30000;
const THUMB_W = 110;
const THUMB_SCALE = THUMB_W / CANVAS_W;

function ScoutingReportInner({ onComplete, viewMode, isSessionMode }) {
  const [report, setReport] = useState(null);
  const [activeSlide, setActiveSlide] = useState(1);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [activeTab, setActiveTab] = useState('discover'); // start on discover so they browse first
  const reportRef = useRef(null);
  const saveTimerRef = useRef(null);

  const audio = useGlobalAudio();

  useEffect(() => { reportRef.current = report; }, [report]);

  // Init
  useEffect(() => {
    let r = loadScoutingReport();
    if (!r) r = getOrCreateScoutingReport();

    // Generate template objects for any empty slides
    r.slides = r.slides.map((slide, i) => {
      if (!slide.objects || slide.objects.length === 0) {
        return { ...slide, objects: generateScoutingTemplateObjects(i + 1, slide.fields || {}) };
      }
      return slide;
    });

    setReport(r);
  }, []);

  // Autosave
  useEffect(() => {
    saveTimerRef.current = setInterval(() => {
      if (reportRef.current) {
        setSaveStatus('saving');
        saveScoutingReport(reportRef.current);
        setTimeout(() => setSaveStatus('saved'), 600);
        setTimeout(() => setSaveStatus('idle'), 2500);
      }
    }, AUTOSAVE_INTERVAL);
    return () => clearInterval(saveTimerRef.current);
  }, []);

  useEffect(() => {
    return () => { if (reportRef.current) saveScoutingReport(reportRef.current); };
  }, []);

  const handleSave = useCallback(() => {
    if (!report) return;
    setSaveStatus('saving');
    saveScoutingReport(report);
    setTimeout(() => setSaveStatus('saved'), 400);
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, [report]);

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
    const newObjects = generateScoutingTemplateObjects(activeSlide, slide.fields || {});
    handleUpdateSlide({ objects: newObjects });
  }, [activeSlide, report, handleUpdateSlide]);

  const handleComplete = useCallback(() => {
    if (report) saveScoutingReport(report);
    if (onComplete) onComplete();
  }, [report, onComplete]);

  if (!report) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#0f1419' }}>
        <p className="text-white/40 text-sm">Loading Scouting Report...</p>
      </div>
    );
  }

  const currentSlide = report.slides[activeSlide - 1];
  const palette = getPalette('genre', '');
  const hasAudioPlaying = audio?.currentTrack != null;

  return (
    <div className="h-screen flex flex-col" style={{ background: '#1a2744' }}>
      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-white/10" style={{ background: '#0f1b2e' }}>
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen size={18} className="text-amber-400" />
            Scouting Report
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
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'report'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <BookOpen size={12} /> My Report
            </button>
          </div>
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
            {SCOUTING_SLIDE_CONFIGS.map((cfg, i) => {
              const slideNum = cfg.number;
              const slide = report.slides[i];
              const isActive = activeSlide === slideNum;

              return (
                <button
                  key={slideNum}
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
              );
            })}
          </div>

          {/* Canvas */}
          <div className="flex-1 flex flex-col items-center justify-center p-3 overflow-hidden" style={{ background: '#202530' }}>
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

const ScoutingReport = (props) => (
  <AudioProvider>
    <ScoutingReportInner {...props} />
  </AudioProvider>
);

export default ScoutingReport;
