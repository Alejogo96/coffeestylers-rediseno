(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var T = function (x) { return window.csT ? window.csT(x) : x; };
  var quiz = $('#quiz'); if (!quiz) return;
  var CAT = {
    sweet: { name: 'Pacamara Natural', img: 'pacamara', why: 'Natural process, sweet and juicy. A great place to start.' },
    honey: { name: 'Caturra Yellow Honey', img: 'caturra', why: 'Honey process, silky and sweet. Lovely as a filter.' },
    everyday: { name: 'Blend Prohibido', img: 'blend', why: 'A balanced blend made for every day, any method.' },
    surprise: { name: 'Mistery Coffee', img: 'mistery', why: 'We pick the origin, you open the bag. Never the same cup twice.' }
  };
  var IMG = {"pacamara": "https://dcdn-us.mitiendanube.com/stores/007/501/629/products/sin-titulo-1-de0b23dd6bac31ea5417761088496588-1024-1024.webp", "caturra": "https://dcdn-us.mitiendanube.com/stores/007/501/629/products/caturra-a3a93360a88d8051ca17761109795129-1024-1024.webp", "blend": "https://dcdn-us.mitiendanube.com/stores/007/501/629/products/blend-45b97516e95f1cf53217761098308810-1024-1024.webp", "mistery": "https://dcdn-us.mitiendanube.com/stores/007/501/629/products/sin-titulo-1-f8845e8910018749f917761015362830-1024-1024.webp"};
  var ans = {};
  function show(k) { $$('.q', quiz).forEach(function (q) { q.classList.toggle('on', q.getAttribute('data-q') === k); }); }
  function result() {
    var key = ans.taste === 'surprise' ? 'surprise' : ans.taste === 'everyday' ? 'everyday' : (ans.brew === 'filter' ? 'honey' : 'sweet');
    var c = CAT[key];
    $('#rname').textContent = c.name; $('#rwhy').textContent = T(c.why); $('#rimg').style.backgroundImage = 'url(' + IMG[c.img] + ')';
    $('#rsub').hidden = ans.freq !== 'monthly';
    show('result'); quiz.__key = key;
  }
  $$('.q:not(.res) button', quiz).forEach(function (b) {
    b.addEventListener('click', function () {
      var q = b.closest('.q'), k = q.getAttribute('data-q'); ans[k] = b.getAttribute('data-v');
      show(k === 'brew' ? 'taste' : k === 'taste' ? 'freq' : null) ; if (k === 'freq') result();
    });
  });
  $('#qreset').addEventListener('click', function () { ans = {}; show('brew'); });
  document.addEventListener('cs-lang', function () { if (quiz.__key) $('#rwhy').textContent = T(CAT[quiz.__key].why); });
})();
