// Slide 3: Why This Artist — 3 layout components
// Props: { fields, palette, image }
//   fields: { reason1, reason2, reason3 }

import React from 'react';
import { Star } from 'lucide-react';

function ReasonCard({ number, text, palette, featured = false }) {
  return (
    <div
      className={`rounded-lg p-4 ${featured ? 'p-5' : ''}`}
      style={{
        background: featured ? palette.accent + '1a' : palette.accent + '0d',
        borderLeft: `3px solid ${palette.accent}`,
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: palette.accent + '33', color: palette.accent }}
        >
          {number}
        </span>
        <p className={`leading-relaxed ${featured ? 'text-base' : 'text-sm'}`} style={{ color: palette.text + 'dd' }}>
          {text || 'Add your evidence-backed reason...'}
        </p>
      </div>
    </div>
  );
}

// Layout A: Three numbered cards stacked vertically
export function NumberedStack({ fields, palette }) {
  const { reason1, reason2, reason3 } = fields;
  return (
    <div className="flex flex-col w-full h-full p-6 sm:p-8 rounded-lg" style={{ background: palette.bg }}>
      <div className="flex items-center gap-2 mb-5">
        <Star size={20} style={{ color: palette.accent }} />
        <h2 className="text-xl sm:text-2xl font-bold" style={{ color: palette.text }}>Why Sign This Artist?</h2>
      </div>
      <div className="flex flex-col gap-3 flex-1">
        <ReasonCard number={1} text={reason1} palette={palette} />
        <ReasonCard number={2} text={reason2} palette={palette} />
        <ReasonCard number={3} text={reason3} palette={palette} />
      </div>
    </div>
  );
}

// Layout B: Three equal columns
export function Columns({ fields, palette }) {
  const { reason1, reason2, reason3 } = fields;
  const reasons = [reason1, reason2, reason3];
  return (
    <div className="flex flex-col w-full h-full p-6 sm:p-8 rounded-lg" style={{ background: palette.bg }}>
      <div className="flex items-center gap-2 mb-5">
        <Star size={20} style={{ color: palette.accent }} />
        <h2 className="text-xl sm:text-2xl font-bold" style={{ color: palette.text }}>Why Sign This Artist?</h2>
      </div>
      <div className="grid grid-cols-3 gap-3 flex-1">
        {reasons.map((reason, i) => (
          <div key={i} className="rounded-lg p-4 flex flex-col" style={{ background: palette.accent + '0d', borderTop: `3px solid ${palette.accent}` }}>
            <span className="text-2xl font-bold mb-2" style={{ color: palette.accent + '55' }}>{i + 1}</span>
            <p className="text-sm leading-relaxed" style={{ color: palette.text + 'dd' }}>
              {reason || 'Add your evidence-backed reason...'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Layout C: One featured reason large, two smaller below
export function Spotlight({ fields, palette, image }) {
  const { reason1, reason2, reason3 } = fields;
  return (
    <div className="flex flex-col w-full h-full p-6 sm:p-8 rounded-lg" style={{ background: palette.bg }}>
      <div className="flex items-center gap-2 mb-5">
        <Star size={20} style={{ color: palette.accent }} />
        <h2 className="text-xl sm:text-2xl font-bold" style={{ color: palette.text }}>Why Sign This Artist?</h2>
      </div>
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex gap-3 flex-1">
          <div className="flex-1">
            <ReasonCard number={1} text={reason1} palette={palette} featured />
          </div>
          {image?.url && (
            <div className="w-[35%] rounded-lg overflow-hidden flex-shrink-0">
              <img src={image.url} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ReasonCard number={2} text={reason2} palette={palette} />
          <ReasonCard number={3} text={reason3} palette={palette} />
        </div>
      </div>
    </div>
  );
}

const SLIDE_3_LAYOUTS = {
  'numbered-stack': NumberedStack,
  'columns': Columns,
  'spotlight': Spotlight,
};

export default SLIDE_3_LAYOUTS;
