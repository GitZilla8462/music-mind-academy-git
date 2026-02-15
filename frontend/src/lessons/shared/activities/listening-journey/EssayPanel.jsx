// White paper essay view for Presentation mode
// Displays the planning guide data as a formatted essay
// Pulls section info (dynamics, tempo, instruments) from guide checklist

import React from 'react';

const EssayPanel = ({ sections, guideData, pieceTitle }) => {
  // Build essay content from sections and guide data
  const getCheckedItems = (sectionIndex) => {
    const items = guideData?.[sectionIndex];
    if (!items) return [];
    return items.filter(i => i.checked).map(i => i.text);
  };

  const getCustomItems = (sectionIndex) => {
    const items = guideData?.[sectionIndex];
    if (!items) return [];
    // Custom items are ones students added (no default id pattern)
    return items.filter(i => typeof i.id === 'number').map(i => i.text);
  };

  return (
    <div className="w-[340px] flex-shrink-0 bg-gray-800 flex flex-col items-center py-4 px-3 overflow-y-auto">
      {/* White paper */}
      <div
        className="w-full bg-white rounded-sm flex flex-col overflow-y-auto"
        style={{
          minHeight: '90%',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          fontFamily: '"Times New Roman", Times, Georgia, serif',
        }}
      >
        {/* Paper content */}
        <div className="px-8 py-6 flex-1">
          {/* Title */}
          <h1 className="text-center text-lg font-bold text-gray-900 mb-1">
            Plan Your Journey
          </h1>
          <p className="text-center text-xs text-gray-500 mb-5 italic">
            {pieceTitle || 'Listening Journey'}
          </p>

          {/* Divider */}
          <div className="w-12 h-px bg-gray-300 mx-auto mb-5" />

          {/* Sections as paragraphs */}
          {sections.length === 0 ? (
            <p className="text-sm text-gray-400 text-center italic mt-8">
              Add scenes in Build mode to see your essay here.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {sections.map((section, idx) => {
                const checked = getCheckedItems(idx);
                const custom = getCustomItems(idx);

                return (
                  <div key={section.id || idx}>
                    {/* Section heading */}
                    <h2 className="text-sm font-bold text-gray-800 mb-1.5 flex items-center gap-2">
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold"
                        style={{ backgroundColor: section.color }}
                      >
                        {section.label}
                      </span>
                      {section.sectionLabel || 'Section'}
                    </h2>

                    {/* Musical details */}
                    <div className="text-xs text-gray-700 leading-relaxed pl-7">
                      <p className="mb-1">
                        <span className="font-semibold">Dynamics:</span>{' '}
                        <span className="italic">{section.dynamics || '—'}</span>
                        {' · '}
                        <span className="font-semibold">Tempo:</span>{' '}
                        <span className="italic">{section.tempo || '—'}</span>
                      </p>

                      {section.movement && section.movement !== 'walk' && (
                        <p className="mb-1">
                          <span className="font-semibold">Movement:</span>{' '}
                          <span className="italic">{section.movement}</span>
                        </p>
                      )}

                      {section.weather && section.weather !== 'none' && (
                        <p className="mb-1">
                          <span className="font-semibold">Weather:</span>{' '}
                          <span className="italic">{section.weather}</span>
                        </p>
                      )}

                      {section.nightMode && (
                        <p className="mb-1">
                          <span className="font-semibold">Lighting:</span>{' '}
                          <span className="italic">Night</span>
                        </p>
                      )}

                      {/* Checked planning items */}
                      {checked.length > 0 && (
                        <div className="mt-1.5">
                          {checked.map((item, i) => (
                            <p key={i} className="flex items-start gap-1.5 mb-0.5">
                              <span className="text-emerald-600 mt-px">✓</span>
                              <span>{item}</span>
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Custom student notes */}
                      {custom.length > 0 && (
                        <div className="mt-1 border-l-2 border-gray-200 pl-2">
                          {custom.map((note, i) => (
                            <p key={i} className="text-gray-600 italic">{note}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Paper footer */}
        <div className="px-8 py-3 border-t border-gray-100 mt-auto">
          <p className="text-[9px] text-gray-300 text-center">
            Listening Journey · Music Mind Academy
          </p>
        </div>
      </div>
    </div>
  );
};

export default EssayPanel;
