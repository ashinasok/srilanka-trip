/**
 * currency.js — Sri Lanka Trip 2026
 * ─────────────────────────────────────────────────────────────
 *  • Base currency : USD (all data-price-usd attributes are USD)
 *  • API           : https://open.er-api.com/v6/latest/USD  (free, no key)
 *  • Cache         : localStorage, refreshed every 4 hours
 *  • Supported     : INR (₹)  ·  USD ($)  ·  LKR (Rs)
 *  • Pref key      : 'sl-currency'  (shared with interactions.js)
 *
 *  HTML usage
 *  ──────────
 *  Single price  :  <el data-price-usd="7.75">~₹645</el>
 *  Range price   :  <el data-price-usd="4" data-price-usd-max="9">₹350–750</el>
 *  With suffix   :  <el data-price-usd="14.80" data-price-suffix="/night">~₹1,236/night</el>
 */

(function (global) {
  'use strict';

  /* ── Config ───────────────────────────────────────────────── */
  var API_URL   = 'https://open.er-api.com/v6/latest/USD';
  var CACHE_KEY = 'sl2026_xrates';
  var CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours
  var PREF_KEY  = 'sl-currency';       // shared key with interactions.js

  /* Conservative fallback rates (updated Mar 2026 approx) */
  var FALLBACK  = { USD: 1, INR: 83.5, LKR: 302 };

  var META = {
    usd : { sym: '$',   decimals: 2 },
    inr : { sym: '₹',  decimals: 0 },
    lkr : { sym: 'Rs ', decimals: 0 }
  };

  /* ── State ────────────────────────────────────────────────── */
  var _rates    = { USD: 1, INR: FALLBACK.INR, LKR: FALLBACK.LKR };
  var _currency = (function () {
    var v = localStorage.getItem(PREF_KEY) || 'inr';
    return META[v] ? v : 'inr';
  }());

  /* ── Rate loading ─────────────────────────────────────────── */
  function _loadCache() {
    try {
      var c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (c && (Date.now() - c.ts) < CACHE_TTL && c.rates) {
        _rates = c.rates;
        return true;
      }
    } catch (e) {}
    return false;
  }

  function _saveCache(r) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), rates: r })); }
    catch (e) {}
  }

  function _fetchRates(cb) {
    if (_loadCache()) { if (cb) cb(); return; }

    fetch(API_URL)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.rates) {
          var r = { USD: 1 };
          /* normalise keys to uppercase */
          Object.keys(d.rates).forEach(function (k) { r[k.toUpperCase()] = d.rates[k]; });
          _rates = r;
          _saveCache(r);
        }
        if (cb) cb();
      })
      .catch(function () {
        if (!_loadCache()) _rates = { USD: 1, INR: FALLBACK.INR, LKR: FALLBACK.LKR };
        if (cb) cb();
      });
  }

  /* ── Conversion ───────────────────────────────────────────── */
  function _rate() {
    var c = _currency.toUpperCase();
    return _rates[c] || FALLBACK[c] || 1;
  }

  /** Convert a USD amount to the current currency */
  function convert(usdAmount) {
    return (+usdAmount) * _rate();
  }

  /** Format a single USD amount → display string */
  function format(usdAmount) {
    if (usdAmount == null || isNaN(+usdAmount)) return '—';
    var m   = META[_currency] || META.inr;
    var val = convert(+usdAmount);
    var rounded = m.decimals === 0
      ? Math.round(val)
      : Math.round(val * 100) / 100;
    return '~' + m.sym + rounded.toLocaleString('en-IN', { maximumFractionDigits: m.decimals });
  }

  /** Format a USD range → display string (no ~ prefix for ranges) */
  function formatRange(usdMin, usdMax) {
    var m  = META[_currency] || META.inr;
    var lo = Math.round(convert(+usdMin));
    var hi = Math.round(convert(+usdMax));
    return m.sym + lo.toLocaleString('en-IN') + '–' + hi.toLocaleString('en-IN');
  }

  /* ── DOM update ───────────────────────────────────────────── */
  function applyAll() {
    document.querySelectorAll('[data-price-usd]').forEach(function (el) {
      var usd    = parseFloat(el.getAttribute('data-price-usd'));
      var max    = el.getAttribute('data-price-usd-max');
      var suffix = el.getAttribute('data-price-suffix') || '';
      if (isNaN(usd)) return;
      el.textContent = (max ? formatRange(usd, parseFloat(max)) : format(usd)) + suffix;
    });

    /* Notify other modules (e.g. initDaySpend totals are already data-price-usd) */
    try {
      document.dispatchEvent(new CustomEvent('sl:currencyChange', {
        detail: { currency: _currency }
      }));
    } catch (e) {}
  }

  /* ── Public API ───────────────────────────────────────────── */
  function setCurrency(c) {
    c = (c || 'inr').toLowerCase();
    if (!META[c]) return;
    _currency = c;
    try { localStorage.setItem(PREF_KEY, c); } catch (e) {}
    applyAll();
  }

  function getCurrency() { return _currency; }

  function getSymbol(c) {
    return (META[(c || _currency).toLowerCase()] || META.inr).sym;
  }

  /* ── Boot ─────────────────────────────────────────────────── */
  function _init() {
    _fetchRates(function () { applyAll(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

  /* Export */
  global.CurrencyManager = {
    setCurrency : setCurrency,
    getCurrency : getCurrency,
    getSymbol   : getSymbol,
    format      : format,
    formatRange : formatRange,
    convert     : convert,
    applyAll    : applyAll
  };

}(window));
