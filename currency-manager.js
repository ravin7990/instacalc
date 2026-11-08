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
        locale = defaultLocale;
        currency = defaultCurrency;
        symbol = defaultSymbol;
      }
    } catch (e) {
      locale = defaultLocale;
      currency = defaultCurrency;
      symbol = defaultSymbol;
    }
  }

  updateActiveCurrency();

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
        if (abs >= 100000000) return sign + symbol + (abs / 100000000).toFixed(1) + "억";
        if (abs >= 10000) return sign + symbol + (abs / 10000).toFixed(0) + "만";
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
        if (abs >= 100000000) return sign + (abs / 100000000).toFixed(1) + "억";
        if (abs >= 10000) return sign + (abs / 10000).toFixed(0) + "만";
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
