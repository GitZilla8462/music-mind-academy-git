// Slide 2: Their Sound — 3 layout components
// Props: { fields, palette, image }
//   fields: { soundStatement, influences, moodTags, ifYouLike }

import React from 'react';
import { Quote, Music } from 'lucide-react';

function MoodPill({ tag, palette }) {
  return (
    <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: palette.accent + '22', color: palette.accent }}>
      {tag}
    </span>
  );
}

// Layout A: Sound Statement as large centered quote
export function StatementFocus({ fields, palette }) {
  const { soundStatement, influences, moodTags = [], ifYouLike } = fields;
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-6 sm:p-8 rounded-lg" style={{ background: palette.bg }}>
      <Quote size={32} className="mb-4 opacity-30" style={{ color: palette.accent }} />
      <p className="text-xl sm:text-2xl text-center font-medium leading-relaxed max-w-lg mb-6" style={{ color: palette.text }}>
        {soundStatement || 'Their music sounds like...'}
      </p>
      {moodTags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {moodTags.map((tag, i) => <MoodPill key={i} tag={tag} palette={palette} />)}
        </div>
      )}
      {influences && (
        <p className="text-sm mb-2" style={{ color: palette.muted }}>
          Influenced by: {influences}
        </p>
      )}
      {ifYouLike && (
        <p className="text-sm italic" style={{ color: palette.accent }}>
          {ifYouLike}
        </p>
      )}
    </div>
  );
}

// Layout B: Statement left, mood/influence cards right
export function SplitMood({ fields, palette }) {
  const { soundStatement, influences, moodTags = [], ifYouLike } = fields;
  return (
    <div className="flex w-full h-full overflow-hidden rounded-lg" style={{ background: palette.bg }}>
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-8">
        <Quote size={24} className="mb-3 opacity-30" style={{ color: palette.accent }} />
        <p className="text-lg sm:text-xl font-medium leading-relaxed" style={{ color: palette.text }}>
          {soundStatement || 'Their music sounds like...'}
        </p>
        {ifYouLike && (
          <p className="text-sm italic mt-4" style={{ color: palette.accent }}>
            {ifYouLike}
          </p>
        )}
      </div>
      <div className="w-[38%] flex flex-col justify-center gap-3 p-5 border-l" style={{ borderColor: palette.accent + '22' }}>
        {moodTags.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: palette.muted }}>Mood</p>
            <div className="flex flex-wrap gap-1.5">
              {moodTags.map((tag, i) => <MoodPill key={i} tag={tag} palette={palette} />)}
            </div>
          </div>
        )}
        {influences && (
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: palette.muted }}>Influences</p>
            <p className="text-sm leading-relaxed" style={{ color: palette.text + 'cc' }}>{influences}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Layout C: Statement top, 3 info cards below
export function CardGrid({ fields, palette }) {
  const { soundStatement, influences, moodTags = [], ifYouLike } = fields;
  return (
    <div className="flex flex-col w-full h-full p-6 sm:p-8 rounded-lg" style={{ background: palette.bg }}>
      <div className="mb-5">
        <Quote size={20} className="mb-2 opacity-30" style={{ color: palette.accent }} />
        <p className="text-lg sm:text-xl font-medium leading-relaxed" style={{ color: palette.text }}>
          {soundStatement || 'Their music sounds like...'}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 flex-1">
        <div className="rounded-lg p-4 flex flex-col" style={{ background: palette.accent + '11' }}>
          <p className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: palette.muted }}>
            <Music size={12} className="inline mr-1" />Mood
          </p>
          <div className="flex flex-wrap gap-1.5">
            {moodTags.length > 0
              ? moodTags.map((tag, i) => <MoodPill key={i} tag={tag} palette={palette} />)
              : <span className="text-xs" style={{ color: palette.muted }}>Add moods...</span>
            }
          </div>
        </div>
        <div className="rounded-lg p-4 flex flex-col" style={{ background: palette.accent + '11' }}>
          <p className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: palette.muted }}>Influences</p>
          <p className="text-sm leading-relaxed" style={{ color: palette.text + 'cc' }}>
            {influences || 'Add influences...'}
          </p>
        </div>
        <div className="rounded-lg p-4 flex flex-col" style={{ background: palette.accent + '11' }}>
          <p className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: palette.muted }}>Compare</p>
          <p className="text-sm italic leading-relaxed" style={{ color: palette.accent }}>
            {ifYouLike || '"If you like..., you\'ll love..."'}
          </p>
        </div>
      </div>
    </div>
  );
}

const SLIDE_2_LAYOUTS = {
  'statement-focus': StatementFocus,
  'split-mood': SplitMood,
  'card-grid': CardGrid,
};

export default SLIDE_2_LAYOUTS;
