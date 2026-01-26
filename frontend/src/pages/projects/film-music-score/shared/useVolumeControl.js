// useVolumeControl.js - FIXED: Wait for players to be ready before applying volumes
// ✅ KEY FIX: Check if players exist before trying to apply volumes
// ✅ FIXED: Update active gain nodes for real-time volume changes during playback
import { useEffect, useRef } from 'react';

// Debug logging (disabled for production - enable for debugging volume issues)
const DEBUG_VOLUME = false;

export const useVolumeControl = ({
  audioReady,
  playersRef,
  activeGainNodesRef,  // ✅ NEW: Ref to active gain nodes for real-time updates
  placedLoops,
  trackStates,
  volume,
  isMuted
}) => {
  // Use ref to track placed loops without triggering rerenders
  const placedLoopsRef = useRef(placedLoops);

  // Update ref when placedLoops changes
  useEffect(() => {
    placedLoopsRef.current = placedLoops;
  }, [placedLoops]);

  // ✅ FIX: Only trigger volume updates when audio settings change AND players exist
  useEffect(() => {
    if (!audioReady || !playersRef.current) {
      return;
    }

    // ✅ NEW: Check if we actually have players for the loops before proceeding
    const hasPlayers = placedLoopsRef.current.length === 0 ||
                      placedLoopsRef.current.some(loop => playersRef.current[loop.id]);

    if (!hasPlayers && placedLoopsRef.current.length > 0) {
      return;
    }

    // Check if any tracks are soloed
    const soloedTracks = Object.keys(trackStates).filter(trackId => trackStates[trackId].solo);
    const hasSoloedTracks = soloedTracks.length > 0;

    if (DEBUG_VOLUME) {
      console.log('=== APPLYING VOLUME CHANGES ===');
      console.log('Master volume:', volume);
      console.log('Muted:', isMuted);
      console.log('Total loops:', placedLoopsRef.current.length);
      if (hasSoloedTracks) {
        console.log('Soloed tracks:', soloedTracks);
      }
    }

    let successCount = 0;
    let failCount = 0;

    placedLoopsRef.current.forEach(loop => {
      const player = playersRef.current[loop.id];
      const trackState = trackStates[`track-${loop.trackIndex}`];

      if (!trackState) {
        failCount++;
        return;
      }

      // SOLO LOGIC: If any track is soloed, mute all non-soloed tracks
      const shouldPlayBasedOnSolo = !hasSoloedTracks || trackState.solo;

      // Calculate final volume with ALL multipliers including solo
      const trackVolume = trackState.volume !== undefined ? trackState.volume : 0.7;
      const loopVolume = loop.volume !== undefined ? loop.volume : 0.8;
      const masterVol = volume;
      const trackMuted = trackState.muted ? 0 : 1;
      const masterMuted = isMuted ? 0 : 1;
      const soloMultiplier = shouldPlayBasedOnSolo ? 1 : 0;

      // Final volume = loop × track × master × mute states × solo state
      const finalVolume = loopVolume * trackVolume * masterVol * trackMuted * masterMuted * soloMultiplier;

      try {
        // ✅ NEW: Update active gain node for real-time volume during playback
        const activeGainNode = activeGainNodesRef?.current?.get(loop.id);
        if (activeGainNode) {
          activeGainNode.gain.value = finalVolume;
          successCount++;
          return; // Successfully updated active playback
        }

        // Fallback: Update player if it exists (for non-playing loops)
        if (!player) {
          failCount++;
          return;
        }

        if (player.isNative && player.audio) {
          // Native HTML5 Audio: Use linear volume (0-1)
          const clampedVolume = Math.max(0, Math.min(1, finalVolume));
          player.audio.volume = clampedVolume;
          successCount++;
        } else if (player.volume && window.Tone) {
          // Tone.js Player: Convert to dB
          const dbValue = finalVolume === 0 ? -Infinity : window.Tone.gainToDb(finalVolume);
          player.volume.value = dbValue;
          successCount++;
        } else {
          // Buffer-based player without active gain node - this is fine, volume will apply on next play
          successCount++;
        }
      } catch (error) {
        console.error(`❌ ${loop.name}: Volume update failed -`, error.message);
        failCount++;
      }
    });

    if (DEBUG_VOLUME) {
      console.log(`=== VOLUME UPDATE COMPLETE: ${successCount} success, ${failCount} failed ===\n`);
    }

  }, [audioReady, playersRef, trackStates, volume, isMuted]);
};
