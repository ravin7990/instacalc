import re
import sys
import json
import time
import urllib.request
import urllib.parse

CACHE_FILES = {
    'ru': 'scratch/translation_cache.json',
    'ko': 'scratch/translation_cache_ko.json',
}
SCRIPT_RANGES = {
    'ru': [(0x0400, 0x04FF)],
    'ko': [(0xAC00, 0xD7AF), (0x1100, 0x11FF)],
}

def load_cache(lang):
    path = CACHE_FILES[lang]
    cache = {}
    try:
        with open(path, 'r', encoding='utf-8') as f:
            cache = json.load(f)
    except Exception:
        pass
    return cache

def save_cache(lang, cache):
    try:
        with open(CACHE_FILES[lang], 'w', encoding='utf-8') as f:
            json.dump(cache, f, ensure_ascii=False, indent=2)
    except Exception:
        pass

def has_target_script(text, lang):
    return any(lo <= ord(ch) <= hi for ch in text for lo, hi in SCRIPT_RANGES[lang])

def translate_single(text, lang, cache):
    cleaned = text.strip()
    if not cleaned:
        return text
    if cleaned in cache:
        return cache[cleaned]
    try:
        url = ("https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl="
               + lang + "&dt=t&q=" + urllib.parse.quote(cleaned))
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as response:
            res = json.loads(response.read().decode('utf-8'))
            translated = "".join([sentence[0] for sentence in res[0]])
            cache[cleaned] = translated
            return translated
    except Exception as e:
        print("  ERR single: %s" % e)
        return text

def translate_batch(texts, lang, cache):
    needed = [t for t in texts if t.strip() and t.strip() not in cache]
    if not needed:
        return
    print("  translating %d new strings..." % len(needed))
    chunks = [needed[i:i + 12] for i in range(0, len(needed), 12)]
    for idx, chunk in enumerate(chunks):
        joined = "\n@@@\n".join(chunk)
        try:
            url = ("https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl="
                   + lang + "&dt=t&q=" + urllib.parse.quote(joined))
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=25) as response:
                res = json.loads(response.read().decode('utf-8'))
                translated = "".join([sentence[0] for sentence in res[0]])
                parts = [p.strip() for p in translated.split("@@@")]
                if len(parts) == len(chunk):
                    for orig, trans in zip(chunk, parts):
                        cache[orig] = trans
                else:
                    for item in chunk:
                        translate_single(item, lang, cache)
            time.sleep(0.4)
        except Exception as e:
            print("  batch chunk %d failed (%s), falling back" % (idx, e))
            for item in chunk:
                translate_single(item, lang, cache)
    save_cache(lang, cache)

def extract_strings(html):
    temp = re.sub(r'<script\b[^>]*>[\s\S]*?</script>', '', html)
    temp = re.sub(r'<style\b[^>]*>[\s\S]*?</style>', '', temp)
    texts = []
    for t in re.findall(r'>([^<]+)<', temp):
        s = t.strip()
        if not s or len(s) < 2:
            continue
        if re.match(r'^[0-9\s\.,%\-\+\*/\(\)\$\u20b9\u20bd\u25b2\u25bc:=x]+$', s):
            continue
        if '{' in s or '}' in s or '<' in s:
            continue
        texts.append(s)
    # meta title/description/keywords/og/twitter
    for m in re.findall(r'<meta\s+[^>]*?(?:name|property)="(?:[^"]*(?:title|description|keywords))"[^>]*?content="([^"]+)"', html):
        texts.append(m.strip())
    for m in re.findall(r'<meta\s+[^>]*?content="([^"]+)"[^>]*?(?:name|property)="(?:[^"]*(?:title|description|keywords))"', html):
        texts.append(m.strip())
    tm = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE)
    if tm:
        texts.append(tm.group(1).strip())
    for p in re.findall(r'placeholder="([^"]+)"', html):
        texts.append(p.strip())
    for a in re.findall(r'alt="([^"]+)"', html):
        if len(a.strip()) > 1:
            texts.append(a.strip())
    # JSON-LD keys
    for key in ('name', 'text', 'description'):
        for f in re.findall(r'"%s"\s*:\s*"([^"]+)"' % key, html):
            if not f.startswith('http') and len(f) > 3:
                texts.append(f.strip())
    # JS label/title/alert strings
    for sb in re.findall(r'<script\b[^>]*>([\s\S]*?)</script>', html):
        for pat in (r'label\s*:\s*["\']([^"\']+)["\']', r'title\s*:\s*["\']([^"\']+)["\']',
                    r'alert\s*\(\s*["\']([^"\']+)["\']'):
            for lm in re.findall(pat, sb):
                if len(lm) > 2 and not lm.startswith('#') and '{' not in lm:
                    texts.append(lm.strip())
    # dedupe preserving order, drop already-target-language strings
    seen = set()
    out = []
    for t in texts:
        if t in seen or has_target_script(t, LANG):
            continue
        seen.add(t)
        out.append(t)
    return sorted(out, key=len, reverse=True)

def translate_file(path, lang, cache):
    print("== %s ==" % path)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    strings = extract_strings(content)
    print("  %d strings to translate" % len(strings))
    translate_batch(strings, lang, cache)
    changed = 0
    for orig in strings:
        trans = cache.get(orig)
        if trans and trans != orig:
            content = content.replace(orig, trans)
            changed += 1
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("  replaced %d strings" % changed)

JOBS = [
    ('ko/moretools/concretecalculator.html', 'ko'),
    ('ko/moretools/trignometrycalculator.html', 'ko'),
    ('ru/cagrcalculator.html', 'ru'),
    ('ru/duration/agecalculator.html', 'ru'),
    ('ru/moretools/concretecalculator.html', 'ru'),
    ('ru/moretools/trignometrycalculator.html', 'ru'),
]

only = sys.argv[1] if len(sys.argv) > 1 else None
for path, lang in JOBS:
    if only and only not in path:
        continue
    LANG = lang
    cache = load_cache(lang)
    translate_file(path, lang, cache)
print("TRANSLATION DONE")
