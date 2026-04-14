// ScoutingReport — Simplified 3-slide builder for Lesson 1.
// Reuses SlideCanvas from PressKitDesigner but with its own slide configs and storage.
// Paired with Artist Discovery in a tabbed layout so students can browse + build simultaneously.

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Save, Check, BookOpen, Search, RotateCcw, Plus, CheckCircle, Eye, HelpCircle } from 'lucide-react';
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
import { CLAIM_ARTIST_SLIDE_CONFIGS, generateClaimArtistTemplateObjects } from './claimArtistConfig';
import { loadScoutingReport, saveScoutingReport, getOrCreateScoutingReport } from './scoutingReportStorage';
import { getDatabase, ref, onValue } from 'firebase/database';
import { getClassAuthInfo } from '../../../../utils/studentWorkStorage';

const AUTOSAVE_INTERVAL = 30000;
const THUMB_W = 110;
const THUMB_SCALE = THUMB_W / CANVAS_W;

function ScoutingReportInner({ onComplete, viewMode, isSessionMode, variant = 'scouting-report', forceShowDirections, hideDirectionsButton }) {
  const isGenreScouts = variant === 'genre-scouts';
  const isClaimArtist = variant === 'claim-your-artist';
  const slideConfigs = isClaimArtist ? CLAIM_ARTIST_SLIDE_CONFIGS : isGenreScouts ? GENRE_SCOUTS_SLIDE_CONFIGS : SCOUTING_SLIDE_CONFIGS;
  const generateTemplateObjects = isClaimArtist ? generateClaimArtistTemplateObjects : isGenreScouts ? generateGenreScoutsTemplateObjects : generateScoutingTemplateObjects;
  const storageKey = isClaimArtist ? 'mma-claim-artist-data' : isGenreScouts ? 'mma-genre-scouts-data' : 'mma-scouting-report-data';
  const activityTitle = isClaimArtist ? 'Scouting Report' : isGenreScouts ? 'Genre Scouts' : 'Scouting Report';
  const activityId = isClaimArtist ? 'mj-claim-artist' : isGenreScouts ? 'mj-genre-scouts' : undefined;
  const lessonId = isClaimArtist ? 'mj-lesson3' : isGenreScouts ? 'mj-lesson1' : undefined;
  const [report, setReport] = useState(null);
  const [activeSlide, setActiveSlide] = useState(1);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [activeTab, setActiveTab] = useState(isGenreScouts ? 'report' : 'discover');
  const reportRef = useRef(null);
  const saveTimerRef = useRef(null);
  const imageCallbackRef = useRef(null);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);

  const audio = useGlobalAudio();

  // Keyboard navigation: Up/Down arrows to switch slides (only when not typing in a text field)
  useEffect(() => {
    const handleKey = (e) => {
      if (activeTab !== 'report') return;
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSlide(prev => Math.max(1, prev - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSlide(prev => Math.min(slideConfigs.length, prev + 1));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeTab, slideConfigs.length]);

  // Responsive canvas max-width: on short viewports, shrink canvas so 16:9 ratio fits
  const [viewportH, setViewportH] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);
  useEffect(() => {
    const onResize = () => setViewportH(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  // Budget: top bar ~44px, journal strip ~36px, toolbar ~36px, padding ~24px = ~140px overhead
  const canvasMaxWidth = useMemo(() => {
    const available = viewportH - 140;
    const widthFromHeight = available * (960 / 540);
    return Math.min(780, Math.max(400, Math.round(widthFromHeight)));
  }, [viewportH]);

  // Directions modal
  const directionsKey = `mma-${variant || 'scouting-report'}-directions-seen`;
  const [showDirections, setShowDirections] = useState(() => forceShowDirections || !localStorage.getItem(directionsKey));
  const closeDirections = () => {
    setShowDirections(false);
    localStorage.setItem(directionsKey, 'true');
  };

  const DIRECTIONS_STEPS = isClaimArtist
    ? [
        { text: 'Browse the artist library — listen to tracks, read bios' },
        { text: 'Switch to "My Report" to fill out your slides' },
        { text: 'Each slide has example text filled in — click a text box, delete it, and type your own answer' },
        { text: 'Slide 1: Artist name, track, location, genre' },
        { text: 'Slide 2: Fill in the Four Points with specific details' },
        { text: 'Slide 3: Classify each statement as Fact/Opinion + Strong/Weak' },
        { text: 'Be sure to click "Mark as Done" under each slide when you are done' },
        { text: 'Done? Start a new report for another artist!' },
      ]
    : isGenreScouts
    ? [
        { text: 'Start by clicking "My Report" — look at your 3 slides and read the example text' },
        { text: 'Each slide has example text filled in — click a text box, delete it, and type your own words' },
        { text: 'Click "Explore Artists" to browse the library and listen to music across genres' },
        { text: 'Go back and forth between exploring and your report until all 3 slides are complete' },
        { text: 'Done early? Start a bonus report for another artist!' },
      ]
    : [
        { text: 'Browse the artist library — listen to tracks across genres' },
        { text: 'Star artists that catch your ear' },
        { text: 'Switch to "My Report" to build your 3 slides' },
        { text: 'Each slide has example text — click a text box, delete it, and type your own words' },
        { text: 'Slide 1: Top 5 Artists, Slide 2: #1 Pick, Slide 3: What I Notice' },
      ];

  const completedReportsRef = useRef([]);
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
        saveScoutingReport(reportRef.current, storageKey, activityId, lessonId, completedReportsRef.current);
        setTimeout(() => setSaveStatus('saved'), 600);
        setTimeout(() => setSaveStatus('idle'), 2500);
      }
    }, AUTOSAVE_INTERVAL);
    return () => clearInterval(saveTimerRef.current);
  }, [storageKey, activityId, lessonId]);

  useEffect(() => {
    return () => { if (reportRef.current) saveScoutingReport(reportRef.current, storageKey, activityId, lessonId, completedReportsRef.current); };
  }, [storageKey, activityId, lessonId]);

  // Save when page becomes hidden (Chromebook lid close, tab switch)
  useEffect(() => {
    if (viewMode) return;
    const handleVisibilityChange = () => {
      if (document.hidden && reportRef.current) {
        saveScoutingReport(reportRef.current, storageKey, activityId, lessonId, completedReportsRef.current);
      }
    };
    const handleBeforeUnload = () => {
      if (reportRef.current) saveScoutingReport(reportRef.current, storageKey, activityId, lessonId, completedReportsRef.current);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [viewMode, storageKey, activityId, lessonId]);

  // Listen for teacher "Save All" command
  const componentMountTimeRef = useRef(Date.now());
  const lastSaveCommandRef = useRef(null);
  useEffect(() => {
    if (!isSessionMode || viewMode) return;
    const auth = getClassAuthInfo();
    if (!auth?.classId) return;
    const db = getDatabase();
    const saveCommandRef = ref(db, `sessions/${auth.classId}/saveCommand`);
    const unsubscribe = onValue(saveCommandRef, (snapshot) => {
      const cmd = snapshot.val();
      if (!cmd || cmd <= componentMountTimeRef.current) {
        lastSaveCommandRef.current = cmd;
        return;
      }
      if (cmd !== lastSaveCommandRef.current) {
        lastSaveCommandRef.current = cmd;
        console.log('\uD83D\uDCBE Teacher save command received for scouting report');
        if (reportRef.current) {
          saveScoutingReport(reportRef.current, storageKey, activityId, lessonId, completedReportsRef.current);
        }
      }
    });
    return () => unsubscribe();
  }, [isSessionMode, viewMode, storageKey, activityId, lessonId]);

  const handleSave = useCallback(() => {
    if (!report) return;
    setSaveStatus('saving');
    saveScoutingReport(report, storageKey, activityId, lessonId, completedReportsRef.current);
    setTimeout(() => setSaveStatus('saved'), 400);
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, [report, storageKey, activityId, lessonId]);

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
  // Use actual report slide count (may differ from slideConfigs for bonus reports)
  const currentSlideCount = report?.slides?.length || slideConfigs.length;
  const slidesCompleted = Array.from({ length: currentSlideCount }, (_, i) => i + 1).filter(n => slidesDone[n]).length;
  const totalSlides = currentSlideCount;
  const allSlidesDone = slidesCompleted === totalSlides;

  // ── Multi-report support (like Listening Guide's multi-entry pattern) ──
  const reportsKey = `${storageKey}-completed-reports`;
  const [completedReports, setCompletedReports] = useState(() => {
    try { return JSON.parse(localStorage.getItem(reportsKey)) || []; } catch { return []; }
  });
  useEffect(() => { completedReportsRef.current = completedReports; }, [completedReports]);
  const [viewingReportIndex, setViewingReportIndex] = useState(null); // null = editing current
  const isViewingCompleted = viewingReportIndex !== null;

  // Allow palette change on completed reports
  const handleCompletedPaletteChange = useCallback((paletteId) => {
    if (viewingReportIndex === null) return;
    setCompletedReports(prev => {
      const updated = [...prev];
      const cr = { ...updated[viewingReportIndex] };
      const rep = { ...cr.report };
      const newSlides = [...rep.slides];
      const idx = activeSlide - 1;
      newSlides[idx] = { ...newSlides[idx], palette: paletteId };
      rep.slides = newSlides;
      cr.report = rep;
      updated[viewingReportIndex] = cr;
      localStorage.setItem(reportsKey, JSON.stringify(updated));
      return updated;
    });
  }, [viewingReportIndex, activeSlide, reportsKey]);

  // Allow editing completed reports in-place
  const handleCompletedObjectsChange = useCallback((newObjects) => {
    if (viewingReportIndex === null) return;
    setCompletedReports(prev => {
      const updated = [...prev];
      const cr = { ...updated[viewingReportIndex] };
      const rep = { ...cr.report };
      const newSlides = [...rep.slides];
      const idx = activeSlide - 1;
      newSlides[idx] = { ...newSlides[idx], objects: newObjects };
      rep.slides = newSlides;
      cr.report = rep;
      updated[viewingReportIndex] = cr;
      localStorage.setItem(reportsKey, JSON.stringify(updated));
      return updated;
    });
  }, [viewingReportIndex, activeSlide, reportsKey]);

  const handleComplete = useCallback(() => {
    if (report) saveScoutingReport(report, storageKey, activityId, lessonId);
    if (onComplete) onComplete();
  }, [report, onComplete, storageKey, activityId, lessonId]);

  const startNewReport = useCallback(() => {
    if (!report) return;
    // Save current report + slide completion state into completed array
    const artistName = report.slides[0]?.fields?.artistName || 'Untitled';
    const finished = {
      report: { ...report },
      slidesDone: { ...slidesDone },
      completedAt: new Date().toISOString(),
      artistName,
    };
    const updated = [...completedReports, finished];
    setCompletedReports(updated);
    localStorage.setItem(reportsKey, JSON.stringify(updated));

    // For genre scouts bonus: only 1 slide (Sound Snapshot)
    // For other variants: full slide set
    const bonusConfigs = isGenreScouts
      ? [{ ...slideConfigs[slideConfigs.length - 1], number: 1 }] // Sound Snapshot as slide 1
      : slideConfigs;

    const fresh = getOrCreateScoutingReport(null, bonusConfigs);
    fresh.slides = fresh.slides.map((slide, i) => ({
      ...slide,
      title: bonusConfigs[i]?.title || `Slide ${i + 1}`,
      objects: isGenreScouts
        ? generateTemplateObjects(slideConfigs.length, {}) // use Sound Snapshot generator (slide 3)
        : generateTemplateObjects(i + 1, {}),
    }));
    fresh.createdAt = new Date().toISOString();
    setReport(fresh);
    saveScoutingReport(fresh, storageKey, activityId, lessonId);

    // Reset slide completion
    setSlidesDone({});
    localStorage.setItem(completionKey, JSON.stringify({}));
    setActiveSlide(1);
    setViewingReportIndex(null);
  }, [report, slidesDone, completedReports, reportsKey, slideConfigs, generateTemplateObjects, storageKey, activityId, lessonId, completionKey]);

  const totalReportsComplete = completedReports.length + (allSlidesDone ? 1 : 0);

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
      <div className="flex-shrink-0 flex items-center justify-between px-3 py-1 border-b border-white/10" style={{ background: '#0f1b2e' }}>
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
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
              onClick={() => { setActiveTab('report'); setViewingReportIndex(null); }}
              className={`px-3 py-2 rounded text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'report'
                  ? 'bg-amber-500/20 text-amber-300'
                  : slidesCompleted === 0 && completedReports.length === 0
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
          <div className="flex items-center gap-2">
            {totalReportsComplete === 0 && !allSlidesDone ? (
              <span className={`text-xs font-bold ${slidesCompleted === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                {slidesCompleted}/{totalSlides} Slides Complete
              </span>
            ) : (
              <span className="text-xs font-bold text-emerald-400">
                {totalReportsComplete} Scouting Report{totalReportsComplete !== 1 ? 's' : ''} Complete — keep making more until time is up!
              </span>
            )}
            {!viewMode && (
              <button
                onClick={() => {
                  // Auto-mark all slides as done when starting a new report
                  if (!allSlidesDone) {
                    const allDone = {};
                    for (let i = 1; i <= totalSlides; i++) allDone[i] = true;
                    setSlidesDone(allDone);
                    localStorage.setItem(completionKey, JSON.stringify(allDone));
                  }
                  startNewReport();
                }}
                className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                title="Start a new Scouting Report"
              >
                <Plus size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!hideDirectionsButton && (
            <button
              onClick={() => setShowDirections(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 transition-colors"
            >
              <HelpCircle size={12} /> Directions
            </button>
          )}
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
          className="flex-1 flex flex-col overflow-hidden min-h-0"
          style={{ display: activeTab === 'report' ? 'flex' : 'none' }}
        >
          {/* Journal strip — shows completed reports + current */}
          {(completedReports.length > 0 || slidesCompleted > 0) && (
            <div className="shrink-0 px-3 py-2 bg-[#0d1117] border-b border-white/[0.06]">
              <div className="flex items-center gap-2 overflow-x-auto">
                {completedReports.map((cr, i) => (
                  <button
                    key={i}
                    onClick={() => setViewingReportIndex(i)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      viewingReportIndex === i
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                        : 'bg-white/[0.04] text-white/50 hover:bg-white/[0.08] border border-white/[0.06]'
                    }`}
                  >
                    <CheckCircle size={12} className="text-emerald-400" />
                    <span className="max-w-[120px] truncate">Artist {i + 1}</span>
                  </button>
                ))}
                {/* Current report chip */}
                <button
                  onClick={() => setViewingReportIndex(null)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewingReportIndex === null
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                      : 'bg-white/[0.04] text-white/50 hover:bg-white/[0.08] border border-white/[0.06]'
                  }`}
                >
                  {allSlidesDone
                    ? <CheckCircle size={12} className="text-emerald-400" />
                    : <BookOpen size={12} />
                  }
                  <span className="max-w-[120px] truncate">
                    Artist {completedReports.length + 1}
                  </span>
                </button>
                {/* Plus button — start new report */}
                {!viewMode && (
                  <button
                    onClick={() => {
                      if (!allSlidesDone) {
                        if (!window.confirm(`You have ${totalSlides - slidesCompleted} slide${totalSlides - slidesCompleted !== 1 ? 's' : ''} not marked as done. Start a new report anyway?`)) return;
                        const allDone = {};
                        for (let i = 1; i <= totalSlides; i++) allDone[i] = true;
                        setSlidesDone(allDone);
                        localStorage.setItem(completionKey, JSON.stringify(allDone));
                      }
                      startNewReport();
                    }}
                    className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
                    title="Start a new Scouting Report for another artist"
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Slide thumbnails */}
          <div className="flex-shrink-0 flex flex-col gap-2 p-2 overflow-y-auto min-h-0 h-full border-r border-white/[0.06]" style={{ width: 140, background: '#0f1b2e' }}>
            {(() => {
              const displayReport = isViewingCompleted ? completedReports[viewingReportIndex]?.report : report;
              const displaySlidesDone = isViewingCompleted ? completedReports[viewingReportIndex]?.slidesDone || {} : slidesDone;
              if (!displayReport) return null;
              // Use the report's actual slides (may be fewer than slideConfigs for bonus reports)
              const displaySlides = displayReport.slides || [];
              return displaySlides.map((slide, i) => {
                const slideNum = i + 1;
                // Prefer slide-stored title (for bonus reports), then config, then fallback
                const cfgTitle = slide?.title || slideConfigs[i]?.title || `Slide ${slideNum}`;
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
                            <span className="text-[10px] text-white/20">{cfgTitle}</span>
                          </div>
                        )}
                      </div>

                      <div className={`px-1.5 py-1 text-[10px] font-medium truncate ${
                        isActive ? 'text-amber-400' : 'text-white/40'
                      }`} style={{ background: '#0d1520' }}>
                        {cfgTitle}
                      </div>
                    </button>
                    {!viewMode && (
                      <button
                        onClick={() => toggleSlideDone(slideNum)}
                        className={`flex items-center justify-center gap-1 w-full py-1 rounded text-[10px] font-medium transition-all ${
                          (isViewingCompleted ? displaySlidesDone[slideNum] : slidesDone[slideNum])
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded border flex items-center justify-center ${
                          (isViewingCompleted ? displaySlidesDone[slideNum] : slidesDone[slideNum]) ? 'border-emerald-400 bg-emerald-500/30' : 'border-red-400/50'
                        }`}>
                          {(isViewingCompleted ? displaySlidesDone[slideNum] : slidesDone[slideNum]) && <Check size={8} />}
                        </div>
                        {(isViewingCompleted ? displaySlidesDone[slideNum] : slidesDone[slideNum]) ? 'Done' : 'Mark done'}
                      </button>
                    )}
                  </div>
                );
              });
            })()}
          </div>

          {/* Canvas */}
          <div className="flex-1 flex flex-col items-center justify-center p-1.5 min-h-0 overflow-y-auto" style={{ background: '#202530' }}>
            {isViewingCompleted && (
              <div className="mb-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-medium flex items-center gap-1.5">
                <Eye size={12} /> Editing completed report
              </div>
            )}
            <div className="w-full" style={{ maxWidth: canvasMaxWidth }}>
              <SlideCanvas
                objects={(() => {
                  const displayReport = isViewingCompleted ? completedReports[viewingReportIndex]?.report : report;
                  return displayReport?.slides[activeSlide - 1]?.objects || [];
                })()}
                paletteId={(() => {
                  const displayReport = isViewingCompleted ? completedReports[viewingReportIndex]?.report : report;
                  return displayReport?.slides[activeSlide - 1]?.palette || 'genre';
                })()}
                genre=""
                onChange={isViewingCompleted ? handleCompletedObjectsChange : handleObjectsChange}
                onPaletteChange={isViewingCompleted ? handleCompletedPaletteChange : (p) => handleUpdateSlide({ palette: p })}
                readOnly={viewMode}
              />
            </div>
            {!viewMode && !isViewingCompleted && (
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

const ScoutingReport = ({ variant, forceShowDirections, hideDirectionsButton, ...props }) => (
  <AudioProvider>
    <ScoutingReportInner {...props} variant={variant} forceShowDirections={forceShowDirections} hideDirectionsButton={hideDirectionsButton} />
  </AudioProvider>
);

export default ScoutingReport;
