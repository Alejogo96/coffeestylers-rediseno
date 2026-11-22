// Coffeestylers prototype: interactions, storytelling and motion. No dependencies.
(function () {
  var doc = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var store = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };

  // ---------- theme (invert colour, like the reference) ----------
  var mq = window.matchMedia && matchMedia('(prefers-color-scheme: dark)');
  function stored() { try { return localStorage.getItem('cs-theme'); } catch (e) { return null; } }
  function setTheme(dark) {
    if (dark) doc.setAttribute('data-theme', 'dark'); else doc.removeAttribute('data-theme');
    $$('.inv').forEach(function (b) { b.setAttribute('aria-pressed', dark ? 'true' : 'false'); b.setAttribute('aria-checked', dark ? 'true' : 'false'); });
  }
  setTheme(stored() ? stored() === 'dark' : !!(mq && mq.matches));
  if (mq && mq.addEventListener) mq.addEventListener('change', function (e) { if (!stored()) setTheme(e.matches); });
  $$('.inv').forEach(function (b) {
    b.addEventListener('click', function () {
      var dark = doc.getAttribute('data-theme') !== 'dark';
      setTheme(dark);
      try { localStorage.setItem('cs-theme', dark ? 'dark' : 'light'); } catch (e) {}
    });
  });

  // ---------- intro loader (home only, once per session) ----------
  var loader = $('.loader');
  function reveal() { doc.classList.add('ready'); $$('.gran').forEach(function (g) { g.classList.add('in'); }); }
  if (loader && !reduce && !store.get('cs-intro')) {
    store.set('cs-intro', '1');
    document.body.style.overflow = 'hidden';
    var lp = $('#lpath'), ld = $('#ldot'), lc = $('#lcount'), len = lp ? lp.getTotalLength() : 1, t0 = null, DUR = 1800;
    if (lp) { lp.style.strokeDasharray = len; lp.style.strokeDashoffset = len; }
    var finish = function () {
      loader.classList.add('out'); reveal();
      setTimeout(function () { loader.classList.add('gone'); document.body.style.overflow = ''; }, 950);
    };
    var tick = function (t) {
      if (t0 === null) t0 = t;
      var q = Math.min(1, (t - t0) / DUR), e = 1 - Math.pow(1 - q, 2.2);
      if (lc) lc.textContent = Math.round(e * 100);
      if (lp) { lp.style.strokeDashoffset = len * (1 - e); var pt = lp.getPointAtLength(len * e); ld.setAttribute('cx', pt.x); ld.setAttribute('cy', pt.y); }
      if (q < 1) requestAnimationFrame(tick); else setTimeout(finish, 150);
    };
    requestAnimationFrame(tick);
  } else {
    if (loader) loader.classList.add('gone');
    setTimeout(reveal, 60);
  }

  // ---------- reveal on scroll ----------
  var rv = $$('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }

  // ---------- scroll-lit statement: split into words ----------
  window.csLit = function (el, text) {
    var words = text.trim().split(/\s+/);
    el.setAttribute('aria-label', text.trim());
    el.innerHTML = '';
    words.forEach(function (w, i) {
      var s = document.createElement('span'); s.className = 'w'; s.setAttribute('aria-hidden', 'true'); s.textContent = w;
      el.appendChild(s); if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  };
  var T = function (x) { return window.csT ? window.csT(x) : x; };
  $$('[data-lit]').forEach(function (el) { el.__en = el.textContent.trim(); window.csLit(el, el.__en); });

  // ---------- scroll engine: ONE smoothed scroll value drives every effect (consistent timing) ----------
  var lits = $$('.lit'), pins = $$('.pin'), pars = $$('[data-par]'), lifts = $$('[data-lift]').filter(function (el) { return !el.closest('#grilla'); }), drifts = $$('[data-px]'), sys = $$('[data-sy]'), clips = $$('[data-clip]'), hdr = $('.hdr');
  var cur = window.scrollY, lastY = cur, raf = 0;
  var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
  function R(el) { var r = el.getBoundingClientRect(), d = window.scrollY - cur; return { top: r.top + d, bottom: r.bottom + d, height: r.height }; }
  // route line: fitted to real pixels so dashes, dots and the marker always agree
  var PTS = [[0,40],[120,40,120,14,250,14],[380,46,500,30],[640,6,750,22],[900,44,1000,20]];
  function routeFit(rt) {
    var w = rt.clientWidth, h = rt.clientHeight, sx = w / 1000, sy = h / 60, f = function (n, i) { return (n * (i % 2 ? sy : sx)).toFixed(1); };
    var d = 'M' + f(0, 0) + ' ' + f(40, 1) + ' C ' + [120,40,120,14,250,14].map(f).join(' ') + ' S ' + [380,46,500,30].map(f).join(' ') + ' S ' + [640,6,750,22].map(f).join(' ') + ' S ' + [900,44,1000,20].map(f).join(' ');
    rt.querySelector('svg').setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    $$('path', rt).forEach(function (p) { p.setAttribute('d', d); });
    var line = $('.line', rt); rt.__L = line.getTotalLength(); line.style.strokeDasharray = rt.__L;
  }
  $$('.rt').forEach(routeFit);
  function frame() {
    raf = 0;
    var vh = window.innerHeight, target = window.scrollY;
    cur += (target - cur) * (reduce ? 1 : 0.14); if (Math.abs(target - cur) < 0.4) cur = target;
    if (!reduce) {
      lits.forEach(function (sec) {
        var r = R(sec), p = clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
        var ws = $$('.w', sec), n = ws.length, upTo = Math.round(clamp(p * 1.3, 0, 1) * n);
        ws.forEach(function (w, i) { w.classList.toggle('on', i < upTo); });
      });
      pins.forEach(function (sec) {
        var r = R(sec), p = clamp(-r.top / Math.max(1, r.height - vh), 0, 0.9999);
        var chs = $$('.ch', sec), idx = Math.floor(p * chs.length);
        chs.forEach(function (c, i) { c.classList.toggle('on', i === idx); });
        var rt = $('.rt', sec);
        if (rt && rt.__L) {
          var line = $('.line', rt), L = rt.__L, pt = line.getPointAtLength(L * p);
          line.style.strokeDashoffset = L * (1 - p);
          var mk = $('.mk', rt); mk.style.left = pt.x + 'px'; mk.style.top = pt.y + 'px';
          $$('.nd', rt).forEach(function (n, i) { var q = line.getPointAtLength(L * i / 3); n.style.left = q.x + 'px'; n.style.top = q.y + 'px'; n.classList.toggle('on', p >= i / 3 - 0.001); });
        }
        var cnt = $('.cnt', sec); if (cnt) cnt.textContent = '0' + (idx + 1) + ' / 0' + chs.length;
      });
      pars.forEach(function (el) {
        var r = R(el.parentNode), k = parseFloat(el.getAttribute('data-par')) || 0.08;
        if (r.bottom < -100 || r.top > vh + 100) return;
        var off = r.top + r.height / 2 - vh / 2, z = '';
        if (el.hasAttribute('data-zoom')) { var q = clamp(1 - (r.top + r.height) / (vh + r.height), 0, 1); z = ' scale(' + (1.2 - 0.2 * ease(q)).toFixed(3) + ')'; }
        el.style.transform = 'translate3d(0,' + (off * -k).toFixed(1) + 'px,0)' + z;
      });
      clips.forEach(function (el) {
        var r = R(el); if (r.bottom < -50 || r.top > vh + 50) return;
        var q = ease(clamp((vh - r.top) / (vh * 0.75), 0, 1)), inset = (1 - q) * 16;
        el.style.clipPath = 'inset(' + inset.toFixed(2) + '% ' + (inset * 0.6).toFixed(2) + '% ' + inset.toFixed(2) + '% ' + (inset * 0.6).toFixed(2) + '%)';
      });
      lifts.forEach(function (el) {
        var r = R(el); if (r.bottom < -200 || r.top > vh + 200) return;
        el.style.translate = '0 ' + ((r.top + r.height / 2 - vh / 2) * -(parseFloat(el.getAttribute('data-lift')) || 0.06)).toFixed(1) + 'px';
      });
      sys.forEach(function (el) { el.style.translate = '0 ' + (-cur * (parseFloat(el.getAttribute('data-sy')) || 0.1)).toFixed(1) + 'px'; });
      drifts.forEach(function (el) {
        var r = R(el.parentNode); if (r.bottom < 0 || r.top > vh) return;
        var q = (r.top + r.height / 2 - vh / 2) / vh, k = parseFloat(el.getAttribute('data-px')) || 0.3;
        el.style.transform = 'translate3d(' + (q * -k * window.innerWidth).toFixed(1) + 'px,0,0)';
      });
    }
    if (hdr) { hdr.classList.toggle('hide', target > lastY + 2 && target > 240 && window.innerWidth >= 900); }
    lastY = target;
    if (cur !== target) raf = requestAnimationFrame(frame);
  }
  function onScroll() { if (!raf) raf = requestAnimationFrame(frame); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { $$('.rt').forEach(routeFit); onScroll(); });
  // first chapter visible before any scroll happens
  $$('.pin').forEach(function (sec) { var c = $('.ch', sec); if (c) c.classList.add('on'); });
  frame();

  // ---------- selection groups ----------
  function grupo(sel, attr, cb) {
    var g = $(sel); if (!g) return;
    $$('button', g).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('button', g).forEach(function (o) { o.setAttribute(attr, o === b ? 'true' : 'false'); });
        if (cb) cb(b);
      });
    });
  }

  // shop: filter by profile
  grupo('#filtros', 'aria-pressed', function (b) {
    var f = b.getAttribute('data-f');
    $$('#grilla .card').forEach(function (c) { c.hidden = !(f === 'all' || c.getAttribute('data-k') === f); });
  });

  // product: grind, quantity, total
  var qty = 1, mol = 'Whole bean';
  function fmt(n) { return '$' + n.toLocaleString('es-CO'); }
  function pinta() {
    if (!$('#qty')) return;
    $('#qty').textContent = qty;
    $('#total').textContent = fmt(60000 * qty);
    $('#total2').textContent = fmt(60000 * qty);
    $('#resumen').textContent = qty + ' × ' + T(mol);
    $('#metodo').textContent = T(mol);
    $('#agregar').textContent = T('Add to cart');
  }
  grupo('#moliendas', 'aria-checked', function (b) { mol = b.getAttribute('data-g'); pinta(); });
  if ($('#mas')) {
    $('#mas').addEventListener('click', function () { qty = Math.min(9, qty + 1); pinta(); });
    $('#menos').addEventListener('click', function () { qty = Math.max(1, qty - 1); pinta(); });
    $('#agregar').addEventListener('click', function () { this.textContent = T('Added ✓ (prototype)'); });
  }

  // visit: "open now" (Bogotá time) and tabbed menu
  var estado = $('#estado');
  if (estado) {
    var p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Bogota', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
    var get = function (t) { return p.filter(function (x) { return x.type === t; })[0].value; };
    var dia = get('weekday'), h = parseInt(get('hour'), 10) % 24 + parseInt(get('minute'), 10) / 60;
    var cierre = dia === 'Sun' ? null : dia === 'Sat' ? 19 : 20;
    var abierto = cierre !== null && h >= 10 && h < cierre;
    estado.className = 'abierto' + (abierto ? '' : ' cerrado');
    var paint = function () {
      estado.lastChild.textContent = abierto ? T('Open now · closes at ') + (cierre - 12) + ':00 p.m.' : T('Closed now · open Monday to Saturday from 10:00 a.m.');
    };
    paint(); document.addEventListener('cs-lang', paint);
  }
  var MENU = {
    coffee: [['Espresso', '[Description]'], ['Cappuccino', '[Description]'], ['Flat white', '[Description]'], ['V60 filter', '[Description]'], ['[House drink]', '[Description]']],
    food: [['Arepa', '[Description]'], ['Sandwich', '[Description]'], ['Cake of the day', '[Description]']],
    other: [['Juice', '[Fruit of the day]'], ['[Non-coffee drink]', '[Description]']]
  };
  var curMenu = 'coffee';
  function menu(k) {
    var c = $('#items'); if (!c) return; curMenu = k;
    c.innerHTML = '';
    MENU[k].forEach(function (i) {
      var d = document.createElement('div'); d.className = 'item';
      var l = document.createElement('div'), s = document.createElement('strong'), m = document.createElement('small');
      s.textContent = T(i[0]); m.textContent = T(i[1]); l.appendChild(s); l.appendChild(m);
      var pr = document.createElement('span'); pr.className = 'mono'; pr.textContent = T('[Price]');
      d.appendChild(l); d.appendChild(pr); c.appendChild(d);
    });
  }
  if ($('#tabs')) {
    menu('coffee'); document.addEventListener('cs-lang', function () { menu(curMenu); });
    $$('#tabs button').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('#tabs button').forEach(function (o) { var on = o === b; o.setAttribute('aria-selected', on); o.setAttribute('aria-pressed', on); });
        menu(b.getAttribute('data-m'));
      });
    });
  }

  // subscribe: summary
  function resumen(id, out) {
    var g = $(id); if (!g) return;
    $(out).__en = $(out).textContent;
    document.addEventListener('cs-lang', function () { $(out).textContent = T($(out).__en); });
    grupo(id, 'aria-checked', function (b) { $(out).__en = b.getAttribute('data-v'); $(out).textContent = T($(out).__en); });
  }
  resumen('#planes', '#rp'); resumen('#freqs', '#rf'); resumen('#gr', '#rg');
  document.addEventListener('cs-lang', function () { pinta(); });
  if (window.csInit) window.csInit();
})();
