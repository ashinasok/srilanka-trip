/* ═══════════════════════════════════════════════════════════
   SRI LANKA 2026 — INTERACTIONS
   interactions.js  ·  loaded on every page
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     1. SCROLL PROGRESS BAR
  ───────────────────────────────────────── */
  function initScrollProgress() {
    var bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.appendChild(bar);
    window.addEventListener('scroll', function () {
      var st  = window.pageYOffset || document.documentElement.scrollTop;
      var dh  = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (dh > 0 ? (st / dh) * 100 : 0) + '%';
    }, { passive: true });
  }

  /* ─────────────────────────────────────────
     2. BACK-TO-TOP BUTTON
  ───────────────────────────────────────── */
  function initBackToTop() {
    var btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '↑';
    document.body.appendChild(btn);
    window.addEventListener('scroll', function () {
      btn.classList.toggle('btt-visible', window.pageYOffset > 400);
    }, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ─────────────────────────────────────────
     3. COUNTDOWN TIMER  (index.html only)
  ───────────────────────────────────────── */
  function initCountdown() {
    var el = document.getElementById('trip-countdown');
    if (!el) return;
    // 28 March 2026 11:05 IST = 05:35 UTC
    var tripDate = new Date('2026-03-28T05:35:00Z');
    function pad(n) { return String(n).padStart(2, '0'); }
    function tick() {
      var diff = tripDate - Date.now();
      if (diff <= 0) {
        el.innerHTML = '<span class="cd-live">🛺 &nbsp;The adventure is happening NOW!</span>';
        return;
      }
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000)  / 60000);
      var s = Math.floor((diff % 60000)    / 1000);
      el.innerHTML =
        unit(d, 'Days') + sep() + unit(pad(h), 'Hrs') +
        sep() + unit(pad(m), 'Min') + sep() + unit(pad(s), 'Sec');
    }
    function unit(n, l) {
      return '<div class="cd-unit"><div class="cd-num">' + n +
             '</div><div class="cd-lbl">' + l + '</div></div>';
    }
    function sep() { return '<div class="cd-sep">:</div>'; }
    tick();
    setInterval(tick, 1000);
  }

  /* ─────────────────────────────────────────
     4. SCROLL-TRIGGERED REVEAL ANIMATIONS
  ───────────────────────────────────────── */
  function initReveal() {
    var sel = [
      '.stop', '.hotel-card', '.restaurant-card',
      '.budget-category', '.overview-card', '.toc-row',
      '.accom-card', '.booking-card', '.cat-summary-chip',
      '.fuel-stop-card', '.stay-block', '.section-block',
      '.route-card', '.grand-total-bar', '.budget-disclaimer'
    ].join(',');

    var els = document.querySelectorAll(sel);
    if (!('IntersectionObserver' in window) || !els.length) return;

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('sl-revealed');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.07, rootMargin: '0px 0px -30px 0px' });

    els.forEach(function (el, i) {
      el.classList.add('sl-hidden');
      // stagger siblings within same parent
      var siblings = el.parentElement ? el.parentElement.children : [];
      var idx = Array.prototype.indexOf.call(siblings, el);
      el.style.transitionDelay = Math.min(idx * 0.06, 0.35) + 's';
      obs.observe(el);
    });
  }

  /* ─────────────────────────────────────────
     5. CURRENCY TOGGLE  (handled by settings panel)
  ───────────────────────────────────────── */
  function initCurrencyToggle() {
    // Legacy: kept for any standalone #currency-toggle button in HTML
    var btn = document.getElementById('currency-toggle');
    if (!btn) return;
    var order  = ['inr', 'usd', 'lkr'];
    var labels = { inr: '₹ INR', usd: '$ USD', lkr: 'LKR' };
    var stored = localStorage.getItem('sl-currency') || 'inr';
    var cur = order.indexOf(stored) >= 0 ? stored : 'inr';

    function apply(c) {
      document.querySelectorAll('[data-inr]').forEach(function (el) {
        el.textContent = el.getAttribute('data-' + c) || el.getAttribute('data-inr');
      });
      btn.textContent = labels[c];
      btn.setAttribute('data-active', c);
      localStorage.setItem('sl-currency', c);
      cur = c;
    }
    btn.addEventListener('click', function () {
      apply(order[(order.indexOf(cur) + 1) % order.length]);
    });
    apply(cur);
  }

  /* ─────────────────────────────────────────
     6. TIMELINE — COMPACT / EXPAND TOGGLE
        (day pages only)
  ───────────────────────────────────────── */
  function initTimelineToggle() {
    var timeline = document.querySelector('.timeline');
    if (!timeline) return;

    var stops = timeline.querySelectorAll('.stop');
    if (!stops.length) return;

    // Restructure each stop: wrap desc+tags+image in a collapsible body
    stops.forEach(function (stop) {
      var left  = stop.querySelector('.stop-left');
      var desc  = stop.querySelector('.stop-desc');
      var tags  = stop.querySelector('.stop-tags');
      var img   = stop.querySelector('.stop-image, .stop-icon-placeholder');
      var title = stop.querySelector('.stop-title');
      if (!left || !desc) return;

      // Create collapse wrapper
      var body = document.createElement('div');
      body.className = 'stop-collapse-body';

      // Move desc + tags into body (keep inside stop-left)
      if (desc) body.appendChild(desc);
      if (tags) body.appendChild(tags);

      left.appendChild(body);

      // Move image into stop-collapse-body or keep in stop-inner
      // (image is a sibling of stop-left in stop-inner grid)
      if (img) {
        var imgWrapper = document.createElement('div');
        imgWrapper.className = 'stop-img-wrapper';
        img.parentNode.insertBefore(imgWrapper, img);
        imgWrapper.appendChild(img);
        body.appendChild(imgWrapper);
      }

      // Add chevron to title
      if (title) {
        var chev = document.createElement('span');
        chev.className = 'stop-chev';
        chev.innerHTML = '&#9660;';
        title.appendChild(chev);
      }

      // Make stop header (time + title row) clickable
      var timeEl = stop.querySelector('.stop-time');
      if (timeEl) {
        timeEl.style.cursor = 'pointer';
        timeEl.addEventListener('click', function (e) {
          if (e.target.tagName === 'A') return;
          toggleStop(stop);
        });
      }
      if (title) {
        title.style.cursor = 'pointer';
        title.addEventListener('click', function (e) {
          if (e.target.tagName === 'A') return;
          toggleStop(stop);
        });
      }

      // Highlights start open; others start closed (in compact mode)
      if (stop.classList.contains('highlight')) {
        stop.classList.add('stop-open');
      }
    });

    // Compact mode toggle button
    var toggleBar = document.getElementById('timeline-compact-toggle');
    if (!toggleBar) return;

    var compactBtn = toggleBar.querySelector('#compact-mode-btn');
    if (!compactBtn) return;

    var isCompact = false;

    compactBtn.addEventListener('click', function () {
      isCompact = !isCompact;
      timeline.classList.toggle('timeline-compact', isCompact);
      compactBtn.innerHTML = isCompact
        ? '&#9633; Expand All'
        : '&#9635; Compact View';
      compactBtn.setAttribute('data-compact', isCompact);

      if (!isCompact) {
        // Expand all
        stops.forEach(function (s) { s.classList.add('stop-open'); });
      } else {
        // Collapse all except highlights
        stops.forEach(function (s) {
          if (!s.classList.contains('highlight')) {
            s.classList.remove('stop-open');
          }
        });
      }
    });
  }

  function toggleStop(stop) {
    stop.classList.toggle('stop-open');
  }

  /* ─────────────────────────────────────────
     7. PHOTO LIGHTBOX
  ───────────────────────────────────────── */
  function initLightbox() {
    // Target both legacy .stop-image AND new immersive .stop-bg elements
    var images = document.querySelectorAll('.stop-image, .stop-bg');
    if (!images.length) return;

    // Build overlay
    var ov = document.createElement('div');
    ov.id = 'sl-lightbox';
    ov.innerHTML =
      '<div id="sl-lb-inner">' +
        '<button id="sl-lb-close" aria-label="Close">&#x2715;</button>' +
        '<img id="sl-lb-img" src="" alt="" />' +
        '<div id="sl-lb-cap"></div>' +
      '</div>';
    document.body.appendChild(ov);

    var lbImg = document.getElementById('sl-lb-img');
    var lbCap = document.getElementById('sl-lb-cap');

    images.forEach(function (el) {
      el.style.cursor = 'zoom-in';
      el.addEventListener('click', function () {
        var src = (el.style.backgroundImage || '').replace(/url\(['"]?(.*?)['"]?\)/, '$1');
        if (!src) return;
        var titleEl = el.closest('.stop') && el.closest('.stop').querySelector('.stop-title');
        lbImg.src = src;
        lbCap.textContent = titleEl ? titleEl.textContent.replace('▾', '').trim() : '';
        ov.classList.add('sl-lb-open');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLb() {
      ov.classList.remove('sl-lb-open');
      document.body.style.overflow = '';
    }
    document.getElementById('sl-lb-close').addEventListener('click', closeLb);
    ov.addEventListener('click', function (e) { if (e.target === ov) closeLb(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLb(); });
  }

  /* ─────────────────────────────────────────
     8. FILTER TABS  (day pages)
  ───────────────────────────────────────── */
  function initFilterTabs() {
    var bar = document.getElementById('stop-filter-bar');
    if (!bar) return;
    var tabs  = bar.querySelectorAll('.filter-tab');
    var stops = document.querySelectorAll('.stop');
    if (!stops.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('filter-active'); });
        tab.classList.add('filter-active');
        var f = tab.getAttribute('data-filter');
        stops.forEach(function (stop) {
          var type = stop.getAttribute('data-stop-type') || 'normal';
          var show = f === 'all' ||
                     (f === 'highlight' && stop.classList.contains('highlight')) ||
                     (f === 'paid'      && (type === 'paid' || type === 'petrol')) ||
                     (f === 'free'      && type === 'free') ||
                     (f === 'petrol'    && type === 'petrol');
          stop.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ─────────────────────────────────────────
     9. NAV GLASSMORPHISM on scroll
  ───────────────────────────────────────── */
  function initNavScroll() {
    var nav = document.getElementById('siteNav');
    if (!nav) return;
    window.addEventListener('scroll', function () {
      nav.classList.toggle('nav-scrolled', window.pageYOffset > 60);
    }, { passive: true });
  }

  /* ─────────────────────────────────────────
     10. NUMBER COUNTER ANIMATION
  ───────────────────────────────────────── */
  function initCounters() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length || !('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el   = entry.target;
        var end  = parseFloat(el.getAttribute('data-count'));
        var pre  = el.getAttribute('data-prefix') || '';
        var suf  = el.getAttribute('data-suffix') || '';
        var dur  = 1400;
        var t0   = performance.now();
        function tick(now) {
          var p = Math.min((now - t0) / dur, 1);
          var e = 1 - Math.pow(1 - p, 3);
          el.textContent = pre + Math.round(e * end).toLocaleString('en-IN') + suf;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { obs.observe(el); });
  }

  /* ─────────────────────────────────────────
     11. HERO PARALLAX  (day pages)
  ───────────────────────────────────────── */
  function initParallax() {
    var bg = document.querySelector('.day-hero-bg');
    if (!bg) return;
    var hero = document.querySelector('.day-hero');
    window.addEventListener('scroll', function () {
      var s = window.pageYOffset;
      if (hero && s > hero.offsetHeight) return;
      bg.style.transform = 'scale(1.05) translateY(' + (s * 0.25) + 'px)';
    }, { passive: true });
  }

  /* ─────────────────────────────────────────
     12. MOBILE SWIPE NAVIGATION  (day pages)
  ───────────────────────────────────────── */
  function initSwipeNav() {
    var footer  = document.querySelector('.day-nav-footer');
    if (!footer) return;
    var btns    = footer.querySelectorAll('a.nav-btn');
    if (btns.length < 2) return;
    var prevBtn = btns[0];
    var nextBtn = btns[btns.length - 1];
    var tx0 = 0;
    document.addEventListener('touchstart', function (e) {
      tx0 = e.touches[0].clientX;
    }, { passive: true });
    document.addEventListener('touchend', function (e) {
      var dx = tx0 - e.changedTouches[0].clientX;
      if (Math.abs(dx) < 70) return;
      if (dx > 0 && nextBtn && !nextBtn.classList.contains('disabled')) {
        window.location = nextBtn.href;
      } else if (dx < 0 && prevBtn && !prevBtn.classList.contains('disabled')) {
        window.location = prevBtn.href;
      }
    }, { passive: true });
  }

  /* ─────────────────────────────────────────
     13. ACTIVE NAV LINK  (index.html)
  ───────────────────────────────────────── */
  function initActiveNav() {
    var anchors  = document.querySelectorAll('[id]');
    var navLinks = document.querySelectorAll('.nav-links > a');
    if (!anchors.length || !navLinks.length || !('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (link) {
          var h = link.getAttribute('href') || '';
          link.classList.toggle('active', h.includes('#' + id));
        });
      });
    }, { threshold: 0.4 });
    anchors.forEach(function (a) { obs.observe(a); });
  }

  /* ─────────────────────────────────────────
     14. BUDGET DONUT CHART  (budget.html only)
  ───────────────────────────────────────── */
  function initBudgetChart() {
    var canvas = document.getElementById('budget-chart');
    if (!canvas || typeof Chart === 'undefined') return;
    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['🏨 Stays', '🛺 Transport', '🎯 Experiences', '🎟️ Entry Fees', '🍛 Food'],
        datasets: [{
          data: [6368, 6567, 23297, 2406, 8500],
          backgroundColor: ['#0a6e6e', '#1565c0', '#d4500a', '#6a1b9a', '#1e7a4a'],
          borderColor: '#fdf6ed',
          borderWidth: 3,
          hoverOffset: 8
        }]
      },
      options: {
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { family: 'DM Sans', size: 12 },
              padding: 16,
              color: '#2d2d2d'
            }
          },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                var val = ctx.parsed;
                return ' ₹' + val.toLocaleString('en-IN') + ' / person';
              }
            }
          }
        }
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     15. SETTINGS PANEL — Time Format (12/24hr) & Currency
  ═══════════════════════════════════════════════════════════ */

  /* — 15a. Inject CSS for the settings panel — */
  function injectSettingsCSS() {
    var style = document.createElement('style');
    style.textContent = [
      /* Settings gear button — desktop nav bar only */
      '#sl-settings-btn {',
      '  background: none;',
      '  border: none;',
      '  color: rgba(255,255,255,0.8);',
      '  font-size: 1.1rem;',
      '  cursor: pointer;',
      '  padding: 0 0.9rem;',
      '  margin-left: auto;',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 0.35rem;',
      '  height: 100%;',
      '  flex-shrink: 0;',
      '  transition: color 0.2s;',
      '  border-left: 1px solid rgba(255,255,255,0.12);',
      '}',
      '#sl-settings-btn:hover { color: #e8b84b; }',
      '#sl-settings-btn .sl-settings-label {',
      '  font-size: 0.72rem;',
      '  letter-spacing: 0.08em;',
      '  text-transform: uppercase;',
      '  font-family: "DM Mono", monospace;',
      '  font-weight: 500;',
      '}',
      /* On mobile hide the top-nav gear — it lives inside the hamburger instead */
      '@media (max-width: 820px) { #sl-settings-btn { display: none !important; } }',

      /* Settings entry inside the hamburger menu */
      '#sl-nav-settings-divider { height:1px; background:rgba(255,255,255,0.10); margin:0.3rem 0.8rem; }',
      '#sl-nav-settings-btn {',
      '  background: rgba(255,255,255,0.07);',
      '  border: 1px solid rgba(255,255,255,0.16);',
      '  border-radius: 8px;',
      '  color: rgba(255,255,255,0.82);',
      '  font-size: 0.78rem;',
      '  font-family: "DM Sans", sans-serif;',
      '  font-weight: 600;',
      '  letter-spacing: 0.08em;',
      '  text-transform: uppercase;',
      '  cursor: pointer;',
      '  padding: 0.75rem 1.4rem;',
      '  margin: 0.4rem 0.8rem 0.7rem;',
      '  display: block;',
      '  width: calc(100% - 1.6rem);',
      '  text-align: center;',
      '  transition: background 0.2s, color 0.2s;',
      '}',
      '#sl-nav-settings-btn:hover { background: rgba(255,255,255,0.14); color: #e8b84b; }',
      /* On desktop the hamburger is hidden — its settings item too */
      '@media (min-width: 821px) { #sl-nav-settings-btn, #sl-nav-settings-divider { display: none; } }',

      /* Overlay backdrop */
      '#sl-settings-overlay {',
      '  display: none;',
      '  position: fixed; inset: 0;',
      '  background: rgba(0,0,0,0.35);',
      '  z-index: 2000;',
      '  backdrop-filter: blur(2px);',
      '}',
      '#sl-settings-overlay.sl-sp-open { display: block; }',

      /* Drawer panel */
      '#sl-settings-panel {',
      '  position: fixed;',
      '  top: 0; right: 0;',
      '  width: 300px;',
      '  max-width: 92vw;',
      '  height: 100%;',
      '  background: #0d5858;',
      '  z-index: 2100;',
      '  display: flex;',
      '  flex-direction: column;',
      '  transform: translateX(100%);',
      '  transition: transform 0.32s cubic-bezier(0.4,0,0.2,1);',
      '  box-shadow: -8px 0 40px rgba(0,0,0,0.35);',
      '}',
      '#sl-settings-panel.sl-sp-open { transform: translateX(0); }',

      /* Panel header */
      '#sl-sp-header {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  padding: 1.1rem 1.4rem;',
      '  background: #064f4f;',
      '  border-bottom: 2px solid #c8922a;',
      '}',
      '#sl-sp-header h3 {',
      '  color: #e8b84b;',
      '  font-size: 0.78rem;',
      '  letter-spacing: 0.2em;',
      '  text-transform: uppercase;',
      '  font-family: "DM Mono", monospace;',
      '  font-weight: 500;',
      '}',
      '#sl-sp-close {',
      '  background: none; border: none;',
      '  color: rgba(255,255,255,0.6);',
      '  font-size: 1.2rem; cursor: pointer;',
      '  line-height: 1; padding: 0.2rem;',
      '  transition: color 0.2s;',
      '}',
      '#sl-sp-close:hover { color: #fff; }',

      /* Panel body */
      '#sl-sp-body { padding: 1.4rem; display: flex; flex-direction: column; gap: 1.8rem; overflow-y: auto; }',

      /* Setting group */
      '.sl-setting-group { display: flex; flex-direction: column; gap: 0.8rem; }',
      '.sl-setting-group-label {',
      '  color: #e8b84b;',
      '  font-size: 0.65rem;',
      '  letter-spacing: 0.2em;',
      '  text-transform: uppercase;',
      '  font-family: "DM Mono", monospace;',
      '  font-weight: 500;',
      '  padding-bottom: 0.4rem;',
      '  border-bottom: 1px solid rgba(255,255,255,0.1);',
      '}',

      /* Toggle switch row */
      '.sl-toggle-row {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 0.8rem;',
      '}',
      '.sl-toggle-row span {',
      '  color: rgba(255,255,255,0.75);',
      '  font-size: 0.82rem;',
      '  font-weight: 500;',
      '  min-width: 36px;',
      '}',
      '.sl-toggle-row span.sl-tf-active { color: #fff; font-weight: 700; }',

      /* iOS-style switch */
      '.sl-switch {',
      '  position: relative;',
      '  display: inline-block;',
      '  width: 46px;',
      '  height: 26px;',
      '  flex-shrink: 0;',
      '}',
      '.sl-switch input { opacity: 0; width: 0; height: 0; }',
      '.sl-slider {',
      '  position: absolute; inset: 0;',
      '  background: rgba(255,255,255,0.2);',
      '  border-radius: 26px;',
      '  cursor: pointer;',
      '  transition: background 0.25s;',
      '}',
      '.sl-slider::before {',
      '  content: "";',
      '  position: absolute;',
      '  width: 20px; height: 20px;',
      '  left: 3px; top: 3px;',
      '  background: white;',
      '  border-radius: 50%;',
      '  transition: transform 0.25s;',
      '  box-shadow: 0 2px 6px rgba(0,0,0,0.25);',
      '}',
      '.sl-switch input:checked + .sl-slider { background: #c8922a; }',
      '.sl-switch input:checked + .sl-slider::before { transform: translateX(20px); }',

      /* Currency buttons */
      '.sl-currency-btns {',
      '  display: flex;',
      '  gap: 0.5rem;',
      '}',
      '.sl-cur-btn {',
      '  flex: 1;',
      '  padding: 0.55rem 0.4rem;',
      '  background: rgba(255,255,255,0.1);',
      '  border: 1px solid rgba(255,255,255,0.15);',
      '  border-radius: 8px;',
      '  color: rgba(255,255,255,0.7);',
      '  font-size: 0.8rem;',
      '  font-weight: 600;',
      '  cursor: pointer;',
      '  transition: background 0.2s, color 0.2s, border-color 0.2s;',
      '  font-family: "DM Sans", sans-serif;',
      '}',
      '.sl-cur-btn:hover { background: rgba(255,255,255,0.18); color: #fff; }',
      '.sl-cur-btn.sl-cur-active {',
      '  background: #c8922a;',
      '  border-color: #c8922a;',
      '  color: #fff;',
      '}',

      /* Divider */
      '.sl-sp-divider {',
      '  height: 1px;',
      '  background: rgba(255,255,255,0.08);',
      '  margin: 0;',
      '}',

      /* Info note at bottom */
      '.sl-sp-note {',
      '  margin-top: auto;',
      '  padding: 1rem 1.4rem 1.4rem;',
      '  color: rgba(255,255,255,0.3);',
      '  font-size: 0.68rem;',
      '  line-height: 1.5;',
      '  text-align: center;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  /* — 15b. Time format conversion — */
  var _timeNodes = [];

  function collectTimeNodes() {
    _timeNodes = [];
    var timeRx = /\b(1[0-2]|0?[1-9]):[0-5][0-9]\s*[AaPp][Mm]\b/;
    var walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          // Skip script and style content
          var tag = node.parentElement && node.parentElement.tagName;
          if (tag === 'SCRIPT' || tag === 'STYLE') return NodeFilter.FILTER_REJECT;
          return timeRx.test(node.nodeValue)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_SKIP;
        }
      },
      false
    );
    var node;
    while ((node = walker.nextNode())) {
      _timeNodes.push({ node: node, orig: node.nodeValue });
    }
  }

  function convertTo24(str) {
    return str.replace(
      /\b(1[0-2]|0?[1-9]):([0-5][0-9])\s*([AaPp][Mm])\b/g,
      function (match, h, m, ampm) {
        h = parseInt(h, 10);
        var upper = ampm.toUpperCase();
        if (upper === 'AM') {
          if (h === 12) h = 0;
        } else {
          if (h !== 12) h += 12;
        }
        return String(h).padStart(2, '0') + ':' + m;
      }
    );
  }

  function applyTimeFormat(use24) {
    _timeNodes.forEach(function (item) {
      item.node.nodeValue = use24 ? convertTo24(item.orig) : item.orig;
    });
  }

  /* — 15c. Currency application — */
  function applyCurrency(c) {
    var labels = { inr: '₹ INR', usd: '$ USD', lkr: 'රු LKR' };
    localStorage.setItem('sl-currency', c);

    /* Delegate conversion to CurrencyManager (currency.js) */
    if (window.CurrencyManager) {
      window.CurrencyManager.setCurrency(c);
    }

    /* Sync any standalone #currency-toggle button */
    var legacyBtn = document.getElementById('currency-toggle');
    if (legacyBtn) {
      legacyBtn.textContent = labels[c];
      legacyBtn.setAttribute('data-active', c);
    }
  }

  /* — 15d. Build and wire the settings panel — */
  function initSettingsPanel() {
    injectSettingsCSS();

    /* Read stored prefs */
    var storedCur = localStorage.getItem('sl-currency') || 'inr';
    if (['inr', 'usd', 'lkr'].indexOf(storedCur) < 0) storedCur = 'inr';
    var stored24  = localStorage.getItem('sl-time24') === '1';

    /* — Build overlay — */
    var overlay = document.createElement('div');
    overlay.id = 'sl-settings-overlay';

    /* — Build panel — */
    var panel = document.createElement('div');
    panel.id = 'sl-settings-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Settings');

    panel.innerHTML =
      '<div id="sl-sp-header">' +
        '<h3>⚙ Settings</h3>' +
        '<button id="sl-sp-close" aria-label="Close settings">&#x2715;</button>' +
      '</div>' +
      '<div id="sl-sp-body">' +

        /* Time format */
        '<div class="sl-setting-group">' +
          '<div class="sl-setting-group-label">Time Format</div>' +
          '<div class="sl-toggle-row">' +
            '<span id="sl-tf-lbl-12" class="' + (!stored24 ? 'sl-tf-active' : '') + '">12 hr</span>' +
            '<label class="sl-switch" aria-label="Switch to 24-hour time">' +
              '<input type="checkbox" id="sl-time-toggle"' + (stored24 ? ' checked' : '') + '>' +
              '<span class="sl-slider"></span>' +
            '</label>' +
            '<span id="sl-tf-lbl-24" class="' + (stored24 ? 'sl-tf-active' : '') + '">24 hr</span>' +
          '</div>' +
        '</div>' +

        /* Currency */
        '<div class="sl-setting-group">' +
          '<div class="sl-setting-group-label">Currency</div>' +
          '<div class="sl-currency-btns">' +
            '<button class="sl-cur-btn' + (storedCur === 'inr' ? ' sl-cur-active' : '') + '" data-cur="inr">₹ INR</button>' +
            '<button class="sl-cur-btn' + (storedCur === 'usd' ? ' sl-cur-active' : '') + '" data-cur="usd">$ USD</button>' +
            '<button class="sl-cur-btn' + (storedCur === 'lkr' ? ' sl-cur-active' : '') + '" data-cur="lkr">රු LKR</button>' +
          '</div>' +
        '</div>' +

      '</div>' +
      '<div class="sl-sp-note">Settings are saved across all pages.</div>';

    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    /* — Add gear button to nav — */
    var nav = document.getElementById('siteNav');
    if (nav) {
      var gearBtn = document.createElement('button');
      gearBtn.id = 'sl-settings-btn';
      gearBtn.setAttribute('aria-label', 'Open settings');
      gearBtn.innerHTML = '⚙ <span class="sl-settings-label">Settings</span>';
      nav.appendChild(gearBtn);
      gearBtn.addEventListener('click', openPanel);
    }

    /* — Add ⚙ Settings into the hamburger menu (mobile) — */
    var navLinksEl = document.getElementById('navLinks');
    if (navLinksEl) {
      var divEl = document.createElement('div');
      divEl.id = 'sl-nav-settings-divider';
      navLinksEl.appendChild(divEl);

      var navSettBtn = document.createElement('button');
      navSettBtn.id = 'sl-nav-settings-btn';
      navSettBtn.innerHTML = '⚙ &nbsp;Settings';
      navSettBtn.addEventListener('click', openPanel);
      navLinksEl.appendChild(navSettBtn);
    }

    /* — Open / Close logic — */
    function openPanel() {
      panel.classList.add('sl-sp-open');
      overlay.classList.add('sl-sp-open');
      document.body.style.overflow = 'hidden';
    }
    function closePanel() {
      panel.classList.remove('sl-sp-open');
      overlay.classList.remove('sl-sp-open');
      document.body.style.overflow = '';
    }

    document.getElementById('sl-sp-close').addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closePanel();
    });

    /* — Time format toggle — */
    var timeToggle = document.getElementById('sl-time-toggle');
    var lbl12 = document.getElementById('sl-tf-lbl-12');
    var lbl24 = document.getElementById('sl-tf-lbl-24');

    // Collect time nodes AFTER DOM is stable (timeline restructuring already done)
    collectTimeNodes();
    if (stored24) applyTimeFormat(true);

    timeToggle.addEventListener('change', function () {
      var use24 = timeToggle.checked;
      localStorage.setItem('sl-time24', use24 ? '1' : '0');
      applyTimeFormat(use24);
      lbl12.className = use24 ? '' : 'sl-tf-active';
      lbl24.className = use24 ? 'sl-tf-active' : '';
    });

    /* — Currency buttons — */
    var curBtns = panel.querySelectorAll('.sl-cur-btn');
    applyCurrency(storedCur);

    curBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var c = btn.getAttribute('data-cur');
        curBtns.forEach(function (b) { b.classList.remove('sl-cur-active'); });
        btn.classList.add('sl-cur-active');
        applyCurrency(c);
      });
    });
  }

  /* ─────────────────────────────────────────
     16. FULL-SCREEN STOP CAROUSEL  (#stopCarousel)
  ───────────────────────────────────────── */
  function initStopCarousel() {
    var carousel  = document.getElementById('stopCarousel');
    if (!carousel) return;

    var slides    = Array.prototype.slice.call(carousel.querySelectorAll('.carousel-slide'));
    var dots      = Array.prototype.slice.call(carousel.querySelectorAll('.carousel-dot'));
    var counterEl = document.getElementById('carouselCounter');
    var labelEl   = carousel.querySelector('.carousel-label');

    /* Mark page so CSS can overlay a glassy nav */
    document.body.classList.add('has-carousel');

    var n         = slides.length;
    var stopCount = n - 1;   /* slide 0 = overview; 1-N = stops */
    var current   = 0;
    var animating = false;
    var locked    = false;   /* true = carousel intercepts scroll */
    var wheelBusy = false;   /* cooldown between wheel steps */
    var wheelAccum = 0;      /* accumulated deltaY for trackpad */

    if (!n) return;

    /* ─────────────────────────────────────────
       UI sync
    ───────────────────────────────────────── */
    function updateUI() {
      slides.forEach(function (s, i) { s.classList.toggle('active', i === current); });
      dots.forEach(function (d, i)   { d.classList.toggle('active', i === current); });
      if (counterEl) {
        counterEl.textContent = current === 0
          ? 'Overview'
          : 'Stop ' + current + ' of ' + stopCount;
      }
      if (labelEl) {
        labelEl.textContent = current === 0
          ? 'Day 1 · 28 March 2026'
          : 'Day 1 · Itinerary';
      }
    }

    /* ─────────────────────────────────────────
       Slide transition
    ───────────────────────────────────────── */
    function goTo(idx) {
      if (animating || idx < 0 || idx >= n || idx === current) return;
      animating = true;
      slides[current].classList.remove('active');
      current = idx;
      void slides[current].offsetWidth;   /* reflow → restarts Ken Burns */
      updateUI();
      setTimeout(function () { animating = false; }, 750);
    }

    /* ─────────────────────────────────────────
       Scroll lock / unlock
    ───────────────────────────────────────── */
    function lockCarousel() {
      if (locked) return;
      locked = true;
      var carTop = carousel.getBoundingClientRect().top + window.pageYOffset;
      if (Math.abs(window.pageYOffset - carTop) > 2) {
        window.scrollTo({ top: carTop, behavior: 'instant' });
      }
      document.body.classList.add('carousel-locked');
    }

    function unlockCarousel(direction) {
      if (!locked) return;
      locked = false;
      wheelAccum = 0;
      document.body.classList.remove('carousel-locked');
      if (direction === 'down') {
        var below = carousel.getBoundingClientRect().bottom + window.pageYOffset;
        window.scrollTo({ top: below, behavior: 'smooth' });
      }
    }

    /* ─────────────────────────────────────────
       Mouse-wheel (vertical)
    ───────────────────────────────────────── */
    var WHEEL_THRESH = 40;

    function onWheel(e) {
      if (!locked) return;
      e.preventDefault();
      if (animating || wheelBusy) return;

      wheelAccum += e.deltaY;
      if (Math.abs(wheelAccum) < WHEEL_THRESH) return;

      var dir    = wheelAccum > 0 ? 1 : -1;
      wheelAccum = 0;
      wheelBusy  = true;
      setTimeout(function () { wheelBusy = false; }, 820);

      if (dir > 0) {
        if (current < n - 1) goTo(current + 1); else unlockCarousel('down');
      } else {
        if (current > 0)     goTo(current - 1); else unlockCarousel('up');
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false });

    /* ─────────────────────────────────────────
       Touch swipe (mobile)
    ───────────────────────────────────────── */
    var touchY = 0;
    carousel.addEventListener('touchstart', function (e) {
      touchY = e.touches[0].clientY;
    }, { passive: true });
    carousel.addEventListener('touchend', function (e) {
      if (!locked) return;
      var dy = touchY - e.changedTouches[0].clientY;
      if (Math.abs(dy) < 50) return;
      if (dy > 0) {
        if (current < n - 1) goTo(current + 1); else unlockCarousel('down');
      } else {
        if (current > 0)     goTo(current - 1); else unlockCarousel('up');
      }
    }, { passive: true });

    /* ─────────────────────────────────────────
       Keyboard
    ───────────────────────────────────────── */
    document.addEventListener('keydown', function (e) {
      if (!locked) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        if (current < n - 1) goTo(current + 1); else unlockCarousel('down');
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        if (current > 0) goTo(current - 1); else unlockCarousel('up');
      }
    });

    /* ─────────────────────────────────────────
       Dot clicks
    ───────────────────────────────────────── */
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        if (!locked) lockCarousel();
        goTo(parseInt(dot.getAttribute('data-idx'), 10));
      });
    });

    /* ─────────────────────────────────────────
       Re-enter when scrolling back up to carousel
    ───────────────────────────────────────── */
    var lastScrollY = window.pageYOffset;
    window.addEventListener('scroll', function () {
      var sy = window.pageYOffset;
      var scrollingUp = sy < lastScrollY;
      lastScrollY = sy;
      if (locked || !scrollingUp) return;
      var rect = carousel.getBoundingClientRect();
      if (rect.top >= 0 && rect.top < 80) lockCarousel();
    }, { passive: true });

    /* ─────────────────────────────────────────
       Boot: lock immediately (carousel is first in page)
    ───────────────────────────────────────── */
    lockCarousel();
    updateUI();
  }

  /* ─────────────────────────────────────────
     17. DAY SPEND SECTION — auto-built from carousel paid stops
  ───────────────────────────────────────── */
  function initDaySpend() {
    var section   = document.getElementById('daySpend');
    var carousel  = document.getElementById('stopCarousel');
    if (!section || !carousel) return;

    /* Colour palette for each paid stop (cycles if > 6 stops) */
    var PALETTE = ['#f0a060', '#12a3a3', '#e8b84b', '#c06080', '#60a0d0', '#a060c0'];
    /* Gap colour between donut segments — matches section dark bg */
    var GAP_COL = '#071c1c';

    /* ── 1. Collect paid stops from carousel ── */
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.carousel-slide'));
    var items  = [];

    slides.forEach(function (slide) {
      var paidStat = slide.querySelector('.stop-stat.stat-paid');
      if (!paidStat) return;

      var valEl   = paidStat.querySelector('.stop-stat-value');
      var lblEl   = paidStat.querySelector('.stop-stat-label');
      var titleEl = slide.querySelector('.stop-title');
      if (!valEl || !titleEl) return;

      var stopType = slide.getAttribute('data-stop-type') || '';
      var isHalf   = (stopType === 'petrol' || stopType === 'hotel');
      var subLabel = lblEl ? lblEl.textContent.trim() : 'Price';
      if (isHalf) subLabel += ' ÷2 per person';

      /* Read base USD value — single source of truth */
      var rawUSD = parseFloat(valEl.getAttribute('data-price-usd'));
      if (isNaN(rawUSD)) return; /* skip if no USD base defined */
      var usdVal = isHalf ? rawUSD / 2 : rawUSD;
      /* For ranges, also halve the max if present */
      var maxRaw = valEl.getAttribute('data-price-usd-max');
      var usdMax = maxRaw ? (isHalf ? parseFloat(maxRaw) / 2 : parseFloat(maxRaw)) : null;

      items.push({
        title  : titleEl.textContent.trim(),
        sub    : subLabel,
        usd    : usdVal,
        usdMax : usdMax   /* null for single prices */
      });
    });

    if (!items.length) return;

    /* ── 2. Format helper — delegates to CurrencyManager if available ── */
    function fmt(usdAmt, usdAmtMax) {
      if (window.CurrencyManager) {
        return usdAmtMax
          ? window.CurrencyManager.formatRange(usdAmt, usdAmtMax)
          : window.CurrencyManager.format(usdAmt);
      }
      /* Fallback: show raw INR approximate */
      var approxINR = Math.round(usdAmt * 83.5);
      return '~₹' + approxINR.toLocaleString('en-IN');
    }

    var numsUSD  = items.map(function (it) { return it.usdMax ? (it.usd + it.usdMax) / 2 : it.usd; });
    var totalUSD = numsUSD.reduce(function (a, b) { return a + b; }, 0);

    /* ── 3. Render spend items ── */
    var itemsEl = section.querySelector('.spend-items');
    if (itemsEl) {
      itemsEl.innerHTML = '';
      items.forEach(function (item, i) {
        var col  = PALETTE[i % PALETTE.length];
        var name = item.title.split(/\s[—–:]\s/)[0].trim();
        var div  = document.createElement('div');
        div.className = 'spend-item';
        var midUSD   = item.usdMax ? (item.usd + item.usdMax) / 2 : item.usd;
        var amtAttrs = ' data-price-usd="' + item.usd.toFixed(2) + '"' +
          (item.usdMax ? ' data-price-usd-max="' + item.usdMax.toFixed(2) + '"' : '');
        div.innerHTML =
          '<span class="spend-dot" style="background:' + col + '"></span>' +
          '<div class="spend-item-info">' +
            '<div class="spend-item-name">' + name + '</div>' +
            '<div class="spend-item-sub">' + item.sub + '</div>' +
          '</div>' +
          '<div class="spend-item-amount"' + amtAttrs + '>' +
            fmt(item.usd, item.usdMax) +
          '</div>';
        itemsEl.appendChild(div);
      });
    }

    /* ── 4. Update total ── */
    var totalAmtEl = section.querySelector('.spend-total-amount');
    if (totalAmtEl) {
      totalAmtEl.setAttribute('data-price-usd', totalUSD.toFixed(2));
      totalAmtEl.textContent = fmt(totalUSD);
    }

    /* ── 5. Update donut chart (proportions are currency-agnostic) ── */
    var donutEl = section.querySelector('.spend-donut');
    if (donutEl && totalUSD > 0) {
      var stops = '', cum = 0;
      items.forEach(function (item, i) {
        var col = PALETTE[i % PALETTE.length];
        var pct = (numsUSD[i] / totalUSD) * 100;
        if (i > 0) stops += ', ' + GAP_COL + ' ' + (cum - 1).toFixed(1) + '% ' + cum.toFixed(1) + '%, ';
        stops += col + ' ' + cum.toFixed(1) + '% ' + (cum + pct).toFixed(1) + '%';
        cum += pct;
      });
      donutEl.style.background = 'conic-gradient(' + stops + ')';
    }

    /* ── 6. Update donut centre ── */
    var centreEl = section.querySelector('.donut-center-val');
    if (centreEl) {
      centreEl.setAttribute('data-price-usd', totalUSD.toFixed(2));
      centreEl.textContent = fmt(totalUSD);
    }

    /* ── 7. Render legend ── */
    var legendEl = section.querySelector('.spend-legend');
    if (legendEl) {
      legendEl.innerHTML = '';
      items.forEach(function (item, i) {
        var col = PALETTE[i % PALETTE.length];
        var pct = totalUSD > 0 ? Math.round((numsUSD[i] / totalUSD) * 100) : 0;
        var name = item.title.split(/\s[—–:]\s/)[0].trim();
        var row = document.createElement('div');
        row.className = 'spend-legend-row';
        row.innerHTML =
          '<span class="spend-legend-dot" style="background:' + col + '"></span>' +
          '<span class="spend-legend-name">' + name + '</span>' +
          '<span class="spend-legend-bar-wrap">' +
            '<span class="spend-legend-bar" style="width:' + pct + '%;background:' + col + '"></span>' +
          '</span>' +
          '<span class="spend-legend-pct">' + pct + '%</span>';
        legendEl.appendChild(row);
      });
    }
  }

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initScrollProgress();
    initBackToTop();
    initNavScroll();
    initReveal();
    initCountdown();
    initCurrencyToggle();
    initTimelineToggle();
    initSettingsPanel();   // after timeline toggle so time nodes are in final DOM
    initStopCarousel();    // full-screen carousel (day pages)
    initDaySpend();        // auto-populate Day Spend section from carousel paid stops
    initLightbox();
    initFilterTabs();
    initCounters();
    initParallax();
    initSwipeNav();
    initActiveNav();
    initBudgetChart();
  });

})();
