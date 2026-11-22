// Minimal prototype interactions. No dependencies.
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Exclusive selection inside a group (radios / chips / filters)
  function grupo(sel, attr, cb) {
    var g = $(sel); if (!g) return;
    $$('button', g).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('button', g).forEach(function (o) { o.setAttribute(attr, o === b ? 'true' : 'false'); });
        if (cb) cb(b);
      });
    });
  }

  // Shop: filter by profile
  grupo('#filtros', 'aria-pressed', function (b) {
    var f = b.getAttribute('data-f');
    $$('#grilla .card').forEach(function (c) { c.hidden = !(f === 'all' || c.getAttribute('data-k') === f); });
  });

  // Product page: grind, quantity, total
  var qty = 1, mol = 'Whole bean';
  function fmt(n) { return '$' + n.toLocaleString('es-CO'); }
  function pinta() {
    if (!$('#qty')) return;
    $('#qty').textContent = qty;
    $('#total').textContent = fmt(60000 * qty);
    $('#total2').textContent = fmt(60000 * qty);
    $('#resumen').textContent = qty + ' × ' + mol;
    $('#metodo').textContent = mol;
    $('#agregar').textContent = 'Add to cart';
  }
  grupo('#moliendas', 'aria-checked', function (b) { mol = b.getAttribute('data-g'); pinta(); });
  if ($('#mas')) {
    $('#mas').addEventListener('click', function () { qty = Math.min(9, qty + 1); pinta(); });
    $('#menos').addEventListener('click', function () { qty = Math.max(1, qty - 1); pinta(); });
    $('#agregar').addEventListener('click', function () { this.textContent = 'Added ✓ (prototype)'; });
  }

  // Visit: "open now" status (Bogotá time) and tabbed menu
  var estado = $('#estado');
  if (estado) {
    var p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Bogota', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
    var get = function (t) { return p.filter(function (x) { return x.type === t; })[0].value; };
    var dia = get('weekday'), h = parseInt(get('hour'), 10) % 24 + parseInt(get('minute'), 10) / 60;
    var cierre = dia === 'Sun' ? null : dia === 'Sat' ? 19 : 20;
    var abierto = cierre !== null && h >= 10 && h < cierre;
    estado.className = 'abierto' + (abierto ? '' : ' cerrado');
    estado.lastChild.textContent = abierto ? 'Open now · closes at ' + (cierre - 12) + ':00 p.m.' : 'Closed now · open Monday to Saturday from 10:00 a.m.';
  }
  var MENU = {
    coffee: [['Espresso', '[Description]'], ['Cappuccino', '[Description]'], ['Flat white', '[Description]'], ['V60 filter', '[Description]'], ['[House drink]', '[Description]']],
    food: [['Arepa', '[Description]'], ['Sandwich', '[Description]'], ['Cake of the day', '[Description]']],
    other: [['Juice', '[Fruit of the day]'], ['[Non-coffee drink]', '[Description]']]
  };
  function menu(k) {
    var c = $('#items'); if (!c) return;
    c.innerHTML = '';
    MENU[k].forEach(function (i) {
      var d = document.createElement('div'); d.className = 'item';
      var l = document.createElement('div'), s = document.createElement('strong'), m = document.createElement('small');
      s.textContent = i[0]; m.textContent = i[1]; l.appendChild(s); l.appendChild(m);
      var pr = document.createElement('span'); pr.className = 'mono'; pr.textContent = '[Price]';
      d.appendChild(l); d.appendChild(pr); c.appendChild(d);
    });
  }
  if ($('#tabs')) {
    menu('coffee');
    $$('#tabs button').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('#tabs button').forEach(function (o) { var on = o === b; o.setAttribute('aria-selected', on); o.setAttribute('aria-pressed', on); });
        menu(b.getAttribute('data-m'));
      });
    });
  }

  // Subscribe: summary
  function resumen(id, out) { grupo(id, 'aria-checked', function (b) { $(out).textContent = b.getAttribute('data-v'); }); }
  resumen('#planes', '#rp'); resumen('#freqs', '#rf'); resumen('#gr', '#rg');
})();
