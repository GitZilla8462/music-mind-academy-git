// PressKitDesigner — Google Slides-style presentation builder with artist discovery.
// Top bar: tabs (Explore Artists / My Report) + design controls
// Left: slide thumbnails (press kit view only)
// Center: canvas OR artist discovery (tabbed, both stay mounted)
// Bottom: persistent mini audio player
// Bonus tracks: after completing all 5 main slides, students can add bonus track slides.
// Optimized for 1366x768 Chromebook resolution.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import DirectionsModal from '../../components/DirectionsModal';
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
import { SLIDE_CONFIGS, isSlideComplete } from './slideConfigs';

const AUTOSAVE_INTERVAL = 30000;
const BONUS_STORAGE_KEY = 'mma-press-kit-bonus-tracks';

function PressKitDesignerInner({ onComplete, viewMode, isSessionMode, availableSlides }) {
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

  // Directions modal
  const directionsKey = 'mma-press-kit-directions-seen';
  const [showDirections, setShowDirections] = useState(() => !localStorage.getItem(directionsKey));
  const closeDirections = () => {
    setShowDirections(false);
    localStorage.setItem(directionsKey, 'true');
  };

  useEffect(() => { pressKitRef.current = pressKit; }, [pressKit]);

  // Check if all 5 main slides are complete
  const allMainSlidesComplete = pressKit
    ? SLIDE_CONFIGS.every((cfg, i) => {
        const slide = pressKit.slides[i];
        return slide && isSlideComplete(cfg.number, slide.fields || {});
      })
    : false;

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

    // Auto-populate fields from artist data if available, then generate template objects
    const autoFields = artistId ? autoPopulateFields(artistId, kit.slides) : kit.slides.map(() => ({}));
    kit.slides = kit.slides.map((slide, i) => {
      const auto = autoFields[i];
      const merged = { ...auto };
      Object.keys(slide.fields || {}).forEach(key => {
        if (slide.customOverrides?.[key] || (slide.fields[key] && slide.fields[key] !== '')) {
          merged[key] = slide.fields[key];
        }
      });
      const updated = { ...slide, fields: merged };
      if (!updated.objects || updated.objects.length === 0) {
        updated.objects = generateTemplateObjects(
          i + 1, merged, slide.image?.url || artistData?.imageUrl || null
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
      <DirectionsModal
        title="Build Your Press Kit"
        isOpen={showDirections}
        onClose={closeDirections}
        steps={[
          { text: 'Each slide has an example layout filled in for you' },
          { text: 'Click any text box to edit — delete the example and type your own words' },
          { text: 'Use the toolbar to add images, change fonts, and style your slides' },
          { text: 'Switch to "Explore Artists" to browse artists and listen to tracks' },
          { text: 'Your work saves automatically — click Save anytime to be sure' },
        ]}
      />

      {/* ── Top Bar (tabs + design controls) ── */}
      <PressKitTopBar
        saveStatus={saveStatus}
        onSave={handleSave}
        artistName={artist?.name}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        bonusCount={bonusTracks.length}
        allMainSlidesComplete={allMainSlidesComplete}
      />

      {/* ── Main area ── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ── Left: Slide thumbnails (only in press-kit view) ── */}
        {activeTab === 'press-kit' && (
          <div className="flex-shrink-0 border-r border-white/[0.06] overflow-y-auto" style={{ background: '#181c24' }}>
            <SlideTabBar
              activeSlide={activeSlide}
              slides={pressKit.slides}
              genre={genre}
              onSelect={setActiveSlide}
              availableSlides={availableSlides}
              bonusTracks={bonusTracks}
              onAddBonusTrack={allMainSlidesComplete && !viewMode ? addBonusTrack : null}
            />
          </div>
        )}

        {/* ── Center ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Press Kit canvas */}
          <div
            className="flex-1 flex flex-col items-center justify-center p-2 overflow-y-auto"
            style={{
              background: '#202530',
              display: activeTab === 'press-kit' ? 'flex' : 'none',
            }}
          >
            <div className="w-full" style={{ maxWidth: 720 }}>
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
