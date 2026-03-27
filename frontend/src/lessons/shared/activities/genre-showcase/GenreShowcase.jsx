// GenreShowcase — Teacher presentation stepping through 6 genres
// Each genre: artist photo, genre name, 3 style bullets, 15-sec audio with playback bar
// Modeled on TempoShowcase pattern: Start → Play → Next → ... → Done

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, ChevronRight, Check, RotateCcw, Music } from 'lucide-react';

const CLIP_DURATION = 15; // seconds

const GENRES = [
  {
    name: 'Pop',
    color: '#ec4899',
    icon: '🎵',
    artist: 'Soft and Furious',
    location: 'Unknown',
    imageUrl: 'https://freemusicarchive.org/image/?file=images%2Fartists%2FSoft_and_Furious_-_20170401193146143.jpg&width=290&height=290&type=artist',
    audio: 'https://media.musicmindacademy.com/artists/soft-and-furious/horizon-ending.mp3',
    startTime: 30,
    trackTitle: 'Horizon Ending',
    bullets: [
      'Catchy hooks, singable melodies, and polished production',
      'Designed for broad appeal — the most-streamed genre in the world',
      'Constantly evolving — absorbs trends from hip-hop, electronic, R&B, and more',
    ],
  },
  {
    name: 'Hip-Hop',
    color: '#8b5cf6',
    icon: '🎤',
    artist: 'HoliznaCC0',
    location: 'Pittsburgh, PA',
    imageUrl: 'https://freemusicarchive.org/image/?file=artist_image%2FlM2G8yAdu4LWzK5a3ZHKeJQnMkMe1u9qQzZvJ5HY.png&width=290&height=290&type=artist',
    audio: 'https://media.musicmindacademy.com/artists/holiznacc0/foggy-headed.mp3',
    startTime: 4,
    trackTitle: 'Foggy Headed',
    bullets: [
      'Beats, rhymes, and storytelling over sampled or electronic production',
      'One of the most influential genres — dominates streaming charts worldwide',
      'Subgenres include trap, lo-fi hip-hop, conscious rap, drill, and boom bap',
    ],
  },
  {
    name: 'Rock',
    color: '#ef4444',
    icon: '🎸',
    artist: 'Cullah',
    location: 'Milwaukee, WI',
    imageUrl: 'https://freemusicarchive.org/image/?file=images%2Fartists%2FCullah_-_20180503171218146.jpg&width=290&height=290&type=artist',
    audio: 'https://media.musicmindacademy.com/artists/cullah/cullahtivation-revelation.mp3',
    startTime: 40,
    trackTitle: 'Cullahtivation Revelation',
    bullets: [
      'Electric guitars, drums, bass, and raw energy',
      'Grew out of blues and R&B in the 1950s — transformed popular music forever',
      'From punk to metal to indie to alternative — endless subgenres',
    ],
  },
  {
    name: 'Country',
    color: '#f97316',
    icon: '🤠',
    artist: 'Jason Shaw',
    location: 'Pittsburgh, PA',
    imageUrl: 'https://freemusicarchive.org/image/?file=images%2Fartists%2FJason_Shaw_-_20131120155444083.jpg&width=290&height=290&type=artist',
    audio: 'https://media.musicmindacademy.com/artists/jason-shaw/acoustic-blues.mp3',
    startTime: 20,
    trackTitle: 'Acoustic Blues',
    bullets: [
      'Acoustic guitar, fiddle, banjo, and storytelling lyrics',
      'Rooted in American folk, blues, and gospel traditions',
      'Modern country blends with pop, rock, and hip-hop',
    ],
  },
  {
    name: 'Jazz',
    color: '#3b82f6',
    icon: '🎷',
    artist: 'Ketsa',
    location: 'London, England',
    imageUrl: 'https://freemusicarchive.org/image/?file=artist_image%2FCIPeL9rmMA9ojtVqaoleGmXXoM7V2cvVwmf7SaUn.jpg&width=290&height=290&type=artist',
    audio: 'https://media.musicmindacademy.com/artists/ketsa/will-make-you-happy.mp3',
    startTime: 30,
    trackTitle: 'Will Make You Happy',
    bullets: [
      'Improvisation — musicians make it up in the moment, no two performances are the same',
      'Complex harmony, swing rhythms, and virtuoso solos',
      'Modern jazz blends with soul, hip-hop, electronic, and Latin music',
    ],
  },
  {
    name: 'Soundtrack',
    color: '#14b8a6',
    icon: '🎬',
    artist: 'Komiku',
    location: 'Marseille, France',
    imageUrl: 'https://freemusicarchive.org/image/?file=images%2Fartists%2FKomiku_-_20160721122625292.jpg&width=290&height=290&type=artist',
    audio: 'https://media.musicmindacademy.com/artists/komiku/tale-on-the-late.mp3',
    startTime: 25,
    trackTitle: 'Tale on the Late',
    bullets: [
      'Music composed to support film, TV, games, and video content',
      'Sets the mood — you FEEL the story through the music',
      'Can use any instruments or style, from orchestral to chiptune to ambient',
    ],
  },
  {
    name: 'Electronic',
    color: '#06b6d4',
    icon: '🎹',
    artist: 'Broke For Free',
    location: 'Oakland, CA',
    imageUrl: 'https://freemusicarchive.org/image/?file=artist_image%2FE0XCVaXi3oUHZIJJ90mqijoKKgMw3abve7Fd7Apv.jpg&width=290&height=290&type=artist',
    audio: 'https://media.musicmindacademy.com/artists/broke-for-free/nothing-like-captain-crunch.mp3',
    startTime: 45,
    trackTitle: 'Nothing Like Captain Crunch',
    bullets: [
      'Made with synthesizers, drum machines, and computers — no traditional instruments required',
      'Includes EDM, house, techno, ambient, lo-fi, and dozens of subgenres',
      'Production and sound design matter as much as melody and rhythm',
    ],
  },
];

