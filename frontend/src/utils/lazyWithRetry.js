/**
 * Wraps React.lazy() with automatic retry on chunk load failure.
 *
 * When a new deploy replaces chunk files, users with cached HTML
 * will try to load old chunks that no longer exist. This wrapper
 * catches that error and reloads the page to get fresh HTML/chunks.
 *
 * Uses sessionStorage to prevent infinite reload loops — if a reload
 * was already attempted for this specific chunk, the error is thrown
 * normally so the ErrorBoundary can handle it.
 */
import React from 'react';

function lazyWithRetry(importFn) {
  return React.lazy(() =>
    importFn().catch((error) => {
      // Only handle chunk/module load failures
      const isChunkError =
        error.message?.includes('Failed to fetch dynamically imported module') ||
        error.message?.includes('Loading chunk') ||
        error.message?.includes('Loading CSS chunk') ||
        error.message?.includes('Unable to preload CSS') ||
        error.message?.includes('is not a valid JavaScript MIME type') ||
        error.name === 'ChunkLoadError';

      if (!isChunkError) {
        throw error;
      }

      // Use a key based on the error message to track reload attempts per chunk
      const storageKey = 'chunk-reload-' + btoa(error.message).slice(0, 32);
      const alreadyReloaded = sessionStorage.getItem(storageKey);

      if (!alreadyReloaded) {
        sessionStorage.setItem(storageKey, '1');
        window.location.reload();
        // Return a never-resolving promise to prevent rendering while reloading
        return new Promise(() => {});
      }

      // Already tried reloading — clear the flag and let ErrorBoundary handle it
      sessionStorage.removeItem(storageKey);
      throw error;
    })
  );
}

export default lazyWithRetry;
