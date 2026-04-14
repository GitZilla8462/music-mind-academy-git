// PressKitDesigner — Google Slides-style presentation builder with artist discovery.
// Top bar: tabs (Explore Artists / My Report) + design controls
// Left: slide thumbnails (press kit view only)
// Center: canvas OR artist discovery (tabbed, both stay mounted)
// Bottom: persistent mini audio player
// Bonus tracks: after completing all 5 main slides, students can add bonus track slides.
// Optimized for 1366x768 Chromebook resolution.

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { getArtistById } from '../artist-discovery/artistDatabase';
import { AudioProvider, useGlobalAudio } from '../artist-discovery/AudioContext';
import ArtistDiscovery from '../artist-discovery/ArtistDiscovery';
import MiniPlayer from '../artist-discovery/profile/MiniPlayer';
import PressKitTopBar from './components/PressKitTopBar';
import SlideTabBar from './components/SlideTabBar';
import SlideCanvas, { AudioTrimPanel } from './components/SlideCanvas';
import ImagePickerModal from './components/ImagePickerModal';
import { loadPressKit, savePressKit, getOrCreatePressKit } from './pressKitStorage';
import { getSelectedArtistId, autoPopulateFields } from './pressKitAutoPopulate';
import { generateTemplateObjects, generateBonusTrackObjects } from './slideTemplates';
import { SLIDE_CONFIGS } from './slideConfigs';
import { getDatabase, ref, onValue } from 'firebase/database';
import { getClassAuthInfo } from '../../../../utils/studentWorkStorage';

const AUTOSAVE_INTERVAL = 30000;
const BONUS_STORAGE_KEY = 'mma-press-kit-bonus-tracks';