const TEACHER_SCRIPT = {
  intro: "Before you start scouting artists, you need to know your genres. A great agent doesn't just listen to what they like — they know EVERY corner of music. Let's hear what 7 major genres sound like.",
  perGenre: [
    "POP — catchy, polished, designed for everyone. This is Soft and Furious — synth pop with electronic beats and dreamy melodies. Pop is the biggest genre in the world for a reason.",
    "HIP-HOP — beats, rhymes, and storytelling. This is HoliznaCC0 from Pittsburgh. Lo-fi hip-hop is one of the biggest subgenres online right now. Listen to those chill beats.",
    "ROCK — guitars, drums, and raw energy. This is Cullah from Milwaukee. He mixes rock with funk, rap, and folk. Rock grew out of blues in the 1950s and changed music forever.",
    "COUNTRY — acoustic instruments and storytelling. This is Jason Shaw from Pittsburgh. Country music connects to American folk and blues traditions — and today it blends with pop and hip-hop too.",
    "JAZZ — improvisation and complex harmony. This is Ketsa from London. He blends jazz with soul, hip-hop, and Latin. Jazz isn't old or boring — it's the foundation of modern music.",
    "SOUNDTRACK — music made for film, TV, and video games. This is Komiku from France. They make soundtracks for imaginary video games — inspired by Undertale and Steven Universe.",
    "ELECTRONIC — made with synths and computers, no traditional instruments needed. This is Broke For Free from Oakland. Electronic music is all about production and sound design.",
  ],
  outro: "Those are 7 major genres — and there are many more. Every artist on the platform fits into at least one. Now YOU get to explore and find the artists that speak to you.",
};

