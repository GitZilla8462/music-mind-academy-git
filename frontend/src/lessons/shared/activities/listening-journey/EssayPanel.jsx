// White paper essay view for Presentation mode
// Auto-generates flowing paragraphs from section data, guide notes, and stickers

import React from 'react';
import ENVIRONMENTS from './config/environments';

// Readable name lookups
const DYNAMICS_NAMES = {
  pp: 'pianissimo', p: 'piano', mp: 'mezzo piano',
  mf: 'mezzo forte', f: 'forte', ff: 'fortissimo',
};

const TEMPO_NAMES = {
  largo: 'Largo', adagio: 'Adagio', andante: 'Andante',
  moderato: 'Moderato', allegro: 'Allegro', presto: 'Presto',
};

const SCENE_NAMES = {};
ENVIRONMENTS.forEach(e => { SCENE_NAMES[e.id] = e.name; });

const SKY_NAMES = {
  'clear-day': 'clear day', 'golden-hour': 'golden hour', 'sunrise': 'sunrise',
  'sunset': 'sunset', 'stormy': 'stormy', 'night': 'night', 'cosmic': 'cosmic',
};

const MOVEMENT_NAMES = {
  crawl: 'crawling', walk: 'walking', run: 'running', sprint: 'sprinting',
};

const WEATHER_NAMES = { rain: 'rain', snow: 'snow' };

const buildParagraph = (section, idx, guideData, character, items) => {
  const parts = [];

  // Opening with section label
  const sectionName = section.sectionLabel
    ? `Section ${section.label} (${section.sectionLabel})`
    : `Section ${section.label}`;

  // Musical observations from planning guide
  const guideItems = guideData?.[idx];
  let checkedNotes = [];
  let customNotes = [];
  if (Array.isArray(guideItems)) {
    checkedNotes = guideItems.filter(i => i.checked).map(i => i.text);
    customNotes = guideItems.filter(i => typeof i.id === 'number').map(i => i.text);
  } else if (guideItems && typeof guideItems === 'object') {
    // Object format: { dynamics: "...", instruments: "...", mood: "..." }
    checkedNotes = Object.values(guideItems).filter(v => typeof v === 'string' && v);
  }

  // Count stickers in this section's time range
  const sectionStickers = items
    ? items.filter(i => i.type === 'sticker' && i.timestamp >= section.startTime && i.timestamp < section.endTime)
    : [];

  // Dynamics & tempo sentence
  const dynName = DYNAMICS_NAMES[section.dynamics];
  const tempoName = TEMPO_NAMES[section.tempo];
  if (dynName && tempoName) {
    parts.push(`In ${sectionName}, I heard the dynamics ${dynName} (${section.dynamics}) at a ${tempoName} tempo.`);
  } else if (dynName) {
    parts.push(`In ${sectionName}, I heard the dynamics ${dynName} (${section.dynamics}).`);
  } else if (tempoName) {
    parts.push(`In ${sectionName}, the tempo was ${tempoName}.`);
  } else {
    parts.push(`In ${sectionName}:`);
  }

  // Visual choices sentence
  const sceneName = SCENE_NAMES[section.scene];
  const skyName = SKY_NAMES[section.sky];
  const weatherName = WEATHER_NAMES[section.weather];
  const movementName = MOVEMENT_NAMES[section.movement];
  const charName = character?.name;

  const visualParts = [];
  if (sceneName) {
    let sceneStr = `a ${sceneName} scene`;
    if (skyName && skyName !== 'clear day') sceneStr += ` with a ${skyName} sky`;
    if (section.nightMode) sceneStr += ' at night';
    visualParts.push(sceneStr);
  }
  if (weatherName) visualParts.push(weatherName);

  if (visualParts.length > 0) {
    parts.push(`For my visual journey, I chose ${visualParts.join(' with ')}.`);
  }

  // Character + movement sentence
  if (charName && charName !== 'None' && movementName) {
    parts.push(`I had my ${charName.toLowerCase()} ${movementName} through the scene.`);
  } else if (movementName && movementName !== 'walking') {
    parts.push(`My character was ${movementName} through the scene.`);
  }

  // Sticker details — group by name and list counts
  if (sectionStickers.length > 0) {
    const counts = {};
    sectionStickers.forEach(s => {
      const label = s.name || s.icon || 'sticker';
      counts[label] = (counts[label] || 0) + 1;
    });
    const stickerList = Object.entries(counts)
      .map(([name, count]) => count > 1 ? `${count} ${name}s` : `${count} ${name}`)
      .join(', ');
    parts.push(`I placed ${stickerList} to mark what I heard.`);
  }

  // Custom notes from planning guide
  if (customNotes.length > 0) {
    parts.push(customNotes.join(' '));
  }

  return parts.join(' ');
};

const EssayPanel = ({ sections, guideData, pieceTitle, character, items }) => {
  return (
    <div className="w-52 sm:w-64 lg:w-[340px] flex-shrink-0 bg-gray-800 flex flex-col items-center py-2 sm:py-4 px-2 sm:px-3 overflow-y-auto">
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
        <div className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 flex-1">
          {/* Title */}
          <h1 className="text-center text-lg font-bold text-gray-900 mb-1">
            Listening Journey
          </h1>
          <p className="text-center text-xs text-gray-500 mb-5 italic">
            {pieceTitle || 'Hungarian Dance No. 5 — Brahms'}
          </p>

          {/* Divider */}
          <div className="w-12 h-px bg-gray-300 mx-auto mb-5" />

          {/* Auto-generated paragraphs */}
          {sections.length === 0 ? (
            <p className="text-sm text-gray-400 text-center italic mt-8">
              Add scenes in Build mode to see your essay here.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {sections.map((section, idx) => (
                <p key={section.id || idx} className="text-xs text-gray-700 leading-relaxed indent-4">
                  {buildParagraph(section, idx, guideData, character, items)}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Paper footer */}
        <div className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 border-t border-gray-100 mt-auto">
          <p className="text-[9px] text-gray-300 text-center">
            Listening Journey · Music Mind Academy
          </p>
        </div>
      </div>
    </div>
  );
};

export default EssayPanel;
