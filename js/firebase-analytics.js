/**
 * Firebase Analytics Centralized Tracking Module
 * Goa Construction Document Hub
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAnalytics, logEvent, isSupported } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-analytics.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAPL4GVo4bN6CSDXjYJ9XFdA_IWT8hF6kA",
    authDomain: "gsr-ca130.firebaseapp.com",
    projectId: "gsr-ca130",
    storageBucket: "gsr-ca130.firebasestorage.app",
    messagingSenderId: "1046019593521",
    appId: "1:1046019593521:web:00c2a57888ad65593b4c10",
    measurementId: "G-32LD3J1GHJ"
};

let analyticsInstance = null;

/**
 * Dispatches an event to Firebase Analytics or queues it if not ready.
 * @param {string} eventName
 * @param {object} [eventParams={}]
 */
function trackEvent(eventName, eventParams = {}) {
    if (!eventName) return;

    // Clean undefined/null properties to keep telemetry clean
    const sanitizedParams = {};
    for (const [key, val] of Object.entries(eventParams)) {
        if (val !== undefined && val !== null) {
            sanitizedParams[key] = typeof val === 'string' ? val.substring(0, 100) : val;
        }
    }

    if (analyticsInstance) {
        try {
            logEvent(analyticsInstance, eventName, sanitizedParams);
        } catch (err) {
            console.warn('[Analytics] Failed to log event:', eventName, err);
        }
    } else {
        // Queue for later flush
        window._pendingAnalyticsEvents = window._pendingAnalyticsEvents || [];
        window._pendingAnalyticsEvents.push({ eventName, eventParams: sanitizedParams });
    }
}

// Expose on window immediately so any inline or external script can call it
window.trackEvent = trackEvent;

/**
 * Initializes Firebase Analytics and flushes queued events
 */
async function initFirebase() {
    try {
        const supported = await isSupported();
        if (!supported) {
            console.info('[Analytics] Firebase Analytics is not supported in this browser environment.');
            return;
        }

        const app = initializeApp(firebaseConfig);
        analyticsInstance = getAnalytics(app);

        // Process any queued events that fired before initialization completed
        if (window._pendingAnalyticsEvents && window._pendingAnalyticsEvents.length > 0) {
            const queue = [...window._pendingAnalyticsEvents];
            window._pendingAnalyticsEvents = [];
            queue.forEach(({ eventName, eventParams }) => {
                try {
                    logEvent(analyticsInstance, eventName, eventParams);
                } catch (e) {
                    // silently catch
                }
            });
        }

        // Automatic Page View Tracking
        const pageTitle = document.title || 'Construction Hub';
        const pagePath = window.location.pathname.split('/').pop() || 'index.html';
        trackEvent('page_view', {
            page_title: pageTitle,
            page_path: pagePath,
            page_location: window.location.href
        });

        // Set up automatic click listeners for navigation and outbound links
        setupAutoTracking();

    } catch (err) {
        console.warn('[Analytics] Firebase initialization warning:', err.message);
    }
}

/**
 * Automatically captures outbound clicks, navigation links, and document downloads
 */
function setupAutoTracking() {
    document.addEventListener('click', function (e) {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href') || '';
        const linkText = (link.textContent || '').trim().substring(0, 50);

        // Outbound external links
        if (href.startsWith('http://') || href.startsWith('https://')) {
            const currentHost = window.location.hostname;
            try {
                const url = new URL(href);
                if (url.hostname !== currentHost) {
                    trackEvent('outbound_click', {
                        link_text: linkText,
                        url: href.substring(0, 150),
                        destination_domain: url.hostname
                    });
                }
            } catch (err) {
                // Ignore URL parse errors
            }
        }

        // Navigation links
        if (link.closest('#primary-navigation') || link.closest('.main-nav') || link.closest('.nav-menu')) {
            trackEvent('nav_click', {
                link_text: linkText,
                target_href: href
            });
        }

        // Footer links
        if (link.closest('footer')) {
            trackEvent('footer_click', {
                link_text: linkText,
                target_href: href
            });
        }
    }, true);
}

// Start initialization
initFirebase();
