// Toolbar for Artist Launchpad — clean top bar with tabs + save.
// Left: app branding + tab buttons (Explore Artists / My Report) + progress
// Right: save button
// Matches ScoutingReport tab style for consistency across lessons.

import React from 'react';
import { Save, Check, Rocket, Search, BookOpen, HelpCircle, Plus } from 'lucide-react';

const PressKitTopBar = ({
  saveStatus,
  onSave,
  artistName,
  activeTab,
  onTabChange,
  bonusCount = 0,
  allMainSlidesComplete = false,
  onShowDirections,
  slidesCompleted = 0,
  totalSlides = 5,
  onAddBonusTrack,
}) => {
  return (
    <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1 border-b border-white/[0.08]" style={{ background: '#0d1520' }}>
      {/* App branding */}
      <div className="flex items-center gap-1.5 flex-shrink-0 mr-1">
        <Rocket size={16} className="text-amber-400" />
        <span className="text-xs font-bold text-white/70 tracking-wide">Artist Launchpad</span>
      </div>

      <div className="w-px h-6 bg-white/[0.12] flex-shrink-0" />

      {/* Tab buttons — matches ScoutingReport style */}
      <div className="flex bg-white/5 rounded-lg p-0.5 flex-shrink-0">
        <button
          onClick={() => onTabChange('discover')}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'discover'
              ? 'bg-amber-500/20 text-amber-300'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          <Search size={12} /> Explore Artists
        </button>
        <button
          onClick={() => onTabChange('press-kit')}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'press-kit'
              ? 'bg-amber-500/20 text-amber-300'
              : allMainSlidesComplete
                ? 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                : 'text-white/40 hover:text-white/60'
          }`}
        >
          <BookOpen size={12} /> My Report
        </button>
      </div>

      {/* Progress text */}
      {allMainSlidesComplete ? (
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-bold text-emerald-400">
            Press Kit Complete — keep adding bonus tracks until time is up!
            {bonusCount > 0 && ` (${bonusCount} added)`}
          </span>
          {onAddBonusTrack && (
            <button
              onClick={onAddBonusTrack}
              className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
              title="Add bonus track"
            >
              <Plus size={14} />
            </button>
          )}
        </div>
      ) : (
        <span className={`text-xs font-bold flex-shrink-0 ${slidesCompleted === 0 ? 'text-red-400' : 'text-amber-400'}`}>
          {slidesCompleted}/{totalSlides} Slides Complete
        </span>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Save status */}
      <span className="text-[10px] text-white/30 flex items-center gap-1 flex-shrink-0">
        {saveStatus === 'saving' && <><Save size={10} className="animate-pulse" /> Saving...</>}
        {saveStatus === 'saved' && <><Check size={10} className="text-green-400" /> Saved</>}
      </span>

      {/* Directions button */}
      {onShowDirections && (
        <button
          onClick={onShowDirections}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 text-white/70 hover:bg-white/15 hover:text-white transition-colors min-h-[30px] flex-shrink-0"
        >
          <HelpCircle size={13} /> Directions
        </button>
      )}

      {/* Save button */}
      <button
        onClick={onSave}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-colors min-h-[30px] flex-shrink-0"
      >
        <Save size={13} /> Save
      </button>
    </div>
  );
};

export default PressKitTopBar;
