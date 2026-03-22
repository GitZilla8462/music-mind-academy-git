// PressKitDesigner — Google Slides-style presentation builder with artist discovery.
// Top bar: tabs (My Press Kit / Discover) + design controls
// Left: slide thumbnails (press kit view only)
// Center: canvas OR artist discovery (tabbed, both stay mounted)
// Right: research board (open by default, collapsible)
// Bottom: persistent mini audio player
// Optimized for 1366x768 Chromebook resolution.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { getArtistById } from '../artist-discovery/artistDatabase';
import { AudioProvider, useGlobalAudio } from '../artist-discovery/AudioContext';
import ArtistDiscovery from '../artist-discovery/ArtistDiscovery';
import ResearchBoard from '../research-board/ResearchBoard';
import MiniPlayer from '../artist-discovery/profile/MiniPlayer';
import PressKitTopBar from './components/PressKitTopBar';
import SlideTabBar from './components/SlideTabBar';
import SlideCanvas from './components/SlideCanvas';
import ImagePickerModal from './components/ImagePickerModal';
import { loadPressKit, savePressKit, getOrCreatePressKit } from './pressKitStorage';
import { getSelectedArtistId, autoPopulateFields } from './pressKitAutoPopulate';
import { generateTemplateObjects } from './slideTemplates';

const AUTOSAVE_INTERVAL = 30000;

function PressKitDesignerInner({ onComplete, viewMode, isSessionMode, availableSlides }) {
  const [pressKit, setPressKit] = useState(null);
  const [activeSlide, setActiveSlide] = useState(1);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [showResearch, setShowResearch] = useState(true); // open by default
  const [activeTab, setActiveTab] = useState('press-kit');
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [artist, setArtist] = useState(null);
  const saveTimerRef = useRef(null);
  const pressKitRef = useRef(null);
  const imageCallbackRef = useRef(null);

  const audio = useGlobalAudio();

  useEffect(() => { pressKitRef.current = pressKit; }, [pressKit]);

  // Init
  useEffect(() => {
    const artistId = getSelectedArtistId();
    const artistData = artistId ? getArtistById(artistId) : null;
    setArtist(artistData);

    let kit = loadPressKit();
    if (!kit || (artistId && kit.artistId !== artistId)) {
      kit = getOrCreatePressKit(artistId);
    }

    if (artistId) {
      const autoFields = autoPopulateFields(artistId, kit.slides);
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
    }
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
        setTimeout(() => setSaveStatus('saved'), 600);
        setTimeout(() => setSaveStatus('idle'), 2500);
      }
    }, AUTOSAVE_INTERVAL);
    return () => clearInterval(saveTimerRef.current);
  }, []);

  useEffect(() => {
    return () => { if (pressKitRef.current) savePressKit(pressKitRef.current); };
  }, []);

  // Handlers
  const handleSave = useCallback(() => {
    if (!pressKit) return;
    setSaveStatus('saving');
    savePressKit(pressKit);
    setTimeout(() => setSaveStatus('saved'), 400);
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, [pressKit]);

  const handleUpdateSlide = useCallback((updates) => {
    setPressKit(prev => {
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
    if (!pressKit) return;
    const idx = activeSlide - 1;
    const slide = pressKit.slides[idx];
    const newObjects = generateTemplateObjects(
      activeSlide, slide.fields || {}, slide.image?.url || artist?.imageUrl || null
    );
    handleUpdateSlide({ objects: newObjects });
  }, [activeSlide, pressKit, artist, handleUpdateSlide]);

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
    if (onComplete) onComplete();
  }, [pressKit, onComplete]);

  if (!pressKit) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#0f1419' }}>
        <p className="text-white/40 text-sm">Loading Press Kit Designer...</p>
      </div>
    );
  }

  const currentSlide = pressKit.slides[activeSlide - 1];
  const genre = artist?.genre || '';
  const hasAudioPlaying = audio?.currentTrack != null;

  return (
    <div className="h-screen flex flex-col" style={{ background: '#202530' }}>
      {/* ── Top Bar (tabs + design controls) ── */}
      <PressKitTopBar
        saveStatus={saveStatus}
        onSave={handleSave}
        onComplete={viewMode ? null : handleComplete}
        artistName={artist?.name}
        slideNumber={activeSlide}
        currentLayout={currentSlide.layout}
        currentPalette={currentSlide.palette}
        genre={genre}
        onLayoutChange={(l) => handleUpdateSlide({ layout: l })}
        onPaletteChange={(p) => handleUpdateSlide({ palette: p })}
        onImageClick={() => { imageCallbackRef.current = null; setImagePickerOpen(true); }}
        hasImage={!!currentSlide.image}
        activeTab={activeTab}
        onTabChange={setActiveTab}
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
            />
          </div>
        )}

        {/* ── Center ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Press Kit canvas */}
          <div
            className="flex-1 flex flex-col items-center justify-center p-3 overflow-hidden"
            style={{
              background: '#202530',
              display: activeTab === 'press-kit' ? 'flex' : 'none',
            }}
          >
            <div className="w-full" style={{ maxWidth: 780 }}>
              <SlideCanvas
                objects={currentSlide.objects || []}
                paletteId={currentSlide.palette}
                genre={genre}
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

        {/* ── Right: Research Board ── */}
        {showResearch ? (
          <div className="flex-shrink-0 border-l border-white/[0.06] flex flex-col" style={{ width: 280, background: '#141820' }}>
            {/* Research header with minimize button */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06] flex-shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Research Board</span>
              <button
                onClick={() => setShowResearch(false)}
                className="p-1 text-white/30 hover:text-white/60 transition-colors"
                title="Minimize"
              >
                <PanelRightClose size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ResearchBoard collapsed={false} readOnly={viewMode} />
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowResearch(true)}
            className="flex-shrink-0 flex items-center justify-center w-8 border-l border-white/[0.06] text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-colors"
            style={{ background: '#141820' }}
            title="Open Research Board"
          >
            <PanelRightOpen size={14} />
          </button>
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
