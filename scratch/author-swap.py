# -*- coding: utf-8 -*-
import os
ROOT = r'c:\Users\ravin\Videos\instacalc-main-2026\instacalc-main - omni - Cline'
targets = ['aboutus.html', r'ja\aboutus.html', r'ko\aboutus.html', r'ru\aboutus.html']
count = 0
for rel in targets:
    p = os.path.join(ROOT, rel)
    with open(p, 'rb') as f: b = f.read()
    bom = b.startswith(b'\xef\xbb\xbf')
    t = b.decode('utf-8-sig') if bom else b.decode('utf-8')
    if 'author-200.png' in t:
        t = t.replace('author-200.png', 'author-200.jpg')
        data = t.encode('utf-8')
        if bom: data = b'\xef\xbb\xbf' + data
        with open(p, 'wb') as f: f.write(data)
        count += 1
        print('UPDATED:', rel)
    else:
        print('no ref in:', rel)
print('total updated:', count)