# Music Mind Academy - Project Context

## What This Is

A web-based music education platform where middle school students create music for video using drag-and-drop loops. Runs on Chromebooks. No instrument experience required.

**10-second pitch:** Students create music for video using loops—no instrument experience needed. Five lessons teaching mood, instrumentation, texture, and form. Runs on Chromebooks. Standards-aligned.

**Target users:** 6th-8th grade students, short attention spans, partner activities work well

**Tech stack:** React frontend (Vercel), Node.js backend (Railway), MongoDB Atlas, Tone.js + HTML5 Audio

**Chromebook constraints:** 1366x768 resolution, limited RAM, no native app installs

---

## The Unit: Music for Media (5 Lessons)

Students learn to create music for video by mastering one concept at a time.

### Progression

```
Lesson 1: This music feels EPIC (Mood)
    ↓
Lesson 2: Because it uses BRASS and DRUMS (Instrumentation)
    ↓
Lesson 3: And 4 LAYERS playing together (Texture)
    ↓
Lesson 4: And the drums don't enter until the CLIMAX (Form)
    ↓
Lesson 5: Now I can CREATE using all 4 concepts (Capstone)
```

### Lesson Overview

| Lesson | Concept | Video | Status |
|--------|---------|-------|--------|
| **1** | Mood & Expression | Score the Adventure (drone nature) | **NEW - BUILD THIS** |
| **2** | Instrumentation & Timbre | Sports Highlights | Exists - needs reframe |
| **3** | Texture & Layering | City Soundscapes | Exists - good |
| **4** | Form & Structure | Epic Wildlife | Exists - good |
| **5** | Capstone Project | Student choice | **NEW - BUILD LATER** |

---

## Lesson 1: Score the Adventure (NEW)

**Concept:** Mood & Expression - Why does music affect us?

**Video:** Drone footage montage (mountains, ocean, forest, cave) - 60-90 seconds

**Key insight:** Same video + different music = completely different feeling

### Lesson Stages

```
1. INTRODUCTION (10 min)
   - welcome-intro (slide): "Today: Score the Adventure"
   - show-agenda (slide): Lesson overview
   - hook-demo (demo): Same video with 2 different scores
   - mood-discussion (slide): "How did the music change how you felt?"
   - mood-categories (slide): Epic, Scary, Mysterious, Peaceful, Triumphant

2. PRACTICE (6 min)
   - mood-match-intro (slide): Explain the activity
   - mood-match-game (activity): Hear loops, categorize by mood [NEW ACTIVITY]

3. CREATE (15 min)
   - composition-instructions (slide): Pick a mood, use 5+ loops
   - composition-tutorial (video): How to use the DAW (2 min)
   - adventure-composition (activity): Score the drone footage [NEW ACTIVITY]

4. REFLECT (6 min)
   - reflection-instructions (slide): Two Stars and a Wish
   - reflection (activity): What mood? What worked?

5. CONCLUSION (2 min)
   - conclusion (discussion): Share moods, compare choices
```

### Activities to Build

| Activity | Type | Description |
|----------|------|-------------|
| mood-match-game | Warm-up | Hear 8-10 loops, drag to mood categories (Epic, Scary, Mysterious, Peaceful, Triumphant) |
| adventure-composition | Composition | First DAW composition - pick mood, score drone footage, 5+ loops required |

### Files to Create

```
/src/lessons/film-music-project/lesson1-mood/
├── Lesson1.jsx                 # Main orchestrator (copy pattern from Lesson2.jsx)
├── Lesson1config.jsx           # Stages, sections, activities
├── lesson1StorageUtils.js      # localStorage helpers
├── summarySlideContent.js      # All slide text content
└── slides/                     # PNG slides 1.png, 2.png, etc.

/src/lessons/shared/activities/
├── mood-match-game/
│   ├── MoodMatchGameActivity.jsx
│   ├── moodMatchConfig.js
│   └── index.js
└── adventure-composition/
    └── (uses existing DAW component with adventure video)
```

### Mood Categories

Use these for the Mood Match Game:

| Mood | Description | Loop Characteristics |
|------|-------------|---------------------|
| Epic | Powerful, heroic, triumphant | Brass, big drums, major key |
| Scary | Frightening, tense, horror | Low synths, dissonance, sparse |
| Mysterious | Intriguing, unknown, curious | Minor key, soft, atmospheric |
| Peaceful | Calm, relaxing, serene | Acoustic, slow, major key |
| Triumphant | Victorious, celebratory | Brass, percussion, building |

---

## Lesson 2: Sports Highlights (EXISTS)

**Concept:** Instrumentation & Timbre - What sounds am I using?

**Current state:** Built, but framed as "DAW Tutorial" lesson

**Changes needed:**
- Remove DAW Tutorial activity (students learn DAW in Lesson 1 now)
- Reframe slides around instrumentation concept
- Keep Melody Escape Room (perfect for this concept)
- Keep Sports Composition

