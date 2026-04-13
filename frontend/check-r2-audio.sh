#!/bin/bash
# Check which media.musicmindacademy.com files exist on R2
# Usage: ./check-r2-audio.sh

OK=0
MISSING=0
MISSING_FILES=""

URLS=(
  # ── artistDatabase.js: HoliznaCC0 ──
  "https://media.musicmindacademy.com/artists/holiznacc0/foggy-headed.mp3"
  "https://media.musicmindacademy.com/artists/holiznacc0/whatever.mp3"
  "https://media.musicmindacademy.com/artists/holiznacc0/plants.mp3"
  "https://media.musicmindacademy.com/artists/holiznacc0/clouds.mp3"
  # ── artistDatabase.js: Ketsa ──
  "https://media.musicmindacademy.com/artists/ketsa/trench-work.mp3"
  "https://media.musicmindacademy.com/artists/ketsa/will-make-you-happy.mp3"
  "https://media.musicmindacademy.com/artists/ketsa/no-limits.mp3"
  "https://media.musicmindacademy.com/artists/ketsa/all-ways.mp3"
  # ── artistDatabase.js: Broke For Free ──
  "https://media.musicmindacademy.com/artists/broke-for-free/nothing-like-captain-crunch.mp3"
  "https://media.musicmindacademy.com/artists/broke-for-free/calm-down.mp3"
  "https://media.musicmindacademy.com/artists/broke-for-free/the-great.mp3"
  "https://media.musicmindacademy.com/artists/broke-for-free/caught-in-the-beat.mp3"
  # ── artistDatabase.js: Josh Woodward ──
  "https://media.musicmindacademy.com/artists/josh-woodward/gravity.mp3"
  "https://media.musicmindacademy.com/artists/josh-woodward/stickybee.mp3"
  "https://media.musicmindacademy.com/artists/josh-woodward/insomnia.mp3"
  # ── artistDatabase.js: Cullah ──
  "https://media.musicmindacademy.com/artists/cullah/cullahtivation-revelation.mp3"
  "https://media.musicmindacademy.com/artists/cullah/falling.mp3"
  "https://media.musicmindacademy.com/artists/cullah/runaway.mp3"
  "https://media.musicmindacademy.com/artists/cullah/a-trying-shame.mp3"
  # ── artistDatabase.js: Pamela Yuen ──
  "https://media.musicmindacademy.com/artists/pamela-yuen/follow.mp3"
  "https://media.musicmindacademy.com/artists/pamela-yuen/quiet-years.mp3"
  "https://media.musicmindacademy.com/artists/pamela-yuen/the-unfolding.mp3"
  "https://media.musicmindacademy.com/artists/pamela-yuen/our-feet-will-have-wings.mp3"
  # ── artistDatabase.js: Komiku ──
  "https://media.musicmindacademy.com/artists/komiku/tale-on-the-late.mp3"
  "https://media.musicmindacademy.com/artists/komiku/remember-the-time.mp3"
  "https://media.musicmindacademy.com/artists/komiku/the-road-we-traveled.mp3"
  "https://media.musicmindacademy.com/artists/komiku/friends.mp3"
  # ── artistDatabase.js: Jahzzar ──
  "https://media.musicmindacademy.com/artists/jahzzar/curves.mp3"
  "https://media.musicmindacademy.com/artists/jahzzar/mainsquare.mp3"
  "https://media.musicmindacademy.com/artists/jahzzar/dew.mp3"
  "https://media.musicmindacademy.com/artists/jahzzar/bloom.mp3"
  # ── artistDatabase.js: Kevin MacLeod ──
  "https://media.musicmindacademy.com/artists/kevin-macleod/monkeys-spinning-monkeys.mp3"
  "https://media.musicmindacademy.com/artists/kevin-macleod/casa-bossa-nova.mp3"
  "https://media.musicmindacademy.com/artists/kevin-macleod/cold-funk.mp3"
  "https://media.musicmindacademy.com/artists/kevin-macleod/sneaky-snitch.mp3"
  # ── artistDatabase.js: Kellee Maize ──
  "https://media.musicmindacademy.com/artists/kellee-maize/in-tune-remix-2.mp3"
  "https://media.musicmindacademy.com/artists/kellee-maize/in-tune-j-glaze-remix.mp3"
  # ── artistDatabase.js: Soft and Furious ──
  "https://media.musicmindacademy.com/artists/soft-and-furious/is-this-fruit-edible.mp3"
  "https://media.musicmindacademy.com/artists/soft-and-furious/horizon-ending.mp3"
  "https://media.musicmindacademy.com/artists/soft-and-furious/powerful-stasis.mp3"
  "https://media.musicmindacademy.com/artists/soft-and-furious/and-never-come-back.mp3"
  # ── artistDatabase.js: Rolemusic ──
  "https://media.musicmindacademy.com/artists/rolemusic/the-white-kitty.mp3"
  "https://media.musicmindacademy.com/artists/rolemusic/the-white.mp3"
  "https://media.musicmindacademy.com/artists/rolemusic/juglar-street.mp3"
  "https://media.musicmindacademy.com/artists/rolemusic/the-little-broth.mp3"
  # ── artistDatabase.js: Nihilore ──
  "https://media.musicmindacademy.com/artists/nihilore/climbers-in-the-dark.mp3"
  "https://media.musicmindacademy.com/artists/nihilore/something-beautiful.mp3"
  "https://media.musicmindacademy.com/artists/nihilore/so-does-hope.mp3"
  "https://media.musicmindacademy.com/artists/nihilore/brocken-spectre.mp3"
  # ── artistDatabase.js: Pierce Murphy ──
  "https://media.musicmindacademy.com/artists/pierce-murphy/any-single-thing.mp3"
  "https://media.musicmindacademy.com/artists/pierce-murphy/baby-write.mp3"
  "https://media.musicmindacademy.com/artists/pierce-murphy/persimmon.mp3"
  "https://media.musicmindacademy.com/artists/pierce-murphy/sparkling-impermanence.mp3"
  # ── artistDatabase.js: Fog Lake ──
  "https://media.musicmindacademy.com/artists/fog-lake/spectrogram.mp3"
  "https://media.musicmindacademy.com/artists/fog-lake/push.mp3"
  "https://media.musicmindacademy.com/artists/fog-lake/oak-island.mp3"
  "https://media.musicmindacademy.com/artists/fog-lake/roswell.mp3"
  # ── artistDatabase.js: Jason Shaw ──
  "https://media.musicmindacademy.com/artists/jason-shaw/jennys-theme.mp3"
  "https://media.musicmindacademy.com/artists/jason-shaw/acoustic-blues.mp3"
  "https://media.musicmindacademy.com/artists/jason-shaw/12-mornings.mp3"
  "https://media.musicmindacademy.com/artists/jason-shaw/words.mp3"
  # ── artistDatabase.js: David Mumford ──
  "https://media.musicmindacademy.com/artists/david-mumford/darling-corina.mp3"
  "https://media.musicmindacademy.com/artists/david-mumford/the-worst-of-it.mp3"
  "https://media.musicmindacademy.com/artists/david-mumford/ball-and-chain.mp3"
  "https://media.musicmindacademy.com/artists/david-mumford/the-shelby-blues.mp3"
  # ── artistDatabase.js: Austin Moffa ──
  "https://media.musicmindacademy.com/artists/austin-moffa/roll-on.mp3"
  "https://media.musicmindacademy.com/artists/austin-moffa/the-interview.mp3"
  "https://media.musicmindacademy.com/artists/austin-moffa/some-kind-of-morning.mp3"
  "https://media.musicmindacademy.com/artists/austin-moffa/silver-dagger.mp3"
  # ── lesson2Config.jsx: additional tracks for independent listening ──
  # (guided tracks already covered above; these are the indie-only ones)
  "https://media.musicmindacademy.com/artists/david-mumford/darling-corina.mp3"
  "https://media.musicmindacademy.com/artists/pamela-yuen/follow.mp3"
  # ── StringFamilyShowcase.jsx: instrument demo videos ──
  "https://media.musicmindacademy.com/lessons/listening-lab/lesson1/videos/violin-demo.mp4"
  "https://media.musicmindacademy.com/lessons/listening-lab/lesson1/videos/viola-demo.mp4"
  "https://media.musicmindacademy.com/lessons/listening-lab/lesson1/videos/cello-demo.mp4"
  "https://media.musicmindacademy.com/lessons/listening-lab/lesson1/videos/bass-demo.mp4"
  # ── WoodwindFamilyShowcase.jsx: instrument demo videos ──
  "https://media.musicmindacademy.com/lessons/listening-lab/lesson2/videos/flute-clip.mp4"
  "https://media.musicmindacademy.com/lessons/listening-lab/lesson2/videos/oboe-clip.mp4"
  "https://media.musicmindacademy.com/lessons/listening-lab/lesson2/videos/clarinet-clip.mp4"
  "https://media.musicmindacademy.com/lessons/listening-lab/lesson2/videos/bassoon-clip.mp4"
)

# Deduplicate
UNIQUE_URLS=($(printf '%s\n' "${URLS[@]}" | sort -u))

echo "Checking ${#UNIQUE_URLS[@]} unique media files on media.musicmindacademy.com..."
echo "=========================================="
echo ""

for url in "${UNIQUE_URLS[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -I "$url" 2>/dev/null)
  SHORT="${url#https://media.musicmindacademy.com/}"
  if [ "$STATUS" = "200" ]; then
    echo "  OK  $SHORT"
    OK=$((OK + 1))
  else
    echo "  $STATUS  $SHORT"
    MISSING=$((MISSING + 1))
    MISSING_FILES="$MISSING_FILES\n  $STATUS  $SHORT"
  fi
done

echo ""
echo "=========================================="
echo "SUMMARY: $OK files OK, $MISSING files MISSING"

if [ "$MISSING" -gt 0 ]; then
  echo ""
  echo "Missing files:"
  echo -e "$MISSING_FILES"
  exit 1
fi
