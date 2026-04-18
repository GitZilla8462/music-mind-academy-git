import React from 'react';
import { MapPin, Calendar, Users, Music, Disc3, Guitar } from 'lucide-react';

const FACT_CONFIG = [
  { key: 'location', label: 'Hometown', icon: MapPin, getValue: a => a.location },
  { key: 'formed', label: 'Formed', icon: Calendar, getValue: a => a.formed },
  { key: 'members', label: 'Members', icon: Users, getValue: a => a.members },
  { key: 'subgenre', label: 'Genre', icon: Music, getValue: a => a.subgenre },
  { key: 'totalAlbums', label: 'Albums', icon: Disc3, getValue: a => a.totalAlbums ? `${a.totalAlbums} releases` : null },
  { key: 'instruments', label: 'Instruments', icon: Guitar, getValue: a => a.instruments },
];

const QuickFacts = ({ artist }) => {
  const facts = FACT_CONFIG
    .map(config => ({
      ...config,
      value: config.getValue(artist),
    }))
    .filter(f => f.value != null && f.value !== '' && !(Array.isArray(f.value) && f.value.length === 0));

  if (facts.length === 0) return null;

  return (
    <div className="mb-3">
      <h2 className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-2">
        Quick Facts
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {facts.map(fact => {
          const Icon = fact.icon;
          const isInstruments = fact.key === 'instruments' && Array.isArray(fact.value);

          return (
            <div
              key={fact.key}
              className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-2.5 py-2"
            >
              <Icon size={12} className="text-white/30 mb-1" />
              <p className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">{fact.label}</p>
              {isInstruments ? (
                <div className="flex flex-wrap gap-1">
                  {fact.value.map(inst => (
                    <span
                      key={inst}
                      className="px-2 py-0.5 bg-white/[0.06] text-white/70 rounded-full text-[11px]"
                    >
                      {inst}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-white/70 text-sm font-medium">
                  {Array.isArray(fact.value) ? fact.value.join(', ') : fact.value}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickFacts;
