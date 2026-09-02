# -*- coding: utf-8 -*-
"""Fix remaining instatheme.webp refs (JSON-LD screenshot fields) + validate defer tag."""
import os

ROOT = r'c:\Users\ravin\Videos\instacalc-main-2026\instacalc-main - omni - Cline'
targets = ['rdcalculator.html', r'ru\rdcalculator.html']

for rel in targets:
    p = os.path.join(ROOT, rel)
    with open(p, 'rb') as f:
        b = f.read()
    bom = b.startswith(b'\xef\xbb\xbf')
    t = b.decode('utf-8-sig') if bom else b.decode('utf-8')
    n = t.count('instatheme.webp')
    if n:
        t = t.replace('instatheme.webp', 'instatheme-og.jpg')
        data = t.encode('utf-8')
        if bom:
            data = b'\xef\xbb\xbf' + data
        with open(p, 'wb') as f:
            f.write(data)
        print('UPDATED', rel, 'replacements:', n)
    else:
        print('no webp ref in', rel)

# validate diagonal defer tag (robust string check)
diag = os.path.join(ROOT, 'moretools', 'diagonalcalculator.html')
t = open(diag, encoding='utf-8-sig').read()
print('diag contains diagonalcalculator.js:', 'diagonalcalculator.js' in t)
print('diag contains defer attr:', '<script defer src="diagonalcalculator.js">' in t)
print('diag inline engine gone:', 'const $=id=>' not in t)
# count defer script src total
import re
print('defer script tags:', len(re.findall(r'<script[^>]*defer[^>]*>', t)))
print('non-defer external scripts:', len(re.findall(r'<script[^>]*src="[^"]+"[^>]*>(?!defer)', t)))
print('DONE')