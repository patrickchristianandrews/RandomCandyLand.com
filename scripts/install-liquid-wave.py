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
    # Normalize any analytics fragments shipped in the upstream installer, then
    # insert one canonical site setup so nested installer pages pass the same
    # analytics checks as every other public page.
    html = re.sub(r'<script\b[^>]*>[\s\S]*?(?:GTM-TQRDB5KL|googletagmanager\.com/gtm\.js)[\s\S]*?</script>', '', html, flags=re.I)
    html = re.sub(r'<noscript\b[^>]*>\s*<iframe\b[^>]*googletagmanager\.com/ns\.html[^>]*></iframe>\s*</noscript>', '', html, flags=re.I)
    html = re.sub(r'<script\b[^>]*src=["\']https://www\.googletagmanager\.com/gtag/js\?id=G-66LXYNEMLJ["\'][^>]*>\s*</script>', '', html, flags=re.I)
    html = re.sub(r'<script\b[^>]*src=["\']/?analytics\.js\?v=ga4-20261030-v1["\'][^>]*>\s*</script>', '', html, flags=re.I)
    head_tags = '<script async src="' + GA4_LOADER + '"></script>\n<script src="' + GA4_ASSET + '"></script>\n' + GTM_SCRIPT + '\n'
    if not re.search(r'<head\b', html, flags=re.I):
        html = re.sub(r'(<html\b[^>]*>)', r'\1<head></head>', html, count=1, flags=re.I)
    if not re.search(r'</head>', html, flags=re.I):
        body_start = re.search(r'<body\b', html, flags=re.I)
        if body_start:
            html = html[:body_start.start()] + '</head>' + html[body_start.start():]
    html = re.sub(r'</head>', head_tags + '</head>', html, count=1, flags=re.I)
    if not re.search(r'<body\b', html, flags=re.I):
        head_end = re.search(r'</head\s*>', html, flags=re.I)
        if head_end:
            html = html[:head_end.end()] + '<body>' + html[head_end.end():]
        else:
            html = '<body>' + html
    if not re.search(r'</body\s*>', html, flags=re.I):
        html = re.sub(r'</html\s*>', '</body></html>', html, count=1, flags=re.I)
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
        # Public release asset URL does not consume GitHub REST API rate limits.
        tag = 'advanced-liquid-wave-beta'
        asset = 'Advanced-Liquid-Wave-beta.zip'
        return get(RELEASES + '/download/' + tag + '/' + asset), {'tag_name': tag}, asset
    local = os.environ.get('LIQUID_ZIP')
    if local: return Path(local).read_bytes(), {'tag_name': 'local-test', 'published_at': ''}, Path(local).name
    # Keep the original installer at the previously verified stable package.
    # Explicit tag override permits future intentional stable release upgrades.
    tag = os.environ.get('LIQUID_STABLE_TAG', 'pocket-wave-7')
    asset = 'Pocket-Wave-complete.zip'
    return get(RELEASES + '/download/' + tag + '/' + asset), {'tag_name': tag}, asset

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
        # Reject an older beta rather than silently publish it under the newest link.
        if os.environ.get('LIQUID_BETA') == '1':
            expected = os.environ.get('LIQUID_BETA_SHA256', '8ee175200cd9f3d47f6b88ef9fbc3938b9c54c050e094ce1da6ba0779f9ce116')
            if sha != expected:
                # A later release may be newer. Compare directly with the current FWSC asset.
                current = get(RELEASES + '/download/advanced-liquid-wave-beta/Advanced-Liquid-Wave-beta.fwsc')
                if hashlib.sha256(current).hexdigest() != sha:
                    raise RuntimeError('beta ZIP and current FWSC release do not match')
        revision = re.search(r'(?im)^(?:git (?:commit|revision)|commit|revision|source revision|source commit):\s*([0-9a-f]{7,40})', rev)
        revision_id = revision.group(1) if revision else ''
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
                if rel_path.as_posix() == 'index.html' and os.environ.get('LIQUID_BETA') == '1':
                    # Distinguish exact binary builds in the UI, even when the beta tag is reused.
                    badge = '<p style="margin:12px;font:13px monospace">Firmware SHA-256: <code style="overflow-wrap:anywhere">' + sha + '</code></p>'
                    s = re.sub(r'(<body[^>]*>)', lambda m: m.group(1) + badge, s, count=1)
                if rel_path.suffix.lower() == '.html': s = add_site_analytics(s)
                b = s.encode('utf-8')
            out.write_bytes(b)
        (DEST / 'release.json').write_text(json.dumps({'tag': rel.get('tag_name'), 'published': rel.get('published_at'), 'asset': asset, 'firmware_sha256': sha, 'revision': revision_id}, indent=2), encoding='utf-8')
        idx = (DEST / 'index.html').read_text(encoding='utf-8')
        if 'id="install"' not in idx or 'FM-1 Installer' not in idx: raise RuntimeError('installer page is not the expected one')
        print('Liquid Wave installer published from %s (%s), firmware sha256 %s' % (rel.get('tag_name'), asset, sha))
    except Exception as ex:
        notice(str(ex))
    return 0


