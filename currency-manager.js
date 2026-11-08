(function() {
  const listeners = [];
  
  const CURRENCY_SYMBOLS = {
    INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: 'C$', AUD: 'A$',
    AED: 'AED', SGD: 'S$', CHF: 'CHF', CNY: '¥', KRW: '₩', RUB: '₽',
    BRL: 'R$', SAR: 'SAR', MXN: 'Mex$', NZD: 'NZ$', THB: '฿', IDR: 'Rp', TRY: '₺'
  };

  const CURRENCY_LOCALES = {
    INR: 'en-IN', USD: 'en-US', EUR: 'de-DE', GBP: 'en-GB', JPY: 'ja-JP',
    CAD: 'en-CA', AUD: 'en-AU', AED: 'en-AE', SGD: 'en-SG', CHF: 'de-CH',
    CNY: 'zh-CN', KRW: 'ko-KR', RUB: 'ru-RU', BRL: 'pt-BR', SAR: 'en-SA',
    MXN: 'es-MX', NZD: 'en-NZ', THB: 'th-TH', IDR: 'id-ID', TRY: 'tr-TR'
  };

  const COUNTRY_TO_CURRENCY = {
    IN: 'INR', US: 'USD', PR: 'USD', GU: 'USD', VI: 'USD',
    GB: 'GBP', JP: 'JPY', CA: 'CAD', AU: 'AUD', AE: 'AED',
    SG: 'SGD', CH: 'CHF', LI: 'CHF', CN: 'CNY', KR: 'KRW',
    RU: 'RUB', BY: 'RUB', BR: 'BRL', SA: 'SAR', MX: 'MXN',
    NZ: 'NZD', TH: 'THB', ID: 'IDR', TR: 'TRY',
    ES: 'EUR', DE: 'EUR', FR: 'EUR', IT: 'EUR', NL: 'EUR',
    BE: 'EUR', AT: 'EUR', IE: 'EUR', PT: 'EUR', FI: 'EUR',
    GR: 'EUR', CY: 'EUR', EE: 'EUR', LV: 'EUR', LT: 'EUR',
    LU: 'EUR', MT: 'EUR', SK: 'EUR', SI: 'EUR', HR: 'EUR'
  };

  function getCurrencyForCountry(country) {
    if (!country) return 'USD';
    const c = country.trim().toUpperCase();
    const cur = COUNTRY_TO_CURRENCY[c];
    if (cur && CURRENCY_SYMBOLS[cur]) {
      return cur;
    }
    return 'USD';
  }

  function detectAutoCurrency() {
    // 1. Check cached country in session storage
    try {
      const cached = window.sessionStorage.getItem('instacalc_detected_country');
      if (cached) return getCurrencyForCountry(cached);
    } catch (e) {}

    // 2. Check browser timezone
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        if (/Calcutta|Kolkata/i.test(tz)) return 'INR';
        if (/Tokyo/i.test(tz)) return 'JPY';
        if (/Seoul/i.test(tz)) return 'KRW';
        if (/London|Belfast/i.test(tz)) return 'GBP';
        if (/Moscow|Samara|Yekaterinburg/i.test(tz)) return 'RUB';
        if (/Madrid|Canary|Berlin|Paris|Rome|Amsterdam|Brussels|Vienna|Dublin|Lisbon|Helsinki|Athens/i.test(tz)) return 'EUR';
        if (/Toronto|Vancouver|Montreal|Edmonton/i.test(tz)) return 'CAD';
        if (/Sydney|Melbourne|Brisbane|Perth|Adelaide/i.test(tz)) return 'AUD';
        if (/Dubai/i.test(tz)) return 'AED';
        if (/Riyadh/i.test(tz)) return 'SAR';
        if (/Singapore/i.test(tz)) return 'SGD';
        if (/Zurich/i.test(tz)) return 'CHF';
        if (/Shanghai|Urumqi|Beijing/i.test(tz)) return 'CNY';
        if (/Sao_Paulo|Manaus|Fortaleza|Recife/i.test(tz)) return 'BRL';
        if (/Mexico_City|Cancun|Monterrey|Tijuana/i.test(tz)) return 'MXN';
        if (/Auckland/i.test(tz)) return 'NZD';
        if (/Bangkok/i.test(tz)) return 'THB';
        if (/Jakarta/i.test(tz)) return 'IDR';
        if (/Istanbul/i.test(tz)) return 'TRY';
        if (/New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Honolulu|Detroit|Indiana/i.test(tz)) return 'USD';
      }
    } catch (e) {}

    // 3. Check navigator language region
    try {
      const lang = navigator.language || (navigator.languages && navigator.languages[0]) || '';
      const parts = lang.split('-');
      if (parts.length > 1) {
        const country = parts[1].toUpperCase();
        return getCurrencyForCountry(country);
      }
    } catch (e) {}

    // Default fallback is dollar if country not in list
    return 'USD';
  }

  let defaultLocale = 'en-IN';
  let defaultCurrency = 'INR';
  let defaultSymbol = '₹';
  
  const path = window.location.pathname;
  if (path.includes('/us/')) {
    defaultLocale = 'en-US';
    defaultCurrency = 'USD';
    defaultSymbol = '$';
  } else if (path.includes('/ja/')) {
    defaultLocale = 'ja-JP';
    defaultCurrency = 'JPY';
    defaultSymbol = '¥';
  } else if (path.includes('/ko/')) {
    defaultLocale = 'ko-KR';
    defaultCurrency = 'KRW';
    defaultSymbol = '₩';
  } else if (path.includes('/ru/')) {
    defaultLocale = 'ru-RU';
    defaultCurrency = 'RUB';
    defaultSymbol = '₽';
  } else if (path.includes('/es/')) {
    defaultLocale = 'es-ES';
    defaultCurrency = 'EUR';
    defaultSymbol = '€';
  }

  let locale = defaultLocale;
  let currency = defaultCurrency;
  let symbol = defaultSymbol;

  function updateActiveCurrency() {
    try {
      const stored = window.localStorage.getItem('user_currency');
      if (stored && stored !== 'AUTO' && CURRENCY_SYMBOLS[stored]) {
        currency = stored;
        symbol = CURRENCY_SYMBOLS[stored];
        locale = CURRENCY_LOCALES[stored] || defaultLocale;
      } else {
        const detected = detectAutoCurrency();
        currency = detected;
        symbol = CURRENCY_SYMBOLS[detected] || '$';
        locale = CURRENCY_LOCALES[detected] || 'en-US';
      }
    } catch (e) {
      currency = 'USD';
      symbol = '$';
      locale = 'en-US';
    }
  }

  updateActiveCurrency();

  // Async GeoIP detection
  if (typeof window !== 'undefined') {
    try {
      const cached = window.sessionStorage.getItem('instacalc_detected_country');
      if (!cached) {
        fetch('https://api.country.is/')
          .then(res => res.json())
          .then(data => {
            if (data && data.country) {
              window.sessionStorage.setItem('instacalc_detected_country', data.country);
              updateActiveCurrency();
              window.currencyManager.triggerChange();
            }
          })
          .catch(() => {});
      }
    } catch (e) {}
  }

  function getFormatter() {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  function getNumberFormatter() {
    return new Intl.NumberFormat(locale);
  }

  window.currencyManager = {
    getLocale: () => locale,
    getCurrency: () => currency,
    getSymbol: () => symbol,
    setCurrency: (code) => {
      try {
        if (code === 'AUTO') {
          window.localStorage.removeItem('user_currency');
        } else {
          window.localStorage.setItem('user_currency', code);
        }
      } catch (e) {}
      updateActiveCurrency();
      window.dispatchEvent(new CustomEvent('instacalc:currency-change', { detail: code }));
      window.currencyManager.triggerChange();
    },
    formatCurrency: (value) => getFormatter().format(value),
    formatNumber: (value) => getNumberFormatter().format(Math.round(value)),
    formatWithUnits: function(value) {
      const abs = Math.abs(value);
      const sign = value < 0 ? "-" : "";
      
      if (currency === 'INR') {
        if (abs >= 10000000) return sign + symbol + (abs / 10000000).toFixed(2) + " Cr";
        if (abs >= 100000) return sign + symbol + (abs / 100000).toFixed(2) + " Lakh";
      } else if (currency === 'JPY') {
        if (abs >= 100000000) return sign + symbol + (abs / 100000000).toFixed(1) + "億円";
        if (abs >= 10000) return sign + symbol + (abs / 10000).toFixed(0) + "万円";
      } else if (currency === 'KRW') {
        if (abs >= 100000000) return sign + symbol + (abs / 100000000).toFixed(1) + "억원";
        if (abs >= 10000) return sign + symbol + (abs / 10000).toFixed(0) + "만원";
      } else if (currency === 'RUB') {
        if (abs >= 1000000000) return sign + (abs / 1000000000).toFixed(1) + " млрд ₽";
        if (abs >= 1000000) return sign + (abs / 1000000).toFixed(1) + " млн ₽";
        if (abs >= 1000) return sign + (abs / 1000).toFixed(0) + " тыс. ₽";
      }
      return sign + this.formatCurrency(abs);
    },
    formatCompact: function(value) {
      const abs = Math.abs(value);
      const sign = value < 0 ? "-" : "";
      
      if (currency === 'INR') {
        if (abs >= 10000000) return sign + (abs / 10000000).toFixed(1) + "Cr";
        if (abs >= 100000) return sign + (abs / 100000).toFixed(1) + "L";
        if (abs >= 1000) return sign + (abs / 1000).toFixed(1) + "K";
      } else if (currency === 'JPY') {
        if (abs >= 100000000) return sign + (abs / 100000000).toFixed(1) + "億円";
        if (abs >= 10000) return sign + (abs / 10000).toFixed(0) + "万円";
      } else if (currency === 'KRW') {
        if (abs >= 100000000) return sign + (abs / 100000000).toFixed(1) + "억원";
        if (abs >= 10000) return sign + (abs / 10000).toFixed(0) + "만원";
      } else if (currency === 'RUB') {
        if (abs >= 1000000000) return sign + (abs / 1000000000).toFixed(1) + " млрд ₽";
        if (abs >= 1000000) return sign + (abs / 1000000).toFixed(1) + " млн ₽";
        if (abs >= 1000) return sign + (abs / 1000).toFixed(0) + " тыс. ₽";
      } else {
        if (abs >= 1e9) return sign + symbol + (abs / 1e9).toFixed(1) + "B";
        if (abs >= 1e6) return sign + symbol + (abs / 1e6).toFixed(1) + "M";
        if (abs >= 1e3) return sign + symbol + (abs / 1e3).toFixed(1) + "K";
      }
      return sign + Math.round(abs).toLocaleString(locale);
    },
    onChange: function(callback) {
      if (typeof callback === 'function') {
        listeners.push(callback);
      }
    },
    triggerChange: function() {
      listeners.forEach(cb => cb());
    }
  };

  window.addEventListener('storage', (e) => {
    if (e.key === 'user_currency') {
      updateActiveCurrency();
      window.currencyManager.triggerChange();
    }
  });
  window.addEventListener('instacalc:currency-change', () => {
    updateActiveCurrency();
    window.currencyManager.triggerChange();
  });
})();
