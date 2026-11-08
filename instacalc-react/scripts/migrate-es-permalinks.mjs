import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const SEO_FILE = join(ROOT, "src/data/seo.generated.json");

export const URL_MAPPING = {
  // Finance
  "es/emicalculator.html": "es/calculadora-prestamos.html",
  "es/gstcalculator.html": "es/calculadora-iva.html",
  "es/fdcalculator.html": "es/calculadora-deposito-plazo-fijo.html",
  "es/rdcalculator.html": "es/calculadora-ahorro-programado.html",
  "es/sipcalculator.html": "es/calculadora-inversion-mensual.html",
  "es/sipcalculatorlumpsump.html": "es/calculadora-inversion-suma-global.html",
  "es/swpcalculator.html": "es/calculadora-retiro-sistematico.html",
  "es/compoundinterest.html": "es/calculadora-interes-compuesto.html",
  "es/simpleinterestcalculator.html": "es/calculadora-interes-simple.html",
  "es/mortgage-calculator.html": "es/calculadora-hipoteca.html",
  "es/cagrcalculator.html": "es/calculadora-cagr.html",
  "es/mutualfundreturncalculator.html": "es/calculadora-fondos-inversion.html",
  "es/retirementcalculator.html": "es/calculadora-jubilacion.html",
  "es/fire-calculator.html": "es/calculadora-fire.html",

  // Date and Time
  "es/duration/agecalculator.html": "es/calculadora-edad.html",
  "es/catagecalculator.html": "es/calculadora-edad-gatos.html",
  "es/duration/birthdaycalculator.html": "es/calculadora-cumpleanos.html",
  "es/duration/dayscalculator.html": "es/calculadora-dias-entre-fechas.html",
  "es/duration/weekcalculator.html": "es/calculadora-semanas.html",
  "es/duration/hourcalculator.html": "es/calculadora-horas-trabajo.html",
  "es/duration/minutes-hourscalculator.html": "es/calculadora-minutos-a-horas.html",
  "es/duration/timezonecalculator.html": "es/calculadora-zona-horaria.html",

  // Construction, Geometry & Units
  "es/moretools/trianglecalculator.html": "es/calculadora-triangulos.html",
  "es/moretools/diagonalcalculator.html": "es/calculadora-diagonal.html",
  "es/moretools/trignometrycalculator.html": "es/calculadora-trigonometria.html",
  "es/moretools/concretecalculator.html": "es/calculadora-hormigon-concreto.html",
  "es/gallontolitercalculator.html": "es/calculadora-galon-a-litro.html",
};

const seo = JSON.parse(readFileSync(SEO_FILE, "utf8"));
const ORIGIN = "https://instacalc.in";

let mapped = 0;
for (const [oldRel, newRel] of Object.entries(URL_MAPPING)) {
  const page = seo.pages[oldRel];
  if (!page) {
    console.warn(`[migrate] Warning: page not found: ${oldRel}`);
    continue;
  }
  mapped++;

  const oldUrl = `${ORIGIN}/${oldRel}`;
  const newUrl = `${ORIGIN}/${newRel}`;

  page.path = `/${newRel}`;
  page.canonical = `/${newRel}`;
  page.ogUrl = newUrl;
  page.source = newRel;

  // Update page's own alternates
  if (page.alternates) {
    for (const alt of page.alternates) {
      if (alt.href === oldUrl) {
        alt.href = newUrl;
      }
    }
  }

  // Update jsonLd URLs
  if (page.jsonLd) {
    for (const item of page.jsonLd) {
      if (item["@type"] === "BreadcrumbList" && Array.isArray(item.itemListElement)) {
        for (const elem of item.itemListElement) {
          if (elem.position === 2 || elem.item === oldUrl) {
            elem.item = newUrl;
          }
        }
      }
      if (item["@type"] === "WebApplication" || item["@type"] === "SoftwareApplication") {
        if (item.url === oldUrl || item["@id"] === oldUrl) {
          item.url = newUrl;
          if (item["@id"]) item["@id"] = newUrl;
        }
      }
    }
  }

  delete seo.pages[oldRel];
  seo.pages[newRel] = page;
}

// Update alternates across ALL pages pointing to old Spanish URLs
let altUpdated = 0;
for (const [k, page] of Object.entries(seo.pages)) {
  if (page.alternates) {
    for (const alt of page.alternates) {
      for (const [oldRel, newRel] of Object.entries(URL_MAPPING)) {
        const oldUrl = `${ORIGIN}/${oldRel}`;
        const newUrl = `${ORIGIN}/${newRel}`;
        if (alt.href === oldUrl) {
          alt.href = newUrl;
          altUpdated++;
        }
      }
    }
  }
}

writeFileSync(SEO_FILE, JSON.stringify(seo, null, 2) + "\n", "utf8");
console.log(`[migrate] Successfully migrated ${mapped} Spanish pages to new permalinks.`);
console.log(`[migrate] Updated ${altUpdated} alternate references across all locales.`);
