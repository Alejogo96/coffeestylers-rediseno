/* Philosophy tunnel: one tall pinned scene driven by scroll.
   Phase 1: a camera flies through a field of 3D word-cubes.  Phase 2: hairline grid draws in and a photo opens from the centre.
   Phase 3: the photo fills the screen.  Three text blocks reveal word by word (translate 20px + rotate 3deg), as on santalarch.com. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
  var T = function (x) { return window.csT ? window.csT(x) : x; };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WORDS = ['Source', 'Roast', 'Rest', 'Grind', 'Pour', 'Taste', 'Share', 'Run', 'Slow', 'Sweet', 'Warm', 'Bogotá'];
  var secs = $$('.tunnel'); if (!secs.length) return;

  function rnd(seed) { var s = seed; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function split(el, en, tag) {
    el.innerHTML = ''; var ws = en.split(' ');
    ws.forEach(function (w) { var s = document.createElement('span'); s.className = 'tn-w'; s.textContent = T(w) === w ? w : w; s.setAttribute('aria-hidden', 'true'); el.appendChild(s); });
    el.setAttribute('aria-label', T(en));
    // translate the sentence as a whole, then split the translated words
    var tr = T(en).split(' '); el.innerHTML = '';
    tr.forEach(function (w) { var s = document.createElement('span'); s.className = 'tn-w'; s.textContent = w; s.setAttribute('aria-hidden', 'true'); el.appendChild(s); });
    return $$('.tn-w', el);
  }

  secs.forEach(function (sec) {
    var stage = $('.tn-stage', sec), world = $('.tn-world', sec), media = $('.tn-media', sec), mimg = $('.tn-media i', sec);
    var vls = $$('.tn-vl', sec), hls = $$('.tn-hl', sec), blocks = $$('.tn-block', sec), bar = $('.tn-bar i', sec), cnt = $('.tn-count', sec), eyebrow = $('.tn-eyebrow', sec);
    if (reduce) { sec.classList.add('tn-static'); }
    var cubes = [], N = 0, STEP = 0, ZMAX = 0, cur = 0;

    function buildCubes() {
      world.innerHTML = ''; cubes = [];
      var vw = innerWidth, vh = innerHeight, small = vw < 700; N = small ? 16 : 28; STEP = small ? 230 : 280; ZMAX = (N - 1) * STEP + 650;
      var r = rnd(7);
      for (var i = 0; i < N; i++) {
        var S = Math.round((small ? 110 : 150) + r() * (small ? 90 : 160)), side = r() < 0.5 ? -1 : 1;
        var x = side * (vw * (small ? 0.12 : 0.16) + r() * vw * (small ? 0.4 : 0.55)), y = (r() - 0.5) * vh * 1.3;
        if (Math.abs(x) < vw * 0.2 && Math.abs(y) < vh * 0.22) y += (y < 0 ? -1 : 1) * vh * 0.3;
        var z = -i * STEP, c = document.createElement('div'); c.className = 'tn-cube';
        c.style.width = c.style.height = S + 'px'; c.style.marginLeft = c.style.marginTop = (-S / 2) + 'px';
        var T3 = ['translateZ(' + S / 2 + 'px)', 'rotateY(180deg) translateZ(' + S / 2 + 'px)', 'rotateY(90deg) translateZ(' + S / 2 + 'px)', 'rotateY(-90deg) translateZ(' + S / 2 + 'px)', 'rotateX(90deg) translateZ(' + S / 2 + 'px)', 'rotateX(-90deg) translateZ(' + S / 2 + 'px)'];
        for (var f = 0; f < 6; f++) { var fe = document.createElement('div'); fe.className = 'tn-f'; fe.style.transform = T3[f]; if (f < 4 && ((i + f) % 2 === 0)) fe.textContent = T(WORDS[(i * 3 + f) % WORDS.length]); c.appendChild(fe); }
        c.__p = { x: x, y: y, z: z, a: r() * 60 - 30, b: r() * 90, ka: (r() - 0.5) * 260, kb: (r() - 0.5) * 360 };
        world.appendChild(c); cubes.push(c);
      }
    }
    function buildText() {
      blocks.forEach(function (b) {
        var t = $('.tn-title', b), d = $('.tn-desc', b);
        b.__w = split(t, t.getAttribute('data-en')).concat(split(d, d.getAttribute('data-en')));
        b.__nt = $$('.tn-w', t).length;
      });
      if (eyebrow) eyebrow.textContent = T(eyebrow.getAttribute('data-en'));
    }
    buildCubes(); buildText();
    document.addEventListener('cs-lang', function () { buildCubes(); buildText(); });
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(buildCubes, 150); });
    if (reduce) { blocks.forEach(function (b) { b.__w.forEach(function (w) { w.style.opacity = 1; }); }); return; }

    var RANGES = [[0.03, 0.34], [0.42, 0.68], [0.74, 0.99]], raf = 0;
    function frame() {
      raf = 0;
      var r = sec.getBoundingClientRect(), vh = innerHeight, tot = Math.max(1, r.height - vh), p = clamp(-r.top / tot, 0, 1);
      cur += (p - cur) * 0.12; if (Math.abs(p - cur) < 0.0004) cur = p;
      if (r.bottom < -50 || r.top > vh + 50) { if (cur !== p) raf = requestAnimationFrame(frame); return; }
      // phase 1: camera flies through the cubes
      var q1 = clamp(cur / 0.46, 0, 1), cam = q1 * ZMAX;
      world.style.transform = 'translate3d(0,0,' + cam.toFixed(1) + 'px)';
      world.style.opacity = (1 - clamp((cur - 0.36) / 0.14, 0, 1)).toFixed(3);
      for (var i = 0; i < cubes.length; i++) {
        var c = cubes[i], pr = c.__p;
        c.style.transform = 'translate3d(' + pr.x.toFixed(0) + 'px,' + pr.y.toFixed(0) + 'px,' + pr.z.toFixed(0) + 'px) rotateX(' + (pr.a + q1 * pr.ka).toFixed(1) + 'deg) rotateY(' + (pr.b + q1 * pr.kb).toFixed(1) + 'deg)';
      }
      // phase 2: hairline grid draws in, photo opens from the centre
      var g = clamp((cur - 0.3) / 0.2, 0, 1);
      vls.forEach(function (l, k) { l.style.transform = 'scaleY(' + clamp(g * 1.4 - k * 0.07, 0, 1).toFixed(3) + ')'; });
      hls.forEach(function (l, k) { l.style.transform = 'scaleX(' + clamp(g * 1.4 - k * 0.1, 0, 1).toFixed(3) + ')'; });
      var m = ease(clamp((cur - 0.44) / 0.3, 0, 1)), ins = (1 - m) * 40;
      media.style.clipPath = 'inset(' + ins.toFixed(2) + '% ' + (ins * 0.75).toFixed(2) + '%)';
      media.style.opacity = clamp((cur - 0.42) / 0.04, 0, 1);
      mimg.style.transform = 'scale(' + (1.35 - 0.35 * m).toFixed(3) + ') translate3d(0,' + ((cur - 0.7) * -90).toFixed(1) + 'px,0)';
      // text blocks: per-word reveal
      var active = 0;
      blocks.forEach(function (b, k) {
        var rg = RANGES[k], t = clamp((cur - rg[0]) / (rg[1] - rg[0]), 0, 1), out = 1 - clamp((t - 0.82) / 0.18, 0, 1), ws = b.__w, n = ws.length;
        if (t > 0 && t < 1) active = k;
        b.style.visibility = (t > 0 && out > 0) ? 'visible' : 'hidden';
        for (var j = 0; j < n; j++) {
          var s = 0.04 + 0.4 * (j / n), w = clamp((t - s) / 0.1, 0, 1) * out, e = ease(w), el = ws[j];
          el.style.opacity = w.toFixed(3);
          el.style.transform = 'translate3d(0,' + ((1 - e) * 20 + (1 - out) * -14).toFixed(1) + 'px,0) rotate(' + ((1 - e) * 3).toFixed(2) + 'deg)';
        }
      });
      if (cnt) cnt.textContent = '0' + (active + 1) + ' / 03';
      if (bar) bar.style.width = (cur * 100).toFixed(2) + '%';
      if (cur !== p) raf = requestAnimationFrame(frame);
    }
    function onScroll() { if (!raf) raf = requestAnimationFrame(frame); }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    frame();
  });
})();
