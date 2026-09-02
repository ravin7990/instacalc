# -*- coding: utf-8 -*-
"""Final verification after performance pass."""
import os, re

ROOT = r'c:\Users\ravin\Videos\instacalc-main-2026\instacalc-main - omni - Cline'
SKIP = {'scratch', 'bootstrap', '.kilo'}

html_files = []
for d, dirs, fs in os.walk(ROOT):
    dirs[:] = [x for x in dirs if x not in SKIP and not x.startswith('.')]
    for f in fs:
        if f.endswith('.html'):
            html_files.append(os.path.join(d, f))

rel = lambda p: os.path.relpath(p, ROOT).replace('\\', '/')

# 1. diagonal page integration check
diag = next((p for p in html_files if p.endswith('moretools\\diagonalcalculator.html')), None)
if diag:
    t = open(diag, encoding='utf-8-sig').read()
    print('diag has defer external js:', bool(re.search(r'<script defer src="diagonalcalculator\.js"></script>', t)))
    print('diag inline engine removed:', not re.search(r'function\(\)\{', t))
    print('diag still has firebase module:', bool(re.search(r'firebase\.js', t)))
    print('diag still has lang dialog:', bool(re.search(r'language-dialog\.js', t)))

# 2. dangling references to deleted files
dangling = ['author.png', 'author-200.png', 'geo-router', 'style2s.css', 'style.css', 'bootstrap', 'instatheme.webp']
for pat in dangling:
    n = 0
    for p in html_files:
        try:
            if pat in open(p, encoding='utf-8-sig').read():
                n += 1
        except Exception:
            pass
    print('dangling ref count', pat, '->', n)

# 3. broken internal links
broken = {}
for p in html_files:
    src = rel(p)
    base = os.path.dirname(src) if os.path.dirname(src) else ''
    try:
        t = open(p, encoding='utf-8-sig').read()
    except Exception:
        continue
    for m in re.finditer(r'href="([a-zA-Z0-9\./_\-]+\.html)"', t):
        href = m.group(1)
        if href.startswith(('http', '#', '//')):
            continue
        full = os.path.normpath(os.path.join(base, href)).replace('\\', '/')
        if not os.path.isfile(os.path.join(ROOT, full)):
            broken.setdefault(full, []).append(src)
if not broken:
    print('BROKEN LINKS: none')
else:
    for k, v in broken.items():
        print('BROKEN:', k, '<-', v[:3])

# 4. blocking core css still present anywhere
n_blocking = 0
for p in html_files:
    t = open(p, encoding='utf-8-sig').read()
    if re.search(r'<link rel="stylesheet" href="(?:\.\./)*instacalc-core\.css">', t):
        n_blocking += 1
        print('BLOCKING core.css:', rel(p))
print('pages with blocking core.css:', n_blocking)

# 5. async core css count + critical css count
n_async = len([p for p in html_files if re.search(r'instacalc-core\.css\?v=3', open(p, encoding='utf-8-sig').read())])
n_critical = len([p for p in html_files if 'Critical above-the-fold' in open(p, encoding='utf-8-sig').read()])
print('async core css pages:', n_async, '/ critical-css pages:', n_critical, '/ total:', len(html_files))

# 6. og image final state
n_og_jpg = len([p for p in html_files if 'instatheme-og.jpg' in open(p, encoding='utf-8-sig').read()])
print('pages with og jpg:', n_og_jpg)
print('DONE')