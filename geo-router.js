/**
 * InstaCalc Intelligent Geolocation & Regional Router
 * Automatically routes users to their native regional edition:
 * - India -> Root (/)
 * - Japan -> Japanese (/ja/)
 * - Russia / CIS -> Russian (/ru/)
 * - Korea -> Korean (/ko/)
 * - USA & ALL OTHER COUNTRIES -> USA (/us/)
 *
 * Honors manual user selection (localStorage) and bypasses search engine crawlers.
 */
(function () {
  'use strict';

  function detectRegion() {
    // 1. Check explicit user preference
    try {
      var saved = localStorage.getItem('user_lang');
      if (saved === 'in' || saved === 'en' || saved === 'india') return 'in';
      if (saved === 'us' || saved === 'usa') return 'us';
      if (saved === 'ja' || saved === 'japan') return 'ja';
      if (saved === 'ru' || saved === 'russia') return 'ru';
      if (saved === 'ko' || saved === 'korea') return 'ko';
    } catch (e) {}

    // 2. Bypass Search Engine Bots & Crawlers (SEO Safety)
    var ua = (navigator.userAgent || '').toLowerCase();
    if (/bot|googlebot|bingbot|crawler|spider|robot|crawling|lighthouse|headless/i.test(ua)) {
      return 'none';
    }

    // 3. Hardware & Browser Timezone
    var tz = '';
    try {
      tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase();
    } catch (e) {}

    // 4. Browser Languages
    var langs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || navigator.userLanguage || ''];
    var primaryLang = (langs[0] || '').toLowerCase();
    var allLangs = langs.map(function(l) { return (l || '').toLowerCase(); }).join(',');

    // A. Japan Check
    if (tz === 'asia/tokyo' || tz.indexOf('tokyo') !== -1 || primaryLang.indexOf('ja') === 0 || allLangs.indexOf('ja-jp') !== -1) {
      return 'ja';
    }

    // B. Korea Check
    if (tz === 'asia/seoul' || tz.indexOf('seoul') !== -1 || primaryLang.indexOf('ko') === 0 || allLangs.indexOf('ko-kr') !== -1) {
      return 'ko';
    }

    // C. Russia & CIS Check
    var ruTimezones = [
      'europe/moscow', 'europe/samara', 'europe/volgograd', 'europe/saratov', 'europe/ulyanovsk',
      'europe/kirov', 'europe/astrakhan', 'asia/yekaterinburg', 'asia/omsk', 'asia/novosibirsk',
      'asia/barnaul', 'asia/tomsk', 'asia/novokuznetsk', 'asia/krasnoyarsk', 'asia/irkutsk',
      'asia/chita', 'asia/yakutsk', 'asia/khandyga', 'asia/vladivostok', 'asia/ust-nera',
      'asia/magadan', 'asia/sakhalin', 'asia/srednekolymsk', 'asia/kamchatka', 'asia/anadyr',
      'europe/kaliningrad', 'europe/minsk', 'asia/almaty', 'asia/qyzylorda', 'asia/qostanay',
      'asia/aqtobe', 'asia/aqtau', 'asia/atyrau', 'asia/oral', 'asia/bishkek', 'asia/tashkent',
      'asia/dushanbe', 'asia/ashgabat', 'asia/yerevan', 'asia/baku', 'europe/chisinau'
    ];
    if (ruTimezones.indexOf(tz) !== -1 || primaryLang.indexOf('ru') === 0 || primaryLang.indexOf('be') === 0 || allLangs.indexOf('ru-ru') !== -1) {
      return 'ru';
    }

    // D. India Check
    var inLanguages = ['hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'pa', 'ml', 'ur', 'or', 'as'];
    var isIndianLang = inLanguages.some(function(l) {
      return primaryLang.indexOf(l) === 0 || allLangs.indexOf(l + '-in') !== -1;
    });
    if (tz === 'asia/kolkata' || tz === 'asia/calcutta' || tz === 'ist' || isIndianLang || primaryLang === 'en-in' || allLangs.indexOf('en-in') !== -1) {
      return 'in';
    }

    // E. USA and ALL OTHER COUNTRIES -> 'us'
    return 'us';
  }

  window.__icDetectUserRegion = detectRegion;

  // Execute routing if on landing index.html
  var path = window.location.pathname.replace(/\\/g, '/');
  var isRootIndex = (path === '/' || path.endsWith('/index.html')) &&
                    path.indexOf('/us/') === -1 &&
                    path.indexOf('/ja/') === -1 &&
                    path.indexOf('/ru/') === -1 &&
                    path.indexOf('/ko/') === -1;

  if (isRootIndex) {
    var targetRegion = detectRegion();
    if (targetRegion === 'us') {
      window.location.replace('./us/index.html');
    } else if (targetRegion === 'ja') {
      window.location.replace('./ja/index.html');
    } else if (targetRegion === 'ru') {
      window.location.replace('./ru/index.html');
    } else if (targetRegion === 'ko') {
      window.location.replace('./ko/index.html');
    }
    // If 'in' or 'none', stay on root!
  }
})();
