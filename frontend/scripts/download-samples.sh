#!/bin/bash
# Download instrument samples for the Virtual Instrument
# Source: tonejs-instruments (https://github.com/nbrosowsky/tonejs-instruments)
# License: Public domain / free to use
#
# Downloads ~3-4 notes per instrument (Tone.js Sampler interpolates the rest)
# Total size: ~5MB
#
# After running this script, upload the 'samples' folder to your R2 bucket
# at: media.musicmindacademy.com/samples/

BASE_URL="https://tonejs.github.io/audio/salamander"
VSCO_URL="https://tonejs.github.io/audio"
OUTPUT_DIR="$(dirname "$0")/../public/samples"

mkdir -p "$OUTPUT_DIR"/{piano,strings,brass,woodwind,synth-pad,plucked,choir,bass}

echo "Downloading instrument samples..."

# Piano (Salamander Grand Piano)
echo "  Piano..."
curl -sL "$BASE_URL/A3.mp3" -o "$OUTPUT_DIR/piano/A3.mp3"
curl -sL "$BASE_URL/C4.mp3" -o "$OUTPUT_DIR/piano/C4.mp3"
curl -sL "$BASE_URL/E4.mp3" -o "$OUTPUT_DIR/piano/E4.mp3"
curl -sL "$BASE_URL/A4.mp3" -o "$OUTPUT_DIR/piano/A4.mp3"
curl -sL "$BASE_URL/C5.mp3" -o "$OUTPUT_DIR/piano/C5.mp3"

# Strings (cello)
echo "  Strings..."
curl -sL "$VSCO_URL/cello/Cs3.mp3" -o "$OUTPUT_DIR/strings/C3.mp3"
curl -sL "$VSCO_URL/cello/E3.mp3" -o "$OUTPUT_DIR/strings/E3.mp3"
curl -sL "$VSCO_URL/cello/A3.mp3" -o "$OUTPUT_DIR/strings/A3.mp3"
curl -sL "$VSCO_URL/cello/Cs4.mp3" -o "$OUTPUT_DIR/strings/C4.mp3"
curl -sL "$VSCO_URL/cello/E4.mp3" -o "$OUTPUT_DIR/strings/E4.mp3"

# Brass (french horn)
echo "  Brass..."
curl -sL "$VSCO_URL/french-horn/C3.mp3" -o "$OUTPUT_DIR/brass/C3.mp3"
curl -sL "$VSCO_URL/french-horn/E3.mp3" -o "$OUTPUT_DIR/brass/E3.mp3"
curl -sL "$VSCO_URL/french-horn/A3.mp3" -o "$OUTPUT_DIR/brass/A3.mp3"
curl -sL "$VSCO_URL/french-horn/C4.mp3" -o "$OUTPUT_DIR/brass/C4.mp3"
curl -sL "$VSCO_URL/french-horn/E4.mp3" -o "$OUTPUT_DIR/brass/E4.mp3"

# Woodwind (flute)
echo "  Woodwind..."
curl -sL "$VSCO_URL/flute/C4.mp3" -o "$OUTPUT_DIR/woodwind/C4.mp3"
curl -sL "$VSCO_URL/flute/E4.mp3" -o "$OUTPUT_DIR/woodwind/E4.mp3"
curl -sL "$VSCO_URL/flute/A4.mp3" -o "$OUTPUT_DIR/woodwind/A4.mp3"
curl -sL "$VSCO_URL/flute/C5.mp3" -o "$OUTPUT_DIR/woodwind/C5.mp3"

# Plucked (guitar nylon)
echo "  Plucked..."
curl -sL "$VSCO_URL/guitar-nylon/C3.mp3" -o "$OUTPUT_DIR/plucked/C3.mp3"
curl -sL "$VSCO_URL/guitar-nylon/E3.mp3" -o "$OUTPUT_DIR/plucked/E3.mp3"
curl -sL "$VSCO_URL/guitar-nylon/A3.mp3" -o "$OUTPUT_DIR/plucked/A3.mp3"
curl -sL "$VSCO_URL/guitar-nylon/C4.mp3" -o "$OUTPUT_DIR/plucked/C4.mp3"
curl -sL "$VSCO_URL/guitar-nylon/E4.mp3" -o "$OUTPUT_DIR/plucked/E4.mp3"

# Bass (contrabass)
echo "  Bass..."
curl -sL "$VSCO_URL/contrabass/C1.mp3" -o "$OUTPUT_DIR/bass/C1.mp3"
curl -sL "$VSCO_URL/contrabass/E1.mp3" -o "$OUTPUT_DIR/bass/E1.mp3"
curl -sL "$VSCO_URL/contrabass/A1.mp3" -o "$OUTPUT_DIR/bass/A1.mp3"
curl -sL "$VSCO_URL/contrabass/C2.mp3" -o "$OUTPUT_DIR/bass/C2.mp3"
curl -sL "$VSCO_URL/contrabass/E2.mp3" -o "$OUTPUT_DIR/bass/E2.mp3"

# Synth Pad and Choir - these sound better synthesized, skip samples
# (PolySynth fallback will be used for these)
echo "  Synth Pad — using synthesized sound (no samples needed)"
echo "  Choir — using synthesized sound (no samples needed)"

echo ""
echo "Done! Samples downloaded to: $OUTPUT_DIR"
echo ""
echo "Total files:"
find "$OUTPUT_DIR" -name "*.mp3" | wc -l
echo ""
echo "Total size:"
du -sh "$OUTPUT_DIR"
echo ""
echo "Next steps:"
echo "  1. Upload the 'samples' folder to your R2 bucket"
echo "  2. It should be accessible at: media.musicmindacademy.com/samples/"
echo "  3. Or for local testing, the files are in public/samples/ and served by Vite"
