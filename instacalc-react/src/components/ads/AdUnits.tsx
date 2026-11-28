import { useEffect, useRef } from "react";
import { usePageContext } from "@/app/PageContext";
import { AD_UNITS, isAdAllowedPath, type BannerAdUnit } from "@/config/ads";
import { enqueueAdTask } from "@/lib/adQueue";

declare global {
  interface Window {
    atOptions?: {
      key: string;
      format: "iframe";
      height: number;
      width: number;
      params: Record<string, unknown>;
    };
  }
}

function useAdAllowed(explicitPath?: string): { allowed: boolean; path: string } {
  const pageCtx = usePageContext();
  const path = explicitPath ?? pageCtx?.path ?? "";
  return { allowed: isAdAllowedPath(path), path };
}

/**
 * Fixed-size iframe banner (468x60 for tablet/desktop, 160x600 for desktop rail).
 * Only loads when viewport width meets `minWidth` and the current route allows ads.
 */
export function AdBanner({
  unit,
  minWidth = 0,
  className = "",
  path: explicitPath,
}: {
  unit: "banner468x60" | "banner160x600";
  minWidth?: number;
  className?: string;
  path?: string;
}) {
  const { allowed, path } = useAdAllowed(explicitPath);
  const hostRef = useRef<HTMLDivElement>(null);
  const spec: BannerAdUnit = AD_UNITS[unit];

  useEffect(() => {
    if (!allowed || typeof window === "undefined") return;
    if (minWidth > 0 && window.innerWidth < minWidth) return;

    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;

    enqueueAdTask(
      () =>
        new Promise<void>((resolve) => {
          if (cancelled || !host.isConnected) {
            resolve();
            return;
          }

          host.innerHTML = "";
          window.atOptions = {
            key: spec.key,
            format: "iframe",
            height: spec.height,
            width: spec.width,
            params: {},
          };

          const script = document.createElement("script");
          script.setAttribute("data-cfasync", "false");
          script.src = spec.scriptSrc;

          const timer = window.setTimeout(resolve, 8000);
          const done = () => {
            window.clearTimeout(timer);
            resolve();
          };
          script.onload = done;
          script.onerror = done;

          host.appendChild(script);
        }),
    );

    return () => {
      cancelled = true;
      if (host) host.innerHTML = "";
    };
  }, [allowed, path, minWidth, spec.key, spec.height, spec.width, spec.scriptSrc]);

  if (!allowed) return null;

  return (
    <div
      className={`ad-container ad-banner-slot ${className}`.trim()}
      data-ad-unit={unit}
      aria-label="Advertisement"
    >
      <div
        ref={hostRef}
        className="ad-banner-frame"
        style={{ width: spec.width, minHeight: spec.height }}
      />
    </div>
  );
}

/**
 * Fluid Native Banner (works across mobile, tablet, and desktop).
 */
export function NativeAdBanner({
  className = "",
  path: explicitPath,
}: {
  className?: string;
  path?: string;
}) {
  const { allowed, path } = useAdAllowed(explicitPath);
  const slotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!allowed || typeof window === "undefined") return;
    const slot = slotRef.current;
    if (!slot) return;

    const container = document.createElement("div");
    container.id = AD_UNITS.nativeBanner.containerId;

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("fetchpriority", "high");
    script.setAttribute("data-cfasync", "false");
    script.src = AD_UNITS.nativeBanner.scriptSrc;
    script.onerror = () => {};

    slot.innerHTML = "";
    slot.appendChild(script);
    slot.appendChild(container);

    return () => {
      slot.innerHTML = "";
    };
  }, [allowed, path]);

  if (!allowed) return null;

  return (
    <div
      className={`ad-container ad-native-slot ${className}`.trim()}
      aria-label="Sponsored content"
    >
      <div ref={slotRef} className="ad-native-inner" />
    </div>
  );
}

/**
 * Clearly labeled Smart Link CTA card (all devices, non-excluded routes).
 */
export function SmartLinkBanner({
  className = "",
  path: explicitPath,
}: {
  className?: string;
  path?: string;
}) {
  const { allowed } = useAdAllowed(explicitPath);
  if (!allowed) return null;

  return (
    <div className={`ad-container ad-smartlink-slot ${className}`.trim()}>
      <a
        href={AD_UNITS.smartLink.href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="ad-smartlink-card"
      >
        <span className="ad-smartlink-badge">Sponsored</span>
        <span className="ad-smartlink-text">Explore Featured Partner Offers</span>
        <span className="ad-smartlink-arrow" aria-hidden="true">
          ↗
        </span>
      </a>
    </div>
  );
}

/**
 * Global page-level scripts: Social Bar & Popunder.
 * Mounted once in Layout and automatically removed when navigating to excluded routes.
 */
export function GlobalAdScripts({ path: explicitPath }: { path?: string }) {
  const { allowed } = useAdAllowed(explicitPath);

  useEffect(() => {
    if (!allowed || typeof document === "undefined") return;

    const socialScript = document.createElement("script");
    socialScript.setAttribute("data-cfasync", "false");
    socialScript.setAttribute("data-ic-global-ad", "social-bar");
    socialScript.src = AD_UNITS.socialBar.scriptSrc;
    socialScript.onerror = () => {};

    const popunderScript = document.createElement("script");
    popunderScript.setAttribute("data-cfasync", "false");
    popunderScript.setAttribute("data-ic-global-ad", "popunder");
    popunderScript.src = AD_UNITS.popunder.scriptSrc;
    popunderScript.onerror = () => {};

    document.body.appendChild(socialScript);
    document.body.appendChild(popunderScript);

    return () => {
      socialScript.remove();
      popunderScript.remove();
    };
  }, [allowed]);

  return null;
}
