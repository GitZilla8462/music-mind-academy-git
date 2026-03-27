// Toolbar for Artist Launchpad — prominent tabs + design controls.
// Left: app branding + tab buttons (My Press Kit / Discover)
// Center: design controls (press-kit tab only)
// Right: save status + done button

import React from 'react';
import { Save, Check, Image as ImageIcon, Music, Rocket, Compass, Palette } from 'lucide-react';
import LayoutPicker from './LayoutPicker';
import PalettePicker from './PalettePicker';

const PressKitTopBar = ({
  saveStatus,
  onSave,
  onComplete,
  artistName,
  slideNumber,
  currentLayout,
  currentPalette,
  genre,
  onLayoutChange,
  onPaletteChange,
  onImageClick,
  hasImage,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 border-b border-white/[0.08]" style={{ background: '#0d1520' }}>
      {/* App branding */}
      <div className="flex items-center gap-1.5 flex-shrink-0 mr-1">
        <Rocket size={16} className="text-amber-400" />
        <span className="text-xs font-bold text-white/70 tracking-wide hidden sm:inline">Artist Launchpad</span>
      </div>

      <div className="w-px h-6 bg-white/[0.12] flex-shrink-0" />

      {/* Tab buttons — prominent pill style */}
      <div className="flex items-center gap-1 flex-shrink-0 bg-white/[0.04] rounded-lg p-0.5">
        <button
          onClick={() => onTabChange('press-kit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all flex-shrink-0 ${
            activeTab === 'press-kit'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'text-white/50 hover:text-white/80 hover:bg-white/[0.06]'
          }`}
        >
          <Palette size={16} /> My Press Kit
        </button>
        <button
          onClick={() => onTabChange('discover')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all flex-shrink-0 ${
            activeTab === 'discover'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'text-white/50 hover:text-white/80 hover:bg-white/[0.06]'
          }`}
        >
          <Compass size={16} /> Discover
        </button>
      </div>

      <div className="w-px h-6 bg-white/[0.12] flex-shrink-0 mx-0.5" />

      {/* Design controls — only show when on press-kit tab */}
      {activeTab === 'press-kit' && (
        <>
          <div className="flex-shrink-0">
            <LayoutPicker slideNumber={slideNumber} currentLayout={currentLayout} onSelect={onLayoutChange} />
          </div>
          <div className="w-px h-5 bg-white/[0.08] flex-shrink-0" />
          <div className="flex-shrink-0">
            <PalettePicker currentPalette={currentPalette} genre={genre} onSelect={onPaletteChange} />
          </div>
          <div className="w-px h-5 bg-white/[0.08] flex-shrink-0" />
          <button
            onClick={onImageClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] text-white/50 hover:bg-white/[0.1] hover:text-white/70 transition-colors min-h-[30px] flex-shrink-0"
          >
            <ImageIcon size={13} />
            <span className="hidden sm:inline">Image</span>
          </button>
        </>
      )}

      {/* Artist name (when on discover tab) */}
      {activeTab === 'discover' && artistName && (
        <span className="text-[11px] text-white/30 flex-shrink-0">
          Representing: <span className="text-white/50 font-medium">{artistName}</span>
        </span>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Save status */}
      <span className="text-[10px] text-white/30 flex items-center gap-1 flex-shrink-0">
        {saveStatus === 'saving' && <><Save size={10} className="animate-pulse" /> Saving...</>}
        {saveStatus === 'saved' && <><Check size={10} className="text-green-400" /> Saved</>}
      </span>

      {/* Done */}
      {onComplete && (
        <button
          onClick={onComplete}
          className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-colors min-h-[30px] flex-shrink-0"
        >
          Done
        </button>
      )}
    </div>
  );
};

export default PressKitTopBar;
