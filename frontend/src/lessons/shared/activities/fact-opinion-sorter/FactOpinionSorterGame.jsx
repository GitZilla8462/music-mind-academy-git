// FactOpinionSorterGame — Teacher Presentation View
// Shows examples of facts vs opinions. Students write their own on their devices.

import React from 'react';

const EXAMPLES = [
  { type: 'fact', text: 'Their debut single was streamed 50,000 times in the first month.', why: 'Measurable, verifiable data.' },
  { type: 'opinion', text: 'Their music sounds better than anyone else in the genre.', why: '"Better" is a personal judgment.' },
  { type: 'fact', text: 'They released 3 albums between 2022 and 2024.', why: 'Specific numbers and dates.' },
  { type: 'opinion', text: 'Their lyrics are the most creative I\'ve ever heard.', why: '"Most creative" is subjective.' },
];

// Student Activity Banner
const ActivityBanner = () => (
  <div
    className="w-full flex items-center justify-center"
    style={{ height: '64px', backgroundColor: '#16a34a', flexShrink: 0 }}
  >
    <span className="text-white font-bold" style={{ fontSize: '28px' }}>
      STUDENT ACTIVITY
    </span>
  </div>
);

const FactOpinionSorterGame = ({ onComplete }) => {
  return (
    <div className="min-h-screen h-full flex flex-col bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white overflow-hidden">
      <ActivityBanner />

      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10">
        <h1 className="text-4xl lg:text-5xl font-black mb-2 text-center">Fact or Opinion?</h1>
        <p className="text-xl lg:text-2xl text-indigo-200 mb-8 text-center">Write one fact and one opinion about your artist.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl w-full mb-8">
          {EXAMPLES.map((ex, i) => (
            <div
              key={i}
              className={`rounded-2xl p-5 ${
                ex.type === 'fact'
                  ? 'bg-blue-500/15 border-2 border-blue-500/30'
                  : 'bg-purple-500/15 border-2 border-purple-500/30'
              }`}
            >
              <div className={`text-sm font-black uppercase tracking-wider mb-2 ${
                ex.type === 'fact' ? 'text-blue-400' : 'text-purple-400'
              }`}>
                {ex.type}
              </div>
              <p className="text-lg lg:text-xl text-white font-medium mb-2">&ldquo;{ex.text}&rdquo;</p>
              <p className={`text-sm italic ${ex.type === 'fact' ? 'text-blue-300/60' : 'text-purple-300/60'}`}>
                {ex.why}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white/10 rounded-2xl px-8 py-4 text-center">
          <p className="text-lg text-white/70">Students are writing on their devices...</p>
        </div>
      </div>
    </div>
  );
};

export default FactOpinionSorterGame;