### Files

```
/src/lessons/film-music-project/lesson2/
├── Lesson2.jsx
├── Lesson2config.jsx
├── lesson2StorageUtils.js
├── summarySlideContent.js
└── slides/
```

---

## Lesson 3: City Soundscapes (EXISTS - GOOD)

**Concept:** Texture & Layering - How many sounds play together?

**Current state:** Well-built, concept is clear

**Changes needed:** Minor - ensure slides reference Lessons 1-2 concepts

### Files

```
/src/lessons/film-music-project/lesson3/
├── Lesson3.jsx
├── Lesson3config.jsx
├── lesson3StorageUtils.js
├── summarySlideContent.js
└── slides/
```

---

## Lesson 4: Epic Wildlife (EXISTS - GOOD)

**Concept:** Form & Structure - When do sounds come in and out?

**Current state:** Well-built, has Sectional Loop Builder game

**Changes needed:** Minor - ensure slides reference Lessons 1-3 concepts

### Files

```
/src/lessons/film-music-project/lesson4/
├── Lesson4.jsx
├── Lesson4config.jsx
├── lesson4StorageUtils.js
├── summarySlideContent.js
└── slides/
```

---

## Lesson 5: Capstone (NEW - BUILD LATER)

**Concept:** Putting It All Together

**Activities needed:**
- Planning worksheet
- Final composition (student choice video)
- Peer critique
- Self-assessment with rubric

---

## Existing Activities Reference

### Keep and Reuse

| Activity | Current Lesson | Keep In |
|----------|----------------|---------|
| Melody Escape Room | 2 | Lesson 2 |
| Sports Composition | 2 | Lesson 2 |
| Listening Map | 3 | Lesson 3 |
| City Composition | 3 | Lesson 3 |
| Sectional Loop Builder | 4 | Lesson 4 |
| Wildlife Composition | 4 | Lesson 4 |
| Monster Melody Maker | 4 | Lesson 4 |
| Two Stars and a Wish | All | All lessons |

### Remove

| Activity | Reason |
|----------|--------|
| DAW Tutorial (Lesson 1) | Students learn DAW during Lesson 1 composition |
| DAW Tutorial (Lesson 2) | Redundant |
| School Beneath Composition | Replaced by Score the Adventure |

---

## Code Patterns

### Lesson Config Structure

```jsx
export const lessonSections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    subtitle: 'Slides → Hook',
    color: 'blue',
    estimatedTime: 10,
    stages: [
      { id: 'welcome-intro', type: 'summary', label: 'Welcome', duration: 1 },
      { id: 'some-activity', type: 'activity', label: 'Activity Name', duration: 5, hasTimer: true, trackProgress: true }
    ]
  }
];

export const lessonStages = [
  {
    id: 'welcome-intro',
    label: 'Welcome',
    description: 'Teacher prompt or action',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson1-mood/slides/1.png'
    }
  }
];
```

### Activity Component Pattern

```jsx
const SomeActivity = ({ onComplete, viewMode, isSessionMode }) => {
  // Activity logic
  
  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Activity UI */}
    </div>
  );
};

export default SomeActivity;
```

### Storage Utils Pattern

```javascript
export const STORAGE_KEYS = {
  COMPOSITION: 'lesson1-composition',
  REFLECTION: 'lesson1-reflection',
  LESSON_PROGRESS: 'lesson1-progress'
};

export const saveComposition = (placedLoops, requirements) => {
  const composition = {
    placedLoops,
    requirements,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.COMPOSITION, JSON.stringify(composition));
  return composition;
};
```

---

## UI/UX Guidelines

- Dark backgrounds (bg-gray-900, bg-gray-800)
- Big buttons for touch/Chromebook (min 44px tap targets)
- Minimal animations (performance)
- High contrast text
- Icons from Lucide React
- Tailwind CSS for styling

---

## File Locations

```
/src/lessons/
├── film-music-project/
│   ├── lesson1-mood/          # NEW - Mood & Expression
│   ├── lesson2/               # Instrumentation & Timbre
│   ├── lesson3/               # Texture & Layering
│   ├── lesson4/               # Form & Structure
│   └── lesson5-capstone/      # NEW LATER - Capstone
└── shared/
    ├── activities/            # Reusable activity components
    ├── components/            # Shared UI components
    └── hooks/                 # Shared React hooks
```

---

## Current Task

**BUILD LESSON 1: Score the Adventure**

1. Create folder structure at `/src/lessons/film-music-project/lesson1-mood/`
2. Create Lesson1config.jsx with stages listed above
3. Create Lesson1.jsx following Lesson2.jsx pattern
4. Create lesson1StorageUtils.js
5. Create summarySlideContent.js
6. Create MoodMatchGameActivity in shared/activities
7. Update ActivityRenderer to handle new activity types
8. Add route for lesson1-mood

Use existing Lesson 2/3/4 files as patterns. Match the code style exactly.