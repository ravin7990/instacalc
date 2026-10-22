# InstaCalc — React + Vite

The React/Vite rewrite of **instacalc.in**. Every legacy URL is preserved exactly,
so the migration costs nothing in search equity.

## Why not a plain SPA

Google has already indexed 113 URLs on this site. A client-only React app returns
an empty `<body>` to a crawler, which would wipe those rankings. So this project
**prerenders every route to real HTML at build time** and hydrates it in the
browser. First paint needs zero JavaScript.

## Commands

```bash
npm install

npm run dev          # dev server on :7000 (override with PORT=xxxx)
npm run build        # client + SSR + prerender 118 pages + sitemap
npm run preview      # serve dist/ on :8000 (PORT + 1000)

npm run typecheck    # tsc --noEmit
npm test             # calculator engine unit tests
npm run verify       # typecheck + test + build + both checks
npm run report:bundle # asset sizes, gzipped and brotli
npm run audit:psi    # PageSpeed Insights v5 gate (needs PSI_KEY)
```

## Architecture

```
scripts/
  extract-seo.mjs     # parses the legacy site -> src/data/seo.generated.json
  build-pages.mjs     # prerenders every route -> dist/**.html
  gen-sitemap.mjs     # regenerates sitemap.xml with hreflang alternates
  check-parity.mjs    # asserts no SEO surface was lost in the migration
  check-markup.mjs    # asserts prerendered bodies are complete and CLS-safe
  audit-psi.mjs       # Core Web Vitals gate
  bundle-report.mjs   # asset size report

src/
  app/router.tsx      # single source of truth: path -> page loader
  data/seo.generated.json  # extracted SEO for all 118 pages (server only)
  data/seo.ts         # client: reads the record inlined into the HTML
  data/seo-server.ts  # server: full dataset lookup
  engines/            # pure calculation logic, one module per tool
  i18n/               # en-IN / en-US / ja / ru / ko string tables
  components/         # layout, calculator shell, SEO
  calculators/        # one folder per tool
```

### Adding a calculator

1. Write the maths in `src/engines/<tool>.ts` as pure functions.
2. Add unit tests in `tests/` using independently derived expected values.
3. Describe the UI in `src/calculators/<tool>/` via `createCalculatorPage`.
4. Register the path in `src/app/router.tsx`.
5. Run `npm run verify`.

The page automatically inherits that URL's existing title, description, canonical,
hreflang and FAQ from `seo.generated.json`, so SEO parity is structural rather
than something to remember.

## Migration status

**All 118 pages are converted** (`npm run status` confirms 0 remaining).

Every legacy URL is emitted at exactly its original path, prerendered with its
original title, description, canonical, hreflang and JSON-LD.

Converted: the homepage (with the natural-language unit converter), all financial
calculators (SIP, lumpsum, EMI, FD, RD, GST, compound, simple interest, EPF, PPF,
NPS, gratuity, CAGR, SWP, retirement planner, mutual fund), the date and time tools
(age, cat age, birthday, days, week, hours, minutes-to-hours, Julian date, time
duration, time zone), the geometry and construction tools (diagonal, triangle,
concrete), the gallon converter, the five prose pages, and every locale variant —
English (India), English (US), Japanese, Russian and Korean.

### Notable SEO decisions

- **Self-referencing canonicals.** The legacy `/ru/` and `/ko/` pages pointed
  their canonical at the English twin despite carrying translated titles and a
  matching `hreflang`. Those now canonicalise to themselves, so the translated
  pages are indexable.
- **Near-duplicates stay out of the index.** `coumpoundinterest`,
  `cargcalculator` and the `delete-account` variants are genuinely duplicate
  tools. They serve a `noindex,follow` notice linking to the canonical version,
  and are excluded from the sitemap.
- **Locale content is extracted, not retyped.** `npm run inspect:content`
  regenerates `src/data/content.generated.json` from the legacy markup so prose
  wording cannot drift. `verify-locale-content` fails the build if any locale
  silently falls back to English.

## Core Web Vitals

| Metric   | Target        | How it is met |
| -------- | ------------- | ------------- |
| FCP      | ≤ 1800 ms     | CSS inlined in `<head>`, no render-blocking CDN, prerendered HTML |
| LCP      | ≤ 2500 ms     | Same as FCP; hero text is the LCP element, so no image blocks it |
| CLS     | ≤ 0.1         | explicit `width`/`height` on every image, `font-display: swap`, `position: sticky` (not `fixed`) for the mobile summary pill |
| TBT      | ≤ 200 ms      | route-level code splitting, engines are pure functions, no work at module scope |
| SI       | ≤ 3400 ms     | first paint requires no JS at all |
| INP      | ≤ 200 ms      | inputs are controlled and cheap; long tasks are absent by design |

Removed versus the legacy site: the FontAwesome CDN stylesheet (was render-blocking
on 111 pages), the Google Fonts render-blocking stylesheet (113 pages), and eager
Chart.js (67 pages).

## SEO notes

* **118 URLs emitted, 113 legacy URLs preserved.** The 5 extras are orphan pages
  that existed on disk but were absent from the old sitemap.
* **Self-referencing canonicals.** 24 legacy pages pointed their canonical at a
  different URL — every `/ru/` and `/ko/` page pointed at its English twin, despite
  having translated titles and a matching `hreflang`. Those pages are now indexed
  under their own URL.
* `robots.txt`, `ads.txt`, `app-ads.txt` and `CNAME` are copied into `dist/`.

## Deployment

GitHub Pages via `.github/workflows/deploy.yml`.

Set the repository variable `VITE_BASE` to `/` for the custom domain
(`instacalc.in`), or `/<repo>/` for a project Pages site.
