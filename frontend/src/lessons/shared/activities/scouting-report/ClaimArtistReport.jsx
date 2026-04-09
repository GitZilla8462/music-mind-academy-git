// ClaimArtistReport — Lesson 3 Scouting Report using the SlideCanvas tool
// Thin wrapper around ScoutingReport with variant='claim-your-artist'
// Uses claimArtistConfig.js for 3-slide definitions:
//   Slide 1: Artist Overview (name, track, location, genre)
//   Slide 2: The Four Points (unique sound, compelling story, signs of growth, gut feeling)
//   Slide 3: Fact or Opinion Sort (classify 6 statements)

import React from 'react';
import ScoutingReport from './ScoutingReport';

const ClaimArtistReport = (props) => (
  <ScoutingReport {...props} variant="claim-your-artist" />
);

export default ClaimArtistReport;