def publish_wifi():
    """Keep the native Wi-Fi build separate; verify its own package and installer."""
    dest = DIST / 'liquid-wave' / 'wifi-install'
    tag = 'advanced-liquid-wave-wifi-experimental'
    url = RELEASES + '/download/' + tag + '/Advanced-Liquid-Wave-WiFi-ocean-installer.zip'
    try:
        with zipfile.ZipFile(io.BytesIO(get(url))) as z:
            raw = z.read('firmware.fwsc')
            meta = json.loads(z.read('release.json'))
            sha = hashlib.sha256(raw).hexdigest()
            product = ''.join(chr((raw[i*48+47]-i-1)&255) for i in range(20) if raw[i*48+47]!=125)
            if (len(raw) != 611496 or product != 'FM-1_9600' or
                meta.get('revision') != 'da38931161a3e8e7b9f4b74eb0fb27f0b788b423' or
                meta.get('firmware_sha256') != sha or sha != 'e197ba2c49029fa46343b6da75723635e81f6a8c181df79bf434319ed8c50f79' or b'FELUCCA-LOADER-1' not in raw):
                raise RuntimeError('Wi-Fi firmware identity or checksum mismatch')
            html = z.read('index.html').decode('utf-8')
            if 'id="go"' not in html or 'FM-1_9600' not in html or '"pkg": "firmware.fwsc"' not in html:
                raise RuntimeError('Wi-Fi Web MIDI installer does not match this firmware')
            # The native USB descriptor is Liquid Wave WiFi, not FM-1.
            # Extend only the port-name allowlist; retain the actual FM-1 SysEx handshake.
            old_filter = '/fm-?1|felucca|ota|composite|sinco|usb-midi/i'
            new_filter = '/fm-?1|felucca|ota|composite|sinco|usb-midi|liquid[ -]?wave/i'
            if old_filter in html:
                html = html.replace(old_filter, new_filter)
            elif new_filter not in html:
                raise RuntimeError('Wi-Fi MIDI device-name filter not recognized')
            html = html.replace('href="../"', 'href="/liquid-wave/"')
            shutil.rmtree(dest, ignore_errors=True)
            dest.mkdir(parents=True)
            (dest / 'index.html').write_text(add_site_analytics(html), encoding='utf-8')
            (dest / 'firmware.fwsc').write_bytes(raw)
            (dest / 'release.json').write_text(json.dumps(meta, indent=2), encoding='utf-8')
            print('Wi-Fi installer published, verified firmware sha256 ' + sha)
    except Exception as ex:
        # Do not substitute the standard firmware or display a fake install button.
        shutil.rmtree(dest, ignore_errors=True)
        dest.mkdir(parents=True)
        page = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Wi-Fi installer unavailable</title></head><body style="font:16px system-ui;max-width:640px;margin:40px auto;padding:16px"><h1>Wi-Fi + Radio installer</h1><p>The separate USB installer package could not be retrieved or verified. No firmware will be installed here.</p><p><a href="https://github.com/patrickchristianandrews/foma/releases/tag/advanced-liquid-wave-wifi-experimental">Wi-Fi release</a> · <a href="/liquid-wave/">Back to Liquid Wave</a></p></body></html>'
        (dest / 'index.html').write_text(add_site_analytics(page), encoding='utf-8')
        print('::warning::Wi-Fi installer not published: ' + str(ex))


