# Chromebook Cursor Bug - Investigation Notes

## Problem Summary
On Chromebook, after selecting from a dropdown in the Loop Library (e.g., "All Moods" → "Heroic"), the cursor disappears when moving to the video playback or timeline area WITHOUT clicking. The cursor only appears after the user clicks in the video/timeline area.

## Environment
- Device: Chromebook (ChromeOS)
- Resolution: 1366x768
- Browser: Chrome on ChromeOS

## Files Involved
- `CursorContext.jsx` - Unified cursor state manager
- `CustomCursor.jsx` - Custom SVG cursor component
- `MusicComposer.jsx` - Main DAW component (has GLOBAL cursor)
- `InteractionOverlay.jsx` - Timeline overlay (has TIMELINE cursor)
- `LoopLibrary.jsx` - Loop library with native `<select>` dropdowns

## Architecture
- Two CustomCursor instances: GLOBAL (no container, shows everywhere) and TIMELINE (has container, shows over timeline)
- CursorContext manages shared state: `isCustomCursorEnabled`, `isDraggingFromLibrary`, `isSelectOpen`
- `effectivelyEnabled = enabled && isCustomCursorEnabled && !isDraggingFromLibrary`
- Custom cursor hidden over LoopLibrary (which uses native cursor)
- `onSelectOpen`/`onSelectClose` callbacks track native dropdown state

## Attempts Made

### 1. Added cursor instance names for debugging
- Added `name` prop to CustomCursor (GLOBAL, TIMELINE)
- Helps distinguish which cursor is showing/hiding in logs

### 2. Fixed effectivelyEnabledRef stale closure
- Changed EFFECT 1 to use `effectivelyEnabled` directly instead of ref
- Added `effectivelyEnabled` to effect dependencies
- **Result**: Still not working

### 3. Cancel pending synthetic mousemove on new dropdown
- Added `pendingSyntheticMousemoveRef` to track timeout
- `onSelectOpen` cancels any pending synthetic mousemove
- Prevents race condition when clicking new dropdown before timeout fires
- **Result**: Still not working

### 4. Use useLayoutEffect instead of useEffect
- Changed EFFECT 2 to `useLayoutEffect` for synchronous execution
- Runs BEFORE browser paint to prevent flicker
- **Result**: Still not working

### 5. Get position from context
- Added `getLastMousePosition()` to CursorContext
- CustomCursor uses context position when re-enabling
- Updates `positionRef` with accurate position
- **Result**: Still not working

### 6. Remove inline visibility styles
- Removed `visibility` and `opacity` from inline styles
- Now only controlled via DOM manipulation
- Prevents React re-renders from resetting visibility
- **Result**: Still not working

### 7. Remove willChange GPU hint
- Removed `willChange: 'transform, visibility, opacity'`
- Can cause GPU issues on Chromebook
- **Result**: Still not working

### 8. Add debug background
- Added red background to cursor element
- User saw cursor AND red box on page load
- After dropdown scenario, BOTH cursor and red box disappear
- Confirms entire element becomes invisible, not just SVG
- **Result**: Diagnostic - element IS rendering but becomes invisible

### 9. Use setProperty with !important
- Changed to `style.setProperty('visibility', 'visible', 'important')`
- Also added `display: block !important`
- Added logging of computed styles
- **Result**: Still not working

## Key Observations from Logs

1. **Logs show "SHOWING cursor" with correct computed styles**:
   ```
   computedVisibility: "visible"
   computedOpacity: "1"
   computedDisplay: "block"
   inDOM: true
   ```

2. **The code IS executing correctly** - visibility is being set to visible

3. **Red debug box also disappears** - confirms it's not an SVG rendering issue

4. **Cursor appears after clicking** - some event on click triggers visibility

5. **"Throttling navigation" warning appears** - excessive logging may impact performance

## Unsolved Mystery
The logs confirm:
- Element exists in DOM (`inDOM: true`)
- Computed styles are correct (`visibility: visible`, `opacity: 1`)
- Code is executing (`SHOWING cursor` logged repeatedly)

Yet the user cannot see the cursor visually until they click.

## Possible Next Steps to Try
1. Check if there's a parent element with `overflow: hidden` clipping the cursor
2. Check if transform is positioning cursor off-screen (coordinates look valid though)
3. Try using `display: none`/`display: block` instead of visibility
4. Check if there's a Chromebook-specific compositor/GPU issue
5. Try canvas-based cursor instead of DOM element
6. Consider falling back to native cursor on Chromebook (accept the flicker)
7. Check if clicking triggers some focus/blur event we're missing
8. Investigate if the Portal is being affected by something

## Code Location
- Main cursor logic: `src/pages/projects/film-music-score/timeline/components/CustomCursor.jsx`
- Context: `src/pages/projects/film-music-score/shared/CursorContext.jsx`

## Date
January 2026
