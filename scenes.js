/* Site-wide scroll system, same grammar as the philosophy tunnel:
   1) headings reveal word by word (20px rise + 3deg tilt), scrubbed by scroll
   2) photo and dark bands open from an inset frame to full bleed
   3) hairlines draw in at the top of every section
   4) a fixed chapter counter follows you down the page
   5) .scene: a pinned stage that walks through N steps (counter, ghost numeral, drifting grid, word reveal) */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
  var T = function (x) { return window.csT ? window.csT(x) : x; };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  function words(el, en, cls) {
    var tr = T(en).split(' '); el.innerHTML = ''; var out = [];
    tr.forEach(function (w, i) {
      var s = document.createElement('span'); s.className = cls; s.textContent = w; s.setAttribute('aria-hidden', 'true'); el.appendChild(s); out.push(s);
      if (i < tr.length - 1) el.appendChild(document.createTextNode(' '));
    });
    el.setAttribute('aria-label', T(en)); return out;
  }
  function wordStyle(ws, p, out) {
    var n = ws.length;
    for (var j = 0; j < n; j++) {
      var w = clamp((p - 0.7 * (j / n)) / 0.3, 0, 1) * (out === undefined ? 1 : out), e = ease(w), el = ws[j];
      el.style.opacity = w.toFixed(3);
      el.style.transform = 'translate3d(0,' + ((1 - e) * 20).toFixed(1) + 'px,0) rotate(' + ((1 - e) * 3).toFixed(2) + 'deg)';
    }
  }

  /* ---- 1. headings ---- */
  var heads = reduce ? [] : $$('[data-sw]').filter(function (el) { return !el.closest('.tunnel,.scene'); });
  /* ---- 2. opening bands ---- */
  var opens = reduce ? [] : $$('.club,.bandB,.bandC,.pg-photo,.endcta,.pg-cta,.whole');
  /* ---- 3. draw-in hairlines ---- */
  var secs = $$('main > section').filter(function (s) { return !s.matches('.tunnel,.scene,.day,.jh,.bh,.pg-hero,.flow,.pg-more'); });
  var lines = secs.map(function (s) { var i = document.createElement('i'); i.className = 'dl'; i.setAttribute('aria-hidden', 'true'); s.appendChild(i); return { s: s, i: i }; });
  /* ---- 4. chapter counter ---- */
  var chap = $$('main > section').filter(function (s) { return !s.matches('.pg-more'); }), hud = document.createElement('div');
  hud.className = 'chap-hud mono'; hud.setAttribute('aria-hidden', 'true'); document.body.appendChild(hud);
  function label(s) {
    var e = s.querySelector('.eyebrow'), h = s.querySelector('h1,h2'), a = s.getAttribute('aria-label');
    var t = (e && e.textContent) || a || (h && (h.getAttribute('aria-label') || h.textContent)) || '';
    return t.trim().slice(0, 40);
  }
  var lastHud = '';
  /* ---- 5. scenes ---- */
  var scenes = $$('.scene').map(function (sec) {
    var bl = $$('.tn-block', sec);
    return { sec: sec, bl: bl, vls: $$('.tn-vl', sec), hls: $$('.tn-hl', sec), gh: $('.sc-ghost', sec), cnt: $('.sc-count', sec), bar: $('.tn-bar i', sec), cur: 0 };
  });
  function build() {
    heads.forEach(function (el) { el.__w = words(el, el.getAttribute('data-sw-en') || el.getAttribute('data-en'), 'sw-w'); });
    scenes.forEach(function (S) {
      S.bl.forEach(function (b) {
        var t = $('.tn-title', b), d = $('.tn-desc', b), c = $('.sc-cta', b);
        b.__w = words(t, t.getAttribute('data-en'), 'tn-w').concat(words(d, d.getAttribute('data-en'), 'tn-w'));
        if (c) c.textContent = T(c.getAttribute('data-en'));
      });
      var e = $('.sc-eyebrow', S.sec), h = $('.sc-h', S.sec); if (e) e.textContent = T(e.getAttribute('data-en')); if (h) h.textContent = T(h.getAttribute('data-en'));
    });
  }
  if (reduce) { scenes.forEach(function (S) { S.sec.classList.add('tn-static'); }); }
  build(); document.addEventListener('cs-lang', function () { build(); frame(); });
  if (reduce) { hud.style.display = 'none'; scenes.forEach(function (S) { S.bl.forEach(function (b) { b.__w.forEach(function (w) { w.style.opacity = 1; }); }); }); }

  var raf = 0, vh = innerHeight;
  function frame() {
    raf = 0; vh = innerHeight;
    heads.forEach(function (el) {
      var r = el.getBoundingClientRect(); if (!el.__w) return;
      var p = r.bottom < 0 ? 1 : clamp((vh * 0.94 - r.top) / (vh * 0.42), 0, 1);
      if (el.__p === p) return; el.__p = p; wordStyle(el.__w, p);
    });
    opens.forEach(function (el) {
      var r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh + 50) return;
      var q = ease(clamp((vh - r.top) / (vh * 0.75), 0, 1));
      el.style.clipPath = q >= 1 ? 'none' : 'inset(' + ((1 - q) * 12).toFixed(2) + '% ' + ((1 - q) * 8).toFixed(2) + '%)';
    });
    lines.forEach(function (L) {
      var r = L.s.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
      L.i.style.transform = 'scaleX(' + clamp((vh * 0.95 - r.top) / (vh * 0.4), 0, 1).toFixed(3) + ')';
    });
    var idx = 0; chap.forEach(function (s, k) { if (s.getBoundingClientRect().top < vh * 0.5) idx = k; });
    var txt = pad(idx + 1) + ' / ' + pad(chap.length) + ' · ' + label(chap[idx]);
    if (txt !== lastHud) { hud.textContent = txt; lastHud = txt; }
    hud.style.opacity = chap[idx].matches('.scene,.tunnel') ? 0 : 1;
    scenes.forEach(function (S) {
      var r = S.sec.getBoundingClientRect(); if (r.bottom < -50 || r.top > vh + 50 || S.sec.classList.contains('tn-static')) return;
      var tot = Math.max(1, r.height - vh), p = clamp(-r.top / tot, 0, 1), n = S.bl.length; S.cur += (p - S.cur) * 0.14; if (Math.abs(p - S.cur) < 0.0005) S.cur = p;
      var c = S.cur, g = clamp(c / 0.1, 0, 1), act = Math.min(n - 1, Math.floor(c * n));
      S.vls.forEach(function (l, k) { l.style.transform = 'translate3d(' + ((c - 0.5) * (k % 2 ? 60 : -60)).toFixed(1) + 'px,0,0) scaleY(' + clamp(g * 1.4 - k * 0.07, 0, 1).toFixed(3) + ')'; });
      S.hls.forEach(function (l, k) { l.style.transform = 'scaleX(' + clamp(g * 1.4 - k * 0.1, 0, 1).toFixed(3) + ')'; });
      S.bl.forEach(function (b, k) {
        var t = clamp(c * n - k, 0, 1), last = k === n - 1, out = last ? 1 : 1 - clamp((t - 0.82) / 0.18, 0, 1), on = c * n >= k - 0.001 && (c * n < k + 1 || last);
        b.style.visibility = on && out > 0 ? 'visible' : 'hidden';
        var ws = b.__w, m = ws.length;
        for (var j = 0; j < m; j++) {
          var w = clamp((t - 0.04 - 0.4 * (j / m)) / 0.1, 0, 1) * out, e = ease(w);
          ws[j].style.opacity = w.toFixed(3);
          ws[j].style.transform = 'translate3d(0,' + ((1 - e) * 20 + (1 - out) * -14).toFixed(1) + 'px,0) rotate(' + ((1 - e) * 3).toFixed(2) + 'deg)';
        }
        var cta = $('.sc-cta', b); if (cta) { cta.style.opacity = clamp((t - 0.5) / 0.15, 0, 1) * out; cta.style.pointerEvents = (on && out > 0.6 && t > 0.5) ? 'auto' : 'none'; }
      });
      if (S.gh) { var t2 = clamp(c * n - act, 0, 1); S.gh.textContent = pad(act + 1); S.gh.style.transform = 'translate3d(' + ((0.5 - t2) * 240).toFixed(1) + 'px,0,0)'; }
      if (S.cnt) S.cnt.textContent = pad(act + 1) + ' / ' + pad(n);
      if (S.bar) S.bar.style.width = (c * 100).toFixed(2) + '%';
      if (S.cur !== p) raf = requestAnimationFrame(frame);
    });
  }
  function on() { if (!raf) raf = requestAnimationFrame(frame); }
  window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on); frame();
  setTimeout(frame, 400);
})();
