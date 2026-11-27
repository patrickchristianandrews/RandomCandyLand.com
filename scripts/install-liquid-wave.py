#!/usr/bin/env python3
"""Publish the Liquid Wave FM-1 installer at /liquid-wave/install/ from the newest foma release.

Runs inside the site's deploy workflow AFTER the page checks. It never fails the build:
on any problem it publishes a short notice page that links to the GitHub releases instead.
Test mode: LIQUID_ZIP=/path/to/Pocket-Wave-complete.zip skips the network.
"""
import hashlib, io, json, os, re, shutil, sys, time, urllib.request, zipfile
from pathlib import Path

REPO = 'patrickchristianandrews/foma'
RELEASES = 'https://github.com/%s/releases' % REPO
DIST = Path(os.environ.get('DIST', 'dist'))
DEST = DIST / 'liquid-wave' / 'install'
REQUIRED = ('installer/index.html', 'installer/app.js', 'installer/firmware.fwsc', 'installer/build.json')
TEXT_EXT = ('.html', '.txt', '.md')

# Generated installer pages are shipped as standalone HTML, so attach the same
# site-wide analytics bootstrap used by the rest of the public pages.
GA4_LOADER = 'https://www.googletagmanager.com/gtag/js?id=G-66LXYNEMLJ'
GA4_ASSET = '/analytics.js?v=ga4-20261030-v1'
GTM_SCRIPT = """<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TQRDB5KL');</script>"""
GTM_NOSCRIPT = '<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TQRDB5KL" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>'

def add_site_analytics(html):
    if GA4_LOADER not in html:
        html = re.sub(r'</head>', '<script async src="' + GA4_LOADER + '"></script>\n' +
                      '<script src="' + GA4_ASSET + '"></script>\n</head>', html, count=1, flags=re.I)
    if "})(window,document,'script','dataLayer','GTM-TQRDB5KL');" not in html:
        html = re.sub(r'</head>', GTM_SCRIPT + '\n</head>', html, count=1, flags=re.I)
    if 'googletagmanager.com/ns.html?id=GTM-TQRDB5KL' not in html:
        body = re.search(r'<body\b[^>]*>', html, flags=re.I)
        if body:
            html = html[:body.end()] + GTM_NOSCRIPT + html[body.end():]
    return html

def get(url, api=False):
    headers = {'User-Agent': 'liquid-wave-site-build', 'Accept': 'application/vnd.github+json' if api else '*/*'}
    tok = os.environ.get('GITHUB_TOKEN')
    if api and tok: headers['Authorization'] = 'Bearer ' + tok   # never forwarded to download hosts
    for attempt in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=45) as r:
                return r.read()
        except OSError:
            if attempt == 2: raise
            time.sleep(2 ** attempt)

def notice(reason):
    shutil.rmtree(DEST, ignore_errors=True); DEST.mkdir(parents=True, exist_ok=True)
    page = (
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        '<title>Liquid Wave FM-1 installer</title></head><body style="font:16px/1.5 system-ui;max-width:640px;margin:40px auto;padding:0 16px;color:#4a2a3a;background:#fff6fb">'
        '<h1>Liquid Wave FM-1 installer</h1><p>The installer is temporarily unavailable on this page.</p>'
        '<p>You can still download the package from <a href="%s">the GitHub releases</a>. '
        'It is experimental and has not been tested on a real FM-1.</p><p><a href="/liquid-wave/">Back to Liquid Wave</a></p></body></html>' % RELEASES)
    (DEST / 'index.html').write_text(add_site_analytics(page), encoding='utf-8')
    print('::warning::Liquid Wave installer not published: ' + reason)