def publish_neon_tides():
    """Separate, revision-pinned test installer; never replace the existing editions."""
    dest = DIST / 'liquid-wave' / 'neon-tides-install'
    tag = 'advanced-liquid-wave-wifi-experimental'
    base = RELEASES + '/download/' + tag + '/'
    asset = 'Advanced-Liquid-Wave-Neon-Tides-e313706-test-installer.zip'
    revision = 'e3137068940bd3513f8318a46a4d32b24f66d3c5'
    run = '45992788085'
    expected_sha = '02abe12d3076317c391f787413fa3281e71c3fcd2ed5cf25196392e64ccf3567'
    firmware_name = 'firmware-e313706.fwsc'
    try:
        package = get(base + asset)
        with zipfile.ZipFile(io.BytesIO(package)) as z:
            raw = z.read('firmware.fwsc')
            meta = json.loads(z.read('release.json'))
            sha = hashlib.sha256(raw).hexdigest()
            product = ''.join(chr((raw[i*48+47]-i-1)&255) for i in range(20) if raw[i*48+47]!=125)
            published = json.loads(get(base + 'neon-tides-e313706-test-release.json'))
            if (len(raw) != 611496 or product != 'FM-1_9700' or
                meta.get('product') != product or meta.get('revision') != revision or
                meta.get('device_run') != run or meta.get('hardware_tested') is not False or
                meta.get('firmware_sha256') != sha or sha != expected_sha or published != meta or
                b'FELUCCA-LOADER-1' not in raw or
                hashlib.sha256(get(base + 'liquid-wave-neon-tides-e313706-test.fwsc')).hexdigest() != sha):
                raise RuntimeError('Neon Tides candidate failed identity or integrity checks')
            html = z.read('index.html').decode('utf-8')
            if ('id="go"' not in html or product not in html or sha not in html or
                '"pkg": "firmware.fwsc"' not in html or '"boot": null' not in html or
                'Hardware-test candidate only.' not in html or
                '/fm-?1|felucca|ota|composite|sinco|usb-midi|liquid[ -]?wave/i' not in html):
                raise RuntimeError('Neon Tides installer mismatch')
            # Pin the actual installer fetch URL as well as its embedded checksum.
            # Old cached pages cannot silently flash this new binary, or vice versa.
            html = html.replace('"pkg": "firmware.fwsc"', '"pkg": "' + firmware_name + '"')
            info = ('<p style="padding:12px"><strong>Neon Tides RAM correction — revision ' + revision[:7] + '</strong><br>Automated native build and regression checks passed. Physical FM-1 correction unverified.<br>Firmware SHA-256: <code style="overflow-wrap:anywhere">' + sha + '</code><br><a href="' + firmware_name + '" download>Download firmware</a> · <a href="' + asset + '" download>Download matching installer ZIP</a> · <a href="https://github.com/patrickchristianandrews/foma/actions/runs/' + run + '">Build results</a></p>')
            html = re.sub(r'(<body[^>]*>)', lambda m: m.group(1) + info, html, count=1)
            shutil.rmtree(dest, ignore_errors=True)
            dest.mkdir(parents=True)
            (dest / 'index.html').write_text(add_site_analytics(html), encoding='utf-8')
            (dest / firmware_name).write_bytes(raw)
            (dest / 'firmware.fwsc').write_bytes(raw)
            (dest / asset).write_bytes(package)
            (dest / 'release.json').write_text(json.dumps(meta, indent=2), encoding='utf-8')
            (dest / 'LICENSE-DSP.txt').write_bytes(z.read('LICENSE-DSP.txt'))
            print('Neon Tides test installer verified, sha256 ' + sha)
    except Exception as ex:
        shutil.rmtree(dest, ignore_errors=True)
        dest.mkdir(parents=True)
        page = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Neon Tides test installer</title></head><body style="font:16px system-ui;max-width:640px;margin:40px auto;padding:16px"><h1>Neon Tides test installer</h1><p>The new test package is not available or could not be verified. No installation can start from this page.</p><p><a href="/liquid-wave/wifi-install/">Existing Wi-Fi installer</a> · <a href="/liquid-wave/">Back to Liquid Wave</a></p></body></html>'
        (dest / 'index.html').write_text(add_site_analytics(page), encoding='utf-8')
        print('::warning::Neon Tides test installer not published: ' + str(ex))

if __name__ == '__main__':
    main()
    DEST = DIST / 'liquid-wave' / 'beta-install'
    os.environ['LIQUID_BETA'] = '1'
    main()
    publish_wifi()
    publish_neon_tides()
    sys.exit(0)
