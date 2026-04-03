// PressKitDesigner — Google Slides-style presentation builder with artist discovery.
// Top bar: tabs (My Press Kit / Discover) + design controls
// Left: slide thumbnails (press kit view only)
// Center: canvas OR artist discovery (tabbed, both stay mounted)
// Right: research board (open by default, collapsible)
// Bottom: persistent mini audio player
// Optimized for 1366x768 Chromebook resolution.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { getArtistById } from '../artist-discovery/artistDatabase';
import { AudioProvider, useGlobalAudio } from '../artist-discovery/AudioContext';
import ArtistDiscovery from '../artist-discovery/ArtistDiscovery';
// ResearchBoard removed — students use artist auto-populate instead
import MiniPlayer from '../artist-discovery/profile/MiniPlayer';
import PressKitTopBar from './components/PressKitTopBar';
import SlideTabBar from './components/SlideTabBar';
import SlideCanvas, { AudioTrimPanel } from './components/SlideCanvas';
import ImagePickerModal from './components/ImagePickerModal';
import { loadPressKit, savePressKit, getOrCreatePressKit } from './pressKitStorage';
import { getSelectedArtistId, autoPopulateFields } from './pressKitAutoPopulate';
import { generateTemplateObjects } from './slideTemplates';

const AUTOSAVE_INTERVAL = 30000;

function PressKitDesignerInner({ onComplete, viewMode, isSessionMode, availableSlides }) {
  const [pressKit, setPressKit] = useState(null);
  const [activeSlide, setActiveSlide] = useState(1);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [showAudioTrim, setShowAudioTrim] = useState(false);
  const [activeTab, setActiveTab] = useState('press-kit');
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [artist, setArtist] = useState(null);
  const [selectedCanvasObj, setSelectedCanvasObj] = useState(null);
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
      // Always generate template objects if slide is empty — shows sentence starters even without artist
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

  const handleUpdateObject = useCallback((id, updates) => {
    if (!pressKit) return;
    const idx = activeSlide - 1;
    const currentObjects = pressKit.slides[idx]?.objects || [];
    const newObjects = currentObjects.map(o => o.id === id ? { ...o, ...updates } : o);
    handleUpdateSlide({ objects: newObjects });
  }, [pressKit, activeSlide, handleUpdateSlide]);

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
        artistName={artist?.name}
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
