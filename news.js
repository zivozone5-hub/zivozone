/* ============================================================
   ZIVOZONE V72 — STATIC ARABIC BROADCAST NEWS ENGINE
   - Reads the GitHub Actions generated data/news.json
   - Two independent TV-style rails: Sports + General
   - Arabic-only visible headlines
   - Smooth, speed-calculated continuous motion
   - 24h browser cache + automatic refresh
   - No Firebase Functions / Blaze required for news
============================================================ */
(() => {
  'use strict';

  const DATA_URL = 'data/news.json';
  const CACHE_KEY = 'zivozone_news_v72';
  const CACHE_TTL = 24 * 60 * 60 * 1000;
  const REFRESH_MS = 60 * 60 * 1000;

  const esc = (value) => {
    const d = document.createElement('div');
    d.textContent = String(value ?? '');
    return d.innerHTML;
  };

  const hasArabic = (value) => /[\u0600-\u06FF]/.test(String(value || ''));

  const clean = (value) => String(value || '')
    .replace(/\s+/g, ' ')
    .replace(/^\s*[|•·-]\s*/, '')
    .trim();

  const normalizeItem = (item, group) => {
    if (!item || typeof item !== 'object') return null;
    const headline = clean(item.headline || item.title);
    if (!headline || !hasArabic(headline)) return null;
    return {
      headline,
      source: clean(item.source || (group === 'sports' ? 'أخبار الرياضة' : 'الأخبار')),
      url: clean(item.url || ''),
      published: item.published || ''
    };
  };

  const unique = (items) => {
    const seen = new Set();
    return items.filter((item) => {
      const key = clean(item.headline).toLowerCase()
        .replace(/[^\u0600-\u06FF\w]+/g, '');
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  function readCache() {
    try {
      const value = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      return value && value.data ? value : null;
    } catch (_) {
      return null;
    }
  }

  function writeCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        savedAt: Date.now(),
        data
      }));
    } catch (_) {}
  }

  function setStatus(group, text) {
    const node = document.querySelector(
      group === 'sports' ? '.zivo-sports-rail .zivo-rail-status' : '.zivo-general-rail .zivo-rail-status'
    );
    if (node) node.textContent = text;
  }

  function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('ar-JO', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function itemHTML(item, group) {
    const source = esc(item.source || (group === 'sports' ? 'رياضة' : 'أخبار'));
    const time = formatDate(item.published);
    const content = `
      <span class="zivo-news-dot" aria-hidden="true">◆</span>
      <span class="zivo-news-source">${source}</span>
      <span class="zivo-news-headline">${esc(item.headline)}</span>
      ${time ? `<time class="zivo-news-time">${esc(time)}</time>` : ''}
    `;
    return item.url
      ? `<a class="zivo-news-item" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(item.headline)}">${content}</a>`
      : `<span class="zivo-news-item">${content}</span>`;
  }

  function renderRail(group, items) {
    const rail = document.querySelector(group === 'sports' ? '.zivo-sports-rail' : '.zivo-general-rail');
    const track = document.getElementById(group === 'sports' ? 'z50track' : 'zivoGeneralTrack');
    if (!rail || !track) return;

    const list = unique(items.map(x => normalizeItem(x, group)).filter(Boolean)).slice(0, 30);

    if (!list.length) {
      track.className = 'zivo-rail-track zivo-rail-track-empty';
      track.innerHTML = `<span class="zivo-news-item"><span class="zivo-news-source">ZIVOZONE</span><span class="zivo-news-headline">${group === 'sports' ? 'لا توجد أخبار رياضية عربية متاحة حاليًا' : 'لا توجد أخبار عامة عربية متاحة حاليًا'}</span></span>`;
      return;
    }

    // Two identical sequences create a seamless TV-style loop.
    const html = list.map(x => itemHTML(x, group)).join('');
    track.className = 'zivo-rail-track';
    track.innerHTML = `<div class="zivo-rail-sequence">${html}</div><div class="zivo-rail-sequence" aria-hidden="true">${html}</div>`;

    // Calculate duration from content width so short and long news sets
    // keep a comfortable reading speed instead of a fixed, fast animation.
    requestAnimationFrame(() => {
      const sequence = track.querySelector('.zivo-rail-sequence');
      if (!sequence) return;
      const width = Math.max(320, sequence.scrollWidth);
      const mobile = window.matchMedia('(max-width:700px)').matches;
      const pxPerSecond = mobile ? 30 : 42;
      const duration = Math.max(28, Math.min(150, width / pxPerSecond));
      track.style.setProperty('--zivo-flow-duration', `${duration}s`);
      track.classList.toggle('zivo-short-feed', width < 700);
    });
  }

  function render(data) {
    const sports = Array.isArray(data?.sports) ? data.sports : [];
    const general = Array.isArray(data?.general) ? data.general : [];
    renderRail('sports', sports);
    renderRail('general', general);

    const updated = data?.updatedAt ? formatDate(data.updatedAt) : '';
    document.querySelectorAll('.zivo-rail-status').forEach(node => {
      node.textContent = updated ? `آخر تحديث ${updated}` : 'تحديث تلقائي';
    });

    window.dispatchEvent(new CustomEvent('zivozone:news-updated', {
      detail: { sports, general, updatedAt: data?.updatedAt || null }
    }));
  }

  async function fetchData() {
    const response = await fetch(`${DATA_URL}?v=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) throw new Error(`news.json ${response.status}`);
    const data = await response.json();
    return {
      updatedAt: Number(data.updatedAt) || Date.now(),
      sports: Array.isArray(data.sports) ? data.sports : [],
      general: Array.isArray(data.general) ? data.general : []
    };
  }

  async function load(force = false) {
    const cached = readCache();

    if (!force && cached && Date.now() - Number(cached.savedAt || 0) < CACHE_TTL) {
      render(cached.data);
      setStatus('sports', 'آخر نسخة محفوظة');
      setStatus('general', 'آخر نسخة محفوظة');
      // Validate in the background so the user gets a fresh feed as soon as
      // GitHub Pages has the newest JSON.
      fetchData().then(data => {
        if (JSON.stringify(data) !== JSON.stringify(cached.data)) {
          writeCache(data);
          render(data);
        }
      }).catch(() => {});
      return cached.data;
    }

    try {
      const data = await fetchData();
      if (data.sports.length || data.general.length) {
        writeCache(data);
        render(data);
        return data;
      }
    } catch (error) {
      console.warn('ZIVOZONE news feed:', error);
    }

    if (cached) {
      render(cached.data);
      return cached.data;
    }

    render({ sports: [], general: [], updatedAt: null });
    return null;
  }

  function restartAnimations() {
    const tracks = document.querySelectorAll('.zivo-rail-track');
    tracks.forEach(track => {
      const sequence = track.querySelector('.zivo-rail-sequence');
      if (!sequence) return;
      const width = Math.max(320, sequence.scrollWidth);
      const mobile = window.matchMedia('(max-width:700px)').matches;
      const pxPerSecond = mobile ? 30 : 42;
      const duration = Math.max(28, Math.min(150, width / pxPerSecond));
      track.style.setProperty('--zivo-flow-duration', `${duration}s`);
    });
  }

  // Compatibility helpers retained for existing site integrations.
  window.ZIVOZONE_NEWS = {
    load,
    loadJordan: async () => load(false),
    refresh: () => load(true)
  };
  window.ZIVOZONE_SPORTS_TICKER = {
    load,
    refresh: () => load(true)
  };

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => load(false), 250);
  });

  window.addEventListener('resize', () => {
    clearTimeout(window.__zivoNewsResizeTimer);
    window.__zivoNewsResizeTimer = setTimeout(restartAnimations, 180);
  });

  setInterval(() => load(true),60*60*1000);
})();
