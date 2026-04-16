(function () {
  "use strict";

  function isToolPage() {
    var p = (window.location.pathname || "").toLowerCase();
    return /calculator|compoundinterest|gallontoliter/.test(p);
  }

  if (!isToolPage()) {
    return;
  }

  function isMobileDevice() {
    if (navigator.userAgentData && typeof navigator.userAgentData.mobile === "boolean") {
      return navigator.userAgentData.mobile;
    }

    var ua = navigator.userAgent || "";
    var uaLooksMobile = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini|Mobile/i.test(ua);
    var coarsePointer = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    var smallViewport = window.matchMedia && window.matchMedia("(max-width: 1024px)").matches;
    return uaLooksMobile || (coarsePointer && smallViewport);
  }

  if (!isMobileDevice()) {
    return;
  }

  var root = document.documentElement;
  var body = document.body;
  if (!root || !body) {
    return;
  }

  function findFullscreenTarget() {
    var selectors = [
      "#calcShell",
      ".calculator-shell",
      "article.calculator-shell",
      "#calculatorShell",
      "#calculator",
      ".calc-shell",
      ".calc-card"
    ];

    for (var i = 0; i < selectors.length; i += 1) {
      var el = document.querySelector(selectors[i]);
      if (el) {
        return el;
      }
    }

    return null;
  }

  var target = findFullscreenTarget();
  if (!target) {
    return;
  }

  var style = document.createElement("style");
  style.textContent = ""
    + ".insta-fs-btn{position:fixed;left:16px;bottom:16px;z-index:99999;"
    + "border:1px solid rgba(0,95,115,.3);background:#ffffff;color:#005f73;"
    + "border-radius:999px;padding:.62rem .9rem;display:inline-flex;align-items:center;"
    + "gap:.45rem;font:600 14px/1.1 Public Sans,Arial,sans-serif;box-shadow:0 10px 28px rgba(15,23,42,.18);"
    + "cursor:pointer;touch-action:manipulation;}"
    + ".insta-fs-btn:focus-visible{outline:2px solid #007f8b;outline-offset:2px;}"
    + ".insta-fs-toast{position:fixed;left:16px;right:16px;bottom:72px;z-index:100000;"
    + "background:rgba(19,42,59,.96);color:#fff;padding:.6rem .75rem;border-radius:10px;"
    + "font:500 13px/1.35 Public Sans,Arial,sans-serif;box-shadow:0 8px 25px rgba(0,0,0,.3);opacity:0;"
    + "transform:translateY(8px);transition:all .24s ease;pointer-events:none;}"
    + ".insta-fs-toast.show{opacity:1;transform:translateY(0);}"
    + ".insta-fs-target.insta-fs-pseudo{position:fixed !important;inset:0 !important;z-index:99990 !important;"
    + "width:auto !important;max-width:none !important;height:100vh !important;height:100dvh !important;"
    + "max-height:100vh !important;max-height:100dvh !important;overflow-y:auto !important;overflow-x:hidden !important;"
    + "margin:0 !important;border-radius:0 !important;padding-bottom:84px !important;background:#fff !important;"
    + "-webkit-overflow-scrolling:touch !important;overscroll-behavior:contain !important;touch-action:pan-y !important;}"
    + ".insta-fs-target:fullscreen,.insta-fs-target:-webkit-full-screen,.insta-fs-target:-ms-fullscreen{"
    + "width:100vw !important;max-width:none !important;height:100vh !important;height:100dvh !important;"
    + "max-height:100vh !important;max-height:100dvh !important;margin:0 !important;border-radius:0 !important;"
    + "overflow-y:auto !important;overflow-x:hidden !important;padding:12px 12px 84px !important;"
    + "box-sizing:border-box !important;background:#fff !important;-webkit-overflow-scrolling:touch !important;"
    + "overscroll-behavior:contain !important;touch-action:pan-y !important;}"
    + "@media (min-width: 800px){.insta-fs-toast{left:auto;right:16px;max-width:420px;}}";
  document.head.appendChild(style);

  target.classList.add("insta-fs-target");

  var button = document.createElement("button");
  button.type = "button";
  button.className = "insta-fs-btn";
  button.setAttribute("aria-label", "Toggle calculator fullscreen mode");
  body.appendChild(button);

  var toast = document.createElement("div");
  toast.className = "insta-fs-toast";
  body.appendChild(toast);

  var toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    if (toastTimer) {
      window.clearTimeout(toastTimer);
    }
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("show");
    }, 1900);
  }

  function fsElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement || null;
  }

  function nativeSupported() {
    return !!(target.requestFullscreen || target.webkitRequestFullscreen || target.msRequestFullscreen);
  }

  function requestNative() {
    if (target.requestFullscreen) {
      return target.requestFullscreen();
    }
    if (target.webkitRequestFullscreen) {
      target.webkitRequestFullscreen();
      return Promise.resolve();
    }
    if (target.msRequestFullscreen) {
      target.msRequestFullscreen();
      return Promise.resolve();
    }
    return Promise.reject(new Error("native fullscreen unsupported"));
  }

  function exitNative() {
    if (document.exitFullscreen) {
      return document.exitFullscreen();
    }
    if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
      return Promise.resolve();
    }
    if (document.msExitFullscreen) {
      document.msExitFullscreen();
      return Promise.resolve();
    }
    return Promise.resolve();
  }

  function pseudoEnabled() {
    return target.classList.contains("insta-fs-pseudo");
  }

  function setPseudoMode(enabled) {
    target.classList.toggle("insta-fs-pseudo", enabled);
    if (enabled) {
      showToast("Calculator fullscreen enabled");
    }
    updateButton();
  }

  function isActive() {
    return !!fsElement() || pseudoEnabled();
  }

  function enforceActiveScrollStyles(active) {
    if (active) {
      target.style.setProperty("overflow-y", "auto", "important");
      target.style.setProperty("overflow-x", "hidden", "important");
      target.style.setProperty("-webkit-overflow-scrolling", "touch", "important");
      target.style.setProperty("touch-action", "pan-y", "important");
      target.style.setProperty("max-height", "100dvh", "important");
      return;
    }
    target.style.removeProperty("overflow-y");
    target.style.removeProperty("overflow-x");
    target.style.removeProperty("-webkit-overflow-scrolling");
    target.style.removeProperty("touch-action");
    target.style.removeProperty("max-height");
  }

  function updateButton() {
    enforceActiveScrollStyles(isActive());
    if (isActive()) {
      button.innerHTML = "<span aria-hidden='true'>⤢</span><span>Exit Fullscreen</span>";
      return;
    }
    button.innerHTML = "<span aria-hidden='true'>⛶</span><span>Fullscreen Tool</span>";
  }

  button.addEventListener("click", function () {
    if (fsElement()) {
      exitNative().finally(updateButton);
      return;
    }

    if (pseudoEnabled()) {
      setPseudoMode(false);
      return;
    }

    if (!nativeSupported()) {
      setPseudoMode(true);
      return;
    }

    requestNative()
      .then(updateButton)
      .catch(function () {
        setPseudoMode(true);
      });
  });

  ["fullscreenchange", "webkitfullscreenchange", "msfullscreenchange"].forEach(function (evt) {
    document.addEventListener(evt, updateButton);
  });

  updateButton();
})();
