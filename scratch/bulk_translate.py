import os
import re
import urllib.request
import urllib.parse
import json
import time

CACHE_FILE = 'scratch/translation_cache.json'
translation_cache = {}

if os.path.exists(CACHE_FILE):
    try:
        with open(CACHE_FILE, 'r', encoding='utf-8') as f:
            translation_cache = json.load(f)
    except:
        pass

def save_cache():
    try:
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(translation_cache, f, ensure_ascii=False, indent=2)
    except:
        pass

def translate_single(text, from_lang='en', to_lang='ru'):
    cleaned = text.strip()
    if not cleaned:
        return text
    if cleaned in translation_cache:
        return translation_cache[cleaned]
        
    try:
        url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + from_lang + "&tl=" + to_lang + "&dt=t&q=" + urllib.parse.quote(cleaned)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode('utf-8'))
            translated = "".join([sentence[0] for sentence in res[0]])
            translation_cache[cleaned] = translated
            return translated
    except Exception as e:
        print(f"Error translating single '{cleaned[:30]}...': {e}")
        return text

def translate_batch(texts, from_lang='en', to_lang='ru'):
    # Filter out texts already in cache
    needed = [t for t in texts if t.strip() and t.strip() not in translation_cache]
    
    if not needed:
        return {t: translation_cache.get(t.strip(), t) for t in texts}
        
    print(f"Batch translating {len(needed)} new strings...")
    
    # We will chunk the translations to avoid too long URLs
    chunk_size = 15
    chunks = [needed[i:i + chunk_size] for i in range(0, len(needed), chunk_size)]
    
    for idx, chunk in enumerate(chunks):
        separator = "\n---\n"
        joined_text = separator.join(chunk)
        
        try:
            url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + from_lang + "&tl=" + to_lang + "&dt=t&q=" + urllib.parse.quote(joined_text)
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            
            with urllib.request.urlopen(req) as response:
                res = json.loads(response.read().decode('utf-8'))
                translated_joined = "".join([sentence[0] for sentence in res[0]])
                
                parts = [p.strip() for p in translated_joined.split("---")]
                # Strip leading/trailing dashes or whitespace
                parts = [re.sub(r'^-\s*|\s*-$', '', p).strip() for p in parts]
                
                if len(parts) == len(chunk):
                    for orig, trans in zip(chunk, parts):
                        translation_cache[orig.strip()] = trans
                else:
                    # Fallback to single translation for this chunk
                    print(f"Size mismatch in chunk {idx} (expected {len(chunk)}, got {len(parts)}). Translating individually.")
                    for item in chunk:
                        translate_single(item, from_lang, to_lang)
            # Sleep slightly to prevent rate limits
            time.sleep(0.5)
        except Exception as e:
            print(f"Batch error in chunk {idx}: {e}. Translating individually.")
            for item in chunk:
                translate_single(item, from_lang, to_lang)
                
    save_cache()
    return {t: translation_cache.get(t.strip(), t) for t in texts}

def extract_strings_to_translate(html_content):
    # 1. Text nodes inside tags (ignore script, style, code, svg)
    # We can use a regex that matches text between > and <
    # We will strip away tags and then inspect
    # Let's write a simple state-machine or regex approach
    # Let's remove script and style blocks to avoid extracting from them
    temp_content = re.sub(r'<script\b[^>]*>([\s\S]*?)</script>', '', html_content)
    temp_content = re.sub(r'<style\b[^>]*>([\s\S]*?)</style>', '', temp_content)
    
    text_matches = re.findall(r'>([^<]+)<', temp_content)
    
    clean_texts = []
    for text in text_matches:
        t = text.strip()
        # Ignore numbers, currencies, formatting symbols, empty strings
        if not t:
            continue
        if re.match(r'^[0-9\s\.,%\-\+\*/\(\)\$\u20b9\u25b2\u25bc\u20bd]+$', t):
            continue
        # Ignore code snippets
        if '{' in t or '}' in t or 'function(' in t:
            continue
        clean_texts.append(t)
        
    # 2. Extract meta contents (descriptions, titles)
    meta_desc_matches = re.findall(r'<meta\s+(?:name|property)="[^"]*description"\s+content="([^"]+)"', html_content, re.IGNORECASE)
    for m in meta_desc_matches:
        clean_texts.append(m.strip())
        
    meta_title_matches = re.findall(r'<meta\s+(?:name|property)="[^"]*title"\s+content="([^"]+)"', html_content, re.IGNORECASE)
    for m in meta_title_matches:
        clean_texts.append(m.strip())
        
    title_match = re.search(r'<title>(.*?)</title>', html_content, re.IGNORECASE)
    if title_match:
        clean_texts.append(title_match.group(1).strip())
        
    # 3. Extract placeholder / alt attributes
    placeholder_matches = re.findall(r'placeholder="([^"]+)"', html_content)
    for p in placeholder_matches:
        clean_texts.append(p.strip())
        
    alt_matches = re.findall(r'alt="([^"]+)"', html_content)
    for a in alt_matches:
        clean_texts.append(a.strip())
        
    # 4. Extract common JSON-LD strings (specifically inside FAQ schema)
    # Questions and Answers
    faq_matches = re.findall(r'"name"\s*:\s*"([^"]+)"', html_content)
    for f in faq_matches:
        if not f.startswith('http') and len(f) > 3:
            clean_texts.append(f.strip())
            
    faq_text_matches = re.findall(r'"text"\s*:\s*"([^"]+)"', html_content)
    for f in faq_text_matches:
        if not f.startswith('http') and len(f) > 3:
            clean_texts.append(f.strip())

    # 5. Extract common script strings (like chart labels, headers, table headers in JS code)
    # We will search inside script blocks for keys like label: "..." or text: "..."
    script_blocks = re.findall(r'<script\b[^>]*>([\s\S]*?)</script>', html_content)
    for sb in script_blocks:
        label_matches = re.findall(r'label\s*:\s*["\']([^"\']+)["\']', sb)
        for lm in label_matches:
            if len(lm) > 2 and not lm.startswith('#'):
                clean_texts.append(lm.strip())
        title_matches = re.findall(r'title\s*:\s*["\']([^"\']+)["\']', sb)
        for tm in title_matches:
            if len(tm) > 2:
                clean_texts.append(tm.strip())
        alert_matches = re.findall(r'alert\s*\(\s*["\']([^"\']+)["\']', sb)
        for am in alert_matches:
            clean_texts.append(am.strip())
            
    return sorted(list(set(clean_texts)), key=len, reverse=True)

