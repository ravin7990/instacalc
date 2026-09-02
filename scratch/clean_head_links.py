import os
import re

root_dir = r"c:\Users\ravin\Videos\instacalc-main-2026\instacalc-main - omni - Cline"

stats = {
    "files_cleaned": 0
}

# Regex to match any chaotic combination of google fonts / fontawesome preload + noscript
# and replace with clean, proper stylesheets
font_and_fa_block = re.compile(
    r'(<link\s+rel="preconnect"\s+href="https://fonts\.googleapis\.com">\s*<link\s+rel="preconnect"\s+href="https://fonts\.gstatic\.com"\s+crossorigin>)'
    r'[\s\S]*?'
    r'(?=<style|<link rel="stylesheet" href="[^"]*instacalc-core|<script type="application/ld\+json">)',
    re.IGNORECASE
)

clean_replacement = (
    r'\1\n'
    r'  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;600;700&family=Sora:wght@700&display=swap">\n'
    r'  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.7.2/css/all.min.css">\n'
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
        
        if font_and_fa_block.search(content):
            content = font_and_fa_block.sub(clean_replacement, content)
            
        # Clean up any orphaned </noscript></noscript>
        content = re.sub(r'</noscript>\s*</noscript>', '</noscript>', content)
        
        if content != orig:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            stats["files_cleaned"] += 1

print("Head Links Cleanup Results:")
for k, v in stats.items():
    print(f"  {k}: {v}")
