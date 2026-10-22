import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "@/app/App";
import "@/styles/tokens.css";
import "@/styles/app.css";

const container = document.getElementById("root")!;
const path = window.location.pathname;

// Hydrate when the prerenderer supplied markup; fall back to a fresh render in
// dev, where index.html is the only shell present.
if (container.firstChild) {
  hydrateRoot(container, <StrictMode><App path={path} /></StrictMode>);
} else {
  createRoot(container).render(<StrictMode><App path={path} /></StrictMode>);
}
