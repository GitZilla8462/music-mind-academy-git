// useVolumeControl.js - FIXED: Prevent infinite rerender during resize
// 🔥 KEY FIX: Use ref for placedLoops to avoid triggering on every state change
import { useEffect, useRef } from 'react';

export const useVolumeControl = ({
  audioReady,
  playersRef,
  placedLoops,
  trackStates,
  volume,
  isMuted
}) => {
  // 🔥 FIX: Use ref to track placed loops without triggering rerenders
  const placedLoopsRef = useRef(placedLoops);
  
  // Update ref when placedLoops changes
  useEffect(() => {
    placedLoopsRef.current = placedLoops;
  }, [placedLoops]);
  
  // 🔥 FIX: Only trigger volume updates when audio settings change, NOT when loops change
  useEffect(() => {
    if (!audioReady || !playersRef.current) {
      console.log('Volume control skipped - audioReady:', audioReady, 'playersRef:', !!playersRef.current);
      return;
    }
    
    console.log('=== APPLYING VOLUME CHANGES ===');
    console.log('Master volume:', volume);
    console.log('Muted:', isMuted);
    console.log('Total loops:', placedLoopsRef.current.length);
    
    // Check if any tracks are soloed
    const soloedTracks = Object.keys(trackStates).filter(trackId => trackStates[trackId].solo);
    const hasSoloedTracks = soloedTracks.length > 0;
    
    if (hasSoloedTracks) {
      console.log('Soloed tracks:', soloedTracks);
    }
    
    let successCount = 0;
    let failCount = 0;
    
    // 🔥 FIX: Use the ref value, not the state value
    placedLoopsRef.current.forEach(loop => {
      const player = playersRef.current[loop.id];
      const trackState = trackStates[`track-${loop.trackIndex}`];
      
      if (!player) {
        console.log(`⚠️ No player for ${loop.name}`);
        failCount++;
        return;
      }
      
      if (!trackState) {
        console.log(`⚠️ No track state for track ${loop.trackIndex}`);
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
      const soloMultiplier = shouldPlayBasedOnSolo ? 1 : 0; // Mute if not soloed when solo is active
      
      // Final volume = loop × track × master × mute states × solo state
      const finalVolume = loopVolume * trackVolume * masterVol * trackMuted * masterMuted * soloMultiplier;
      
      try {
        if (player.isNative && player.audio) {
          // Native HTML5 Audio: Use linear volume (0-1)
          const clampedVolume = Math.max(0, Math.min(1, finalVolume));
          player.audio.volume = clampedVolume;
          
          if (soloMultiplier === 0) {
            console.log(`🔇 Native: ${loop.name} → MUTED (track not soloed)`);
          } else {
            console.log(`✅ Native: ${loop.name} → ${(clampedVolume * 100).toFixed(0)}% (track: ${(trackVolume * 100).toFixed(0)}%)`);
          }
          successCount++;
        } else if (player.volume && window.Tone) {
          // Tone.js Player: Convert to dB
          const dbValue = finalVolume === 0 ? -Infinity : window.Tone.gainToDb(finalVolume);
          player.volume.value = dbValue;
          
          if (soloMultiplier === 0) {
            console.log(`🔇 Tone.js: ${loop.name} → MUTED (track not soloed)`);
          } else {
            console.log(`✅ Tone.js: ${loop.name} → ${dbValue === -Infinity ? '-∞' : dbValue.toFixed(1)}dB (track: ${(trackVolume * 100).toFixed(0)}%)`);
          }
          successCount++;
        } else {
          console.log(`⚠️ ${loop.name}: No valid volume control found`);
          failCount++;
        }
      } catch (error) {
        console.error(`❌ ${loop.name}: Volume update failed -`, error.message);
        failCount++;
      }
    });
    
    console.log(`=== VOLUME UPDATE COMPLETE: ${successCount} success, ${failCount} failed ===\n`);
    
  }, [audioReady, playersRef, trackStates, volume, isMuted]);
  // 🔥 FIX: Removed placedLoops from dependencies! Now only triggers on audio settings changes
};