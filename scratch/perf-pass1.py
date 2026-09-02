# -*- coding: utf-8 -*-
"""InstaCalc performance pass 1: og swap, async critical CSS, dead file cleanup."""
import os, re, shutil

ROOT = r'c:\Users\ravin\Videos\instacalc-main-2026\instacalc-main - omni - Cline'
SKIP_DIRS = {'scratch', 'bootstrap', '.kilo'}

CRITICAL = r"""/* Critical above-the-fold styles (inlined for fast FCP/LCP) */
:root{--ic-bg:#f8fafc;--ic-bg-subtle:#f1f5f9;--ic-card-bg:#ffffff;--ic-card-glass:rgba(255,255,255,0.9);--ic-text:#0f172a;--ic-text-muted:#475569;--ic-text-light:#94a3b8;--ic-primary:#0284c7;--ic-primary-dark:#0369a1;--ic-primary-light:#e0f2fe;--ic-accent:#0d9488;--ic-accent-light:#ccfbf1;--ic-accent-warn:#f59e0b;--ic-success:#10b981;--ic-success-light:#d1fae5;--ic-border:#e2e8f0;--ic-border-focus:#38bdf8;--ic-shadow-sm:0 1px 2px 0 rgba(0,0,0,.05);--ic-shadow-md:0 4px 6px -1px rgba(0,0,0,.07),0 2px 4px -2px rgba(0,0,0,.05);--ic-shadow-lg:0 10px 25px -3px rgba(15,23,42,.08),0 4px 6px -4px rgba(15,23,42,.04);--ic-shadow-xl:0 20px 35px -5px rgba(15,23,42,.1),0 8px 10px -6px rgba(15,23,42,.04);--ic-radius-sm:8px;--ic-radius-md:12px;--ic-radius-lg:18px;--ic-radius-full:9999px;--ic-font-sans:"Public Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;--ic-font-heading:"Sora",var(--ic-font-sans)}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-size:16px;scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{min-height:100vh;font-family:var(--ic-font-sans);color:var(--ic-text);background-color:var(--ic-bg);line-height:1.6;overflow-x:hidden;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none;transition:color .2s ease}
img{max-width:100%;height:auto;display:block}
button,input,select,textarea{font:inherit}
.container{width:min(1240px,92vw);margin:0 auto}
.section{padding:3rem 0}
@media(max-width:768px){.section{padding:2rem 0}}
.hidden{display:none!important}
.site-header{position:sticky;top:0;z-index:100;background:rgba(255,255,255,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--ic-border);transition:box-shadow .2s ease}
.header-inner{display:flex;align-items:center;justify-content:space-between;min-height:68px;gap:1rem}
.brand{display:inline-flex;align-items:center;gap:.65rem;font-family:var(--ic-font-heading);font-weight:700;font-size:1.2rem;color:var(--ic-text);letter-spacing:-.02em}
.brand img{width:38px;height:38px;border-radius:var(--ic-radius-md);border:1.5px solid var(--ic-border)}
.site-nav{display:flex;align-items:center;gap:.5rem}
.nav-link,.site-nav a{display:inline-flex;align-items:center;padding:.5rem .9rem;border-radius:var(--ic-radius-md);font-weight:600;font-size:.92rem;color:var(--ic-text-muted);text-decoration:none;transition:all .2s ease}
.nav-link:hover,.nav-link.active,.site-nav a:hover,.site-nav a.active{color:var(--ic-primary-dark);background:var(--ic-primary-light)}
.menu-toggle{display:none;width:44px;height:44px;align-items:center;justify-content:center;border-radius:var(--ic-radius-md);border:1px solid var(--ic-border);background:#fff;color:var(--ic-text);cursor:pointer;padding:0}
.menu-toggle svg{width:22px;height:22px;fill:currentColor}
@media(max-width:840px){.menu-toggle{display:inline-flex}.site-nav{position:fixed;top:69px;left:0;right:0;background:#fff;border-bottom:1px solid var(--ic-border);box-shadow:var(--ic-shadow-xl);flex-direction:column;align-items:stretch;padding:1rem 1.25rem 1.5rem;gap:.4rem;transform:translateY(-120%);opacity:0;visibility:hidden;transition:transform .3s cubic-bezier(.16,1,.3,1),opacity .25s ease,visibility .25s}.site-nav.open{transform:translateY(0);opacity:1;visibility:visible}.nav-link,.site-nav a{padding:.8rem 1rem;font-size:1rem;border-radius:var(--ic-radius-md);background:var(--ic-bg)}}
.hero{padding:2.5rem 0 1.5rem}
.hero-badge{display:inline-flex;align-items:center;gap:.45rem;padding:.3rem .85rem;border-radius:var(--ic-radius-full);background:var(--ic-primary-light);color:var(--ic-primary-dark);font-size:.82rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.75rem}
.hero h1{font-family:var(--ic-font-heading);font-size:clamp(1.75rem,4vw,2.65rem);font-weight:800;line-height:1.15;letter-spacing:-.03em;color:var(--ic-text);margin-bottom:.85rem}
.hero-desc{font-size:clamp(.98rem,1.8vw,1.12rem);color:var(--ic-text-muted);max-width:68ch;line-height:1.6}"""

