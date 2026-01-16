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

---

## Research Findings (January 2026)

### Most Promising Solution: Force Browser Repaint

Based on web research, this appears to be a **Chrome repaint/compositor bug** where the element exists in the DOM with correct styles but the browser doesn't visually render it. This is a known issue in Chrome.

**Solution to try - Force repaint by reading offsetHeight:**
```javascript
// After setting visibility to visible, force a repaint:
cursorElementRef.current.style.display = 'none';
cursorElementRef.current.offsetHeight; // Force reflow
cursorElementRef.current.style.display = 'block';
```

Source: [React Discuss - Repaint bug: markup exists but not being shown](https://discuss.reactjs.org/t/repaint-bug-markup-exists-but-not-being-shown/558)

### Alternative: GPU Layer Promotion
Add CSS transform to force hardware acceleration:
```css
-webkit-transform: translateZ(0);
/* or */
-webkit-transform: translate3d(0,0,0);
```

Source: [Postman Blog - UI Repaint Issue on Chrome](https://blog.postman.com/ui-repaint-issue-on-chrome/)

### Why Clicking Fixes It
The click event likely triggers a focus change which forces Chrome to repaint. The blur event from the native `<select>` dropdown may put Chrome's compositor in a bad state where it doesn't repaint fixed-position Portal elements.

Source: [Chrome DevTools - Emulate a focused page](https://medium.com/@utrycy/debug-the-dom-node-that-disappears-when-the-focus-changes-with-chrome-627723d3a197)

### Debugging Tools
1. **chrome://gpu** - Check if hardware acceleration is working
2. **DevTools > Rendering > Show composited layer borders** - See which elements are GPU layers
3. **DevTools > Performance** - Look for forced reflows
4. **"Emulate a focused page"** in DevTools to prevent blur-related issues

Source: [Chrome GPU Compositing Documentation](https://www.chromium.org/developers/design-documents/gpu-accelerated-compositing-in-chrome/)

---

## Recommended Fix Implementation

### Option 1: Force Repaint in showCursor()
```javascript
const showCursor = () => {
  if (cursorElementRef.current) {
    // Force repaint trick for Chrome
    cursorElementRef.current.style.display = 'none';
    void cursorElementRef.current.offsetHeight; // Force reflow
    cursorElementRef.current.style.display = 'block';

    cursorElementRef.current.style.setProperty('visibility', 'visible', 'important');
    cursorElementRef.current.style.setProperty('opacity', '1', 'important');
    // ... rest of positioning code
  }
};
```

### Option 2: Trigger Repaint After Dropdown Close
In `onSelectClose` callback, after re-enabling cursor:
```javascript
// Force repaint on all cursor elements
document.querySelectorAll('.custom-cursor-container').forEach(el => {
  el.style.display = 'none';
  void el.offsetHeight;
  el.style.display = 'block';
});
```

### Option 3: Use requestAnimationFrame Chain
```javascript
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    // Force repaint here
    cursorElementRef.current.style.transform = 'translateZ(0)';
  });
});
```

---

## Code Location
- Main cursor logic: `src/pages/projects/film-music-score/timeline/components/CustomCursor.jsx`
- Context: `src/pages/projects/film-music-score/shared/CursorContext.jsx`

## Date
January 2026

## References
- [React Discuss - Repaint bug](https://discuss.reactjs.org/t/repaint-bug-markup-exists-but-not-being-shown/558)
- [Chrome GPU Compositing](https://www.chromium.org/developers/design-documents/gpu-accelerated-compositing-in-chrome/)
- [Force Reflow List](https://gist.github.com/paulirish/5d52fb081b3570c81e3a)
- [Chrome DevTools Forced Reflow](https://developer.chrome.com/docs/performance/insights/forced-reflow)
- [Postman UI Repaint Issue](https://blog.postman.com/ui-repaint-issue-on-chrome/)