def newest_package():
    if os.environ.get('LIQUID_BETA') == '1':
        rel = json.loads(get('https://api.github.com/repos/%s/releases/tags/advanced-liquid-wave-beta' % REPO, api=True))
        for a in rel.get('assets', []):
            if a['name'] == 'Advanced-Liquid-Wave-beta.zip': return get(a['browser_download_url']), rel, a['name']
        raise RuntimeError('beta release package not available')
    local = os.environ.get('LIQUID_ZIP')
    if local: return Path(local).read_bytes(), {'tag_name': 'local-test', 'published_at': ''}, Path(local).name
    rels = json.loads(get('https://api.github.com/repos/%s/releases?per_page=10' % REPO, api=True))
    for rel in rels:
        if rel.get('draft') or rel.get('tag_name', '').startswith('advanced-liquid-wave-beta'): continue
        for a in rel.get('assets', []):
            if a['name'].lower().endswith('complete.zip'): return get(a['browser_download_url']), rel, a['name']
    raise RuntimeError('no release with a *complete.zip asset yet')

def main():
    try:
        data, rel, asset = newest_package()
        z = zipfile.ZipFile(io.BytesIO(data))
        names = z.namelist()
        top = names[0].split('/')[0]
        for need in REQUIRED:
            if (top + '/' + need) not in names: raise RuntimeError('package is missing ' + need)
        fw = z.read(top + '/installer/firmware.fwsc')
        if len(fw) < 1024: raise RuntimeError('firmware file is implausibly small')
        sha = hashlib.sha256(fw).hexdigest()
        rev = z.read(top + '/BUILD-REVISION.txt').decode('utf-8', 'replace') if (top + '/BUILD-REVISION.txt') in names else ''
        m = re.search(r'firmware sha256:\s*([0-9a-f]{64})', rev)
        if not m: raise RuntimeError('package has no firmware checksum to verify against')
        if m.group(1) != sha: raise RuntimeError('firmware checksum mismatch')
        shutil.rmtree(DEST, ignore_errors=True); DEST.mkdir(parents=True)
        prefix = top + '/installer/'
        for n in names:
            if not n.startswith(prefix) or n.endswith('/'): continue
            rel_path = Path(n[len(prefix):])
            if rel_path.is_absolute() or '..' in rel_path.parts: raise RuntimeError('unsafe path in package: ' + n)
            out = DEST / rel_path; out.parent.mkdir(parents=True, exist_ok=True)
            b = z.read(n)
            if n.lower().endswith(TEXT_EXT):
                s = b.decode('utf-8')
                for a, c in (('Pocket Wave', 'Liquid Wave'), ('POCKET WAVE', 'LIQUID WAVE'), ('Pocket-Wave', 'Liquid-Wave')): s = s.replace(a, c)
                s = s.replace('../browser-toy/index.html', '/liquid-wave/')
                if rel_path.as_posix() == 'index.html':
                    s = re.sub(r'(<body[^>]*>)', r'\1\n<p style="margin:8px 14px"><a href="/liquid-wave/">&larr; Back to Liquid Wave</a></p>', s, count=1)
                if os.environ.get('LIQUID_BETA') == '1' and rel_path.as_posix() == 'index.html':
                    s = re.sub(r'(<body[^>]*>)', r'\1<p style="margin:12px;padding:12px;border:2px solid #b77836"><strong>Advanced Liquid Wave Beta</strong> — Experimental hardware firmware. Emulator tested; physical FM-1 unverified. Back up settings and read Rescue before installing.</p>', s, count=1)
                if rel_path.suffix.lower() == '.html': s = add_site_analytics(s)
                b = s.encode('utf-8')
            out.write_bytes(b)
        (DEST / 'release.json').write_text(json.dumps({'tag': rel.get('tag_name'), 'published': rel.get('published_at'), 'asset': asset, 'firmware_sha256': sha}, indent=2), encoding='utf-8')
        idx = (DEST / 'index.html').read_text(encoding='utf-8')
        if 'id="install"' not in idx or 'FM-1 Installer' not in idx: raise RuntimeError('installer page is not the expected one')
        print('Liquid Wave installer published from %s (%s), firmware sha256 %s' % (rel.get('tag_name'), asset, sha))
    except Exception as ex:
        notice(str(ex))
    return 0

if __name__ == '__main__':
    main()
    DEST = DIST / 'liquid-wave' / 'beta-install'
    os.environ['LIQUID_BETA'] = '1'
    sys.exit(main())
