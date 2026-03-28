/**
 * Safe localStorage wrapper for Chromebooks and restricted environments
 * where localStorage may be disabled by school IT policy or guest/incognito mode.
 * Returns null / no-ops gracefully instead of throwing.
 */

let _available = null;

const isAvailable = () => {
  if (_available !== null) return _available;
  try {
    const key = '__storage_test__';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    _available = true;
  } catch {
    _available = false;
  }
  return _available;
};

const safeStorage = {
  getItem(key) {
    if (!isAvailable()) return null;
    try { return localStorage.getItem(key); } catch { return null; }
  },
  setItem(key, value) {
    if (!isAvailable()) return;
    try { localStorage.setItem(key, value); } catch { /* no-op */ }
  },
  removeItem(key) {
    if (!isAvailable()) return;
    try { localStorage.removeItem(key); } catch { /* no-op */ }
  },
  get length() {
    if (!isAvailable()) return 0;
    try { return localStorage.length; } catch { return 0; }
  },
  key(index) {
    if (!isAvailable()) return null;
    try { return localStorage.key(index); } catch { return null; }
  },
};

export default safeStorage;
