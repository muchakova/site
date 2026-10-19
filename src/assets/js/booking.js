/* Booking page: the Cal.com calendar loads only after a format is chosen
   (no third-party requests while someone is just reading), one inline embed per
   format, in the site's colours and current theme. ?format=30|60 preselects one. */
(function () {
  'use strict';
  var root = document.querySelector('[data-booking]');
  if (!root) return;
  var ORIGIN = root.dataset.calOrigin;
  var SCRIPT = 'https://app.cal.com/embed/embed.js';
  var status = root.querySelector('[data-cal-status]');
  var hint = root.querySelector('[data-cal-hint]');
  var fallback = root.querySelector('[data-cal-fallback]');
  var started = {};
  var booked = {};

  // visitor statistics (Plausible, no cookies): which format people pick and how many bookings are completed
  function track(name, props) { if (window.plausible) window.plausible(name, { props: props }); }

  // Cal.com's official loader (queues calls until embed.js arrives)
  function loader() {
    if (window.Cal) return;
    (function (C, A, L) { var p = function (a, ar) { a.q.push(ar); }; var d = C.document; C.Cal = C.Cal || function () { var cal = C.Cal; var ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; var s = d.createElement('script'); s.src = A; s.onerror = fail; d.head.appendChild(s); cal.loaded = true; } if (ar[0] === L) { var api = function () { p(api, arguments); }; var namespace = ar[1]; api.q = api.q || []; if (typeof namespace === 'string') { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ['initNamespace', namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, SCRIPT, 'init');
  }

  function theme() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t === 'light' || t === 'dark') return t;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function fail() {
    fallback.hidden = false;
    root.querySelectorAll('[data-cal-panel]').forEach(function (p) { p.hidden = true; });
  }

  function watch(fmt, panel) {
    var waited = 0;
    var timer = setInterval(function () {
      var frame = panel.querySelector('iframe');
      waited += 500;
      if (frame) {
        clearInterval(timer);
        frame.title = panel.dataset.calTitle;
        var placeholder = panel.querySelector('.embed-slot__status');
        if (placeholder) placeholder.remove();
        status.textContent = status.dataset.loaded;
      } else if (waited >= 15000) {
        clearInterval(timer);
        fail();
      }
    }, 500);
  }

  function show(fmt) {
    hint.hidden = true;
    fallback.hidden = true;
    root.querySelectorAll('[data-cal-panel]').forEach(function (p) { p.hidden = p.dataset.calPanel !== fmt; });
    if (started[fmt]) return;
    started[fmt] = true;
    track('Booking format', { format: fmt });
    var panel = document.getElementById('cal-' + fmt);
    status.textContent = status.dataset.loading;
    loader();
    var ns = 'f' + fmt;
    // read data-cal-30 / data-cal-60 with getAttribute: dataset does not camelCase a dash before a digit
    window.Cal('init', ns, { origin: ORIGIN });
    window.Cal.ns[ns]('inline', { elementOrSelector: '#cal-' + fmt, calLink: root.getAttribute('data-cal-' + fmt), config: { layout: 'month_view', theme: theme() } });
    window.Cal.ns[ns]('ui', {
      theme: theme(),
      cssVarsPerTheme: { light: { 'cal-brand': '#4338CA' }, dark: { 'cal-brand': '#A5B4FC' } },
      hideEventTypeDetails: false,
      layout: 'month_view'
    });
    // Cal.com reports a completed booking (older and newer names of the event)
    ['bookingSuccessful', 'bookingSuccessfulV2'].forEach(function (action) {
      window.Cal.ns[ns]('on', { action: action, callback: function () {
        if (booked[fmt]) return;
        booked[fmt] = true;
        track('Booking completed', { format: fmt });
      } });
    });
    watch(fmt, panel);
  }

  root.querySelectorAll('input[name="format"]').forEach(function (r) {
    r.addEventListener('change', function () { if (r.checked) show(r.value); });
  });

  var wanted = new URLSearchParams(location.search).get('format');
  var pre = wanted && root.querySelector('input[name="format"][value="' + wanted + '"]');
  if (pre) { pre.checked = true; show(wanted); }
})();
