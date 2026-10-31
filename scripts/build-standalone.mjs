import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');
const assetsDir = path.resolve(distDir, 'assets');

if (!fs.existsSync(distDir) || !fs.existsSync(assetsDir)) {
  console.error('dist or dist/assets not found.');
  process.exit(1);
}

const files = fs.readdirSync(assetsDir);
const cssFile = files.find(f => f.endsWith('.css'));
const jsFile = files.find(f => f.endsWith('.js'));

if (!cssFile || !jsFile) {
  console.error('Could not find css or js bundle in dist/assets');
  process.exit(1);
}

const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf-8');
const jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf-8');

const standaloneHtml = `<!doctype html>
<html lang="en">
  <head>
<!-- Google Analytics 4 · visits only, no private quiz or invitation URL details -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-66LXYNEMLJ"></script>
<script src="/analytics.js?v=ga4-20261030-v1"></script>
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TQRDB5KL');</script>
<!-- End Google Tag Manager -->
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <title>Random Candy Land | A World of Play, Music & Discovery</title>
    <meta name="description" content="Explore Random Candy Land: a colorful universe of playful experiences, music visualizations, creative surprises, and curiosity." />
    <meta property="og:title" content="Random Candy Land | A World of Play, Music & Discovery" />
    <meta property="og:description" content="Explore Random Candy Land: a colorful universe of playful experiences, music visualizations, creative surprises, and curiosity." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta property="og:site_name" content="Random Candy Land" />
    <meta property="og:image" content="https://randomcandyland.com/icon-512.png" />
    <meta name="twitter:image" content="https://randomcandyland.com/icon-512.png" />

    <!-- PWA & Mobile Home Screen Links -->
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#ff5fb8" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Random Candy Land" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=candy-logo-no-white-3" />
    <link rel="icon" type="image/svg+xml" href="/icon.svg?v=candy-logo-no-white-3" />
    <link rel="icon" type="image/png" href="/favicon.png?v=candy-logo-no-white-3" />

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bungee&family=Cinzel:wght@700;900&family=Fredoka:wght@600;700;800;900&family=Permanent+Marker&family=Plus+Jakarta+Sans:wght@500;700;800&family=VT323&display=swap" rel="stylesheet">
    <style>
${cssContent}
    </style>
  <script src="/install-app.js" defer></script>
</head>
  <body>
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TQRDB5KL" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
    <div id="root"></div>
    <script type="module">
${jsContent}
    </script>
  </body>
</html>
`;

// Publish one current homepage plus the two route fallbacks needed by GitHub Pages.
// Do NOT recreate historic /standalone.html or copies inside public/ and the repo root.
// The single Vite input is root index.html; generated dist files are not committed.
fs.writeFileSync(path.join(distDir, 'index.html'), standaloneHtml, 'utf-8');
fs.writeFileSync(path.join(distDir, '404.html'), standaloneHtml, 'utf-8');

const trumpDir = path.join(distDir, 'trump');
fs.mkdirSync(trumpDir, { recursive: true });
fs.writeFileSync(path.join(trumpDir, 'index.html'), standaloneHtml, 'utf-8');

// Fail early if an old checked-in static page somehow survived asset copy.
// Only the current generated pages should be deployed.
for (const stale of ['standalone.html']) {
  const oldPath = path.join(distDir, stale);
  if (fs.existsSync(oldPath)) fs.rmSync(oldPath);
}
// Inject the same privacy-safe share control on every published HTML page.
// Run after generating standalone homepage/404 so those files are covered too.
function installSiteSharing(dir) {
 for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
  const file=path.join(dir,entry.name);
  if(entry.isDirectory()){installSiteSharing(file);continue;}
  if(!entry.isFile()||!entry.name.toLowerCase().endsWith('.html'))continue;
  let html=fs.readFileSync(file,'utf8');
  if(!html.includes('/share-page.css?v=sitewide-1')) {
   const position=html.search(/<\/head\s*>/i);
   if(position<0)throw Error('Cannot add sharing to HTML without head: '+file);
   html=html.slice(0,position)+'<link rel="stylesheet" href="/share-page.css?v=sitewide-1">'+html.slice(position);
  }
  if(!html.includes('/share-page.js?v=sitewide-1')) {
   const position=html.search(/<\/body\s*>/i);
   if(position<0)throw Error('Cannot add sharing to HTML without body: '+file);
   html=html.slice(0,position)+'<script src="/share-page.js?v=sitewide-1" defer></script>'+html.slice(position);
  }
  fs.writeFileSync(file,html,'utf8');
 }
}
installSiteSharing(distDir);
console.log('Installed Share Page on every published Candy Land HTML page.');

console.log('Built current Candy Land homepage and valid /trump/ + 404 fallbacks (no stale source copies).');
