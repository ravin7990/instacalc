import os
import re

root_dir = r"c:\Users\ravin\Videos\instacalc-main-2026\instacalc-main - omni - Cline"

stats = {
    "head_scripts_removed": 0,
    "fonts_optimized": 0,
    "autofocus_removed": 0,
    "files_modified": 0
}

# Regex to match the blocking language redirect in <head>
# Matches:
# <script>
# (function() {
#   const pref / const userLang ...
#   ...
#   window.location.replace(...);
#   ...
# })();
# </script>
head_script_pattern = re.compile(r"(\s*<script>\s*\(function\s*\(\)\s*\{[^<]*?(?:user_lang|pref)[^<]*?window\.location\.replace[^<]*?\}\)\(\);\s*</script>)", re.DOTALL)
head_script_pattern2 = re.compile(r"(\s*<script>\s*\(function\s*\(\)\s*\{[^<]*?localStorage\.getItem\([^<]*?window\.location\.replace[^<]*?\}\)\(\);\s*</script>)", re.DOTALL)

# Font patterns matching any Google Font stylesheet URL with display=swap
font_pattern = re.compile(r'https://fonts\.googleapis\.com/css2\?[^"\'\s>]*display=swap')
optimized_font = 'https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;600;700&family=Sora:wght@700&display=swap'

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
        
        # 1. Remove blocking head redirect script
        if head_script_pattern.search(content):
            content = head_script_pattern.sub("\n  <!-- Geo/language routing is handled by hreflang clusters + the language dialog. -->", content)
            stats["head_scripts_removed"] += 1
        elif head_script_pattern2.search(content):
            content = head_script_pattern2.sub("\n  <!-- Geo/language routing is handled by hreflang clusters + the language dialog. -->", content)
            stats["head_scripts_removed"] += 1
            
        # 2. Optimize Google Fonts
        if font_pattern.search(content):
            new_content = font_pattern.sub(optimized_font, content)
            if new_content != content:
                content = new_content
                stats["fonts_optimized"] += 1
                
        # 3. Remove onload conversionInput.focus();
        if "conversionInput.focus();" in content:
            # Only remove the one near the end of DOMContentLoaded (not inside button listeners)
            subbed = re.sub(r'(\n\s*conversionInput\.focus\(\);\s*)(\n\s*\}\);\s*</script>)', r'\2', content)
            if subbed != content:
                content = subbed
                stats["autofocus_removed"] += 1

        if content != orig:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            stats["files_modified"] += 1

print("Optimization Results:")
for k, v in stats.items():
    print(f"  {k}: {v}")
