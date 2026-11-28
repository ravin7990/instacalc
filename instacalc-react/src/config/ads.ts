/**
 * Ad unit configuration and route-level exclusion rules.
 *
 * Ads are shown on calculator, converter, and home pages across all locales,
 * and suppressed on legal, trust, contact, and error pages.
 */

export const AD_EXCLUDED_PATH_RE =
  /privacypolicy|terms|disclaimer|contactus|delete-account|deleteaccount|aboutus/i;

export function isAdAllowedPath(path: string | undefined | null): boolean {
  if (!path) return false;
  if (path === "/404.html" || path.endsWith("/404.html")) return false;
  return !AD_EXCLUDED_PATH_RE.test(path);
}

export interface BannerAdUnit {
  key: string;
  width: number;
  height: number;
  scriptSrc: string;
}

export const AD_UNITS = {
  nativeBanner: {
    key: "2fe5135320e044ea48ffd58ca7997a54",
    containerId: "container-2fe5135320e044ea48ffd58ca7997a54",
    scriptSrc: "https://bauval.org/21/2fe5135320e044ea48ffd58ca7997a54",
  },
  banner468x60: {
    key: "908c17bec7b71c8fd49d295889cad5cf",
    width: 468,
    height: 60,
    scriptSrc: "https://bauval.org/22/908c17bec7b71c8fd49d295889cad5cf",
  } satisfies BannerAdUnit,
  banner160x600: {
    key: "f1cd467e947ef32f1b6a0efecc31c592",
    width: 160,
    height: 600,
    scriptSrc: "https://bauval.org/22/f1cd467e947ef32f1b6a0efecc31c592",
  } satisfies BannerAdUnit,
  socialBar: {
    scriptSrc: "https://bauval.org/14/b63dddd0927dbbc3eecc8d79899c70ad",
  },
  smartLink: {
    href: "https://araplhn.org/4/f8d87187a4892d4fe6b0857ba622d65d",
  },
  popunder: {
    scriptSrc: "https://abscloud.org/1/2c1f9a0866eff0d222818339edf69fe0",
  },
} as const;
