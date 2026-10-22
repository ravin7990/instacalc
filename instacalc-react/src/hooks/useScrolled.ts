import { useEffect, useState } from "react";

/**
 * True once the window has scrolled past `threshold`.
 *
 * Uses a passive listener and only flips state when the boolean actually
 * changes, so scrolling does not cause a React render per frame.
 */
export function useScrolled(threshold = 20): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const evaluate = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      setScrolled((prev) => (prev === y > threshold ? prev : y > threshold));
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(evaluate);
    };
    evaluate();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}