def translate_file(filename):
    print(f"\n========================================\nProcessing: {filename}")
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Get all strings to translate
    strings = extract_strings_to_translate(content)
    print(f"Found {len(strings)} strings to translate.")
    
    # Translate all in batch
    translations = translate_batch(strings)
    
    # Replace in file (longest strings first to prevent nested replacing issues!)
    for orig in strings:
        trans = translations.get(orig)
        if trans and orig != trans:
            content = content.replace(orig, trans)
            
    # Apply structural replacements and path adjustments
    # Redirect logic inside <head>
    content = re.sub(
        r'if\s*\(\s*userLang\s*===\s*[\'"]ja[\'"][\s\S]*?\}\s*\)\s*;?',
        'if (userLang === \'ja\' || (!userLang && browserLang.startsWith(\'ja\'))) {\n        window.location.replace(\'./ja/\' + window.location.pathname.split(\'/\').pop());\n      } else if (userLang === \'ko\' || (!userLang && browserLang.startsWith(\'ko\'))) {\n        window.location.replace(\'./ko/\' + window.location.pathname.split(\'/\').pop());\n      } else if (userLang === \'ru\' || (!userLang && browserLang.startsWith(\'ru\'))) {\n        window.location.replace(\'./ru/\' + window.location.pathname.split(\'/\').pop());\n      }',
        content
    )
    
    # Update lang switcher default settings inside <script>
    content = content.replace("localStorage.setItem('user_lang', 'en')", "localStorage.setItem('user_lang', 'ru')")
    content = content.replace('html lang="en"', 'html lang="ru"')
    content = content.replace('html lang="ja"', 'html lang="ru"')
    
    # Relative path updates (we are now in ru/ folder)
    content = content.replace('href="favicon.ico"', 'href="../favicon.ico"')
    content = content.replace('href="favicon.webp"', 'href="../favicon.webp"')
    content = content.replace('src="logo.png"', 'src="../logo.png"')
    content = content.replace('src="currency-manager.js"', 'src="../currency-manager.js"')
    content = content.replace('src="backToTop.js"', 'src="../backToTop.js"')
    
    # Language select dropdown selection
    content = content.replace('<option value="en" selected>English</option>', '<option value="en">English</option>')
    content = content.replace('<option value="ja" selected>日本語</option>', '<option value="ja">日本語</option>')
    content = content.replace('<option value="ru">Русский</option>', '<option value="ru" selected>Русский</option>')
    
    # Redirect check logic at the beginning of the file
    redirect_pattern = r'\(function\s*\(\)\s*\{[\s\S]*?\}\)\(\);'
    redirect_replacement = '(function () {\n      localStorage.setItem(\'user_lang\', \'ru\');\n    })();'
    # Only replace redirect script inside head if it's already there
    content = re.sub(r'<script>\s*\(function\s*\(\)\s*\{[\s\S]*?\}\)\(\);\s*</script>', '<script>\n    (function () {\n      localStorage.setItem(\'user_lang\', \'ru\');\n    })();\n  </script>', content)

    # Output file path
    output_path = os.path.join('ru', filename)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Saved localized: {output_path}")

if __name__ == '__main__':
    translate_file('sipcalculator.html')
