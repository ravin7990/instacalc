# -*- coding: utf-8 -*-
"""Audit Font Awesome usage across all HTML files:
- which icons (fa-<name>) are used
- which prefix classes (fas/far/fab/fa) accompany them
- which style families are required (solid/brands)
"""
import os, re
from collections import Counter, defaultdict

ROOT = r'c:\Users\ravin\Videos\instacalc-main-2026\instacalc-main - omni - Cline'
SKIP = {'scratch', 'bootstrap', '.kilo'}

# layout/util classes that aren't icons
NON_ICONS = {
    'fa-layers','fa-layers-text','fa-fw','fa-li','fa-ul','fa-border','fa-pull-left','fa-pull-right',
    'fa-stack','fa-stack-1x','fa-stack-2x','fa-inverse','fa-spin','fa-pulse','fa-rotate-90','fa-rotate-180',
    'fa-rotate-270','fa-flip-horizontal','fa-flip-vertical','fa-bounce','fa-shake','fa-beat','fa-fade',
    'fa-flip','fa-lg','fa-2x','fa-3x','fa-4x','fa-5x','fa-6x','fa-xl','fa-2xl','fa-sm','fa-xs','fa-vibrate'
}

icons = Counter()            # fa-<name> -> count
prefixes = Counter()         # fas/far/fab/fa -> count
# map icon -> list of prefixes seen with it
icon_prefix = defaultdict(set)

for d, dirs, fs in os.walk(ROOT):
    dirs[:] = [x for x in dirs if x not in SKIP and not x.startswith('.')]
    for fn in fs:
        if not fn.endswith('.html'):
            continue
        p = os.path.join(d, fn)
        t = open(p, encoding='utf-8-sig').read()
        for m in re.finditer(r'class="([^"]*)"', t):
            classes = m.group(1).split()
            icon_names = [c for c in classes if re.match(r'^fa-[a-z0-9-]+$', c) and c not in NON_ICONS]
            pref = [c for c in classes if c in ('fas','far','fab','fad','fa')]
            for pfx in pref:
                prefixes[pfx] += 1
            for ic in icon_names:
                icons[ic] += 1
                for pfx in pref:
                    icon_prefix[ic].add(pfx)

print('=== prefix usage ===')
for pfx, n in prefixes.most_common():
    print(n, pfx)

print('=== icons used (%d total, %d unique) ===' % (sum(icons.values()), len(icons)))
for ic, n in icons.most_common():
    pfs = ','.join(sorted(icon_prefix[ic])) if icon_prefix[ic] else '(none)'
    print('%4d %-28s [%s]' % (n, ic, pfs))