const GenreShowcase = ({ sessionData }) => {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [demoFinished, setDemoFinished] = useState(false);
  const [isDemoing, setIsDemoing] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [completedIndices, setCompletedIndices] = useState(new Set());

  const audioRef = useRef(null);
  const clipEndTimer = useRef(null);
  const progressInterval = useRef(null);
  const playStartTime = useRef(null);

  const stopDemo = useCallback(() => {
    if (clipEndTimer.current) {
      clearTimeout(clipEndTimer.current);
      clipEndTimer.current = null;
    }
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsDemoing(false);
  }, []);

  useEffect(() => () => stopDemo(), [stopDemo]);

  const startDemo = useCallback((idx) => {
    const genre = GENRES[idx];
    if (!genre) return;

    stopDemo();
    setIsDemoing(true);
    setHasPlayed(true);
    setDemoFinished(false);
    setPlaybackProgress(0);
    playStartTime.current = Date.now();

    if (audioRef.current) {
      if (audioRef.current.getAttribute('src') !== genre.audio) {
        audioRef.current.src = genre.audio;
        audioRef.current.load();
      }
      audioRef.current.currentTime = genre.startTime || 0;
      audioRef.current.volume = 0.8;
      audioRef.current.play().catch(err => console.error('Audio play error:', err));
    }

    // Update progress bar
    progressInterval.current = setInterval(() => {
      const elapsed = (Date.now() - playStartTime.current) / 1000;
      const pct = Math.min(elapsed / CLIP_DURATION, 1);
      setPlaybackProgress(pct);
    }, 100);

    clipEndTimer.current = setTimeout(() => {
      if (audioRef.current) audioRef.current.pause();
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      setPlaybackProgress(1);
      setIsDemoing(false);
      setDemoFinished(true);
    }, CLIP_DURATION * 1000);
  }, [stopDemo]);

  const togglePlay = useCallback(() => {
    if (isDemoing) {
      stopDemo();
    } else {
      startDemo(currentIndex);
    }
  }, [isDemoing, currentIndex, stopDemo, startDemo]);

  const handleStart = useCallback(() => {
    setCurrentIndex(0);
    setHasPlayed(false);
    setDemoFinished(false);
    setPlaybackProgress(0);
  }, []);

  const handleNext = useCallback(() => {
    stopDemo();
    if (currentIndex >= 0) {
      setCompletedIndices(prev => new Set([...prev, currentIndex]));
    }
    const nextIdx = currentIndex + 1;
    if (nextIdx < GENRES.length) {
      setCurrentIndex(nextIdx);
      setHasPlayed(false);
      setDemoFinished(false);
      setPlaybackProgress(0);
    } else {
      setCompletedIndices(prev => new Set([...prev, currentIndex]));
    }
  }, [currentIndex, stopDemo]);

  const handleReset = useCallback(() => {
    stopDemo();
    setCurrentIndex(-1);
    setHasPlayed(false);
    setDemoFinished(false);
    setPlaybackProgress(0);
    setCompletedIndices(new Set());
  }, [stopDemo]);

  const allDone = completedIndices.size === GENRES.length;
  const activeGenre = currentIndex >= 0 ? GENRES[currentIndex] : null;
  const elapsedSeconds = Math.round(playbackProgress * CLIP_DURATION);

  return (
    <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 overflow-hidden">
      <audio ref={audioRef} preload="auto" />

      {/* Top bar */}
      <div className="flex-shrink-0 px-8 pt-6 pb-3">
        <h1 className="text-4xl font-bold text-white text-center">
          <Music className="inline-block mr-3 -mt-1" size={36} />
          Know Your Genres
        </h1>
        <p className="text-lg text-slate-400 text-center mt-1">A great agent knows every corner of music</p>
      </div>

      {/* Teacher script */}
      <div className="flex-shrink-0 mx-auto w-full max-w-5xl px-8 mb-3">
        <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-2.5">
          <p className="text-base text-slate-300 leading-relaxed italic text-center">
            {currentIndex === -1 && TEACHER_SCRIPT.intro}
            {currentIndex >= 0 && !allDone && TEACHER_SCRIPT.perGenre[currentIndex]}
            {allDone && TEACHER_SCRIPT.outro}
          </p>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex min-h-0 px-8 gap-5">

        {/* Left: Genre pills (navigation) */}
        <div className="flex-shrink-0 flex flex-col gap-2 justify-center" style={{ width: 160 }}>
          {GENRES.map((g, idx) => {
            const isActive = idx === currentIndex;
            const isCompleted = completedIndices.has(idx);
            const isUpcoming = idx > currentIndex || currentIndex === -1;

            return (
              <div
                key={g.name}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
                  isActive ? 'scale-105' : ''
                } ${isUpcoming && !isActive ? 'opacity-30' : ''}`}
                style={{
                  backgroundColor: isActive ? `${g.color}30` : isCompleted ? `${g.color}15` : 'rgba(255,255,255,0.03)',
                  borderLeft: isActive ? `4px solid ${g.color}` : '4px solid transparent',
                }}
              >
                <span className="text-xl">{g.icon}</span>
                <span className={`text-sm font-bold truncate ${
                  isActive ? 'text-white' : isCompleted ? 'text-white/60' : 'text-white/30'
                }`}>{g.name}</span>
                {isCompleted && !isActive && <Check size={14} style={{ color: g.color }} className="ml-auto flex-shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Center: Active genre card */}
        <div className="flex-1 flex items-center justify-center">
          {currentIndex === -1 && (
            <div className="text-center">
              <div className="text-8xl mb-6">🎵</div>
              <p className="text-2xl text-white/60 mb-8">7 genres. 7 artists. Let's go.</p>
              <button
                onClick={handleStart}
                className="px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-2xl text-2xl font-bold text-white hover:scale-105 transition-all flex items-center gap-3 mx-auto"
              >
                <Play size={32} /> Start
              </button>
            </div>
          )}

          {activeGenre && !allDone && (
            <div
              className="w-full max-w-3xl rounded-2xl overflow-hidden border-2 shadow-2xl"
              style={{
                borderColor: `${activeGenre.color}60`,
                boxShadow: `0 0 40px ${activeGenre.color}20`,
                background: 'rgba(0,0,0,0.4)',
              }}
            >
              {/* Genre header */}
              <div
                className="px-6 py-4 flex items-center gap-4"
                style={{ background: `linear-gradient(135deg, ${activeGenre.color}40, ${activeGenre.color}15)` }}
              >
                <span className="text-5xl">{activeGenre.icon}</span>
                <div>
                  <h2 className="text-4xl font-black text-white">{activeGenre.name}</h2>
                </div>
              </div>

              {/* Content */}
              <div className="flex gap-5 p-5">
                {/* Artist photo */}
                <div className="flex-shrink-0">
                  <img
                    src={activeGenre.imageUrl}
                    alt={activeGenre.artist}
                    className="w-44 h-44 rounded-xl object-cover border-2"
                    style={{ borderColor: `${activeGenre.color}40` }}
                  />
                  <div className="mt-2 text-center">
                    <p className="text-white font-bold text-lg">{activeGenre.artist}</p>
                    <p className="text-white/40 text-xs">{activeGenre.location}</p>
                  </div>
                </div>

                {/* Bullets + playback bar */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  {/* 3 bullets about the style */}
                  <ul className="space-y-3">
                    {activeGenre.bullets.map((bullet, i) => (
                      <li key={i} className="flex gap-3 text-white/85 text-base leading-relaxed">
                        <span className="flex-shrink-0 mt-1.5 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeGenre.color }} />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Playback bar */}
                  <div className="mt-4 bg-black/30 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-white/50 text-xs font-medium">
                        {activeGenre.trackTitle} — {activeGenre.artist}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-white/40 text-[10px] font-mono w-5 text-right">
                        {elapsedSeconds}s
                      </span>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-100"
                          style={{
                            width: `${playbackProgress * 100}%`,
                            backgroundColor: isDemoing || demoFinished ? activeGenre.color : `${activeGenre.color}40`,
                          }}
                        />
                      </div>
                      <span className="text-white/40 text-[10px] font-mono w-6">
                        {CLIP_DURATION}s
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {allDone && (
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-2xl text-green-400 font-bold mb-2">All 7 genres covered!</p>
              <p className="text-lg text-white/60 mb-6">Click Next in the sidebar to advance</p>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-lg font-medium text-white flex items-center gap-2 mx-auto transition-all"
              >
                <RotateCcw size={20} /> Replay
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="flex-shrink-0 flex items-center justify-center gap-4 py-4">
        {currentIndex >= 0 && !allDone && (
          <>
            <button
              onClick={togglePlay}
              className={`px-8 py-4 rounded-2xl text-xl font-bold text-white flex items-center gap-3 hover:scale-105 transition-all ${
                isDemoing
                  ? 'bg-gradient-to-r from-orange-500 to-red-500'
                  : !hasPlayed
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 ring-4 ring-amber-400/50 animate-pulse'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500'
              }`}
            >
              {isDemoing ? <><Pause size={24} /> Pause</> : <><Play size={24} /> {hasPlayed ? 'Replay' : 'Play Preview'}</>}
            </button>

            {hasPlayed && (
              <button
                onClick={handleNext}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-2xl text-xl font-bold text-white flex items-center gap-3 hover:scale-105 transition-all"
              >
                {currentIndex < GENRES.length - 1 ? (
                  <>Next Genre <ChevronRight size={24} /></>
                ) : (
                  <>Finish <Check size={24} /></>
                )}
              </button>
            )}
          </>
        )}
      </div>

      {/* Attribution */}
      <div className="flex-shrink-0 text-center pb-2">
        <p className="text-white/15 text-xs">
          Artists from Free Music Archive &mdash; Creative Commons licensed
        </p>
      </div>
    </div>
  );
};

export default GenreShowcase;
