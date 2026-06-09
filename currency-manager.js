(function() {
  const listeners = [];
  
  let locale = 'en-IN';
  let currency = 'INR';
  let symbol = '₹';
  
  const path = window.location.pathname;
  if (path.includes('/ja/')) {
    locale = 'ja-JP';
    currency = 'JPY';
    symbol = '¥';
  } else if (path.includes('/ko/')) {
    locale = 'ko-KR';
    currency = 'KRW';
    symbol = '₩';
  } else if (path.includes('/ru/')) {
    locale = 'ru-RU';
    currency = 'RUB';
    symbol = '₽';
  }
  
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  const numberFormatter = new Intl.NumberFormat(locale);

  window.currencyManager = {
    getLocale: () => locale,
    getCurrency: () => currency,
    getSymbol: () => symbol,
    formatCurrency: (value) => formatter.format(value),
    formatNumber: (value) => numberFormatter.format(Math.round(value)),
    formatWithUnits: function(value) {
      const abs = Math.abs(value);
      const sign = value < 0 ? "-" : "";
      
      if (locale === 'en-IN') {
        if (abs >= 10000000) return sign + symbol + (abs / 10000000).toFixed(2) + " Cr";
        if (abs >= 100000) return sign + symbol + (abs / 100000).toFixed(2) + " Lakh";
      } else if (locale === 'ja-JP') {
        if (abs >= 100000000) return sign + symbol + (abs / 100000000).toFixed(1) + "億円";
        if (abs >= 10000) return sign + symbol + (abs / 10000).toFixed(0) + "万円";
      } else if (locale === 'ko-KR') {
        if (abs >= 100000000) return sign + symbol + (abs / 100000000).toFixed(1) + "억";
        if (abs >= 10000) return sign + symbol + (abs / 10000).toFixed(0) + "만";
      } else if (locale === 'ru-RU') {
        if (abs >= 1000000000) return sign + (abs / 1000000000).toFixed(1) + " млрд ₽";
        if (abs >= 1000000) return sign + (abs / 1000000).toFixed(1) + " млн ₽";
        if (abs >= 1000) return sign + (abs / 1000).toFixed(0) + " тыс. ₽";
      }
      return sign + this.formatCurrency(abs);
    },
    formatCompact: function(value) {
      const abs = Math.abs(value);
      const sign = value < 0 ? "-" : "";
      
      if (locale === 'en-IN') {
        if (abs >= 10000000) return sign + (abs / 10000000).toFixed(1) + "Cr";
        if (abs >= 100000) return sign + (abs / 100000).toFixed(1) + "L";
        if (abs >= 1000) return sign + (abs / 1000).toFixed(1) + "K";
      } else if (locale === 'ja-JP') {
        if (abs >= 100000000) return sign + (abs / 100000000).toFixed(1) + "億円";
        if (abs >= 10000) return sign + (abs / 10000).toFixed(0) + "万円";
      } else if (locale === 'ko-KR') {
        if (abs >= 100000000) return sign + (abs / 100000000).toFixed(1) + "억";
        if (abs >= 10000) return sign + (abs / 10000).toFixed(0) + "만";
      } else if (locale === 'ru-RU') {
        if (abs >= 1000000000) return sign + (abs / 1000000000).toFixed(1) + " млрд ₽";
        if (abs >= 1000000) return sign + (abs / 1000000).toFixed(1) + " млн ₽";
        if (abs >= 1000) return sign + (abs / 1000).toFixed(0) + " тыс. ₽";
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
})();
