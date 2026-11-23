/**
 * InstaCalc Arabic Number to Words (Tafqeet - تفقيط) Engine
 * Grammatical conversion of numeric currency amounts into Arabic words.
 * Supports SAR, AED, KWD, QAR, BHD, OMR, EGP, USD, EUR.
 */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const engine = factory();
    root.tafqeet = engine;
    // Some Arabic pages call arTafqeet.tafqeet(...); expose both shapes.
    root.arTafqeet = { tafqeet: engine };
  }
})(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  const ONES = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
  const ONES_FEMININE = ['', 'واحدة', 'اثنتان', 'ثلاث', 'أربع', 'خمس', 'ست', 'سبع', 'ثمان', 'تسع'];
  const TEENS = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const TENS = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const HUNDREDS = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

  // Scale nouns. `twoConstruct` / `manyConstruct` are used when the scale is
  // the last counted noun before the currency (e.g. «خمسة وعشرون ألف ريال»).
  const SCALES = {
    1: { one: 'ألف', two: 'ألفان', twoConstruct: 'ألفا', few: 'آلاف', many: 'ألفاً', manyConstruct: 'ألف' },
    2: { one: 'مليون', two: 'مليونان', twoConstruct: 'مليونا', few: 'ملايين', many: 'مليوناً', manyConstruct: 'مليون' },
    3: { one: 'مليار', two: 'ملياران', twoConstruct: 'مليارا', few: 'مليارات', many: 'ملياراً', manyConstruct: 'مليار' },
    4: { one: 'تريليون', two: 'تريليونان', twoConstruct: 'تريليونا', few: 'تريليونات', many: 'تريليوناً', manyConstruct: 'تريليون' }
  };

  const CURRENCY_INFO = {
    SAR: { single: 'ريال سعودي', dual: 'ريالان سعوديان', plural: 'ريالات سعودية', singleSub: 'هللة', dualSub: 'هللتان', pluralSub: 'هللات', subDecimals: 2 },
    AED: { single: 'درهم إماراتي', dual: 'درهمان إماراتيان', plural: 'دراهم إماراتية', singleSub: 'فلس', dualSub: 'فلسان', pluralSub: 'فلسات', subDecimals: 2 },
    KWD: { single: 'دينار كويتي', dual: 'ديناران كويتيان', plural: 'دنانير كويتية', singleSub: 'فلس', dualSub: 'فلسان', pluralSub: 'فلسات', subDecimals: 3 },
    QAR: { single: 'ريال قطري', dual: 'ريالان قطريان', plural: 'ريالات قطرية', singleSub: 'درهم', dualSub: 'درهمان', pluralSub: 'دراهم', subDecimals: 2 },
    BHD: { single: 'دينار بحريني', dual: 'ديناران بحرينيان', plural: 'دنانير بحرينية', singleSub: 'فلس', dualSub: 'فلسان', pluralSub: 'فلسات', subDecimals: 3 },
    OMR: { single: 'ريال عماني', dual: 'ريالان عمانيان', plural: 'ريالات عمانية', singleSub: 'بيسة', dualSub: 'بيستان', pluralSub: 'بيسات', subDecimals: 3 },
    EGP: { single: 'جنيه مصري', dual: 'جنيهان مصريان', plural: 'جنيهات مصرية', singleSub: 'قرش', dualSub: 'قرشان', pluralSub: 'قروش', subDecimals: 2 },
    USD: { single: 'دولار أمريكي', dual: 'دولاران أمريكيان', plural: 'دولارات أمريكية', singleSub: 'سنت', dualSub: 'سنتان', pluralSub: 'سنتات', subDecimals: 2 },
    EUR: { single: 'يورو', dual: 'يوروان', plural: 'يوروهات', singleSub: 'سنت', dualSub: 'سنتان', pluralSub: 'سنتات', subDecimals: 2 }
  };

  /**
   * Converts 0–999.
   * `construct` switches the dual hundred to its construct form (مئتا) when it
   * is followed by a scale noun or the currency.
   */
  function convertChunk(n, construct) {
    if (n === 0) return '';
    let result = '';
    const h = Math.floor(n / 100);
    const rem = n % 100;
    const t = Math.floor(rem / 10);
    const o = rem % 10;

    if (h > 0) {
      // «مئتا» is construct only when the hundred stands alone (200, 200k).
      // With a remainder (229) the normal «مئتان» is required.
      result += (h === 2 && construct && rem === 0) ? 'مئتا' : HUNDREDS[h];
    }

    if (rem > 0) {
      if (h > 0) result += ' و';
      if (rem < 10) {
        result += ONES[rem];
      } else if (rem >= 10 && rem < 20) {
        result += TEENS[rem - 10];
      } else {
        if (o > 0) {
          result += ONES[o] + ' و';
        }
        result += TENS[t];
      }
    }
    return result;
  }

  /**
   * Builds the scale phrase for a group (thousands, millions, …).
   * `isFinal` means this group is the last counted noun before the currency.
   */
  function getScaleName(groupIndex, value, isFinal) {
    const scale = SCALES[groupIndex];
    if (!scale) return convertChunk(value, isFinal);
    if (value === 1) return scale.one;
    if (value === 2) return isFinal ? scale.twoConstruct : scale.two;
    if (value >= 3 && value <= 10) return convertChunk(value, true) + ' ' + scale.few;
    return convertChunk(value, isFinal) + ' ' + (isFinal ? scale.manyConstruct : scale.many);
  }

  /**
   * Converts the integer part. When `beforeCurrency` is true, the last scale
   * or hundred is put in the construct state so it can govern the currency.
   */
  function convertInteger(number, beforeCurrency) {
    if (number === 0) return 'صفر';
    const chunks = [];
    let temp = Math.abs(Math.floor(number));

    while (temp > 0) {
      chunks.push(temp % 1000);
      temp = Math.floor(temp / 1000);
    }

    // The LOWEST non-zero group governs the currency (group 0 = units).
    let lastNonZero = 0;
    for (let i = 0; i < chunks.length; i++) {
      if (chunks[i] > 0) { lastNonZero = i; break; }
    }

    const parts = [];
    for (let i = chunks.length - 1; i >= 0; i--) {
      const chunk = chunks[i];
      if (chunk === 0) continue;
      const isFinal = Boolean(beforeCurrency) && i === lastNonZero;
      if (i === 0) {
        parts.push(convertChunk(chunk, isFinal));
      } else {
        parts.push(getScaleName(i, chunk, isFinal));
      }
    }

    return parts.join(' و');
  }

  /** «ريال سعودي» → «ريالاً سعودياً»; «دينار كويتي» → «ديناراً كويتياً». */
  function toAccusative(form) {
    if (!form || form.startsWith('يورو')) return form;
    const words = form.split(' ');
    words[0] = words[0] + 'اً';
    if (words[1] && words[1].endsWith('ي')) {
      words[1] = words[1].slice(0, -1) + 'ياً';
    }
    return words.join(' ');
  }

  /**
   * Picks the currency form from the last counted part of the number:
   * 1 → singular, 2 → dual, 3–10 → plural, 11–99 → accusative singular,
   * 100 / exact scale → singular genitive.
   */
  function currencyFor(intPart, cur) {
    if (intPart === 1) return cur.single;
    if (intPart === 2) return cur.dual;
    const lastChunk = intPart % 1000;
    const lastPart = lastChunk === 0 ? 0 : (lastChunk % 100 === 0 ? 100 : lastChunk % 100);
    if (lastPart === 0 || lastPart === 1 || lastPart === 100) return cur.single;
    if (lastPart === 2) return cur.dual;
    if (lastPart >= 3 && lastPart <= 10) return cur.plural;
    return toAccusative(cur.single);
  }

  function tafqeet(amount, currencyCode, prefixWithFaqat = true) {
    const num = Number(amount);
    if (isNaN(num)) return '';

    const cur = CURRENCY_INFO[currencyCode] || CURRENCY_INFO.SAR;
    const isNegative = num < 0;
    const absVal = Math.abs(num);

    const intPart = Math.floor(absVal);
    const subFactor = Math.pow(10, cur.subDecimals);
    const subPart = Math.round((absVal - intPart) * subFactor);

    let text = '';
    if (intPart === 1) {
      text = cur.single;
    } else if (intPart === 2) {
      text = cur.dual;
    } else if (intPart > 2) {
      text = convertInteger(intPart, true) + ' ' + currencyFor(intPart, cur);
    }

    // Append fractions (sub-units)
    if (subPart > 0) {
      let subText = convertInteger(subPart, true);
      if (subPart === 1) subText = cur.singleSub;
      else if (subPart === 2) subText = cur.dualSub;
      else if (subPart >= 3 && subPart <= 10) subText += ' ' + cur.pluralSub;
      else subText += ' ' + cur.singleSub;

      text = text ? text + ' و' + subText : subText;
    }

    if (!text) text = 'صفر ' + cur.single;

    let result = text.trim();
    if (prefixWithFaqat) {
      result = 'فقط ' + result + ' لا غير';
    }
    if (isNegative) {
      result = 'سالب ' + result;
    }

    return result;
  }

  return tafqeet;
});
