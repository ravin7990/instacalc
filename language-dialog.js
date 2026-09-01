/**
 * InstaCalc Global Language Selection Dialog Module
 * Provides a modern, accessible, responsive dialog box to switch languages and regional editions across all pages.
 */
(function () {
  if (window.__icLangModalInitialized) return;
  window.__icLangModalInitialized = true;

  // Determine path depth relative to root
  function getRootPrefix() {
    var path = window.location.pathname.replace(/\\/g, '/');
    if (path.indexOf('/ko/moretools/') !== -1) return '../../';
    if (path.indexOf('/ja/') !== -1 || path.indexOf('/ru/') !== -1 || path.indexOf('/us/') !== -1 ||
        path.indexOf('/duration/') !== -1 || path.indexOf('/moretools/') !== -1 || path.indexOf('/ko/') !== -1) {
      return '../';
    }
    return '';
  }

  var rootPrefix = getRootPrefix();

  // Detect current language / region
  function getCurrentLang() {
    var path = window.location.pathname.toLowerCase().replace(/\\/g, '/');
    if (path.indexOf('/ja/') !== -1) return 'ja';
    if (path.indexOf('/ru/') !== -1) return 'ru';
    if (path.indexOf('/us/') !== -1) return 'us';
    if (path.indexOf('/ko/') !== -1) return 'ko';
    
    var saved = localStorage.getItem('user_lang');
    if (saved === 'ja' || saved === 'ru' || saved === 'us' || saved === 'ko') return saved;
    return 'in';
  }

  var currentLang = getCurrentLang();

  // Available Languages and Editions Data
  var LANGUAGES = [
    {
      code: 'in',
      storageCode: 'en',
      flag: '🇮🇳',
      shortLabel: 'India (EN)',
      name: 'English (India & Global)',
      nativeName: 'English · India (₹ INR)',
      badge: 'Default / Global',
      desc: 'Indian tax rules, EPF, PPF, GST, SIP, EMI, Loan calculators and Lakhs/Crores format',
      folder: '',
      homeFile: 'index.html'
    },
    {
      code: 'us',
      storageCode: 'us',
      flag: '🇺🇸',
      shortLabel: 'US (EN)',
      name: 'English (United States)',
      nativeName: 'English · United States ($ USD)',
      badge: 'US Edition',
      desc: 'US tax models, 401(k), Roth IRA, CD, Mortgages, Sales Tax and US imperial units',
      folder: 'us/',
      homeFile: 'us/index.html'
    },
    {
      code: 'ja',
      storageCode: 'ja',
      flag: '🇯🇵',
      shortLabel: '日本語',
      name: '日本語 (Japanese)',
      nativeName: '日本語 · 日本 (¥ JPY)',
      badge: '日本語版',
      desc: '日本市場向けの金融、投資、ローン、年齢、日数、時間、各種実用計算ツール',
      folder: 'ja/',
      homeFile: 'ja/index.html'
    },
    {
      code: 'ru',
      storageCode: 'ru',
      flag: '🇷🇺',
      shortLabel: 'Русский',
      name: 'Русский (Russian)',
      nativeName: 'Русский · Россия (₽ RUB)',
      badge: 'Русская версия',
      desc: 'Финансовые, инвестиционные, кредитные, возрастные и временные калькуляторы',
      folder: 'ru/',
      homeFile: 'ru/index.html'
    },
    {
      code: 'ko',
      storageCode: 'ko',
      flag: '🇰🇷',
      shortLabel: '한국어',
      name: '한국어 (Korean)',
      nativeName: '한국어 · 대한민국 (₩ KRW)',
      badge: '한국어판',
      desc: '만 나이, 삼각법, 콘크리트, 대각선 및 날짜 시간 유틸리티 계산기',
      folder: 'ko/',
      homeFile: 'ko/index.html'
    }
  ];

  // Resolve target URL when switching language
  function getTargetUrl(targetLangCode) {
    var target = null;
    for (var i = 0; i < LANGUAGES.length; i++) {
      if (LANGUAGES[i].code === targetLangCode) {
        target = LANGUAGES[i];
        break;
      }
    }
    if (!target) return rootPrefix + 'index.html';

    var pathSegments = window.location.pathname.replace(/\\/g, '/').split('/').filter(Boolean);
    var currentFilename = pathSegments.pop() || 'index.html';

    if (target.code === currentLang) return null;

    if (target.code === 'in') {
      if (currentFilename === 'index.html') return rootPrefix + 'index.html';
      var usToRootMap = {
        'mortgage-calculator.html': 'emicalculator.html',
        'compound-interest-calculator.html': 'compoundinterest.html',
        'simple-interest-calculator.html': 'simpleinterestcalculator.html',
        'age-calculator.html': 'duration/agecalculator.html',
        'days-calculator.html': 'duration/dayscalculator.html',
        'hour-calculator.html': 'duration/hourcalculator.html',
        'time-duration-calculator.html': 'duration/timedurationcalculator.html',
        'time-zone-calculator.html': 'duration/timezonecalculator.html',
        'concrete-calculator.html': 'moretools/concretecalculator.html',
        'diagonal-calculator.html': 'moretools/diagonalcalculator.html',
        'triangle-calculator.html': 'moretools/trignometrycalculator.html',
        'gallon-to-liter-calculator.html': 'gallontolitercalculator.html',
        'retirement-calculator.html': 'retirementcalculator.html'
      };
      if (usToRootMap[currentFilename]) {
        return rootPrefix + usToRootMap[currentFilename];
      }
      return rootPrefix + currentFilename;
    }

    if (target.code === 'ja') {
      var jaPages = ['aboutus.html', 'cagrcalculator.html', 'catagecalculator.html', 'compoundinterest.html', 'contactus.html', 'emicalculator.html', 'epfcalculator.html', 'fdcalculator.html', 'gratuitycalculator.html', 'gstcalculator.html', 'index.html', 'mutualfundreturncalculator.html', 'npscalculator.html', 'ppfcalculator.html', 'privacypolicy.html', 'rdcalculator.html', 'retirementcalculator.html', 'simpleinterestcalculator.html', 'sipcalculator.html', 'sipcalculatorlumpsump.html', 'swpcalculator.html'];
      if (jaPages.indexOf(currentFilename) !== -1) {
        return rootPrefix + 'ja/' + currentFilename;
      }
      return rootPrefix + 'ja/index.html';
    }

    if (target.code === 'ru') {
      var ruPages = ['aboutus.html', 'cagrcalculator.html', 'catagecalculator.html', 'compoundinterest.html', 'contactus.html', 'emicalculator.html', 'epfcalculator.html', 'fdcalculator.html', 'gratuitycalculator.html', 'gstcalculator.html', 'index.html', 'mutualfundreturncalculator.html', 'npscalculator.html', 'ppfcalculator.html', 'privacypolicy.html', 'rdcalculator.html', 'retirementcalculator.html', 'sipcalculator.html'];
      if (ruPages.indexOf(currentFilename) !== -1) {
        return rootPrefix + 'ru/' + currentFilename;
      }
      return rootPrefix + 'ru/index.html';
    }

    if (target.code === 'us') {
      var rootToUsMap = {
        'index.html': 'index.html',
        'emicalculator.html': 'mortgage-calculator.html',
        'compoundinterest.html': 'compound-interest-calculator.html',
        'simpleinterestcalculator.html': 'simple-interest-calculator.html',
        'agecalculator.html': 'age-calculator.html',
        'dayscalculator.html': 'days-calculator.html',
        'hourcalculator.html': 'hour-calculator.html',
        'timedurationcalculator.html': 'time-duration-calculator.html',
        'timezonecalculator.html': 'time-zone-calculator.html',
        'concretecalculator.html': 'concrete-calculator.html',
        'diagonalcalculator.html': 'diagonal-calculator.html',
        'trignometrycalculator.html': 'triangle-calculator.html',
        'gallontolitercalculator.html': 'gallon-to-liter-calculator.html',
        'retirementcalculator.html': 'retirement-calculator.html'
      };
      if (rootToUsMap[currentFilename]) {
        return rootPrefix + 'us/' + rootToUsMap[currentFilename];
      }
      return rootPrefix + 'us/index.html';
    }

    if (target.code === 'ko') {
      if (currentFilename === 'concretecalculator.html' || currentFilename === 'diagonalcalculator.html' || currentFilename === 'trignometrycalculator.html') {
        return rootPrefix + 'ko/moretools/' + currentFilename;
      }
      return rootPrefix + 'ko/index.html';
    }

    return rootPrefix + target.homeFile;
  }

  // Inject Dialog CSS Styles
  function injectStyles() {
    if (document.getElementById('ic-lang-dialog-styles')) return;
    var style = document.createElement('style');
    style.id = 'ic-lang-dialog-styles';
    style.textContent = [
      '.ic-lang-btn {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 0.45rem;',
      '  padding: 0.42rem 0.85rem;',
      '  border-radius: 10px;',
      '  background: #f1f5f9;',
      '  border: 1px solid #e2e8f0;',
      '  font-family: inherit;',
      '  font-size: 0.86rem;',
      '  font-weight: 700;',
      '  color: #0f172a;',
      '  cursor: pointer;',
      '  transition: all 0.2s ease;',
      '  min-height: 38px;',
      '  outline: none;',
      '  flex-shrink: 0;',
      '}',
      '.ic-lang-btn:hover {',
      '  background: #ffffff;',
      '  border-color: #0284c7;',
      '  color: #0369a1;',
      '  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.18);',
      '  transform: translateY(-1px);',
      '}',
      '.ic-lang-btn i.fa-globe {',
      '  color: #0284c7;',
      '  font-size: 0.95rem;',
      '}',
      '.ic-lang-btn i.ic-chevron {',
      '  font-size: 0.72rem;',
      '  color: #64748b;',
      '  transition: transform 0.2s ease;',
      '}',
      '.ic-lang-modal-backdrop {',
      '  position: fixed;',
      '  inset: 0;',
      '  background: rgba(15, 23, 42, 0.68);',
      '  backdrop-filter: blur(8px);',
      '  -webkit-backdrop-filter: blur(8px);',
      '  z-index: 999999;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  padding: 1.25rem;',
      '  opacity: 0;',
      '  visibility: hidden;',
      '  transition: opacity 0.25s ease, visibility 0.25s ease;',
      '  box-sizing: border-box;',
      '}',
      '.ic-lang-modal-backdrop.open {',
      '  opacity: 1;',
      '  visibility: visible;',
      '}',
      '.ic-lang-modal-dialog {',
      '  background: #ffffff;',
      '  border-radius: 20px;',
      '  max-width: 580px;',
      '  width: 100%;',
      '  max-height: 90vh;',
      '  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(15, 23, 42, 0.08);',
      '  overflow: hidden;',
      '  transform: scale(0.92) translateY(16px);',
      '  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);',
      '  display: flex;',
      '  flex-direction: column;',
      '  position: relative;',
      '}',
      '.ic-lang-modal-backdrop.open .ic-lang-modal-dialog {',
      '  transform: scale(1) translateY(0);',
      '}',
      '.ic-lang-modal-header {',
      '  padding: 1.5rem 1.75rem 1.25rem;',
      '  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);',
      '  border-bottom: 1px solid #e2e8f0;',
      '  display: flex;',
      '  align-items: flex-start;',
      '  justify-content: space-between;',
      '  gap: 1rem;',
      '}',
      '.ic-lang-header-text {',
      '  flex: 1;',
      '}',
      '.ic-lang-header-badge {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 0.4rem;',
      '  padding: 0.25rem 0.65rem;',
      '  background: #e0f2fe;',
      '  color: #0284c7;',
      '  border-radius: 999px;',
      '  font-size: 0.75rem;',
      '  font-weight: 800;',
      '  text-transform: uppercase;',
      '  letter-spacing: 0.05em;',
      '  margin-bottom: 0.45rem;',
      '}',
      '.ic-lang-modal-header h3 {',
      '  font-family: inherit;',
      '  font-size: 1.3rem;',
      '  font-weight: 800;',
      '  color: #0f172a;',
      '  margin: 0 0 0.25rem;',
      '  line-height: 1.2;',
      '}',
      '.ic-lang-modal-header p {',
      '  font-size: 0.88rem;',
      '  color: #475569;',
      '  margin: 0;',
      '  line-height: 1.4;',
      '}',
      '.ic-lang-modal-close {',
      '  width: 36px;',
      '  height: 36px;',
      '  border-radius: 10px;',
      '  border: 1px solid #e2e8f0;',
      '  background: #ffffff;',
      '  color: #64748b;',
      '  display: inline-flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  cursor: pointer;',
      '  font-size: 1rem;',
      '  transition: all 0.15s ease;',
      '  flex-shrink: 0;',
      '}',
      '.ic-lang-modal-close:hover {',
      '  background: #fee2e2;',
      '  border-color: #fca5a5;',
      '  color: #dc2626;',
      '  transform: scale(1.05);',
      '}',
      '.ic-lang-modal-body {',
      '  padding: 1.25rem 1.75rem;',
      '  overflow-y: auto;',
      '  display: flex;',
      '  flex-direction: column;',
      '  gap: 0.75rem;',
      '}',
      '@media (max-width: 640px) {',
      '  .ic-lang-modal-header { padding: 1.25rem 1.25rem 1rem; }',
      '  .ic-lang-modal-body { padding: 1rem 1.25rem; }',
      '}',
      '.ic-lang-option-card {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  gap: 1rem;',
      '  padding: 0.95rem 1.15rem;',
      '  background: #ffffff;',
      '  border: 1.5px solid #e2e8f0;',
      '  border-radius: 14px;',
      '  cursor: pointer;',
      '  text-align: left;',
      '  width: 100%;',
      '  transition: all 0.2s ease;',
      '  outline: none;',
      '}',
      '.ic-lang-option-card:hover {',
      '  background: #f8fafc;',
      '  border-color: #0284c7;',
      '  transform: translateY(-1px);',
      '  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.12);',
      '}',
      '.ic-lang-option-card.active {',
      '  background: #f0f9ff;',
      '  border-color: #0284c7;',
      '  box-shadow: 0 0 0 3px #e0f2fe;',
      '}',
      '.ic-lang-opt-left {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 0.95rem;',
      '  min-width: 0;',
      '}',
      '.ic-lang-opt-flag {',
      '  font-size: 1.85rem;',
      '  line-height: 1;',
      '  flex-shrink: 0;',
      '}',
      '.ic-lang-opt-meta { min-width: 0; }',
      '.ic-lang-opt-title-row {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 0.5rem;',
      '  flex-wrap: wrap;',
      '}',
      '.ic-lang-opt-name {',
      '  font-size: 1rem;',
      '  font-weight: 700;',
      '  color: #0f172a;',
      '}',
      '.ic-lang-opt-badge {',
      '  font-size: 0.72rem;',
      '  font-weight: 700;',
      '  padding: 0.15rem 0.5rem;',
      '  border-radius: 999px;',
      '  background: #f1f5f9;',
      '  color: #475569;',
      '  border: 1px solid #e2e8f0;',
      '}',
      '.ic-lang-option-card.active .ic-lang-opt-badge {',
      '  background: #dbeafe;',
      '  color: #1e40af;',
      '  border-color: #bfdbfe;',
      '}',
      '.ic-lang-opt-desc {',
      '  font-size: 0.82rem;',
      '  color: #64748b;',
      '  margin-top: 0.15rem;',
      '  line-height: 1.35;',
      '}',
      '.ic-lang-opt-right {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 0.5rem;',
      '  flex-shrink: 0;',
      '}',
      '.ic-lang-check-icon {',
      '  width: 28px;',
      '  height: 28px;',
      '  border-radius: 50%;',
      '  background: #0284c7;',
      '  color: #ffffff;',
      '  display: inline-flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  font-size: 0.85rem;',
      '}',
      '.ic-lang-arrow-icon {',
      '  color: #94a3b8;',
      '  font-size: 0.85rem;',
      '  transition: transform 0.2s ease, color 0.2s ease;',
      '}',
      '.ic-lang-option-card:hover .ic-lang-arrow-icon {',
      '  color: #0284c7;',
      '  transform: translateX(3px);',
      '}',
      '.ic-lang-modal-footer {',
      '  padding: 1rem 1.75rem;',
      '  background: #f8fafc;',
      '  border-top: 1px solid #e2e8f0;',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 0.5rem;',
      '  font-size: 0.82rem;',
      '  color: #64748b;',
      '}',
      '.ic-lang-modal-footer i {',
      '  color: #10b981;',
      '  font-size: 0.95rem;',
      '  flex-shrink: 0;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // Create Modal DOM Structure
  function createModal() {
    if (document.getElementById('icLangModal')) return;

    var modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'icLangModal';
    modalBackdrop.className = 'ic-lang-modal-backdrop';
    modalBackdrop.setAttribute('aria-hidden', 'true');
    modalBackdrop.setAttribute('role', 'dialog');
    modalBackdrop.setAttribute('aria-modal', 'true');
    modalBackdrop.setAttribute('aria-labelledby', 'icLangModalTitle');

    var optionsHtml = LANGUAGES.map(function(lang) {
      var isActive = lang.code === currentLang;
      return [
        '<button type="button" class="ic-lang-option-card ' + (isActive ? 'active' : '') + '" data-lang-code="' + lang.code + '">',
        '  <div class="ic-lang-opt-left">',
        '    <span class="ic-lang-opt-flag">' + lang.flag + '</span>',
        '    <div class="ic-lang-opt-meta">',
        '      <div class="ic-lang-opt-title-row">',
        '        <span class="ic-lang-opt-name">' + lang.name + '</span>',
        '        <span class="ic-lang-opt-badge">' + lang.nativeName + '</span>',
        '      </div>',
        '      <div class="ic-lang-opt-desc">' + lang.desc + '</div>',
        '    </div>',
        '  </div>',
        '  <div class="ic-lang-opt-right">',
        (isActive ? '    <div class="ic-lang-check-icon"><i class="fas fa-check"></i></div>' : '    <i class="fas fa-arrow-right ic-lang-arrow-icon"></i>'),
        '  </div>',
        '</button>'
      ].join('');
    }).join('');

    modalBackdrop.innerHTML = [
      '<div class="ic-lang-modal-dialog" onclick="event.stopPropagation()">',
      '  <div class="ic-lang-modal-header">',
      '    <div class="ic-lang-header-text">',
      '      <span class="ic-lang-header-badge"><i class="fas fa-globe"></i> Region & Language</span>',
      '      <h3 id="icLangModalTitle">Select Your Region & Language</h3>',
      '      <p>Choose your preferred language and regional calculation model.</p>',
      '    </div>',
      '    <button type="button" class="ic-lang-modal-close" id="icLangModalCloseBtn" aria-label="Close dialog">',
      '      <i class="fas fa-xmark"></i>',
      '    </button>',
      '  </div>',
      '  <div class="ic-lang-modal-body">',
      optionsHtml,
      '  </div>',
      '  <div class="ic-lang-modal-footer">',
      '    <i class="fas fa-circle-check"></i>',
      '    <span>Your selection will be remembered across all InstaCalc tools.</span>',
      '  </div>',
      '</div>'
    ].join('');

    document.body.appendChild(modalBackdrop);

    var closeBtn = document.getElementById('icLangModalCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeLangModal);
    modalBackdrop.addEventListener('click', closeLangModal);

    modalBackdrop.querySelectorAll('.ic-lang-option-card').forEach(function(btn) {
      btn.addEventListener('click', function () {
        var langCode = this.getAttribute('data-lang-code');
        selectLanguage(langCode);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
        closeLangModal();
      }
    });
  }

  function openLangModal() {
    injectStyles();
    createModal();
    var modal = document.getElementById('icLangModal');
    if (modal) {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLangModal() {
    var modal = document.getElementById('icLangModal');
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  function selectLanguage(langCode) {
    var langObj = null;
    for (var i = 0; i < LANGUAGES.length; i++) {
      if (LANGUAGES[i].code === langCode) {
        langObj = LANGUAGES[i];
        break;
      }
    }
    if (!langObj) return;

    localStorage.setItem('user_lang', langObj.storageCode);

    if (langCode === currentLang) {
      closeLangModal();
      return;
    }

    var targetUrl = getTargetUrl(langCode);
    if (targetUrl) {
      window.location.href = targetUrl;
    } else {
      closeLangModal();
    }
  }

  window.openLanguageDialog = openLangModal;
  window.closeLanguageDialog = closeLangModal;

  function mountHeaderTrigger() {
    injectStyles();
    createModal();

    var currentLangObj = LANGUAGES[0];
    for (var i = 0; i < LANGUAGES.length; i++) {
      if (LANGUAGES[i].code === currentLang) {
        currentLangObj = LANGUAGES[i];
        break;
      }
    }

    var headerInner = document.querySelector('.header-inner');
    var menuToggle = document.querySelector('.menu-toggle');
    var siteNav = document.querySelector('.site-nav');

    var oldLangSwitch = document.querySelector('.lang-switch');
    if (oldLangSwitch) {
      oldLangSwitch.innerHTML = [
        '<button type="button" class="ic-lang-btn" aria-label="Select Language & Region" title="Select Language & Region">',
        '  <i class="fas fa-globe"></i>',
        '  <span>' + currentLangObj.flag + ' ' + currentLangObj.shortLabel + '</span>',
        '  <i class="fas fa-chevron-down ic-chevron"></i>',
        '</button>'
      ].join('');
      var btn = oldLangSwitch.querySelector('.ic-lang-btn');
      if (btn) btn.addEventListener('click', openLangModal);
      return;
    }

    if (headerInner && !document.getElementById('icHeaderLangBtn')) {
      var newBtn = document.createElement('button');
      newBtn.type = 'button';
      newBtn.id = 'icHeaderLangBtn';
      newBtn.className = 'ic-lang-btn';
      newBtn.setAttribute('aria-label', 'Select Language & Region');
      newBtn.setAttribute('title', 'Select Language & Region');
      newBtn.innerHTML = [
        '<i class="fas fa-globe"></i>',
        '<span>' + currentLangObj.flag + ' ' + currentLangObj.shortLabel + '</span>',
        '<i class="fas fa-chevron-down ic-chevron"></i>'
      ].join('');
      newBtn.addEventListener('click', openLangModal);

      if (menuToggle) {
        headerInner.insertBefore(newBtn, menuToggle);
      } else if (siteNav) {
        headerInner.insertBefore(newBtn, siteNav);
      } else {
        headerInner.appendChild(newBtn);
      }
    }

    document.querySelectorAll('[data-open-lang-modal], .open-lang-modal').forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        openLangModal();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountHeaderTrigger);
  } else {
    mountHeaderTrigger();
  }
})();
