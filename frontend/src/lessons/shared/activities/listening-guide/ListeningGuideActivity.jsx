import React, { useState } from 'react';
import { Headphones, PenTool } from 'lucide-react';
import ListeningGuide from './ListeningGuide';
import SoundStatement from './SoundStatement';
import BandcampEmbed from '../artist-discovery/BandcampEmbed';
import { getArtistById } from '../artist-discovery/artistDatabase';

const TABS = [
  { id: 'guide', label: 'Listening Guide', icon: Headphones },
  { id: 'statement', label: 'Sound Statement', icon: PenTool },
];

function loadDiscoveryState() {
  try {
    const raw = localStorage.getItem('mma-artist-discovery');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const ListeningGuideActivity = ({ onComplete, isSessionMode }) => {
  const [activeTab, setActiveTab] = useState('guide');

  // Load the student's selected artist from artist-discovery
  const discoveryState = loadDiscoveryState();
  const artistId = discoveryState?.selected || null;
  const artist = artistId ? getArtistById(artistId) : null;

  // No artist selected fallback
  if (!artist) {
    return (
      <div className="h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-center px-6 max-w-md">
          <Headphones size={48} className="text-white/20 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Artist Selected</h2>
          <p className="text-white/40 text-sm">
            You need to select an artist in the Artist Discovery activity before you can use the Listening Guide.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0f1419] flex flex-col overflow-hidden">
      {/* Top bar with artist info */}
      <div className="flex-shrink-0 border-b border-white/[0.08] bg-[#0f1419]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
            {artist.imageUrl ? (
              <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-white/10 flex items-center justify-center">
                <Headphones size={16} className="text-white/40" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/80 text-sm font-semibold truncate">{artist.name}</p>
            <p className="text-white/30 text-xs truncate">{artist.subgenre} -- {artist.location}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4 flex gap-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors min-h-[44px] border-b-2 ${
                  active
                    ? 'text-white border-amber-400'
                    : 'text-white/35 border-transparent hover:text-white/60'
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-5">
          {/* Bandcamp player */}
          <div className="mb-5 rounded-xl overflow-hidden">
            <BandcampEmbed
              albumId={artist.embedAlbumId}
              size="large"
              tracklist={true}
            />
          </div>

          {/* Active tab content */}
          {activeTab === 'guide' ? (
            <ListeningGuide artistId={artist.id} artistName={artist.name} />
          ) : (
            <SoundStatement artistId={artist.id} artistName={artist.name} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ListeningGuideActivity;
