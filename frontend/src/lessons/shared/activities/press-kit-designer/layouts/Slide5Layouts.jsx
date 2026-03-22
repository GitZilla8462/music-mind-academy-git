// Slide 5: Sign Them — 3 layout components
// Props: { fields, palette, image }
//   fields: { closingPitch, callToAction, memorableFact }

import React from 'react';
import { Pen, ArrowRight, Sparkles } from 'lucide-react';

// Layout A: Bold centered pitch
export function PitchBold({ fields, palette }) {
  const { closingPitch, callToAction, memorableFact } = fields;
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-6 sm:p-8 rounded-lg" style={{ background: palette.bg }}>
      <Pen size={24} className="mb-4 opacity-30" style={{ color: palette.accent }} />
      <p className="text-xl sm:text-2xl font-medium text-center leading-relaxed max-w-lg mb-6" style={{ color: palette.text }}>
        {closingPitch || 'Your closing pitch will appear here...'}
      </p>
      {callToAction && (
        <div
          className="px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 mb-5"
          style={{ background: palette.accent, color: palette.bg }}
        >
          {callToAction}
          <ArrowRight size={14} />
        </div>
      )}
      {memorableFact && (
        <div className="flex items-center gap-2 max-w-md">
          <Sparkles size={14} style={{ color: palette.accent }} />
          <p className="text-sm italic" style={{ color: palette.muted }}>
            {memorableFact}
          </p>
        </div>
      )}
    </div>
  );
}

// Layout B: Image left, pitch + CTA right
export function SplitPitch({ fields, palette, image }) {
  const { closingPitch, callToAction, memorableFact } = fields;
  return (
    <div className="flex w-full h-full overflow-hidden rounded-lg" style={{ background: palette.bg }}>
      <div className="w-[40%] relative flex-shrink-0">
        {image?.url ? (
          <img src={image.url} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full" style={{ background: `linear-gradient(180deg, ${palette.accent}33 0%, ${palette.bg} 100%)` }} />
        )}
      </div>
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-8">
        <p className="text-lg sm:text-xl font-medium leading-relaxed mb-5" style={{ color: palette.text }}>
          {closingPitch || 'Your closing pitch will appear here...'}
        </p>
        <div className="w-full h-px mb-5" style={{ background: palette.accent + '33' }} />
        {callToAction && (
          <div
            className="self-start px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 mb-4"
            style={{ background: palette.accent, color: palette.bg }}
          >
            {callToAction}
            <ArrowRight size={14} />
          </div>
        )}
        {memorableFact && (
          <div className="flex items-center gap-2">
            <Sparkles size={14} style={{ color: palette.accent }} />
            <p className="text-sm italic" style={{ color: palette.muted }}>
              {memorableFact}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Layout C: Full impact — faded quote background, centered CTA
export function FullImpact({ fields, palette }) {
  const { closingPitch, callToAction, memorableFact } = fields;
  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full p-6 sm:p-8 rounded-lg overflow-hidden" style={{ background: palette.bg }}>
      {/* Large faded background text */}
      {memorableFact && (
        <div className="absolute inset-0 flex items-center justify-center p-12 pointer-events-none select-none">
          <p className="text-3xl sm:text-4xl font-bold text-center leading-relaxed opacity-[0.06]" style={{ color: palette.text }}>
            {memorableFact}
          </p>
        </div>
      )}
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        <p className="text-xl sm:text-2xl font-medium text-center leading-relaxed max-w-lg mb-6" style={{ color: palette.text }}>
          {closingPitch || 'Your closing pitch will appear here...'}
        </p>
        {callToAction && (
          <div
            className="px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 mb-4"
            style={{ background: palette.accent, color: palette.bg }}
          >
            {callToAction}
            <ArrowRight size={14} />
          </div>
        )}
        {memorableFact && (
          <div className="flex items-center gap-2">
            <Sparkles size={14} style={{ color: palette.accent }} />
            <p className="text-xs italic" style={{ color: palette.muted }}>
              {memorableFact}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const SLIDE_5_LAYOUTS = {
  'pitch-bold': PitchBold,
  'split-pitch': SplitPitch,
  'full-impact': FullImpact,
};

export default SLIDE_5_LAYOUTS;
