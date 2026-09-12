/* ZIVOZONE V1086 — minimal runtime bootstrap */
(() => {
  'use strict';
  const releaseLoader = () => {
    const el = document.getElementById('app-loader');
    if (el) { el.classList.add('zivo-loader-released', 'hidden'); }
  };
  window.addEventListener('error', (event) => {
    console.error('ZIVOZONE runtime error:', event.error || event.message);
    releaseLoader();
  }, { once: true });
  window.addEventListener('unhandledrejection', (event) => {
    console.error('ZIVOZONE promise error:', event.reason);
    releaseLoader();
  }, { once: true });
  window.addEventListener('load', releaseLoader, { once: true });
  setTimeout(releaseLoader, 3500);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', {scope:'/'}).catch(err => console.warn('ZIVOZONE SW:', err));
    }, { once: true });
  }
})();
