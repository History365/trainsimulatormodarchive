/*
 * Train Simulator Mod Archive - Theme Init
 *
 * Two jobs:
 *   1. Runs synchronously, as early as possible (see the inline snippet
 *      that must be placed in <head>, before custom-dark.css and before
 *      any body content), to set data-theme="dark"/"light" on <html>
 *      from localStorage BEFORE first paint. If the user has never
 *      chosen, it leaves the attribute off entirely so the
 *      prefers-color-scheme rules in custom-dark.css take over and
 *      follow the OS/browser setting automatically.
 *   2. Wires up any .theme-toggle-btn / .mobile-theme-toggle buttons on
 *      the page once the DOM is ready, and keeps them in sync if the OS
 *      theme changes while the user hasn't made an explicit choice.
 *
 * Usage: the tiny synchronous part (window.__setInitialTheme) should be
 * inlined directly in <head>, e.g.:
 *
 *   <script>
 *     (function () {
 *       var saved = localStorage.getItem('tsma-theme');
 *       if (saved === 'light' || saved === 'dark') {
 *         document.documentElement.setAttribute('data-theme', saved);
 *       }
 *     })();
 *   </script>
 *
 * This file itself can be loaded normally (e.g. alongside main.js, near
 * the end of <body>) - it only handles the toggle button wiring, which
 * doesn't need to run before paint.
 */

(function () {
  var STORAGE_KEY = 'tsma-theme';

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStoredTheme(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      /* localStorage unavailable (private browsing, etc.) - the toggle
         still works for the current page load, it just won't persist. */
    }
  }

  function currentEffectiveTheme() {
    var explicit = document.documentElement.getAttribute('data-theme');
    if (explicit === 'light' || explicit === 'dark') return explicit;
    var prefersLight = window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches;
    return prefersLight ? 'light' : 'dark';
  }

  function applyTheme(theme, persist) {
    document.documentElement.setAttribute('data-theme', theme);
    if (persist) setStoredTheme(theme);
  }

  function toggleTheme() {
    var next = currentEffectiveTheme() === 'light' ? 'dark' : 'light';
    applyTheme(next, true);
  }

  function wireButtons() {
    var buttons = document.querySelectorAll('.theme-toggle-btn, .mobile-theme-toggle');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', toggleTheme);
    });
  }

  // If the user hasn't made an explicit choice, keep the toggle icon (and
  // the rest of the page) in sync if they change their OS theme while
  // this tab is open.
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function () {
      if (!getStoredTheme()) {
        // No explicit choice stored - let the CSS media query keep
        // driving colors; nothing to do here except make sure we didn't
        // leave a stale data-theme attribute behind.
        document.documentElement.removeAttribute('data-theme');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireButtons);
  } else {
    wireButtons();
  }
})();
