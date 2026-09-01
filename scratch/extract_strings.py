import os
import re
import json

files = [
    "cagrcalculator.html",
    "catagecalculator.html",
    "compoundinterest.html",
    "epfcalculator.html",
    "gratuitycalculator.html",
    "gstcalculator.html",
    "mutualfundreturncalculator.html",
    "npscalculator.html",
    "ppfcalculator.html",
    "duration/agecalculator.html",
    "moretools/diagonalcalculator.html",
    "moretools/trignometrycalculator.html"
]

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
results = {}


for f in files:
    path = os.path.join(base_dir, f)
    if not os.path.exists(path):
        continue
        
    with open(path, "r", encoding="utf-8") as file:
        content = file.read()
        
    # Find scripts
    eng_scripts = re.findall(r"<script\b[^>]*>([\s\S]*?)</script>", content)
    calc_script = None
    for s in eng_scripts:
        if "(function" in s or "function calculate" in s or "const defaults" in s:
            if calc_script is None or len(s) > len(calc_script):
                calc_script = s
                
    if calc_script:
        # Extract double and single quoted strings (simple regex)
        # Avoid matching URL schemes or imports
        strings = re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"|\'([^\'\\]*(?:\\.[^\'\\]*)*)\'', calc_script)
        flat_strings = []
        for d, s in strings:
            val = d if d else s
            if val and len(val.strip()) > 0 and not val.startswith("http") and not val.startswith("https") and not val.startswith("."):
                flat_strings.append(val)
        # Remove duplicates preserving order
        seen = set()
        unique_strings = [x for x in flat_strings if not (x in seen or seen.add(x))]
        results[f] = unique_strings

with open(os.path.join(base_dir, "scratch", "extracted_strings.json"), "w", encoding="utf-8") as out_file:
    json.dump(results, out_file, indent=2, ensure_ascii=False)
print("Extracted strings written to scratch/extracted_strings.json")
