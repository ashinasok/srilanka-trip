/* ── hotel-data.js · HotelData module ──────────────────────────────────────
   Stores hotel data in localStorage key sl2026_hotels.
   Dispatches sl:hotelsChanged CustomEvent when data changes.
   Auto-syncs the current day page on load.
   ───────────────────────────────────────────────────────────────────────── */

(function (win) {
  'use strict';

  var STORAGE_KEY = 'sl2026_hotels';

  var DEFAULTS = [
    { id:'n1', nightLabel:'Night 1',      name:'Villa Freiheit Himmel',     priceUSD:17.22, nights:1, checkIn:'15:00', checkOut:'11:00', days:[1],   location:'Bentota',   mapsUrl:'https://maps.google.com/?q=Villa+Freiheit+Himmel+Bentota+Sri+Lanka' },
    { id:'n2', nightLabel:'Nights 2 & 3', name:'Riverwood Villa',           priceUSD:14.80, nights:2, checkIn:'14:00', checkOut:'11:00', days:[2,3], location:'Weligama',  mapsUrl:'https://maps.google.com/?q=Riverwood+Villa+Weligama+Sri+Lanka' },
    { id:'n4', nightLabel:'Night 4',      name:'Kithul Cob Hideaway',       priceUSD:48.34, nights:1, checkIn:'14:00', checkOut:'11:00', days:[4],   location:'Beragala',  mapsUrl:'https://maps.google.com/?q=Kithul+Cob+Hideaway+Beragala+Sri+Lanka' },
    { id:'n5', nightLabel:'Night 5',      name:'Heaven Hills Guest House',  priceUSD:19.22, nights:1, checkIn:'13:00', checkOut:'11:00', days:[5],   location:'Maskeliya', mapsUrl:'https://maps.google.com/?q=Heaven+Hills+Guest+House+Maskeliya+Sri+Lanka' },
    { id:'n6', nightLabel:'Night 6',      name:'Old Bridge Riverside Hotel',priceUSD:30.26, nights:1, checkIn:'14:00', checkOut:'11:00', days:[6],   location:'Kitulgala', mapsUrl:'https://maps.google.com/?q=Old+Bridge+Riverside+Hotel+Kitulgala+Sri+Lanka' }
  ];

  /* ── helpers ── */

  function fmt(usd) {
    if (win.CurrencyManager) return win.CurrencyManager.format(usd);
    return '$' + usd.toFixed(2);
  }

  function dispatch() {
    var ev = new CustomEvent('sl:hotelsChanged', { bubbles: true });
    document.dispatchEvent(ev);
  }

  /* ── storage ── */

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return DEFAULTS.map(function (h) { return JSON.parse(JSON.stringify(h)); });
  }

  function save(arr) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {}
    dispatch();
  }

  function reset() {
    save(DEFAULTS.map(function (h) { return JSON.parse(JSON.stringify(h)); }));
  }

  /* ── detect page day number ── */

  function getPageDay() {
    var m = win.location.pathname.match(/day(\d+)/i);
    return m ? parseInt(m[1], 10) : null;
  }

  /* ── day 1 sync ── */

  function syncDay1(hotels) {
    var hotel = null;
    for (var i = 0; i < hotels.length; i++) {
      if (hotels[i].days && hotels[i].days.indexOf(1) !== -1) { hotel = hotels[i]; break; }
    }
    if (!hotel) return;

    document.querySelectorAll('.n1-hotel-name').forEach(function (el) {
      el.textContent = hotel.name;
    });
    document.querySelectorAll('.n1-hotel-price').forEach(function (el) {
      el.setAttribute('data-price-usd', hotel.priceUSD);
      el.textContent = fmt(hotel.priceUSD);
    });
    document.querySelectorAll('.n1-hotel-link').forEach(function (el) {
      el.href = hotel.mapsUrl;
    });
  }

  /* ── day 2–6 sync ── */

  function syncDay(dayNum, hotels) {
    /* find the hotel for this day */
    var hotel = null;
    for (var i = 0; i < hotels.length; i++) {
      if (hotels[i].days && hotels[i].days.indexOf(dayNum) !== -1) { hotel = hotels[i]; break; }
    }
    if (!hotel) return;

    /* update hotel-card elements that already exist in the stay section */
    var cards = document.querySelectorAll('[data-hotel-id="' + hotel.id + '"]');
    cards.forEach(function (card) {
      var nameEl  = card.querySelector('.hotel-name');
      var badgeEl = card.querySelector('.hotel-price-badge');
      if (nameEl)  nameEl.textContent = hotel.name;
      if (badgeEl) {
        badgeEl.setAttribute('data-price-usd', hotel.priceUSD);
        badgeEl.textContent = fmt(hotel.priceUSD) + '/night';
      }
    });

    /* ── new card layout: inject into #stopCards ── */
    var stopCards = document.getElementById('stopCards');
    if (stopCards) {
      var existing = stopCards.querySelector('[data-stop-type="hotel"]');
      if (existing) {
        /* update existing injected card */
        var hName  = existing.querySelector('.sl-hotel-name');
        var hPrice = existing.querySelector('.sl-hotel-price');
        var hLink  = existing.querySelector('.sl-hotel-link');
        if (hName)  hName.textContent = hotel.name;
        if (hPrice) {
          hPrice.setAttribute('data-price-usd', hotel.priceUSD);
          hPrice.textContent = fmt(hotel.priceUSD);
        }
        if (hLink)  hLink.href = hotel.mapsUrl;
        return;
      }

      /* inject a new stop-card */
      var imgDay = hotel.days[0];
      var bgImg  = 'images/day' + imgDay + '/hotel.jpg';
      var card   = document.createElement('div');
      card.className = 'stop-card highlight sl-hotel-injected';
      card.setAttribute('data-stop-type', 'hotel');
      var cardIdx = stopCards.querySelectorAll('.stop-card').length;
      card.id = 'stop-' + cardIdx;
      card.innerHTML =
        '<div class="stop-card-img-wrap">' +
          '<div class="stop-card-img" style="background-image:url(\'' + bgImg + '\')"></div>' +
          '<div class="stop-card-type-badge">\uD83C\uDFE8 Hotel</div>' +
        '</div>' +
        '<div class="stop-card-content">' +
          '<div class="stop-card-header">' +
            '<span class="stop-icon-pill">\uD83C\uDFE8</span>' +
            '<span class="stop-card-num">Stop ' + (cardIdx + 1) + '</span>' +
            '<span class="tag tag-book">\u2713 Booked &middot; ' + hotel.nightLabel + '</span>' +
          '</div>' +
          '<h3 class="stop-title sl-hotel-name">' + hotel.name + '</h3>' +
          '<div class="stop-stats-row">' +
            '<div class="stop-stat"><div class="stop-stat-value">' + hotel.checkIn + '</div><div class="stop-stat-label">Check In</div></div>' +
            '<div class="stop-stat"><div class="stop-stat-value">' + hotel.checkOut + '</div><div class="stop-stat-label">Check Out</div></div>' +
            '<div class="stop-stat stat-paid"><div class="stop-stat-value sl-hotel-price" data-price-usd="' + hotel.priceUSD + '">' + fmt(hotel.priceUSD) + '</div><div class="stop-stat-label">Per Night</div></div>' +
          '</div>' +
          '<a href="' + hotel.mapsUrl + '" target="_blank" class="stop-maps-btn-hero sl-hotel-link">\uD83D\uDCCD View on Maps</a>' +
        '</div>';
      stopCards.appendChild(card);
      return;
    }

    /* ── legacy carousel fallback ── */
    var carousel = document.getElementById('stopCarousel');
    if (!carousel) return;

    var existingSlide = carousel.querySelector('[data-stop-type="hotel"]');
    if (existingSlide) {
      var hName  = existingSlide.querySelector('.sl-hotel-name');
      var hPrice = existingSlide.querySelector('.sl-hotel-price');
      var hLink  = existingSlide.querySelector('.sl-hotel-link');
      if (hName)  hName.textContent = hotel.name;
      if (hPrice) {
        hPrice.setAttribute('data-price-usd', hotel.priceUSD);
        hPrice.textContent = fmt(hotel.priceUSD);
      }
      if (hLink)  hLink.href = hotel.mapsUrl;
      return;
    }

    var imgDay2   = hotel.days[0];
    var bgImg2    = 'images/day' + imgDay2 + '/header.jpg';
    var dotsEl   = document.getElementById('carouselDots');
    var dotCount = dotsEl ? dotsEl.querySelectorAll('.carousel-dot').length : 0;
    var bottom   = carousel.querySelector('.carousel-bottom');
    if (!bottom) return;

    var slide = document.createElement('div');
    slide.className = 'carousel-slide highlight sl-hotel-injected';
    slide.setAttribute('data-stop-type', 'hotel');
    slide.innerHTML =
      '<div class="stop-bg" style="background-image:url(\'' + bgImg2 + '\')"></div>' +
      '<div class="stop-gradient"></div>' +
      '<div class="stop-panel">' +
        '<div class="stop-header-row">' +
          '<span class="stop-icon-pill">\uD83C\uDFE8</span>' +
          '<span class="tag tag-book">\u2713 Booked &middot; ' + hotel.nightLabel + '</span>' +
        '</div>' +
        '<h3 class="stop-title sl-hotel-name">' + hotel.name + '</h3>' +
        '<div class="stop-footer">' +
          '<div class="stop-stats-row">' +
            '<div class="stop-stat"><div class="stop-stat-value">' + hotel.checkIn + '</div><div class="stop-stat-label">Check In</div></div>' +
            '<div class="stop-stat"><div class="stop-stat-value">' + hotel.checkOut + '</div><div class="stop-stat-label">Check Out</div></div>' +
            '<div class="stop-stat stat-paid"><div class="stop-stat-value sl-hotel-price" data-price-usd="' + hotel.priceUSD + '">' + fmt(hotel.priceUSD) + '</div><div class="stop-stat-label">Per Night</div></div>' +
          '</div>' +
          '<a href="' + hotel.mapsUrl + '" target="_blank" class="stop-maps-btn-hero sl-hotel-link">\uD83D\uDCCD View on Maps</a>' +
        '</div>' +
      '</div>';
    bottom.parentNode.insertBefore(slide, bottom);

    if (dotsEl) {
      var dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.setAttribute('data-idx', dotCount);
      dot.setAttribute('aria-label', 'Hotel');
      dotsEl.appendChild(dot);
    }
  }

  /* ── main sync entry point ── */

  function syncDayPage() {
    var hotels = load();
    var day    = getPageDay();
    if (!day) return;
    if (day === 1) {
      syncDay1(hotels);
    } else if (day >= 2 && day <= 6) {
      syncDay(day, hotels);
    }
  }

  /* ── listen for changes from other tabs ── */

  win.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY) syncDayPage();
  });

  document.addEventListener('sl:hotelsChanged', function () {
    syncDayPage();
  });

  /* ── public API ── */

  win.HotelData = {
    get:   load,
    save:  save,
    reset: reset
  };

  /* ── auto-sync on load ── */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncDayPage);
  } else {
    syncDayPage();
  }

}(window));
