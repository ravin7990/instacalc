import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "@/app/App";
import { initAutoTracking } from "@/lib/analytics";
import "@/styles/tokens.css";
import "@/styles/app.css";

initAutoTracking();

const container = document.getElementById("root")!;
const path = window.location.pathname;

// Hydrate when the prerenderer supplied markup; fall back to a fresh render in
// dev, where index.html is the only shell present.
if (container.firstChild) {
  hydrateRoot(container, <StrictMode><App path={path} /></StrictMode>);
} else {
  createRoot(container).render(<StrictMode><App path={path} /></StrictMode>);
}

if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Purge legacy v1 cache if found
    if ("caches" in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          if (key === "instacalc-v1") {
            caches.delete(key);
          }
        });
      });
    }

    navigator.serviceWorker.register("/sw.js").then((reg) => {
      reg.update();
      if (reg.waiting) {
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
      }
    }).catch(() => {});
  });
}

