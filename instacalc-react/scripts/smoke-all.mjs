/**
 * smoke-all.mjs — requests every emitted URL against a running preview server
 * and reports any non-200. Run with the preview server up:
 *   node scripts/smoke-all.mjs
 */
/** Preview server URL. Port follows the Vite config (PORT + 1000 for preview). */
const DEFAULT_PORT = Number(process.env.PORT ?? 7000) + 1000;
const BASE = (process.env.SMOKE_URL ?? `http://localhost:${DEFAULT_PORT}`).replace(/\/$/, "");

const seo = JSON.parse(
  await (await import("node:fs/promises")).readFile(
    new URL("../src/data/seo.generated.json", import.meta.url),
    "utf8",
  ),
);

const paths = Object.values(seo.pages).map((p) => {
  if (p.path === "/") return "/";
  if (p.path.endsWith("/")) return p.path;
  return p.path;
});

let ok = 0;
const failures = [];

console.log(`[smoke] requesting ${paths.length} URLs from ${BASE}\n`);

for (const path of paths) {
  try {
    const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
    if (res.status === 200) {
      ok++;
    } else {
      failures.push(`${path} -> HTTP ${res.status}`);
    }
  } catch (err) {
    failures.push(`${path} -> ${err.message}`);
  }
}

console.log(`[smoke] ${ok}/${paths.length} returned 200`);
if (failures.length) {
  console.log("\nfailures:");
  for (const f of failures) console.log(`  ${f}`);
  process.exitCode = 1;
} else {
  console.log("[smoke] PASS — every URL is reachable.");
}