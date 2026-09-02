import re

index_path = r"c:\Users\ravin\Videos\instacalc-main-2026\instacalc-main - omni - Cline\index.html"
js_path = r"c:\Users\ravin\Videos\instacalc-main-2026\instacalc-main - omni - Cline\unit-converter.js"

with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

pattern = re.compile(r"<script>\s*(document\.addEventListener\(\"DOMContentLoaded\", function \(\) \{\s*const conversionInput = document\.getElementById\(\"conversion-input\"\);.*?\s*\}\);)\s*</script>", re.DOTALL)

match = pattern.search(content)
if match:
    inner_js = match.group(1).strip()
    with open(js_path, "w", encoding="utf-8") as f:
        f.write(inner_js + "\n")
    
    new_content = pattern.sub('<script src="unit-converter.js" defer></script>', content)
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Successfully extracted unit-converter.js and updated index.html")
else:
    print("Regex match failed")
