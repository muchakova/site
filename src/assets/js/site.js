/* muchakova.com — progressive enhancement. The site works without this file;
   it adds the theme switch, mobile menu, filters, copy, video and article helpers.
   All visible / announced strings come from data-* attributes in the HTML,
   so the same script serves the BG and EN pages. */
(function () {
  'use strict';
  var root = document.documentElement;

  /* ---------- Transition from the old single-URL bilingual site ----------
     Old links shared one URL for both languages with #bg-N / #en-N anchors: open the matching page.
     The old pages (still copied until migrated) read mm-lang, so remember the reader's language. */
  var lang = root.lang === 'en' ? 'en' : 'bg';
  try { localStorage.setItem('mm-lang', lang); } catch (e) {}
  var oldAnchor = location.hash.match(/^#(bg|en)-\d+$/);
  if (oldAnchor && oldAnchor[1] !== lang) {
    var alt = document.querySelector('link[rel="alternate"][hreflang="' + oldAnchor[1] + '"]');
    if (alt) location.replace(alt.getAttribute('href').replace(/^https?:\/\/[^/]+/, '') + location.hash);
  }

  /* ---------- Theme: system by default, manual override remembered ----------
     Header: <button data-theme-toggle aria-pressed> (pressed = dark).
     Footer: radios name="theme" value="system|light|dark".
     The inline <head> snippet applies the saved choice before first paint. */
  var THEME_KEY = 'mm-theme';
  var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  function savedTheme() { try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; } }
  function isDark() { var t = root.getAttribute('data-theme'); return t ? t === 'dark' : darkQuery.matches; }
  function syncThemeControls() {
    var choice = root.getAttribute('data-theme') || 'system';
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) { b.setAttribute('aria-pressed', String(isDark())); });
    document.querySelectorAll('input[name="theme"]').forEach(function (r) { r.checked = r.value === choice; });
  }
  function setTheme(choice) {
    if (choice === 'light' || choice === 'dark') root.setAttribute('data-theme', choice);
    else root.removeAttribute('data-theme');
    try { if (choice === 'light' || choice === 'dark') localStorage.setItem(THEME_KEY, choice); else localStorage.removeItem(THEME_KEY); } catch (e) {}
    syncThemeControls();
  }
  document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
    b.addEventListener('click', function () { setTheme(isDark() ? 'light' : 'dark'); });
  });
  document.querySelectorAll('input[name="theme"]').forEach(function (r) {
    r.addEventListener('change', function () { if (r.checked) setTheme(r.value); });
  });
  darkQuery.addEventListener('change', syncThemeControls);
  syncThemeControls();

  /* ---------- Mobile menu (WAI-ARIA disclosure) ----------
     <button data-menu-button aria-expanded="false" aria-controls="site-menu"
             data-label-open="Меню" data-label-close="Затвори менюто"> */
  document.querySelectorAll('[data-menu-button]').forEach(function (btn) {
    var menu = document.getElementById(btn.getAttribute('aria-controls'));
    var label = btn.querySelector('[data-menu-label]');
    if (!menu) return;
    function set(open, returnFocus) {
      btn.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? btn.dataset.labelClose : btn.dataset.labelOpen;
      if (open) menu.setAttribute('data-open', ''); else menu.removeAttribute('data-open');
      if (!open && returnFocus) btn.focus();
      // the menu follows the button visually but precedes it in the DOM (desktop order),
      // so move focus into it when it opens
      if (open) { var first = menu.querySelector('a, button'); if (first) first.focus(); }
    }
    btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') set(false, true);
    });
    document.addEventListener('click', function (e) {
      if (btn.getAttribute('aria-expanded') === 'true' && !menu.contains(e.target) && !btn.contains(e.target)) set(false);
    });
    window.matchMedia('(min-width: 861px)').addEventListener('change', function (m) { if (m.matches) set(false); });
  });

  /* ---------- Filters + search ----------
     <div data-filter-scope>
       <div role="group" aria-label="…"><button data-filter="all" aria-pressed="true">…</button>…</div>
       <input data-filter-search type="search">
       <p role="status" data-filter-status data-one="Показана е {n} статия" data-many="Показани са {n} статии" data-none="Няма статии по този филтър"></p>
       <ul data-filter-list><li data-cats="crypto taxes">…</li></ul>
       <div data-filter-empty hidden>…</div>
     </div> */
  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var buttons = scope.querySelectorAll('[data-filter]');
    var search = scope.querySelector('[data-filter-search]');
    var status = scope.querySelector('[data-filter-status]');
    var empty = scope.querySelector('[data-filter-empty]');
    var items = scope.querySelectorAll('[data-filter-list] > [data-cats]');
    var active = 'all';
    var params = new URLSearchParams(location.search);
    if (params.get('cat') && scope.querySelector('[data-filter="' + params.get('cat') + '"]')) active = params.get('cat');
    function apply(announce) {
      var q = search ? search.value.trim().toLowerCase() : '';
      var shown = 0;
      items.forEach(function (it) {
        var okCat = active === 'all' || (' ' + it.dataset.cats + ' ').indexOf(' ' + active + ' ') > -1;
        var okText = !q || it.textContent.toLowerCase().indexOf(q) > -1;
        it.hidden = !(okCat && okText);
        if (!it.hidden) shown++;
      });
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.filter === active)); });
      if (empty) empty.hidden = shown !== 0;
      if (status && announce) {
        var tpl = shown === 0 ? status.dataset.none : (shown === 1 ? status.dataset.one : status.dataset.many);
        status.textContent = (tpl || '').replace('{n}', shown);
      }
    }
    buttons.forEach(function (b) { b.addEventListener('click', function () { active = b.dataset.filter; apply(true); }); });
    if (search) {
      var timer;
      search.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(function () { apply(true); }, 250); });
    }
    apply(false);
  });

  /* ---------- Copy to clipboard ----------
     <button data-copy-target="prompt-1" data-copied="Копирано">…</button>
     <span role="status" data-copy-status></span> (inside the same [data-copy-scope]) */
  document.querySelectorAll('[data-copy-target], [data-copy-url]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var scope = btn.closest('[data-copy-scope]') || document;
      var status = scope.querySelector('[data-copy-status]');
      var text = btn.hasAttribute('data-copy-url') ? location.href : (document.getElementById(btn.dataset.copyTarget) || {}).innerText || '';
      function done(ok) {
        if (!status) return;
        status.textContent = ok ? btn.dataset.copied : btn.dataset.copyFailed || '';
        clearTimeout(btn._t); btn._t = setTimeout(function () { status.textContent = ''; }, 3000);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      else done(false);
    });
  });

  /* ---------- Native share (shown only where the browser supports it) ---------- */
  document.querySelectorAll('[data-share-native]').forEach(function (btn) {
    if (!navigator.share) return;
    btn.hidden = false;
    btn.addEventListener('click', function () { navigator.share({ title: document.title, url: location.href }).catch(function () {}); });
  });

  /* ---------- YouTube lite embed ----------
     <div class="video-card__media"><button data-yt="VIDEO_ID" data-title="…" aria-label="Пусни видео: …">
     Nothing loads from YouTube until the click (privacy + speed). */
  document.querySelectorAll('[data-yt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(btn.dataset.yt) + '?autoplay=1&rel=0';
      frame.title = btn.dataset.title || '';
      frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      frame.allowFullscreen = true;
      btn.parentNode.replaceChild(frame, btn);
      frame.focus();
    });
  });

  /* ---------- Article: reading progress + current TOC entry ---------- */
  var bar = document.querySelector('.reading-progress');
  var article = document.querySelector('[data-article]');
  if (bar && article) {
    var ticking = false;
    function update() {
      var r = article.getBoundingClientRect();
      var total = r.height - window.innerHeight;
      var pct = total > 0 ? Math.min(100, Math.max(0, (-r.top / total) * 100)) : 0;
      bar.style.setProperty('--progress', pct.toFixed(1) + '%');
      ticking = false;
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }
  var tocLinks = document.querySelectorAll('.toc a[href^="#"]');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    tocLinks.forEach(function (a) { byId[decodeURIComponent(a.hash.slice(1))] = byId[decodeURIComponent(a.hash.slice(1))] || []; byId[decodeURIComponent(a.hash.slice(1))].push(a); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        tocLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
        (byId[en.target.id] || []).forEach(function (a) { a.setAttribute('aria-current', 'true'); });
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(byId).forEach(function (id) { var h = document.getElementById(id); if (h) io.observe(h); });
  }
})();
