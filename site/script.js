/* =====================================================================
   LA SANTA — interactions (vanilla, progressive enhancement)
   ===================================================================== */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var y = $('[data-year]'); if (y) y.textContent = new Date().getFullYear();
  var dt = $('[data-date]');
  if (dt) { try { dt.textContent = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) {} }

  /* ---------- Hero intro ---------- */
  function revealHero() { $$('[data-hero]').forEach(function (el) { el.classList.add('is-in'); }); }
  if (reduced) revealHero();
  else { requestAnimationFrame(function () { requestAnimationFrame(revealHero); }); window.setTimeout(revealHero, 500); }

  /* ---------- Hero slideshow ---------- */
  var slides = $$('.hero__slide');
  if (slides.length > 1 && !reduced) {
    var si = 0;
    window.setInterval(function () {
      if (document.hidden) return;
      slides[si].classList.remove('is-active');
      si = (si + 1) % slides.length;
      slides[si].classList.add('is-active');
    }, 6000);
  }

  /* ---------- Nav + to-top ---------- */
  var nav = $('[data-nav]');
  var toTop = $('[data-to-top]');
  var ticking = false;
  function onScroll() {
    var sy = window.pageYOffset;
    if (nav) nav.classList.toggle('is-scrolled', sy > 60);
    if (toTop) toTop.classList.toggle('is-visible', sy > 700);
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$('[data-reveal]');
  reveals.forEach(function (el) {
    var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.hasAttribute('data-reveal'); });
    var i = sibs.indexOf(el);
    if (i > 0) el.style.transitionDelay = Math.min(i * 0.08, 0.4) + 's';
  });
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.02, rootMargin: '0px 0px 14% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
    window.setTimeout(function () {
      reveals.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-visible'); });
    }, 2600);
    // scroll backstop: never let anything stay hidden once it has entered view
    var bsTick = false;
    window.addEventListener('scroll', function () {
      if (bsTick) return; bsTick = true;
      window.requestAnimationFrame(function () {
        for (var i = 0; i < reveals.length; i++) {
          var el = reveals[i];
          if (!el.classList.contains('is-visible')) {
            var r = el.getBoundingClientRect();
            if (r.top < window.innerHeight * 0.92 && r.bottom > 0) el.classList.add('is-visible');
          }
        }
        bsTick = false;
      });
    }, { passive: true });
  }

  /* ---------- Feature sections (especialidades) ---------- */
  var feats = $$('[data-feat]');
  if (feats.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      feats.forEach(function (f) { f.classList.add('is-visible'); });
    } else {
      var fio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); fio.unobserve(e.target); } });
      }, { threshold: 0.28, rootMargin: '0px 0px -12% 0px' });
      feats.forEach(function (f) { fio.observe(f); });
      window.setTimeout(function () {
        feats.forEach(function (f) { var r = f.getBoundingClientRect(); if (r.top < window.innerHeight && r.bottom > 0) f.classList.add('is-visible'); });
      }, 2600);
      // subtle parallax drift on the framed image
      var medias = feats.map(function (f) { return $('.feat__media', f); });
      var fTicking = false;
      function featPar() {
        var vh = window.innerHeight;
        for (var i = 0; i < feats.length; i++) {
          var m = medias[i]; if (!m) continue;
          var r = feats[i].getBoundingClientRect();
          if (r.bottom < -60 || r.top > vh + 60) continue;
          var p = (r.top + r.height / 2 - vh / 2) / vh;
          m.style.transform = 'translate3d(0,' + (p * -24).toFixed(1) + 'px,0)';
        }
        fTicking = false;
      }
      window.addEventListener('scroll', function () { if (!fTicking) { fTicking = true; window.requestAnimationFrame(featPar); } }, { passive: true });
      featPar();
    }
  }

  /* ---------- Smooth scroll ---------- */
  $$('[data-scroll]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (!id || id.charAt(0) !== '#') return;
      var target = document.getElementById(id.slice(1));
      if (!target) return;
      e.preventDefault();
      closeMobileMenu();
      window.setTimeout(function () {
        target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        try { history.replaceState(null, '', id); } catch (err) {}
      }, 10);
    });
  });

  /* ---------- Mobile menu ---------- */
  var toggle = $('[data-menu-toggle]');
  var mobileMenu = $('[data-mobile-menu]');
  function closeMobileMenu() {
    if (!mobileMenu || !mobileMenu.classList.contains('is-open')) return;
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
    if (toggle) { toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Abrir menú'); }
  }
  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
    if (toggle) { toggle.setAttribute('aria-expanded', 'true'); toggle.setAttribute('aria-label', 'Cerrar menú'); }
  }
  if (toggle) toggle.addEventListener('click', function () {
    if (document.body.classList.contains('menu-open')) closeMobileMenu(); else openMobileMenu();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMobileMenu(); });
  window.addEventListener('resize', function () { if (window.innerWidth > 900) closeMobileMenu(); });

  /* ---------- Accordion (carta) ---------- */
  var accItems = $$('.acc__item');
  function setPanel(item, open) {
    var btn = $('.acc__btn', item);
    var panel = $('.acc__panel', item);
    var inner = $('.acc__inner', item);
    if (!panel || !inner) return;
    if (open) {
      item.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      panel.style.maxHeight = inner.scrollHeight + 'px';
    } else {
      item.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      panel.style.maxHeight = '0px';
    }
  }
  accItems.forEach(function (item) {
    var btn = $('.acc__btn', item);
    if (item.classList.contains('is-open')) setPanel(item, true);
    btn.addEventListener('click', function () { setPanel(item, !item.classList.contains('is-open')); });
  });
  // Recompute open panels after fonts load / resize (content reflow)
  function refreshPanels() {
    accItems.forEach(function (item) { if (item.classList.contains('is-open')) { var p = $('.acc__panel', item), inner = $('.acc__inner', item); if (p && inner) p.style.maxHeight = inner.scrollHeight + 'px'; } });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshPanels);
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = window.setTimeout(refreshPanels, 150); });

  /* ---------- Mapa (Leaflet + OpenStreetMap, se carga al acercarse) ---------- */
  var mapEl = $('[data-map]');
  if (mapEl) {
    var initMap = function () {
      var pos = [40.6541189, -4.6968026];
      var touch = window.matchMedia('(pointer: coarse)').matches;
      // sin arrastre en táctil ni zoom con la rueda: el mapa no secuestra el scroll de la página
      var map = L.map(mapEl, { center: pos, zoom: 17, minZoom: 14, maxZoom: 19, scrollWheelZoom: false, dragging: !touch });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
      }).addTo(map);
      map.attributionControl.setPrefix(false);
      var icon = L.divIcon({ className: 'map-pin', html: '<span class="map-pin__dot"></span>', iconSize: [26, 26], iconAnchor: [13, 13] });
      // en pantallas estrechas la etiqueta va encima del pin para no salirse del mapa
      var narrow = mapEl.clientWidth < 480;
      L.marker(pos, { icon: icon, keyboard: false, title: 'Restaurante La Santa' }).addTo(map)
        .bindTooltip('<strong>La Santa</strong><span>Plaza de Sta. Teresa, 16</span>', {
          permanent: true, className: 'map-label',
          direction: narrow ? 'top' : 'right', offset: narrow ? [0, -18] : [18, 0]
        });
    };
    var mapLoaded = false;
    var nearMap = function () {
      var r = mapEl.getBoundingClientRect();
      return r.top < window.innerHeight + 400 && r.bottom > -400;
    };
    // respaldo: si el IntersectionObserver no dispara, el scroll carga el mapa igual
    var onMapScroll = function () { if (nearMap()) loadMap(); };
    var loadMap = function () {
      if (mapLoaded) return;
      mapLoaded = true;
      window.removeEventListener('scroll', onMapScroll);
      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'leaflet.css?v=1.9.4';
      document.head.appendChild(css);
      var s = document.createElement('script');
      s.src = 'leaflet.js?v=1.9.4';
      s.onload = initMap;
      document.head.appendChild(s);
    };
    if ('IntersectionObserver' in window) {
      var mio = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { mio.disconnect(); loadMap(); }
      }, { rootMargin: '400px 0px' });
      mio.observe(mapEl);
      window.addEventListener('scroll', onMapScroll, { passive: true });
    } else {
      loadMap();
    }
  }

  /* ---------- Count-up ---------- */
  function fmt(v, d) { return d ? v.toFixed(d).replace('.', ',') : Math.round(v).toLocaleString('es-ES'); }
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var d = parseInt(el.getAttribute('data-decimals') || '0', 10);
    if (reduced) { el.textContent = fmt(target, d); return; }
    var dur = 1400, t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * e, d);
      if (p < 1) window.requestAnimationFrame(step); else el.textContent = fmt(target, d);
    }
    window.requestAnimationFrame(step);
  }
  var counters = $$('[data-count]');
  if (counters.length) {
    if (reduced || !('IntersectionObserver' in window)) counters.forEach(countUp);
    else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }
})();
