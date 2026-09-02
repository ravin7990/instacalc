# -*- coding: utf-8 -*-
"""Extract diagonal calculator's large inline engine JS to an external deferred file,
and downscale author.png (4 references) to a 200px optimized PNG."""
import os, re

ROOT = r'c:\Users\ravin\Videos\instacalc-main-2026\instacalc-main - omni - Cline'

def read_py(p):
    with open(p, 'rb') as f: b = f.read()
    has_bom = b.startswith(b'\xef\xbb\xbf')
    return b.decode('utf-8-sig') if has_bom else b.decode('utf-8'), has_bom

def write_py(p, text, bom):
    data = text.encode('utf-8')
    if bom: data = b'\xef\xbb\xbf' + data
    with open(p, 'wb') as f: f.write(data)

# ---- 1. diagonal inline engine JS ----
page = os.path.join(ROOT, 'moretools', 'diagonalcalculator.html')
html, bom = read_py(page)
idx = html.rfind('<script>')
if idx == -1:
    print('NO inline script found!')
else:
    end = html.find('</script>', idx)
    content = html[idx + len('<script>'):end]
    print('engine span:', idx, '->', end, 'bytes:', len(content))
    # sanity: must be an IIFE or contain function
    print('starts with:', repr(content[:60]))
    js_path = os.path.join(ROOT, 'moretools', 'diagonalcalculator.js')
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print('WROTE:', os.path.relpath(js_path, ROOT), os.path.getsize(js_path), 'bytes')
    # replace inline block with deferred external script
    new_html = html[:idx] + '<script defer src="diagonalcalculator.js"></script>' + html[end + len('</script>'):]
    write_py(page, new_html, bom)
    print('PAGE REPLACED: moretools/diagonalcalculator.html')

# ---- 2. author.png downscale ----
try:
    from PIL import Image
    src = os.path.join(ROOT, 'author.png')
    im = Image.open(src).convert('RGBA')
    w, h = im.size
    scale = 200.0 / max(w, h)
    nw, nh = max(1, int(round(w * scale))), max(1, int(round(h * scale)))
    im2 = im.resize((nw, nh), Image.LANCZOS)
    dst = os.path.join(ROOT, 'author-200.png')
    im2.save(dst, 'PNG', optimize=True)
    print('AUTHOR:', src, w, 'x', h, '->', dst, nw, 'x', nh, os.path.getsize(dst), 'bytes')
    # update refs
    count = 0
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in {'scratch', 'bootstrap', '.kilo'} and not d.startswith('.')]
        for fn in filenames:
            if not fn.endswith('.html'): continue
            p = os.path.join(dirpath, fn)
            text, b = read_py(p)
            if 'author.png' in text:
                ntext = re.sub(r'author\.png', 'author-200.png', text)
                if ntext != text:
                    write_py(p, ntext, b); count += 1
    print('AUTHOR REFS UPDATED:', count)
except ImportError:
    print('Pillow unavailable - skipping author resize')
print('DONE')