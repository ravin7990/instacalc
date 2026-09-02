import os
import re

root_dir = r"c:\Users\ravin\Videos\instacalc-main-2026\instacalc-main - omni - Cline"

stats = {
    "core_css_restored": 0,
    "files_modified": 0
}

# Regex to match the preloaded instacalc-core.css pattern and restore standard stylesheet link
# Matches:
# <link rel="preload" as="style" href="([^"]*instacalc-core\.css[^"]*)" onload="this.onload=null;this.rel='stylesheet'">\s*<noscript><link rel="stylesheet" href="[^"]*instacalc-core\.css[^"]*"></noscript>
preload_core_pattern = re.compile(
    r'<link\s+rel="preload"\s+as="style"\s+href="([^"]*instacalc-core\.css[^"]*)"\s+onload="this\.onload=null;this\.rel=\'stylesheet\'">\s*(?:<noscript>\s*<link\s+rel="stylesheet"\s+href="[^"]*instacalc-core\.css[^"]*">\s*</noscript>)?',
    re.IGNORECASE
)

for dirpath, dirnames, filenames in os.walk(root_dir):
    if "scratch" in dirpath or ".git" in dirpath:
        continue
    for filename in filenames:
        if not filename.endswith(".html"):
            continue
        
        filepath = os.path.join(dirpath, filename)
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            
        orig = content
        
        # Restore standard link rel="stylesheet" for instacalc-core.css
        if preload_core_pattern.search(content):
            content = preload_core_pattern.sub(r'<link rel="stylesheet" href="\1">', content)
            stats["core_css_restored"] += 1
            
        if content != orig:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            stats["files_modified"] += 1

print("CLS Optimization Results:")
for k, v in stats.items():
    print(f"  {k}: {v}")
