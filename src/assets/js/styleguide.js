/* Style guide page only: icon list + live contrast table */
/* style-guide only: icon list + live contrast table */
(function () {
  var list = document.querySelector('[data-icon-list]');
  var sprite = document.querySelector('svg[data-sprite]');
  function fillIcons(names) {
    names.forEach(function (n) {
      var li = document.createElement('li');
      li.innerHTML = '<svg class="icon" aria-hidden="true" focusable="false"><use href="' + (sprite ? '#' : '/assets/icons.svg#') + n + '"/></svg><span>' + n + '</span>';
      list.appendChild(li);
    });
  }
  if (sprite) fillIcons([].map.call(sprite.querySelectorAll('symbol'), function (s) { return s.id; }));
  else fetch('/assets/icons.svg').then(function (r) { return r.text(); }).then(function (t) {
    fillIcons((t.match(/<symbol id="([^"]+)"/g) || []).map(function (m) { return m.slice(12, -1); }));
  });

  var probe = document.createElement('span'); probe.style.display = 'none'; document.body.appendChild(probe);
  function rgb(token) { probe.style.color = 'var(' + token + ')'; var m = getComputedStyle(probe).color.match(/[\d.]+/g).map(Number); return m.slice(0, 3); }
  function lum(c) { var a = c.map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]; }
  function hex(c) { return '#' + c.map(function (v) { return ('0' + Math.round(v).toString(16)).slice(-2); }).join('').toUpperCase(); }
  function update() {
    document.querySelectorAll('[data-hex]').forEach(function (el) { el.textContent = hex(rgb(el.dataset.hex)); });
    document.querySelectorAll('[data-contrast] tr').forEach(function (tr) {
      var f = rgb(tr.dataset.fg), b = rgb(tr.dataset.bg);
      var L1 = lum(f), L2 = lum(b), r = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      var c = tr.children;
      c[1].innerHTML = '<span class="sg-sample" style="color: var(' + tr.dataset.fg + '); background: var(' + tr.dataset.bg + ')">Аа 130 €</span>';
      c[2].textContent = r.toFixed(2) + ':1';
      c[3].innerHTML = r >= 7 ? '<span class="sg-pass">AAA</span>' : r >= 4.5 ? '<span class="sg-pass">AA</span>' : '<span class="sg-fail">под AA</span>';
    });
  }
  update();
  new MutationObserver(update).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', update);
})();
