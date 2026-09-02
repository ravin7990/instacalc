// firebase.js - InstaCalc Firebase Initialization (lazy, deferred to idle time)
// Loads the gstatic Firebase modules dynamically AFTER the page is interactive,
// so analytics never competes with first paint / LCP on mobile.

const firebaseConfig = {
  apiKey: "AIzaSyBoHOL_ZoQOpsrNBIFwEqKzTZtXDOUDrEc",
  authDomain: "instacalc-40640.firebaseapp.com",
  projectId: "instacalc-40640",
  storageBucket: "instacalc-40640.firebasestorage.app",
  messagingSenderId: "720029503645",
  appId: "1:720029503645:web:2e9e1ea8532bc2fe6c4474",
  measurementId: "G-J0ZWXR3T5P"
};

let app = null;
let analytics = null;

function initFirebase() {
  if (app) return; // already initialized
  Promise.all([
    import("https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js")
  ])
    .then(function (modules) {
      app = modules[0].initializeApp(firebaseConfig);
      analytics = modules[1].getAnalytics(app);
    })
    .catch(function () {
      // Analytics is best-effort; never block or break the page.
    });
}

if ("requestIdleCallback" in window) {
  requestIdleCallback(initFirebase, { timeout: 3000 });
} else {
  setTimeout(initFirebase, 2500);
}

export { app, analytics };