function PressKitDesignerInner({ onComplete, viewMode, isSessionMode, availableSlides, peerReviewMode }) {
  const [pressKit, setPressKit] = useState(null);
  const [activeSlide, setActiveSlide] = useState(1);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [activeTab, setActiveTab] = useState('press-kit');
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [artist, setArtist] = useState(null);
  const [selectedCanvasObj, setSelectedCanvasObj] = useState(null);
  const saveTimerRef = useRef(null);
  const pressKitRef = useRef(null);
  const imageCallbackRef = useRef(null);

  // Bonus tracks state
  const [bonusTracks, setBonusTracks] = useState(() => {
    try {
      const raw = localStorage.getItem(BONUS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const bonusTracksRef = useRef(bonusTracks);
  useEffect(() => { bonusTracksRef.current = bonusTracks; }, [bonusTracks]);

  const audio = useGlobalAudio();

  // Responsive canvas max-width: on short viewports, shrink canvas so 16:9 ratio fits
  const [viewportH, setViewportH] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);
  useEffect(() => {
    const onResize = () => setViewportH(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  // Budget: top bar ~38px, toolbar ~36px, padding ~20px, reset button ~24px = ~118px overhead
  const canvasMaxWidth = useMemo(() => {
    const available = viewportH - 118;
    const widthFromHeight = available * (960 / 540); // 16:9 inverse
    return Math.min(720, Math.max(400, Math.round(widthFromHeight)));
  }, [viewportH]);

  // Directions modal — always shows on mount
  const [showDirections, setShowDirections] = useState(true);

  useEffect(() => { pressKitRef.current = pressKit; }, [pressKit]);

  // Manual slide completion tracking (like ScoutingReport)
  const completionKey = 'mma-press-kit-completed';
  const [slidesDone, setSlidesDone] = useState(() => {
    try { return JSON.parse(localStorage.getItem(completionKey)) || {}; } catch { return {}; }
  });
  const toggleSlideDone = useCallback((slideNum) => {
    setSlidesDone(prev => {
      const next = { ...prev, [slideNum]: !prev[slideNum] };
      localStorage.setItem(completionKey, JSON.stringify(next));
      return next;
    });
  }, []);
  const slidesCompleted = SLIDE_CONFIGS.filter((_, i) => slidesDone[i + 1]).length;
  const allMainSlidesComplete = slidesCompleted === SLIDE_CONFIGS.length;

  // Is the active slide a bonus track?
  const isBonusSlide = activeSlide > 5;
  const bonusIndex = activeSlide - 6; // 0-based index into bonusTracks

  // Init
  useEffect(() => {
    const artistId = getSelectedArtistId();
    const artistData = artistId ? getArtistById(artistId) : null;
    setArtist(artistData);

    let kit = loadPressKit();
    if (!kit || (artistId && kit.artistId !== artistId)) {
      kit = getOrCreatePressKit(artistId);
    }

    // Generate template objects with prompt placeholders — students write their own content
    kit.slides = kit.slides.map((slide, i) => {
      const updated = { ...slide };
      if (!updated.objects || updated.objects.length === 0) {
        updated.objects = generateTemplateObjects(
          i + 1, slide.fields || {}, slide.image?.url || artistData?.imageUrl || null
        );
      }
      return updated;
    });
    savePressKit(kit);
    setPressKit(kit);
  }, []);

  // Canvas image-add requests
  useEffect(() => {
    const handler = (e) => {
      imageCallbackRef.current = e.detail?.callback || null;
      setImagePickerOpen(true);
    };
    window.addEventListener('press-kit-add-image', handler);
    return () => window.removeEventListener('press-kit-add-image', handler);
  }, []);

  // Autosave
  useEffect(() => {
    saveTimerRef.current = setInterval(() => {
      if (pressKitRef.current) {
        setSaveStatus('saving');
        savePressKit(pressKitRef.current);
        localStorage.setItem(BONUS_STORAGE_KEY, JSON.stringify(bonusTracksRef.current));
        setTimeout(() => setSaveStatus('saved'), 600);
        setTimeout(() => setSaveStatus('idle'), 2500);
      }
    }, AUTOSAVE_INTERVAL);
    return () => clearInterval(saveTimerRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (pressKitRef.current) savePressKit(pressKitRef.current);
      localStorage.setItem(BONUS_STORAGE_KEY, JSON.stringify(bonusTracksRef.current));
    };
  }, []);

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
        console.log('\uD83D\uDCBE Teacher save command received for press kit');
        if (pressKitRef.current) {
          savePressKit(pressKitRef.current);
          localStorage.setItem(BONUS_STORAGE_KEY, JSON.stringify(bonusTracksRef.current));
        }
      }
    });
    return () => unsubscribe();
  }, [isSessionMode, viewMode]);

  // Handlers
  const handleSave = useCallback(() => {
    if (!pressKit) return;
    setSaveStatus('saving');
    savePressKit(pressKit);
    localStorage.setItem(BONUS_STORAGE_KEY, JSON.stringify(bonusTracks));
    setTimeout(() => setSaveStatus('saved'), 400);
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, [pressKit, bonusTracks]);

  const handleUpdateSlide = useCallback((updates) => {
    if (isBonusSlide) {
      setBonusTracks(prev => {
        const next = [...prev];
        if (next[bonusIndex]) {
          next[bonusIndex] = { ...next[bonusIndex], ...updates };
        }
        return next;
      });
    } else {
      setPressKit(prev => {
        if (!prev) return prev;
        const idx = activeSlide - 1;
        const newSlides = [...prev.slides];
        newSlides[idx] = { ...newSlides[idx], ...updates };
        return { ...prev, slides: newSlides };
      });
    }
  }, [activeSlide, isBonusSlide, bonusIndex]);

  const handleObjectsChange = useCallback((newObjects) => {
    handleUpdateSlide({ objects: newObjects });
  }, [handleUpdateSlide]);

  const handleUpdateObject = useCallback((id, updates) => {
    if (isBonusSlide) {
      const currentObjects = bonusTracks[bonusIndex]?.objects || [];
      const newObjects = currentObjects.map(o => o.id === id ? { ...o, ...updates } : o);
      handleUpdateSlide({ objects: newObjects });
    } else {
      if (!pressKit) return;
      const idx = activeSlide - 1;
      const currentObjects = pressKit.slides[idx]?.objects || [];
      const newObjects = currentObjects.map(o => o.id === id ? { ...o, ...updates } : o);
      handleUpdateSlide({ objects: newObjects });
    }
  }, [pressKit, activeSlide, handleUpdateSlide, isBonusSlide, bonusIndex, bonusTracks]);

  const handleResetTemplate = useCallback(() => {
    if (isBonusSlide) {
      const newObjects = generateBonusTrackObjects(bonusIndex + 1);
      handleUpdateSlide({ objects: newObjects });
    } else {
      if (!pressKit) return;
      const idx = activeSlide - 1;
      const slide = pressKit.slides[idx];
      const newObjects = generateTemplateObjects(
        activeSlide, slide.fields || {}, slide.image?.url || artist?.imageUrl || null
      );
      handleUpdateSlide({ objects: newObjects });
    }
  }, [activeSlide, pressKit, artist, handleUpdateSlide, isBonusSlide, bonusIndex]);

  const handleImageSelect = useCallback((img) => {
    if (imageCallbackRef.current) {
      imageCallbackRef.current(img);
      imageCallbackRef.current = null;
    } else {
      handleUpdateSlide({ image: img });
    }
  }, [handleUpdateSlide]);

  const handleComplete = useCallback(() => {
    if (pressKit) savePressKit(pressKit);
    localStorage.setItem(BONUS_STORAGE_KEY, JSON.stringify(bonusTracks));
    if (onComplete) onComplete();
  }, [pressKit, onComplete, bonusTracks]);

  // Add a new bonus track
  const addBonusTrack = useCallback(() => {
    const num = bonusTracks.length + 1;
    const newBonus = {
      number: num,
      palette: 'genre',
      objects: generateBonusTrackObjects(num),
      fields: {},
      image: null,
    };
    setBonusTracks(prev => {
      const next = [...prev, newBonus];
      localStorage.setItem(BONUS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setActiveSlide(5 + num);
  }, [bonusTracks.length]);

  if (!pressKit) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#0f1419' }}>
        <p className="text-white/40 text-sm">Loading Press Kit Designer...</p>
      </div>
    );
  }

  // Current slide data — either main or bonus
  const currentSlide = isBonusSlide
    ? bonusTracks[bonusIndex] || { objects: [], palette: 'genre' }
    : pressKit.slides[activeSlide - 1];
  const genre = artist?.genre || '';
  const hasAudioPlaying = audio?.currentTrack != null;

  return (
    <div className="h-screen flex flex-col" style={{ background: '#202530' }}>
      {/* ── Top Bar (tabs + design controls) ── */}
      <PressKitTopBar
        saveStatus={saveStatus}
        onSave={handleSave}
        artistName={artist?.name}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        bonusCount={bonusTracks.length}
        allMainSlidesComplete={allMainSlidesComplete}
        onShowDirections={() => setShowDirections(true)}
        slidesCompleted={slidesCompleted}
        totalSlides={SLIDE_CONFIGS.length}
        onAddBonusTrack={allMainSlidesComplete && !viewMode ? addBonusTrack : null}
      />

      {/* ── Main area ── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ── Left: Slide thumbnails (only in press-kit view) ── */}
        {activeTab === 'press-kit' && (
          <div className="flex-shrink-0 border-r border-white/[0.06] overflow-y-auto min-h-0 h-full scrollbar-prominent" style={{ background: '#181c24' }}>
            <SlideTabBar
              activeSlide={activeSlide}
              slides={pressKit.slides}
              genre={genre}
              onSelect={setActiveSlide}
              availableSlides={availableSlides}
              bonusTracks={bonusTracks}
              onAddBonusTrack={allMainSlidesComplete && !viewMode ? addBonusTrack : null}
              slidesDone={slidesDone}
              onToggleSlideDone={toggleSlideDone}
              readOnly={viewMode}
            />
          </div>
        )}

        {/* ── Center ── */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Directions overlay — absolute within center area only */}
          {showDirections && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
              <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden mx-4">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 flex items-center justify-between">
                  <h2 className="text-lg font-black text-white">{peerReviewMode ? 'Peer Review + Revise' : 'Build Your Story'}</h2>
                  <button onClick={() => setShowDirections(false)} className="text-white/70 hover:text-white">
                    <X size={18} />
                  </button>
                </div>
                <div className="px-5 py-3 space-y-2.5">
                  {(peerReviewMode ? [
                    'Swap Chromebooks with a partner',
                    'Read through their 5 slides — which slide is strongest?',
                    'What\'s missing or could be stronger?',
                    'Would YOU sign this artist based on the press kit?',
                    'Swap back and use their feedback to make final edits',
                  ] : [
                    'You have 5 slides — click any text to replace it with your own words',
                    'Each slide tells you what to write in the placeholder text',
                    'Your work saves automatically',
                  ]).map((step, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="text-lg font-black text-purple-600 w-6 text-center flex-shrink-0">{i + 1}</span>
                      <p className="text-sm sm:text-base text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>
                <div className="px-5 pb-4">
                  <button
                    onClick={() => setShowDirections(false)}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-base font-bold rounded-xl transition-colors"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Press Kit canvas */}
          <div
            className="flex-1 flex flex-col items-center justify-center p-1 overflow-y-auto"
            style={{
              background: '#202530',
              display: activeTab === 'press-kit' ? 'flex' : 'none',
            }}
          >
            <div className="w-full" style={{ maxWidth: canvasMaxWidth }}>
              <SlideCanvas
                objects={currentSlide.objects || []}
                paletteId={currentSlide.palette}
                genre={genre}
                onChange={handleObjectsChange}
                onPaletteChange={(p) => handleUpdateSlide({ palette: p })}
                readOnly={viewMode}
                artistTracks={artist?.tracks || []}
                onSelectionChange={setSelectedCanvasObj}
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

          {/* Artist Discovery */}
          <div
            className="flex-1 overflow-hidden"
            style={{
              display: activeTab === 'discover' ? 'block' : 'none',
              background: '#0f1419',
            }}
          >
            <div className="h-full overflow-y-auto">
              <ArtistDiscovery isSessionMode={isSessionMode} hideMiniPlayer />
            </div>
          </div>
        </div>

        {/* ── Right Panel: Audio Trim (only when audio object selected) ── */}
        {selectedCanvasObj?.type === 'audio' && (
          <div className="flex-shrink-0 border-l border-white/[0.06] flex flex-col" style={{ width: 200, background: '#141820' }}>
            <div className="flex items-center px-3 py-2 border-b border-white/[0.06] flex-shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Audio Clip</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <AudioTrimPanel obj={selectedCanvasObj} onUpdate={handleUpdateObject} />
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom: Persistent Mini Player ── */}
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

      {/* ── Image picker modal ── */}
      <ImagePickerModal
        isOpen={imagePickerOpen}
        onClose={() => { setImagePickerOpen(false); imageCallbackRef.current = null; }}
        onSelect={handleImageSelect}
      />
    </div>
  );
}

const PressKitDesigner = (props) => {
  return (
    <AudioProvider>
      <PressKitDesignerInner {...props} />
    </AudioProvider>
  );
};

export default PressKitDesigner;
