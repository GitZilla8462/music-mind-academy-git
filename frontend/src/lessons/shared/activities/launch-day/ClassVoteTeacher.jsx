// ClassVoteTeacher.jsx — Voting + Results for Music Journalist Lesson 5
// Students vote on Chromebooks, teacher sees live tally, then reveals results + awards

import React, { useState, useEffect, useCallback } from 'react';
import { Vote, Trophy, User, X, ChevronRight } from 'lucide-react';
import { getDatabase, ref, onValue, update, get } from 'firebase/database';

const AWARDS = [
  { id: 'gone-viral', label: 'Gone Viral', emoji: '🚀', description: 'Most votes' },
  { id: 'best-hook', label: 'Best Hook', emoji: '🎣', description: 'Most compelling opening' },
  { id: 'best-sound', label: 'Best Sound Statement', emoji: '🎧', description: 'Most vivid music description' },
  { id: 'strongest-case', label: 'Strongest Case', emoji: '📊', description: 'Best evidence and research' },
  { id: 'best-design', label: 'Best Campaign', emoji: '🎨', description: 'Most professional presentation' },
  { id: 'crowd-favorite', label: 'Crowd Favorite', emoji: '👏', description: 'Biggest audience reaction' },
];

const ClassVoteTeacher = ({ sessionCode }) => {
  const [phase, setPhase] = useState('voting'); // 'voting' | 'results'
  const [votes, setVotes] = useState({});
  const [artists, setArtists] = useState([]);
  const [manualAwards, setManualAwards] = useState({});
  const [showAwardPicker, setShowAwardPicker] = useState(null);

  // Load artist list from the class roster's press kit data
  useEffect(() => {
    if (!sessionCode) return;
    const db = getDatabase();
    const classId = new URLSearchParams(window.location.search).get('classId');
    if (!classId) return;

    const loadArtists = async () => {
      const rosterRef = ref(db, `classRosters/${classId}`);
      const rosterSnap = await get(rosterRef);
      if (!rosterSnap.exists()) return;

      const seats = [];
      rosterSnap.forEach((child) => {
        const seat = child.val();
        if (seat.status === 'active') seats.push(seat);
      });

      // Load artist names from press kit data
      const { getStudentWorkForTeacher } = await import('../../../../firebase/studentWork');
      const artistList = [];
      for (const seat of seats) {
        const uid = `seat-${classId}-${seat.seatNumber}`;
        try {
          const data = await getStudentWorkForTeacher(uid, 'mj-lesson4-mj-press-kit');
          if (data?.data?.slides?.[0]) {
            const slide1 = data.data.slides[0];
            const artistObj = slide1.objects?.find(o => o.type === 'text' && o.role === 'artistName');
            const artistName = artistObj?.text || slide1.fields?.artistName || slide1.fields?.hookLine || '';
            artistList.push({
              uid,
              studentName: seat.displayName || `Seat ${seat.seatNumber}`,
              artistName: artistName || 'Unknown Artist',
            });
          }
        } catch { /* skip */ }
      }
      setArtists(artistList);

      // Broadcast voting phase to students
      update(ref(db, `sessions/${sessionCode}/presentationState`), {
        phase: 'voting',
        artists: artistList.map(a => ({ uid: a.uid, name: a.studentName, artistName: a.artistName })),
        updatedAt: Date.now(),
      });
    };

    loadArtists();
  }, [sessionCode]);

  // Listen for votes
  useEffect(() => {
    if (!sessionCode) return;
    const db = getDatabase();
    const votesRef = ref(db, `sessions/${sessionCode}/artistVotes`);
    const unsub = onValue(votesRef, (snap) => {
      setVotes(snap.val() || {});
    });
    return () => unsub();
  }, [sessionCode]);

  // Calculate vote tallies
  const voteTallies = {};
  Object.values(votes).forEach(v => {
    if (v.artistName) {
      voteTallies[v.artistName] = (voteTallies[v.artistName] || 0) + 1;
    }
  });
  const sortedArtists = Object.entries(voteTallies).sort((a, b) => b[1] - a[1]);
  const winner = sortedArtists[0];
  const totalVotes = Object.keys(votes).length;

  const showResults = useCallback(() => {
    setPhase('results');
    if (sessionCode) {
      const db = getDatabase();
      update(ref(db, `sessions/${sessionCode}/presentationState`), {
        phase: 'results',
        updatedAt: Date.now(),
      });
    }
  }, [sessionCode]);

  const assignAward = (awardId, uid) => {
    setManualAwards(prev => ({ ...prev, [awardId]: uid }));
    setShowAwardPicker(null);
  };

  // ─── Voting Phase ──────────────────────────────────────
  if (phase === 'voting') {
    return (
      <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-[#1a2744] via-[#0f1a2e] to-[#1a2744]">
        <div className="flex-shrink-0 px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">🗳️ Class Vote</h1>
            <p className="text-white/50 text-sm">Which artist deserves to go viral?</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/50 text-sm">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
            <button
              onClick={showResults}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#f0b429] text-[#1a2744] rounded-xl font-bold text-sm hover:bg-[#f0b429]/90 transition-all"
            >
              <Trophy size={16} />
              Reveal Results
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto space-y-3">
            {sortedArtists.length === 0 ? (
              <div className="text-center py-12">
                <Vote size={48} className="text-white/20 mx-auto mb-4" />
                <p className="text-white/40 text-lg">Waiting for votes...</p>
                <p className="text-white/25 text-sm mt-1">Students are voting on their Chromebooks</p>
              </div>
            ) : (
              sortedArtists.map(([artistName, count], idx) => {
                const maxVotes = sortedArtists[0]?.[1] || 1;
                const pct = (count / maxVotes) * 100;
                return (
                  <div key={artistName} className="relative bg-white/5 border border-white/10 rounded-xl p-4 overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-[#f0b429]/10 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {idx === 0 && <span className="text-2xl">🚀</span>}
                        <span className="text-white font-bold text-lg">{artistName}</span>
                      </div>
                      <span className="text-[#f0b429] font-bold text-xl">{count} vote{count !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Results Phase ──────────────────────────────────────
  return (
    <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-[#1a2744] via-[#0f1a2e] to-[#1a2744] overflow-auto">
      <div className="flex-shrink-0 px-6 py-4 border-b border-white/10">
        <h1 className="text-3xl font-black text-white text-center">🏆 The Results Are In</h1>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Gone Viral — auto from votes */}
          {winner && (
            <div className="bg-gradient-to-r from-[#f0b429]/20 to-[#f0b429]/5 border-2 border-[#f0b429]/50 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-2">🚀</div>
              <h2 className="text-2xl font-black text-[#f0b429] mb-1">GONE VIRAL</h2>
              <p className="text-white text-3xl font-bold mb-1">{winner[0]}</p>
              <p className="text-white/50 text-sm">{winner[1]} vote{winner[1] !== 1 ? 's' : ''}</p>
            </div>
          )}

          {/* Manual awards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AWARDS.filter(a => a.id !== 'gone-viral').map(award => {
              const assignedUid = manualAwards[award.id];
              const assignedArtist = artists.find(a => a.uid === assignedUid);
              return (
                <div
                  key={award.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-all"
                  onClick={() => setShowAwardPicker(award.id)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{award.emoji}</span>
                    <div>
                      <div className="text-white font-bold text-sm">{award.label}</div>
                      <div className="text-white/40 text-xs">{award.description}</div>
                    </div>
                  </div>
                  {assignedArtist ? (
                    <div className="bg-[#f0b429]/10 border border-[#f0b429]/30 rounded-lg px-3 py-2 text-[#f0b429] font-semibold text-sm">
                      {assignedArtist.studentName} — {assignedArtist.artistName}
                    </div>
                  ) : (
                    <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/30 text-sm">
                      Tap to assign
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Award picker modal */}
      {showAwardPicker && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1a2744] rounded-2xl border border-white/20 max-w-sm w-full max-h-[80vh] overflow-auto">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-white font-bold text-sm">
                {AWARDS.find(a => a.id === showAwardPicker)?.label}
              </h3>
              <button onClick={() => setShowAwardPicker(null)} className="text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-2">
              {artists.map(artist => (
                <button
                  key={artist.uid}
                  onClick={() => assignAward(showAwardPicker, artist.uid)}
                  className="w-full px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-colors flex items-center gap-3"
                >
                  <User size={16} className="text-white/40" />
                  <div>
                    <div className="text-white text-sm font-medium">{artist.studentName}</div>
                    <div className="text-[#f0b429] text-xs">{artist.artistName}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassVoteTeacher;
