document.addEventListener("DOMContentLoaded", function () {
      const conversionInput = document.getElementById("conversion-input");
      const suggestionsContainer = document.getElementById("suggestions-container");
      const resultsContainer = document.getElementById("results-container");
      const helperText = document.getElementById("helper-text");
      const toggleCategoriesBtn = document.getElementById("toggle-categories-btn");
      const categoriesGridContainerEl = document.getElementById("categories-grid-container");
      const categoriesGrid = categoriesGridContainerEl ? categoriesGridContainerEl.querySelector(".grid") : null;
      const toggleCategoriesText = document.getElementById("toggle-categories-text");
      const clearInputBtn = document.getElementById("clear-input-btn");

      if (!conversionInput || !suggestionsContainer || !resultsContainer || !helperText || !toggleCategoriesBtn || !categoriesGridContainerEl || !categoriesGrid || !toggleCategoriesText || !clearInputBtn) {
        return;
      }
      const unitCategories = {
        length: { meter: 1, centimeter: 0.01, millimeter: 0.001, kilometer: 1000, inch: 0.0254, foot: 0.3048, yard: 0.9144, mile: 1609.344, "nautical mile": 1852 },
        mass: { gram: 1, kilogram: 1000, milligram: 0.001, pound: 453.59237, ounce: 28.349523125, ton_us: 907184.74, "metric ton": 1000000, stone: 6350.29318 },
        speed: { "meter per second": 1, "kilometer per hour": 1 / 3.6, "mile per hour": 0.44704, knot: 0.514444444, "foot per second": 0.3048 },
        area: { "square meter": 1, "square kilometer": 1e6, "square centimeter": 1e-4, "square millimeter": 1e-6, "square inch": 0.00064516, "square foot": 0.09290304, "square yard": 0.83612736, "square mile": 2589988.110336, acre: 4046.8564224, hectare: 10000 },
        volume: { liter: 1, milliliter: 0.001, "cubic meter": 1000, "cubic centimeter": 0.001, gallon_us_liquid: 3.785411784, quart_us_liquid: 0.946352946, pint_us_liquid: 0.473176473, cup_us_customary: 0.24, fluid_ounce_us: 0.0295735295625, tablespoon_us: 0.01478676478125, teaspoon_us: 0.00492892159375 },
        temperature: { celsius: 0, fahrenheit: 0, kelvin: 0, rankine: 0, reaumur: 0 },
        angle: { radian: 1, degree: Math.PI / 180, gradian: Math.PI / 200, arcminute: Math.PI / (180 * 60), arcsecond: Math.PI / (180 * 3600), revolution: 2 * Math.PI },
        pressure: { pascal: 1, kilopascal: 1000, hectopascal: 100, megapascal: 1e6, bar: 1e5, millibar: 100, atmosphere_std: 101325, "pound per square inch": 6894.7572931783, torr: 133.32236842105, "millimeter of mercury": 133.322387415, inch_of_mercury_32f: 3386.38815789 },
        force: { newton: 1, kilonewton: 1000, dyne: 1e-5, "kilogram-force": 9.80665, "pound-force": 4.44822162 },
        power: { watt: 1, kilowatt: 1000, megawatt: 1e6, horsepower: 745.699872, metric_horsepower: 735.49875, "foot-pound per second": 1.35581795, btu_th_per_hour: 0.292875 },
        energy: { joule: 1, kilojoule: 1000, megajoule: 1e6, "kilowatt-hour": 3.6e6, watt_hour: 3600, calorie_th: 4.184, kilocalorie_th: 4184, british_thermal_unit_th: 1054.35, electronvolt: 1.602176634e-19, "foot-pound": 1.3558179483314004 },
        time: { second: 1, millisecond: 0.001, microsecond: 1e-6, nanosecond: 1e-9, minute: 60, hour: 3600, day: 86400, week: 604800, month_avg_gregorian: 2629746, year_gregorian: 31556952, decade: 315569520, century: 3155695200 }
      };

      const unitAliases = {
        m: "meter", meter: "meter", meters: "meter", cm: "centimeter", mm: "millimeter", km: "kilometer", in: "inch", ft: "foot", yd: "yard", mi: "mile", nmi: "nautical mile",
        g: "gram", kg: "kilogram", mg: "milligram", lb: "pound", lbs: "pound", oz: "ounce", st: "stone", "us ton": "ton_us", ton: "ton_us", "metric ton": "metric ton",
        "m/s": "meter per second", "km/h": "kilometer per hour", kph: "kilometer per hour", mph: "mile per hour", kt: "knot", knots: "knot", "ft/s": "foot per second",
        sqm: "square meter", "sq m": "square meter", m2: "square meter", km2: "square kilometer", cm2: "square centimeter", mm2: "square millimeter", in2: "square inch", ft2: "square foot", yd2: "square yard", mi2: "square mile", ac: "acre", ha: "hectare",
        l: "liter", ml: "milliliter", m3: "cubic meter", cc: "cubic centimeter", cm3: "cubic centimeter", gal: "gallon_us_liquid", qt: "quart_us_liquid", pt: "pint_us_liquid", cup: "cup_us_customary", "fl oz": "fluid_ounce_us", tbsp: "tablespoon_us", tsp: "teaspoon_us",
        c: "celsius", f: "fahrenheit", k: "kelvin", r: "rankine", re: "reaumur", rad: "radian", deg: "degree", grad: "gradian", rev: "revolution",
        pa: "pascal", kpa: "kilopascal", hpa: "hectopascal", mpa: "megapascal", mbar: "millibar", atm: "atmosphere_std", psi: "pound per square inch", torr: "torr", mmhg: "millimeter of mercury", inhg: "inch_of_mercury_32f",
        n: "newton", kn: "kilonewton", dyn: "dyne", kgf: "kilogram-force", lbf: "pound-force",
        w: "watt", kw: "kilowatt", mw: "megawatt", hp: "horsepower", ps: "metric_horsepower", "ftlb/s": "foot-pound per second", "btu/hr": "btu_th_per_hour",
        j: "joule", kj: "kilojoule", mj: "megajoule", kwh: "kilowatt-hour", wh: "watt_hour", cal: "calorie_th", kcal: "kilocalorie_th", btu: "british_thermal_unit_th", ev: "electronvolt", "ft-lb": "foot-pound",
        s: "second", sec: "second", ms: "millisecond", us: "microsecond", ns: "nanosecond", min: "minute", h: "hour", hr: "hour", d: "day", wk: "week", mo: "month_avg_gregorian", yr: "year_gregorian"
      };

      const unitDisplayNames = {
        meter: "Meter (m)", centimeter: "Centimeter (cm)", millimeter: "Millimeter (mm)", kilometer: "Kilometer (km)", inch: "Inch (in)", foot: "Foot (ft)", yard: "Yard (yd)", mile: "Mile (mi)", "nautical mile": "Nautical Mile (nmi)",
        gram: "Gram (g)", kilogram: "Kilogram (kg)", milligram: "Milligram (mg)", pound: "Pound (lb)", ounce: "Ounce (oz)", ton_us: "US Ton", "metric ton": "Metric Ton", stone: "Stone (st)",
        "meter per second": "Meter per Second", "kilometer per hour": "Kilometer per Hour", "mile per hour": "Mile per Hour", knot: "Knot (kt)", "foot per second": "Foot per Second",
        "square meter": "Square Meter", "square kilometer": "Square Kilometer", "square centimeter": "Square Centimeter", "square millimeter": "Square Millimeter", "square inch": "Square Inch", "square foot": "Square Foot", "square yard": "Square Yard", "square mile": "Square Mile", acre: "Acre", hectare: "Hectare",
        liter: "Liter", milliliter: "Milliliter", "cubic meter": "Cubic Meter", "cubic centimeter": "Cubic Centimeter", gallon_us_liquid: "US Gallon", quart_us_liquid: "US Quart", pint_us_liquid: "US Pint", cup_us_customary: "US Cup", fluid_ounce_us: "US Fluid Ounce", tablespoon_us: "US Tablespoon", teaspoon_us: "US Teaspoon",
        celsius: "Celsius", fahrenheit: "Fahrenheit", kelvin: "Kelvin", rankine: "Rankine", reaumur: "Reaumur",
        radian: "Radian", degree: "Degree", gradian: "Gradian", arcminute: "Arcminute", arcsecond: "Arcsecond", revolution: "Revolution",
        pascal: "Pascal", kilopascal: "Kilopascal", hectopascal: "Hectopascal", megapascal: "Megapascal", bar: "Bar", millibar: "Millibar", atmosphere_std: "Atmosphere", "pound per square inch": "Pound per Square Inch", torr: "Torr", "millimeter of mercury": "Millimeter of Mercury", inch_of_mercury_32f: "Inch of Mercury",
        newton: "Newton", kilonewton: "Kilonewton", dyne: "Dyne", "kilogram-force": "Kilogram-force", "pound-force": "Pound-force",
        watt: "Watt", kilowatt: "Kilowatt", megawatt: "Megawatt", horsepower: "Horsepower", metric_horsepower: "Metric Horsepower", "foot-pound per second": "Foot-pound per Second", btu_th_per_hour: "BTU per Hour",
        joule: "Joule", kilojoule: "Kilojoule", megajoule: "Megajoule", "kilowatt-hour": "Kilowatt-hour", watt_hour: "Watt-hour", calorie_th: "Calorie", kilocalorie_th: "Kilocalorie", british_thermal_unit_th: "BTU", electronvolt: "Electronvolt", "foot-pound": "Foot-pound",
        second: "Second", millisecond: "Millisecond", microsecond: "Microsecond", nanosecond: "Nanosecond", minute: "Minute", hour: "Hour", day: "Day", week: "Week", month_avg_gregorian: "Month (avg)", year_gregorian: "Year (avg)", decade: "Decade", century: "Century"
      };

      const categoryIcons = {
        length: "fas fa-ruler",
        mass: "fas fa-weight-hanging",
        speed: "fas fa-gauge-high",
        area: "fas fa-vector-square",
        volume: "fas fa-flask",
        temperature: "fas fa-temperature-half",
        angle: "fas fa-drafting-compass",
        pressure: "fas fa-compress",
        force: "fas fa-hand-fist",
        power: "fas fa-industry",
        energy: "fas fa-bolt",
        time: "fas fa-clock"
      };

      Object.keys(unitCategories).forEach(function (category) {
        Object.keys(unitCategories[category]).forEach(function (unit) {
          if (!unitAliases[unit]) unitAliases[unit] = unit;
        });
      });

      const unitToCategory = {};
      Object.keys(unitCategories).forEach(function (category) {
        Object.keys(unitCategories[category]).forEach(function (unit) {
          unitToCategory[unit] = category;
        });
      });

      const aliasesByUnit = {};
      Object.keys(unitAliases).forEach(function (alias) {
        const canonical = unitAliases[alias];
        if (!aliasesByUnit[canonical]) aliasesByUnit[canonical] = new Set();
        aliasesByUnit[canonical].add(alias);
      });

      const allUnits = Object.keys(unitToCategory).map(function (unit) {
        return { unit: unit, category: unitToCategory[unit], display: unitDisplayNames[unit] || toTitleCase(unit) };
      });

      function toTitleCase(value) {
        return String(value).replace(/_/g, " ").replace(/\b\w/g, function (ch) { return ch.toUpperCase(); });
      }

      function normalizeUnit(value) {
        const cleaned = String(value || "").toLowerCase().trim().replace(/\s+/g, " ");
        return unitAliases[cleaned] || cleaned;
      }

      function getCategoryForUnit(unit) {
        return unitToCategory[unit] || null;
      }

      function convertTemperature(value, fromUnit, toUnit) {
        let celsiusValue;
        switch (fromUnit) {
          case "celsius": celsiusValue = value; break;
          case "fahrenheit": celsiusValue = (value - 32) * (5 / 9); break;
          case "kelvin": celsiusValue = value - 273.15; break;
          case "rankine": celsiusValue = (value - 491.67) * (5 / 9); break;
          case "reaumur": celsiusValue = value * (5 / 4); break;
          default: return null;
        }

        switch (toUnit) {
          case "celsius": return celsiusValue;
          case "fahrenheit": return celsiusValue * (9 / 5) + 32;
          case "kelvin": return celsiusValue + 273.15;
          case "rankine": return (celsiusValue + 273.15) * (9 / 5);
          case "reaumur": return celsiusValue * (4 / 5);
          default: return null;
        }
      }

      function convert(value, fromInput, toInput) {
        const fromUnit = normalizeUnit(fromInput);
        const toUnit = normalizeUnit(toInput);
        const fromCategory = getCategoryForUnit(fromUnit);
        const toCategory = getCategoryForUnit(toUnit);
        if (!fromCategory || !toCategory || fromCategory !== toCategory) return null;
        if (fromCategory === "temperature") return convertTemperature(value, fromUnit, toUnit);

        const fromFactor = unitCategories[fromCategory][fromUnit];
        const toFactor = unitCategories[toCategory][toUnit];
        if (typeof fromFactor !== "number" || typeof toFactor !== "number") return null;
        return (value * fromFactor) / toFactor;
      }

      function parseConversionExpression(input) {
        const expression = String(input || "").trim();
        const matched = expression.match(/^([-+]?\d*\.?\d+(?:e[-+]?\d+)?)\s*(.+?)\s+to\s+(.+)$/i);
        if (!matched) return null;
        return { value: Number(matched[1]), fromUnit: matched[2].trim(), toUnit: matched[3].trim() };
      }

      function formatNumber(value) {
        if (!Number.isFinite(value)) return "N/A";
        const abs = Math.abs(value);
        if ((abs > 0 && abs < 1e-7) || abs >= 1e12) return value.toExponential(6);
        return Number(value.toPrecision(12)).toString();
      }

      function getPreferredAlias(canonicalUnit) {
        const aliasSet = aliasesByUnit[canonicalUnit];
        if (!aliasSet || aliasSet.size === 0) return canonicalUnit;
        const aliases = Array.from(aliasSet);
        const shortAlias = aliases.filter(function (alias) {
          return alias.length <= 4 && /^[a-z0-9/ ]+$/.test(alias);
        }).sort(function (a, b) { return a.length - b.length; })[0];
        return shortAlias || aliases.sort(function (a, b) { return a.length - b.length; })[0];
      }

      function getUnitSuggestions(text) {
        const rawText = String(text || "");
        const trimmed = rawText.trim();
        if (!trimmed) return [];

        const split = trimmed.split(/\s+to\s+/i);
        const hasTo = split.length > 1;
        const numberOnlyMatch = trimmed.match(/^[-+]?\d*\.?\d+(?:e[-+]?\d+)?\s*$/i);

        let query = "";
        let sourceCategory = null;

        if (hasTo) {
          query = split[1].trim().toLowerCase();
          const leftUnit = split[0].replace(/^[-+]?\d*\.?\d+(?:e[-+]?\d+)?\s*/i, "").trim();
          sourceCategory = getCategoryForUnit(normalizeUnit(leftUnit));
        } else {
          query = trimmed.replace(/^[-+]?\d*\.?\d+(?:e[-+]?\d+)?\s*/i, "").trim().toLowerCase();
        }

        const pool = allUnits.filter(function (entry) {
          return !sourceCategory || entry.category === sourceCategory;
        });

        const filtered = pool.filter(function (entry) {
          if (numberOnlyMatch) return true;
          if (!query) return false;
          if (entry.unit.includes(query) || entry.display.toLowerCase().includes(query)) return true;
          const aliases = aliasesByUnit[entry.unit] ? Array.from(aliasesByUnit[entry.unit]) : [];
          return aliases.some(function (alias) { return alias.includes(query); });
        });

        function score(entry) {
          if (numberOnlyMatch) return 1;
          let points = 0;
          const display = entry.display.toLowerCase();
          const unit = entry.unit.toLowerCase();
          const aliases = aliasesByUnit[entry.unit] ? Array.from(aliasesByUnit[entry.unit]) : [];
          if (unit === query) points += 7;
          if (display.startsWith(query)) points += 6;
          if (unit.startsWith(query)) points += 5;
          if (display.includes(query)) points += 2;
          if (aliases.includes(query)) points += 6;
          if (aliases.some(function (alias) { return alias.startsWith(query); })) points += 4;
          return points;
        }

        return filtered.sort(function (a, b) {
          const byScore = score(b) - score(a);
          if (byScore !== 0) return byScore;
          return a.display.localeCompare(b.display);
        }).slice(0, numberOnlyMatch ? 32 : 14);
      }

      function showHelperMessage(message, isHint) {
        helperText.innerHTML = isHint
          ? '<i class="fas fa-circle-info"></i><p>' + message + '</p>'
          : '<i class="fas fa-keyboard"></i><p>' + message + '</p>';
        helperText.classList.remove("hidden");
      }

      function clearDynamicResults() {
        resultsContainer.querySelectorAll(".result-card, .error-card, .related-card").forEach(function (item) {
          item.remove();
        });
      }

      function renderSuggestions(text) {
        const suggestions = getUnitSuggestions(text);
        suggestionsContainer.innerHTML = "";
        if (suggestions.length === 0) {
          suggestionsContainer.classList.add("hidden");
          return;
        }

        suggestions.forEach(function (item, index) {
          const suggestion = document.createElement("div");
          suggestion.className = "suggestion-item";
          suggestion.dataset.unit = item.unit;
          suggestion.dataset.index = String(index);
          suggestion.innerHTML = "<strong>" + item.display + "</strong><span>" + toTitleCase(item.category) + "</span>";
          suggestion.addEventListener("click", function () { selectSuggestion(item.unit); });
          suggestionsContainer.appendChild(suggestion);
        });

        suggestionsContainer.classList.remove("hidden");
      }

      function selectSuggestion(canonicalUnit) {
        const existingText = conversionInput.value;
        const alias = getPreferredAlias(canonicalUnit);

        let updatedValue = "";
        if (/\s+to\s+/i.test(existingText)) {
          const leftPart = existingText.split(/\s+to\s+/i)[0].trim();
          updatedValue = leftPart + " to " + alias + " ";
        } else {
          const numberMatch = existingText.trim().match(/^([-+]?\d*\.?\d+(?:e[-+]?\d+)?)\s*(.*)$/i);
          if (numberMatch && numberMatch[1]) updatedValue = numberMatch[1] + " " + alias + " to ";
          else updatedValue = alias + " ";
        }

        conversionInput.value = updatedValue;
        conversionInput.focus();
        suggestionsContainer.classList.add("hidden");
        performConversion(updatedValue);
      }

      function addRelatedConversions(value, fromCanonicalUnit) {
        const category = getCategoryForUnit(fromCanonicalUnit);
        if (!category) return;

        const otherUnits = Object.keys(unitCategories[category]).filter(function (unit) {
          return unit !== fromCanonicalUnit;
        }).slice(0, 6);

        if (otherUnits.length === 0) return;

        const relatedCard = document.createElement("div");
        relatedCard.className = "related-card";
        relatedCard.id = "related-conversions";
        relatedCard.innerHTML = "<h3>Other quick conversions</h3>";

        const relatedGrid = document.createElement("div");
        relatedGrid.className = "related-grid";

        otherUnits.forEach(function (unit) {
          const converted = convert(value, fromCanonicalUnit, unit);
          if (converted === null || !Number.isFinite(converted)) return;
          const item = document.createElement("div");
          item.className = "related-item";
          item.innerHTML = "<strong>" + formatNumber(converted) + "</strong> " + (unitDisplayNames[unit] || toTitleCase(unit));
          relatedGrid.appendChild(item);
        });

        if (relatedGrid.childElementCount > 0) {
          relatedCard.appendChild(relatedGrid);
          resultsContainer.appendChild(relatedCard);
        }
      }
      function performConversion(rawInput) {
        const text = String(rawInput || "");
        const trimmed = text.trim();
        clearInputBtn.classList.toggle("hidden", trimmed.length === 0);
        clearDynamicResults();

        if (!trimmed) {
          showHelperMessage("Start typing to see instant conversions.", false);
          return;
        }

        const parsed = parseConversionExpression(trimmed);
        if (!parsed || Number.isNaN(parsed.value)) {
          showHelperMessage('Use format like "5 km to mile".', true);
          return;
        }

        const fromCanonical = normalizeUnit(parsed.fromUnit);
        const toCanonical = normalizeUnit(parsed.toUnit);
        const result = convert(parsed.value, parsed.fromUnit, parsed.toUnit);

        helperText.classList.add("hidden");

        if (result === null || !Number.isFinite(result)) {
          const errorCard = document.createElement("div");
          errorCard.className = "error-card";
          errorCard.textContent = "Conversion not possible. Please use units from the same category.";
          resultsContainer.appendChild(errorCard);
          return;
        }

        const sourceDisplay = unitDisplayNames[fromCanonical] || parsed.fromUnit;
        const targetDisplay = unitDisplayNames[toCanonical] || parsed.toUnit;

        const resultCard = document.createElement("div");
        resultCard.className = "result-card";
        resultCard.id = "primary-result";
        resultCard.innerHTML =
          '<div class="result-head">' +
          '<div>' +
          '<p class="result-source">' + formatNumber(parsed.value) + ' ' + sourceDisplay + '</p>' +
          '<p class="result-value">' + formatNumber(result) + ' ' + targetDisplay + '</p>' +
          '</div>' +
          '<div class="result-icon"><i class="fas fa-right-left"></i></div>' +
          '</div>';

        resultsContainer.appendChild(resultCard);
        addRelatedConversions(parsed.value, fromCanonical);
      }

      function fillCategories() {
        categoriesGrid.innerHTML = '';
        Object.keys(unitCategories).sort().forEach(function (category) {
          const card = document.createElement("div");
          card.className = "category-card";
          const icon = categoryIcons[category] || "fas fa-square";
          const unitsCount = Object.keys(unitCategories[category]).length;
          card.innerHTML = '<i class="' + icon + '" style="color:var(--ic-primary); font-size:1.2rem;"></i><div><strong style="display:block; font-size:0.95rem;">' + toTitleCase(category) + '</strong><span style="font-size:0.8rem; color:var(--ic-text-muted);">' + unitsCount + ' units</span></div>';
          card.addEventListener("click", function () {
            const sampleUnits = Object.keys(unitCategories[category]);
            if (sampleUnits.length >= 2) {
              const fromU = getPreferredAlias(sampleUnits[0]);
              const toU = getPreferredAlias(sampleUnits[1]);
              conversionInput.value = "10 " + fromU + " to " + toU;
              performConversion(conversionInput.value);
              conversionInput.focus();
              window.scrollTo({ top: conversionInput.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
            }
          });
          categoriesGrid.appendChild(card);
        });
      }

      function setActiveSuggestion(index) {
        const items = Array.from(suggestionsContainer.querySelectorAll(".suggestion-item"));
        items.forEach(function (item) { item.classList.remove("active"); });
        if (index >= 0 && index < items.length) {
          items[index].classList.add("active");
          items[index].scrollIntoView({ block: "nearest" });
        }
      }

      fillCategories();
      let activeSuggestionIndex = -1;

      conversionInput.addEventListener("input", function () {
        activeSuggestionIndex = -1;
        renderSuggestions(conversionInput.value);
        performConversion(conversionInput.value);
      });

      conversionInput.addEventListener("keydown", function (event) {
        const items = Array.from(suggestionsContainer.querySelectorAll(".suggestion-item"));
        if (items.length === 0 || suggestionsContainer.classList.contains("hidden")) return;

        if (event.key === "ArrowDown") {
          event.preventDefault();
          activeSuggestionIndex = activeSuggestionIndex >= items.length - 1 ? 0 : activeSuggestionIndex + 1;
          setActiveSuggestion(activeSuggestionIndex);
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          activeSuggestionIndex = activeSuggestionIndex <= 0 ? items.length - 1 : activeSuggestionIndex - 1;
          setActiveSuggestion(activeSuggestionIndex);
        } else if ((event.key === "Enter" || event.key === "Tab") && activeSuggestionIndex >= 0) {
          event.preventDefault();
          selectSuggestion(items[activeSuggestionIndex].dataset.unit);
        }
      });

      conversionInput.addEventListener("focus", function () {
        renderSuggestions(conversionInput.value || " ");
      });

      clearInputBtn.addEventListener("click", function () {
        conversionInput.value = "";
        clearInputBtn.classList.add("hidden");
        suggestionsContainer.classList.add("hidden");
        clearDynamicResults();
        showHelperMessage("Start typing to see instant conversions.", false);
        conversionInput.focus();
      });

      document.addEventListener("click", function (event) {
        const insideInput = conversionInput.contains(event.target);
        const insideSuggestions = suggestionsContainer.contains(event.target);
        if (!insideInput && !insideSuggestions) suggestionsContainer.classList.add("hidden");
      });

      toggleCategoriesBtn.addEventListener("click", function (e) {
        e.preventDefault();
        const isHidden = categoriesGridContainerEl.classList.contains("hidden") || categoriesGridContainerEl.style.display === "none";
        if (isHidden) {
          categoriesGridContainerEl.classList.remove("hidden");
          categoriesGridContainerEl.style.display = "block";
          toggleCategoriesBtn.setAttribute("aria-expanded", "true");
          toggleCategoriesText.textContent = "Hide supported categories";
          const icon = toggleCategoriesBtn.querySelector("i");
          if (icon) icon.className = "fas fa-chevron-up";
        } else {
          categoriesGridContainerEl.classList.add("hidden");
          categoriesGridContainerEl.style.display = "none";
          toggleCategoriesBtn.setAttribute("aria-expanded", "false");
          toggleCategoriesText.textContent = "Show supported categories";
          const icon = toggleCategoriesBtn.querySelector("i");
          if (icon) icon.className = "fas fa-chevron-down";
        }
      });
    });