OG_URL = 'https://instacalc.in/instatheme.webp'
OG_NEW = 'https://instacalc.in/instatheme-og.jpg'
def read_py(p):
    with open(p, 'rb') as f: b = f.read()
    has_bom = b.startswith(b'\xef\xbb\xbf')
    return b.decode('utf-8-sig') if has_bom else b.decode('utf-8'), has_bom

def write_py(p, text, bom):
    data = text.encode('utf-8')
    if bom: data = b'\xef\xbb\xbf' + data
    with open(p, 'wb') as f: f.write(data)

html_files = []
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith('.')]
    for fn in filenames:
        if fn.endswith('.html'):
            html_files.append(os.path.join(dirpath, fn))

files_changed = 0
for path in html_files:
    text, bom = read_py(path)
    changed = False

    new_text, n = re.subn(
        r'<meta property="og:image" content="' + re.escape(OG_URL) + r'">',
        '<meta property="og:image" content="' + OG_NEW + '">\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">',
        text)
    if n: text, changed = new_text, True
    new_text, n = re.subn(
        r'<meta name="twitter:image" content="' + re.escape(OG_URL) + r'">',
        '<meta name="twitter:image" content="' + OG_NEW + '">',
        text)
    if n: text, changed = new_text, True

    def swap(m):
        href = m.group(1)
        prefix = href[:href.find('instacalc-core.css')]
        url = href + '?v=3'
        return ('<style>\n' + CRITICAL + '\n</style>\n'
                + '<link rel="preload" as="style" href="' + url + '" onload="this.onload=null;this.rel=\'stylesheet\'">\n'
                + '<noscript><link rel="stylesheet" href="' + url + '"></noscript>')
    new_text, n = re.subn(r'<link rel="stylesheet" href="((?:\.\./)*instacalc-core\.css)">', swap, text)
    if n: text, changed = new_text, True

    if changed:
        write_py(path, text, bom)
        files_changed += 1

print('FILES CHANGED:', files_changed)

dead = [
    'geo-router.js',
    'style.css',
    os.path.join('duration', 'style.css'),
    os.path.join('duration', 'style2s.css'),
    os.path.join('moretools', 'style.css'),
    os.path.join('moretools', 'style2s.css'),
]
for rel in dead:
    p = os.path.join(ROOT, rel)
    if os.path.isfile(p):
        os.remove(p); print('DELETED:', rel)
    else:
        print('already absent:', rel)

boot = os.path.join(ROOT, 'bootstrap')
if os.path.isdir(boot):
    shutil.rmtree(boot); print('DELETED folder: bootstrap/')
print('DONE')