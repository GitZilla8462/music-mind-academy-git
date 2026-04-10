// Slide thumbnail sidebar — vertical list of mini slide previews (Google Slides style).
// Shows free-form canvas objects scaled down as thumbnails.
// Includes bonus track slides after the 5 main slides.

import React from 'react';
import { Check, Lock, Plus, Music } from 'lucide-react';
import { SLIDE_CONFIGS, isSlideComplete } from '../slideConfigs';
import { renderSlideObject, CANVAS_W, CANVAS_H } from './SlideCanvas';
import { getPalette } from '../palettes';

const THUMB_W = 110;
const THUMB_SCALE = THUMB_W / CANVAS_W;

const SlideTabBar = ({ activeSlide, slides, genre, onSelect, availableSlides, bonusTracks = [], onAddBonusTrack }) => {
  return (
    <div className="flex flex-col gap-1.5 p-1.5 overflow-y-auto" style={{ width: 130 }}>
      {/* Main slides (1-5) */}
      {SLIDE_CONFIGS.map((cfg, i) => {
        const slideNum = cfg.number;
        const slide = slides[i];
        const isActive = activeSlide === slideNum;
        const isAvailable = !availableSlides || availableSlides.includes(slideNum);
        const complete = slide ? isSlideComplete(slideNum, slide.fields) : false;
        const palette = getPalette(slide?.palette || 'genre', genre);

        return (
          <button
            key={slideNum}
            onClick={() => onSelect(slideNum)}
            className={`
              relative flex flex-col rounded-lg overflow-hidden transition-all
              ${isActive
                ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-400/10'
                : 'ring-1 ring-white/[0.08] hover:ring-white/20'
              }
            `}
          >
            {/* Slide number badge */}
            <div className="absolute top-1 left-1 z-10 flex items-center gap-1">
              <span className={`
                w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold
                ${isActive ? 'bg-amber-400 text-black' : 'bg-black/50 text-white/70'}
              `}>
                {complete ? <Check size={8} /> : slideNum}
              </span>
            </div>

            {/* Availability overlay */}
            {!isAvailable && (
              <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center">
                <Lock size={12} className="text-white/30" />
              </div>
            )}

            {/* Mini slide preview with canvas objects */}
            <div
              className="relative w-full overflow-hidden pointer-events-none"
              style={{
                aspectRatio: `${CANVAS_W}/${CANVAS_H}`,
                background: palette.bg,
              }}
            >
              {(slide?.objects || []).map(obj => (
                <div
                  key={obj.id}
                  style={{
                    position: 'absolute',
                    left: obj.x * THUMB_SCALE,
                    top: obj.y * THUMB_SCALE,
                    transform: obj.rotation ? `rotate(${obj.rotation}deg)` : undefined,
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

            {/* Slide title */}
            <div className={`px-1.5 py-1 text-[10px] font-medium truncate ${
              isActive ? 'text-amber-400' : 'text-white/40'
            }`} style={{ background: '#0d1520' }}>
              {cfg.title}
            </div>
          </button>
        );
      })}

      {/* Bonus track divider */}
      {(bonusTracks.length > 0 || onAddBonusTrack) && (
        <div className="flex items-center gap-1.5 px-1 pt-2 pb-0.5">
          <Music size={10} className="text-emerald-400/60 flex-shrink-0" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400/60">Bonus</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>
      )}

      {/* Bonus track slides */}
      {bonusTracks.map((bonus, i) => {
        const slideNum = 6 + i;
        const isActive = activeSlide === slideNum;
        const palette = getPalette(bonus.palette || 'genre', genre);

        return (
          <button
            key={`bonus-${i}`}
            onClick={() => onSelect(slideNum)}
            className={`
              relative flex flex-col rounded-lg overflow-hidden transition-all
              ${isActive
                ? 'ring-2 ring-emerald-400 shadow-lg shadow-emerald-400/10'
                : 'ring-1 ring-white/[0.08] hover:ring-white/20'
              }
            `}
          >
            {/* Bonus badge */}
            <div className="absolute top-1 left-1 z-10">
              <span className={`
                px-1 h-4 rounded flex items-center justify-center text-[8px] font-bold
                ${isActive ? 'bg-emerald-400 text-black' : 'bg-black/50 text-emerald-300'}
              `}>
                B{i + 1}
              </span>
            </div>

            {/* Mini slide preview */}
            <div
              className="relative w-full overflow-hidden pointer-events-none"
              style={{
                aspectRatio: `${CANVAS_W}/${CANVAS_H}`,
                background: palette.bg,
              }}
            >
              {(bonus.objects || []).map(obj => (
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
              {(!bonus.objects || bonus.objects.length === 0) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] text-white/20">Bonus {i + 1}</span>
                </div>
              )}
            </div>

            {/* Slide title */}
            <div className={`px-1.5 py-1 text-[10px] font-medium truncate ${
              isActive ? 'text-emerald-400' : 'text-white/40'
            }`} style={{ background: '#0d1520' }}>
              Bonus {i + 1}
            </div>
          </button>
        );
      })}

      {/* Add bonus track button */}
      {onAddBonusTrack && (
        <button
          onClick={onAddBonusTrack}
          className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-emerald-400/20 text-emerald-400/50 hover:text-emerald-400 hover:border-emerald-400/40 hover:bg-emerald-500/5 transition-colors"
        >
          <Plus size={12} />
          <span className="text-[10px] font-medium">Bonus Track</span>
        </button>
      )}
    </div>
  );
};

export default SlideTabBar;
