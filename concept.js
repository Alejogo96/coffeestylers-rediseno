(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var T = function (x) { return window.csT ? window.csT(x) : x; };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  // dark first (the user can still switch)
  try { if (!localStorage.getItem('cs-theme')) { document.documentElement.setAttribute('data-theme', 'dark'); $$('.inv').forEach(function (b) { b.setAttribute('aria-checked', 'true'); }); } } catch (e) {}
  // horizontal day journey, driven by scroll
  var sec = $('#day'), track = $('#track'), cur = 0, clock = $('#clock'), prog = $('#prog');
  var TIMES = ['07:00', '12:00', '17:00', '20:00'];
  function dayFrame() {
    if (!sec || reduce || window.innerWidth < 900) { if (track) track.style.transform = ''; return; }
    var r = sec.getBoundingClientRect(), vh = window.innerHeight, p = clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
    var ease = p; cur += (ease - cur) * 0.15; if (Math.abs(ease - cur) < 0.0005) cur = ease;
    track.style.transform = 'translate3d(' + (-cur * 300) + 'vw,0,0)';
    var stops = track.children, spin = $('#orb .dash');
    for (var i = 0; i < stops.length; i++) { var d = cur * 3 - i, im = $('.sph i', stops[i]), gh = $('.ghost', stops[i]), tx = $('.stx', stops[i]);
      if (im) im.style.transform = 'translate3d(' + (d * -90).toFixed(1) + 'px,0,0) scale(1.04)';
      if (gh) gh.style.transform = 'translate3d(' + (d * -420).toFixed(1) + 'px,0,0)';
      if (tx) tx.style.transform = 'translate3d(' + (d * -36).toFixed(1) + 'px,0,0)'; }
    prog.style.width = (cur * 100) + '%'; clock.textContent = TIMES[Math.min(3, Math.round(cur * 3))];
    if (cur !== ease) requestAnimationFrame(dayFrame);
  }
  window.addEventListener('scroll', function () { requestAnimationFrame(dayFrame); }, { passive: true });
  window.addEventListener('resize', dayFrame); dayFrame();
  // slowly rotating dashed ring around the ecosystem diagram
  var dash = $('#orb .dash');
  if (dash && !reduce) window.addEventListener('scroll', function () { dash.style.transform = 'rotate(' + (window.scrollY * 0.08).toFixed(1) + 'deg)'; }, { passive: true });
  // ecosystem: list and diagram highlight each other
  function hi(n) { $$('#elist .ei').forEach(function (e) { e.classList.toggle('on', e.getAttribute('data-n') === n); }); $$('#orb .node').forEach(function (e) { e.classList.toggle('on', e.getAttribute('data-n') === n); }); }
  $$('#elist .ei').forEach(function (e) { e.addEventListener('mouseenter', function () { hi(e.getAttribute('data-n')); }); e.addEventListener('focusin', function () { hi(e.getAttribute('data-n')); }); e.addEventListener('mouseleave', function () { hi(null); }); });
  // count-up numbers
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) {
      if (!e.isIntersecting) return; io.unobserve(e.target);
      var el = e.target, end = parseFloat(el.getAttribute('data-count')), dec = parseInt(el.getAttribute('data-dec') || '0', 10), t0 = null;
      (function step(t) { if (t0 === null) t0 = t; var q = clamp((t - t0) / 1200, 0, 1); el.textContent = (end * (1 - Math.pow(1 - q, 3))).toFixed(dec); if (q < 1) requestAnimationFrame(step); })(performance.now());
    }); }, { threshold: 0.6 });
    $$('[data-count]').forEach(function (el) { el.textContent = '0'; io.observe(el); });
  }
  // brew guides
  var G = {
    v60: [['01', 'Rinse the filter, heat the water', '[temperature]'], ['02', 'Add coffee, bloom', '[g] · [s]'], ['03', 'Pour in slow circles', '[ml] · [min]'], ['04', 'Serve and taste', '']],
    espresso: [['01', 'Dose and distribute', '[g]'], ['02', 'Tamp level', ''], ['03', 'Extract', '[ml] · [s]'], ['04', 'Taste and adjust', '']],
    press: [['01', 'Add coarse coffee and water', '[g] · [ml]'], ['02', 'Wait', '[min]'], ['03', 'Press slowly', ''], ['04', 'Serve at once', '']]
  };
  var cb = 'v60';
  function brew(k) { cb = k; var p = $('#bpanel'); p.innerHTML = ''; G[k].forEach(function (r) { var d = document.createElement('div'); d.className = 'row'; d.innerHTML = '<span class="mono suave">' + r[0] + '</span><b></b><span class="mono"></span>'; d.children[1].textContent = T(r[1]); d.children[2].textContent = T(r[2]); p.appendChild(d); }); }
  $$('.tabs button').forEach(function (b) { b.addEventListener('click', function () { $$('.tabs button').forEach(function (o) { o.setAttribute('aria-selected', o === b ? 'true' : 'false'); }); brew(b.getAttribute('data-b')); }); });
  brew('v60'); document.addEventListener('cs-lang', function () { brew(cb); });
})();
