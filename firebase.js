// firebase.js - InstaCalc Firebase Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyBoHOL_ZoQOpsrNBIFwEqKzTZtXDOUDrEc",
  authDomain: "instacalc-40640.firebaseapp.com",
  projectId: "instacalc-40640",
  storageBucket: "instacalc-40640.firebasestorage.app",
  messagingSenderId: "720029503645",
  appId: "1:720029503645:web:2e9e1ea8532bc2fe6c4474",
  measurementId: "G-J0ZWXR3T5P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };